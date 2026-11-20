"""Focused F02 prototype interaction checks against the isolated local server."""
# ponytail: workstation-local acceptance evidence; use portable E2E if repeated.
import asyncio
import hashlib
import json
import os
import subprocess
import time
from pathlib import Path

from playwright.async_api import async_playwright, expect

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
BASE = "http://127.0.0.1:3017"
RUN = str(int(time.time()))
RESULT = {"base": BASE, "run": RUN, "baseCommit": subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip(),
          "worktree": "uncommitted prototype correction; not final accepted demo revision", "cases": [], "pageErrors": []}


def csv(codes, invalid=False):
    header = "order_code,recipient_name,recipient_phone,delivery_address,window_start,window_end,weight_kg"
    rows = [f"{code},Synthetic Preview Recipient,0900000017,17 Synthetic Street,2026-11-20 09:00,2026-11-20 10:00,{'-1' if invalid and i == 1 else '1'}" for i, code in enumerate(codes)]
    return (header + "\n" + "\n".join(rows) + "\n").encode()


async def api(context, path, method="GET", data=None):
    response = await context.request.fetch(BASE + path, method=method, data=data, headers={"origin": BASE})
    return response.status, await response.json()


async def count(context, query):
    status, data = await api(context, "/api/orders?q=" + query)
    assert status == 200
    return data["total"]


async def shot(page, name):
    await page.screenshot(path=str(HERE / name), animations="disabled")


async def keyboard_activate(page, locator):
    for _ in range(150):
        if await locator.evaluate("e => e === document.activeElement"):
            await page.keyboard.press("Enter")
            return
        await page.keyboard.press("Tab")
    raise AssertionError("Core action was not reachable within a full tab cycle")


async def summary(page, field):
    alert = page.get_by_role("alert").first
    await expect(alert).to_be_focused()
    link = alert.locator(f'a[href="#{field}"]')
    await keyboard_activate(page, link)
    await expect(page.locator("#" + field)).to_be_focused()


async def picker(page, text):
    await page.goto(BASE + "/orders")
    await expect(page.get_by_role("button", name="Import CSV", exact=True)).to_be_enabled()
    await page.get_by_role("button", name="Import CSV", exact=True).click()
    await page.get_by_label("CSV file").set_input_files({"name": "synthetic.csv", "mimeType": "text/csv", "buffer": text})
    async with page.expect_response(lambda r: r.request.method == "POST" and r.url.endswith("/api/orders/import/preview")) as response:
        await keyboard_activate(page, page.get_by_role("button", name="Check CSV", exact=True))
    return (await response.value).status


async def open_order(page, code):
    await page.goto(BASE + "/orders")
    await page.get_by_label("Search orders").fill(code)
    await page.get_by_role("button", name="Apply filters", exact=True).click()
    link = page.get_by_role("button", name=f"Open order {code}", exact=True)
    await expect(link).to_be_visible()
    await link.click()
    await expect(page.get_by_role("heading", name=f"Order {code}", exact=True)).to_be_visible()


