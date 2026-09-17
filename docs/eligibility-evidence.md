# Eligibility evidence

Recorded for the Secure Software Development assignment.

## Application eligibility

| Check | Result |
|---|---|
| Existing web/mobile application | Yes. CraveDrop is a food-ordering and delivery platform. |
| Original repository | https://github.com/nmdra/CraveDrop |
| Original default branch | `main` |
| Selected baseline | `cb68a377f5b8cdc3b12f86883ac6fb703ef5e405` |
| Default-branch date | 2025-07-17T15:50:51Z |
| Newest visible upstream ref checked | 2026-02-14T10:48:50Z |
| Semester start used | July 2026 |
| Date requirement | Satisfied by the checked refs |
| Deliberately vulnerable teaching application | No. It is a normal food-ordering/delivery application. |
| Secured/improved version identified | None identified for the original `nmdra/CraveDrop` project during the repository search. |
| Licence | MIT |

## Evidence sources

- GitHub repository metadata: `gh api repos/nmdra/CraveDrop`
- Default-branch commit: `gh api repos/nmdra/CraveDrop/commits/main`
- Branch refs: `gh api --paginate repos/nmdra/CraveDrop/branches`
- Local baseline tag: `git show -s --format='%H%n%cI%n%s' baseline-vulnerable`
- Original project README and source at `baseline-vulnerable`

## Access and privacy decision

The modified repository is private during development. Examiner access will be granted if the course permits private repositories with collaborator access. If the course requires a public GitHub link, the repository will be made public only after a secret scan and evidence review.
