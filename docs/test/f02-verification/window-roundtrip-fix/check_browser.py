"""Focused local UI regression; fixtures are synthetic API-created NEW orders."""
# ponytail: local acceptance runner; promote to portable E2E only if repeated.
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
RESULT = {"base": BASE, "commit": subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip(),
          "applicationWorktree": "uncommitted correction on recorded HEAD; not final accepted demo commit", "cases": []}
RESULT["sourceSha256"] = {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in
                         ["src/app/orders/order-form.mjs", "src/app/orders/workspace.tsx", "src/tests/order-form.test.mjs"]}


async def open_order(page, code):
    await page.get_by_label("Search orders").fill(code)
    async with page.expect_response(lambda r: "/api/orders?" in r.url and r.request.method == "GET"):
        await page.get_by_role("button", name="Apply filters").click()
    link = page.get_by_role("button", name=f"Open order {code}", exact=True)
    await expect(link).to_be_visible()
    row = await link.locator("xpath=ancestor::tr").inner_text()
    await link.click()
    await page.locator('[data-screen-id="S07-02"]').wait_for()
    return row


async def main():
    assert os.environ.get("VEYLO_DEMO_PASSWORD"), "Set local demo password without logging it"
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path="/usr/bin/google-chrome", headless=True)
        RESULT["browser"] = browser.version
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()
        await page.goto(BASE + "/sign-in?next=%2Forders")
        await page.get_by_label("Email").fill("dispatcher-a@example.test")
        await page.get_by_label("Password").fill(os.environ["VEYLO_DEMO_PASSWORD"])
        await page.get_by_role("button", name="Sign in", exact=True).click()
        await page.wait_for_url("**/orders")
        await expect(page.get_by_role("button", name="Create order")).to_be_enabled()
        for label, start, end in [
            ("minimum", "0001-01-01 07:00", "0001-01-01 08:00"),
            ("ordinary", "2026-11-20 09:00", "2026-11-20 10:00"),
            ("maximum", "9999-12-31 23:58", "9999-12-31 23:59"),
        ]:
            code = f"FIX-WIN-{int(time.time())}-{label}"
            fixture = {"order_code": code, "recipient_name": "Synthetic Window Check", "recipient_phone": "0900000017",
                       "delivery_address": "17 Synthetic Window Street", "window_start": start, "window_end": end, "weight_kg": "1.5"}
            response = await context.request.post(BASE + "/api/orders", data=fixture)
            assert response.status == 201, f"Synthetic create failed: {response.status}"
            before = await response.json()
            if "order" in before:
                before = before["order"]
            await page.goto(BASE + "/orders")
            row = await open_order(page, code)
            assert start in row and end in row, row
            detail = await page.locator('[data-screen-id="S07-02"]').inner_text()
            assert start in detail and end in detail, detail
            await page.screenshot(path=str(HERE / f"{label}-detail.png"))
            await page.get_by_role("button", name="Edit order", exact=True).click()
            values = await page.locator('input[type="datetime-local"]').evaluate_all(
                "inputs => inputs.map(i => ({id:i.id,value:i.value,valid:i.checkValidity()}))")
            assert values == [{"id": "window_start", "value": start.replace(" ", "T"), "valid": True},
                              {"id": "window_end", "value": end.replace(" ", "T"), "valid": True}], values
            assert await page.locator('[data-screen-id="S08-01"]').evaluate("f => f.checkValidity()")
            assert await page.locator("#order_code").count() == 0
            await page.locator("#note").fill("Synthetic window roundtrip retest")
            await page.screenshot(path=str(HERE / f"{label}-edit.png"))
            async with page.expect_response(lambda r: "/api/orders/" in r.url and r.request.method == "PATCH") as saved:
                await page.get_by_role("button", name="Save order", exact=True).click()
            assert (await saved.value).status == 200
            await page.locator('[data-screen-id="S07-01"]').wait_for()
            await page.reload()
            await open_order(page, code)
            after_response = await context.request.get(BASE + "/api/orders/" + before["id"])
            assert after_response.status == 200
            after = await after_response.json()
            if "order" in after:
                after = after["order"]
            for key in ["id", "order_code", "window_start", "window_end", "status"]:
                assert after[key] == before[key], key
            assert after["version"] == before["version"] + 1
            assert after["note"] == "Synthetic window roundtrip retest"
            detail = await page.locator('[data-screen-id="S07-02"]').inner_text()
            assert start in detail and end in detail and after["note"] in detail
            await page.screenshot(path=str(HERE / f"{label}-after-reload.png"))
            RESULT["cases"].append({"label": label, "status": "PASS", "code": code, "orderId": before["id"],
                                    "fixtureMode": "synthetic API create; list/detail/edit/save/reload through production UI",
                                    "localStart": start, "localEnd": end, "inputs": values,
                                    "savedStart": after["window_start"], "savedEnd": after["window_end"],
                                    "beforeVersion": before["version"], "afterVersion": after["version"],
                                    "identityAndWindowsUnchanged": True})
            print(label + ": PASS", flush=True)
        await browser.close()


try:
    asyncio.run(main())
finally:
    (HERE / "browser-results.json").write_text(json.dumps(RESULT, indent=2) + "\n")
