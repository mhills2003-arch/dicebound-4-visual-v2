import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ROOM_WALLS,ROOM_DATA} from '../src/engine.mjs';
import {
 V2_ART_ROOM,isV2ArtRoom,paintStoneFloorTile,paintIsoFloorTile,paintArtBackdrop,paintV2Dressing,paintV2Light
} from '../public/v2-room-art.mjs';
function drawingContext(){
 const draws=[];
 const ctx={canvas:{width:920,height:640},beginPath(){},save(){},restore(){},fillRect(){draws.push('fillRect')},
  strokeRect(){draws.push('strokeRect')},drawImage(){draws.push('image')},fill(){draws.push('fill')},stroke(){draws.push('stroke')},
  clip(){},closePath(){},rect(){},moveTo(){},lineTo(){},arc(){},ellipse(){},translate(){},scale(){},roundRect(){},bezierCurveTo(){},
  createLinearGradient(){return {addColorStop(){}}},createRadialGradient(){return {addColorStop(){}}}};
 return {ctx,draws};
}
const projection={iso:false,cell:36,originX:11,originY:14,at(x,y){return {x:11+(x+.5)*36,y:14+(y+.5)*36}}};
const isoProjection={iso:true,cell:27,scale:.78,at(x,y){return {x:410+(x-y)*25,y:60+(x+y)*14}}};
test('only q5r7 receives experimental V2 scenery; all other 132 campaign rooms retain original renderer',()=>{
 assert.equal(V2_ART_ROOM,'q5r7');assert.equal(isV2ArtRoom('q5r7'),true);
 assert.equal(ROOM_DATA[V2_ART_ROOM].name,'Smuggler’s Station');
 for(const id of Object.keys(ROOM_DATA))if(id!==V2_ART_ROOM)assert.equal(isV2ArtRoom(id),false,id);
});
test('art renderer draws real grid-aligned tactical and illustrated floor surfaces',()=>{
 const {ctx,draws}=drawingContext();
 paintArtBackdrop(ctx,900,600);
 paintStoneFloorTile(ctx,{x:20,y:20,size:36,tileX:1,tileY:2});
 paintIsoFloorTile(ctx,{position:{x:150,y:80},halfW:32,halfH:17,tileX:3,tileY:4});
 assert(draws.length>10);
});
test('decorations are visual-only, use actual wall cells, and leave the authoritative wall array unchanged',()=>{
 const walls=ROOM_WALLS.q5r7.map(pair=>[...pair]),before=JSON.stringify(walls);
 const {ctx,draws}=drawingContext();
 paintV2Dressing(ctx,projection,walls,{roomId:'q5r7'});
 paintV2Light(ctx,projection,walls,{roomId:'q5r7'});
 paintV2Dressing(ctx,isoProjection,walls,{roomId:'q5r7'});
 assert(draws.length>15);
 assert.equal(JSON.stringify(walls),before);
});
test('art has zero effect on non-preview rooms',()=>{
 const {ctx,draws}=drawingContext();
 paintV2Dressing(ctx,projection,ROOM_WALLS.q5r7,{roomId:'q5r8'});
 paintV2Light(ctx,projection,ROOM_WALLS.q5r7,{roomId:'q5r8'});
 assert.equal(draws.length,0);
});
test('comparison toggle only changes V2 client rendering state and is not a server command',()=>{
 const js=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 assert.match(js,/import \{isV2ArtRoom,paintArtBackdrop/);
 assert.match(html,/id="v2ArtToggle"/);
 assert.match(js,/localStorage\.setItem\('db4_v2_room_art'/);
 assert.match(js,/if\(artActive\(\)\)/);
 assert.match(js,/paintV2Dressing\(ctx,s,state\.roomWalls/);
 const toggle=js.match(/v2ArtToggle\.addEventListener\('click',\(\)=>\{([^}]+)\}\)/)?.[1];
 assert(toggle,'visual comparison control exists');
 assert.doesNotMatch(toggle,/send\(|WebSocket|fetch\(|move\(/);
});

test('a read-only art gallery is available before unlocking Quest 5',()=>{
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const gallery=readFileSync(new URL('../public/v2-art-preview.html',import.meta.url),'utf8');
 const script=readFileSync(new URL('../public/v2-art-preview.mjs',import.meta.url),'utf8');
 assert.match(html,/href="\.\/v2-art-preview\.html"/);
 assert.match(gallery,/not a playable dungeon/);
 assert.match(script,/paintV2Dressing\(/);
 assert.doesNotMatch(script,/fetch\(|WebSocket|localStorage|send\(/);
});
