/**
 * DICEBOUND 4.0 V2 — Quest 2 All That Glitters, five illustrated mine rooms.
 * Purely visual: no room definitions, collision, item/loot, combat, quests,
 * network, player positions, RNG or server authority are changed here.
 */
import {MINE_WALL_BLUEPRINTS,MINE_SCENERY,MINE_ACTORS} from './v2-mine-scenes.mjs';
export {MINE_WALL_BLUEPRINTS,MINE_SCENERY} from './v2-mine-scenes.mjs';
const asset=name=>'./assets/premium-mine/q2-'+name+'-r2.webp';
export const MINE_ROOMS = Object.freeze(['q2r1','q2r2','q2r3','q2r4','q2r5']);
export const isPremiumMineRoom = id => MINE_ROOMS.includes(id);
export const MINE_FILES = Object.freeze({
 q2r1:asset('entrance-ground'),q2r2:asset('hollow-ground'),q2r3:asset('gallery-ground'),
 q2r4:asset('vault-ground'),q2r5:asset('heart-ground'),
 rubble:asset('rubble'),elbow:asset('elbow'),timber:asset('timber'),oreCart:asset('ore-cart'),
 cyan:asset('cyan'),amber:asset('amber'),cartTrain:asset('cart-train'),amethyst:asset('amethyst'),
 normalD4:asset('normal-d4'),normalD6:asset('normal-d6'),normalD8:asset('normal-d8'),
 shinyD4:asset('shiny-d4'),shinyD6:asset('shiny-d6'),bossD12:asset('boss-d12'),
 left:'./assets/premium-mine/abandoned-mine-frame-left.jpg',right:'./assets/premium-mine/abandoned-mine-frame-right.jpg'
});
// Crisp shared mine architecture; room identity comes from its floor and lighting.
// The previous room variants were blurred double exposures.
export const MINE_FRAMES=Object.freeze(Object.fromEntries(
 MINE_ROOMS.flatMap(room=>['left','right'].map(side=>[room+'-'+side,MINE_FILES[side]]))
));
const art=Object.create(null),layers=new Map(),imagePaths=new Map();
const roomKeys=roomId=>[roomId,'rubble',...new Set(MINE_SCENERY[roomId].map(p=>p.asset)),...MINE_ACTORS[roomId],roomId+'-left',roomId+'-right'];
export function initPremiumMine(ImageCtor=globalThis.Image,roomId='q2r1'){
 if(!ImageCtor||!isPremiumMineRoom(roomId))return;
 for(const key of roomKeys(roomId)){
  if(art[key])continue;
  const path=MINE_FILES[key]||MINE_FRAMES[key];let image=imagePaths.get(path);
  if(!image){image=new ImageCtor();image.decoding='async';image.src=path;imagePaths.set(path,image);}
  art[key]=image;
 }
}
const ready=key=>!!art[key]?.complete&&art[key].naturalWidth>0;
export function premiumMineReady(roomId='q2r1'){
 return isPremiumMineRoom(roomId)&&roomKeys(roomId).every(ready);
}
const roomIndex=id=>MINE_ROOMS.indexOf(id);
const floorPalette=[
 {ambient:'22,30,40',light:'244,177,87'},
 {ambient:'11,32,49',light:'92,208,234'},
 {ambient:'38,30,35',light:'250,196,93'},
 {ambient:'30,27,32',light:'245,159,79'},
 {ambient:'27,19,48',light:'183,112,249'}
];
function oval(ctx,x,y,rx,ry,rgb,strength){
 ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);
 const g=ctx.createRadialGradient(0,0,0,0,0,1);
 g.addColorStop(0,`rgba(${rgb},${strength})`);
 g.addColorStop(.33,`rgba(${rgb},${strength*.45})`);
 g.addColorStop(1,`rgba(${rgb},0)`);
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.restore();
}
export function paintPremiumMineFloor(ctx,s,roomId='q2r1'){
 if(!premiumMineReady(roomId)||s.iso)return false;
 const {originX:x,originY:y,cell:c}=s;
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.drawImage(art[roomId],x,y,9*c,7*c);
 ctx.lineWidth=Math.max(.75,c*.011);
 ctx.strokeStyle='rgba(208,211,218,.13)';
 for(let i=1;i<9;i++){ctx.beginPath();ctx.moveTo(x+i*c,y);ctx.lineTo(x+i*c,y+7*c);ctx.stroke()}
 for(let i=1;i<7;i++){ctx.beginPath();ctx.moveTo(x,y+i*c);ctx.lineTo(x+9*c,y+i*c);ctx.stroke()}
 ctx.restore();return true;
}
export function mineWallArt(roomId,x,y){
 const code=(x*11+y*7+x*y*3+roomIndex(roomId)*5)%7;
 if(roomId==='q2r1')return code<4?'cyan':code<6?'rubble':'timber';
 if(roomId==='q2r2')return code<4?'cyan':code<6?'rubble':'timber';
 if(roomId==='q2r3')return code<4?'amber':code<6?'timber':'rubble';
 if(roomId==='q2r4')return code<4?'timber':code<6?'rubble':'amber';
 return code<5?'amethyst':code===5?'cyan':'rubble';
}
export function paintPremiumMineWall(ctx,s,x,y,roomId='q2r1'){
 if(!premiumMineReady(roomId)||s.iso)return false;
 const pt=s.at(x,y),c=s.cell,key=mineWallArt(roomId,x,y),img=ready(key)?art[key]:art.rubble;
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.beginPath();ctx.rect(s.originX+x*c,s.originY+y*c,c,c);ctx.clip();
 ctx.drawImage(img,pt.x-c*.5,pt.y-c*.5,c,c);
 ctx.restore();return true;
}
function drawConnectedScenery(ctx,s,roomId){
 const c=s.cell;ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 for(const piece of MINE_SCENERY[roomId]){
  ctx.save();ctx.beginPath();
  for(const [x,y] of piece.cells)ctx.rect(s.originX+x*c,s.originY+y*c,c,c);
  ctx.clip();
  ctx.drawImage(art[piece.asset],s.originX+piece.x*c,s.originY+piece.y*c,piece.w*c,piece.h*c);
  ctx.restore();
 }
 ctx.restore();
}
/** Physical scenery occupies only verified blocked cells. Its soft cast shadow
 * is composited afterwards so natural edges do not acquire square outlines. */
