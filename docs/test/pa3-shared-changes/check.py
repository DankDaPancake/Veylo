"""Run: python docs/test/pa3-shared-changes/check.py (requires Poppler)."""
from pathlib import Path
import hashlib
import re
import subprocess
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[3]
source = ROOT / 'docs/Changes.md'
text = source.read_text(encoding='utf-8')
evidence = Path(__file__).with_name('README.md').read_text(encoding='utf-8')
expected = {f'A{n:02}' for n in range(1, 17)} | {f'B{n:02}' for n in range(1, 6)} | {f'B26-{n:02}' for n in range(1, 20)}
rows = re.findall(r'^\| ((?:A|B)\d{2}|B26-\d{2}) \|(.+)$', text, re.M)
assert len(rows) == len(expected) == 40
assert {key for key, _ in rows} == expected
for key, cells in rows:
    assert len(cells.rstrip('|').split('|')) == 4, key
    assert all(cell.strip() for cell in cells.rstrip('|').split('|')), key
    assert key in evidence, key
# Cover all source units, including the combined/overlapping ones.
source_units = re.findall(r'^\| (26:(?:M|R\d|F\d|V\d|D\d|T\d)) \|', evidence, re.M)
assert len(source_units) == len(set(source_units)) == 22
for line in re.findall(r'^\| 26:[^\n]+$', evidence, re.M):
    mapped = line.strip('|').split('|')[-1]
    assert set(re.findall(r'B(?:26-)?\d{2}', mapped)) <= expected
    assert re.search(r'B(?:26-)?\d{2}', mapped), line
for prefix, path in [('A', 'docs/management/pa3/ProjectPlan-Changes.md'), ('B', 'docs/requirements/pa3/Vision-Changes.md')]:
    fragment = (ROOT / path).read_text()
    label = 'BOOYAH-23 A fragment' if prefix == 'A' else 'BOOYAH-27 B fragment'
    original = fragment.split('\n**Canonical ledger pointer (21 November 2026):**')[0]
    digest = re.search(rf'^\| {label} \| `([a-f0-9]{{64}})`', evidence, re.M)[1]
    assert hashlib.sha256(original.encode()).hexdigest() == digest, path
    assert 'Canonical ledger pointer' in fragment and '../../Changes.md' in fragment and '../../Changes.pdf' in fragment
    for line in fragment.splitlines():
        if not re.match(rf'^\| {prefix}\d{{2}} \|', line):
            continue
        cells = [cell.strip() for cell in line.strip('|').split('|')]
        target = next(value for key, value in rows if key == cells[0])
        # Old content is preserved verbatim; A revised/reason cells also remain verbatim.
        assert cells[1] in target
        if prefix == 'A':
            assert cells[2] in target and cells[3] in target
for heading in ('## A. Project Plan', '## B. Vision Document'):
    assert heading in text
for part in re.split(r'(?m)^#{1,3} ', text)[1:]:
    attribution = part.splitlines()[1]
    assert all(label in attribution for label in ('Performed by:', 'Reviewed by:', 'Edited by:')), attribution
assert 'human sample, which remains pending' in text
assert '0 VND' in text and '18 thresholds and methods verbatim' in text
assert '853244cef89b6394dc6d8620bb34f8524b8f7958' in text

def slug(heading):
    heading = re.sub(r'[*`]', '', heading.lower())
    return ''.join(c for c in heading if c.isalnum() or c in ' -_').replace(' ', '-')

for path in [source, Path(__file__).with_name('README.md')]:
    content = path.read_text(encoding='utf-8')
    assert content.endswith('\n') and '\r' not in content
    for target in re.findall(r'\]\(([^)]+)\)', content):
        if re.match(r'https?://', target):
            continue
        name, _, anchor = target.partition('#')
        destination = (path.parent / unquote(name)).resolve() if name else path
        assert destination.is_file(), (path, target)
        if anchor and destination.suffix == '.md':
            headings = re.findall(r'^#{1,6} (.+)$', destination.read_text(), re.M)
            assert unquote(anchor) in {slug(h) for h in headings}, (path, target)
vision = ROOT / 'docs/requirements/pa3/Vision-Integration-Candidate.md'
vtext = vision.read_text()
assert len(re.findall(r'^\*\*FR-\d{2}-\d —', vtext, re.M)) == 32
assert len(re.findall(r'^\| \*\*N\d{2}\*\*', vtext, re.M)) == 18
# Input hashes pinned before integration: product documents must remain untouched.
for label, path in [('Compared ProjectPlan', ROOT / 'docs/management/ProjectPlan.md'), ('Compared Vision candidate', vision)]:
    digest = re.search(rf'^\| {label} \| `([a-f0-9]{{64}})`', evidence, re.M)[1]
    assert hashlib.sha256(path.read_bytes()).hexdigest() == digest, path
pdf = source.with_suffix('.pdf')
assert pdf.read_bytes().startswith(b'%PDF-')
pdftext = subprocess.check_output(['pdftotext', str(pdf), '-'], text=True)
for key in expected:
    assert re.search(rf'\b{key}\b', pdftext), key
assert 'A. Project Plan' in pdftext and 'B. Vision Document' in pdftext
index = (ROOT / 'docs/README.md').read_text()
assert '(Changes.md)' in index and '(Changes.pdf)' in index and 'UC-F01-Access.md' in index
print('PASS40 complete unique rows/22source units/fragment coverage/attribution/local links+anchors/32FR+18NFR inventory/unchanged compared documents/PDF IDs/index; human sample pending.')
