# Plan: ZAP and Trivy Security Tool Scans

## Goal

Run a bounded OWASP ZAP scan against the local CraveDrop gateway and Trivy vulnerability scans against the clean source tree and deployed local images. Produce redacted, reproducible evidence of scanner findings and CVEs without treating unverified scanner output as additional counted V1--V7 vulnerabilities.

For the report, document an RCA for every **high/critical** finding and every lower-severity CVE that demonstrably affects a reachable CraveDrop component. Summarise other low/moderate results by count and retain the raw local output for triage, rather than expanding the main report with unsupported entries.

## Current State

- The master plan records the user-approved Trivy supporting-tool addition. The bounded scans, triage, selected remediation, report integration, redacted appendices, and final source-PDF rebuild are complete; only video and final upload work remain open in Phase 9.
- The local gateway is exposed on host port 5000 (`docker-compose.yml:157-182`). The Compose application images include frontend, user, notification, email, SMS, order, payment, driver, and delivery services (`docker-compose.yml:1-266`).
- Existing npm-audit evidence distinguishes dependency advisories from reproduced application vulnerabilities (`evidence/tools/npm-audit.txt`). Completed ZAP and Trivy results are recorded in `evidence/tools/zap-summary.md` and `evidence/tools/trivy-summary.md`.
- Final verification recorded zero missing-CSP-header and zero Nginx version-disclosure alerts, with three Medium CSP policy-completeness alerts remaining as gateway hardening. The final Trivy source export returned 0 Critical, 32 High, 72 Medium and 21 Low; the 14-image verification returned 16 Critical, 357 High, 358 Medium, 144 Low and 18 Unknown alert instances. Selected compatible dependency updates were rebuilt and rescanned; the remaining Node 22 Alpine `tar` 7.5.11 finding is a base-image maintenance risk.
- The seven initial critical CVE candidates in the redacted Trivy evidence carry NVD record/lookup citations. The scanner package/version and reachability triage remains authoritative; none is a counted V1--V7 application finding.
- Runtime secrets and active fixture data are ignored (`.gitignore:53-61`). Raw scanner files may contain URLs, package paths, and generated metadata, so they must be local-only until reviewed and redacted.
- ZAP baseline scans spider a target and passively scan it. ZAP supports HTML, Markdown, XML, and JSON reports and rule severity/exit handling. Source: <https://www.zaproxy.org/docs/docker/baseline-scan/>.
- Trivy supports filesystem and image vulnerability scanning, JSON reports, severity filtering, and dependency-path output. Do not use `--ignore-unfixed`, because it would hide unresolved CVEs needed for triage. Sources: <https://trivy.dev/docs/latest/configuration/filtering/>, <https://trivy.dev/docs/v0.57/configuration/reporting/>, and <https://trivy.dev/docs/v0.57/guide/references/configuration/cli/trivy_filesystem/>.

## Decisions

1. **Treat Trivy as a supporting dependency/container tool, not an eighth application vulnerability source.** A CVE becomes a reportable application-security issue only after the team records the affected deployed component, dependency path, reachability, and impact. It does not change the fixed V1--V7 portfolio.
2. **Use a clean clone for filesystem scanning and separate local-only raw output from committed evidence.** This prevents accidental scanning or publishing of ignored runtime configuration. Raw JSON is retained temporarily with mode 0600, then only redacted summaries are committed.
3. **Scan the gateway passively and within a local-only scope.** ZAP must target only `http://127.0.0.1:5000`, with no active attack, authenticated session, WSO2, direct service ports, databases, RabbitMQ, or external URL access. A baseline/passive scan avoids mutation of synthetic data.
4. **Inventory high/critical results completely, plus any directly relevant lower severity CVE.** The report main body summarises scan method/counts. A dedicated appendix/table gives each included item an RCA. Low/moderate results with no demonstrated application impact are counted and retained in reviewed local raw output, not presented as fixed vulnerabilities.
5. **Use dependency RCA, not an invented application-code RCA.** Each selected CVE records the vulnerable package or base image, installed version, dependency or image layer, fixed version/status, affected service, reachability/exploit precondition, and remediation decision. ZAP findings record route, parameter/evidence, manual reproduction result, actual root cause, fix decision, and residual risk.
6. **Do not blindly upgrade or suppress findings.** Apply a dependency/base-image upgrade only when a compatible fixed version exists, the affected image/service can rebuild, and focused V1--V7/OIDC regressions still pass. Any suppression requires a written expiry/review reason and cannot hide a high/critical direct-impact item.

