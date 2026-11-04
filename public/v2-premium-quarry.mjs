/**
 * DICEBOUND V2 — Quest 4: The Glittering Giants.
 * Render-only quarry art: server continues to own encounters, movement, walls,
 * hit points, state, loot and quest progression. No interactive overlay is baked
 * into any image. All obstacle groups match the actual 9x7 ROOM_WALLS map.
 */
export const QUARRY_ROOMS=Object.freeze(['q4r1','q4r2','q4r3','q4r4','q4r5']);
export const isPremiumQuarryRoom=id=>QUARRY_ROOMS.includes(id);
const PREFIX='./assets/premium-quarry/';
const roomName=Object.freeze({q4r1:'quarry-entrance',q4r2:'golden-passage',q4r3:'crystal-pit',q4r4:'abandoned-workings',q4r5:'kings-excavation'});
export const QUARRY_FILES=Object.freeze({
 ...Object.fromEntries(QUARRY_ROOMS.flatMap(id=>[
  [id,`${PREFIX}${roomName[id]}-ground-q4r1.jpg`],
  [id+'Obstacles',`${PREFIX}${id}-obstacles-q4r1.png`],
  [id+'-left',`${PREFIX}${roomName[id]}-frame-left.jpg`],
  [id+'-right',`${PREFIX}${roomName[id]}-frame-right.jpg`]
 ])),
 q4r1Scene:`${PREFIX}quarry-entrance-cinematic-scene-q4-grade-a-r2.jpg`,
 q4r2Scene:`${PREFIX}golden-passage-battlefield-q4-grade-a-r3.jpg`,
 q4r3Scene:`${PREFIX}crystal-pit-battlefield-q4-grade-a-r3.jpg`,
 q4r4Scene:`${PREFIX}abandoned-workings-battlefield-q4-grade-a-r3.jpg`,
 q4r5Scene:`${PREFIX}kings-excavation-battlefield-q4-grade-a-r3.jpg`,
 normalD4:`${PREFIX}d4-q4r1.png`,normalD6:`${PREFIX}d6-q4r1.png`,
 normalD8:`${PREFIX}d8-q4r1.png`,shinyD4:`${PREFIX}shiny-d4-q4r1.png`,
 largeD4:`${PREFIX}large-d4-q4r1.png`,largeShinyD4:`${PREFIX}large-shiny-d4-q4r1.png`,
 bossD12:`${PREFIX}boss-d12-q4r1.png`,wallStone:`${PREFIX}q4-stone-single.png`
});
// Exactly the authoritative walls in src/engine.mjs; do not 'improve' the collision map here.
export const QUARRY_WALL_BLUEPRINTS=Object.freeze({
 q4r1:[".........",".###.#.#.",".#.#.#.#.",".........","..#####..",".........","........."],
 q4r2:[".........",".###...#.",".#####.#.",".........","......###","##..####.","........."],
 q4r3:[".........",".......#.","....###..","......#..",".##.###..","...####..","...####.."],
 q4r4:[".........","###..###.","...#.....",".###..##.",".........","...####..","........."],
 q4r5:[".........",".#.....#.",".........","..#...#..","..#...#..",".........","........."]
});
const art=Object.create(null);let started=false;
export function initPremiumQuarry(ImageCtor=typeof Image!=='undefined'?Image:null){
 if(!ImageCtor||started)return;started=true;
 for(const [key,path] of Object.entries(QUARRY_FILES)){
  const i=new ImageCtor();i.decoding='async';i.src=path;art[key]=i;
 }
}
const ready=k=>!!art[k]?.complete&&art[k].naturalWidth>0;
// A missing optional enemy, wall composite or side frame must NEVER disable
// the floor or force the entire quest back into procedural mode.
export function premiumQuarryReady(id='q4r1'){
 return isPremiumQuarryRoom(id)&&ready(id);
}
export function quarryFrameImage(side,id='q4r1'){return art[id+'-'+side]||null;}
function glow(ctx,x,y,rx,ry,color,a){
 ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);
 const g=ctx.createRadialGradient(0,0,0,0,0,1);
 g.addColorStop(0,`rgba(${color},${a})`);g.addColorStop(.45,`rgba(${color},${a*.35})`);g.addColorStop(1,`rgba(${color},0)`);
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.restore();
}
export function paintPremiumQuarryFloor(ctx,s,id='q4r1',walls=[]){
 if(!premiumQuarryReady(id)||s.iso)return false;
 const {originX:x,originY:y,cell:c}=s;
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 const sceneKey=id+'Scene';
 const fullScene=quarryWallsMatch(walls,id)&&ready(sceneKey);
 ctx.drawImage(fullScene?art[sceneKey]:art[id],x,y,9*c,7*c);
 ctx.strokeStyle=id==='q4r3'?'rgba(236,205,244,.20)':'rgba(244,220,169,.17)';
 ctx.lineWidth=Math.max(.6,c*.009);
 for(let i=1;i<9;i++){ctx.beginPath();ctx.moveTo(x+i*c,y);ctx.lineTo(x+i*c,y+7*c);ctx.stroke();}
 for(let i=1;i<7;i++){ctx.beginPath();ctx.moveTo(x,y+i*c);ctx.lineTo(x+9*c,y+i*c);ctx.stroke();}
 ctx.restore();return true;
}
export function quarryWallsMatch(walls=[],id='q4r1'){
 const b=QUARRY_WALL_BLUEPRINTS[id];if(!b||!Array.isArray(walls))return false;
 const expected=new Set(b.flatMap((row,y)=>[...row].flatMap((v,x)=>v==='#'?[`${x},${y}`]:[])));
 return walls.length===expected.size&&walls.every(p=>Array.isArray(p)&&expected.delete(`${p[0]},${p[1]}`))&&expected.size===0;
}
export function paintPremiumQuarryConnectedWalls(ctx,s,walls=[],id='q4r1'){
 if(!premiumQuarryReady(id)||s.iso||!quarryWallsMatch(walls,id))return false;
 // When the room-specific battlefield has already rendered its real fixed walls,
 // do not paint a second wall layer. Missing scene image uses the former overlay.
 if(ready(id+'Scene'))return true;
 if(!ready(id+'Obstacles'))return false;
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.drawImage(art[id+'Obstacles'],s.originX,s.originY,9*s.cell,7*s.cell);
 ctx.restore();return true;
}
// Visual fallback only, for late/missing composite art or changed server geometry.
export function paintPremiumQuarryWall(ctx,s,x,y,id='q4r1'){
 if(!premiumQuarryReady(id)||s.iso||!ready('wallStone'))return false;
 const p=s.at(x,y),c=s.cell;
 ctx.save();ctx.shadowColor='rgba(16,12,9,.64)';ctx.shadowBlur=c*.13;ctx.shadowOffsetY=c*.10;
 ctx.drawImage(art.wallStone,p.x-c*.48,p.y-c*.60,c*.96,c*1.08);
 ctx.restore();return true;
}
export function paintPremiumQuarryLighting(ctx,s,walls=[],id='q4r1'){
 if(!premiumQuarryReady(id)||s.iso)return false;
 const {originX:x,originY:y,cell:c}=s,w=9*c,h=7*c;
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
 const sun=ctx.createLinearGradient(x,y,x+w*.8,y+h);sun.addColorStop(0,'rgba(255,222,144,.11)');
 sun.addColorStop(.52,'rgba(255,196,107,.035)');sun.addColorStop(1,'rgba(44,30,26,.09)');
 ctx.fillStyle=sun;ctx.fillRect(x,y,w,h);
 const lights=id==='q4r3'?[[.32,.22],[.77,.67]]:id==='q4r5'?[[.28,.15],[.72,.30]]:[[.23,.13],[.76,.28]];
 for(const [cx,cy] of lights)glow(ctx,x+cx*w,y+cy*h,c*2.0,c*1.9,id==='q4r3'?'190,126,238':'255,201,115',.16);
 for(const [wx,wy] of walls)glow(ctx,x+(wx+.75)*c,y+(wy+.87)*c,c*.59,c*.24,'30,23,18',.26);
 ctx.restore();return true;
}
export function paintPremiumQuarryAtmosphere(ctx,s,id='q4r1',time=0,motion=true,lit=true){
 if(!premiumQuarryReady(id)||s.iso)return false;
 const {originX:x,originY:y,cell:c}=s,w=9*c,h=7*c;
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
 const vignette=ctx.createRadialGradient(x+w*.52,y+h*.47,w*.10,x+w*.52,y+h*.47,w*.76);
 vignette.addColorStop(0,'rgba(10,10,11,0)');vignette.addColorStop(.72,'rgba(12,9,5,.015)');vignette.addColorStop(1,'rgba(11,9,8,.24)');
 ctx.fillStyle=vignette;ctx.fillRect(x,y,w,h);
 if(lit){for(let i=0;i<13;i++){
  const px=x+w*(((i*43+9)%97)/97),py=y+h*(((i*29+13)%89)/89);
  glow(ctx,px,py,c*.037,c*.054,id==='q4r3'?'177,121,231':'255,213,126',motion?.09+.025*Math.sin(time*.002+i):.08);
 }}
 ctx.restore();return true;
}
export function paintPremiumQuarryForeground(ctx,s,actors=[],time=0,motion=true,id='q4r1'){
 if(!premiumQuarryReady(id)||s.iso)return false;
 // Dust is restrained, lower than labels and partly hidden near characters.
 const {originX:x,originY:y,cell:c}=s,w=9*c,h=7*c;
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
 for(let i=0;i<8;i++){
  const nx=((i*47+11)%97)/97,ny=(((i*31+6)%89)/89+(motion?time*.000018:0))%1;
  if(actors.some(a=>{const p=a.p||a;return Math.abs(p.x+.5-nx*9)<1.2&&Math.abs(p.y+.5-ny*7)<1.2;}))continue;
  ctx.fillStyle=id==='q4r3'?'rgba(235,197,255,.12)':'rgba(252,220,155,.10)';
  ctx.beginPath();ctx.ellipse(x+w*nx,y+h*ny,c*.014,c*.027,0,0,Math.PI*2);ctx.fill();
 }
 ctx.restore();return true;
}
export function paintPremiumQuarryContactShadow(ctx,s,p){
 if(!p||!Number.isFinite(p.x)||s.iso)return false;
 const large=p.variant==='large'||p.variant==='large-shiny',pt=s.at(p.x+(large?.5:0),p.y+(large?.5:0)),c=s.cell;
 glow(ctx,pt.x,pt.y+c*.30,c*(large?.80:.45),c*.17,'13,10,7',.65);return true;
}
export function paintPremiumQuarryActor(ctx,s,p,kind,sprite,{label='',selected=false,active=false,motion=true,timeMs=0,roomId='q4r1'}={}){
 if(!premiumQuarryReady(roomId)||s.iso||!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return false;
 const enemy=kind==='enemy',large=enemy&&(p.variant==='large'||p.variant==='large-shiny'),shiny=enemy&&(p.variant==='shiny'||p.variant==='large-shiny');
 const boss=enemy&&p.variant==='boss',c=s.cell,pt=s.at(p.x+(large?.5:0),p.y+(large?.5:0));
 let key=null;
 if(enemy)key=boss&&p.faces===12?'bossD12':p.faces===4?(large?(shiny?'largeShinyD4':'largeD4'):(shiny?'shinyD4':'normalD4')):p.faces===6?'normalD6':p.faces===8?'normalD8':null;
 if(key&&ready(key))sprite=art[key];
 if(!sprite?.complete||!sprite.naturalWidth)return false;
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 if(shiny||boss)glow(ctx,pt.x,pt.y+c*.14,c*(large?1.18:boss?1.18:.68),c*.65,
  boss?'240,182,91':shiny?'255,213,103':'193,144,99',shiny?.27:.18);
 if(selected||active){ctx.strokeStyle=selected?'#fdb977':'rgba(214,245,221,.9)';ctx.lineWidth=Math.max(2,c*.025);ctx.beginPath();ctx.ellipse(pt.x,pt.y+c*.30,c*(large?.80:.43),c*.19,0,0,Math.PI*2);ctx.stroke();}
 paintPremiumQuarryContactShadow(ctx,s,p);
 const bob=motion?Math.sin(timeMs*.002+p.x*7+p.y*11)*c*.010:0;
 // Preserve native aspect ratio, especially the tall portrait player and wide
 // 1-cell boss: boss sprite can overhang its logical square without collision changes.
 const h=c*(boss?1.46:large?2.24:enemy?1.42:1.47);
 const aspect=sprite.naturalWidth/sprite.naturalHeight;
 const drawW=Math.min(c*(boss?2.64:large?2.44:enemy?1.53:1.48),h*aspect);
 const drawH=drawW/aspect;
 ctx.shadowColor=boss?'rgba(251,185,80,.45)':shiny?'rgba(250,205,104,.50)':'rgba(22,15,10,.48)';
 ctx.shadowBlur=c*(shiny||boss?.15:.08);ctx.shadowOffsetY=c*.065;
 ctx.drawImage(sprite,pt.x-drawW*.5,pt.y-drawH*(boss?.83:large?.68:.64)+bob,drawW,drawH);
 ctx.shadowBlur=0;ctx.shadowOffsetY=0;
 const y=pt.y+c*(large?.84:.49),displayLabel=label|| (enemy?`D${p.faces||4}`:p.name||'Player');
 const fs=Math.max(10,c*(large?.245:.225)),width=Math.min(c*(large?1.8:boss?1.65:1.45),Math.max(c*.64,displayLabel.length*fs*.58+c*.20));
 ctx.fillStyle='rgba(5,10,19,.86)';ctx.beginPath();ctx.roundRect(pt.x-width*.5,y-fs,width,fs*1.45,fs*.28);ctx.fill();
 ctx.font=`700 ${fs}px system-ui,sans-serif`;ctx.textAlign='center';ctx.textBaseline='alphabetic';
 ctx.lineJoin='round';ctx.lineWidth=Math.max(2,fs*.25);ctx.strokeStyle='#06111b';ctx.fillStyle='#fff8ec';
 ctx.strokeText(displayLabel,pt.x,y);ctx.fillText(displayLabel,pt.x,y);
 if(enemy){
  const hp=p.maxHp>0?Math.max(0,Math.min(1,p.hp/p.maxHp)):1;
  const bar=c*(large?1.04:boss?1.10:.72),by=y+c*.10;
  ctx.fillStyle='#10151d';ctx.fillRect(pt.x-bar/2-1,by-1,bar+2,Math.max(4,c*.077)+2);
  ctx.fillStyle=shiny?'#f5cf70':boss?'#dfaf62':'#e68784';ctx.fillRect(pt.x-bar/2,by,bar*hp,Math.max(4,c*.077));
 }else if(p.hp===0){ctx.fillStyle='#ffb0a8';ctx.fillText('DOWN',pt.x,pt.y-c*.53);}
 ctx.restore();return true;
}
