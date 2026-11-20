#!/usr/bin/env python3
"""Real-browser regressions for the F02 denied-navigation and file-reset fix.

Uses the documented local synthetic Dispatcher account for page access. Every
orders API request is intercepted and answered from in-memory fixtures.
"""
import asyncio
import json
import os
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

from playwright.async_api import async_playwright


HERE = Path(__file__).resolve().parent
BASE = "http://127.0.0.1:3020"
ORDERS = BASE + "/orders"
ORDER_ID = "browser-recovery"
MISSING_ID = "browser-missing"
results = []


def order(**changes):
    value = {
        "id": ORDER_ID,
        "order_code": "RECOVERY-01",
        "recipient_name": "Synthetic Recipient",
        "recipient_phone": "0901234567",
        "delivery_address": "Synthetic test address",
        "window_start": "2026-12-01T02:00:00.000Z",
        "window_end": "2026-12-01T04:00:00.000Z",
        "weight_kg": "2.50",
        "priority": "NORMAL",
        "note": "Synthetic fixture",
        "latitude": "10.776900",
        "longitude": "106.700900",
        "status": "NEW",
        "version": 1,
    }
    value.update(changes)
    return value


def ok_preview():
    return {
        "orders": [{"row": 2, "order_code": "CSV-RECOVERY-01", "recipient_name": "CSV Fixture"}],
        "total": 1,
        "valid": 1,
        "saved": 0,
    }


class OrderFixtures:
    def __init__(self):
        self.current = order()
        self.cancel_result = None
        self.preview_results = []
        self.import_results = []
        self.calls = []
        self.unexpected = []
        self.upload_names = []

    def reset_order(self, **changes):
        self.current = order(**changes)

    def cancel_with(self, status, body):
        self.cancel_result = (status, body)

    def preview_with(self, status, body):
        self.preview_results.append((status, body))

    def preview_ok(self):
        self.preview_with(200, ok_preview())

    def import_with(self, outcome):
        self.import_results.append(outcome)

    @staticmethod
    def upload_name(request):
        body = request.post_data_buffer or (request.post_data or "").encode()
        match = re.search(rb'filename="([^"]+)"', body)
        return match.group(1).decode("utf-8") if match else None

    async def handle(self, route):
        request = route.request
        path = urlsplit(request.url).path
        call = {"method": request.method, "path": path, "status": None}
        if path.startswith("/api/orders/import") and request.method == "POST":
            call["upload_filename"] = self.upload_name(request)
            self.upload_names.append(call["upload_filename"])
        self.calls.append(call)

        if path == "/api/orders" and request.method == "GET":
            body = {
                "orders": [self.current, order(id=MISSING_ID, order_code="MISSING-01")],
                "total": 2,
                "page": 1,
                "pageSize": 20,
            }
            status = 200
        elif path == f"/api/orders/{ORDER_ID}" and request.method == "GET":
            body, status = self.current, 200
        elif path == f"/api/orders/{MISSING_ID}" and request.method == "GET":
            body, status = {"message": "Order not found."}, 404
        elif path == f"/api/orders/{ORDER_ID}/cancel" and request.method == "POST":
            if self.cancel_result is None:
                self.unexpected.append(call)
                body, status = {"message": "Unplanned synthetic cancel request."}, 500
            else:
                status, body = self.cancel_result
                self.cancel_result = None
                if status == 200:
                    self.current = body
        elif path == "/api/orders/import/preview" and request.method == "POST":
            if not self.preview_results:
                self.unexpected.append(call)
                body, status = {"message": "Unplanned synthetic preview request."}, 500
            else:
                status, body = self.preview_results.pop(0)
        elif path == "/api/orders/import" and request.method == "POST":
            if not self.import_results:
                self.unexpected.append(call)
                body, status = {"message": "Unplanned synthetic import request."}, 500
            else:
                outcome = self.import_results.pop(0)
                if outcome == "network":
                    call["status"] = "network-error"
                    await route.abort("failed")
                    return
                status, body = outcome
        else:
            self.unexpected.append(call)
            body, status = {"message": "Unexpected intercepted orders API request."}, 501

        call["status"] = status
        await route.fulfill(status=status, content_type="application/json", body=json.dumps(body))

    def count(self, method, path):
        return sum(call["method"] == method and call["path"] == path for call in self.calls)


def record(name, **details):
    results.append({"case": name, "result": "PASS", **details})


