import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import userRepo from '../repositories/userRepository.js';
import { cookieOptions } from './authController.js';
import { generateTokens } from '../utils/generateToken.js';

const flowCookieName = 'wso2OidcFlow';
let discoveryCache;
let jwksCache;

const config = () => ({
    discoveryUrl: process.env.OIDC_DISCOVERY_URL || 'https://localhost:9443/oauth2/token/.well-known/openid-configuration',
    issuer: process.env.OIDC_ISSUER || 'https://localhost:9443/oauth2/token',
    clientId: process.env.OIDC_CLIENT_ID,
    clientSecret: process.env.OIDC_CLIENT_SECRET,
    redirectUri: process.env.OIDC_REDIRECT_URI || 'http://localhost:3001/api/user/auth/wso2/callback',
    successRedirect: process.env.OIDC_SUCCESS_REDIRECT_URI || 'http://localhost:5173/dashboard',
    flowSecret: process.env.OIDC_FLOW_SECRET,
});

const base64url = (value) => Buffer.from(value).toString('base64url');

const signFlow = (value, secret) => createHmac('sha256', secret).update(value).digest('base64url');

const encodeFlow = (flow, secret) => {
    const value = base64url(JSON.stringify(flow));
    return `${value}.${signFlow(value, secret)}`;
};

const decodeFlow = (cookie, secret) => {
    try {
        if (!cookie) return null;

        const [value, signature] = cookie.split('.');
        if (!value || !signature) return null;

        const expected = signFlow(value, secret);
        if (signature.length !== expected.length) return null;
        if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

        const flow = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
        if (!flow.issuedAt || Date.now() - flow.issuedAt > 10 * 60 * 1000) return null;
        return flow;
    } catch {
        return null;
    }
};

const getDiscovery = async () => {
    const options = config();
    if (!options.clientId || !options.clientSecret || !options.flowSecret) {
        throw new Error('WSO2 OIDC configuration is incomplete');
    }

    if (discoveryCache) return discoveryCache;

    const response = await fetch(options.discoveryUrl);
    if (!response.ok) throw new Error('WSO2 discovery request failed');

    const metadata = await response.json();
    if (metadata.issuer !== options.issuer) {
        throw new Error('WSO2 issuer does not match configured issuer');
    }

    for (const endpoint of ['authorization_endpoint', 'token_endpoint', 'jwks_uri']) {
        if (!metadata[endpoint]) throw new Error(`WSO2 discovery missing ${endpoint}`);
    }

    discoveryCache = metadata;
    jwksCache = createRemoteJWKSet(new URL(metadata.jwks_uri));
    return metadata;
};

const createPkceChallenge = (verifier) => createHash('sha256').update(verifier).digest('base64url');

const isTrustedProviderUrl = (value, issuer) => {
    try {
        const endpoint = new URL(value);
        const provider = new URL(issuer);
        const secureProtocol = endpoint.protocol === 'https:'
            || (process.env.OIDC_ALLOW_INSECURE_TEST_PROVIDER === 'true' && endpoint.protocol === 'http:');
        return secureProtocol && endpoint.origin === provider.origin;
    } catch {
        return false;
    }
};

const isAllowedSuccessRedirect = (value) => {
    try {
        const target = new URL(value);
        const frontend = new URL(process.env.FRONTEND_ORIGIN || 'http://localhost:5173');
        return target.origin === frontend.origin
            && target.pathname === '/dashboard'
            && !target.search
            && !target.hash;
    } catch {
        return false;
    }
};

const issueSession = (res, userId) => {
    const { accessToken, refreshToken } = generateTokens(userId);
    res
        .cookie('accessToken', accessToken, cookieOptions(3 * 60 * 60 * 1000))
        .cookie('refreshToken', refreshToken, cookieOptions(24 * 60 * 60 * 1000));
};

