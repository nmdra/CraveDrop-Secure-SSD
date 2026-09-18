# Security finding matrix

The seven counted findings use different primary root causes. Delivery/notification object-authorisation issues are not counted separately.

| ID | Primary weakness | CWE / OWASP mapping | Baseline evidence | Fix/test reference | Blocked attack | Legitimate control | Status |
|---|---|---|---|---|---|---|---|
| V1 | Missing authentication on payment actions | CWE-306 / OWASP API1 | `evidence/V1-before.txt` | `evidence/V1-after.txt`; `security-tests/runtime-v1-v3.mjs` | Anonymous payment request returns 401 | Authenticated request reaches the payment handler | Fixed and runtime-tested |
| V2 | Order IDOR/BOLA | CWE-639 / OWASP API1 | `evidence/V2-before.txt` | `evidence/V2-after.txt`; `security-tests/runtime-v1-v3.mjs` | Customer B receives 404 for Customer A's order | Customer A receives 200 for the owned order | Fixed and runtime-tested |
| V3 | Order mass assignment | CWE-915 / OWASP API3 | `evidence/V3-before.txt` | `evidence/V3-after.txt`; `security-tests/runtime-v1-v3.mjs` | Protected-field payload returns 400 | Allowed owner update and order creation succeed | Fixed and runtime-tested |
| V4 | Unauthorised delivery mutation | CWE-862 / OWASP API5 | `evidence/V4-before.txt` | `evidence/V4-after.txt`; `security-tests/runtime-v4-v7.mjs` | Anonymous, customer, and unrelated driver writes fail | Assigned driver can update status/location | Fixed and runtime-tested |
| V5 | Broken administrative authorisation | CWE-862 / OWASP API5 | `evidence/V5-before.txt` | `evidence/V5-after.txt`; `security-tests/runtime-v4-v7.mjs` | Driver A cannot change Driver B | Driver A can change their own availability | Fixed and runtime-tested |
| V6 | Card order payment amount manipulation | CWE-841 / OWASP API business-logic risk | `evidence/V6-before.txt` | `evidence/V6-after.txt`; `security-tests/runtime-v4-v7.mjs` | Client amount/currency/status do not control persisted values | Authenticated customer can create a server-priced card order | Fixed and runtime-tested |
| V7 | Sensitive session-token exposure | CWE-922 and CWE-532 / OWASP API2 | `evidence/V7-before.txt` | `evidence/V7-after.txt`; `security-tests/runtime-v4-v7.mjs` | Login/refresh JSON and logs do not expose tokens | HttpOnly cookie session reaches the protected profile | Fixed and runtime-tested |

## Verification commands

```bash
node security-tests/baseline-check.mjs baseline-vulnerable
node security-tests/regression-v1-v3.mjs baseline-vulnerable
node security-tests/regression-v1-v3.mjs WORKTREE
node security-tests/regression-v4-v7.mjs
JWT_SECRET="$LOCAL_JWT_SECRET" node security-tests/runtime-v1-v3.mjs
JWT_SECRET="$LOCAL_JWT_SECRET" node security-tests/runtime-v4-v7.mjs
```

The runtime commands use the Docker Compose host ports by default: order `3007`, payment `3008`, delivery `3010`, driver `3009`, and user `3001`. They require the affected local services, synthetic fixtures, and the shared local JWT secret. Do not print or commit JWTs, cookies, secrets, or unredacted logs. The latest non-video verification record is `evidence/phase-9-verification.txt`.

## Supporting security tools

`evidence/tools/npm-audit.txt` records the tool versions, commands, advisory counts, and triage for the selected services. The advisories are not counted findings.

OWASP ZAP is deferred by team decision because its Docker image download and scan exceed the available bandwidth. No ZAP result is claimed. Run the bounded local-gateway scan before submission and store a redacted result in `evidence/tools/`.

## WSO2 OIDC feature evidence

The non-counted customer-login feature is recorded in `evidence/oidc-after.txt`. `security-tests/regression-oidc.mjs` checks source security contracts. `security-tests/oidc-mocked.mjs`, run in Node 20, proves S256 PKCE start parameters and rejects tampered state and nonce/ID-token validation failures. The real local WSO2 7.1.0 control completed with strict HttpOnly CraveDrop cookies and a protected-session response.

## Counting rule

A finding is complete only when the report contains its baseline request/response, impact, focused fix, blocked-attack test, legitimate control test, residual risk, and fix commit. Notification BOLA is retained as an optional backup and is not part of the required seven.
