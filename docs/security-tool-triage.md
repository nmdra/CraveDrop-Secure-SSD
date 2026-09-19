# Security-tool findings report

## Purpose

This report records the completed local OWASP ZAP and Trivy scans and the bounded remediation selected for the assignment. Scanner results remain separate from the seven reproduced application vulnerabilities.

Scanner output is evidence for review. It is not proof of exploitability.

## Scan boundary

| Tool | Scope | Excluded work |
|---|---|---|
| OWASP ZAP 2.17.0 | `http://127.0.0.1:5000` gateway, bounded spider, passive rules | Active attacks, login, WSO2, direct services, databases, RabbitMQ, and external URLs |
| Trivy 0.68.2 | Fresh source export, 13 Compose images, and the separately maintained restaurant image | Secret, license, and misconfiguration scans |
| npm/Yarn audit | Selected JavaScript services | Treating advisories as reproduced application vulnerabilities |

The completed scan records are redacted. Raw output remains in local mode-0700 directories and is not committed.

## ZAP findings and remediation

The initial ZAP run returned nine alert instances:

| Finding | Severity | Initial evidence | Final status |
|---|---|---|---|
| Missing CSP header | Medium | Gateway fallback responses for `/`, `/robots.txt`, and `/sitemap.xml` lacked `Content-Security-Policy`. | Header added. The verification scan did not report missing CSP. |
| Nginx version disclosure | Low | Fallback responses exposed the Nginx product/version in response content and the `Server` header. | `server_tokens off` added. The verification scan reported zero low version-disclosure alerts. |

The verification scan returned three Medium `CSP: Failure to Define Directive with No Fallback` instances on the same paths. The policy is present, but it still needs policy-completeness review. This is a gateway hardening item, not a reproduced application exploit. The two ZAP root causes are not V8 or later.

Manual verification confirmed the hardened response includes:

```text
Content-Security-Policy: default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'
Server: nginx
```

## Trivy findings and remediation

The initial source scan returned 6 critical, 123 high, 163 medium, and 28 low findings. The initial 13-image scan returned 20 critical and 395 high alert instances. These are per-artifact counts and include duplicate packages and base-image layers.

The initial critical inventory included:

- [`CVE-2025-44005`](https://nvd.nist.gov/vuln/detail/CVE-2025-44005) and [`CVE-2026-30836`](https://nvd.nist.gov/vuln/detail/CVE-2026-30836) in frontend smallstep components.
- [`CVE-2025-68121`](https://nvd.nist.gov/vuln/detail/CVE-2025-68121) in Go standard-library layers.
- [`CVE-2025-7783`](https://nvd.nist.gov/vuln/detail/CVE-2025-7783) in `form-data` 4.0.2.
- [`CVE-2026-31789`](https://nvd.nist.gov/vuln/detail/CVE-2026-31789) in frontend OpenSSL libraries.
- [`CVE-2026-33186`](https://nvd.nist.gov/vuln/detail/CVE-2026-33186) in frontend gRPC.
- [`CVE-2026-59873`](https://nvd.nist.gov/vuln/detail/CVE-2026-59873) in `tar` dependency/base-image layers.

The links are NVD record/lookup citations. The Trivy package/version, affected-artifact, reachability and remediation evidence remains authoritative for this run; these scanner identifiers are not additional V1–V7 findings.

The selected compatible application-level remediation was:

| Area | Change | Result |
|---|---|---|
| Gateway | CSP header and `server_tokens off` | Verified by response inspection and ZAP rescan |
| `form-data` | Update affected resolutions to 4.0.6 | Vulnerable selected resolution absent in final scans |
| Axios | Update affected manifests/locks to 1.20.0 | Selected Axios findings absent in final scans |
| Mongoose | Update affected manifests/locks to 8.24.4 | Selected Mongoose findings absent in final scans |
| React Router | Update frontend packages to 7.18.2 | Selected React Router finding absent in final scans |
| bcrypt/tar application path | Update user and driver services to bcrypt 6.0.0 | App-level `tar` 6.2.1 path removed |

The final source export returned 0 critical, 32 high, 72 medium, and 21 low findings. The final image scan covered 14 artifacts and returned 16 critical, 357 high, 358 medium, 144 low, and 18 unknown alert instances. The remaining image findings are primarily base-image and unrelated dependency maintenance items.

A `tar` 7.5.11 finding remains in the bundled npm layer of the Node 22 Alpine base image. Node/Caddy/base-image upgrades were deliberately excluded from this assignment remediation because they are broad compatibility changes and were not required to complete the seven application findings. This residual risk is recorded honestly and is not counted as an additional application vulnerability.

## RCA and counting decision

The scanner results identify package or configuration maintenance risk. They do not prove that a request reaches the vulnerable function, that an image-layer CVE is exploitable in this application, or that a new application vulnerability exists. No scanner alert is counted as V8 or later. The assignment portfolio remains exactly V1--V7.

The focused source regression passed after the selected changes:

```text
node security-tests/regression-tool-remediations.mjs
```

The rebuilt affected services started, and the V1--V7 runtime and source regressions remained passing. See `evidence/tools/zap-summary.md`, `evidence/tools/trivy-summary.md`, and `evidence/tools/npm-audit.txt` for the detailed records.

## Evidence references

- `evidence/tools/zap-summary.md`
- `evidence/tools/trivy-summary.md`
- `evidence/tools/npm-audit.txt`
- Local initial ZAP output: `/tmp/cravedrop-zap-20260918-152734`
- Local verification ZAP output: `/tmp/cravedrop-zap-final-20260918T113513Z`
- Local initial Trivy output: `/tmp/cravedrop-trivy-20260918T101213Z`
- Local verification Trivy output: `/tmp/cravedrop-trivy-remediation-final-20260918T113205Z`

The local paths are not submission artifacts. They contain raw scanner output and remain outside Git.