export const startWso2Login = async (req, res) => {
    try {
        const options = config();
        const metadata = await getDiscovery();
        const state = randomBytes(32).toString('base64url');
        const nonce = randomBytes(32).toString('base64url');
        const verifier = randomBytes(32).toString('base64url');
        const flow = encodeFlow({
            state,
            nonce,
            verifier,
            issuedAt: Date.now(),
        }, options.flowSecret);

        res.cookie(flowCookieName, flow, {
            ...cookieOptions(10 * 60 * 1000),
            sameSite: 'lax',
        });

        if (!isTrustedProviderUrl(metadata.authorization_endpoint, options.issuer)) {
            throw new Error('WSO2 authorization endpoint is not trusted');
        }

        const authorization = new URL(metadata.authorization_endpoint);
        authorization.search = new URLSearchParams({
            response_type: 'code',
            client_id: options.clientId,
            redirect_uri: options.redirectUri,
            scope: 'openid email profile',
            state,
            nonce,
            code_challenge: createPkceChallenge(verifier),
            code_challenge_method: 'S256',
        }).toString();

        return res.redirect(authorization.toString());
    } catch (error) {
        console.error('WSO2 login start failed:', error.message);
        return res.status(503).json({ message: 'WSO2 login is unavailable' });
    }
};

export const completeWso2Login = async (req, res) => {
    const options = config();
    const flow = options.flowSecret
        ? decodeFlow(req.cookies?.[flowCookieName], options.flowSecret)
        : null;
    const { code, state, error } = req.query;

    if (error || !code || !state || !flow || state !== flow.state) {
        return res.status(400).json({ message: 'Invalid WSO2 login response' });
    }

    try {
        const metadata = await getDiscovery();
        const credentials = Buffer.from(`${options.clientId}:${options.clientSecret}`).toString('base64');
        const tokenResponse = await fetch(metadata.token_endpoint, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: options.redirectUri,
                client_id: options.clientId,
                code_verifier: flow.verifier,
            }),
        });

        if (!tokenResponse.ok) throw new Error('WSO2 code exchange failed');
        const tokens = await tokenResponse.json();
        if (!tokens.id_token) throw new Error('WSO2 response did not contain an ID token');

        const { payload } = await jwtVerify(tokens.id_token, jwksCache, {
            issuer: options.issuer,
            audience: options.clientId,
            algorithms: ['RS256'],
        });

        if (payload.nonce !== flow.nonce || typeof payload.sub !== 'string') {
            throw new Error('WSO2 ID token nonce or subject validation failed');
        }

        const providerEmail = typeof payload.email === 'string' ? payload.email : null;
        if (providerEmail && payload.email_verified !== true) {
            throw new Error('WSO2 email claim is not verified');
        }

        let user = await userRepo.findByOidc(options.issuer, payload.sub);
        if (!user) {
            // Some WSO2 user stores release only `sub`. Do not infer an email from
            // an unverified claim or link by email. The placeholder is non-deliverable
            // and deterministic per validated issuer/subject identity.
            const email = providerEmail || `oidc-${createHash('sha256')
                .update(`${options.issuer}\u0000${payload.sub}`)
                .digest('hex')
                .slice(0, 32)}@identity.invalid`;
            const existingEmail = await userRepo.findByEmail(email);
            if (existingEmail) {
                return res.status(409).json({ message: 'WSO2 identity requires an explicit account link' });
            }

            const displayName = typeof payload.name === 'string' ? payload.name.split(' ') : [];
            user = await userRepo.createUser({
                firstname: payload.given_name || displayName[0] || 'WSO2',
                lastname: payload.family_name || displayName.slice(1).join(' ') || 'Customer',
                email,
                password: randomBytes(32).toString('hex'),
                pic: typeof payload.picture === 'string' ? payload.picture : undefined,
                oidcIssuer: options.issuer,
                oidcSubject: payload.sub,
            });
        }

        if (!isAllowedSuccessRedirect(options.successRedirect)) {
            throw new Error('WSO2 success redirect is not allowed');
        }

        issueSession(res, user.userId);
        res.clearCookie(flowCookieName, cookieOptions(0));
        return res.redirect(options.successRedirect);
    } catch (error) {
        console.error('WSO2 login callback failed:', error.message);
        return res.status(401).json({ message: 'WSO2 identity validation failed' });
    }
};
