"""Read-only prototype checks; run with Python Playwright and local Chrome."""
import json
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[3]
PROTOTYPE = ROOT / 'docs/analysis-and-design/use-cases/prototypes/delivery-execution-reporting'
states = json.loads(subprocess.check_output(['node', str(PROTOTYPE / 'export.mjs'), '--list']))
subprocess.run(['node', str(PROTOTYPE / 'verify.mjs')], check=True)

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True, chromium_sandbox=True)
    page = browser.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))

    def visit(screen):
        page.goto(PROTOTYPE.joinpath('index.html').as_uri() + '?standalone=1&screen=' + screen)
        page.locator('#stage-frame[data-rendered-screen="' + screen + '"] h1').wait_for()

    for state in states:
        page.set_viewport_size({'width': state['width'], 'height': state['height']})
        visit(state['id'])
        assert page.locator('h1').inner_text().strip(), state['id']
        assert not errors, (state['id'], errors)
    print(f'Chrome {browser.version}: all {len(states)} states rendered at manifest dimensions without page errors.')

    visit('S12-02-pre-arrival-failure')
    assert page.locator('select[name=reason] option').all_text_contents() == [
        'Select a reason', 'Address incorrect or not found', 'Unsafe access']
    page.locator('textarea').fill('')
    page.locator('form button').click()
    assert 'comment is required' in page.locator('[role=alert]').inner_text()
    page.locator('textarea').fill('Synthetic access issue')
    page.locator('form button').click()
    page.wait_for_url('**screen=S12-06-failure-saved**')
    assert 'Not confirmed' in page.locator('#stage-frame').inner_text()

    visit('S12-05-failure-form')
    page.locator('select[name=reason]').select_option('')
    page.locator('textarea').fill('Preserve this synthetic comment')
    page.locator('form button').click()
    assert 'Select a failure reason' in page.locator('[role=alert]').inner_text()
    assert page.locator('textarea').input_value() == 'Preserve this synthetic comment'
    page.locator('select[name=reason]').select_option('Other')
    page.locator('textarea').fill('')
    page.locator('form button').click()
    assert 'comment is required' in page.locator('[role=alert]').inner_text()

    visit('S13-05-terminal-confirmation')
    page.locator('[name=reason]').fill('')
    page.locator('form button').click()
    assert 'closure reason' in page.locator('[role=alert]').inner_text()
    page.locator('[name=reason]').fill('Synthetic closure')
    page.locator('form button').click()
    page.wait_for_url('**screen=S13-04-terminal-confirmed**')

    visit('S19-01-report-filters')
    page.locator('[name=to]').fill('2026-11-19')
    page.locator('form button').click()
    assert 'End must be on or after start' in page.locator('[role=alert]').inner_text()
    assert page.locator('[name=to]').input_value() == '2026-11-19'
    page.locator('[name=to]').fill('2026-11-20')
    page.locator('[name=shift]').select_option('D-110')
    page.locator('form button').click()
    page.wait_for_url('**screen=S19-02-report-results**')
    assert '0 / 2' in page.locator('#stage-frame').inner_text()

    for name, mime, content, expected in [
        ('bad.txt', 'text/plain', b'bad', 'S12-09-photo-unsupported'),
        ('bad.png', 'image/png', b'bad', 'S12-09-photo-unreadable'),
        ('large.png', 'image/png', b'0' * 5000001, 'S12-09-photo-too-large'),
    ]:
        visit('S12-04-photo-proof')
        page.locator('input[type=file]').set_input_files({'name': name, 'mimeType': mime, 'buffer': content})
        page.locator('form button').click()
        page.wait_for_url('**screen=' + expected + '**')
    assert not errors, errors
    print('Interactive checks passed: pre-arrival reasons, required comments, preserved input, closure, date range, shift attribution, and rejected photo inputs.')
    browser.close()
