# Trivy CVE scan summary

## Scope

- Date: 2026-09-18 (local lab)
- Tool: Trivy 0.68.2 in the pinned `aquasec/trivy:0.68.2` Docker image
- Scanner: vulnerability scanning only
- Excluded: secret, misconfiguration, license, and active network scanning
- Unfixed findings: included. The scan did not use `--ignore-unfixed`.
- Source target: a fresh local clone with no copied runtime `.env` file
- Image targets: 13 images from `docker compose config --images`

The scanner database was downloaded during this run. Trivy stated that version 0.74.0 was available. This result therefore records the exact 0.68.2 scanner version.

## Filesystem result

| Target | Critical | High | Medium | Low |
|---|---:|---:|---:|---:|
| Fresh source clone | 6 | 123 | 163 | 28 |

The filesystem result identifies vulnerable dependency versions. It does not prove that a dependency reaches a production request path.

## Image results

| Image | Critical | High | Medium | Low | Unknown |
|---|---:|---:|---:|---:|---:|
| `mongo:7.0` | 1 | 96 | 70 | 18 | 9 |
| `nginx:alpine` | 0 | 36 | 70 | 37 | 6 |
| `nmdra/delivery-service` | 1 | 10 | 7 | 1 | 0 |
| `nmdra/driver-service` | 2 | 18 | 10 | 1 | 0 |
| `nmdra/email-service` | 1 | 14 | 20 | 4 | 0 |
| `nmdra/frontend` | 6 | 75 | 74 | 42 | 2 |
| `nmdra/notification-service` | 1 | 15 | 17 | 3 | 0 |
| `nmdra/order-service` | 1 | 10 | 7 | 1 | 0 |
| `nmdra/payment-service` | 1 | 10 | 7 | 1 | 0 |
| `nmdra/sms-service` | 2 | 25 | 29 | 4 | 0 |
| `nmdra/user-service` | 3 | 54 | 39 | 7 | 0 |
| `postgres:17-alpine` | 1 | 30 | 28 | 14 | 1 |
| `rabbitmq:4-management-alpine` | 0 | 2 | 6 | 12 | 0 |

These are per-artifact counts. They include duplicated CVEs where one package appears in several services or image layers. Do not add the rows to claim a unique-CVE total.

## Critical-CVE inventory candidates

The scan found these distinct critical package/version combinations. The items need dependency-path and reachability review before the final report calls any item an application-security issue.

| Identifier | Package and installed version | Fixed version reported by Trivy | Affected scan artifacts |
|---|---|---|---|
| `CVE-2025-44005` | `github.com/smallstep/certificates` `v0.26.1` | `0.29.0` | Frontend image |
| `CVE-2025-68121` | Go standard library `v1.24.2` or `v1.24.6` | `1.24.13`, `1.25.7`, or `1.26.0-rc.3` | Frontend, MongoDB, and PostgreSQL images |
| `CVE-2025-7783` | `form-data` `4.0.2` | `4.0.4` | SMS image and source scan |
| `CVE-2026-30836` | `github.com/smallstep/certificates` `v0.26.1` | `0.30.0` | Frontend image |
| `CVE-2026-31789` | `libcrypto3` and `libssl3` `3.3.4-r0` | `3.3.7-r0` | Frontend image |
| `CVE-2026-33186` | `google.golang.org/grpc` `v1.67.1` | `1.79.3` | Frontend image |
| `CVE-2026-59873` | `tar` `6.2.1` or `7.5.11` | `7.5.19` | User, SMS, payment, order, notification, email, driver, delivery images, and source scan |

## Interpretation and next action

This scan identifies dependency and base-image maintenance risks. It does not reproduce an exploit, prove package reachability, or add a counted vulnerability. The seven assignment findings remain V1–V7 only.

The next review must trace each selected high or critical item to its lockfile or image layer. It must also determine whether an untrusted request can reach the vulnerable function. Upgrade only a compatible direct dependency or pinned base image. Then rebuild, rescan, and run the affected security regression.

## Evidence handling

Raw JSON output, image digests, and the clean clone remain local in the mode-0700 directory recorded at `/tmp/cravedrop-trivy-20260918T101213Z`. These files are not committed. The raw scan did not include a runtime `.env` file.