async def goto_orders(page):
    await page.goto(ORDERS)
    await page.locator('[data-screen-id="S07-01"]').wait_for(state="visible", timeout=15000)


async def open_current(page):
    await page.get_by_role("button", name="Open order RECOVERY-01", exact=True).click()
    await page.locator('[data-screen-id="S07-02"]').wait_for(state="visible")


async def submit_cancel(page, reason="Synthetic browser regression reason"):
    await page.get_by_role("button", name="Cancel order", exact=True).click()
    await page.locator('[data-screen-id="S08-02"]').wait_for(state="visible")
    await page.locator('textarea[name="reason"]').fill(reason)
    await page.get_by_role("button", name="Confirm cancellation", exact=True).click()


async def keyboard_activate(page, target):
    await target.wait_for(state="visible")
    for _ in range(100):
        if await target.evaluate("e => e === document.activeElement"):
            break
        await page.keyboard.press("Tab")
    else:
        raise AssertionError("Keyboard Tab could not reach " + (await target.inner_text()))
    await page.keyboard.press("Enter")


async def start_import(page):
    await goto_orders(page)
    await page.get_by_role("button", name="Import CSV", exact=True).click()
    await page.locator('[data-screen-id="S06-01"]').wait_for(state="visible")


async def choose_file(page, name):
    await page.locator('input[type="file"]').set_input_files({
        "name": name,
        "mimeType": "text/csv",
        "buffer": (
            b"order_code,recipient_name,recipient_phone,delivery_address,window_start,window_end,weight_kg\n"
            b"CSV-RECOVERY-01,CSV Fixture,0901234567,1 Synthetic Street,"
            b"2026-12-01 09:00,2026-12-01 10:00,1.5\n"
        ),
    })


async def file_input_state(page):
    return await page.locator('input[type="file"]').evaluate(
        "e => ({length: e.files.length, names: Array.from(e.files, f => f.name)})"
    )


async def cancel_denied(page, api, status):
    api.reset_order()
    await goto_orders(page)
    await open_current(page)
    before = len(api.calls)
    api.cancel_with(status, {"message": "Synthetic access denial."})
    await submit_cancel(page)
    await page.get_by_role("alert").wait_for(state="visible")
    await page.wait_for_timeout(150)

    expected = "Sign in" if status == 401 else "Return to staff workspace"
    recovery = page.get_by_role("link", name=expected, exact=True)
    assert await recovery.is_visible()
    assert await page.get_by_role("button", name="Back to detail", exact=True).count() == 0
    assert await page.get_by_role("button", name="Keep order", exact=True).count() == 0
    assert await page.locator('[data-screen-id="S07-02"]').count() == 0
    assert await page.get_by_role("button", name="Edit order", exact=True).count() == 0
    assert await page.get_by_role("button", name="Cancel order", exact=True).count() == 0
    assert len(api.calls) == before + 1
    assert api.calls[-1]["path"] == f"/api/orders/{ORDER_ID}/cancel"
    assert api.calls[-1]["method"] == "POST"

    if status == 401:
        assert await recovery.get_attribute("href") == "/sign-in?next=/orders"
        await page.screenshot(path=str(HERE / "cancel-401-recovery.png"), full_page=True)
    else:
        assert await recovery.get_attribute("href") == "/"

    calls_after_denial = len(api.calls)
    await keyboard_activate(page, recovery)
    if status == 401:
        await page.wait_for_url("**/sign-in?next=/orders")
    else:
        await page.wait_for_url(BASE + "/")
    assert len(api.calls) == calls_after_denial, "Recovery replayed or re-fetched an order request."
    record(f"Cancellation HTTP {status}: denied detail hidden; keyboard recovery works; no replay")


