/**
 * DICEBOUND 4.0 V2 — Quest 2 All That Glitters, five illustrated mine rooms.
 * Purely visual: no room definitions, collision, item/loot, combat, quests,
 * network, player positions, RNG or server authority are changed here.
 */
export const GIANT_ROOMS = Object.freeze(['q3r1','q3r2','q3r3','q3r4','q3r5']);
export const isPremiumGiantRoom = id => GIANT_ROOMS.includes(id);
export const GIANT_FILES = Object.freeze({
  q3r1:'./assets/premium-giantwood/trampled-trail-ground.jpg',
  q3r2:'./assets/premium-giantwood/giants-clearing-ground.jpg',
  q3r3:'./assets/premium-giantwood/root-maze-ground.jpg',
  q3r4:'./assets/premium-giantwood/hollow-tree-ground.jpg',
  q3r5:'./assets/premium-giantwood/elder-grove-ground.jpg',
  rubble:'./assets/premium-giantwood/moss-rock.png',
  timber:'./assets/premium-giantwood/root.png',
  cyan:'./assets/premium-giantwood/giant-fern.png',
  amber:'./assets/premium-giantwood/ancient-stone.png',
  amethyst:'./assets/premium-giantwood/root.png',
  normalD4:'./assets/premium-giantwood/d4-q3r1.png',
  normalD6:'./assets/premium-giantwood/d6-q3r1.png',
  shinyD4:'./assets/premium-giantwood/d4-shiny-q3r1.png',
  shinyD6:'./assets/premium-giantwood/d6-shiny-q3r1.png',
  bossD12:'./assets/premium-giantwood/boss-d12-q3r1.png',
  largeD4:'./assets/premium-giantwood/large-d4-q3r1.png',
  largeD6:'./assets/premium-giantwood/large-d6-q3r1.png',
  largeD8:'./assets/premium-giantwood/large-d8-q3r1.png',
  left:'./assets/premium-giantwood/trampled-trail-frame-left.jpg',
  right:'./assets/premium-giantwood/trampled-trail-frame-right.jpg'
});
// Independent per-room forest scenery; never baked into game coordinates.
export const GIANT_FRAMES=Object.freeze(Object.fromEntries(
 GIANT_ROOMS.flatMap(room=>['left','right'].map(side=>[room+'-'+side,
  `./assets/premium-giantwood/${({q3r1:'trampled-trail',q3r2:'giants-clearing',q3r3:'root-maze',q3r4:'hollow-tree',q3r5:'elder-grove'})[room]}-frame-${side}.jpg`]))
));
const art=Object.create(null);let initiated=false;
export function initPremiumGiant(ImageCtor=typeof Image!=='undefined'?Image:null){
 if(!ImageCtor||initiated)return;initiated=true;
 for(const [name,path] of Object.entries({...GIANT_FILES,...GIANT_FRAMES})){
  const image=new ImageCtor();image.decoding='async';image.src=path;art[name]=image;
 }
}
const ready=key=>!!art[key]?.complete&&art[key].naturalWidth>0;
export function premiumGiantReady(roomId='q3r1'){
 return isPremiumGiantRoom(roomId)&&ready(roomId)&&ready('rubble')&&ready('timber')&&ready('cyan')&&ready('amethyst');
}
const roomIndex=id=>GIANT_ROOMS.indexOf(id);
const floorPalette=[
 {ambient:'34,51,22',light:'248,186,101'},
 {ambient:'17,56,31',light:'167,231,116'},
 {ambient:'19,43,26',light:'224,178,98'},
 {ambient:'12,41,41',light:'101,215,188'},
 {ambient:'30,49,20',light:'244,197,111'}
];
function oval(ctx,x,y,rx,ry,rgb,strength){
 ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);
 const g=ctx.createRadialGradient(0,0,0,0,0,1);
 g.addColorStop(0,`rgba(${rgb},${strength})`);
 g.addColorStop(.33,`rgba(${rgb},${strength*.45})`);
 g.addColorStop(1,`rgba(${rgb},0)`);
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.restore();
}
export function paintPremiumGiantFloor(ctx,s,roomId='q3r1'){
 if(!premiumGiantReady(roomId)||s.iso)return false;
 const {originX:x,originY:y,cell:c}=s;
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.drawImage(art[roomId],x,y,9*c,7*c);
 ctx.lineWidth=Math.max(.75,c*.011);
 ctx.strokeStyle=roomId==='q3r5'?'rgba(221,214,143,.23)':'rgba(211,215,159,.18)';
 for(let i=1;i<9;i++){ctx.beginPath();ctx.moveTo(x+i*c,y);ctx.lineTo(x+i*c,y+7*c);ctx.stroke()}
 for(let i=1;i<7;i++){ctx.beginPath();ctx.moveTo(x,y+i*c);ctx.lineTo(x+9*c,y+i*c);ctx.stroke()}
 ctx.restore();return true;
}
export function giantWallArt(roomId,x,y){
  const code=(x*13+y*19+x*y*3+GIANT_ROOMS.indexOf(roomId)*7)%11;
  if(roomId==='q3r1')return code<5?'rubble':code<8?'timber':'cyan';
  if(roomId==='q3r2')return code<6?'timber':code<9?'rubble':'amber';
  if(roomId==='q3r3')return code<7?'timber':code<9?'rubble':'amethyst';
  if(roomId==='q3r4')return code<5?'cyan':code<8?'timber':'rubble';
  return code<5?'amber':code<8?'timber':'rubble';
}
export function paintPremiumGiantWall(ctx,s,x,y,roomId='q3r1'){
 if(!premiumGiantReady(roomId)||s.iso)return false;
 const pt=s.at(x,y),c=s.cell,key=giantWallArt(roomId,x,y),img=ready(key)?art[key]:art.rubble;
 const sz=c*(key==='timber'?1.36:key==='rubble'?1.43:1.49);
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.shadowColor='rgba(2,4,12,.84)';ctx.shadowBlur=c*.18;ctx.shadowOffsetY=c*.10;
 ctx.drawImage(img,pt.x-sz*.5,pt.y-sz*.53,sz,sz);
 ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;
 ctx.strokeStyle=roomId==='q3r5'?'rgba(212,189,99,.34)':'rgba(163,202,133,.31)';
 ctx.lineWidth=Math.max(.8,c*.013);
 ctx.strokeRect(s.originX+x*c+2,s.originY+y*c+2,c-4,c-4);
 ctx.restore();return true;
}
export function paintPremiumGiantLighting(ctx,s,walls=[],roomId='q3r1'){
 if(!premiumGiantReady(roomId)||s.iso)return false;
 const {originX:x,originY:y,cell:c}=s,w=9*c,h=7*c,index=roomIndex(roomId),palette=floorPalette[index];
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
 const ambient=ctx.createLinearGradient(x,y,x+w,y+h);
 ambient.addColorStop(0,`rgba(${palette.ambient},.22)`);
 ambient.addColorStop(.52,'rgba(4,7,14,.05)');ambient.addColorStop(1,'rgba(1,3,10,.29)');
 ctx.fillStyle=ambient;ctx.fillRect(x,y,w,h);
 const lamps=index===0?[[.10,.18],[.55,.67],[.89,.28]]:index===3?[[.12,.27],[.84,.19],[.46,.76]]:
               index===4?[[.50,.40],[.28,.24],[.78,.72]]:[[.18,.25],[.72,.30],[.51,.75]];
 for(const [xx,yy] of lamps){
  const rx=w*(index===4?.31:.18),ry=h*(index===4?.38:.28);
  oval(ctx,x+w*xx,y+h*yy,rx,ry,palette.light,index===4?.33:.23);
 }
 for(const [tx,ty] of walls){
  oval(ctx,x+(tx+.85)*c,y+(ty+.80)*c,c*.80,c*.35,'2,4,10',.54);
 }
 ctx.restore();return true;
}
export function paintPremiumGiantAtmosphere(ctx,s,roomId='q3r1',timeMs=0,motion=true,lit=true){
 if(!premiumGiantReady(roomId)||s.iso)return false;
 const {originX:x,originY:y,cell:c}=s,w=9*c,h=7*c,index=roomIndex(roomId),pal=floorPalette[index];
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
 const dark=ctx.createRadialGradient(x+w*.50,y+h*.48,w*.12,x+w*.50,y+h*.48,w*.73);
 dark.addColorStop(0,'rgba(0,2,9,0)');dark.addColorStop(.65,'rgba(0,2,9,.05)');dark.addColorStop(1,'rgba(0,1,6,.46)');
 ctx.fillStyle=dark;ctx.fillRect(x,y,w,h);
 // Pinprick mineral reflections; stable frame positions and low opacity.
 const t=motion?timeMs*.0007:0;
 for(let i=0;i<(lit?(index===4?27:14):0);i++){
  const nx=((i*67+11)%103)/103,ny=((i*43+5)%97)/97;
  const glint=(.22+Math.sin(t*2+i*1.7)*.10)*(index===4?.75:.48);
  oval(ctx,x+nx*w,y+ny*h,c*.045,c*.065,pal.light,glint);
 }
 ctx.restore();return true;
}
export function paintPremiumGiantForeground(ctx,s,actors=[],timeMs=0,motion=true,roomId='q3r1'){
 if(!premiumGiantReady(roomId)||s.iso)return false;
 const {originX:x,originY:y,cell:c}=s,w=9*c,h=7*c,t=motion?timeMs*.000025:0;
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
 for(let i=0;i<13;i++){
  const nx=((i*37+11)%97)/97,ny=(((i*59+29)%89)/89+t*(.5+(i%3)*.21))%1;
  let min=Infinity;
  for(const a of actors){const p=a.p||a;if(!Number.isFinite(p?.x))continue;min=Math.min(min,Math.hypot(nx*9-p.x-.5,ny*7-p.y-.5))}
  const fade=min<1.25?.1:min<2?.34:1;
  ctx.globalAlpha=fade*(.12+(.035*Math.sin(t*85+i)));
  ctx.fillStyle=roomId==='q3r5'?'#d0b1ff':'#bbcfd1';
  ctx.beginPath();ctx.ellipse(x+w*nx,y+h*ny,c*.025,c*.040,i*.9,0,Math.PI*2);ctx.fill();
 }
 ctx.restore();return true;
}
export function paintPremiumGiantContactShadow(ctx,s,p){
 if(!p||!Number.isFinite(p.x)||s.iso)return false;
 const giant=p.variant==='large'||p.variant==='large-shiny';
 const pt=s.at(p.x+(giant?.5:0),p.y+(giant?.5:0)),c=s.cell;
 oval(ctx,pt.x,pt.y+c*.28,c*(giant?.68:.42),c*.16,'1,3,10',.64);return true;
}
export function paintPremiumGiantActor(ctx,s,p,kind,sprite,{label='',selected=false,active=false,motion=true,timeMs=0,roomId='q3r1'}={}){
 if(!premiumGiantReady(roomId)||s.iso||!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return false;
 const giant=kind==='enemy'&&(p.variant==='large'||p.variant==='large-shiny');
 const c=s.cell,pt=s.at(p.x+(giant?.5:0),p.y+(giant?.5:0));
 const shiny=kind==='enemy'&&(p.variant==='shiny'||p.variant==='large-shiny');
 const boss=kind==='enemy'&&p.variant==='boss';
 if(boss&&p.faces===12&&ready('bossD12'))sprite=art.bossD12;
 else if(giant&&p.faces===4&&ready('largeD4'))sprite=art.largeD4;
 else if(giant&&p.faces===6&&ready('largeD6'))sprite=art.largeD6;
 else if(giant&&p.faces===8&&ready('largeD8'))sprite=art.largeD8;
 else if(shiny&&p.faces===4&&ready('shinyD4'))sprite=art.shinyD4;
 else if(shiny&&p.faces===6&&ready('shinyD6'))sprite=art.shinyD6;
 else if(kind==='enemy'&&p.faces===4&&ready('normalD4'))sprite=art.normalD4;
 else if(kind==='enemy'&&p.faces===6&&ready('normalD6'))sprite=art.normalD6;
 if(!sprite?.complete||!sprite.naturalWidth)return false;
 ctx.save();
 if(shiny||boss){
  oval(ctx,pt.x,pt.y+c*.17,c*(boss?.87:.62),c*.44,boss?'243,177,58':'141,235,163',boss?.40:.34);
 }
 if(selected||active){
  ctx.strokeStyle=selected?'#ffbb70':'#d9f4df';ctx.lineWidth=Math.max(2,c*.032);
  ctx.beginPath();ctx.ellipse(pt.x,pt.y+c*.24,c*(giant?.72:.44),c*.19,0,0,Math.PI*2);ctx.stroke();
 }
 paintPremiumGiantContactShadow(ctx,s,p);
 const bob=motion&&p.hp>0?Math.sin(timeMs*.0022+p.x*7+p.y*11)*c*.014:0;
 const imageSize=c*(boss?1.76:shiny?1.53:kind==='enemy'?1.29:1.40)*(giant?1.6:1);
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.shadowColor=boss?'rgba(239,159,72,.58)':shiny?'rgba(75,204,155,.57)':'rgba(1,3,10,.80)';
 ctx.shadowBlur=c*(shiny||boss?.25:.11);ctx.shadowOffsetY=c*.055;
 // Every upgraded dice creature is a transparent, square art asset.
 // Never crop their upper crystals or feet as we did for the old placeholders.
 const spriteRatio=Math.max(.32,Math.min(1.6,sprite.naturalHeight/sprite.naturalWidth));
 const drawW=imageSize*(boss?1.27:1);const drawH=drawW*spriteRatio;
 ctx.drawImage(sprite,pt.x-drawW*.5,pt.y-drawH*.58+bob,drawW,drawH);
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
  ctx.fillStyle=shiny?'#70e9d3':boss?'#e5be76':'#e38386';ctx.fillRect(pt.x-bar/2,by,bar*ratio,Math.max(4,c*.076));
 }else if(p.hp===0){ctx.fillStyle='#f6a4a7';ctx.fillText('DOWN',pt.x,pt.y-c*.55)}
 ctx.restore();return true;
}
export function giantFrameImage(side,roomId='q3r1'){return art[roomId+'-'+side]||art[side]}
