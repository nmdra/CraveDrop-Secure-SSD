# CraveDrop security-assignment video script

**Purpose:** Script only. No video was recorded in this task.

**Target duration:** 17–18 minutes. Maximum allowed duration: 20 minutes.

## Recording safety rules

- Use synthetic fixtures only.
- Use redacted evidence files.
- Never show passwords, client secrets, JWTs, cookies, authorization codes, refresh tokens, `.env` files, or real personal data.
- Do not paste secrets into the terminal or browser address bar.
- Stop the recording and restart if a secret appears.

## 0:00–1:00 — Introduction

**Presenter:** All members, or one nominated presenter.

**Say:**

> We are presenting our SE4030 Secure Software Development assignment on CraveDrop. CraveDrop is a food-ordering and delivery platform with separate user, order, payment, delivery, driver, restaurant, notification, email, and SMS services.
>
> The original project is `https://github.com/nmdra/CraveDrop`. Our modified project is `https://github.com/nmdra/CraveDrop-Secure-SSD`.
>
> We preserved the vulnerable source at the immutable tag `baseline-vulnerable`, commit `cb68a377f5b8cdc3b12f86883ac6fb703ef5e405`. We identified seven distinct vulnerabilities, reproduced each one, fixed each one, and tested both the blocked attack and the valid authorized path.
>
> We also implemented one WSO2 Identity Server OpenID Connect customer-login feature using Authorization Code flow with S256 PKCE.

**Show:** Repository, baseline tag, and report cover page. Do not show private credentials.

## 1:00–2:00 — Method and fixtures

**Presenter:** Aluthwaththa.

**Say:**

> We used deterministic synthetic fixtures. The fixtures include Customer A, Customer B, an assigned driver, an unrelated driver, a restaurant, products, an order, and a delivery.
>
> For every finding, we recorded a baseline attack, the impact, the focused fix, a negative regression test, and a positive authorized control. We do not count multiple URLs with the same root cause as separate findings.
>
> The evidence is redacted. Dependency advisories are recorded separately and are not counted as application vulnerabilities without reproduced endpoint impact.

**Show:** `docs/finding-matrix.md`, `security-tests/fixtures/security-fixtures.json`, and one redacted evidence file.

## 2:00–3:30 — V1: Missing payment authentication

**Presenter:** Dharmasiri.

**Say:**

> V1 was missing authentication on a payment action. In the vulnerable baseline, an anonymous request to `POST /api/payments/create-payment-intent` reached the handler instead of returning an authentication error.
>
> The impact was that an unauthenticated actor could invoke a payment action and consume payment-provider resources.
>
> We added verified Bearer JWT authentication at the payment route. The service uses the verified caller identity, not an identifier supplied by the request.

**Show:**

1. Redacted `evidence/V1-before.txt` with the baseline response.
2. Anonymous request returning HTTP 401.
3. Authenticated synthetic-customer control reaching the handler.
4. `evidence/V1-after.txt` and the focused test result.

**Say:**

> The authorized control proves that authentication does not disable the legitimate payment path. The local synthetic Stripe configuration may reject the payment after authorization, so this is not a claim of a real card charge.

## 3:30–5:00 — V2: Order BOLA

**Presenter:** Dharmasiri.

**Say:**

> V2 was an order insecure direct object reference. In the baseline, an unauthenticated request could retrieve Customer A's order using the order ID.
>
> The fix requires authentication and scopes the order query to both the requested order ID and the verified customer ID.

**Show:**

1. Redacted `evidence/V2-before.txt`.
2. Customer B attempting to access Customer A's order and receiving HTTP 404.
3. Customer A accessing the owned order successfully.
4. `evidence/V2-after.txt` and the runtime test.

**Say:**

> This demonstrates both the blocked cross-user attack and the valid owner path.

## 5:00–6:30 — V3: Order mass assignment

**Presenter:** Dharmasiri.

**Say:**

> V3 was order mass assignment. The baseline accepted client-controlled `userId`, `totalAmount`, `status`, and `createdAt` fields.
>
> This allowed a caller to change ownership, price, lifecycle state, and audit data.
>
> The fix uses an allow-list for editable fields. Identity, price, payment state, and timestamps are server-owned.

**Show:**

1. Redacted `evidence/V3-before.txt`.
2. Tampered update returning HTTP 400.
3. Valid authorized update succeeding.
4. `evidence/V3-after.txt` and the focused test.

**Say:**

> The allow-list preserves the intended update while rejecting protected state.

## 6:30–8:00 — V4: Unauthorized delivery mutation

**Presenter:** Sanjeewa.

**Say:**

> V4 was unauthorized delivery mutation. The baseline allowed an anonymous caller to change delivery status and tracking location.
>
> The fix requires a valid driver JWT, verifies that the driver is assigned to the delivery, and allows only valid status transitions.

**Show:**

1. Redacted `evidence/V4-before.txt`.
2. Anonymous and unrelated-driver requests failing.
3. Assigned-driver status update succeeding.
4. Invalid reverse transition returning HTTP 409.
5. Assigned-driver location update succeeding.

**Say:**

> The test proves authentication, assignment ownership, transition validation, and the legitimate driver control.

## 8:00–9:30 — V5: Driver authorization

**Presenter:** Sanjeewa.

**Say:**

