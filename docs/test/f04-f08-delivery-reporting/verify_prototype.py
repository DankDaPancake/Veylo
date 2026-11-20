"""Verify recorded Figma/PNG/proposed-fixture evidence, not a business backend."""
from pathlib import Path
from collections import Counter,deque
from datetime import datetime
from decimal import Decimal,ROUND_HALF_UP
import hashlib,json,re,sys
from PIL import Image
ROOT=Path(__file__).resolve().parents[3]
P=ROOT/"docs/analysis-and-design/use-cases/prototypes/F04-F08"
T=Path(__file__).resolve().parent
def load(n):
 if n.startswith("evidence/"):path=T/"prototype"/n.removeprefix("evidence/")
 elif n in {"synthetic-fixtures.json","fixtures/proposed-location-guide.json"}:path=T/"fixtures"/Path(n).name
 else:path=P/n
 return json.loads(path.read_text())
manifest=load('screen-manifest.json');screens=manifest['screens'];reg=load('evidence/figma-screen-registry.json');R={x['screen_id']:x for x in reg};by_node={x['node_id']:x['screen_id'] for x in reg}
assert len(R)==len(reg)==len(screens)==103
assert set(R)=={s['screen_id'] for s in screens}
assert len(manifest['original_screen_map_ids'])==79 and set(manifest['original_screen_map_ids'])<=set(R)
structure=load('evidence/figma-structure-verified.json');assert len(structure['screens'])==103
for s in structure['screens']:
 assert s['bodyBottom']<=s['bottomLimit'],s['screen_id']
 assert not s['textOutside'] and not s['imageFilled'],s['screen_id']
 assert set(s['fonts'])<= {'Plus Jakarta Sans','JetBrains Mono'}
 assert s['descendants']>0
assert structure['originalPage']=={'id':'0:1','name':'Page 1','children':0}
png=load('evidence/png-verification.json');assert len(png)==103
for x in png:
 data=(ROOT/x['path']).read_bytes();assert hashlib.sha256(data).hexdigest()==x['sha256'];assert len(data)==x['bytes']
 im=Image.open(ROOT/x['path']);im.load();assert list(im.size)==[x['width'],x['height']]
 assert [x['frame_width'],x['frame_height']]==[R[x['screen_id']]['width'],R[x['screen_id']]['height']]
 assert x['shadow_padding']==(26 if x['screen_id']=='S11-01-refresh' else 0)
records=[]
for uc in ['UC11','UC12','UC13','UC19','REVIEW']:records += load('evidence/flow-graph-'+uc+'.json')['records']
def destinations(actions):
 out=[]
 for a in actions:
  if a['type']=='NODE':out.append(a)
  if a['type']=='CONDITIONAL':
   for b in a['blocks']:out.extend(destinations(b['actions']))
 return out
adj={sid:set() for sid in R};invalid=[];self_links=[]
for row in records:
 for a in destinations(row['actions']):
  if a['destinationId'] not in by_node:invalid.append(a)
  else:
   target=by_node[a['destinationId']];adj[row['screen_id']].add(target)
   if target==row['screen_id'] and a['navigation']=='NAVIGATE':self_links.append(row['node_id'])
assert not invalid and not self_links
seen={'B14-INDEX'};q=deque(seen)
while q:
 for target in adj[q.popleft()]-seen:seen.add(target);q.append(target)
assert seen==set(R), sorted(set(R)-seen)
# Evaluate actual recorded Figma actions for selected scripted walkthroughs.
def apply(actions,state):
 target=None
 for a in actions:
  if a['type']=='SET_VARIABLE':state[a['variableId']]=a['value']
  elif a['type']=='NODE':target=by_node[a['destinationId']]
  elif a['type']=='CONDITIONAL':
   for block in a['blocks']:
    c=block.get('condition')
    if c is None or state.get(c.get('value',{}).get('id'),False):
     target=apply(block['actions'],state);break
 return target

def click(origin,label,state):
 rows=[r for r in records if r['screen_id']==origin and r['name'].split('|')[-1]==label and r['trigger']['type']=='ON_CLICK']
 assert len(rows)==1,(origin,label,len(rows))
 return apply(rows[0]['actions'],state)
def auto(origin,state):
 rows=[r for r in records if r['screen_id']==origin and r['trigger']['type']=='AFTER_TIMEOUT'];assert len(rows)==1,origin
 return apply(rows[0]['actions'],state)
