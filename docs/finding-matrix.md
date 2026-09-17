# Security finding matrix

The seven counted findings below use different primary root causes. Delivery/notification object-authorisation issues are not counted separately.

| ID | Primary weakness | CWE / OWASP mapping | Baseline evidence | Fix/test commit | Blocked attack | Legitimate control | Status |
|---|---|---|---|---|---|---|---|
| V1 | Missing authentication on payment actions | CWE-306 / OWASP API1 | `evidence/V1-before.txt`; payment routes mount without auth | Pending | Pending | Pending | Source baseline reproduced |
| V2 | Order IDOR/BOLA | CWE-639 / OWASP API1 | `evidence/V2-before.txt`; order lookup/delete use URL id only | Pending | Pending | Pending | Source baseline reproduced |
| V3 | Order mass assignment | CWE-915 / OWASP API3 | `evidence/V3-before.txt`; update passes `req.body` | Pending | Pending | Pending | Source baseline reproduced |
| V4 | Unauthorised delivery mutation | CWE-862 / OWASP API5 | `evidence/V4-before.txt`; status/location writes lack actor check | Pending | Pending | Pending | Source baseline reproduced |
| V5 | Broken administrative authorisation | CWE-862 / OWASP API5 | `evidence/V5-before.txt`; driver/restaurant admin routes lack role guard | Pending | Pending | Pending | Source baseline reproduced |
| V6 | Payment amount manipulation | CWE-841 / OWASP API business-logic risk | `evidence/V6-before.txt`; amount and paid state depend on client input | Pending | Pending | Pending | Source baseline reproduced |
| V7 | Sensitive session-token exposure | CWE-922 and CWE-532 / OWASP API2 | `evidence/V7-before.txt`; JSON/localStorage/log token exposure | Pending | Pending | Pending | Source baseline reproduced |

## Baseline verification

Run the repeatable source-level baseline check from the repository root:

```bash
node security-tests/baseline-check.mjs baseline-vulnerable
```

It verifies the vulnerable route/controller operations from the immutable tag and writes the seven redacted baseline evidence files. The curl request in each evidence file is the local HTTP reproduction recipe. Live response captures will be appended when the affected local services are started.

## Counting rule

A finding becomes complete only after the report contains its baseline request/response, impact, focused fix, blocked-attack test, legitimate control test, residual risk, and fix commit. Notification BOLA is retained as an optional backup and is not part of the required seven.
