# Report source notes

Use this document as the factual source for the final report. Do not claim a result that this document and its linked evidence do not show.

## Scope and evidence rules

- The immutable vulnerable baseline is `cb68a377f5b8cdc3b12f86883ac6fb703ef5e405` and tag `baseline-vulnerable`.
- All demonstrations use synthetic fixtures only.
- Each counted finding has one root cause. Do not count delivery or notification variants as additional BOLA findings.
- Redacted HTTP captures are in `evidence/V*-before.txt` and `evidence/V*-after.txt`.
- The finding matrix is `docs/finding-matrix.md`.

## V1: Missing authentication on payment actions

**Classification:** CWE-306, Missing Authentication for Critical Function. OWASP API1, Broken Object Level Authorization, supports the API-access impact description.

**Baseline attack:** An anonymous request reached `POST /api/payments/create-payment-intent`. The payment handler processed the request instead of returning an authentication error.

**Impact:** An unauthenticated actor can invoke a payment action. This can consume payment-provider resources and bypass the intended customer boundary.

**Fix:** Payment routes now require a verified Bearer JWT. The service derives the caller from that token.

**Blocked attack:** An anonymous request returns `401`.

**Authorized control:** An authenticated synthetic customer reaches the payment-start handler. The local synthetic Stripe configuration then rejects the payment request. This proves authorization, not a real charge.

**Residual risk:** The service still depends on correct Stripe configuration and payment-provider controls. The assessment does not prove a live card charge.

**Evidence and commits:** `evidence/V1-before.txt`, `evidence/V1-after.txt`, `security-tests/runtime-v1-v3.mjs`, `4dc9756`, and `720a077`.

## V2: Order IDOR or BOLA

**Classification:** CWE-639, Authorization Bypass Through User-Controlled Key. OWASP API1, Broken Object Level Authorization.

**Baseline attack:** An unauthenticated request read Customer A’s synthetic order by its order ID.

**Impact:** An attacker can read or modify another customer’s order when the order ID is known.

**Fix:** Order reads and mutations require an authenticated customer. The controller scopes the order query to the verified customer ID.

**Blocked attack:** Customer B cannot read Customer A’s order. The service returns `404`.

**Authorized control:** Customer A can read the owned order.

**Residual risk:** The order ID remains an identifier. Access safety depends on all order routes continuing to apply the ownership scope.

**Evidence and commits:** `evidence/V2-before.txt`, `evidence/V2-after.txt`, `security-tests/runtime-v1-v3.mjs`, `4dc9756`, and `720a077`.

## V3: Order mass assignment

**Classification:** CWE-915, Improperly Controlled Modification of Dynamically-Determined Object Attributes. OWASP API3, Broken Object Property Level Authorization.

**Baseline attack:** An anonymous order update set `userId`, `totalAmount`, `status`, and `createdAt` from the request body.

**Impact:** A caller can alter ownership, order amount, lifecycle state, and audit data.

**Fix:** The controller rejects protected fields and allow-lists only customer-editable fields. The server owns identity, pricing, payment state, and timestamps.

**Blocked attack:** A payload with protected fields returns `400`.

**Authorized control:** A valid customer update and authorized order creation succeed.

**Residual risk:** New editable order fields need an explicit review before they enter the allow-list.

**Evidence and commits:** `evidence/V3-before.txt`, `evidence/V3-after.txt`, `security-tests/runtime-v1-v3.mjs`, `4dc9756`, and `720a077`.

## V4: Unauthorized delivery mutation

**Classification:** CWE-862, Missing Authorization. OWASP API5, Broken Function Level Authorization.

**Baseline attack:** An unauthenticated caller changed a delivery status. The same route could alter tracking location.

**Impact:** An attacker can falsify delivery progress or driver tracking data.

**Fix:** Delivery writes require a valid driver JWT, an assigned-driver match, and an allow-listed status transition.

**Blocked attack:** Anonymous, customer, and unrelated-driver writes fail. Invalid reverse transitions return `409`.

**Authorized control:** The assigned driver can make the demonstrated valid status and location updates.

**Residual risk:** The service does not prove device integrity or GPS accuracy.

**Evidence and commits:** `evidence/V4-before.txt`, `evidence/V4-after.txt`, `security-tests/runtime-v4-v7.mjs`, `security-tests/regression-v4-v7.mjs`, `729c52e`, and `b78b635`.

## V5: Broken administrative authorization

**Classification:** CWE-862, Missing Authorization. OWASP API5, Broken Function Level Authorization.

**Baseline attack:** An unauthenticated caller changed Driver B’s availability by using Driver B’s ID.

**Impact:** An attacker can disrupt driver allocation and delivery availability.

**Fix:** Driver availability updates require a valid driver JWT. The verified driver ID must match the URL driver ID.

