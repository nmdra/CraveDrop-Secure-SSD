# Submission checklist

This checklist records the remaining assignment work. The video has **not** been recorded. The script is saved at [`docs/video-script.md`](video-script.md).

## A. Verification

- [x] Reset and verify the deterministic synthetic fixtures.
- [x] Run the V1–V3 runtime regression checks.
- [x] Run the V4–V7 runtime regression checks.
- [x] Run the OIDC source-contract checks.
- [x] Run the OIDC mocked checks under Node 20.
- [x] Complete one real local WSO2 synthetic-customer login. See `evidence/oidc-after.txt`.
- [x] Confirm the protected endpoint returns HTTP 200 after login. See `evidence/oidc-after.txt`.
- [x] Confirm no provider token appears in the callback URL or logs. See `evidence/oidc-after.txt`.
- [x] Review all evidence for secrets, tokens, cookies, credentials, and real personal data.
- [x] Confirm the report and finding matrix contain only seven counted findings.
- [x] Record the non-video verification results in `evidence/phase-9-verification.txt`.

## B. Supporting tools

- [ ] Run the bounded OWASP ZAP scan against the local gateway when bandwidth permits.
- [ ] Save a redacted ZAP result in `evidence/tools/`.
- [ ] If ZAP cannot run, retain the honest deferred-scan record and do not claim completion.
- [x] Confirm `npm audit` evidence includes command, tool version, date, services, and limitations.

## C. Required assignment files

- [x] `README.txt` contains member names and registration numbers.
- [x] `README.txt` contains original and modified repository links.
- [ ] `README.txt` contains the final unlisted YouTube URL after recording.
- [x] `README.md` contains project and security documentation.
- [x] `report/Report.pdf` opens and contains the expanded report.
- [x] `docs/contributions.md` records individual contribution evidence.
- [x] `docs/finding-matrix.md` links baseline, fix, test, and control evidence.
- [x] `docs/video-script.md` contains the video script.

## D. Video preparation

- [x] Save the video script.
- [ ] Record the video later if required by the submission deadline.
- [ ] Keep the final video below 20 minutes.
- [ ] Demonstrate all seven findings with one attack and one authorized control each.
- [ ] Demonstrate the WSO2 OIDC login and negative controls.
- [ ] Do not show secrets, tokens, cookies, authorization codes, or real data.
- [ ] Upload as an unlisted YouTube video.
- [ ] Verify the video URL in a private browser session.
- [ ] Add the exact URL to `README.txt` and `README.md`.

## E. Clean-clone verification

- [x] Clone the private modified repository into a new directory.
- [x] Create only ignored local configuration from the tracked `.env.example` values.
- [x] Run `docker compose up --build` and verify core gateway health endpoints.
- [ ] Recreate the local WSO2 client and synthetic user, then complete one clean-clone synthetic OIDC login.
- [x] Run the focused V1–V7 and OIDC source/mock checks.
- [x] Verify `baseline-vulnerable` still resolves to commit `cb68a377f5b8cdc3b12f86883ac6fb703ef5e405`.
- [x] Confirm the clean clone contains no committed `.env` files or credentials.

Clean-clone evidence is recorded in `evidence/phase-9-verification.txt`. The real OIDC control remains evidenced separately in `evidence/oidc-after.txt` because a fresh WSO2 instance needs the manually documented client-registration and synthetic-user provisioning steps.

## F. ZIP inspection and final submission

- [ ] Include the required report, README files, source, evidence, and documentation.
- [ ] Exclude `.env`, credentials, cookies, JWTs, build caches, `node_modules`, and Docker volumes.
- [ ] Inspect the ZIP file list manually.
- [ ] Open the PDF and README from the ZIP.
- [ ] Confirm the ZIP opens from a separate directory.
- [ ] Push all final commits to the modified repository.
- [ ] Upload the ZIP to CourseWeb.
