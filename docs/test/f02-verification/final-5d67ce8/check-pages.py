"""Synthetic isolated role/page/template supplement for the frozen F02 build."""
import asyncio,json,os,subprocess
from pathlib import Path
from playwright.async_api import async_playwright,expect
HERE=Path(__file__).resolve().parent
BASE='http://127.0.0.1:3017'
RESULT={'commit':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'checks':[]}
async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True)
        for role,email in [('anonymous',None),('Admin','admin@example.test'),('Rider','rider@example.test'),('Dispatcher B','dispatcher-b@example.test')]:
            context=await browser.new_context(viewport={'width':1440,'height':900})
            page=await context.new_page()
            await page.goto(BASE+'/orders')
            if email:
                await page.get_by_label('Email').fill(email)
                await page.get_by_label('Password').fill(os.environ['VEYLO_DEMO_PASSWORD'])
                await page.get_by_role('button',name='Sign in',exact=True).click()
                await page.wait_for_url(lambda url:url.split('?')[0]==BASE+'/orders')
                if role in ['Admin','Rider']:
                    await expect(page.get_by_role('heading',name='Access denied',exact=True)).to_be_visible()
                    assert await page.get_by_role('button',name='Create order',exact=True).count()==0
                else:
                    await expect(page.get_by_role('button',name='Create order',exact=True)).to_be_enabled()
                    run=json.loads((HERE/'browser-results.json').read_text())['run']
                    await page.get_by_label('Search orders').fill('PAR-'+run+'-1440')
                    await page.get_by_role('button',name='Apply filters',exact=True).click()
                    await expect(page.get_by_text('No orders match these filters.',exact=True)).to_be_visible()
                    await page.get_by_role('button',name='Import CSV',exact=True).click()
                    template=page.get_by_role('link',name='Download CSV template',exact=True)
                    await template.focus()
                    async with page.expect_download() as downloaded:
                        await page.keyboard.press('Enter')
                    download=await downloaded.value
                    assert download.suggested_filename.endswith('.csv')
                    content=Path(await download.path()).read_text()
                    assert content.startswith('order_code,recipient_name,recipient_phone,delivery_address,window_start,window_end,weight_kg')
                    RESULT['checks'].append({'case':'Template actual download via keyboard','result':'PASS'})
            else:
                await expect(page.get_by_role('heading',name='Sign in to Veylo',exact=True)).to_be_visible()
                assert '/sign-in?' in page.url
            await page.screenshot(path=str(HERE/(role.replace(' ','-').lower()+'-page.png')))
            RESULT['checks'].append({'case':role+' page/hub isolation','result':'PASS'})
            await context.close()
        await browser.close()
try:
    asyncio.run(main())
finally:
    (HERE/'pages.json').write_text(json.dumps(RESULT,indent=2)+'\n')