async def view_checks(page, context, width, height):
    await page.set_viewport_size({"width": width, "height": height})
    prefix = f"PAR-{RUN}-{width}"
    await page.goto(BASE + "/orders")
    await expect(page.get_by_role("button", name="Create order", exact=True)).to_be_enabled()
    await keyboard_activate(page, page.get_by_role("button", name="Create order", exact=True))
    await keyboard_activate(page, page.get_by_role("button", name="Save order", exact=True))
    await summary(page, "order_code")
    fields = {"order_code": prefix, "recipient_name": "Synthetic Prototype Recipient", "recipient_phone": "bad",
              "delivery_address": "17 Synthetic Street", "window_start": "0001-01-01T07:00" if width == 1440 else "2026-11-20T09:00",
              "window_end": "0001-01-01T08:00" if width == 1440 else "2026-11-20T10:00", "weight_kg": "1.5"}
    for field, value in fields.items():
        await page.locator("#" + field).fill(value)
    await keyboard_activate(page, page.get_by_role("button", name="Save order", exact=True))
    await summary(page, "recipient_phone")
    assert await page.locator("#order_code").input_value() == prefix
    await shot(page, f"{width}-create-errors.png")
    await page.locator("#recipient_phone").fill("0900000017")
    async with page.expect_response(lambda r: r.request.method == "POST" and r.url.endswith("/api/orders")) as created:
        await keyboard_activate(page, page.get_by_role("button", name="Save order", exact=True))
    saved = await (await created.value).json()
    await expect(page.get_by_role("heading", name=f"Order {prefix}", exact=True)).to_be_visible()
    assert "Order created" in await page.locator("main").inner_text()
    await shot(page, f"{width}-created-detail.png")
    await page.get_by_role("button", name="Edit order", exact=True).click()
    code_input = page.locator("#order_code")
    assert await code_input.input_value() == prefix
    assert await code_input.evaluate("e => e.readOnly || e.disabled")
    await page.locator("#note").fill("Discarded synthetic note")
    await page.get_by_role("button", name="Discard and return", exact=True).click()
    _, unchanged = await api(context, "/api/orders/" + saved["id"])
    assert unchanged["version"] == saved["version"] and unchanged["note"] == saved["note"]
    await page.get_by_role("button", name="Edit order", exact=True).click()
    await page.locator("#recipient_phone").fill("wrong")
    await keyboard_activate(page, page.get_by_role("button", name="Save changes", exact=True))
    await summary(page, "recipient_phone")
    await page.locator("#recipient_phone").fill("0900000017")
    await page.locator("#note").fill("Saved synthetic prototype note")
    await keyboard_activate(page, page.get_by_role("button", name="Save changes", exact=True))
    await expect(page.get_by_role("heading", name=f"Order {prefix}", exact=True)).to_be_visible()
    assert "Saved synthetic prototype note" in await page.locator("main").inner_text()
    await page.reload()
    await open_order(page, prefix)
    await page.get_by_role("button", name="Cancel order", exact=True).click()
    await page.get_by_role("button", name="Keep order", exact=True).click()
    _, current = await api(context, "/api/orders/" + saved["id"])
    assert current["status"] == "NEW" and current["version"] == saved["version"] + 1
    await page.get_by_role("button", name="Cancel order", exact=True).click()
    await page.locator("#reason").fill("x")
    await keyboard_activate(page, page.get_by_role("button", name="Confirm cancellation", exact=True))
    await summary(page, "reason")
    assert await page.locator("#reason").input_value() == "x"
    await page.locator("#reason").fill("Synthetic prototype cancellation")
    await keyboard_activate(page, page.get_by_role("button", name="Confirm cancellation", exact=True))
    await expect(page.get_by_role("heading", name=f"Order {prefix}", exact=True)).to_be_visible()
    assert "CANCELLED" in await page.locator("main").inner_text()
    await shot(page, f"{width}-cancelled-detail.png")
    _, after = await api(context, "/api/orders/" + saved["id"])
    assert after["window_start"] == saved["window_start"] and after["order_code"] == prefix
    assert after["cancellation_reason"] == "Synthetic prototype cancellation"
    RESULT["cases"].append({"case": "mutation detail, discard, linked errors and keyboard", "viewport": [width, height], "result": "PASS", "orderId": saved["id"]})
    codes = [f"{prefix}-CSV-{i}" for i in range(20)]
    assert await picker(page, csv(codes)) == 200
    await expect(page.get_by_role("button", name="Import 20 orders", exact=True)).to_be_visible()
    assert "0 orders saved" in await page.locator("main").inner_text()
    assert await count(context, prefix + "-CSV-") == 0
    await shot(page, f"{width}-preview.png")
    await keyboard_activate(page, page.get_by_role("button", name="Cancel import", exact=True))
    assert await count(context, prefix + "-CSV-") == 0
    assert "0 orders imported" in await page.locator("main").inner_text()
    assert await picker(page, csv(codes)) == 200
    async with page.expect_response(lambda r: r.request.method == "POST" and r.url.endswith("/api/orders/import")) as committed:
        await keyboard_activate(page, page.get_by_role("button", name="Import 20 orders", exact=True))
    assert (await committed.value).status == 201
    await expect(page.get_by_role("button", name="View orders", exact=True)).to_be_visible()
    assert await count(context, prefix + "-CSV-") == 20
    await shot(page, f"{width}-complete.png")
    await keyboard_activate(page, page.get_by_role("button", name="View orders", exact=True))
    dup = [prefix + "-DUP", prefix.lower() + "-dup", codes[0]]
    assert await picker(page, csv(dup, True)) == 400
    await expect(page.get_by_role("alert").first).to_be_focused()
    main = await page.locator("main").inner_text()
    assert all(str(row) in main for row in [2, 3, 4]) and "weight_kg" in main and "order_code" in main
    assert "0 orders imported" in main and await count(context, prefix + "-DUP") == 0
    await shot(page, f"{width}-mixed-diagnostics.png")
    await page.get_by_role("button", name="Choose a replacement CSV", exact=True).click()
    assert await page.get_by_role("button", name="Import 20 orders", exact=True).count() == 0
    replacement = f"{prefix}-REPLACE"
    await page.get_by_label("CSV file").set_input_files({"name": "replacement.csv", "mimeType": "text/csv", "buffer": csv([replacement])})
    await page.get_by_role("button", name="Check CSV", exact=True).click()
    await expect(page.get_by_role("button", name="Import 1 orders", exact=True)).to_be_visible()
    await page.get_by_role("button", name="Cancel import", exact=True).click()
    assert await count(context, replacement) == 0

    RESULT["cases"].append({"case": "20-row preview/cancel/confirm, mixed diagnostics", "viewport": [width, height], "result": "PASS"})


