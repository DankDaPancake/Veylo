## 1. Approve contract

- [ ] 1.1 Phạm Công Khánh (90m) — Reconcile D-F02-1..8 against BOOYAH-20, verify strict OpenSpec validation and capture Trần Lê Hải’s review of Hub/User/Order before migrating. Local contract confirmation from Khánh is recorded in the design.

## 2. Authentication and persistence

- [ ] 2.1 Lý Huỳnh Minh Đăng (90m) — Implement sign-in, sign-out and the session/role/hub guard. Verify denied roles and expired sessions.
- [ ] 2.2 Lý Huỳnh Minh Đăng (90m) — Add demo account seed fixtures using the shared schema and verify two-hub isolation against the combined app.
- [ ] 2.3 Phạm Công Khánh (90m) — Add the approved shared migration and synthetic order fixtures. Verify migration and seed in an empty disposable database.
- [ ] 2.4 Phạm Công Khánh (120m) — Add shared order validation and create/list/detail endpoints. Verify filtering, pagination, duplicate codes and hub isolation.
- [ ] 2.5 Phạm Công Khánh (90m) — Add editing and cancellation. Verify cancellation persists and stale edits return a conflict.
- [ ] 2.6 Phạm Công Khánh (120m) — Add CSV template, parsing and approved transaction policy. Verify a valid 20-row file, a mixed-error file and duplicate races.

## 3. Interface and integration

- [ ] 3.1 Lý Huỳnh Minh Đăng (120m) — Implement order list, filters, detail and manual entry screens. Verify field errors and saved records after reload.
- [ ] 3.2 Lý Huỳnh Minh Đăng (120m) — Implement CSV, edit and cancel screens. Verify visible row errors and confirmation with a reason.
- [ ] 3.3 Nguyễn Thành Trung (120m) — Exercise the combined roles, persistence and import cases. Record actual test, lint, typecheck and build output.
