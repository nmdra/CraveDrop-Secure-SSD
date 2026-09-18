# OWASP ZAP passive scan summary

## Scope

- Date: 2026-09-18 (local lab)
- Tool: OWASP ZAP 2.17.0
- Launcher: `/usr/share/zaproxy/zap.sh -daemon`
- Target: `http://127.0.0.1:5000`
- Scan mode: a conventional spider with `maxChildren=10`, followed by passive scanning.
- Excluded: active scanning, authentication, WSO2, direct service ports, databases, RabbitMQ, and external URLs.
- Exit status: 0

The system `/usr/bin/zaproxy` wrapper discards arguments and starts the GUI. The recorded scan used the package launcher above in headless daemon mode.

## Result counts

| Risk | Alert instances | De-duplicated cause |
|---|---:|---|
| Medium | 3 | Missing `Content-Security-Policy` on gateway fallback responses |
| Low | 6 | Nginx version disclosure in fallback response content and the `Server` header |
| High | 0 | None |
| Informational | 0 | None |

## Reviewed alerts

### Missing Content Security Policy

ZAP reported CWE-693 on `/`, `/robots.txt`, and `/sitemap.xml`. Each route returned a gateway `404` response without a CSP header. A direct local header request confirmed this result.

**Root cause:** The gateway does not set a CSP header for its fallback responses.

**Impact:** A CSP does not replace input validation or authorization. Its absence reduces browser-side defense against script injection if an affected HTML response later contains attacker-controlled content.

**Decision:** Track this as gateway hardening. It is not a reproduced application exploit and is not V8.

### Nginx version disclosure

ZAP reported CWE-497 on the same fallback responses. The response body and `Server` header exposed the Nginx product version. A direct local header request confirmed the header disclosure.

**Root cause:** The default gateway error response and server-token configuration expose the web-server banner.

**Impact:** The banner can help an attacker select product-specific attacks. It does not demonstrate a compromise.

**Decision:** Track this as gateway hardening. It is not a counted application vulnerability.

## Evidence handling

The complete ZAP JSON report, response data, and daemon log remain local in `/tmp/cravedrop-zap-20260918-152734`. They are not committed because scanner output can contain response data. This summary contains no cookies, authorization headers, codes, tokens, or personal data.

This completed result supersedes the deferred status in `evidence/tools/zap-deferred.txt`. That file remains as the accurate record of the earlier aborted Docker attempt.
