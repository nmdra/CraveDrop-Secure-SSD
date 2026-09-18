CraveDrop Secure SSD Assignment

Team members
- Hansaja A. M. G — IT22171856
- Dharmasiri I. D. N. D — IT22254320
- Sanjeewa P. D. L. B — IT22629708
- Aluthwaththa A. W. D. S. M — IT22267290

Repositories
- Original vulnerable project: https://github.com/nmdra/CraveDrop
- Modified secure project: https://github.com/nmdra/CraveDrop-Secure-SSD
- Immutable vulnerable baseline: cb68a377f5b8cdc3b12f86883ac6fb703ef5e405
- Baseline tag: baseline-vulnerable

Video
- YouTube video: PENDING — add the unlisted YouTube URL before submission.

Contents
- `docs/finding-matrix.md` links each counted finding to its evidence and tests.
- `docs/report-notes.md` contains the factual source notes for the report.
- `report/Report.pdf` is the submitted report.
- `docs/oidc-setup.md` describes the local WSO2 Identity Server 7.1.0 demonstration.

Local run
1. Copy each Compose service `.env.example` file to an ignored `.env` file.
2. Generate one local JWT value and use that same value for `JWT_SECRET` in the user, order, payment, delivery, and driver service `.env` files.
3. Use local test values only. Do not commit the `.env` files.
4. Start the application with `docker compose up --build`.
5. Start WSO2 for the OIDC demonstration with `docker compose --profile oidc up wso2is`.
6. Follow `docs/oidc-setup.md` to register the local client and synthetic customer.

Security verification
- Reset fixtures: `node scripts/seed-security-fixtures.mjs reset`.
- Verify fixtures: `node scripts/seed-security-fixtures.mjs verify`.
- Run the focused checks listed in `docs/finding-matrix.md`.
- Run OIDC checks under Node 20:
  `node security-tests/regression-oidc.mjs`
  `NODE_ENV=development node security-tests/oidc-mocked.mjs`

Important
The repository contains synthetic fixtures and redacted evidence only. Do not add credentials, tokens, cookies, real personal data, or unredacted logs.