async def csv_confirmation_failure(page, api, failure, outcome):
    await start_import(page)
    initial = f"initial-{failure}.csv"
    replacement = f"replacement-{failure}.csv"
    api.preview_ok()
    await choose_file(page, initial)
    await page.get_by_role("button", name="Check CSV", exact=True).click()
    await page.locator('[data-screen-id="S06-02"]').wait_for(state="visible")
    assert api.upload_names[-1] == initial

    before_confirm = api.count("POST", "/api/orders/import")
    api.import_with(outcome)
    await page.get_by_role("button", name="Import 1 orders", exact=True).click()
    await page.get_by_role("alert").wait_for(state="visible")
    await page.locator('[data-screen-id="S06-01"]').wait_for(state="visible")
    empty = await file_input_state(page)
    assert empty == {"length": 0, "names": []}, f"Native picker did not reset after {failure}: {empty}"
    assert api.count("POST", "/api/orders/import") == before_confirm + 1

    if failure == "network":
        await page.screenshot(path=str(HERE / "confirmation-file-reset.png"), full_page=True)
    calls_before_empty_check = len(api.calls)
    uploads_before_empty_check = len(api.upload_names)
    await page.get_by_role("button", name="Check CSV", exact=True).click()
    await page.locator("#file-error").wait_for(state="visible")
    assert "Choose a CSV file" in await page.locator("#file-error").inner_text()
    assert len(api.calls) == calls_before_empty_check
    assert len(api.upload_names) == uploads_before_empty_check

    api.preview_ok()
    await choose_file(page, replacement)
    await page.get_by_role("button", name="Check CSV", exact=True).click()
    await page.locator('[data-screen-id="S06-02"]').wait_for(state="visible")
    assert api.upload_names[-1] == replacement
    await goto_orders(page)
    record(f"CSV confirmation {failure}: native input cleared, empty check made no request, replacement uploaded")


async def run_checks(page, api):
    await cancel_denied(page, api, 401)
    await goto_orders(page)
    await cancel_denied(page, api, 403)

    api.reset_order()
    await goto_orders(page)
    await open_current(page)
    before = api.count("POST", f"/api/orders/{ORDER_ID}/cancel")
    await page.get_by_role("button", name="Cancel order", exact=True).click()
    await page.get_by_role("button", name="Keep order", exact=True).click()
    assert await page.locator('[data-screen-id="S07-02"]').is_visible()
    await page.get_by_role("button", name="Cancel order", exact=True).click()
    await page.get_by_role("button", name="Back to detail", exact=True).click()
    assert await page.locator('[data-screen-id="S07-02"]').is_visible()
    assert api.count("POST", f"/api/orders/{ORDER_ID}/cancel") == before
    record("Authorized Keep order and Back to detail preserve detail without mutation")

    api.reset_order()
    await goto_orders(page)
    await open_current(page)
    await page.get_by_role("button", name="Cancel order", exact=True).click()
    api.reset_order(note="Updated by concurrent request.", version=2)
    api.cancel_with(409, {"code": "ORDER_CONFLICT", "message": "This order has changed."})
    await page.locator('textarea[name="reason"]').fill("Synthetic conflict reason")
    await page.get_by_role("button", name="Confirm cancellation", exact=True).click()
    await page.get_by_role("button", name="Reload order", exact=True).wait_for(state="visible")
    await page.get_by_role("button", name="Reload order", exact=True).click()
    await page.locator('[data-screen-id="S07-02"]').wait_for(state="visible")
    assert await page.get_by_text("Updated by concurrent request.", exact=True).is_visible()
    record("Cancellation 409 keeps reload recovery and loads current detail")

    api.reset_order()
    await goto_orders(page)
    await open_current(page)
    cancelled = order(status="CANCELLED", version=2, cancellation_reason="Synthetic approved cancellation")
    api.cancel_with(200, cancelled)
    await submit_cancel(page, "Synthetic approved cancellation")
    await page.get_by_text("Order cancelled.", exact=True).wait_for(state="visible")
    detail_text = await page.locator('[data-screen-id="S07-02"]').inner_text()
    assert "Status: CANCELLED" in detail_text
    assert "Cancellation reason: Synthetic approved cancellation" in detail_text
    record("Cancellation success displays saved CANCELLED detail and reason")

    await goto_orders(page)
    await page.get_by_role("button", name="Open order MISSING-01", exact=True).click()
    await page.get_by_role("alert").wait_for(state="visible")
    await page.get_by_role("button", name="Back to orders", exact=True).wait_for(state="visible")
    assert await page.locator('[data-screen-id="S07-02"]').count() == 0
    await page.get_by_role("button", name="Back to orders", exact=True).click()
    await page.locator('[data-screen-id="S07-01"]').wait_for(state="visible")
    record("404 order recovery returns to list without exposing detail")

    for failure, outcome in [
        ("network", "network"),
        ("500", (500, {"message": "Synthetic server failure."})),
        ("file-400", (400, {"errors": [{"field": "file", "message": "Synthetic file rejection."}]})),
    ]:
        await csv_confirmation_failure(page, api, failure, outcome)

    await start_import(page)
    api.preview_with(500, {"message": "Synthetic picker-origin failure."})
    await choose_file(page, "picker-origin.csv")
    await page.get_by_role("button", name="Check CSV", exact=True).click()
    await page.get_by_role("alert").wait_for(state="visible")
    retained = await file_input_state(page)
    assert retained == {"length": 1, "names": ["picker-origin.csv"]}, retained
    api.preview_ok()
    await page.get_by_role("button", name="Check CSV", exact=True).click()
    await page.locator('[data-screen-id="S06-02"]').wait_for(state="visible")
    assert api.upload_names[-1] == "picker-origin.csv"
    record("Picker-origin failure retains visible file for deliberate retry")

    await start_import(page)
    api.preview_with(400, {
        "errors": [{"field": "recipient_phone", "message": "Synthetic invalid phone.", "row": 2}],
    })
    await choose_file(page, "row-errors.csv")
    await page.get_by_role("button", name="Check CSV", exact=True).click()
    await page.locator('[data-screen-id="S06-02-row-errors"]').wait_for(state="visible")
    assert await page.get_by_role("region", name="CSV diagnostics").is_visible()
    assert "Synthetic invalid phone." in await page.get_by_role("region", name="CSV diagnostics").inner_text()
    await page.get_by_role("button", name="Choose a replacement CSV", exact=True).click()
    assert await file_input_state(page) == {"length": 0, "names": []}
    api.preview_ok()
    await choose_file(page, "row-replacement.csv")
    await page.get_by_role("button", name="Check CSV", exact=True).click()
    await page.locator('[data-screen-id="S06-02"]').wait_for(state="visible")
    assert api.upload_names[-1] == "row-replacement.csv"
    api.import_with((201, {"imported": 1}))
    await page.get_by_role("button", name="Import 1 orders", exact=True).click()
    await page.locator('[data-screen-id="S06-03"]').wait_for(state="visible")
    assert await page.get_by_role("status").inner_text() == "1 orders imported."
    assert await page.locator('input[type="file"]').count() == 0
    record("Row report replacement uploads new file; successful confirmation reaches complete")