state={};assert click('B14-INDEX','Rider basic flow',state)=='S11-01'
for origin,label,dest in [('S11-01','View suggested delivery','S11-02'),('S11-02','Start delivery attempt','S12-01'),('S12-01','Start attempt','S12-01-starting')]:assert click(origin,label,state)==dest
assert auto('S12-01-starting',state)=='S12-02-started'
assert click('S12-02-started','I have arrived',state)=='S12-02-arriving';assert auto('S12-02-arriving',state)=='S12-03-arrived'
assert click('S12-03-arrived','Delivered successfully',state)=='S12-04-success';assert click('S12-04-success','Choose synthetic sample',state)=='S12-04-uploading';assert auto('S12-04-uploading',state)=='S12-04-ready';assert click('S12-04-ready','Confirm successful delivery',state)=='S12-04-saving';assert auto('S12-04-saving',state)=='S12-05-success';assert click('S12-05-success','Continue to next stop',state)=='S11-01-next'
assert click('S11-01-next','Start VL-0002',state)=='S12-01-next';assert click('S12-01-next','Start VL-0002',state)=='S12-02-next';assert click('S12-02-next','Record arrival · 09:38',state)=='S12-03-next';assert click('S12-03-next','Record failed delivery',state)=='S12-06-next';assert click('S12-06-next','Confirm failed attempt',state)=='S12-07-next';assert click('S12-07-next','Return to assigned work',state)=='S11-03-pending'
# First-stop failure must keep both failed Orders unresolved after remaining work.
state={};click('B14-INDEX','Rider basic flow',state);assert click('S12-07-failed','Continue assigned work',state)=='S11-01-after-failure';assert click('S11-01-after-failure','Start remaining stop',state)=='S12-01-next';assert click('S12-06-next','Confirm failed attempt',state)=='S12-07-next';assert click('S12-07-next','Return to assigned work',state)=='S11-03-pending-two'
# Manual eligible-stop choice must retain the original suggested stop as work.
state={};click('B14-INDEX','Rider basic flow',state);assert click('S11-01','Why this stop?',state)=='S11-01-explanation';assert click('S11-01-explanation','Choose another stop',state)=='S11-02-other';assert click('S11-02-other','Start selected stop',state)=='S12-01-next';assert click('S12-06-next','Confirm failed attempt',state)=='S12-07-selected-first';assert click('S12-07-selected-first','Continue remaining work',state)=='S11-01-selected-next';assert click('S11-01-selected-next','Start remaining VL-0001',state)=='S12-01';assert click('S12-05-success','Continue to next stop',state)=='S11-03-pending'
# Explicit Dispatcher decision and both report date cohorts.
state={};assert click('S13-03','Authorize re-dispatch',state)=='S13-04-retry';assert click('S13-04-retry','Confirm authorization',state)=='S13-04-saving';assert auto('S13-04-saving',state)=='S13-05-retry-authorized';assert click('S13-05-retry-authorized','Open planning handoff',state)=='S13-05-planning'
assert click('S13-03','Close terminal unsuccessful',state)=='S13-06-terminal';assert click('S13-06-terminal','Confirm terminal decision',state)=='S13-06-saving';assert auto('S13-06-saving',state)=='S13-07-terminal-saved';assert click('S13-07-terminal-saved','View Shift and Rider report',state)=='S19-01';assert click('S19-01','Apply filters',state)=='S19-01-loading';assert auto('S19-01-loading',state)=='S19-02-today';assert click('S19-02-today','Include both dates',state)=='S19-01-historical';assert click('S19-01-historical','Apply historical cohort',state)=='S19-02'
# EP11-B is intentionally a local handoff, never an invented UC15 destination.
ep=next(r for r in records if r['screen_id']=='S11-02' and r['name'].endswith('|View Full Guide'))
assert by_node[destinations(ep['actions'])[0]['destinationId']]=='S11-02-guide-handoff'
guide=load('fixtures/proposed-location-guide.json');assert guide['fixture_id']=='PROPOSED-BOOYAH14-GUIDE-001';assert guide['fixture_kind']=='PROPOSED_SYNTHETIC_NOT_SHARED';assert guide['actual_shared_fixture_id'] is None and guide['actual_uc15_destination'] is None;assert guide['publication_status']=='PUBLISHED';assert guide['synthetic_only']
# Arithmetic oracle for the documented cohorts; not a backend acceptance test.
f=load('synthetic-fixtures.json');completed=[a for a in f['attempts'] if a['outcome']];success=[a for a in completed if a['outcome']=='successful'];assert len(completed)==3 and len(success)==1;assert sum(a['duration_minutes'] for a in completed)/len(completed)==15
today=[a for a in completed if a['shift']!='SH-033'];assert len(today)==2 and sum(a['duration_minutes'] for a in today)/len(today)==17.5
uc=(P.parents[1]/'UC-F04-F08-Delivery-Reporting.md').read_text();basic=len(re.findall(r'^\d+\. \*\*B\d+ —',uc,re.M));alts=len(re.findall(r'^\| A\d+ —',uc,re.M));assert (basic,alts)==(28,43)
result={'screens':len(reg),'original_screen_ids':79,'pngs':len(png),'png_bytes':sum(x['bytes'] for x in png),'reaction_nodes':len(records),'all_screens_reachable_from_review_index':True,'invalid_destinations':0,'same_frame_navigation':0,'scripted_walkthroughs':['canonical Rider success → next stop failure → Dispatcher pending','first-stop failure → remaining failure → two unresolved Orders','manual stop choice → preserve remaining suggested work','Dispatcher retry authorization → planning handoff','explicit terminal decision → today report → historical cohort'],'scripted_walkthroughs_passed':True,'metric_oracles_passed':True,'basic_steps':basic,'alternative_flows':alts,'body_overflow':0,'text_outside_frames':0,'whole_ui_raster_fills':0,'font_families':sorted({f for s in structure['screens'] for f in s['fonts']}),'total_descendants':sum(s['descendants'] for s in structure['screens']),'node_types':dict(sum((Counter(s['types']) for s in structure['screens']),Counter())),'ep11_b':{'button_node_id':ep['node_id'],'local_target': 'S11-02-guide-handoff','actual_uc15_target':None,'actual_cross_uc_navigation_verified':False},'verification_kind':'Recorded Figma structure/reaction graph, actual PNGs and synthetic arithmetic; no backend, browser-runtime or human acceptance claim.'}
if '--check-only' not in sys.argv:
 (T/'prototype/prototype-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2))
