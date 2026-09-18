# Security-tool findings report

## Purpose

This report records the completed local OWASP ZAP and Trivy scans. It keeps scanner results separate from the seven reproduced application vulnerabilities.

Scanner output is evidence for review. It is not proof of exploitability.

## Scan boundary

| Tool | Scope | Excluded work |
|---|---|---|
| OWASP ZAP 2.17.0 | `http://127.0.0.1:5000` gateway, bounded spider, passive rules | Active attacks, login, WSO2, direct services, databases, RabbitMQ, and external URLs |
| Trivy 0.68.2 | Fresh source clone and 13 locally built or deployed images | Secret, license, and misconfiguration scans |

The ZAP scan returned successfully on 2026-09-18. The Trivy scans returned successfully on the same date. Raw output remains local and is not committed.

## ZAP findings

| Finding | Severity | Evidence | Status |
|---|---|---|---|
| Missing CSP header | Medium | The gateway fallback responses for `/`, `/robots.txt`, and `/sitemap.xml` lack `Content-Security-Policy`. | Gateway-hardening candidate. No exploit was reproduced. |
| Nginx version disclosure | Low | The same fallback responses expose the Nginx product version in response content and the `Server` header. | Gateway-hardening candidate. No compromise was demonstrated. |

The nine ZAP alerts reduce to two shared root causes. Neither result changes the V1–V7 count.

## Trivy findings

Trivy found critical and high CVEs in dependency trees and base-image packages. These counts include duplicate CVEs across images.

| Scan set | Critical | High | Review result |
|---|---:|---:|---|
| Fresh source clone | 6 | 123 | Dependency versions need path and reachability analysis. |
| 13 Compose images | 20 | 395 | Counts are per image. Base-image and dependency duplicates occur. |

The critical inventory includes `form-data`, `tar`, Go components in the frontend image, OpenSSL libraries in the frontend image, and Go standard-library components in infrastructure images. Refer to `evidence/tools/trivy-summary.md` for the exact scanner identifiers, installed versions, fixed versions, and affected artifacts.

## Triage decision

No scanner finding is counted as V8 or later. No scanner finding is claimed as an application exploit.

The next review must do these tasks for each selected high or critical CVE:

1. Trace the package to a lockfile or image layer.
2. Determine whether a reachable CraveDrop request uses the vulnerable function.
3. Record the attack precondition and manual validation result.
4. Upgrade only compatible direct dependencies or base images.
5. Rebuild, rescan, and run the affected security regression.

## Evidence references

- `evidence/tools/zap-summary.md`
- `evidence/tools/trivy-summary.md`
- Local ZAP output: `/tmp/cravedrop-zap-20260918-152734`
- Local Trivy output: `/tmp/cravedrop-trivy-20260918T101213Z`

The local paths are not submission artifacts. They contain raw scanner output and must remain outside Git.
