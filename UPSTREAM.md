# Upstream application record

## Original project

- **Project:** CraveDrop
- **Original repository:** https://github.com/nmdra/CraveDrop
- **Licence:** MIT
- **Application type:** Food-ordering and delivery platform using a microservice architecture
- **Selected original baseline:** `cb68a377f5b8cdc3b12f86883ac6fb703ef5e405`
- **Baseline tag in modified repository:** `baseline-vulnerable`
- **Baseline timestamp:** 2025-07-17 21:20:51 +05:30 (`2025-07-17T15:50:51Z`)
- **Semester start used for eligibility comparison:** July 2026

## Eligibility evidence

The original repository's default branch was `main`. The GitHub API reported the default-branch commit as:

```text
cb68a377f5b8cdc3b12f86883ac6fb703ef5e405  2025-07-17T15:50:51Z
```

The visible upstream branches were checked with `gh api repos/nmdra/CraveDrop/branches`. The newest visible branch ref at the time of recording was:

```text
ce8dff9885d5f498a295ad32432681b3553642c5  2026-02-14T10:48:50Z
```

Both dates are before the July 2026 semester start. The selected baseline is the original default-branch tip and is preserved unchanged in this repository. Dependabot commits and other upstream branches are not used as the modified-project baseline.

The upstream project description identifies it as a food-ordering and delivery platform. It is not WebGoat, DVWA, or another application intentionally created to teach vulnerabilities. A GitHub repository search on the recording date found similarly named independent repositories, but no identified secured/improved version of `nmdra/CraveDrop`.

## Reproduction commands

Run these commands from a clean checkout with GitHub CLI access:

```bash
gh api repos/nmdra/CraveDrop --jq \
  '{full_name,html_url,license:(.license.spdx_id // null),default_branch,created_at,pushed_at}'
gh api repos/nmdra/CraveDrop/commits/main --jq \
  '{sha,date:.commit.committer.date,message:.commit.message}'
gh api --paginate repos/nmdra/CraveDrop/branches --jq \
  '.[] | [.name,.commit.sha] | @tsv'
```

The modified repository preserves the vulnerable source at the baseline tag:

```bash
git show baseline-vulnerable:README.md
git show -s --format='%H%n%cI%n%s' baseline-vulnerable
```

## Modified repository

- **Repository:** https://github.com/nmdra/CraveDrop-Secure-SSD
- **Visibility:** Private, with examiner access to be granted if permitted by the course
- **Baseline tag:** `baseline-vulnerable`
- **OIDC provider planned for the local demonstration:** WSO2 Identity Server 7.1.0

No credentials, tokens, environment files, or real customer data are included in this record.