**Blocked attack:** One driver cannot update another driver’s availability.

**Authorized control:** A driver can update their own availability.

**Residual risk:** This finding covers driver availability only. Restaurant administration requires separate review before it can be claimed as protected.

**Evidence and commits:** `evidence/V5-before.txt`, `evidence/V5-after.txt`, `security-tests/runtime-v4-v7.mjs`, `security-tests/regression-v4-v7.mjs`, `729c52e`, and `b78b635`.

## V6: Payment amount and state manipulation

**Classification:** CWE-841, Improper Enforcement of Behavioral Workflow. OWASP API business-logic risk.

**Baseline attack:** A client created a card order with `totalAmount` of `1` instead of the synthetic trusted total of `2500`. The order was also marked paid.

**Impact:** A customer can reduce the payable amount or obtain a paid order without confirmed payment.

**Fix:** The order service calculates the USD total from trusted product data. It ignores client currency and paid-status fields. New card orders start as pending.

**Blocked attack:** Tampered amount, currency, and status fields do not control the persisted order. The persisted order is `2500` USD and pending.

**Authorized control:** An authenticated customer can create a server-priced card order.

**Residual risk:** A later payment confirmation must remain bound to trusted order data and a verified provider event.

**Evidence and commits:** `evidence/V6-before.txt`, `evidence/V6-after.txt`, `security-tests/runtime-v4-v7.mjs`, `security-tests/regression-v4-v7.mjs`, `729c52e`, and `b78b635`.

## V7: Sensitive token disclosure and session design

**Classification:** CWE-922, Insecure Storage of Sensitive Information. CWE-532, Insertion of Sensitive Information into Log File. OWASP API2, Broken Authentication.

**Baseline attack:** Login and refresh responses returned access tokens in JSON. The user-service log wrote raw refresh-token data. The browser stored access tokens.

**Impact:** Script injection, browser access, log access, or log forwarding can expose bearer tokens and enable session impersonation.

**Fix:** Login and refresh use credentialed strict HttpOnly cookies. The frontend no longer stores bearer tokens. Request logging omits query values so it does not record OIDC authorization codes.

**Blocked attack:** Login and refresh JSON omit access tokens. Browser storage and application logs do not contain bearer tokens. A missing or wrong Origin blocks cookie mutation.

**Authorized control:** The session cookies authorize profile and refresh operations from the approved frontend origin.

**Residual risk:** XSS can still perform same-origin actions while a session exists. Content Security Policy and broader XSS review remain future work.

**Evidence and commits:** `evidence/V7-before.txt`, `evidence/V7-after.txt`, `security-tests/runtime-v4-v7.mjs`, `security-tests/regression-v4-v7.mjs`, `729c52e`, and `b78b635`.

## WSO2 OIDC customer-login feature

This is a required new feature. It is not an eighth counted vulnerability.

**Design:** CraveDrop uses WSO2 Authorization Code flow with S256 PKCE. The server generates and validates state, nonce, and a signed short-lived flow cookie. It exchanges the code server-side. It validates the issuer, audience, RS256 signature, and expiry. It keys the local account by issuer and subject. It issues CraveDrop strict HttpOnly session cookies.

**Negative controls:** The Node 20 mocked test rejects a tampered state before code exchange. It also rejects an invalid nonce or ID token.

**Real control:** A synthetic local WSO2 customer completed the login. The callback returned `302` to the allow-listed dashboard. The callback issued strict HttpOnly CraveDrop session cookies. The session authorized the protected validation endpoint. No provider token appeared in the callback URL.

**Provider-claim note:** The local WSO2 user store released only `sub`. CraveDrop did not infer or link an email. It stored a deterministic non-deliverable `@identity.invalid` placeholder and retained issuer-plus-subject identity binding.

**Evidence and commit:** `evidence/oidc-after.txt`, `security-tests/regression-oidc.mjs`, `security-tests/oidc-mocked.mjs`, and `28e178c`.

## Supporting-tool record

`npm audit` ran against the user, order, payment, delivery, and driver services. It reported dependency advisories. Treat these as dependency-maintenance input only. Do not report an advisory as a counted application vulnerability without a reproduced impact.

OWASP ZAP 2.17.0 completed a bounded passive scan against the local gateway. The initial missing-CSP and Nginx-disclosure findings were remediated. The verification scan retains a CSP policy-completeness alert, which is recorded as gateway residual risk. Trivy 0.68.2 completed source and image scans. Selected compatible updates were rebuilt and rescanned; remaining base-image and unrelated dependency advisories are not counted application vulnerabilities without reproduced impact. See `evidence/tools/zap-summary.md`, `evidence/tools/trivy-summary.md`, and `docs/security-tool-triage.md`.
