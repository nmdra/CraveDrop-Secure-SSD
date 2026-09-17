# Submission checklist

## Before the video

- [ ] Run all focused regression and runtime checks.
- [ ] Run the bounded OWASP ZAP local-gateway scan, or record an honest reason it is unavailable.
- [ ] Review `evidence/` for secrets and unredacted values.
- [ ] Confirm the report and matrix use only seven counted findings.

## Required files

- [ ] `README.txt` has all member names and registration numbers.
- [ ] `README.txt` has original and modified repository links.
- [ ] `README.txt` has the final unlisted YouTube URL.
- [ ] `report/Report.pdf` opens and contains the final report.
- [ ] `docs/contributions.md` records actual contribution evidence.
- [ ] `docs/finding-matrix.md` links all baseline, fix, and control evidence.

## Clean-clone verification

- [ ] Clone the private modified repository into a new directory.
- [ ] Copy only documented local example configuration values.
- [ ] Run `docker compose up --build`.
- [ ] Start the OIDC profile and complete one synthetic WSO2 login.
- [ ] Run the focused V1–V7 and OIDC checks.
- [ ] Verify `baseline-vulnerable` still resolves to the selected upstream commit.

## ZIP inspection

- [ ] Include only the required report, README, and approved supporting material.
- [ ] Exclude `.env`, credentials, cookies, JWTs, build caches, `node_modules`, and local volumes.
- [ ] Inspect the ZIP file list before upload.
- [ ] Open the PDF and README from the ZIP.