export function paintPremiumMineConnectedWalls(ctx,s,walls=[],roomId='q2r1'){
 if(!premiumMineReady(roomId)||s.iso)return false;
 const blueprint=MINE_WALL_BLUEPRINTS[roomId];if(!blueprint)return false;
 const expected=new Set();for(let y=0;y<7;y++)for(let x=0;x<9;x++)if(blueprint[y][x]==='#')expected.add(`${x},${y}`);
 const actual=new Set(walls.map(([x,y])=>`${x},${y}`));
 if(walls.length!==expected.size||actual.size!==expected.size||[...actual].some(cell=>!expected.has(cell)))return false;
 if(typeof OffscreenCanvas==='undefined'){drawConnectedScenery(ctx,s,roomId);return true;}
 const ratio=Math.min(2,Math.max(1,ctx.getTransform?.().a||1)),key=`${roomId}:${s.cell}:${ratio}`;
 let layer=layers.get(key);
 if(!layer){
  const physical=new OffscreenCanvas(Math.ceil(9*s.cell*ratio),Math.ceil(7*s.cell*ratio));
  const brush=physical.getContext('2d');brush.scale(ratio,ratio);
  drawConnectedScenery(brush,{...s,originX:0,originY:0},roomId);
  layer=new OffscreenCanvas(physical.width,physical.height);
  const shadow=layer.getContext('2d');shadow.shadowColor='rgba(5,8,15,.48)';
  shadow.shadowBlur=s.cell*ratio*.085;shadow.shadowOffsetX=s.cell*ratio*.045;shadow.shadowOffsetY=s.cell*ratio*.065;
  shadow.drawImage(physical,0,0);layers.set(key,layer);
  while(layers.size>3)layers.delete(layers.keys().next().value);
 }
 ctx.drawImage(layer,s.originX,s.originY,layer.width/ratio,layer.height/ratio);return true;
}
export function paintPremiumMineLighting(ctx,s,walls=[],roomId='q2r1'){
 if(!premiumMineReady(roomId)||s.iso)return false;
 const {originX:x,originY:y,cell:c}=s,w=9*c,h=7*c,index=roomIndex(roomId),palette=floorPalette[index];
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
 const ambient=ctx.createLinearGradient(x,y,x+w,y+h);
 ambient.addColorStop(0,`rgba(${palette.ambient},.06)`);
 ambient.addColorStop(.52,'rgba(4,7,14,.05)');ambient.addColorStop(1,'rgba(1,3,10,.10)');
 ctx.fillStyle=ambient;ctx.fillRect(x,y,w,h);
 const lamps=index===0?[[.10,.18],[.55,.67],[.89,.28]]:index===3?[[.12,.27],[.84,.19],[.46,.76]]:
               index===4?[[.50,.40],[.28,.24],[.78,.72]]:[[.18,.25],[.72,.30],[.51,.75]];
 for(const [xx,yy] of lamps){
  const rx=w*(index===4?.31:.18),ry=h*(index===4?.38:.28);
  oval(ctx,x+w*xx,y+h*yy,rx,ry,palette.light,index===4?.12:.08);
 }

 ctx.restore();return true;
}
export function paintPremiumMineAtmosphere(ctx,s,roomId='q2r1',timeMs=0,motion=true,lit=true){
 if(!premiumMineReady(roomId)||s.iso)return false;
 const {originX:x,originY:y,cell:c}=s,w=9*c,h=7*c,index=roomIndex(roomId),pal=floorPalette[index];
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
 const dark=ctx.createRadialGradient(x+w*.50,y+h*.48,w*.12,x+w*.50,y+h*.48,w*.73);
 dark.addColorStop(0,'rgba(0,2,9,0)');dark.addColorStop(.65,'rgba(0,2,9,.05)');dark.addColorStop(1,'rgba(0,1,6,.24)');
 ctx.fillStyle=dark;ctx.fillRect(x,y,w,h);
 // Pinprick mineral reflections; stable frame positions and low opacity.
 const t=motion?timeMs*.0007:0;
 for(let i=0;i<(lit?(index===4?12:7):0);i++){
  const nx=((i*67+11)%103)/103,ny=((i*43+5)%97)/97;
  const glint=(.22+Math.sin(t*2+i*1.7)*.10)*(index===4?.75:.48);
  oval(ctx,x+nx*w,y+ny*h,c*.045,c*.065,pal.light,glint);
 }
 ctx.restore();return true;
}
export function paintPremiumMineForeground(ctx,s,actors=[],timeMs=0,motion=true,roomId='q2r1'){
 if(!premiumMineReady(roomId)||s.iso)return false;
 const {originX:x,originY:y,cell:c}=s,w=9*c,h=7*c,t=motion?timeMs*.000025:0;
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
 for(let i=0;i<7;i++){
  const nx=((i*37+11)%97)/97,ny=(((i*59+29)%89)/89+t*(.5+(i%3)*.21))%1;
  let min=Infinity;
  for(const a of actors){const p=a.p||a;if(!Number.isFinite(p?.x))continue;min=Math.min(min,Math.hypot(nx*9-p.x-.5,ny*7-p.y-.5))}
  const fade=min<1.25?.1:min<2?.34:1;
  ctx.globalAlpha=fade*(.06+(.015*Math.sin(t*85+i)));
  ctx.fillStyle=roomId==='q2r5'?'#d0b1ff':'#bbcfd1';
  ctx.beginPath();ctx.ellipse(x+w*nx,y+h*ny,c*.025,c*.040,i*.9,0,Math.PI*2);ctx.fill();
 }
 ctx.restore();return true;
}
export function paintPremiumMineContactShadow(ctx,s,p){
 if(!p||!Number.isFinite(p.x)||s.iso)return false;
 const giant=p.variant==='large'||p.variant==='large-shiny';
 const pt=s.at(p.x+(giant?.5:0),p.y+(giant?.5:0)),c=s.cell;
 oval(ctx,pt.x,pt.y+c*.28,c*(giant?.68:.42),c*.16,'1,3,10',.64);return true;
}
export function paintPremiumMineActor(ctx,s,p,kind,sprite,{label='',selected=false,active=false,motion=true,timeMs=0,roomId='q2r1'}={}){
 if(!premiumMineReady(roomId)||s.iso||!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return false;
 const giant=kind==='enemy'&&(p.variant==='large'||p.variant==='large-shiny');
 const c=s.cell,pt=s.at(p.x+(giant?.5:0),p.y+(giant?.5:0));
 const shiny=kind==='enemy'&&(p.variant==='shiny'||p.variant==='large-shiny');
 const boss=kind==='enemy'&&p.variant==='boss';
 if(boss&&p.faces===12&&ready('bossD12'))sprite=art.bossD12;
 else if(shiny&&p.faces===4&&ready('shinyD4'))sprite=art.shinyD4;
 else if(shiny&&p.faces===6&&ready('shinyD6'))sprite=art.shinyD6;
 else if(kind==='enemy'&&p.faces===4&&ready('normalD4'))sprite=art.normalD4;
 else if(kind==='enemy'&&p.faces===6&&ready('normalD6'))sprite=art.normalD6;
 else if(kind==='enemy'&&p.faces===8&&ready('normalD8'))sprite=art.normalD8;
 if(!sprite?.complete||!sprite.naturalWidth)return false;
 ctx.save();
 if(shiny||boss){
  oval(ctx,pt.x,pt.y+c*.17,c*(boss?.87:.62),c*.44,boss?'181,100,237':'90,216,236',boss?.16:.12);
 }
 if(selected||active){
  ctx.strokeStyle=selected?'#ffbb70':'#d9f4df';ctx.lineWidth=Math.max(2,c*.032);
  ctx.beginPath();ctx.ellipse(pt.x,pt.y+c*.24,c*(giant?.72:.44),c*.19,0,0,Math.PI*2);ctx.stroke();
 }
 paintPremiumMineContactShadow(ctx,s,p);
 const bob=motion&&p.hp>0?Math.sin(timeMs*.0022+p.x*7+p.y*11)*c*.014:0;
 const imageSize=c*(boss?1.42:shiny?1.24:kind==='enemy'?1.20:1.40)*(giant?1.6:1);
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.shadowColor=boss?'rgba(60,41,82,.38)':shiny?'rgba(31,67,80,.38)':'rgba(1,3,10,.80)';
 ctx.shadowBlur=c*(shiny||boss?.10:.08);ctx.shadowOffsetY=c*.055;
 // Every upgraded dice creature is a transparent, square art asset.
 // Never crop their upper crystals or feet as we did for the old placeholders.
 ctx.drawImage(sprite,pt.x-imageSize*.50,pt.y-imageSize*.58+bob,imageSize,imageSize);
 ctx.restore();
 const y=pt.y+c*(giant?.78:.48),text=label|| (kind==='enemy'?`D${p.faces||8}`:p.name||'Player');
 const fs=Math.max(9,c*(giant?.235:.215));ctx.textAlign='center';ctx.textBaseline='alphabetic';
 ctx.font=`700 ${fs}px system-ui,sans-serif`;
 const width=Math.min(c*1.5,Math.max(c*.62,text.length*fs*.60+c*.15));
 ctx.fillStyle='rgba(5,10,22,.79)';ctx.beginPath();ctx.roundRect(pt.x-width/2,y-fs*.98,width,fs*1.4,fs*.32);ctx.fill();
 ctx.lineJoin='round';ctx.lineWidth=Math.max(2.4,fs*.29);ctx.strokeStyle='#07121b';ctx.fillStyle='#fff4e9';
 ctx.strokeText(text,pt.x,y);ctx.fillText(text,pt.x,y);
 if(kind==='enemy'){
  const ratio=Number.isFinite(p.maxHp)&&p.maxHp>0?Math.max(0,Math.min(1,p.hp/p.maxHp)):1;
  const bar=c*(giant?.94:.73),by=y+c*.10;ctx.fillStyle='#091322';
  ctx.fillRect(pt.x-bar/2-1,by-1,bar+2,Math.max(4,c*.076)+2);
  ctx.fillStyle=shiny?'#70e9ed':boss?'#dc89fc':'#e38386';ctx.fillRect(pt.x-bar/2,by,bar*ratio,Math.max(4,c*.076));
 }else if(p.hp===0){ctx.fillStyle='#f6a4a7';ctx.fillText('DOWN',pt.x,pt.y-c*.55)}
 ctx.restore();return true;
}
export function mineFrameImage(side,roomId='q2r1'){return art[roomId+'-'+side]||art[side]}