> V5 was broken driver administration authorization. The baseline allowed availability to be changed by using a driver ID in the URL.
>
> The fix requires a verified driver identity and compares it with the URL driver ID.

**Show:**

1. Redacted `evidence/V5-before.txt`.
2. Driver A attempting to update Driver B and receiving denial.
3. Driver A updating their own availability successfully.
4. `evidence/V5-after.txt` and the runtime test.

**Say:**

> The URL identifier no longer establishes authority. The verified token identity does.

## 9:30–11:00 — V6: Payment integrity

**Presenter:** Sanjeewa.

**Say:**

> V6 was payment amount and payment-state manipulation. The baseline accepted a client amount of 1 instead of the trusted fixture total of 2500 and marked a card order as paid.
>
> The fix calculates the total from trusted product data, ignores client currency and paid-status fields, and creates new card orders as pending.

**Show:**

1. Redacted `evidence/V6-before.txt`.
2. Tampered request fields.
3. After-fix response or persisted-state output showing 2500 USD and pending status.
4. Valid authenticated order creation.
5. `evidence/V6-after.txt` and the runtime test.

**Say:**

> The customer can create an order, but cannot choose the price or claim that payment is complete.

## 11:00–12:30 — V7: Token disclosure and session design

**Presenter:** Hansaja.

**Say:**

> V7 covered token disclosure and insecure session handling. The baseline returned access tokens in JSON, stored bearer tokens in browser storage, and logged refresh-token data.
>
> The fix uses strict HttpOnly cookies for the CraveDrop session. Access tokens are not returned in JSON or stored in frontend local storage. Query values are excluded from logs, which also prevents authorization codes from being logged. Cookie mutations require the approved Origin.

**Show:**

1. Redacted `evidence/V7-before.txt`.
2. After-fix login response with tokens omitted from JSON.
3. Cookie flags showing HttpOnly and SameSite where safe to display.
4. Browser storage showing no bearer token.
5. Missing or wrong Origin request being blocked.
6. `evidence/V7-after.txt` and the runtime test.

**Say:**

> HttpOnly cookies reduce token theft. They do not remove the need for XSS prevention, which remains a residual risk.

## 12:30–15:30 — WSO2 OpenID Connect customer login

**Presenter:** Hansaja.

**Say:**

> The new feature is a customer login through WSO2 Identity Server 7.1.0. The application uses Authorization Code flow with S256 PKCE.
>
> CraveDrop generates state, nonce, and a PKCE verifier. It stores the temporary flow in a signed, short-lived HttpOnly cookie. The callback verifies state before token exchange, exchanges the code server-side, and validates issuer, audience, RS256 signature, expiry, nonce, and subject.
>
> The local account key is the provider issuer plus subject. We do not automatically link accounts by email address. The application issues its own CraveDrop HttpOnly session cookies and does not expose provider tokens to the browser.

**Show:**

1. WSO2 login entry point.
2. Authorization request with redacted state and S256 challenge, without copying values.
3. WSO2 authentication page using a synthetic user.
4. Callback URL with no provider access token or refresh token.
5. HTTP 302 dashboard redirect.
6. HttpOnly session-cookie flags, without displaying cookie values.
7. Protected `/validate` request returning HTTP 200.
8. Tampered-state negative test failing before token exchange.
9. Invalid nonce or ID-token negative test failing.
10. `evidence/oidc-after.txt` and the OIDC test files.

**Say:**

> The HTTP 302 is expected. The callback creates the secure session and redirects the browser to the dashboard. The provider tokens remain server-side.

## 15:30–16:30 — Tools, residual risks, and prevention

**Presenter:** Aluthwaththa.

**Say:**

> We ran npm audit for the changed services. The results are recorded as dependency-maintenance input. We did not count an advisory as an application vulnerability without reproducing an endpoint impact.
>
> The OWASP ZAP scan is deferred if the scan has not been completed. We do not claim a ZAP result that was not obtained.
>
> Preventive practices include threat modelling, service-boundary authorization, server-owned state, field allow-lists, negative and positive regression tests, secure cookie sessions, dependency review, and redacted synthetic evidence.
>
> Remaining risks include restaurant authorization review, notification access review, XSS, payment-provider confirmation binding, driver-device integrity, and the deferred ZAP scan.

**Show:** `evidence/tools/npm-audit.txt`, `docs/report-notes.md`, and the remaining-risk section of the PDF.

## 16:30–17:30 — Contributions and conclusion

**Presenter:** All members.

**Say:**

> Hansaja worked on token-session hardening and WSO2 OIDC. Dharmasiri worked on payment authentication and order controls. Sanjeewa worked on delivery, driver, and payment-integrity controls. Aluthwaththa worked on fixtures, evidence, tools, report material, and packaging.
>
> Our repository contains the immutable vulnerable baseline, detailed fix history, regression evidence, the PDF report, and the README files. The seven findings are distinct, reproduced, fixed, and tested. The OIDC customer login adds the required new identity feature while keeping provider tokens away from the browser.
>
> Thank you. We are ready for questions.

## Final presenter checklist

- [ ] Keep the demonstration below 20 minutes.
- [ ] Hide terminal history containing secrets.
- [ ] Hide browser cookies and token values.
- [ ] Use only synthetic accounts.
- [ ] Show both negative and positive controls.
- [ ] Do not claim ZAP completion unless a result exists.
- [ ] Add the final unlisted YouTube URL to `README.txt` and `README.md` after recording.
