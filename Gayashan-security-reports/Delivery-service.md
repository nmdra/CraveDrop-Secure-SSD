# npm audit report
   
body-parser  2.0.0 - 2.2.2
Severity: moderate
body-parser is vulnerable to denial of service when url encoding is used - https://github.com/advisories/GHSA-wqch-xfxh-vrr4
body-parser vulnerable to denial of service when invalid limit value silently disables size enforcement - https://github.com/advisories/GHSA-v422-hmwv-36x6
fix available via `npm audit fix`
node_modules/body-parser

brace-expansion  <=1.1.17
Severity: high
brace-expansion Regular Expression Denial of Service vulnerability - https://github.com/advisories/GHSA-v6h2-p8h4-qcjw
brace-expansion: Zero-step sequence causes process hang and memory exhaustion - https://github.com/advisories/GHSA-f886-m6hf-6m8v
brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups - https://github.com/advisories/GHSA-3jxr-9vmj-r5cp
brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash - https://github.com/advisories/GHSA-mh99-v99m-4gvg
brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation - https://github.com/advisories/GHSA-rgw5-rvv9-x895
fix available via `npm audit fix`
node_modules/brace-expansion

minimatch  <=3.1.3
Severity: high
minimatch has a ReDoS via repeated wildcards with non-matching literal in pattern - https://github.com/advisories/GHSA-3ppc-4f35-3m26
minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments - https://github.com/advisories/GHSA-7r86-cg39-jmmj
minimatch ReDoS: nested *() extglobs generate catastrophically backtracking regular expressions - https://github.com/advisories/GHSA-23c5-xmqv-rm74
fix available via `npm audit fix`
node_modules/minimatch

morgan  <=1.11.0
Severity: moderate
morgan vulnerable to Log Forging via unneutralized control characters in :remote-user - https://github.com/advisories/GHSA-4vj7-5mj6-jm8m
morgan vulnerable to Log Forging via unescaped Unicode line separators - https://github.com/advisories/GHSA-jxfw-x594-9x9m
Depends on vulnerable versions of on-headers
fix available via `npm audit fix`
node_modules/morgan

on-headers  <1.1.0
on-headers is vulnerable to http response header manipulation - https://github.com/advisories/GHSA-76c9-3jph-rj3q
fix available via `npm audit fix`
node_modules/on-headers

path-to-regexp  8.0.0 - 8.3.0
Severity: high
path-to-regexp vulnerable to Denial of Service via sequential optional groups - https://github.com/advisories/GHSA-j3q9-mxjg-w52f
path-to-regexp vulnerable to Regular Expression Denial of Service via multiple wildcards - https://github.com/advisories/GHSA-27v5-c462-wpq7
fix available via `npm audit fix`
node_modules/path-to-regexp

picomatch  <=2.3.1
Severity: high
Picomatch: Method Injection in POSIX Character Classes causes incorrect Glob Matching - https://github.com/advisories/GHSA-3v7f-55p6-f55p
Picomatch has a ReDoS vulnerability via extglob quantifiers - https://github.com/advisories/GHSA-c2c7-rcm5-vvqj
fix available via `npm audit fix`
node_modules/picomatch

qs  <=6.15.3
Severity: moderate
qs's arrayLimit bypass in comma parsing allows denial of service - https://github.com/advisories/GHSA-w7fw-mj.com/advis.com/advisories/GHSA-6rw7-vpxm-498p
qs has a remotely triggerable DoS: qs.stringify crashes with TypeError on null/undefined entries in comma-format arrays when encodeValuesOnly is set - https://github.com/advisories/GHSA-q8mj-m7cp-5q26
qs: Denial of Service via Attacker Controlled isBuffer - https://github.com/advisories/GHSA-4mjr-xmp4-gh2g
fix available via `npm audit fix`
node_modules/qs

8 vulnerabilities (1 low, 3 moderate, 4 high)

To address all issues, run:
  npm audit fix