## Scope

**In scope**

- System-installed ZAP and Trivy preflight/version checks.
- A single bounded ZAP baseline/passive scan of the local gateway.
- Trivy filesystem dependency scan of a clean clone and image scans of Compose-deployed application and infrastructure images.
- High/critical and directly relevant CVE RCA triage, redacted evidence, report appendix/summary, and optional verified remediation.

**Out of scope**

- Active ZAP attacks, production targets, external service scanning, brute force, authenticated crawling, WSO2/admin scanning, database/RabbitMQ scanning, or secret scanning.
- Counting a tool alert or CVE as V8+ without an independently reproduced application impact and an explicit plan revision.
- Inventing CVE reachability, exploitability, fixes, or authorship.

## Tasks

- [x] **Task 1: Authorise and prepare the tool-evidence boundary.** Add the approved Trivy supporting-tool exception to the master plan without changing the seven-finding counting rule. Add ignored local directories for raw ZAP/Trivy output and create committed evidence templates that require tool version, database-update time, command, target/artifact digest, date, result counts, redaction review, and a no-new-counted-finding statement. (**Files:** `.agents/plans/Plan.md`, `.gitignore`, `evidence/tools/zap-summary.md`, `evidence/tools/trivy-summary.md`, `docs/security-tool-triage.md`; **Seam:** Git ignored-file check and evidence-template review; **Verify:** `git check-ignore` accepts raw-output paths, `git status --short` shows only redacted templates, and `git diff --check` passes.)

- [x] **Task 2: Prove installed tool capability and start the bounded lab.** Record the resolved executable paths and versions for `trivy` and the system ZAP launcher (`zap.sh` or `zaproxy`). Validate `docker compose --profile oidc config --quiet`, start only the required local Compose services, and confirm the gateway health route responds before scanning. If the installed ZAP package lacks a supported headless baseline capability, stop and record that blocker rather than substituting an active scan. (**Files:** `evidence/tools/zap-summary.md`, `evidence/tools/trivy-summary.md`; **Seam:** `command -v`, `--version`, Compose health endpoint; **Verify:** version output and scan date/target are recorded, and `curl -fsS http://127.0.0.1:5000/api/user/health` succeeds.)

- [x] **Task 3: Execute and triage the ZAP passive baseline scan.** Run the installed ZAP baseline/headless mode against only `http://127.0.0.1:5000`, with a one-minute/default spider budget, a rule configuration that reports alerts without treating warnings as success, and local JSON/HTML output. Redact dynamic identifiers, query values, headers, cookies, and any incidental response data before committing a summary. De-duplicate alerts by rule ID, endpoint family, and shared root cause. Manually reproduce every high-risk alert and each alert proposed for the report. (**Files:** local ignored `evidence/tools/raw/zap/`, `evidence/tools/zap-summary.md`, `docs/security-tool-triage.md`, `docs/finding-matrix.md` only if a verified existing V1--V7 control is corroborated; **Seam:** gateway `http://127.0.0.1:5000`; **Verify:** report records ZAP version, date, baseline command, target, exit code, alert counts, redaction check, and manual-reproduction outcome; no active-scan request is made.)

- [x] **Task 4: Execute Trivy filesystem and image CVE scans.** Create a fresh clone at the pushed commit, then run Trivy with the vulnerability scanner only, JSON output, dependency-tree detail, and no `--ignore-unfixed`. Scan the clean source tree’s lockfiles plus each built Compose application image and deployed infrastructure image. Capture image digests and scanner database metadata. Use `HIGH,CRITICAL` filtering for the report inventory, but retain total severity counts so lower-severity direct-impact items can be escalated after review. (**Files:** local ignored `evidence/tools/raw/trivy/`, `evidence/tools/trivy-summary.md`, `docs/security-tool-triage.md`; **Seam:** clean clone, `docker compose config --images`, and Docker image digests; **Verify:** every selected artifact has a scan status, digest, Trivy version/database timestamp, and JSON result; raw output contains no `.env` or runtime-secret content.)

