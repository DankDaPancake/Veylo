#!/usr/bin/env python3
"""Local F02 acceptance check; requires Playwright and Google Chrome."""
# ponytail: local acceptance only; move stable cases into an E2E suite if repeated.

import asyncio
import csv
import json
import os
import platform
import sys
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

from playwright.async_api import async_playwright


HERE = Path(__file__).resolve().parent
BASE = os.environ.get("VEYLO_BROWSER_BASE_URL", "http://127.0.0.1:3017").rstrip("/")
PASSWORD = os.environ.get("VEYLO_DEMO_PASSWORD")
COMMIT = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=HERE.parents[3], text=True).strip()
RUN = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
P = f"QA-B17-{RUN}"
RESULTS = {"commit": COMMIT, "base": BASE, "runId": RUN, "cases": [], "screenshots": [], "api": [], "unexpectedHttp": [], "console": [], "pageErrors": [], "requestFailures": [], "unverifiedUi": []}
tasks = set()


def prepare_csvs():
    header = ["order_code", "recipient_name", "recipient_phone", "delivery_address", "window_start", "window_end", "weight_kg"]

    def write(name, rows, columns=header, bom=False, newline="\n"):
        path = HERE / name
        with path.open("w", encoding="utf-8-sig" if bom else "utf-8", newline="") as handle:
            writer = csv.writer(handle, lineterminator=newline)
            writer.writerow(columns)
            writer.writerows(rows)
        return path

    window = ["2026-11-21 09:00", "2026-11-21 10:00"]
    write("valid-20.csv", [[f"{P}-CSV-{i:02d}", f"Synthetic Recipient {i:02d}", f"090017{i:04d}", f"{i} Synthetic Way", *window, "1.5"] for i in range(1, 21)])
    write("mixed-invalid.csv", [
        [f"{P}-ATOMIC-VALID", "Synthetic Atomic Recipient", "0900171001", "31 Synthetic Way", *window, "1.0"],
        [f"{P}-ATOMIC-INVALID", "Synthetic Atomic Recipient", "123", "32 Synthetic Way", *window, "2.0"],
    ])
    write("duplicate-rows.csv", [
        [f"{P}-DUP-ROWS", "Synthetic Duplicate One", "0900171002", "33 Synthetic Way", *window, "1.0"],
        [f"{P.lower()}-dup-rows", "Synthetic Duplicate Two", "0900171003", "34 Synthetic Way", *window, "2.0"],
    ])
    write("missing-phone-header.csv", [[f"{P}-HEADER-MISSING", "Synthetic Header Recipient", "35 Synthetic Way", *window, "1.0"]], [c for c in header if c != "recipient_phone"])
    write("unsupported-header.csv", [[f"{P}-HEADER-EXTRA", "Synthetic Header Recipient", "0900171004", "36 Synthetic Way", *window, "1.0", "not-allowed"]], header + ["unexpected"])
    write("malformed-quote.csv", [])
    (HERE / "malformed-quote.csv").write_text(
        ",".join(header) + f'\n{P}-MALFORMED,Synthetic Recipient,0900171005,"37 Synthetic Way,2026-11-21 09:00,2026-11-21 10:00,1.0\n',
        encoding="utf-8",
    )
    write("empty.csv", [])
    write("too-many-rows.csv", [[f"{P}-LIMIT-{i:03d}", "Synthetic Limit Recipient", "0900171999", "38 Synthetic Way", *window, "1.0"] for i in range(501)])
    (HERE / "oversized.csv").write_text(",".join(header) + "\n" + ("x" * 1_000_100), encoding="utf-8")
    quoted = [[f"{P}-CSV-QUOTED", 'Synthetic, "Quoted"\nRecipient', "0900171010", "39 Synthetic Way", *window, "1.0"]]
    write("bom-crlf-quoted.csv", quoted, bom=True, newline="\r\n")


async def screenshot(page, name):
    path = HERE / name
    await page.screenshot(path=str(path), full_page=False, animations="disabled")
    RESULTS["screenshots"].append(name)


def add_check(name, outcome, details):
    RESULTS["cases"].append({"case": name, "outcome": outcome, "details": details})


async def check(name, work):
    try:
        details = await work()
        add_check(name, "PASS", details or "Observed expected UI result.")
    except Exception as error:  # keep later independent cases observable
        message = " ".join(str(error).split())[:280]
        add_check(name, "FAIL", f"{type(error).__name__}: {message}")