PS D:\Y4 S2\SSD\Assignment\CraveDrop-Secure-SSD\delivery-service> npm audit fix
npm notice This endpoint is being retired. Use the bulk advisory endpoint instead. See the following docs for more info: https://api-docs.npmjs.com/#tag/Audit

up to date, audited 153 packages in 2m

25 packages are looking for funding
  run `npm fund` for details

# npm audit report

body-parser  2.0.0 - 2.2.2
Severity: moderate
body-parser is vulnerable to denial of service when url encoding is used - https://github.com/advisories/GHSA-wqch-xfxh-vrr4
body-parser vulnerable to denial of service when invalid limit value silently disables size enforcement - https://github.com/advisories/GHSA-v422-hmwv-36x6
fix available via `npm audit fix`
node_modules/body-parser

brace-expansion  <=1.1.17
Severity: high
brace-expansion Regular Expression Denial of Service vulnerability - https://github.com/advisories/GHSA-v6h2-p8h4-qcjw 
brace-expansion: Zero-step sequence causes process hang and memory exhaustion - https://github.com/advisories/GHSA-f886-m6hf-6m8v
brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups - https://github.com/advisories/GHSA-3jxr-9vmj-r5cp
brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash - https://github.com/advisories/GHSA-mh99-v99m-4gvg
brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation - https://github.com/advisories/GHSA-rgw5-rvv9-x895
fix available via `npm audit fix`
node_modules/brace-expansion

minimatch  <=3.1.3
Severity: high
minimatch has a ReDoS via repeated wildcards with non-matching literal in pattern - https://github.com/advisories/GHSA-3ppc-4f35-3m26
minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments - https://github.com/advisories/GHSA-7r86-cg39-jmmj
minimatch ReDoS: nested *() extglobs generate catastrophically backtracking regular expressions - https://github.com/advisories/GHSA-23c5-xmqv-rm74
fix available via `npm audit fix`
node_modules/minimatch

morgan  <=1.11.0
Severity: moderate
morgan vulnerable to Log Forging via unneutralized control characters in :remote-user - https://github.com/advisories/GHSA-4vj7-5mj6-jm8m
morgan vulnerable to Log Forging via unescaped Unicode line separators - https://github.com/advisories/GHSA-jxfw-x594-9x9m
Depends on vulnerable versions of on-headers
fix available via `npm audit fix`
node_modules/morgan

on-headers  <1.1.0
on-headers is vulnerable to http response header manipulation - https://github.com/advisories/GHSA-76c9-3jph-rj3q      
fix available via `npm audit fix`
node_modules/on-headers

path-to-regexp  8.0.0 - 8.3.0
Severity: high
path-to-regexp vulnerable to Denial of Service via sequential optional groups - https://github.com/advisories/GHSA-j3q9-mxjg-w52f
path-to-regexp vulnerable to Regular Expression Denial of Service via multiple wildcards - https://github.com/advisories/GHSA-27v5-c462-wpq7
fix available via `npm audit fix`
node_modules/path-to-regexp

picomatch  <=2.3.1
Severity: high
Picomatch: Method Injection in POSIX Character Classes causes incorrect Glob Matching - https://github.com/advisories/GHSA-3v7f-55p6-f55p
Picomatch has a ReDoS vulnerability via extglob quantifiers - https://github.com/advisories/GHSA-c2c7-rcm5-vvqj        
fix available via `npm audit fix`
node_modules/picomatch

qs  <=6.15.3
Severity: moderate
qs's arrayLimit bypass in comma parsing allows denial of service - https://github.com/advisories/GHSA-w7fw-mjwx-w883   
qs's arrayLimit bypass in its bracket notation allows DoS via memory exhaustion - https://github.com/advisories/GHSA-6rw7-vpxm-498p
qs has a remotely triggerable DoS: qs.stringify crashes with TypeError on null/undefined entries in comma-format arrays when encodeValuesOnly is set - https://github.com/advisories/GHSA-q8mj-m7cp-5q26
qs: Denial of Service via Attacker Controlled isBuffer - https://github.com/advisories/GHSA-4mjr-xmp4-gh2g
fix available via `npm audit fix`
node_modules/qs