- [x] **Task 5: Write the finding and CVE RCA inventory.** For each ZAP high alert and every Trivy high/critical or directly relevant CVE, add one row with: scanner identifier/CVE, severity and source, artifact/service, affected package/version and dependency path or ZAP route/parameter, evidence, reachability/preconditions, root cause, manual validation status, fixed version or mitigation, remediation decision, residual risk, and report location. Explicitly label non-reproducible/unreachable entries as dependency-maintenance risks, not application exploits. Summarise excluded low/moderate findings by scanner/artifact/severity count. (**Files:** `docs/security-tool-triage.md`, `evidence/tools/zap-summary.md`, `evidence/tools/trivy-summary.md`, `docs/report-notes.md`; **Seam:** reviewed raw JSON plus a manual request/build test; **Verify:** every included high/critical/direct-impact row has all RCA fields, and the count reconciliation matches the redacted summaries.)

- [x] **Task 6: Remediate only verified, compatible direct-impact CVEs.** For each selected fix, upgrade the narrowest direct dependency or base image to a fixed version, rebuild the affected service/image, rerun its Trivy scan, and execute the focused security regressions plus any service startup control. Keep an unfixed entry when no compatible fix or reliable reproduction exists, with its reason and review action. (**Files:** affected `package.json`, lockfile, Dockerfile, or `docker-compose.yml`; `docs/security-tool-triage.md`; `evidence/tools/trivy-summary.md`; **Seam:** affected image build and existing V1--V7/OIDC test scripts; **Verify:** fixed CVE is absent or explicitly status-changed in the rescanned artifact, affected service starts, and regressions pass.)

- [x] **Task 7: Integrate only supported claims into the report and submit-ready evidence.** Add a short tools-method section, severity/count table, and a report appendix/reference to the RCA inventory. Update the remaining-risk discussion with unfixed direct-impact CVEs and ZAP alerts. Preserve the statement that scanner output is not a counted vulnerability without manual proof. Recompile and visually inspect the PDF, run a secret-pattern scan over all evidence/report files, and commit scan evidence separately from any remediation. (**Files:** `report/Report.tex`, `report/Report.pdf`, `docs/report-notes.md`, `docs/finding-matrix.md`, `docs/submission-checklist.md`; **Seam:** report compilation and evidence consistency review; **Verify:** `tectonic -X compile report/Report.tex --outdir report`, `pdfinfo report/Report.pdf`, `git diff --check`, and a redaction scan all pass.)

## Verification

The scan work is complete only when all of the following are true:

1. ZAP and Trivy executable/version/database information, date, exact bounded target or artifact digest, and command are recorded.
2. ZAP targets only the local gateway and uses passive/baseline behavior. No claim is made from a failed, aborted, or unreviewed run.
3. Trivy scans a clean source tree and the relevant built images with vulnerability scanning only and without hiding unfixed CVEs.
4. The RCA inventory reconciles to the high/critical scan counts and includes every lower-severity CVE that directly affects a reachable application component.
5. Every included row distinguishes scanner evidence from manual confirmation and labels unverified advisories honestly.
6. Any applied CVE remediation has a rescan and focused regression evidence; unfixed direct-impact entries have a reason and follow-up.
7. No report/evidence/raw committed file includes credentials, complete cookies/JWTs, authorization codes, `.env` values, or real personal data.
8. The report, finding matrix, and submission checklist continue to state exactly seven counted application vulnerabilities.

## Resolved Questions

- The package launcher `/usr/share/zaproxy/zap.sh -daemon` provided the supported headless path; the GUI wrapper was not used.
- Trivy 0.68.2 ran from the pinned `aquasec/trivy:0.68.2` image, with vulnerability scanning only and unfixed findings included.
- The report uses complete redacted ZAP and Trivy appendices, while `docs/security-tool-triage.md` remains the detailed repository RCA record. The native report also retains NVD CVE citations without promoting scanner-only results to V8+.