async def main():
    password = os.environ.get("VEYLO_DEMO_PASSWORD")
    assert password, "Set VEYLO_DEMO_PASSWORD to the documented local synthetic-account password."
    assert urlsplit(BASE).hostname in {"127.0.0.1", "localhost"} and urlsplit(BASE).port == 3020
    api = OrderFixtures()
    browser_version = None
    failure = None
    version_result = subprocess.run(
        ["/usr/bin/google-chrome", "--version"], capture_output=True, text=True, check=True
    )
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            executable_path="/usr/bin/google-chrome",
            headless=True,
            chromium_sandbox=True,
        )
        browser_version = browser.version
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()
        await page.route("**/api/orders**", api.handle)
        try:
            await page.goto(BASE + "/sign-in?next=/orders")
            await page.get_by_label("Email").fill("dispatcher-a@example.test")
            await page.get_by_label("Password").fill(password)
            await page.get_by_role("button", name="Sign in", exact=True).click()
            await page.wait_for_url("**/orders")
            await page.locator('[data-screen-id="S07-01"]').wait_for(state="visible", timeout=15000)
            await run_checks(page, api)
        except Exception as error:
            failure = {"type": type(error).__name__, "message": str(error) or repr(error)}
        finally:
            await context.close()
            await browser.close()

    if api.unexpected and failure is None:
        failure = {"type": "AssertionError", "message": "Unexpected orders API request was intercepted."}
    report = {
        "run_at_utc": datetime.now(timezone.utc).isoformat(),
        "base_url": BASE,
        "browser": "Google Chrome",
        "browser_version": browser_version,
        "browser_binary_version": version_result.stdout.strip(),
        "viewport": "1440x900",
        "result": "FAIL" if failure else "PASS",
        "cases": results,
        "intercepted_order_api_calls": api.calls,
        "order_api_unexpected_calls": api.unexpected,
        "order_database_mutations": 0,
        "auth_session": "synthetic local sign-in; no session data recorded",
        "credentials_or_cookies_recorded": False,
        "failure": failure,
    }
    (HERE / "browser-results.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    if failure:
        if failure["type"] == "AssertionError" and not results:
            failure["message"] = "Login or initial application load failed before regression checks completed."
        print(f"FAIL: after {len(results)} browser recovery groups; {failure['type']}: {failure['message']}")
        raise AssertionError(failure["message"])
    print(f"PASS: {len(results)} browser recovery groups; {browser_version}")


if __name__ == "__main__":
    asyncio.run(main())
