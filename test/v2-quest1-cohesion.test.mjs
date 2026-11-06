import test from 'node:test';
import assert from 'node:assert/strict';
import {ROOM_WALLS} from '../src/engine.mjs';
import * as art from '../public/v2-premium-woodland.mjs';
class ImageStub { complete=true; naturalWidth=512; naturalHeight=512; }
art.initPremiumWoodland(ImageStub);
const s={cell:80,originX:20,originY:30,at:(x,y)=>({x:20+(x+.5)*80,y:30+(y+.5)*80})};
function context(){
 const images=[],rects=[];
 return {images,rects,save(){},restore(){},beginPath(){},clip(){},rect(...v){rects.push(v)},
  stroke(){},strokeRect(){},fillRect(){},moveTo(){},lineTo(){},scale(){},
  getTransform(){return {a:1}},drawImage(img,...coords){images.push({src:img.src,coords})}};
}
test('connected obstacle coverage equals every original Q1 blocked cell, without filling open corners',()=>{
 for(const room of ['woodland','clearing','watchpost']){
  const walls=ROOM_WALLS[room],before=JSON.stringify(walls);
  const groups=art.woodlandWallGroups(walls);
  assert.deepEqual(groups.flatMap(g=>g.cells).map(p=>p.join(',')).sort(),walls.map(p=>p.join(',')).sort());
  assert.equal(JSON.stringify(walls),before);
 }
 const groups=art.woodlandWallGroups(ROOM_WALLS.watchpost);
 assert.deepEqual(groups.map(g=>g.cells.length).sort(),[2,2,2,3]);
 const corner=groups.find(g=>g.cells.length===3);
 assert(!corner.cells.some(([x,y])=>x===5&&y===4),'the upper-left corner remains walkable');
});
test('watchpost uses four connected sprites clipped to the nine authoritative wall cells',()=>{
 const ctx=context();const before=JSON.stringify(ROOM_WALLS.watchpost);
 assert(art.paintPremiumWoodlandWalls(ctx,s,ROOM_WALLS.watchpost,'watchpost'));
 assert.equal(ctx.images.length,4);
 assert.equal(ctx.images.filter(i=>i.src===art.PREMIUM_FILES.ruinVertical).length,3);
 assert.equal(ctx.images.filter(i=>i.src===art.PREMIUM_FILES.ruinCorner).length,1);
 assert.deepEqual(ctx.rects.slice(1).map(([x,y])=>[(x-s.originX)/s.cell,(y-s.originY)/s.cell]).sort(),[...ROOM_WALLS.watchpost].sort());
 assert.equal(JSON.stringify(ROOM_WALLS.watchpost),before);
});
test('missing new ruin assets retain all original wall drawings instead of leaving invisible barriers',async()=>{
 const fallback=await import('../public/v2-premium-woodland.mjs?fallback-test');
 class DelayedImage extends ImageStub {set src(value){this.path=value;if(value.endsWith('.webp')){this.complete=false;this.naturalWidth=0;}}get src(){return this.path}}
 fallback.initPremiumWoodland(DelayedImage);
 const ctx=context();assert(fallback.paintPremiumWoodlandWalls(ctx,s,ROOM_WALLS.watchpost,'watchpost'));
 assert.equal(ctx.images.length,ROOM_WALLS.watchpost.length);
 assert(ctx.images.every(i=>[fallback.PREMIUM_FILES.watchpostRuinA,fallback.PREMIUM_FILES.watchpostRuinB].includes(i.src)));
});
test('static scenery is reused at a fixed scale and invalidated for geometry or size changes',()=>{
 const original=globalThis.OffscreenCanvas;let allocations=0;
 globalThis.OffscreenCanvas=class {constructor(w,h){this.width=w;this.height=h;allocations++;}getContext(){return context();}};
 try{
  const ctx=context();const walls=ROOM_WALLS.watchpost.map(p=>[...p]);
  art.paintPremiumWoodlandWalls(ctx,s,walls,'watchpost');
  art.paintPremiumWoodlandWalls(ctx,s,walls,'watchpost');
  assert.equal(allocations,1);
  art.paintPremiumWoodlandWalls(ctx,{...s,cell:90},walls,'watchpost');
  assert.equal(allocations,2);
  art.paintPremiumWoodlandWalls(ctx,s,walls.slice(1),'watchpost');
  assert.equal(allocations,3);
 }finally{if(original===undefined)delete globalThis.OffscreenCanvas;else globalThis.OffscreenCanvas=original;}
});
