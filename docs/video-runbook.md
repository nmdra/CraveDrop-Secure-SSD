# Video runbook

Target duration: 17 to 18 minutes. Do not exceed 20 minutes.

## Before recording

1. Reset the synthetic fixtures.
2. Start only the services needed for each demonstration.
3. Check that browser developer tools, terminal history, and logs show no secrets.
4. Use redacted evidence files when live baseline services are unavailable.
5. Record the unlisted YouTube URL in `README.txt` after upload.

## Timeline

| Time | Presenter | Content |
|---|---|---|
| 0:00–1:00 | All | Team, project, eligibility, immutable baseline, and method. |
| 1:00–3:00 | Aluthwaththa | Synthetic fixtures, evidence rules, and distinct-finding matrix. |
| 3:00–5:00 | Dharmasiri | V1 payment authentication and V2 order BOLA before and after. |
| 5:00–7:00 | Dharmasiri | V3 mass assignment before and after. |
| 7:00–9:00 | Sanjeewa | V4 delivery mutation and V5 driver administration before and after. |
| 9:00–11:00 | Sanjeewa | V6 amount and paid-state manipulation before and after. |
| 11:00–13:00 | Hansaja | V7 token exposure before and after. |
| 13:00–16:00 | Hansaja | WSO2 Authorization Code with PKCE, protected session, and invalid-state control. |
| 16:00–17:00 | Aluthwaththa | npm audit triage, deferred ZAP status, residual risks, and prevention. |
| 17:00–18:00 | All | Contributions, repository, report, and conclusion. |

## Required demonstrations

- Identify `baseline-vulnerable` before every before-state capture.
- Show one attack and one valid authorized control for each V1–V7 finding.
- Do not display JWTs, cookies, authorization codes, refresh tokens, credentials, or real data.
- Show the WSO2 callback without provider tokens in the URL.
- Show that the session uses HttpOnly cookies and reaches the protected endpoint.
- State that ZAP is deferred if a scan result is still unavailable. Do not claim a scan result.

## Closing checklist

- Verify the final runtime is below 20 minutes.
- Upload as an unlisted YouTube video.
- Add the exact URL to `README.txt`.
- Verify the URL in a private browser session.
