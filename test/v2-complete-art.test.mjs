import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ROOM_DATA,ROOM_WALLS} from '../src/engine.mjs';
import {QUEST_ROOM_COUNTS,QUEST_THEMES,allThemeNames,roomTheme,paintThemeFloor,paintThemeIso,paintThemeBackdrop,paintThemeDressing,paintThemeLight} from '../public/v2-theme-kit.mjs';
import {isV2ArtRoom} from '../public/v2-room-art.mjs';
function ctx(){let ops=0;const c={canvas:{width:1100,height:760},beginPath(){},save(){},restore(){},fillRect(){ops++},strokeRect(){ops++},drawImage(){ops++},fill(){ops++},stroke(){ops++},clip(){},closePath(){},rect(){},moveTo(){},lineTo(){},arc(){},ellipse(){},translate(){},scale(){},rotate(){},roundRect(){},bezierCurveTo(){},quadraticCurveTo(){},createLinearGradient(){return{addColorStop(){}}},createRadialGradient(){return{addColorStop(){}}}};return {c,count:()=>ops}}
const proj={iso:false,cell:36,originX:20,originY:30,at(x,y){return {x:20+(x+.5)*36,y:30+(y+.5)*36}}};
const iso={iso:true,cell:30,at(x,y){return {x:400+28*(x-y),y:120+16*(x+y)}}};
test('all exactly 133 original campaign rooms have known themes; no phantom rooms',()=>{
 assert.equal(Object.values(QUEST_ROOM_COUNTS).reduce((s,n)=>s+n,0),133);
 assert.equal(Object.keys(QUEST_THEMES).length,15);
 assert.equal(new Set(Object.values(QUEST_THEMES)).size,15);
 for(const [id,d] of Object.entries(ROOM_DATA)){
  assert.equal(isV2ArtRoom(id),true,`missing ${id}`);
  assert(roomTheme(id),`unknown theme ${id}`);
 }
 for(const [q,n] of Object.entries(QUEST_ROOM_COUNTS))for(let j=1;j<=n;j++){
  const id=Number(q)===1?['woodland','clearing','watchpost'][j-1]:`q${q}r${j}`;
  assert(ROOM_DATA[id],`missing server room ${id}`);
  assert.equal(roomTheme(id),QUEST_THEMES[q]);
 }
 assert.equal(roomTheme('q15r16'),null);
 assert.equal(roomTheme('q1r4'),null);
 assert.equal(roomTheme('__proto__'),null);
 assert.equal(roomTheme('q99r1'),null);
});
test('all 15 themes draw floor, isometric surface, backdrop, real walls, lights, without editing wall coordinates',()=>{
 for(const q of Object.keys(QUEST_THEMES)){
  const id=Number(q)===1?'clearing':`q${q}r2`,walls=ROOM_WALLS[id]||[];
  const before=JSON.stringify(walls),{c,count}=ctx();
  assert(paintThemeFloor(c,{x:40,y:30,size:65,tileX:2,tileY:2,roomId:id}),id);
  assert(paintThemeIso(c,{position:{x:300,y:200},halfW:35,halfH:20,tileX:2,tileY:2,roomId:id}),id);
  assert(paintThemeBackdrop(c,900,640,id),id);
  assert(paintThemeDressing(c,proj,walls,id),id);
  assert(paintThemeLight(c,proj,walls,id),id);
  assert(count()>35,`too few graphic operations for ${id} got ${count()}`);
  assert.equal(JSON.stringify(walls),before,`mutated collision walls for ${id}`);
  const {c:isoCtx,count:isoCount}=ctx();
  assert(paintThemeDressing(isoCtx,iso,walls,id),id);
  assert(paintThemeLight(isoCtx,iso,walls,id),id);
  assert(isoCount()>0,`iso scenery missing ${id}`);
 }
});
test('visual-only change: server engine and worker code remain untouched',()=>{
 const js=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 const kit=readFileSync(new URL('../public/v2-theme-kit.mjs',import.meta.url),'utf8');
 assert.match(js,/QUEST 1 WOODLAND COHESION R2/);
 assert.match(js,/theme:me\.room/);
 assert.match(js,/Scene art: ON/);
 assert.doesNotMatch(kit,/(fetch\(|WebSocket|localStorage|send\(|document\.)/);
 assert.match(readFileSync(new URL('../public/styles.css',import.meta.url),'utf8'),/V2 VISUAL PASS/);
});

test('art gallery lists 133 room names without shipping server secret maze walls or touching saves',()=>{
 const html=readFileSync(new URL('../public/v2-theme-gallery.html',import.meta.url),'utf8');
 const script=readFileSync(new URL('../public/v2-theme-gallery.mjs',import.meta.url),'utf8');
 const dataset=JSON.parse(readFileSync(new URL('../public/v2-gallery-catalog.json',import.meta.url),'utf8'));
 assert.equal(dataset.length,133);
 assert.equal(new Set(dataset.map(r=>r.id)).size,133);
 assert.match(html,/Visual comparison only/);
 assert.match(html,/not spoilers for the actual server-generated room maps/);
 assert.match(script,/layout\(cols,rows,q,seed\)/);
 assert.doesNotMatch(script,/WebSocket|\/api\/|localStorage|send\(/);
 for(const r of dataset){assert(!('walls' in r));assert(!('secrets' in r));assert(ROOM_DATA[r.id]);}
});
