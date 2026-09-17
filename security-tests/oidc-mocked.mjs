#!/usr/bin/env node

import { createServer } from 'node:http';
import { generateKeyPair, exportJWK, SignJWT } from '../user-service/node_modules/jose/dist/webapi/index.js';

const { privateKey, publicKey } = await generateKeyPair('RS256');
const jwk = await exportJWK(publicKey);
jwk.kid = 'security-test-key';

const port = await new Promise((resolve, reject) => {
  const server = createServer(async (req, res) => {
    if (req.url === '/.well-known/openid-configuration') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        issuer: `http://127.0.0.1:${server.address().port}/issuer`,
        authorization_endpoint: `http://127.0.0.1:${server.address().port}/authorize`,
        token_endpoint: `http://127.0.0.1:${server.address().port}/token`,
        jwks_uri: `http://127.0.0.1:${server.address().port}/jwks`,
      }));
      return;
    }

    if (req.url === '/jwks') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ keys: [jwk] }));
      return;
    }

    if (req.url === '/token') {
      const token = await new SignJWT({
        email: 'wso2-test@security.test',
        email_verified: true,
        nonce: 'wrong-nonce',
      })
        .setProtectedHeader({ alg: 'RS256', kid: jwk.kid })
        .setIssuer(`http://127.0.0.1:${server.address().port}/issuer`)
        .setAudience('cravedrop-test-client')
        .setSubject('wso2-subject-test')
        .setIssuedAt()
        .setExpirationTime('5m')
        .sign(privateKey);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ id_token: token }));
      return;
    }

    res.statusCode = 404;
    res.end();
  });
  server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  server.on('error', reject);
});

const issuer = `http://127.0.0.1:${port}/issuer`;
process.env.NODE_ENV = 'development';
process.env.OIDC_ALLOW_INSECURE_TEST_PROVIDER = 'true';
process.env.OIDC_DISCOVERY_URL = `http://127.0.0.1:${port}/.well-known/openid-configuration`;
process.env.OIDC_ISSUER = issuer;
process.env.OIDC_CLIENT_ID = 'cravedrop-test-client';
process.env.OIDC_CLIENT_SECRET = 'not-a-real-secret';
process.env.OIDC_REDIRECT_URI = 'http://127.0.0.1:3001/api/user/auth/wso2/callback';
process.env.OIDC_SUCCESS_REDIRECT_URI = 'http://localhost:5173/dashboard';
process.env.OIDC_FLOW_SECRET = 'local-oidc-test-flow-secret';
process.env.JWT_SECRET = 'local-oidc-test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'local-oidc-test-refresh-secret';

const { startWso2Login, completeWso2Login } = await import('../user-service/src/controllers/wso2Controller.js');

const makeResponse = () => ({
  cookies: {},
  statusCode: 200,
  body: null,
  redirectUrl: null,
  cookie(name, value) {
    this.cookies[name] = value;
    return this;
  },
  clearCookie() {
    return this;
  },
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
  redirect(url) {
    this.redirectUrl = url;
    this.statusCode = 302;
    return this;
  },
});

const startResponse = makeResponse();
await startWso2Login({}, startResponse);
if (!startResponse.redirectUrl) throw new Error('OIDC start did not redirect');
const authorization = new URL(startResponse.redirectUrl);
for (const parameter of ['state', 'nonce', 'code_challenge', 'code_challenge_method']) {
  if (!authorization.searchParams.get(parameter)) throw new Error(`OIDC start missing ${parameter}`);
}
if (authorization.searchParams.get('code_challenge_method') !== 'S256') {
  throw new Error('OIDC start did not select S256');
}
console.log('PASS OIDC start creates state, nonce, and S256 PKCE parameters');

const flowCookie = startResponse.cookies.wso2OidcFlow;
const flowValue = JSON.parse(Buffer.from(flowCookie.split('.')[0], 'base64url').toString('utf8'));

const stateFailure = makeResponse();
await completeWso2Login({
  query: { code: 'authorization-code', state: 'tampered-state' },
  cookies: { wso2OidcFlow: flowCookie },
}, stateFailure);
if (stateFailure.statusCode !== 400) throw new Error('Tampered OIDC state was not rejected');
console.log('PASS tampered OIDC state is rejected before code exchange');

const nonceFailure = makeResponse();
await completeWso2Login({
  query: { code: 'authorization-code', state: flowValue.state },
  cookies: { wso2OidcFlow: flowCookie },
}, nonceFailure);
if (nonceFailure.statusCode !== 401) throw new Error('Invalid OIDC nonce was not rejected');
console.log('PASS invalid OIDC nonce/ID-token validation is rejected');

console.log('Mocked WSO2 OIDC regression checks passed.');
process.exit(0);
