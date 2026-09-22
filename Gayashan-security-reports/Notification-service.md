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

dottie  2.0.4 - 2.0.6
Severity: moderate
dottie is vulnerable to Prototype Pollution bypass via non-first path segments in set() and transform() - https://github.com/advisories/GHSA-r5mx-6wc6-7h9w
fix available via `npm audit fix`
node_modules/dottie

lodash  <=4.17.23
Severity: high
lodash vulnerable to Code Injection via `_.template` imports key names - https://github.com/advisories/GHSA-r5fr-rjxr-66jc
lodash vulnerable to Prototype Pollution via array path bypass in `_.unset` and `_.omit` - https://github.com/advisories/GHSA-f23m-r3pf-42rh
Lodash has Prototype Pollution Vulnerability in `_.unset` and `_.omit` functions - https://github.com/advisories/GHSA-xxjr-mmjv-4gpg
fix available via `npm audit fix`
node_modules/lodash

minimatch  <=3.1.3
Severity: high
minimatch has a ReDoS via repeated wildcards with non-matching literal in pattern - https://github.com/advisories/GHSA-3ppc-4f35-3m26
minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments - https://github.com/advisories/GHSA-7r86-cg39-jmmj
minimatch ReDoS: nested *() extglobs generate catastrophically backtracking regular expressions - https://github.com/advisories/GHSA-23c5-xmqv-rm74
fix available via `npm audit fix`
node_modules/minimatch

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

sequelize  0.0.0-development || >=3.30.1
Severity: high
Sequelize v6 Vulnerable to SQL Injection via JSON Column Cast Type - https://github.com/advisories/GHSA-6457-6jrx-69cr
Depends on vulnerable versions of uuid
fix available via `npm audit fix`
node_modules/sequelize

underscore  <=1.13.7
Severity: high
Underscore has unlimited recursion in _.flatten and _.isEqual, potential for DoS attack - https://github.com/advisories/GHSA-qpx9-hpmf-5gmw
fix available via `npm audit fix`
node_modules/underscore

uuid  <11.1.1
Severity: moderate
uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided - https://github.com/advisories/GHSA-w5hq-g745-h8pq
fix available via `npm audit fix`
node_modules/uuid

validator  <=13.15.20
Severity: high
validator.js has a URL validation bypass vulnerability in its isURL function - https://github.com/advisories/GHSA-9965-vmph-33xx
Validator is Vulnerable to Incomplete Filtering of One or More Instances of Special Elements - https://github.com/advisories/GHSA-vghf-hv5q-vc2g
fix available via `npm audit fix`
node_modules/validator