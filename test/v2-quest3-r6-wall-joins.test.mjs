import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
 GIANT_FILES,initPremiumGiant,paintPremiumGiantWallJoins,
 paintPremiumGiantWalls
} from '../public/v2-premium-giantwood.mjs';

class ImageMock {
 complete=true;
 naturalWidth=256;
 naturalHeight=256;
 set src(value){this.path=value}
}
initPremiumGiant(ImageMock);
const makeContext=()=>{
 const calls=[];
 const context={
  save(){},restore(){},drawImage(...args){calls.push(args)},
  beginPath(){},rect(){},clip(){},fillRect(){}
 };
 return {context,calls};
};
const sample={cell:96,originX:0,originY:0,iso:false,at(x,y){return {x:(x+.5)*96,y:(y+.5)*96}}};

test('wall-join graphics connect ONLY real adjacent blocked squares',()=>{
 const {context,calls}=makeContext();
 const walls=[[2,1],[2,2],[3,2],[6,5]];
 assert.equal(paintPremiumGiantWallJoins(context,sample,walls),2);
 assert.equal(calls.length,2);
 assert(calls.some(call=>call.length===9),'vertical joins crop the transparent margins');
 assert(calls.some(call=>call.length===5),'horizontal joins use original complete art');
});

test('wall-join renderer cannot create walls between separated blocked cells',()=>{
 const {context,calls}=makeContext();
 assert.equal(paintPremiumGiantWallJoins(context,sample,[[1,1],[3,1],[1,3]]),0);
 assert.equal(calls.length,0);
});

test('accepted boss and five continuous R5 floor images remain referenced',()=>{
 assert.equal(GIANT_FILES.bossD12,'./assets/premium-giantwood/boss-d12-q3r3.png');
 for(const r of ['q3r1','q3r2','q3r3','q3r4','q3r5'])assert.match(GIANT_FILES[r],/-ground-q3r5\.jpg$/);
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 assert.match(app,/paintPremiumGiantWalls\(ctx,s,me.room,state.roomWalls/);
 assert.match(app,/v2-quest3-giantwood-20261103-r6-walljoins/);
 assert.match(html,/q3=v2-quest3-giantwood-r6-walljoins/);
});

test('real wall renderer remains a purely visual canvas painter',()=>{
 const {context}=makeContext();
 const ws=[[2,1],[2,2],[3,2]];
 const before=JSON.stringify(ws);
 assert.equal(paintPremiumGiantWalls(context,sample,'q3r1',ws),true);
 assert.equal(JSON.stringify(ws),before);
});
