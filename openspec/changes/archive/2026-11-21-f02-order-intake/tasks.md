## 1. Approve contract

- [x] 1.1 Phạm Công Khánh (90m) — Reconcile D-F02-1..8 against BOOYAH-20, verify strict OpenSpec validation and record independent approval of Hub/User/Order before migrating. Khánh confirmed on 20 November that Kiệt approved in place of Hải; the design records the approval evidence and reviewer substitution. The repeat AI review verified rule/scenario coverage and task ownership without changing business rules.

## 2. Authentication and persistence

- [x] 2.1 Lý Huỳnh Minh Đăng (90m) — Implement sign-in, sign-out and the session/role/hub guard. Verify denied roles and expired sessions.
- [x] 2.2 Lý Huỳnh Minh Đăng (90m) — Add demo account seed fixtures using the shared schema and verify two-hub isolation against the combined app.
- [x] 2.3 Phạm Công Khánh (90m) — Add the approved shared migration and synthetic order fixtures. Verify migration and seed in an empty disposable database.
- [x] 2.4 Phạm Công Khánh (120m) — Add shared order validation and create/list/detail endpoints. Verify filtering, pagination, duplicate codes and hub isolation.
- [x] 2.5 Phạm Công Khánh (90m) — Add editing and cancellation. Verify cancellation persists and stale edits return a conflict.
- [x] 2.6 Phạm Công Khánh (120m) — Add CSV template, parsing and approved transaction policy. Verify a valid 20-row file, a mixed-error file and duplicate races.

## 3. Interface and integration

- [x] 3.1 Lý Huỳnh Minh Đăng (120m) — Implement order list, filters, detail and manual entry screens. Verify field errors and saved records after reload. Implemented in PR #20 (`7327989`); [browser evidence](../../../../docs/test/BOOYAH-16-ui-integration.md#browser-capture-results) on `28e0cae` records validation, input retention and persistence. Source comparison on 20 November found no changes under `src/app/orders` since that capture build. Final integrated acceptance remains task 3.3.
- [x] 3.2 Lý Huỳnh Minh Đăng (120m) — Implement CSV, edit and cancel screens. Verify visible row errors and confirmation with a reason. The same PR and browser evidence cover row errors, atomic import, stale edits, edit persistence and cancellation reason/status after reload. Prototype differences and keyboard/console follow-up remain open in the handoff; this checkbox does not claim their acceptance or completion of task 3.3.
- [x] 3.3 Nguyễn Thành Trung (120m) — Exercise the combined roles, persistence and import cases. Record actual test, lint, typecheck and build output. Final verified application `5d67ce821e6c77c1952c8191a5086b0d8e712171`: original16 scenarios and43 permission checks pass; unit18/18, integration11/11, lint/typecheck/build pass. [Actual final evidence](../../../../docs/test/f02-verification/final-5d67ce8/README.md) and [report/recorded requester closure](../../../../docs/test/PA3-F02-verification.md#requester-reported-closure-of-4142--2026-11-21). Requester reports all closure/acceptance checks passed on21November; reviewer metadata/handout not supplied, no named approval inferred.