async def record_response(response):
    url = urlsplit(response.url)
    path = url.path
    if path.startswith("/api/orders"):
        item = {"method": response.request.method, "status": response.status, "path": path}
        if response.status in (400, 409):
            try:
                body = await response.json()
                item["code"] = body.get("code")
                item["errors"] = [{k: v for k, v in issue.items() if k in ("field", "row")} for issue in body.get("errors", [])]
            except Exception:
                pass
        elif response.status < 300:
            try:
                body = await response.json()
                if isinstance(body, dict):
                    for key in ("imported", "total", "page", "pageSize", "status", "version"):
                        if key in body and isinstance(body[key], (str, int, float, bool, type(None))):
                            item[key] = body[key]
                    order = body.get("order", body)
                    if isinstance(order, dict):
                        for key in ("order_code", "status", "version"):
                            if key in order and isinstance(order[key], (str, int, float, bool, type(None))):
                                item[key] = order[key]
                    if isinstance(body.get("orders"), list):
                        item["visibleOrderCount"] = len(body["orders"])
                        item["visibleOrderCodes"] = [o.get("order_code") for o in body["orders"] if isinstance(o, dict) and isinstance(o.get("order_code"), str)]
            except Exception:
                pass
        RESULTS["api"].append(item)
    elif response.status >= 400:
        RESULTS["unexpectedHttp"].append({"status": response.status, "method": response.request.method, "path": path})


def wire(page):
    def on_response(response):
        task = asyncio.create_task(record_response(response))
        tasks.add(task)
        task.add_done_callback(tasks.discard)

    page.on("response", on_response)
    page.on("console", lambda msg: RESULTS["console"].append({"type": msg.type, "text": " ".join(msg.text.split())[:240]}) if msg.type in ("error", "warning") else None)
    page.on("pageerror", lambda error: RESULTS["pageErrors"].append(" ".join(str(error).split())[:240]))
    page.on("requestfailed", lambda request: RESULTS["requestFailures"].append({"method": request.method, "path": urlsplit(request.url).path, "failure": (request.failure or "")[:160]}))


async def sign_in(page, email, *, orders_expected=True):
    await page.goto(f"{BASE}/sign-in?next=%2Forders", wait_until="domcontentloaded")
    for attempt in range(2):
        await page.get_by_label("Email").fill(email)
        await page.get_by_label("Password").fill(PASSWORD)
        async with page.expect_response(lambda r: "/api/auth/sign-in/email" in r.url, timeout=30000) as info:
            await page.get_by_role("button", name="Sign in").click()
        response = await info.value
        if response.status == 429 and attempt == 0:
            seconds = int(response.headers.get("retry-after", "10"))
            await page.wait_for_timeout(min(max(seconds + 1, 1), 30) * 1000)
            continue
        if response.status != 200:
            raise AssertionError(f"Sign-in HTTP status {response.status}")
        await page.wait_for_url("**/orders", timeout=15000)
        if orders_expected:
            await page.locator('[data-screen-id="S07-01"]').wait_for(state="visible", timeout=15000)
        else:
            await page.get_by_role("heading", name="Access denied").wait_for(state="visible", timeout=15000)
        return
    raise AssertionError("Sign-in remained rate limited")


async def apply_search(page, q="", status="", start="", end=""):
    await page.locator('[data-screen-id="S07-01"]').wait_for(state="visible", timeout=10000)
    await page.get_by_placeholder("Code, recipient name or phone").fill(q)
    await page.get_by_label("Status").select_option(status)
    dates = page.locator('input[type="date"]')
    await dates.nth(0).fill(start)
    await dates.nth(1).fill(end)
    await page.get_by_role("button", name="Apply filters").click()
    await page.wait_for_timeout(350)


async def open_create(page):
    await page.get_by_role("button", name="Create order").click()
    await page.locator('[data-screen-id="S05-01"]').wait_for(state="visible")


async def fill_order(page, code, *, phone="0900172001", start="2026-11-21T09:00", end="2026-11-21T10:00", latitude="", longitude="", recipient="Synthetic QA Recipient"):
    values = {
        "order_code": code, "recipient_name": recipient, "recipient_phone": phone,
        "delivery_address": "41 Synthetic Browser Way", "window_start": start,
        "window_end": end, "weight_kg": "1.75", "priority": "HIGH", "note": "Synthetic browser note",
        "latitude": latitude, "longitude": longitude,
    }
    for field, value in values.items():
        if field == "priority":
            await page.locator(f"#{field}").select_option(value)
        else:
            await page.locator(f"#{field}").fill(value)