async def main():
    assert os.environ.get("VEYLO_DEMO_PASSWORD")
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path="/usr/bin/google-chrome", headless=True)
        RESULT["browser"] = browser.version
        context = await browser.new_context()
        page = await context.new_page()
        page.on("pageerror", lambda e: RESULT["pageErrors"].append(str(e)))
        await page.goto(BASE + "/sign-in?next=%2Forders")
        await page.get_by_label("Email").fill("dispatcher-a@example.test")
        await page.get_by_label("Password").fill(os.environ["VEYLO_DEMO_PASSWORD"])
        await page.get_by_role("button", name="Sign in", exact=True).click()
        await page.wait_for_url(lambda url: url.split("?")[0] == BASE + "/orders")
        await expect(page.get_by_role("button", name="Create order", exact=True)).to_be_enabled()
        for width, height in [(1440, 900), (1280, 720)]:
            await view_checks(page, context, width, height)
            print(f"{width}x{height}: PASS", flush=True)
        # Controlled API requests model a second dispatcher/tab; the attempted action remains UI-driven.
        claim_codes = [f"PAR-{RUN}-CLAIM", f"PAR-{RUN}-ROLLBACK"]
        assert await picker(page, csv(claim_codes)) == 200
        fixture = {"order_code": claim_codes[0], "recipient_name": "Synthetic Race Recipient", "recipient_phone": "0900000017",
                   "delivery_address": "17 Synthetic Race Street", "window_start": "2026-11-20 09:00", "window_end": "2026-11-20 10:00", "weight_kg": "1"}
        status, _ = await api(context, "/api/orders", "POST", fixture)
        assert status == 201
        async with page.expect_response(lambda r: r.request.method == "POST" and r.url.endswith("/api/orders/import")) as conflict:
            await keyboard_activate(page, page.get_by_role("button", name="Import 2 orders", exact=True))
        assert (await conflict.value).status == 409
        await expect(page.get_by_role("alert").first).to_be_focused()
        assert "0 orders imported" in await page.locator("main").inner_text()
        assert await count(context, claim_codes[1]) == 0
        await expect(page.get_by_role("button", name="Choose a replacement CSV", exact=True)).to_be_visible()
        await shot(page, "confirmation-conflict.png")
        RESULT["cases"].append({"case": "code claimed after preview, atomic rollback and replacement", "result": "PASS"})
        fixture["order_code"] = f"PAR-{RUN}-STALE"
        status, order = await api(context, "/api/orders", "POST", fixture)
        assert status == 201
        await open_order(page, fixture["order_code"])
        await page.get_by_role("button", name="Edit order", exact=True).click()
        await page.locator("#note").fill("Stale synthetic attempt")
        status, newest = await api(context, "/api/orders/" + order["id"], "PATCH", {"version": order["version"], "note": "Newest synthetic note"})
        assert status == 200
        async with page.expect_response(lambda r: r.request.method == "PATCH" and r.url.endswith(order["id"])) as stale:
            await page.get_by_role("button", name="Save changes", exact=True).click()
        assert (await stale.value).status == 409
        await page.get_by_role("button", name="Reload order", exact=True).click()
        await expect(page.get_by_role("heading", name=f"Order {fixture['order_code']}", exact=True)).to_be_visible()
        assert "Newest synthetic note" in await page.locator("main").inner_text()
        await page.get_by_role("button", name="Cancel order", exact=True).click()
        await page.locator("#reason").fill("Stale synthetic cancellation")
        status, _ = await api(context, "/api/orders/" + order["id"] + "/cancel", "POST", {"version": newest["version"], "reason": "Original synthetic cancellation"})
        assert status == 200
        async with page.expect_response(lambda r: r.request.method == "POST" and r.url.endswith("/cancel")) as stale_cancel:
            await page.get_by_role("button", name="Confirm cancellation", exact=True).click()
        assert (await stale_cancel.value).status == 409
        await page.get_by_role("button", name="Reload order", exact=True).click()
        await expect(page.get_by_role("heading", name=f"Order {fixture['order_code']}", exact=True)).to_be_visible()
        assert "CANCELLED" in await page.locator("main").inner_text()
        assert "Original synthetic cancellation" in await page.locator("main").inner_text()
        assert await page.get_by_role("button", name="Edit order", exact=True).count() == 0
        await shot(page, "stale-cancellation-recovery.png")
        RESULT["cases"].append({"case": "stale edit and cancellation recovery preserves newest note/original reason", "result": "PASS"})
        lost_code = f"PAR-{RUN}-LOST"
        assert await picker(page, csv([lost_code])) == 200
        status, _ = await api(context, "/api/auth/sign-out", "POST", {})
        assert status == 200
        async with page.expect_response(lambda r: r.request.method == "POST" and r.url.endswith("/api/orders/import")) as lost:
            await page.get_by_role("button", name="Import 1 orders", exact=True).click()
        assert (await lost.value).status == 401
        await page.get_by_role("link", name="Sign in", exact=True).click()
        await page.get_by_label("Email").fill("dispatcher-a@example.test")
        await page.get_by_label("Password").fill(os.environ["VEYLO_DEMO_PASSWORD"])
        await page.get_by_role("button", name="Sign in", exact=True).click()
        await page.wait_for_url(lambda url: url.split("?")[0] == BASE + "/orders")
        await expect(page.get_by_role("button", name="Create order", exact=True)).to_be_enabled()
        assert await count(context, lost_code) == 0
        await expect(page.get_by_role("button", name="Import CSV", exact=True)).to_be_enabled()
        RESULT["cases"].append({"case": "access lost after preview returns401; sign-in does not replay import", "result": "PASS"})
        assert not RESULT["pageErrors"], RESULT["pageErrors"]
        await browser.close()


try:
    asyncio.run(main())
finally:
    RESULT["sourceSha256"] = {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in
                             ["src/app/orders/workspace.tsx", "src/lib/orders/csv.ts", "src/lib/orders/service.ts"]}
    (HERE / "browser-results.json").write_text(json.dumps(RESULT, indent=2) + "\n")
