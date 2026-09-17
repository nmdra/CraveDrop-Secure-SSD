#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const expect = (condition, message) => {
  if (!condition) throw new Error(message);
};

const controller = read('user-service/src/controllers/wso2Controller.js');
const routes = read('user-service/src/routes/userRoutes.js');
const login = read('frontend/src/Pages/Customer/LoginForm.jsx');
const example = read('user-service/.env.example');

expect(controller.includes('randomBytes(32)'), 'OIDC state/nonce/verifier values are not generated randomly');
expect(controller.includes("code_challenge_method: 'S256'"), 'OIDC S256 PKCE is missing');
expect(controller.includes('createPkceChallenge(verifier)'), 'OIDC PKCE challenge is not derived from the verifier');
expect(controller.includes('timingSafeEqual'), 'OIDC flow cookie signature comparison is not constant-time');
expect(controller.includes('state !== flow.state'), 'OIDC state validation is missing');
expect(controller.includes('payload.nonce !== flow.nonce'), 'OIDC nonce validation is missing');
expect(controller.includes('code_verifier: flow.verifier'), 'OIDC code exchange does not send the PKCE verifier');
expect(controller.includes("issuer: options.issuer"), 'OIDC issuer validation is missing');
expect(controller.includes('audience: options.clientId'), 'OIDC audience validation is missing');
expect(controller.includes("algorithms: ['RS256']"), 'OIDC signature algorithm restriction is missing');
expect(controller.includes("res.redirect(options.successRedirect)"), 'OIDC callback does not use the configured allow-listed redirect');
expect(!controller.includes('res.redirect(tokens'), 'OIDC tokens are not allowed in a redirect');
expect(routes.includes("router.route('/auth/wso2/start').get(startWso2Login)"), 'WSO2 start route is missing');
expect(routes.includes("router.route('/auth/wso2/callback').get(completeWso2Login)"), 'WSO2 callback route is missing');
expect(login.includes('Continue with WSO2'), 'WSO2 login control is missing');
expect(!login.includes('localStorage.setItem'), 'WSO2 login page must not persist tokens');
expect(example.includes('OIDC_REDIRECT_URI='), 'OIDC callback configuration is missing');

console.log('WSO2 OIDC source regression checks passed.');
