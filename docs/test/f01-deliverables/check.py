"""Run from any directory: python docs/test/f01-deliverables/check.py."""
from pathlib import Path
import hashlib
import json
import re
import struct
import subprocess

ROOT = Path(__file__).resolve().parents[3]
PACKAGE = ROOT / 'docs/analysis-and-design/use-cases'
source = PACKAGE / 'UC-F01-Access.md'
text = source.read_text(encoding='utf-8')
assert text.endswith('\n') and '\r' not in text
expected = {f'S{uc:02}-{n:02}' for uc, count in [(1, 6), (2, 6), (3, 4), (4, 3)] for n in range(1, count + 1)}
images = re.findall(r'!\[([^\]]+)\]\(([^)]+)\)', text)
assert len(images) == 19
assert {Path(link).stem for _, link in images} == expected
for caption, link in images:
    path = PACKAGE / link
    data = path.read_bytes()
    assert data[:8] == b'\x89PNG\r\n\x1a\n', path
    assert struct.unpack('>II', data[16:24]) == (1440, 900), path
    assert path.stem in caption
manifest = json.loads((Path(__file__).parent / 'source-manifest.json').read_text())
originals = [entry for entry in manifest['files'] if entry['path'].endswith('.png')]
assert len(originals) == 18
for entry in originals:
    assert hashlib.sha256((ROOT / entry['path']).read_bytes()).hexdigest() == entry['sha256'], entry['path']
for target in re.findall(r'\]\(([^)]+)\)', text):
    if not re.match(r'https?://', target):
        assert (PACKAGE / target.split('#')[0]).is_file(), target
sections = re.findall(r'^## (UC\d\d — [^\n]+)\n(.*?)(?=^## |\Z)', text, re.M | re.S)
assert len(sections) == 4
for heading, body in sections:
    for field in ('Actor', 'Description', 'Preconditions', 'Postconditions', 'Basic flow', 'Alternative flows', 'Special requirements'):
        assert f'**{field}:**' in body, (heading, field)
    assert 'Performed by:' in body and 'Reviewed by: Pending for restoration.' in body and 'Edited by:' in body
    steps = re.findall(r'^(\d+)\. (.+)$', body, re.M)
    assert steps and [int(n) for n, _ in steps] == list(range(1, len(steps) + 1))
    for _, step in steps:
        assert set(re.findall(r'S\d{2}-\d{2}', step)) <= expected
        assert re.search(r'S\d{2}-\d{2}', step), step
    branches = re.findall(r'^- \*\*(\d)[a-z] — [^\n]+$', body, re.M)
    assert branches
    for line in re.findall(r'^- \*\*\d[a-z] — [^\n]+$', body, re.M):
        branch = int(re.search(r'Branch from basic step (\d+)\.', line)[1])
        assert 1 <= branch <= len(steps)
        assert re.search(r'S\d{2}-\d{2}', line)
assert 'confirmation S02-03; result S02-06' in text
assert '18 original PNGs remain unchanged' in text and 'human review is pending' in text
html = (PACKAGE / 'prototypes/UC02/S02-06.html').read_text()
assert re.search(r'<tr class="selected"[^>]*><td>dispatcher-a@example.test</td>.*?Inactive', html)
assert 'AI-created supplementary prototype' in html
pdf = source.with_suffix('.pdf')
assert pdf.read_bytes().startswith(b'%PDF-')
pdftext = subprocess.check_output(['pdftotext', str(pdf), '-'], text=True)
for heading, _ in sections:
    assert heading in pdftext, heading
for screen in expected:
    assert screen in pdftext, screen
inventory = subprocess.check_output(['pdfimages', '-list', str(pdf)], text=True)
assert len(re.findall(r'^\s*\d+\s+\d+\s+image\s+1440\s+900\s', inventory, re.M)) == 19
print('PASS: four UCs/eight fields, branch/screen refs, local links,19 PNG/PDF screens,18 unchanged source hashes; human review remains pending.')
