import test from 'node:test';
import assert from 'node:assert/strict';
import {ROOM_WALLS} from '../src/engine.mjs';
import {GIANT_ROOMS,giantWallFormations,giantTreeRuns,initPremiumGiant,paintPremiumGiantWalls} from '../public/v2-premium-giantwood.mjs';

class ImageStub {
 complete=true;naturalWidth=768;naturalHeight=768;
 set src(path){this.path=path;}
}
initPremiumGiant(ImageStub);
const surface={cell:96,originX:12,originY:20,iso:false,at(x,y){return {x:12+(x+.5)*96,y:20+(y+.5)*96};}};
function context(){const calls=[];return {calls,save(){},restore(){},drawImage(...args){calls.push(args);}};}

test('Q3 formations and tree cover each actual blocked cell exactly once',()=>{
 for(const id of GIANT_ROOMS){
  const walls=ROOM_WALLS[id],before=JSON.stringify(walls),groups=giantWallFormations(id,walls);
  const covered=groups.flatMap(g=>g.cells).concat(giantTreeRuns(id,walls).flatMap(run=>Array.from({length:run.length},(_,i)=>[run.x+i,run.y])));
  assert.deepEqual(covered.map(p=>p.join(',')).sort(),walls.map(p=>p.join(',')).sort(),id);
  assert.equal(new Set(covered.map(p=>p.join(','))).size,walls.length,id);
  assert(groups.every(g=>g.key||g.cells.length===1),'Every existing joined formation has complete artwork');
  assert.equal(JSON.stringify(walls),before);
 }
});
test('Q3 topology detection rejects changed shapes and never bridges a gap',()=>{
 assert.equal(giantWallFormations('q3r1',[[2,1],[4,1]]).length,2);
 const holes=[[1,1],[2,1],[3,1],[1,2],[3,2],[1,3],[2,3],[3,3]];
 const groups=giantWallFormations('q3r1',holes);
 assert.equal(groups.length,1);assert.equal(groups[0].key,null);
 assert(!groups[0].cells.some(([x,y])=>x===2&&y===2));
 assert.equal(giantWallFormations('q3r2',[[2,1],[3,1],[3,2]])[0].key,null);
});
test('production walls paint each whole formation once without old join overlays',()=>{
 for(const id of GIANT_ROOMS){
  const ctx=context(),walls=ROOM_WALLS[id];
  assert.equal(paintPremiumGiantWalls(ctx,surface,id,walls),true);
  assert.equal(ctx.calls.length,giantWallFormations(id,walls).length+giantTreeRuns(id,walls).length,id);
  assert(!ctx.calls.some(([im])=>/stone-wall-/.test(im.path)),id);
 }
});
test('individually missing wall images fall back without disabling premium floors or other formations',async()=>{
 const m=await import('../public/v2-premium-giantwood.mjs?missing-wall-test');
 class MissingH extends ImageStub {set src(path){this.path=path;if(path.includes('ruin-horizontal-walls'))this.naturalWidth=0;}}
 m.initPremiumGiant(MissingH);
 const ctx=context();
 assert(m.premiumGiantReady('q3r2'));
 assert(m.paintPremiumGiantWalls(ctx,surface,'q3r2',ROOM_WALLS.q3r2));
 assert(ctx.calls.some(([im])=>im.path.includes('ruin-step-walls')));
 assert(ctx.calls.some(([im])=>im.path.includes('ruin-vertical-walls')));
 assert(ctx.calls.some(([im])=>im.path.includes('stone-wall-horizontal')));
 assert(!ctx.calls.some(([im])=>!im.naturalWidth));
});
test('Q3 whole formations remain opt-in for premium overhead rooms',()=>{
 const ctx=context();
 assert.equal(paintPremiumGiantWalls(ctx,surface,'q2r1',[[2,1]]),false);
 assert.equal(paintPremiumGiantWalls(ctx,{...surface,iso:true},'q3r1',[[2,1]]),false);
 assert.equal(ctx.calls.length,0);
});
