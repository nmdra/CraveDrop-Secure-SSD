# OWASP ZAP passive scan summary

## Scope

- Initial scan date: 2026-09-18 (local lab)
- Verification scan date: 2026-09-18 (local lab)
- Tool: OWASP ZAP 2.17.0
- Launcher: `/usr/share/zaproxy/zap.sh -daemon`
- Target: `http://127.0.0.1:5000`
- Scan mode: conventional spider with `maxChildren=10`, followed by passive scanning.
- Excluded: active scanning, authentication, WSO2, direct service ports, databases, RabbitMQ, and external URLs.
- Exit status: 0 for both completed scans.

The system `/usr/bin/zaproxy` wrapper starts the GUI. The recorded scans used the package launcher in headless daemon mode.

## Initial result counts

| Risk | Alert instances | De-duplicated cause |
|---|---:|---|
| Medium | 3 | Missing `Content-Security-Policy` on gateway fallback responses |
| Low | 6 | Nginx version disclosure in fallback response content and the `Server` header |
| High | 0 | None |
| Informational | 0 | None |

The initial alerts were observed on `/`, `/robots.txt`, and `/sitemap.xml`. Direct local requests confirmed that the fallback responses lacked CSP and exposed the Nginx banner.

## Remediation and verification

The gateway was changed to set `server_tokens off` and to add this response policy:

```text
default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'
```

The verification scan found no missing-CSP-header alert and no Nginx version-disclosure alert. It found three Medium instances of `CSP: Failure to Define Directive with No Fallback` on the same three fallback paths. The header is now present, and the remaining alert concerns CSP policy completeness rather than absence of a policy. No application exploit was reproduced.

| Verification risk | Alert instances | Status |
|---|---:|---|
| Medium | 3 | Remaining CSP policy-completeness hardening item |
| Low | 0 | Nginx version disclosure remediated by `server_tokens off` |
| High | 0 | None |

The remaining CSP alert is tracked as gateway hardening. It is not a reproduced application exploit and is not V8.

## Evidence handling

Complete ZAP JSON reports, response data, and daemon logs remain local in:

- `/tmp/cravedrop-zap-20260918-152734` (initial scan)
- `/tmp/cravedrop-zap-final-20260918T113513Z` (verification scan)

They are not committed because scanner output can contain response data. This summary contains no cookies, authorization headers, codes, tokens, or personal data.
