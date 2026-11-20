from pathlib import Path
from collections import deque
import json
W,H=13,9
START,END=(0,4),(12,4)
def walk(walls,start=START,end=None,size=1,extra=set()):
 blocked=walls|extra
 def ok(x,y):return x>=0 and y>=0 and x+size<=W and y+size<=H and all((x+dx,y+dy) not in blocked for dx in range(size) for dy in range(size))
 if not ok(*start):return {},[]
 seen={start:None};q=deque([start])
 while q:
  p=q.popleft()
  if p==end:break
  for dx,dy in [(1,0),(0,-1),(0,1),(-1,0)]:
   n=(p[0]+dx,p[1]+dy)
   if n not in seen and ok(*n):seen[n]=p;q.append(n)
 path=[]
 if end in seen:
  p=end
  while p is not None:path.append(p);p=seen[p]
  path.reverse()
 return seen,path

def stats(groups):
 walls=set(tuple(c) for g in groups for c in g['cells'])
 seen,_=walk(walls);_,path=walk(walls,end=END)
 large=[]
 for s in [(0,3),(0,4)]:
  for e in [(11,3),(11,4)]:
   _,p=walk(walls,s,e,2)
   if p and (not large or len(p)<len(large)):large=p
 return {'walls':len(walls),'floor':117-len(walls),'reachable':len(seen),'door_steps':len(path)-1 if path else None,'large_steps':len(large)-1 if large else None,'path':path,'large_path':large}

def two_routes(walls):
 # Vertex-split max flow: two routes may share the entry/exit but no other cell.
 floor={(x,y) for y in range(H) for x in range(W)}-walls
 adj={};cap={}
 def add(a,b,c):
  adj.setdefault(a,[]).append(b);adj.setdefault(b,[]).append(a)
  cap[a,b]=c;cap[b,a]=0
 for p in floor:add((p,0),(p,1),2 if p in [START,END] else 1)
 for x,y in floor:
  for dx,dy in [(1,0),(-1,0),(0,1),(0,-1)]:
   q=(x+dx,y+dy)
   if q in floor:add(((x,y),1),(q,0),2)
 source,sink=(START,0),(END,1);flow=0
 while flow<2:
  prev={source:None};q=deque([source])
  while q and sink not in prev:
   a=q.popleft()
   for b in adj[a]:
    if b not in prev and cap[a,b]>0:prev[b]=a;q.append(b)
  if sink not in prev:break
  b=sink
  while prev[b] is not None:
   a=prev[b];cap[a,b]-=1;cap[b,a]+=1;b=a
  flow+=1
 return flow
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'design/quest6/layouts-r1.json').read_text())
report=[]
for r in data['rooms']:
 walls=set(map(tuple,r['walls']));result=stats(r['formations']);routes=two_routes(walls)
 assert 30<=len(walls)<=35 and len(walls)==len(r['walls'])
 assert result['reachable']==117-len(walls)
 assert result['door_steps']>12 and result['large_steps'] is not None
 assert routes==2
 assert len(set(map(tuple,r['spawnPositions'])))==len(r['enemies'])
 assert not walls.intersection(map(tuple,r['spawnPositions']))
 assert walk(walls,START,END,extra=set(map(tuple,r['spawnPositions'])))[1]
 report.append({'room':r['id'],'walls':len(walls),'floorConnected':True,'independentDoorRoutes':routes,'doorSteps':result['door_steps'],'largeFootprintSteps':result['large_steps'],'openingRoute':True})
(root/'design/quest6/geometry-check-r1.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