async def submit_invalid_create(page, code, **overrides):
    await open_create(page)
    await fill_order(page, code, **overrides)
    await page.get_by_role("button", name="Save order").click()
    await page.locator('[data-screen-id="S05-01"]').wait_for(state="visible")


async def search_row_count(page):
    return await page.locator('[data-screen-id="S07-01"] tbody tr').count()


async def main():
    if BASE != "http://127.0.0.1:3017":
        raise ValueError("Use only the isolated BOOYAH-17 loopback server on port 3017")
    if not PASSWORD:
        print("Set VEYLO_DEMO_PASSWORD to the documented local synthetic-account password; it is not written to results.", file=sys.stderr)
        return 2
    prepare_csvs()
    RESULTS["browser"] = {"engine": "Google Chrome", "executable": "/usr/bin/google-chrome", "platform": platform.platform(), "python": platform.python_version(), "playwright": "preinstalled in /tmp/veylo-booyah15-pdf", "startedAtUtc": datetime.now(timezone.utc).isoformat()}

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(executable_path="/usr/bin/google-chrome", headless=True, args=["--no-sandbox", "--disable-dev-shm-usage"])
        RESULTS["browser"]["version"] = browser.version
        context = await browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1, accept_downloads=True)
        page = await context.new_page()
        wire(page)
        async def _login(target):
            await sign_in(target, "dispatcher-a@example.test")
            return {"page": "/orders", "screen": "S07-01"}

        await _login(page)
        add_check("Dispatcher A sign-in and Orders page", "PASS", {"page": "/orders", "screen": "S07-01"})
        if await page.locator('[data-screen-id="S07-01"]').count():
            await screenshot(page, "dispatcher-a-list-1440x900.png")

        async def keyboard_check():
            await page.goto(f"{BASE}/orders", wait_until="domcontentloaded")
            await page.locator('[data-screen-id="S07-01"]').wait_for(state="visible")
            await page.wait_for_load_state("networkidle")
            focused = None
            focus_style = None
            for _ in range(150):
                await page.keyboard.press("Tab")
                state = await page.evaluate("""() => { const e=document.activeElement; return {text:(e?.innerText||e?.getAttribute('aria-label')||e?.getAttribute('placeholder')||e?.tagName||'').trim().replace(/\\s+/g,' ').slice(0,80), tag:e?.tagName, outline:getComputedStyle(e).outlineStyle, width:getComputedStyle(e).outlineWidth}; }""")
                if await page.get_by_role("button", name="Create order", exact=True).evaluate("e => e === document.activeElement"):
                    focused, focus_style = state, state["outline"]
                    break
            if not focused:
                raise AssertionError("Tab sequence did not reach Create order within 150 tabs")
            await screenshot(page, "keyboard-focus-create-1440x900.png")
            await page.keyboard.press("Enter")
            await page.locator('[data-screen-id="S05-01"]').wait_for(state="visible")
            return {"focusedControl": focused, "outline": focus_style, "enterOpenedCreate": True}

        await check("Keyboard tab focus and Enter activation", keyboard_check)
        if await page.locator('[data-screen-id="S05-01"]').count():
            await page.get_by_role("button", name="Back to orders").click()
            await page.locator('[data-screen-id="S07-01"]').wait_for(state="visible")

        async def required_field_check():
            await open_create(page)
            await fill_order(page, f"{P}-REQUIRED")
            await page.locator("#order_code").fill("")
            await page.get_by_role("button", name="Save order").click()
            invalid = await page.locator("#order_code").evaluate("e => e.validity.valueMissing")
            still_form = await page.locator('[data-screen-id="S05-01"]').count() == 1
            await screenshot(page, "create-required-field-1440x900.png")
            if not (invalid and still_form):
                raise AssertionError("Missing order code was not blocked by the browser form")
            return {"browserRequired": True, "formRetained": True}

        await check("UC05 missing required order code", required_field_check)
        await page.get_by_role("button", name="Back to orders").click()

        async def manual_create():
            await open_create(page)
            await fill_order(page, f"{P}-MANUAL-01", latitude="10.7765", longitude="106.7009")
            await page.get_by_role("button", name="Save order").click()
            await page.locator('[data-screen-id="S07-01"]').wait_for(state="visible")
            await page.get_by_text("Order created.", exact=True).wait_for(state="visible")
            await page.reload(wait_until="networkidle")
            await apply_search(page, f"{P}-MANUAL-01")
            if await search_row_count(page) != 1:
                raise AssertionError("Created order was not visible after list reload")
            await screenshot(page, "manual-create-filtered-list-1440x900.png")
            await page.get_by_role("button", name=f"Open order {P}-MANUAL-01").click()
            await page.locator('[data-screen-id="S07-02"]').wait_for(state="visible")
            detail = " ".join((await page.locator('[data-screen-id="S07-02"]').inner_text()).split())
            await screenshot(page, "manual-order-detail-1440x900.png")
            if "Status: NEW" not in detail or "41 Synthetic Browser Way" not in detail:
                raise AssertionError("Saved detail omitted expected order fields/state")
            return {"orderCode": f"{P}-MANUAL-01", "detailContainsStatusNew": True, "detailContainsAddress": True, "visibleAfterReload": True}

        await check("UC05 valid create, detail and persistence after reload", manual_create)

        async def invalid_phone():
            await page.goto(f"{BASE}/orders")
            await open_create(page)
            code = f"{P}-BAD-PHONE"
            await fill_order(page, code, phone="123")
            await page.get_by_role("button", name="Save order").click()
            await page.locator("#recipient_phone-error").wait_for(state="visible")
            await screenshot(page, "create-invalid-phone-retained-1440x900.png")
            retained = await page.locator("#order_code").input_value() == code and await page.locator("#recipient_phone").input_value() == "123"
            if not retained:
                raise AssertionError("Invalid input was not retained after server field error")
            await page.get_by_role("button", name="Back to orders").click()
            await apply_search(page, code)
            empty = await page.get_by_text("No orders match these filters.", exact=True).is_visible()
            if not empty:
                raise AssertionError("Invalid order appears in saved list")
            return {"phoneFieldError": True, "inputRetained": retained, "savedOrderAbsent": empty}

        await check("UC05 invalid phone feedback, retention and no write", invalid_phone)

        for label, code_suffix, overrides, expected_field in [
            ("UC05 reversed delivery window", "REVERSED", {"start": "2026-11-21T11:00", "end": "2026-11-21T10:00"}, "window_end"),
            ("UC05 incomplete coordinate pair", "COORDINATE", {"latitude": "10.7", "longitude": ""}, "longitude"),
            ("UC05 non-positive weight", "WEIGHT", {"phone": "0900172001"}, "weight_kg"),
        ]:
            async def invalid_case(label=label, code_suffix=code_suffix, overrides=overrides, expected_field=expected_field):
                await page.goto(f"{BASE}/orders")
                await open_create(page)
                code = f"{P}-{code_suffix}"
                await fill_order(page, code, **overrides)
                if code_suffix == "WEIGHT":
                    await page.locator("#weight_kg").fill("0")
                await page.get_by_role("button", name="Save order").click()
                await page.locator(f"#{expected_field}-error").wait_for(state="visible")
                return {"fieldError": expected_field, "formRetained": True}
            await check(label, invalid_case)
            await page.get_by_role("button", name="Back to orders").click()

        async def duplicate_manual():
            await page.goto(f"{BASE}/orders")
            await open_create(page)
            await fill_order(page, f"{P}-MANUAL-01")
            await page.get_by_role("button", name="Save order").click()
            await page.locator("#order_code-error").wait_for(state="visible")
            await screenshot(page, "create-duplicate-same-hub-1440x900.png")
            if await page.locator("#order_code").input_value() != f"{P}-MANUAL-01":
                raise AssertionError("Duplicate form value was not retained")
            return {"duplicateFieldError": True, "codeRetained": True}

        await check("UC05 duplicate code within the same hub", duplicate_manual)
        await page.get_by_role("button", name="Back to orders").click()

        async def list_filter_pages():
            await page.goto(f"{BASE}/orders")
            await apply_search(page, f"{P}-MANUAL-01", start="2026-11-21", end="2026-11-21")
            if await search_row_count(page) != 1:
                raise AssertionError("Keyword and inclusive start-date filter did not isolate the created order")
            await page.get_by_label("Status").select_option("CANCELLED")
            await page.get_by_role("button", name="Apply filters").click()
            await page.wait_for_timeout(250)
            empty = await page.get_by_text("No orders match these filters.", exact=True).is_visible()
            if not empty:
                raise AssertionError("Status filter did not exclude a NEW order")
            await apply_search(page, f"{P}-NO-SUCH-ORDER")
            await page.get_by_text("No orders match these filters.", exact=True).wait_for(state="visible")
            await screenshot(page, "orders-no-results-1440x900.png")
            await apply_search(page, "")
            rows = await search_row_count(page)
            page_label = await page.get_by_label("Order pages").inner_text()
            if rows != 20 or "Page 1" not in page_label:
                raise AssertionError(f"Expected 20 first-page rows; observed {rows}, {page_label!r}")
            await page.get_by_role("button", name="Next").click()
            await page.wait_for_timeout(350)
            if "Page 2" not in await page.get_by_label("Order pages").inner_text():
                raise AssertionError("Next did not open page 2")
            await screenshot(page, "orders-page-2-1440x900.png")
            await page.get_by_role("button", name="Previous").click()
            return {"keywordAndInclusiveDates": True, "statusFilter": True, "emptyResults": True, "firstPageRows": rows, "pagination": page_label}

        await check("UC07 combined filters, empty state and 20-row pagination", list_filter_pages)

        async def import_flow():
            await page.goto(f"{BASE}/orders")
            await page.get_by_role("button", name="Import CSV").click()
            await page.locator('[data-screen-id="S06-01"]').wait_for(state="visible")
            async with page.expect_download() as download_info:
                await page.get_by_role("link", name="Download CSV template").click()
            download = await download_info.value
            await download.save_as(str(HERE / "downloaded-template.csv"))
            template_text = (HERE / "downloaded-template.csv").read_text(encoding="utf-8-sig")
            if not template_text.startswith("order_code,recipient_name,recipient_phone"):
                raise AssertionError("Downloaded template header does not match F02 required columns")
            file_input = page.locator('input[type="file"]')
            await file_input.set_input_files(str(HERE / "valid-20.csv"))
            await page.get_by_role("button", name="Import orders").click()
            await page.locator('[data-screen-id="S07-01"]').wait_for(state="visible", timeout=15000)
            await page.get_by_text("Imported 20 orders.", exact=True).wait_for(state="visible")
            await page.reload(wait_until="networkidle")
            await apply_search(page, f"{P}-CSV-")
            if await search_row_count(page) != 20:
                raise AssertionError("Twenty-row import was not visible after reload")
            await screenshot(page, "csv-valid-20-page-1440x900.png")
            return {"templateDownload": "downloaded-template.csv", "imported": 20, "rowsVisibleAfterReload": 20}

        await check("UC06 template download and valid 20-row import", import_flow)

        async def csv_reject(name, fixture, expected_rows=0, expected_text=None):
            await page.goto(f"{BASE}/orders")
            await page.get_by_role("button", name="Import CSV").click()
            await page.locator('[data-screen-id="S06-01"]').wait_for(state="visible")
            await page.locator('input[type="file"]').set_input_files(str(HERE / fixture))
            async with page.expect_response(lambda r: r.request.method == "POST" and urlsplit(r.url).path == "/api/orders/import") as pending:
                await page.get_by_role("button", name="Import orders").click()
            response = await pending.value
            if response.status not in (400, 409):
                raise AssertionError(f"Expected rejected CSV, got HTTP {response.status}")
            await page.locator('p[role="alert"]').wait_for(state="visible")
            await page.locator('[data-screen-id="S06-01"]').wait_for(state="visible")
            if expected_text:
                await page.get_by_text(expected_text, exact=False).wait_for(state="visible")
            row_errors = await page.locator('[data-screen-id="S06-01"] li').all_inner_texts()
            if expected_rows and len(row_errors) != expected_rows:
                raise AssertionError(f"Expected {expected_rows} visible row errors, observed {len(row_errors)}")
            await screenshot(page, f"{fixture.removesuffix('.csv')}-rejected-1440x900.png")
            result = {"fixture": fixture, "visibleRowErrors": row_errors, "httpStatus": response.status, "errorVisible": True}
            if fixture in ("mixed-invalid.csv", "duplicate-rows.csv"):
                await page.get_by_role("button", name="Back to orders").click()
                await apply_search(page, f"{P}-ATOMIC" if fixture == "mixed-invalid.csv" else f"{P}-DUP-ROWS")
                await page.get_by_text("No orders match these filters.", exact=True).wait_for(state="visible")
                result["rejectedBatchRowsAbsent"] = True
            return result

        for case, fixture, rows in [
            ("UC06 mixed valid and invalid rows are atomic", "mixed-invalid.csv", 1),
            ("UC06 duplicate normalized codes in one file", "duplicate-rows.csv", 2),
            ("UC06 missing required header", "missing-phone-header.csv", 0),
            ("UC06 unsupported header", "unsupported-header.csv", 0),
            ("UC06 malformed quoted CSV", "malformed-quote.csv", 0),
            ("UC06 empty CSV", "empty.csv", 0),
            ("UC06 over 500 record CSV", "too-many-rows.csv", 0),
            ("UC06 file exceeding one megabyte", "oversized.csv", 0),
        ]:
            await check(case, lambda case=case, fixture=fixture, rows=rows: csv_reject(case, fixture, rows))

        async def quoted_csv():
            await page.goto(f"{BASE}/orders")
            await page.get_by_role("button", name="Import CSV").click()
            await page.locator('input[type="file"]').set_input_files(str(HERE / "bom-crlf-quoted.csv"))
            await page.get_by_role("button", name="Import orders").click()
            await page.locator('[data-screen-id="S07-01"]').wait_for(state="visible", timeout=15000)
            await page.get_by_text("Imported 1 orders.", exact=True).wait_for(state="visible")
            await apply_search(page, f"{P}-CSV-QUOTED")
            await page.get_by_role("button", name=f"Open order {P}-CSV-QUOTED").click()
            await page.locator('[data-screen-id="S07-02"]').wait_for(state="visible")
            text = await page.locator('[data-screen-id="S07-02"]').inner_text()
            if 'Synthetic, "Quoted"' not in text or "Recipient" not in text:
                raise AssertionError("Quoted multiline UTF-8 CSV fields were not preserved in saved detail")
            await screenshot(page, "csv-bom-crlf-quoted-detail-1440x900.png")
            return {"utf8Bom": True, "crlf": True, "quotedCommaQuoteAndLineBreak": True}

        await check("UC06 UTF-8 BOM, CRLF and quoted multiline fields", quoted_csv)

        async def edit_and_cancel():
            await page.goto(f"{BASE}/orders")
            code = f"{P}-EDIT-01"
            await open_create(page)
            await fill_order(page, code)
            await page.get_by_role("button", name="Save order").click()
            await page.locator('[data-screen-id="S07-01"]').wait_for(state="visible")
            await apply_search(page, code)
            await page.get_by_role("button", name=f"Open order {code}").click()
            await page.locator('[data-screen-id="S07-02"]').wait_for(state="visible")
            await page.get_by_role("button", name="Edit order").click()
            await page.locator('[data-screen-id="S08-01"]').wait_for(state="visible")
            if await page.locator("#order_code").count() != 0:
                raise AssertionError("Edit form exposed the order code control")
            await page.locator("#note").fill("Edited synthetic note")
            await page.get_by_role("button", name="Save order").click()
            await page.locator('[data-screen-id="S07-01"]').wait_for(state="visible")
            await page.get_by_text("Order updated.", exact=True).wait_for(state="visible")
            await page.reload(wait_until="networkidle")
            await apply_search(page, code)
            await page.get_by_role("button", name=f"Open order {code}").click()
            await page.locator('[data-screen-id="S07-02"]').wait_for(state="visible")
            detail = await page.locator('[data-screen-id="S07-02"]').inner_text()
            if "Edited synthetic note" not in detail:
                raise AssertionError("Edited note did not survive reload")
            await screenshot(page, "order-edited-after-reload-1440x900.png")
            await page.get_by_role("button", name="Cancel order").click()
            await page.locator('[data-screen-id="S08-03"]').wait_for(state="visible")
            await page.locator('textarea[name="reason"]').fill("x")
            await page.get_by_role("button", name="Confirm cancellation").click()
            min_length = await page.locator('textarea[name="reason"]').evaluate("e => e.validity.tooShort")
            if not min_length:
                raise AssertionError("Short cancellation reason was not blocked by browser validation")
            await page.locator('textarea[name="reason"]').fill("Synthetic QA cancellation")
            await page.get_by_role("button", name="Confirm cancellation").click()
            await page.locator('[data-screen-id="S07-01"]').wait_for(state="visible")
            await page.get_by_text("Order cancelled.", exact=True).wait_for(state="visible")
            await page.reload(wait_until="networkidle")
            await apply_search(page, code)
            if "CANCELLED" not in await page.locator('[data-screen-id="S07-01"]').inner_text():
                raise AssertionError("Cancelled order status did not remain visible after reload")
            await page.get_by_role("button", name=f"Open order {code}").click()
            await page.locator('[data-screen-id="S07-02"]').wait_for(state="visible")
            detail = await page.locator('[data-screen-id="S07-02"]').inner_text()
            if "Synthetic QA cancellation" not in detail:
                raise AssertionError("Cancellation reason was not retained")
            await screenshot(page, "order-cancelled-detail-after-reload-1440x900.png")
            return {"editPreservedOrderCode": True, "editVisibleAfterReload": True, "shortReasonBrowserBlocked": min_length, "cancelStatusAndReasonAfterReload": True}

        await check("UC08 edit, reason validation and persistent cancellation", edit_and_cancel)

        async def stale_version():
            code = f"{P}-STALE-01"
            await page.goto(f"{BASE}/orders")
            await open_create(page)
            await fill_order(page, code)
            await page.get_by_role("button", name="Save order").click()
            await page.locator('[data-screen-id="S07-01"]').wait_for(state="visible")
            await apply_search(page, code)
            await page.get_by_role("button", name=f"Open order {code}").click()
            await page.locator('[data-screen-id="S07-02"]').wait_for(state="visible")
            second = await context.new_page()
            wire(second)
            await second.goto(f"{BASE}/orders")
            await apply_search(second, code)
            await second.get_by_role("button", name=f"Open order {code}").click()
            await second.locator('[data-screen-id="S07-02"]').wait_for(state="visible")
            await page.get_by_role("button", name="Edit order").click()
            await page.locator("#note").fill("First tab update")
            await page.get_by_role("button", name="Save order").click()
            await page.locator('[data-screen-id="S07-01"]').wait_for(state="visible")
            await second.get_by_role("button", name="Edit order").click()
            await second.locator("#note").fill("Stale tab update")
            await second.get_by_role("button", name="Save order").click()
            await second.locator('p[role="alert"]').wait_for(state="visible")
            alert_text = await second.locator('p[role="alert"]').inner_text()
            if "changed" not in alert_text.lower():
                raise AssertionError("Stale edit did not display a conflict")
            await screenshot(second, "stale-edit-conflict-1440x900.png")
            await second.get_by_role("button", name="Reload details").click()
            await second.locator('[data-screen-id="S07-02"]').wait_for(state="visible")
            latest = await second.locator('[data-screen-id="S07-02"]').inner_text()
            if "First tab update" not in latest:
                raise AssertionError("Reload details did not show the current saved version")
            await screenshot(second, "stale-edit-reloaded-detail-1440x900.png")
            return {"twoTabsShareDispatcherSession": True, "staleVersionConflictVisible": True, "reloadShowsLatest": True}

        await check("UC08 stale edit conflict and reload latest details", stale_version)

        async def responsive_check():
            await page.set_viewport_size({"width": 1280, "height": 720})
            await page.goto(f"{BASE}/orders")
            await page.locator('[data-screen-id="S07-01"]').wait_for(state="visible")
            dims = await page.evaluate("({viewport:innerWidth, document:document.documentElement.scrollWidth})")
            await screenshot(page, "dispatcher-a-list-1280x720.png")
            await open_create(page)
            await screenshot(page, "create-form-1280x720.png")
            if dims["document"] > dims["viewport"]:
                raise AssertionError(f"Horizontal page overflow at 1280x720: {dims}")
            return {"viewport": "1280x720", "documentWidth": dims["document"], "noHorizontalPageOverflow": True}

        await check("1280x720 list and form layout smoke", responsive_check)
        await page.set_viewport_size({"width": 1440, "height": 900})

        async def anonymous_page_guard():
            guest = await browser.new_context(viewport={"width": 1440, "height": 900})
            guest_page = await guest.new_page()
            wire(guest_page)
            await guest_page.goto(f"{BASE}/orders", wait_until="domcontentloaded")
            await guest_page.wait_for_url("**/sign-in?next=/orders", timeout=10000)
            result = {"redirectedToSignIn": True, "ordersScreenAbsent": await guest_page.locator('[data-screen-id="S07-01"]').count() == 0}
            await screenshot(guest_page, "anonymous-orders-redirect-1440x900.png")
            await guest.close()
            return result

        await check("Anonymous Orders page requires sign-in", anonymous_page_guard)

        async def denied_role(email, filename):
            role_context = await browser.new_context(viewport={"width": 1440, "height": 900})
            role_page = await role_context.new_page()
            wire(role_page)
            await sign_in(role_page, email, orders_expected=False)
            await role_page.goto(f"{BASE}/orders", wait_until="domcontentloaded")
            await role_page.get_by_role("heading", name="Access denied").wait_for(state="visible")
            if await role_page.locator('[data-screen-id="S07-01"]').count():
                raise AssertionError("Denied role received Orders workspace")
            await screenshot(role_page, filename)
            await role_context.close()
            return {"accessDeniedPage": True, "ordersWorkspaceAbsent": True}

        await check("Administrator is denied the Orders page", lambda: denied_role("admin@example.test", "admin-denied-1440x900.png"))
        await check("Rider is denied the Orders page", lambda: denied_role("rider@example.test", "rider-denied-1440x900.png"))

        async def hub_b_scope_and_same_code():
            other_context = await browser.new_context(viewport={"width": 1440, "height": 900})
            other = await other_context.new_page()
            wire(other)
            await sign_in(other, "dispatcher-b@example.test")
            await apply_search(other, f"{P}-EDIT-01")
            if not await other.get_by_text("No orders match these filters.", exact=True).is_visible():
                raise AssertionError("Hub B search exposed a Hub A-only order")
            if await other.locator('[data-screen-id="S07-01"]').count() == 0:
                await other.goto(f"{BASE}/orders")
            await open_create(other)
            await fill_order(other, f"{P}-MANUAL-01")
            await other.get_by_role("button", name="Save order").click()
            await other.locator('[data-screen-id="S07-01"]').wait_for(state="visible")
            await apply_search(other, f"{P}-MANUAL-01")
            if await search_row_count(other) != 1:
                raise AssertionError("Same code was not allowed in a different hub")
            await screenshot(other, "dispatcher-b-same-code-other-hub-1440x900.png")
            await role_context_signout(other)
            await other_context.close()
            return {"hubAOnlyOrderHiddenFromHubB": True, "sameCodeAllowedInHubB": True}

        async def role_context_signout(target):
            await target.get_by_role("button", name="Sign out").click()
            await target.wait_for_url("**/sign-in", timeout=10000)

        await check("Dispatcher B hub scope and same code in another hub", hub_b_scope_and_same_code)

        async def signout_revokes_page():
            await page.goto(f"{BASE}/orders")
            await page.get_by_role("button", name="Sign out").click()
            await page.wait_for_url("**/sign-in", timeout=10000)
            await page.goto(f"{BASE}/orders")
            await page.wait_for_url("**/sign-in?next=/orders", timeout=10000)
            return {"signOutReturnsToSignIn": True, "oldSessionCannotReopenOrders": True}

        await check("Dispatcher sign-out removes Orders access", signout_revokes_page)

        RESULTS["unverifiedUi"] = [
            {"scenario": "duplicate concurrent create/import race", "reason": "The UI disables save while submitting and exposes no race control."},
            {"scenario": "crafted cross-hub resource identifier / guessed order ID", "reason": "The UI has no order-ID route or user control for requesting another hub's resource."},
            {"scenario": "expired session before API request", "reason": "The UI has no session expiry control; API integration suite is the appropriate evidence."},
            {"scenario": "request page beyond last page / server clamping", "reason": "The UI disables Next at the last page and filter submission resets to page 1."},
            {"scenario": "no delivery attempt is created by intake", "reason": "The F02 UI exposes no attempt history or attempt creation control."},
            {"scenario": "client-forged role or hub headers", "reason": "The UI provides no control to add or modify authorization headers."},
        ]
        await asyncio.gather(*list(tasks), return_exceptions=True)
        await context.close()
        await browser.close()

    (HERE / "oversized.csv").unlink(missing_ok=True)
    RESULTS["summary"] = {outcome: sum(1 for item in RESULTS["cases"] if item["outcome"] == outcome) for outcome in ("PASS", "FAIL", "UNVERIFIED")}
    RESULTS["unexpectedHttpCount"] = len(RESULTS["unexpectedHttp"])
    RESULTS["consoleErrorOrWarningCount"] = len(RESULTS["console"])
    RESULTS["uncaughtPageErrorCount"] = len(RESULTS["pageErrors"])
    RESULTS["requestFailureCount"] = len(RESULTS["requestFailures"])
    (HERE / "observations.json").write_text(json.dumps(RESULTS, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"summary": RESULTS["summary"], "unexpectedHttp": RESULTS["unexpectedHttp"], "console": RESULTS["console"], "pageErrors": RESULTS["pageErrors"], "requestFailures": RESULTS["requestFailures"], "observations": str(HERE / "observations.json")}, ensure_ascii=False))
    return 1 if RESULTS["summary"].get("FAIL", 0) else 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
