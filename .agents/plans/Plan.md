# Plan: CraveDrop Security Assignment and WSO2 OIDC Login

## Goal

Complete the SSD assignment with the smallest defensible scope:

1. prove and fix seven distinct CraveDrop vulnerabilities;
2. add one working WSO2 Identity Server OpenID Connect customer-login feature;
3. show meaningful four-member Git contributions; and
4. submit the required `README.txt`, PDF report, video below 20 minutes, and ZIP.

A task belongs in this plan only if it proves/fixes one of the seven findings, demonstrates OIDC, supports contribution history, or creates a required deliverable.

## Current State

- The intended vulnerable baseline is CraveDrop default-branch commit `cb68a377f5b8cdc3b12f86883ac6fb703ef5e405`, dated 2025-07-17T21:20:51+05:30. The newest locally fetched upstream ref is Dependabot commit `ce8dff9885d5f498a295ad32432681b3553642c5`, dated 2026-02-14T10:48:50Z. Both are before the July 2026 semester start. A fresh remote record is still required for submission evidence.
- The payment service mounts `/api/payments` routes without authentication (`payment-service/src/index.js:19`; `payment-service/src/routes/payment.route.js:6-7`).
- The order service exposes create/read/update/delete routes without route authentication; its controller trusts body `userId`, reads/deletes by id, and mass-updates `req.body` (`order-service/src/routes/order.route.js:11-17`; `order-service/src/controller/order.controller.js:7,70,82,95`).
- Delivery routes are public and let callers update delivery status and driver location by id (`delivery-service/src/routes/deliveryRoutes.js:19-34`).
- Driver and restaurant administrative operations have no demonstrated role boundary (`driver-service/src/routes/driverRoutes.js:17-30`; `restaurant-service/src/controllers/restaurantController.js`).
- Card orders trust body `totalAmount` and mark themselves paid; the payment service creates an intent using caller-provided `amount` (`order-service/src/controller/order.controller.js:43-57`; `payment-service/src/controller/payment.controllers.js:8-13`).
- User authentication returns an access token and logs refresh tokens. The frontend persists/logs the token (`user-service/src/controllers/authController.js:15-42`; `frontend/src/Hooks/useLogin.jsx:23-29`; `frontend/src/axios.jsx:8-16`).
- WSO2 Identity Server supports the OIDC Authorization Code flow with PKCE. The implementation must use an exact callback URI, `S256` PKCE, state, nonce, server-side code exchange, and ID-token issuer/audience/signature/expiry validation: [WSO2 OIDC Code + PKCE documentation](https://is.docs.wso2.com/en/latest/guides/authentication/oidc/implement-auth-code-with-pkce/).

## Decisions

1. **Eligibility before code.** Preserve the original application and create the modified repository from `cb68a377…`. Record the original URL, current remote ref dates, selected baseline, licence, semester comparison, and the fact that CraveDrop is not a deliberately vulnerable teaching application. If the lecturer interprets the date rule differently, get written approval before implementation.
2. **Use exactly seven counted findings and one backup.** The table below is the only counted set. Notification BOLA is a backup only. Do not count multiple instances of missing object authorisation as separate findings.
3. **Make focused fixes.** Each fix is limited to the vulnerable route/controller/service and the smallest authentication, ownership, role, validation, session, or pricing code needed to block the demonstrated attack. Do not build a shared security SDK, refactor unrelated services, migrate databases, or redesign service-to-service identity.
4. **Use WSO2 for one customer-login feature.** Implement server-side Authorization Code + S256 PKCE with state, nonce, exact callback URI, token validation, and a CraveDrop HttpOnly session. Do not implement account linking, unlinking, role synchronisation, custom WSO2 identity storage, or logout/revocation automation.
5. **Use two lightweight tools only.** Run OWASP ZAP against the local gateway and `npm audit` against relevant JavaScript services. Use their output as supporting evidence, manually reproduce only findings used in the report, and do not build CI or scan-comparison pipelines.
6. **Use simple, visible evidence.** The report is the detailed record. `docs/finding-matrix.md` links each finding to its test and commit. `evidence/` stores only redacted before/after request outputs or screenshots.

## Minimal Seven-Finding Matrix

| ID | Distinct weakness and baseline proof | Focused fix | Required proof after fix |
|---|---|---|---|
| V1 | **Missing authentication on payment actions.** Without a token, create a payment intent or call payment confirmation. | Add authentication middleware to payment actions. Derive the caller from the verified token. | Anonymous request returns 401; an authenticated fixture user reaches the valid payment-start path. |
| V2 | **Order IDOR/BOLA.** Customer B reads, changes, or deletes customer A’s order using A’s order id. | Query/mutate by both order id and authenticated user id. | B receives 403/404; A can still view/cancel their allowed order. |
| V3 | **Order mass assignment.** A request supplies protected fields such as `userId`, `totalAmount`, `status`, or timestamps. | Allow-list customer-controlled fields and derive server-owned values. | Injected fields are ignored/rejected; a valid order request works. |
| V4 | **Unauthorised delivery mutation.** An unrelated user/driver changes a delivery’s status or tracking location. | Authenticate the route; confirm the caller is the assigned driver before writes; allow only the demonstrated valid next status. | Unrelated caller cannot change status/location; assigned driver can complete the valid update. |
| V5 | **Broken administrative authorisation.** An ordinary user changes another driver’s availability or performs a restaurant administrative operation. | Require the appropriate driver-owner, restaurant-owner, or admin check for the demonstrated action. | Ordinary/wrong-owner account is denied; authorised actor succeeds. |
| V6 | **Payment amount manipulation.** The client submits an amount lower than the product/order total or marks an order paid. | Calculate the amount on the server from trusted order/product data and ignore client amount/payment status. Confirm payment before setting paid status if the current vulnerable path does so. | Tampered amount/status cannot produce a paid order; server-calculated valid test payment succeeds. |
| V7 | **Sensitive token exposure.** Sign-in/refresh places tokens in response JSON, `localStorage`, or logs. | Stop token logging and browser storage; issue a scoped HttpOnly session cookie instead. | Browser storage/logs/response do not expose a token; authenticated session still works. |

**Backup only:** notification BOLA, where a user reads or marks another user’s notification. Fix it only if time remains. It does not contribute to the required seven.

## Nine-Phase Project Plan

- [x] **Phase 1: Confirm eligibility and create the modified repository.** Record fresh GitHub evidence for the original URL, default-branch and newest-ref dates, baseline SHA/date, licence, and semester comparison. Record member names/indexes and whether the examiner will access a public or private repository. Create the modified repository at `cb68a377…`, tag it `baseline-vulnerable`, and do not alter the upstream project. (**Files:** `UPSTREAM.md`, `README.txt`, `.gitignore`; **Verify:** an independent reviewer can reproduce the baseline/date evidence and access the modified repository.)

- [x] **Phase 2: Prepare simple fixtures and evidence folders.** Add only the synthetic records needed for demonstrations: customer A/B, driver A/B, one restaurant, A’s order, and a payment test order. Add a repeatable seed/reset command and create `docs/finding-matrix.md` plus `evidence/`. (**Files:** `scripts/seed-security-fixtures.*`, service `.env.example` files, `docs/finding-matrix.md`, `evidence/`; **Verify:** the team can reset the fixtures and identify the same A/B records before every demo.)

- [x] **Phase 3: Reproduce and lock the seven baseline findings.** Capture one redacted command/request and result for V1–V7 on `baseline-vulnerable`. Add one focused regression test or repeatable script for each. Record the vulnerable endpoint, fixture identity, impact, primary CWE/OWASP mapping, and the intended positive path. Do not begin a fix until all seven entries are clear and non-duplicative. (**Files:** `docs/finding-matrix.md`, `evidence/V*-before.*`, `security-tests/` or affected service test folders; **Verify:** each listed attack succeeds at the baseline and the matrix has seven distinct primary weaknesses.)

- [x] **Phase 4: Fix V1–V3 and commit focused evidence.** Add small authentication middleware to the payment actions for V1. Constrain order lookups/mutations with the authenticated user id for V2. Replace permissive order payload handling with an explicit field allow-list for V3. Add only the tests needed for anonymous, foreign-user, injected-field, and legitimate-user cases. (**Files:** `payment-service/src/index.js`, `payment-service/src/routes/payment.route.js`, payment auth middleware; `order-service/src/routes/order.route.js`, `order-service/src/controller/order.controller.js`, order tests; **Verify:** V1–V3 attacks fail and their legitimate control requests succeed.)

- [ ] **Phase 5: Fix V4–V7 and commit focused evidence.** Require authentication and assigned-driver checks for delivery writes (V4). Add the smallest role/owner check needed for the selected driver/restaurant administrative action (V5). Derive order/payment amount from trusted server data and prevent a client-set paid state (V6). Remove token output/logging/storage and establish the HttpOnly session path (V7). Treat notification BOLA only as optional backup work. (**Files:** `delivery-service/src/routes/deliveryRoutes.js`, `delivery-service/src/controllers/deliveryController.js`; `driver-service/src/routes/driverRoutes.js`, `driver-service/src/controllers/driverController.js`, selected `restaurant-service/src/routes/*.js`/controller; `order-service/src/controller/order.controller.js`, `payment-service/src/controller/payment.controllers.js`; `user-service/src/controllers/authController.js`, `frontend/src/Hooks/useLogin.jsx`, `frontend/src/axios.jsx`, `frontend/src/Context/AuthContext.jsx`, focused tests; **Verify:** V4–V7 attacks fail, authorised workflows work, and each fix has an individual commit.)

- [ ] **Phase 6: Add a minimal WSO2 OIDC customer login.** Run a pinned local WSO2 Identity Server development instance and manually register one CraveDrop OIDC web application with the exact callback URI, Authorization Code grant, and S256 PKCE. Add “Continue with WSO2,” `/auth/wso2/start`, and callback handling. Generate/check state, nonce, and verifier; exchange the code server-side; validate issuer, audience, signature, and expiry; locate or create the customer record using WSO2 `sub`; then issue the same HttpOnly CraveDrop session. (**Files:** `docker-compose.yml`, `.env.example`, `docs/oidc-setup.md`, `user-service/src/controllers/*oidc*`, `user-service/src/routes/userRoutes.js`, `user-service/src/models/user.js`, frontend login/router; **Verify:** one synthetic WSO2 user signs in and reaches a protected customer page; invalid state and invalid token/claim tests fail; no token is present in URL or browser storage.)

- [ ] **Phase 7: Run two supporting security tools.** Run ZAP against the local gateway and `npm audit` in the selected JavaScript services. Save only relevant redacted outputs, manually verify any report claim, and record unresolved relevant issues as residual risks. (**Files:** `evidence/tools/zap.*`, `evidence/tools/npm-audit.*`, `docs/finding-matrix.md`; **Verify:** report evidence gives tool name/version/date/target and no unverified scanner warning is claimed as a vulnerability.)

- [ ] **Phase 8: Produce required documentation and Git contribution evidence.** Keep one coherent commit for each baseline proof, fix/test, OIDC feature, and documentation group. Write `README.txt` with names/indexes, original/modified links, video link, and run instructions. Write the PDF report with eligibility, architecture, method/tool limits, seven findings, OIDC feature, remaining risks, secure-development prevention, and individual contributions. (**Files:** `README.txt`, `report/Report.md` or `.tex`, `docs/finding-matrix.md`, `docs/contributions.md`; **Verify:** each report finding links to its baseline proof, fix commit, blocked-attack proof, and legitimate control.)

- [ ] **Phase 9: Rehearse, record, and package.** Record a 17–18 minute video: 1 minute scope/eligibility, 2 minutes application/method, 8–9 minutes V1–V7 before/after, 3 minutes WSO2 flow, 2 minutes tools/residual risks/prevention, and 1 minute contributions/conclusion. Run the project from a clean clone, validate report/README/video links, create the submission ZIP, and inspect it for secrets. (**Files:** `docs/video-runbook.md`, `docs/submission-checklist.md`, report PDF, final ZIP; **Verify:** video is below 18 minutes, all members present their contribution, clean setup works, and ZIP contains only required redacted files.)

## Verification

A finding is complete only when its baseline attack, impact, focused fix, blocked-attack proof, legitimate positive test, CWE/OWASP mapping, residual risk, and Git commit are present in the report and matrix.

The assignment is ready to submit only when:

- all seven matrix entries are distinct and fixed;
- the WSO2 customer login works with one synthetic account and rejects invalid state/token validation inputs;
- names/indexes, repository links, video link, and individual contributions are complete;
- the video is under 20 minutes; and
- the ZIP has been checked for secrets and opens with the required files.

## Open Questions

- What are the four member names/index numbers and final work split?
- Does the lecturer require a public modified repository, or is private examiner access accepted?
- Which pinned WSO2 Identity Server version/image will be used for the local demonstration?
