# BOOYAH-18 — F02 Auth Integration Checklist
Performed by: Codex (local verification). Reviewed by: pending (Phạm Công Khánh assigned). Edited by: Codex.

## Contract inputs
Performed by: Codex. Reviewed by: pending. Edited by: Codex.

The 2026-11-19 check used auth commit `f56c0ac` (PR #12) with local BOOYAH-16 order page wiring. The F02 contract grants access to Dispatchers with an assigned hub and requires order APIs to return 404 for out-of-hub order IDs. BOOYAH-19 owns order persistence, the shared migration, and integration of the guard into the order API.

## Acceptance checks
Performed by: Codex. Reviewed by: pending. Edited by: Codex.

| AC | Check on the combined build | Result |
| --- | --- | --- |
| 1 | Verified through HTTP on the production build. Both Dispatchers received 200 and the S07-01 markup on two consecutive requests with the same session. Admin and Rider received 403 twice and no S07-01 markup. | Page checks passed. Order API roles unverified. |
| 2 | Verify cross-hub read and update denial and unchanged data against actual orders from two hubs. | Unverified. BOOYAH-19 order API absent. |
| 3 | Anonymous Orders returned 307 to the sign-in page. After each account signed out, its previous session returned 307. PostgreSQL reported zero Session rows after sign-out. | Page/session checks passed. Order API 401 and expiry by elapsed time unverified. |
| 4 | Prisma validate, db push and generate against a disposable loopback database. Call the real seed helper twice with two synthetic hubs and count four users and four credential accounts. See the README for local seed restrictions. | Seed counts passed. Production seed restriction reviewed in code. |

The fourth immediate sign-in returned 429. Dispatcher B passed when retried after the rate-limit window. The disposable database was stopped after testing. Retest with BOOYAH-19 on the demo commit before final acceptance.

On 20 November 2026, a wrong password returned 401 and set no cookie. A valid Dispatcher session opened Orders with 200. After the fixture's persisted hub assignment was removed, the same session received 403 even with caller-supplied role and hub headers. The response omitted the Orders workspace. The fixture's assignment was restored, and signing out made the old session redirect to sign-in with 307. These page checks used the BOOYAH-16 local build and disposable PostgreSQL. The order API route remained absent.

## Post-merge verification — 20 November 2026
Performed by: Lý Huỳnh Minh Đăng (AI-assisted verification). Reviewed by: pending. Edited by: Codex.

- PR #12 merged the auth and order API into dev at `da7dc5e`. Verification used dev `b220ccb` with local BOOYAH-16 page wiring. The follow-up PR contains documentation and task status.
- The combined integration suite passed 10/10 on a fresh disposable PostgreSQL database configured with UTC. Migration and seed produced two synthetic hubs, four staff accounts and 50 orders. The suite verified seed replay, 401 without a session, 403 for Admin and Rider, and 404 for Dispatcher access to another hub's orders. It also verified current hub authorization, session reload, expiry and sign-out.
- Lint, typecheck, 16 unit tests and the production build passed on that local build.
- The Asia/Bangkok run returned a null timestamp for an order at the year-0001 boundary. Use the documented UTC local database setting for the demo. Non-UTC behavior remains open for BOOYAH-19 follow-up.
