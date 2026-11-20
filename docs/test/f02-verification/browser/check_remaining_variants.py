#!/usr/bin/env python3
"""Finish available UI validation variants without changing application behavior."""
import asyncio
import json
from pathlib import Path
from urllib.parse import urlsplit
from playwright.async_api import async_playwright
import run_browser_check as ui

assert ui.BASE == "http://127.0.0.1:3017", "Use only the isolated local QA server"

HERE = Path(__file__).resolve().parent
rows = []

async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True)
        context = await browser.new_context(viewport={'width':1440,'height':900})
        page = await context.new_page()
        await ui.sign_in(page, 'dispatcher-a@example.test')
        for name, overrides, field, native in [
            ('missing-address', {'delivery_address':''}, 'delivery_address', True),
            ('short-address', {'delivery_address':'x'}, 'delivery_address', False),
            ('equal-window', {'window_end':'2026-11-21T09:00'}, 'window_end', False),
            ('longitude-only', {'latitude':'','longitude':'106.7'}, 'latitude', False),
            ('latitude-bound', {'latitude':'91','longitude':'106.7'}, 'latitude', False),
            ('longitude-bound', {'latitude':'10.7','longitude':'181'}, 'longitude', False),
        ]:
            await page.goto(ui.BASE+'/orders', wait_until='networkidle')
            await ui.open_create(page)
            await ui.fill_order(page, ui.P+'-'+name[:9])
            for key,value in overrides.items():
                await page.locator('#'+key).fill(value)
            await page.get_by_role('button',name='Save order',exact=True).click()
            if native:
                assert await page.locator('#'+field).evaluate('e=>e.validity.valueMissing')
            else:
                await page.locator('#'+field+'-error').wait_for(state='visible')
            await page.screenshot(path=str(HERE/('supplement-'+name+'.png')))
            rows.append({'case':name,'result':'PASS','field':field,'formRetained':True})
        header='order_code,recipient_name,recipient_phone,delivery_address,window_start,window_end,weight_kg'
        common=',Synthetic Recipient,0900172001,41 Synthetic Way,2026-11-21 09:00,2026-11-21 10:00,'
        mixed=header+'\n'+ui.P+'-MIX-OK'+common+'1\n'+ui.P+'-MIX-BAD'+common+'-1\n,Synthetic Recipient,123,,2026-11-21 09:00,2026-11-21 10:00,0\n'
        for name, filename, data, required_fields in [
            ('mixed-weight-and-missing-fields','mixed.csv',mixed.encode(),{'weight_kg','order_code','delivery_address','recipient_phone'}),
            ('duplicate-header','duplicate-header.csv',(header+',order_code\n').encode(),{'file'}),
            ('invalid-utf8','invalid-utf8.csv',header.encode()+b'\n\xff\xfe',{'file'}),
            ('zero-byte-file','empty.csv',b'',{'file'}),
            ('wrong-extension','wrong.txt',(header+'\n'+ui.P+'-EXT'+common+'1\n').encode(),{'file'}),
        ]:
            await page.goto(ui.BASE+'/orders',wait_until='networkidle')
            await page.get_by_role('button',name='Import CSV',exact=True).click()
            await page.locator('input[type=file]').set_input_files({'name':filename,'mimeType':'text/csv','buffer':data})
            async with page.expect_response(lambda r:r.request.method=='POST' and urlsplit(r.url).path=='/api/orders/import') as pending:
                await page.get_by_role('button',name='Import orders',exact=True).click()
            response=await pending.value
            body=await response.json()
            assert response.status==400
            assert required_fields <= {e['field'] for e in body['errors']}
            await page.locator('p[role="alert"]').wait_for(state='visible')
            await page.screenshot(path=str(HERE/('supplement-'+name+'.png')))
            await page.get_by_role('button',name='Back to orders',exact=True).click()
            await ui.apply_search(page,ui.P)
            await page.get_by_text('No orders match these filters.',exact=True).wait_for(state='visible')
            rows.append({'case':name,'result':'PASS','status':response.status,'errors':[{'field':e['field'],'row':e.get('row')} for e in body['errors']],'batchRowsAbsent':True})
        await page_fallback(page)
        await browser.close()
async def page_fallback(page):
    original = json.loads((HERE/'observations.json').read_text())
    prefix = 'QA-B17-' + original['runId'] + '-CSV-'
    await page.goto(ui.BASE+'/orders',wait_until='networkidle')
    await ui.apply_search(page,prefix,status='NEW')
    before = await page.get_by_label('Order pages').inner_text()
    assert '21 orders' in before, before
    await page.get_by_role('button',name='Next',exact=True).click()
    await page.wait_for_load_state('networkidle')
    assert 'Page 2' in await page.get_by_label('Order pages').inner_text()
    assert await page.locator('tbody tr').count() == 1
    await page.screenshot(path=str(HERE/'page-fallback-before.png'))
    await page.locator('tbody button').click()
    await page.get_by_role('button',name='Cancel order',exact=True).click()
    await page.locator('textarea[name=reason]').fill('Synthetic page fallback verification')
    async with page.expect_response(lambda r:r.request.method=='GET' and urlsplit(r.url).path=='/api/orders' and 'page=2' in r.url) as pending:
        await page.get_by_role('button',name='Confirm cancellation',exact=True).click()
    response = await pending.value
    body = await response.json()
    assert body['page'] == 1 and body['total'] == 20
    await page.wait_for_load_state('networkidle')
    after = await page.get_by_label('Order pages').inner_text()
    assert 'Page 1' in after and '20 orders' in after
    assert await page.get_by_placeholder('Code, recipient name or phone').input_value() == prefix
    assert await page.get_by_label('Status').input_value() == 'NEW'
    await page.screenshot(path=str(HERE/'page-fallback-after.png'))
    result = {'applicationCommit':ui.COMMIT,'result':'PASS','flow':'Cancel the sole NEW order on page2 of a21-order filtered list','before':before,'requestedPage':2,'responsePage':body['page'],'responseTotal':body['total'],'after':after,'filtersRetained':True}
    (HERE/'page-fallback.json').write_text(json.dumps(result,indent=2)+'\n')

if __name__ == '__main__':
    try:
        asyncio.run(main())
    finally:
        (HERE/'remaining-variants.json').write_text(json.dumps({'applicationCommit':ui.COMMIT,'cases':rows},indent=2)+'\n')
    print('PASS:',len(rows),'remaining UI variants and page fallback')
