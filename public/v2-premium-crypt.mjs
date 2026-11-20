import {Q6_LAYOUTS} from './v2-quest6-layouts.mjs';
import {CRYPT_SPRITE_CROPS} from './v2-crypt-sprite-crops.mjs';

const base='./assets/premium-crypt/';
export const CRYPT_FILES=Object.freeze({
  floor:base+'crypt-floor-r1.webp', moor:base+'graveyard-floor-r1.webp',
  masonry:base+'crypt-masonry-r1.webp', tomb:base+'sarcophagus-r1.webp',
  ghost:base+'ghost-atlas-r1.webp', zombie:base+'zombie-atlas-r1.webp',
  teleporter:base+'teleporter-atlas-r1.webp', normal:base+'sentinel-atlas-r1.webp',
  boss:base+'drowned-boss-r1.webp'
});
export const isPremiumCryptRoom=id=>Object.hasOwn(Q6_LAYOUTS,id);
const art={},requested=new Set(),layers=new Map();
const ready=key=>Boolean(art[key]?.complete&&art[key].naturalWidth>0);
const floorKey=id=>['q6r1','q6r2','q6r4','q6r5'].includes(id)?'moor':'floor';
export function initPremiumCrypt(ImageCtor=globalThis.Image,roomId='q6r3'){
  if(!ImageCtor||!isPremiumCryptRoom(roomId))return;
  for(const [key,path]of Object.entries(CRYPT_FILES)){
    if(requested.has(key))continue;requested.add(key);
    const im=new ImageCtor();im.decoding='async';im.src=path;art[key]=im;
  }
}
export const premiumCryptReady=id=>isPremiumCryptRoom(id)&&ready(floorKey(id))&&ready('masonry');
export function cryptSprite(p){
  if(p.variant==='boss')return {key:'boss',col:0,row:0,cols:1,rows:1};
  const key=['ghost','zombie','teleporter'].includes(p.role)?p.role:'normal';
  if(key==='normal')return [8,10].includes(p.faces)?{key,col:p.faces===10?1:0,row:0,cols:2,rows:1}:null;
  const i=[6,8,10,12].indexOf(p.faces);
  return i<0?null:{key,col:i%2,row:Math.floor(i/2),cols:2,rows:2};
}
const clipBoard=(ctx,s)=>{ctx.beginPath();ctx.rect(s.originX,s.originY,13*s.cell,9*s.cell);ctx.clip();};
const keyOf=(x,y)=>`${x},${y}`;
function glow(ctx,x,y,rx,ry,color,alpha){
  ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);
  const g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,`rgba(${color},${alpha})`);g.addColorStop(1,`rgba(${color},0)`);
  ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore();
}
export function paintPremiumCryptFloor(ctx,s,id){
  if(!premiumCryptReady(id)||s.iso)return false;
  const c=s.cell,x=s.originX,y=s.originY;ctx.save();
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  const flipped=['q6r2','q6r5','q6r7'].includes(id);
  if(flipped){ctx.translate(x+13*c,y+9*c);ctx.rotate(Math.PI);ctx.drawImage(art[floorKey(id)],0,0,13*c,9*c);}
  else ctx.drawImage(art[floorKey(id)],x,y,13*c,9*c);
  ctx.restore();ctx.save();
  ctx.strokeStyle='rgba(189,219,216,.13)';ctx.lineWidth=Math.max(.5,c*.008);ctx.beginPath();
  for(let i=1;i<13;i++){ctx.moveTo(x+i*c,y);ctx.lineTo(x+i*c,y+9*c);}
  for(let i=1;i<9;i++){ctx.moveTo(x,y+i*c);ctx.lineTo(x+13*c,y+i*c);}ctx.stroke();
  if(id==='q6r8')glow(ctx,x+9.5*c,y+4.5*c,4*c,3*c,'195,164,91',.12);
  ctx.restore();return true;
}
export function paintPremiumCryptSurround(ctx,s,w,h,id){
  if(!premiumCryptReady(id)||s.iso)return false;
  ctx.save();ctx.drawImage(art[floorKey(id)],0,0,w,h);
  ctx.fillStyle='rgba(5,16,21,.64)';ctx.fillRect(0,0,w,h);ctx.restore();return true;
}
export function cryptWallEdges(walls){
  const set=new Set(walls.map(p=>p.join(','))),edges=[];
  for(const [x,y] of walls)for(const [dx,dy,side]of [[0,-1,'north'],[1,0,'east'],[0,1,'south'],[-1,0,'west']])
    if(!set.has(keyOf(x+dx,y+dy)))edges.push({x,y,side});
  return edges;
}
function wallMask(ctx,s,walls){
  const c=s.cell,set=new Set(walls.map(p=>p.join(','))),inset=.025*c;ctx.beginPath();
  for(const[x,y]of walls){
    const l=set.has(keyOf(x-1,y))?0:inset,r=set.has(keyOf(x+1,y))?0:inset;
    const t=set.has(keyOf(x,y-1))?0:inset,b=set.has(keyOf(x,y+1))?0:inset;
    ctx.rect(s.originX+x*c+l,s.originY+y*c+t,c-l-r,c-t-b);
  }
}
function drawWalls(ctx,s,walls,id){
  const c=s.cell,x0=s.originX,y0=s.originY;ctx.save();wallMask(ctx,s,walls);ctx.clip();
  // A continuous material crosses tile boundaries; only exposed edges receive bevels.
  const tile=3.7*c;
  for(let y=0;y<9*c;y+=tile)for(let x=0;x<13*c;x+=tile)ctx.drawImage(art.masonry,x0+x,y0+y,tile,tile);
  for(const {x,y,side}of cryptWallEdges(walls)){
    const X=x0+x*c,Y=y0+y*c;
    if(side==='south'){
      const g=ctx.createLinearGradient(0,Y+c*.69,0,Y+c);g.addColorStop(0,'rgba(1,9,14,.17)');g.addColorStop(1,'rgba(1,8,12,.86)');
      ctx.fillStyle=g;ctx.fillRect(X,Y+c*.70,c,c*.30);
      ctx.strokeStyle='rgba(6,14,18,.30)';ctx.lineWidth=c*.018;ctx.beginPath();ctx.moveTo(X,Y+c*.86);ctx.lineTo(X+c,Y+c*.86);ctx.stroke();
    }else if(side==='east'){
      const g=ctx.createLinearGradient(X+c*.80,0,X+c,0);g.addColorStop(0,'rgba(2,13,17,0)');g.addColorStop(1,'rgba(2,13,17,.55)');ctx.fillStyle=g;ctx.fillRect(X+c*.80,Y,c*.20,c);
    }else{
      ctx.strokeStyle='rgba(199,215,205,.44)';ctx.lineWidth=Math.max(.7,c*.018);ctx.beginPath();
      if(side==='north'){ctx.moveTo(X,Y+c*.04);ctx.lineTo(X+c,Y+c*.04);}
      else{ctx.moveTo(X+c*.04,Y);ctx.lineTo(X+c*.04,Y+c);}ctx.stroke();
    }
  }
  if(ready('tomb')&&['q6r1','q6r2','q6r5','q6r8'].includes(id)){
    for(const f of Q6_LAYOUTS[id].formations){
      const xs=f.cells.map(p=>p[0]),ys=f.cells.map(p=>p[1]);
      const x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x+1,h=Math.max(...ys)-y+1;
      if(w<2||h<2)continue;
      const width=Math.min(w,2)*c*.74,height=Math.min(h,3)*c*.78;
      ctx.drawImage(art.tomb,x0+(x+w/2)*c-width/2,y0+(y+h/2)*c-height/2-c*.06,width,height);
    }
  }
  ctx.restore();
}
export function paintPremiumCryptWalls(ctx,s,walls,id){
  if(!premiumCryptReady(id)||s.iso)return false;
  const ratio=Math.min(2,Math.max(1,ctx.getTransform?.().a||1));
  const key=`${id}:${s.cell}:${ratio}:${ready('tomb')}:${walls.map(p=>p.join(',')).join(';')}`;
  if(typeof OffscreenCanvas==='undefined'){drawWalls(ctx,s,walls,id);return true;}
  let layer=layers.get(key);
  if(!layer){
    const physical=new OffscreenCanvas(Math.ceil(13*s.cell*ratio),Math.ceil(9*s.cell*ratio));
    const brush=physical.getContext('2d');brush.scale(ratio,ratio);drawWalls(brush,{...s,originX:0,originY:0},walls,id);
    layer=new OffscreenCanvas(physical.width,physical.height);const out=layer.getContext('2d');
    out.shadowColor='rgba(0,8,13,.82)';out.shadowBlur=s.cell*ratio*.14;out.shadowOffsetX=s.cell*ratio*.07;out.shadowOffsetY=s.cell*ratio*.13;out.drawImage(physical,0,0);
    layers.set(key,layer);while(layers.size>4)layers.delete(layers.keys().next().value);
  }
  ctx.drawImage(layer,s.originX,s.originY,layer.width/ratio,layer.height/ratio);return true;
}
export function paintPremiumCryptAtmosphere(ctx,s,id,timeMs=0,motion=true,light=true){
  if(!premiumCryptReady(id)||s.iso)return false;
  const c=s.cell;ctx.save();clipBoard(ctx,s);
  if(light){
    glow(ctx,s.originX+c*2,s.originY+c*.5,c*5,c*3,'181,212,210',.12);
    const g=ctx.createLinearGradient(0,s.originY,0,s.originY+c*9);g.addColorStop(0,'rgba(8,26,32,0)');g.addColorStop(1,'rgba(5,15,23,.17)');ctx.fillStyle=g;ctx.fillRect(s.originX,s.originY,13*c,9*c);
  }
  if(motion){ctx.fillStyle='rgba(174,216,210,.24)';for(let i=0;i<9;i++){
    const x=(i*1.47+timeMs*.000025)%13,y=(i*2.37+Math.sin(timeMs*.0002+i)*.05)%9;
    ctx.beginPath();ctx.arc(s.originX+x*c,s.originY+y*c,c*.016,0,Math.PI*2);ctx.fill();
  }}ctx.restore();return true;
}
export function paintPremiumCryptActor(ctx,s,p,kind,sprite,{label='',selected=false,active=false,motion=true,timeMs=0,roomId='q6r3'}={}){
  if(!premiumCryptReady(roomId)||s.iso||!p)return false;
  const enemy=kind==='enemy',spec=enemy?cryptSprite(p):null;
  if(enemy){if(!spec||!ready(spec.key))return false;sprite=art[spec.key];}
  if(!sprite?.complete||!sprite.naturalWidth)return false;
  const c=s.cell,pt=s.at(p.x,p.y),boss=enemy&&p.variant==='boss',ghost=enemy&&p.role==='ghost',rift=enemy&&p.role==='teleporter';
  const size=c*(enemy?(boss?1.46:1.32):1.23),bob=motion?Math.sin(timeMs*.0018+p.x*3+p.y)*c*(ghost?.035:.007):0;
  ctx.save();glow(ctx,pt.x,pt.y+c*.22,c*(boss?.52:.4),c*.16,'0,8,15',ghost?.30:.72);
  if(ghost||rift)glow(ctx,pt.x,pt.y+c*.22,c*.43,c*.18,ghost?'120,231,214':'170,126,244',.22);
  if(selected||active){ctx.strokeStyle=selected?'#fff2bd':'#e4d49d';ctx.lineWidth=Math.max(1.4,c*.025);ctx.beginPath();ctx.ellipse(pt.x,pt.y+c*.22,c*.42,c*.17,0,0,Math.PI*2);ctx.stroke();}
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  if(enemy){
    const [sx,sy,sw,sh]=CRYPT_SPRITE_CROPS[spec.key][spec.row*spec.cols+spec.col];
    const scale=Math.min(size*.80/sw,size*.93/sh),dw=sw*scale,dh=sh*scale;
    ctx.drawImage(sprite,sx,sy,sw,sh,pt.x-dw*.5,pt.y+c*.32-dh+bob,dw,dh);
  }else ctx.drawImage(sprite,pt.x-size*.5,pt.y-size*.66,size,size);
  const fs=Math.max(9,c*.19),text=(boss?'Boss D20':label)||(enemy?'D'+p.faces:p.name||'Player');
  const y=pt.y+c*.46,width=Math.min(c*1.45,Math.max(c*.6,text.length*fs*.61+c*.14));
  ctx.font=`700 ${fs}px system-ui,sans-serif`;ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillStyle=ghost?'rgba(13,44,47,.94)':rift?'rgba(40,24,61,.95)':'rgba(20,31,32,.94)';ctx.beginPath();ctx.roundRect(pt.x-width/2,y-fs,width,fs*1.35,fs*.25);ctx.fill();
  ctx.fillStyle=ghost?'#d4fff3':rift?'#ede0ff':boss?'#ffe3a5':'#edf2df';ctx.fillText(text,pt.x,y);
  if(enemy){const hp=Math.max(0,Math.min(1,p.hp/(p.maxHp||1))),bw=c*.70,bh=Math.max(3,c*.055);ctx.fillStyle='#142026';ctx.fillRect(pt.x-bw/2-1,y+c*.08-1,bw+2,bh+2);ctx.fillStyle=ghost?'#94dcc6':rift?'#b79be7':'#cfab86';ctx.fillRect(pt.x-bw/2,y+c*.08,bw*hp,bh);}
  else if(p.hp===0){ctx.fillStyle='#ffd0bd';ctx.fillText('DOWN',pt.x,pt.y-c*.6);}
  ctx.restore();return true;
}
export function paintPremiumCryptRemains(ctx,s,enemies,id){
  if(!premiumCryptReady(id)||s.iso)return false;
  for(const e of enemies){
    if(e.role!=='zombie'||e.hp>0||!e.awaitRevival)continue;
    const spec=cryptSprite(e);if(!spec||!ready(spec.key))continue;const im=art[spec.key],pt=s.at(e.x,e.y),c=s.cell;
    const sw=im.naturalWidth/2,sh=im.naturalHeight/2;
    ctx.save();ctx.globalAlpha=.52;ctx.drawImage(im,spec.col*sw,spec.row*sh,sw,sh,pt.x-c*.46,pt.y-c*.22,c*.92,c*.53);
    ctx.globalAlpha=1;ctx.fillStyle='#d5d0a4';ctx.font=`600 ${Math.max(9,c*.17)}px system-ui`;ctx.textAlign='center';ctx.fillText('RISING',pt.x,pt.y+c*.36);ctx.restore();
  }return true;
}
