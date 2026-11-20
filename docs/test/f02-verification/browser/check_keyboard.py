#!/usr/bin/env python3
"""Targeted keyboard retest; Playwright and local Chrome must already be installed."""
import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

HERE = Path(__file__).resolve().parent
BASE = 'http://127.0.0.1:3017'
results = []

async def reach(page, target):
    await target.wait_for(state='visible')
    for _ in range(150):
        await page.keyboard.press('Tab')
        if await target.evaluate('e => e === document.activeElement'):
            return
    raise AssertionError('Keyboard did not reach ' + str(target))

async def enter(page, target):
    await reach(page, target)
    await page.keyboard.press('Enter')
    await page.wait_for_load_state('networkidle')

async def main():
    assert os.environ.get('VEYLO_DEMO_PASSWORD'), 'Supply the documented synthetic password'
    old = json.loads((HERE / 'observations.json').read_text())
    code = next(c['details']['orderCode'] for c in old['cases'] if c['case'].startswith('UC05 valid create') and c['outcome'] == 'PASS')
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True)
        context = await browser.new_context(viewport={'width': 1440, 'height': 900})
        page = await context.new_page()
        await page.goto(BASE + '/sign-in?next=/orders')
        await page.get_by_label('Email').fill('dispatcher-a@example.test')
        await page.get_by_label('Password').fill(os.environ['VEYLO_DEMO_PASSWORD'])
        await page.get_by_role('button', name='Sign in', exact=True).click()
        await page.wait_for_url('**/orders')
        await page.wait_for_load_state('networkidle')
        create = page.get_by_role('button', name='Create order', exact=True)
        assert await create.is_enabled()
        await reach(page, create)
        focus = await create.evaluate('e => ({text:e.textContent.trim(),outline:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth})')
        assert focus['outline'] != 'none' and focus['width'] != '0px'
        await page.screenshot(path=str(HERE / 'keyboard-retest-create-focus.png'))
        await page.keyboard.press('Enter')
        await page.locator('[data-screen-id="S05-01"]').wait_for()
        ids = set()
        for _ in range(90):
            await page.keyboard.press('Tab')
            state = await page.evaluate('({id:document.activeElement.id,text:document.activeElement.textContent.trim()})')
            ids.add(state['id'])
            if state['text'] == 'Save order':
                break
        expected = {'order_code','recipient_name','recipient_phone','delivery_address','window_start','window_end','weight_kg','priority','note','latitude','longitude'}
        assert expected <= ids, sorted(expected - ids)
        await enter(page, page.get_by_role('button', name='Save order', exact=True))
        assert await page.locator('#order_code').evaluate('e => e.validity.valueMissing')
        results.append({'case':'Create, all form fields and invalid Save accessible by Tab/Enter','result':'PASS','focus':focus,'fieldIds':sorted(ids - {''})})
        await enter(page, page.get_by_role('button', name='Back to orders', exact=True))
        await enter(page, page.get_by_role('button', name='Import CSV', exact=True))
        await page.locator('[data-screen-id="S06-01"]').wait_for()
        await reach(page, page.get_by_role('link', name='Download CSV template'))
        async with page.expect_download():
            await page.keyboard.press('Enter')
        await reach(page, page.locator('input[type=file]'))
        async with page.expect_file_chooser() as chooser:
            await page.keyboard.press('Enter')
        await (await chooser.value).set_files(str(HERE / 'valid-20.csv'))
        async with page.expect_response(lambda r: r.request.method == 'POST' and '/api/orders/import' in r.url) as response:
            await enter(page, page.get_by_role('button', name='Import orders', exact=True))
        assert (await response.value).status == 409
        results.append({'case':'Import screen, template, native file chooser and duplicate import via keyboard','result':'PASS','duplicateImportStatus':409})
        await enter(page, page.get_by_role('button', name='Back to orders', exact=True))
        search = page.get_by_placeholder('Code, recipient name or phone')
        await reach(page, search)
        await search.fill(code)
        await page.keyboard.press('Enter')
        await page.wait_for_load_state('networkidle')
        await enter(page, page.get_by_role('button', name='Open order ' + code, exact=True))
        await enter(page, page.get_by_role('button', name='Edit order', exact=True))
        await page.locator('[data-screen-id="S08-01"]').wait_for()
        assert not await page.locator('#order_code').count()
        results.append({'case':'Search, open detail and edit via keyboard','result':'PASS'})
        await enter(page, page.get_by_role('button', name='Back to orders', exact=True))
        await enter(page, page.get_by_role('button', name='Open order ' + code, exact=True))
        await enter(page, page.get_by_role('button', name='Cancel order', exact=True))
        reason = page.locator('textarea[name=reason]')
        await reach(page, reason)
        await reason.fill('x')
        await enter(page, page.get_by_role('button', name='Confirm cancellation', exact=True))
        assert await reason.evaluate('e => e.validity.tooShort')
        await page.screenshot(path=str(HERE / 'keyboard-retest-cancel-validation.png'))
        results.append({'case':'Cancel dialog, reason and confirmation via keyboard; invalid reason blocked','result':'PASS'})
        await enter(page, page.get_by_role('button', name='Back to orders', exact=True))
        await reach(page, search)
        await search.fill('')
        await enter(page, page.get_by_role('button', name='Apply filters', exact=True))
        await enter(page, page.get_by_role('button', name='Next', exact=True))
        assert 'Page 2' in await page.get_by_label('Order pages').inner_text()
        await enter(page, page.get_by_role('button', name='Previous', exact=True))
        assert 'Page 1' in await page.get_by_label('Order pages').inner_text()
        await enter(page, page.get_by_role('button', name='Sign out', exact=True))
        await page.wait_for_url('**/sign-in')
        results.append({'case':'Apply filters, next/previous and sign-out via keyboard','result':'PASS'})
        await browser.close()

try:
    asyncio.run(main())
finally:
    (HERE / 'keyboard-retest.json').write_text(json.dumps({'results':results,'scope':'Targeted keyboard retest; does not override boundary date defect or initial observations'},indent=2)+'\n')
print('PASS:', len(results), 'keyboard groups')
