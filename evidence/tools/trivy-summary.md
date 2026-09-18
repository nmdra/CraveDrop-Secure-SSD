# Trivy CVE scan summary

## Scope

- Initial scan date: 2026-09-18 (UTC)
- Verification scan date: 2026-09-18 (UTC)
- Tool: Trivy 0.68.2 in the pinned `aquasec/trivy:0.68.2` Docker image
- Scanner: vulnerability scanning only
- Unfixed findings: included. The scans did not use `--ignore-unfixed`.
- Initial source target: fresh local clone with no copied runtime `.env` file
- Verification source target: clean working-tree export with ignored runtime files and `node_modules` excluded
- Initial image targets: 13 Compose images
- Verification image targets: the 13 Compose images plus the separately maintained `nmdra/restaurant-service` image

The raw output remains local. Scanner database updates can change advisory counts between runs, so the scan timestamp and artifact set are recorded with each result.

## Initial result counts

| Scan set | Critical | High | Medium | Low |
|---|---:|---:|---:|---:|
| Fresh source clone | 6 | 123 | 163 | 28 |
| 13 Compose images | 20 | 395 | not used for the initial aggregate | not used for the initial aggregate |

The image counts are per-artifact alert instances. They include duplicated CVEs where one package occurs in several services or image layers.

The initial critical inventory included:

| Identifier | Package and installed version | Fixed version reported by Trivy | Affected artifacts |
|---|---|---|---|
| `CVE-2025-44005` | `github.com/smallstep/certificates` `v0.26.1` | `0.29.0` | Frontend image |
| `CVE-2025-68121` | Go standard library `v1.24.2` or `v1.24.6` | `1.24.13`, `1.25.7`, or `1.26.0-rc.3` | Frontend and infrastructure images |
| `CVE-2025-7783` | `form-data` `4.0.2` | `4.0.4` | SMS image and source scan |
| `CVE-2026-30836` | `github.com/smallstep/certificates` `v0.26.1` | `0.30.0` | Frontend image |
| `CVE-2026-31789` | `libcrypto3` and `libssl3` `3.3.4-r0` | `3.3.7-r0` | Frontend image |
| `CVE-2026-33186` | `google.golang.org/grpc` `v1.67.1` | `1.79.3` | Frontend image |
| `CVE-2026-59873` | `tar` `6.2.1` or `7.5.11` | `7.5.19` | Node service images and source dependency trees |

These scanner results did not prove an application exploit or add a counted vulnerability.

## Applied compatible remediation

The following application dependency and gateway changes were made without changing Node, Caddy, or other base-image tags:

| Area | Previous finding | Applied change | Verification |
|---|---|---|---|
| Gateway | Missing CSP and Nginx version disclosure | `Content-Security-Policy` header and `server_tokens off` | Header request and ZAP verification scan |
| `form-data` | `4.0.2`, including `CVE-2025-7783` | Resolved to `4.0.6` | Source regression and image rescan |
| Axios | Earlier `1.16.0` resolution | Updated affected manifests/locks to `1.20.0` | Source regression and image rescan |
| Mongoose | Earlier `8.22.1` resolution | Updated affected manifests/locks to `8.24.4` | Source regression and image rescan |
| React Router | Earlier `7.18.0` resolution | Updated frontend to `7.18.2` | Source regression and image rescan |
| bcrypt/tar path | App dependency resolved `tar` `6.2.1` | Updated user and driver services to bcrypt `6.0.0` | Source regression and rebuilt images |

## Verification result counts

The post-remediation filesystem scan returned:

| Target | Critical | High | Medium | Low |
|---|---:|---:|---:|---:|
| Final working-tree source export | 0 | 32 | 72 | 21 |

The verification image scan over 14 artifacts returned 16 critical, 357 high, 358 medium, 144 low, and 18 unknown alert instances. The selected `axios`, `form-data`, `mongoose`, and React Router findings were absent from the verification results. The application dependency path for `tar` `6.2.1` was also absent.

A remaining `tar` `7.5.11` finding is present in the bundled npm layer of the `node:22-alpine` base image used by the Node services. Base-image upgrades were deliberately excluded because they were outside the approved remediation scope and can introduce broad compatibility changes. The remaining base-image CVE is recorded as a residual dependency-maintenance risk, not as a reproduced CraveDrop application vulnerability.

## Interpretation

Trivy identifies dependency and base-image maintenance risks. It does not prove that a dependency reaches a production request path or that an endpoint is exploitable. The seven assignment findings remain V1--V7 only. The raw reports contain the complete artifact-level result sets and are not submission artifacts.

## Evidence handling

Raw JSON output and image metadata remain local in:

- `/tmp/cravedrop-trivy-20260918T101213Z` (initial scan)
- `/tmp/cravedrop-trivy-remediation-final-20260918T113205Z` (verification scan)

These directories are mode 0700 and are not committed. The scanned source exports excluded runtime `.env` files, active fixture data, and `node_modules`.
