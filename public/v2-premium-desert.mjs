import {CARAVAN_SCENERY} from './v2-caravan-layout.mjs';
export const DESERT_FILES=Object.freeze({
 ground:'./assets/premium-desert/caravan-ground-q5-r1.webp',
 northGate:'./assets/premium-desert/gate-north-q5-r1.webp',
 southGate:'./assets/premium-desert/gate-south-q5-r1.webp',
 stall:'./assets/premium-desert/caravan-stall-q5-r1.webp',
 camel:'./assets/premium-desert/pack-camel-q5-r1.webp',
 well:'./assets/premium-desert/desert-well-q5-r1.webp',
 crag:'./assets/premium-desert/sandstone-crag-q5-r1.webp',
 d6:'./assets/premium-desert/desert-d6-q5-r1.webp',
 d8:'./assets/premium-desert/desert-d8-q5-r1.webp'
});
const art={},layers=new Map();let initialized=false;
const ready=key=>art[key]?.complete&&art[key].naturalWidth>0;
export const isPremiumDesertRoom=id=>id==='q5r1';
export function initPremiumDesert(ImageCtor=typeof Image!=='undefined'?Image:null){
 if(initialized||!ImageCtor)return;initialized=true;
 for(const [name,path] of Object.entries(DESERT_FILES)){const img=new ImageCtor();img.decoding='async';img.src=path;art[name]=img;}
}
export const premiumDesertReady=roomId=>isPremiumDesertRoom(roomId)&&Object.keys(DESERT_FILES).every(ready);
const clipBoard=(ctx,s)=>{ctx.beginPath();ctx.rect(s.originX,s.originY,13*s.cell,9*s.cell);ctx.clip();};
function oval(ctx,x,y,rx,ry,alpha){
 ctx.save();ctx.translate(x,y);ctx.scale(1,ry/rx);
 // Gradient coordinates are local to this transform.
 const local=ctx.createRadialGradient(0,0,0,0,0,rx);local.addColorStop(0,`rgba(48,29,16,${alpha})`);local.addColorStop(1,'rgba(48,29,16,0)');
 ctx.fillStyle=local;ctx.fillRect(-rx,-rx,rx*2,rx*2);ctx.restore();
}
export function paintPremiumDesertFloor(ctx,s,roomId){
 if(!premiumDesertReady(roomId)||s.iso)return false;
 const c=s.cell,x=s.originX,y=s.originY;
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(art.ground,x,y,13*c,9*c);
 // One subordinate movement grid; no second outline around occupied squares.
 ctx.strokeStyle='rgba(101,69,36,.16)';ctx.lineWidth=Math.max(.5,c*.009);ctx.beginPath();
 for(let i=1;i<13;i++){ctx.moveTo(x+i*c,y);ctx.lineTo(x+i*c,y+9*c);}
 for(let i=1;i<9;i++){ctx.moveTo(x,y+i*c);ctx.lineTo(x+13*c,y+i*c);}
 ctx.stroke();ctx.restore();return true;
}
export function paintPremiumDesertSurround(ctx,s,w,h,roomId){
 if(!premiumDesertReady(roomId)||s.iso)return false;
 ctx.save();ctx.drawImage(art.ground,0,0,w,h);
 const shade=ctx.createLinearGradient(0,0,0,h);shade.addColorStop(0,'rgba(62,42,29,.46)');shade.addColorStop(.65,'rgba(64,40,25,.40)');shade.addColorStop(1,'rgba(35,28,23,.85)');
 ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);ctx.restore();return true;
}
function drawScenery(ctx,s,walls){
 const set=new Set(walls.map(p=>p.join(','))),painted=new Set(),c=s.cell;
 ctx.save();clipBoard(ctx,s);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 for(const piece of CARAVAN_SCENERY){
  const cells=piece.cells.filter(p=>set.has(p.join(',')));if(!cells.length)continue;
  // Clip to the current server footprint, including both open rock corners.
  ctx.save();ctx.beginPath();for(const [x,y] of cells){ctx.rect(s.originX+x*c,s.originY+y*c,c,c);painted.add(`${x},${y}`);}ctx.clip();
  ctx.shadowColor='rgba(59,32,16,.40)';ctx.shadowBlur=c*.13;ctx.shadowOffsetX=c*.055;ctx.shadowOffsetY=c*.075;
  if(piece.rotate){ctx.translate(s.originX+(piece.x+piece.w/2)*c,s.originY+(piece.y+piece.h/2)*c);ctx.rotate(piece.rotate);ctx.drawImage(art[piece.asset],-piece.w*c/2,-piece.h*c/2,piece.w*c,piece.h*c);}
  else ctx.drawImage(art[piece.asset],s.originX+piece.x*c,s.originY+piece.y*c,piece.w*c,piece.h*c);ctx.restore();
 }
 // A changed server layout cannot silently create invisible additional barriers.
 for(const [x,y] of walls)if(!painted.has(`${x},${y}`)){
  ctx.save();ctx.beginPath();ctx.rect(s.originX+x*c,s.originY+y*c,c,c);ctx.clip();
  ctx.drawImage(art.crag,s.originX+x*c,s.originY+y*c,c,c);ctx.restore();
 }
 ctx.restore();
}
export function paintPremiumDesertWalls(ctx,s,walls,roomId){
 if(!premiumDesertReady(roomId)||s.iso)return false;
 const ratio=Math.min(2,Math.max(1,ctx.getTransform?.().a||1));
 const key=`${s.cell}:${ratio}:${walls.map(p=>p.join(',')).join(';')}`;
 if(typeof OffscreenCanvas==='undefined'){drawScenery(ctx,s,walls);return true;}
 let layer=layers.get(key);
 if(!layer){
  layer=new OffscreenCanvas(Math.ceil(13*s.cell*ratio),Math.ceil(9*s.cell*ratio));
  const c=layer.getContext('2d');c.scale(ratio,ratio);drawScenery(c,{...s,originX:0,originY:0},walls);
  layers.set(key,layer);while(layers.size>3)layers.delete(layers.keys().next().value);
 }
 ctx.drawImage(layer,s.originX,s.originY,layer.width/ratio,layer.height/ratio);return true;
}
export function paintPremiumDesertAtmosphere(ctx,s,roomId,timeMs=0,motion=true,light=true){
 if(!premiumDesertReady(roomId)||s.iso)return false;
 const c=s.cell,x=s.originX,y=s.originY;ctx.save();clipBoard(ctx,s);
 if(light){const glow=ctx.createLinearGradient(x,y,x+13*c,y+9*c);glow.addColorStop(0,'rgba(255,229,173,.055)');glow.addColorStop(1,'rgba(98,53,27,.04)');ctx.fillStyle=glow;ctx.fillRect(x,y,13*c,9*c);}
 if(motion){ctx.fillStyle='rgba(255,229,171,.22)';
  for(let i=0;i<12;i++){const px=((i*.137+timeMs*.000007)%1)*13*c,py=((i*.319+Math.sin(timeMs*.0004+i)*.006)%1)*9*c;ctx.beginPath();ctx.ellipse(x+px,y+py,c*.018,c*.009,-.3,0,Math.PI*2);ctx.fill();}}
 ctx.restore();return true;
}
export function paintPremiumDesertActor(ctx,s,p,kind,sprite,{label='',selected=false,active=false,motion=true,timeMs=0,roomId='q5r1'}={}){
 if(!premiumDesertReady(roomId)||s.iso||!p)return false;
 if(kind==='enemy')sprite=art[p.faces===6?'d6':'d8'];
 if(!sprite?.complete||!sprite.naturalWidth)return false;
 const c=s.cell,pt=s.at(p.x,p.y),enemy=kind==='enemy',swift=enemy&&p.role==='swift';
 const size=c*(enemy?1.14:1.28),bob=motion?Math.sin(timeMs*.002+p.x*3+p.y)*c*.008:0;
 ctx.save();oval(ctx,pt.x+c*.065,pt.y+c*.25,c*.44,c*.14,.58);
 if(selected||active){ctx.strokeStyle=selected?'#ffe8ac':'#ffd681';ctx.lineWidth=Math.max(1.5,c*.027);ctx.beginPath();ctx.ellipse(pt.x,pt.y+c*.25,c*.43,c*.16,0,0,Math.PI*2);ctx.stroke();}
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.shadowColor='rgba(62,31,14,.44)';ctx.shadowBlur=c*.085;ctx.shadowOffsetX=c*.045;ctx.shadowOffsetY=c*.06;
 ctx.drawImage(sprite,pt.x-size*.5,pt.y-size*.65+bob,size,size);ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
 const fs=Math.max(9,c*.21),text=label||(enemy?`${swift?'S':''}D${p.faces}`:p.name||'Player'),y=pt.y+c*.48;
 ctx.font=`700 ${fs}px system-ui,sans-serif`;ctx.textAlign='center';ctx.textBaseline='alphabetic';
 const width=Math.min(c*1.45,Math.max(c*.54,text.length*fs*.6+c*.13));
 ctx.fillStyle=swift?'rgba(29,74,69,.91)':'rgba(50,35,24,.88)';ctx.beginPath();ctx.roundRect(pt.x-width/2,y-fs, width,fs*1.3,fs*.27);ctx.fill();
 ctx.fillStyle=swift?'#bcf2df':'#fff0d1';ctx.fillText(text,pt.x,y);
 if(enemy){const hp=Math.max(0,Math.min(1,p.hp/(p.maxHp||1))),bar=c*.7,h=Math.max(4,c*.065);
  ctx.fillStyle='#342418';ctx.fillRect(pt.x-bar/2-1,y+c*.085-1,bar+2,h+2);ctx.fillStyle='#e5a36f';ctx.fillRect(pt.x-bar/2,y+c*.085,bar*hp,h);}
 else if(p.hp===0){ctx.fillStyle='#ffc4b9';ctx.fillText('DOWN',pt.x,pt.y-c*.6);}
 ctx.restore();return true;
}
