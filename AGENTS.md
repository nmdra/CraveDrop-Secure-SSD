# CraveDrop Secure Assignment Agent Guide

## Mission

Deliver the secure CraveDrop assignment defined in [`.agents/plans/Plan.md`](.agents/plans/Plan.md). The grading target is focused evidence, not a large diff: seven **distinct**, reproduced, fixed, and regression-tested vulnerabilities, a real WSO2 Identity Server customer-login feature, detailed Git history, PDF report, `README.txt`, and a sub-20-minute video.

Read the plan before changing source. Treat it as the source of truth for scope, finding IDs, test acceptance, ownership, and deliverables.

## Guardrails

- Work only in the **modified** CraveDrop repository after eligibility evidence is recorded. Preserve upstream `cb68a377f5b8cdc3b12f86883ac6fb703ef5e405` as an immutable baseline and never alter the original repository.
- Use generated local secrets and synthetic fixtures only. Keep `.env` files, WSO2 administrator/client credentials, Stripe credentials, JWTs, cookies, real PII, scan secrets, and unredacted evidence out of Git, logs, screenshots, report, and video.
- Preserve a legitimate authorised path whenever securing an endpoint. A 401/403 test alone is insufficient.
- Do not count multiple URLs that share one root cause as separate findings. A finding counts only when its baseline proof, impact, fix, and negative plus positive regression are independently recorded.
- Do not claim a scan result, mitigation, or OIDC property until it has been run or demonstrated. Record residual risks and blockers honestly.

## Security Contracts

Apply these contracts only to the routes and services changed for the seven counted findings or OIDC feature:

1. **Authentication/authorisation:** The affected controller uses a verified authenticated user and checks only the ownership or role required by its demonstrated attack. No body, query, or URL id establishes identity or privilege.
2. **Mutation:** Allow-list only fields needed by V3. The server owns order user, price, payment state, and timestamps. For V4, only the assigned driver performs the demonstrated valid delivery update.
3. **Payment:** For V6, calculate the amount from trusted server-side data and do not accept a client-provided paid status.
4. **Session:** Browser storage and logs contain no bearer token. Use the smallest HttpOnly cookie session change that preserves the demonstrated authorised path.
5. **OIDC:** Use WSO2 server-side Authorization Code + S256 PKCE with exact callback URI, state, nonce, code exchange, and issuer/audience/signature/expiry validation. Implement one customer login only. Do not add account linking, role synchronisation, or logout automation unless the plan is revised.

## Workflow

1. Read the relevant route, controller, model, configuration, test, and the matching plan task before editing.
2. Write or update the baseline/negative regression and a valid authorised control case first. Use only the A/B fixtures needed for that finding.
3. Implement the smallest complete route/controller/middleware/UI change that blocks the demonstrated attack. Do not refactor unrelated services or build generic infrastructure.
4. Run the focused test or repeatable request and inspect logs for accidental secrets.
5. Update `docs/finding-matrix.md` and add only essential redacted before/after evidence.
6. Commit one coherent evidence or fix/test change with a conventional subject and finding ID in the body.

## Required Checks

Run the narrowest relevant checks while working, then run these before a merge/release:

```bash
# From the modified CraveDrop repository
docker compose up --build
# Run the focused V1–V7 tests or repeatable attack/control scripts.
# Run only the planned supporting tools: OWASP ZAP and npm audit.
```

Record the tool version, command, target, date, and relevant triage. Before final submission, run a clean-clone setup, compare `baseline-vulnerable` with `HEAD`, verify the PDF/video/README links, and inspect the ZIP contents.

## Documentation and Git

- Keep `UPSTREAM.md`, `docs/finding-matrix.md`, `evidence/`, `docs/contributions.md`, and the report consistent with code and tests.
- Each finding needs baseline request/response evidence, OWASP/CWE mapping, impact, focused fix rationale, residual risk, fix commit, and a blocked-attack plus legitimate-control reference.
- Make history legible: baseline, evidence, focused fixes, OIDC feature, and deliverables. Do not squash this history.
- Use diagrams only when they clarify a trust boundary or OIDC flow. Use narrow Mermaid `flowchart TD` diagrams.

## Before Declaring Work Done

Check all modified files for diagnostics, run the focused tests and the appropriate whole-project verification, ensure no secret or token appears in `git diff`, and state: finding ID, authorised path tested, attack path blocked, commands run, evidence updated, and commit/PR link.
