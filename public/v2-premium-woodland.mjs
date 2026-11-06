/**
 * DICEBOUND V2 · Premium Woodland vertical slice · Quest 1 rooms 1-1, 1-2 and 1-3.
 * Visual assets are genuine environment textures and transparent scenery pieces.
 * The game's server controls every wall, position, target, HP and turn.
 * No state mutations, input handlers, fetch calls, random gameplay or WebSockets.
 */
export const PREMIUM_ROOM = 'woodland';
export const PREMIUM_ROOMS = Object.freeze(['woodland','clearing','watchpost']);
export const isPremiumWoodlandRoom = roomId => PREMIUM_ROOMS.includes(roomId);
export const PREMIUM_FILES = Object.freeze({
  ground: './assets/premium-woodland/forest-ground.jpg',
  clearing: './assets/premium-woodland/training-clearing-ground.jpg',
  watchpost: './assets/premium-woodland/old-watchpost-ground.jpg',
  watchpostRuinA: './assets/premium-woodland/watchpost-ruin-a.png',
  watchpostRuinB: './assets/premium-woodland/watchpost-ruin-b.png',
  watchpostBoss: './assets/premium-woodland/watchpost-boss-d8.png',
  boulderA: './assets/premium-woodland/boulder-a.png',
  boulderB: './assets/premium-woodland/boulder-b.png',
  fernTreeA: './assets/premium-woodland/fern-tree-a.png',
  fernTreeB: './assets/premium-woodland/fern-tree-b.png',
  canopyA: './assets/premium-woodland/canopy-a.png',
  canopyB: './assets/premium-woodland/canopy-b.png',
  pathFloor: './assets/premium-woodland/woodland-path-q1-r2.webp',
  clearingFloor: './assets/premium-woodland/training-clearing-q1-r2.webp',
  watchpostFloor: './assets/premium-woodland/old-watchpost-q1-r2.webp',
  polishedRock: './assets/premium-woodland/moss-boulders-q1-r2.webp',
  polishedStump: './assets/premium-woodland/oak-stump-q1-r2.webp',
  ruinVertical: './assets/premium-woodland/ruin-vertical-q1-r2.webp',
  ruinCorner: './assets/premium-woodland/ruin-corner-q1-r2.webp',
  woodlandD6: './assets/premium-woodland/woodland-d6-q1-r2.webp',
  guardianD8: './assets/premium-woodland/watchpost-d8-q1-r2.webp'
});
const art = Object.create(null);
const ready = key => !!art[key]?.complete && art[key].naturalWidth > 0;
const floorKey = roomId => roomId==='watchpost'?'watchpostFloor':roomId==='clearing'?'clearingFloor':'pathFloor';
// Static light/scenery layers are cached; moving actors and foliage remain live.
// Bounded to six surfaces, and rebuilt when scale, assets or wall geometry change.
const staticLayers = new Map();
function cachedLayer(ctx,s,key,paint){
  if(typeof OffscreenCanvas==='undefined'||!ctx.getTransform)return false;
  const ratio=Math.min(2,Math.max(1,Math.abs(ctx.getTransform().a)||1));
  const cacheKey=`${key}:${s.cell}:${ratio}`;
  let layer=staticLayers.get(cacheKey);
  if(!layer){
    layer=new OffscreenCanvas(Math.ceil(9*s.cell*ratio),Math.ceil(7*s.cell*ratio));
    const c=layer.getContext('2d');if(!c)return false;
    c.scale(ratio,ratio);
    const local={...s,originX:0,originY:0,at:(x,y)=>({x:(x+.5)*s.cell,y:(y+.5)*s.cell})};
    paint(c,local);staticLayers.set(cacheKey,layer);
    if(staticLayers.size>6)staticLayers.delete(staticLayers.keys().next().value);
  }
  ctx.drawImage(layer,s.originX,s.originY,layer.width/ratio,layer.height/ratio);
  return true;
}
let loaded = false;
export function initPremiumWoodland(ImageCtor = typeof Image !== 'undefined' ? Image : null) {
  if (!ImageCtor || loaded) return;
  loaded = true;
  for (const [name,path] of Object.entries(PREMIUM_FILES)) {
    const img = new ImageCtor();
    img.decoding = 'async';
    img.src = path;
    art[name] = img;
  }
}
export function premiumWoodlandReady() {
  return !!art.ground?.complete && art.ground.naturalWidth > 0 &&
    ['boulderA','boulderB','fernTreeA','fernTreeB'].every(key => art[key]?.complete && art[key].naturalWidth > 0);
}
// Deterministic visual-only selection: preserves the room-wall map untouched.
export function woodlandObstacleArt(x,y) {
  const index = ((x*13+y*7+x*y*11+x*x*3+y*y*5)>>>0)%4;
  return ['boulderA','fernTreeA','boulderB','fernTreeB'][index];
}
export function paintPremiumWoodlandFloor(ctx,s,roomId='woodland') {
  if (!premiumWoodlandReady() || s.iso) return false;
  const {originX:x, originY:y, cell:c} = s;
  ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  const groundName=roomId==='watchpost'?'watchpost':roomId==='clearing'?'clearing':'ground';
  const floorImg=ready(floorKey(roomId))?art[floorKey(roomId)]:ready(groundName)?art[groundName]:art.ground;
  ctx.drawImage(floorImg,x,y,9*c,7*c);
  // Training Clearing is open woodland, with distinct painted ground but no invented walls.
  // All actors, barriers and interaction remain separate authoritative layers.
  // The tactical grid is accessible, but deliberately subordinate to the scene.
  ctx.lineWidth=Math.max(.6,c*.012);
  ctx.strokeStyle='rgba(228,213,164,.20)';
  for(let i=1;i<9;i++){ctx.beginPath();ctx.moveTo(x+i*c,y);ctx.lineTo(x+i*c,y+7*c);ctx.stroke()}
  for(let i=1;i<7;i++){ctx.beginPath();ctx.moveTo(x,y+i*c);ctx.lineTo(x+9*c,y+i*c);ctx.stroke()}
  ctx.restore();return true;
}
export function paintPremiumWoodlandWall(ctx,s,x,y,roomId='woodland',outline=false) {
  if (!premiumWoodlandReady() || s.iso) return false;
  const {cell:c} = s,pt=s.at(x,y);
  const name=roomId==='watchpost'?((x*7+y*11)%2?'watchpostRuinA':'watchpostRuinB'):
    woodlandObstacleArt(x+(roomId==='clearing'?11:0),y+(roomId==='clearing'?7:0));
  const polished=roomId!=='watchpost'&&ready('polishedRock')&&ready('polishedStump');
  const key=polished?(name.startsWith('boulder')?'polishedRock':'polishedStump'):name;
  const img=ready(key)?art[key]:art.boulderA;
  ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  // The visual silhouette may exceed a cell; its authoritative footprint never does.
  const r=c*(polished?1.01:roomId==='watchpost'?1.55:name.startsWith('boulder')?1.36:1.65);
  const px=pt.x-r/2,py=pt.y-r/2-(polished?0:c*.09);
  ctx.shadowColor='rgba(4,12,8,.76)';ctx.shadowBlur=c*.17;
  ctx.shadowOffsetY=c*.08;
  ctx.drawImage(img,px,py,r,r);
  ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  // Clear, thin occupied-square outline independent of the illustrated silhouette.
  if(outline){ctx.strokeStyle='rgba(216,194,135,.40)';ctx.lineWidth=Math.max(1,c*.015);
    ctx.strokeRect(s.originX+x*c+2,s.originY+y*c+2,c-4,c-4);}
  ctx.restore();return true;
}

/** Connected shapes derive only from the authoritative input, never painted pixels. */
export function woodlandWallGroups(walls){
  const unseen=new Set(walls.map(([x,y])=>`${x},${y}`)),groups=[];
  while(unseen.size){
    const queue=[unseen.values().next().value],cells=[];unseen.delete(queue[0]);
    for(let i=0;i<queue.length;i++){
      const [x,y]=queue[i].split(',').map(Number);cells.push([x,y]);
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const k=`${x+dx},${y+dy}`;if(unseen.delete(k))queue.push(k);
      }
    }
    const x=Math.min(...cells.map(p=>p[0])),y=Math.min(...cells.map(p=>p[1]));
    groups.push({cells,x,y,width:Math.max(...cells.map(p=>p[0]))-x+1,height:Math.max(...cells.map(p=>p[1]))-y+1});
  }
  return groups;
}
export function paintPremiumWoodlandWalls(ctx,s,walls=[],roomId='woodland',direct=false){
  if(!premiumWoodlandReady()||s.iso)return false;
  const signature=walls.map(p=>p.join(',')).join(';');
  const assets=['polishedRock','polishedStump','ruinVertical','ruinCorner'].map(ready).join(',');
  if(!direct&&cachedLayer(ctx,s,`walls:${roomId}:${signature}:${assets}`,
    (c,local)=>paintPremiumWoodlandWalls(c,local,walls,roomId,true)))return true;
  const c=s.cell,set=new Set(walls.map(p=>p.join(',')));
  ctx.save();ctx.beginPath();ctx.rect(s.originX,s.originY,9*c,7*c);ctx.clip();
  for(const group of woodlandWallGroups(walls)){
    let key=null;
    if(roomId==='watchpost'&&group.width===1&&group.height===2&&group.cells.length===2)key='ruinVertical';
    if(roomId==='watchpost'&&group.width===2&&group.height===2&&group.cells.length===3&&!set.has(`${group.x},${group.y}`))key='ruinCorner';
    if(key&&ready(key)){
      ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      ctx.shadowColor='rgba(5,15,10,.6)';ctx.shadowBlur=c*.07;ctx.shadowOffsetY=c*.035;
      // Clip only to real blocked cells: the open corner can never be painted shut.
      ctx.beginPath();for(const [x,y] of group.cells)ctx.rect(s.originX+x*c,s.originY+y*c,c,c);ctx.clip();
      const img=art[key];
      if(key==='ruinVertical'){
        // The source has intentional transparent side padding; retain its detailed masonry.
        ctx.drawImage(img,img.naturalWidth*.17,0,img.naturalWidth*.66,img.naturalHeight,
          s.originX+group.x*c,s.originY+group.y*c,c,2*c);
      }else ctx.drawImage(img,s.originX+group.x*c,s.originY+group.y*c,2*c,2*c);
      ctx.restore();
    }else for(const [x,y] of group.cells)paintPremiumWoodlandWall(ctx,s,x,y,roomId,false);
  }
  // Silhouette and contact shadow integrate scenery without boxed footprints.
  // The floor grid remains available for tactical positioning.
  ctx.restore();return true;
}

/**
 * Directional lighting, staged beneath walls and before game overlays.
 * Each gradient is anchored to the existing board projection. All random-looking
 * placement is deterministic visual maths, never a game roll.
 */
function softOval(ctx,x,y,rx,ry,rgb,opacity=1){
  ctx.save();
  ctx.translate(x,y);ctx.scale(rx,ry);
  const g=ctx.createRadialGradient(0,0,0,0,0,1);
  g.addColorStop(0,`rgba(${rgb},${opacity})`);
  g.addColorStop(.46,`rgba(${rgb},${opacity*.57})`);
  g.addColorStop(1,`rgba(${rgb},0)`);
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.restore();
}
const LIGHT_PATCHES=Object.freeze([
  [.10,.18,.13,.19,.72],[.25,.10,.17,.19,.72],[.41,.24,.11,.16,.56],
  [.58,.12,.19,.20,.78],[.81,.29,.12,.19,.58],[.70,.56,.20,.25,.77],
  [.43,.66,.17,.21,.69],[.19,.71,.16,.22,.57],[.87,.76,.15,.18,.45]
]);
const CANOPY_SHADOWS=Object.freeze([
  [.03,.02,.20,.22],[.24,.06,.18,.12],[.46,-.01,.17,.20],
  [.75,.05,.26,.17],[.99,.19,.18,.26],[.03,.51,.21,.23],
  [.88,.51,.23,.18],[.14,.99,.20,.17],[.57,.98,.27,.17],
  [.98,.95,.25,.23]
]);
export function paintPremiumWoodlandGroundLighting(ctx,s,walls=[],roomId='woodland',direct=false){
  if(!premiumWoodlandReady() || s.iso) return false;
  if(!direct&&cachedLayer(ctx,s,`light:${roomId}:${walls.map(p=>p.join(',')).join(';')}:${ready(floorKey(roomId))}`,
    (c,local)=>paintPremiumWoodlandGroundLighting(c,local,walls,roomId,true)))return true;
  const {originX:x,originY:y,cell:c}=s,w=9*c,h=7*c;
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  if(ready(floorKey(roomId)))ctx.globalAlpha=.52;
  // A unified ambient grade replaces the old weak diffuse radial colour wash.
  const ambient=ctx.createLinearGradient(x,y,x+w*.72,y+h);
  ambient.addColorStop(0,'rgba(255,221,152,.065)');
  ambient.addColorStop(.43,'rgba(24,34,21,.045)');
  ambient.addColorStop(1,'rgba(7,19,14,.21)');
  ctx.fillStyle=ambient;ctx.fillRect(x,y,w,h);
  // Broad canopy occlusion at the edges and underneath hanging branches.
  for(const [cx,cy,rx,ry] of CANOPY_SHADOWS)
    softOval(ctx,x+cx*w,y+cy*h,rx*w,ry*h,'5,16,10',.48);
  // Irregular sunlight openings in the forest canopy. No new obstacles.
  for(const [cx,cy,rx,ry,strength] of LIGHT_PATCHES)
    softOval(ctx,x+cx*w,y+cy*h,rx*w,ry*h,'255,229,151',strength*.25);
  // Dappled spots have a common light direction and deterministic placement.
  for(let i=0;i<54;i++){
    const fx=(Math.sin(i*92.71+4.09)*43758.5453)%1;
    const fy=(Math.sin(i*57.83+8.73)*12741.383)%1;
    const nx=fx<0?fx+1:fx,ny=fy<0?fy+1:fy;
    const radius=c*(.10+((i*7)%9)*.017);
    softOval(ctx,x+nx*w,y+ny*h,radius*1.45,radius*.69,'250,221,144',.10);
  }
  // Long ground-cast shadows always point away from upper-left sunlight.
  // Authoritative walls[] supplies positions; lighting never changes that array.
  for(const [tx,ty] of walls){
    const px=x+(tx+.53)*c,py=y+(ty+.64)*c;
    softOval(ctx,px+c*.36,py+c*.35,c*.79,c*.37,'4,13,11',.50);
    softOval(ctx,px+c*.13,py+c*.12,c*.46,c*.26,'5,15,9',.37);
  }
  ctx.restore();return true;
}

/** Contact shadow behind the existing 2-D character icon. Never changes token art. */
export function paintPremiumWoodlandContactShadow(ctx,s,p,kind='one'){
  if(!premiumWoodlandReady() || s.iso || !p || !Number.isFinite(p.x)||!Number.isFinite(p.y))return false;
  const giant=kind==='enemy'&&(p.variant==='large'||p.variant==='large-shiny');
  const c=s.cell,pt=s.at(p.x+(giant?.5:0),p.y+(giant?.5:0));
  ctx.save();
  // Shadow is deliberately below the unit, avoiding any obstruction to its label.
  softOval(ctx,pt.x+c*.065,pt.y+c*.20,c*(giant?.78:.48),c*(giant?.29:.18),'3,11,7',.84);
  softOval(ctx,pt.x-c*.045,pt.y+c*.14,c*(giant?.52:.28),c*.085,'243,206,133',.16);
  ctx.restore();return true;
}
/**
 * Allows comparison with the approved 7/10 asset-based baseline.
 * The OFF state reproduces the existing, subtle pre-lighting overlay.
 */
export function paintPremiumWoodlandAtmosphere(ctx,s,sunlight=true,roomId='woodland',direct=false){
  if(!premiumWoodlandReady() || s.iso) return false;
  if(!direct&&cachedLayer(ctx,s,`atmosphere:${roomId}:${sunlight}:${ready(floorKey(roomId))}`,
    (c,local)=>paintPremiumWoodlandAtmosphere(c,local,sunlight,roomId,true)))return true;
  const {originX:x,originY:y,cell:c}=s,w=9*c,h=7*c;
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  if(ready(floorKey(roomId)))ctx.globalAlpha=.60;
  if(!sunlight){
    const vignette=ctx.createRadialGradient(x+w*.50,y+h*.43,w*.27,x+w*.50,y+h*.43,w*.71);
    vignette.addColorStop(0,'rgba(6,17,7,0)');vignette.addColorStop(1,'rgba(4,12,7,.32)');
    ctx.fillStyle=vignette;ctx.fillRect(x,y,w,h);
    const light=ctx.createRadialGradient(x+w*.61,y+h*.19,0,x+w*.61,y+h*.19,w*.40);
    light.addColorStop(0,'rgba(249,210,123,.10)');light.addColorStop(1,'rgba(249,210,123,0)');
    ctx.fillStyle=light;ctx.fillRect(x,y,w,h);
    ctx.restore();return true;
  }
  // Three feathered shafts of light, made of overlapping radial veils rather
  // than hard-edged triangles. This avoids synthetic polygon beam boundaries.
  ctx.globalCompositeOperation='screen';
  const beams=[
    {sx:roomId==='clearing'?.16:.22,sy:-.12,dx:.30,dy:1.05,power:.047},
    {sx:.52,sy:-.12,dx:.25,dy:.94,power:.065},
    {sx:.72,sy:-.12,dx:.12,dy:.81,power:.036}
  ];
  for(const beam of beams){
    for(let i=0;i<8;i++){
      const t=i/7;
      const fx=beam.sx+beam.dx*t,fy=beam.sy+beam.dy*t;
      // Gentle irregular variations imply tree branches and canopy openings.
      softOval(ctx,x+w*fx,y+h*fy,w*(.058+.032*t),h*(.16+.045*t),
        '255,236,184',beam.power*(1-t*.48));
    }
  }
  ctx.globalCompositeOperation='source-over';
  // Ambient haze at the canopy gap, slightly warmer than the ground texture.
  softOval(ctx,x+w*.37,y+h*.13,w*.30,h*.23,'255,230,176',.075);
  const edge=ctx.createRadialGradient(x+w*.52,y+h*.48,w*.25,x+w*.52,y+h*.48,w*.72);
  edge.addColorStop(0,'rgba(5,17,12,0)');
  edge.addColorStop(.74,'rgba(5,17,12,.01)');
  edge.addColorStop(1,'rgba(3,11,11,.29)');
  ctx.fillStyle=edge;ctx.fillRect(x,y,w,h);
  ctx.restore();return true;
}


/**
 * Woodland Path only: a near-field layer composed from the same painted canopy
 * assets as the approved forest. Occupies the edge of the board, never creates
 * obstacles or changes room-wall semantics. Foreground opacity decreases near
 * combat units so portraits, HP bars and selection remain legible.
 */
export const WOODLAND_FOREGROUND_POSITIONS = Object.freeze([
  [.04,.025,2.15,'canopyA',.87], [.24,-.045,1.72,'canopyB',.63],
  [.54,-.060,1.83,'canopyA',.70], [.89,.005,2.20,'canopyB',.92],
  [-.038,.36,1.70,'canopyA',.73], [1.035,.55,1.92,'canopyB',.75],
  [.015,.965,1.88,'canopyB',.91], [.33,1.02,1.78,'canopyA',.72],
  [.70,1.025,1.87,'canopyB',.74], [.978,.967,2.00,'canopyA',.86]
]);
function rangeClamp(v,a=0,b=1){return Math.min(b,Math.max(a,v))}
function alphaForNearbyActors(nx,ny,actors){
  if(!Array.isArray(actors))return 1;
  const closest=actors.reduce((min,actor)=>{
    const p=actor?.p||actor;
    if(!Number.isFinite(p?.x)||!Number.isFinite(p?.y))return min;
    const dx=nx-(p.x+.5)/9,dy=ny-(p.y+.5)/7;
    return Math.min(min,Math.hypot(dx*9,dy*7));
  },Infinity);
  // Keep the figure legible even as it approaches the edges of the map.
  return closest<1.1?.13:closest<1.85?.36:closest<2.5?.68:1;
}
/** A modest undergrowth layer tucked around the server-provided walls.
 * It is scenery only: no collision footprints, no new walkable-square outlines.
 * This pass stays BELOW all characters and combat overlays.
 */
export function paintPremiumWoodlandUnderbrush(ctx,s,walls=[],timeMs=0,motion=true){
  if(!premiumWoodlandReady()||s.iso)return false;
  // New sprites already contain finely cut foliage; avoid stamping old polygonal leaves over them.
  if(ready('polishedRock')&&ready('polishedStump'))return true;
  const {originX:x,originY:y,cell:c}=s,w=9*c,h=7*c;
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  for(let i=0;i<walls.length;i++){
    if(i%2!==0)continue; // Avoid turning every blocked square into a hedge.
    const [tx,ty]=walls[i];
    if(!Number.isFinite(tx)||!Number.isFinite(ty))continue;
    const img=art[i%4===0?'canopyA':'canopyB'];
    if(!img?.complete||!img.naturalWidth)continue;
    const px=x+(tx+.38)*c,py=y+(ty+.83)*c;
    const sway=motion?Math.sin(timeMs*.0007+i*.85)*c*.015:0;
    const width=c*(.79+(i%3)*.11),height=width*.52;
    ctx.save();ctx.globalAlpha=.48;
    ctx.drawImage(img,px-width*.5+sway,py-height*.58,width,height);
    ctx.restore();
  }
  ctx.restore();return true;
}

export function paintPremiumWoodlandForeground(ctx,s,actors=[],timeMs=0,motion=true){
  if(!premiumWoodlandReady()||s.iso)return false;
  const {originX:x,originY:y,cell:c}=s,w=9*c,h=7*c;
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  for(let i=0;i<WOODLAND_FOREGROUND_POSITIONS.length;i++){
    const [nx,ny,scale,key,alpha]=WOODLAND_FOREGROUND_POSITIONS[i];
    const img=art[key];if(!img?.complete||!img.naturalWidth)continue;
    const sway=motion?Math.sin(timeMs*.00044+i*1.62)*c*.014:0;
    const px=x+nx*w+sway,py=y+ny*h;
    const width=c*scale,height=width*.66;
    const visible=alpha*alphaForNearbyActors(nx,ny,actors);
    ctx.save();ctx.globalAlpha=visible;
    ctx.shadowColor='rgba(0,11,7,.32)';ctx.shadowBlur=c*.12;
    ctx.drawImage(img,px-width*.5,py-height*.5,width,height);
    ctx.restore();
  }
  ctx.restore();return true;
}

/**
 * Deterministic, unobtrusive floating leaves. All coordinates derive from
 * elapsed client animation time and constant seeds, never game RNG or state.
 * Motion is disabled automatically for reduced-motion users by the caller.
 */
const FOREST_LEAVES=Object.freeze(Array.from({length:13},(_,i)=>({
  px:((i*73+19)%97)/97,py:((i*43+37)%89)/89,
  offset:i*.72,speed:.55+(i%4)*.20,
  tint:i%3===0?'#efc780':i%3===1?'#d9ad63':'#9fbc75'
})));
export function paintPremiumWoodlandForestLife(ctx,s,actors=[],timeMs=0,motion=true){
  if(!premiumWoodlandReady()||s.iso||!motion)return false;
  const {originX:x,originY:y,cell:c}=s,w=9*c,h=7*c;
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  const t=timeMs*.0001;
  for(const [i,p] of FOREST_LEAVES.entries()){
    const nx=(p.px+t*p.speed*.075+Math.sin(t*2+p.offset)*.019)%1;
    const ny=(p.py+t*p.speed*.11)%1;
    const opacity=(.12+Math.abs(Math.sin(t+p.offset))*.13)*alphaForNearbyActors(nx,ny,actors);
    const px=x+nx*w,py=y+ny*h,r=c*(.035+(i%4)*.011);
    ctx.save();ctx.globalAlpha=opacity;ctx.translate(px,py);
    ctx.rotate(Math.sin(t*2.5+p.offset)*.5+i*.41);
    ctx.fillStyle=p.tint;ctx.beginPath();ctx.ellipse(0,0,r,r*.42,0,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  ctx.restore();return true;
}


/**
 * Quest 1 / Woodland Path: in-world portrait compositing.
 * Uses the ORIGINAL transparent 3.2.1 hero/enemy PNGs, rather than generating
 * fixed characters into a background image. Actor coordinates, HP, target IDs,
 * wall geometry, hit-testing, and turn order remain server-authoritative.
 * The unit silhouette is the only thing being replaced; the same name and HP
 * information stays in a clean readable overlay above the floor/foreground.
 */
export function paintPremiumWoodlandActor(ctx,s,p,kind,sprite,{label='',selected=false,
    active=false,motion=true,timeMs=0,light=true,roomId='woodland'}={}){
  if(!premiumWoodlandReady()||s.iso||!p||!sprite?.complete||!sprite.naturalWidth||
     !Number.isFinite(p.x)||!Number.isFinite(p.y))return false;
  const c=s.cell;
  const giant=kind==='enemy'&&(p.variant==='large'||p.variant==='large-shiny');
  const pt=s.at(p.x+(giant?.5:0),p.y+(giant?.5:0));
  const scale=giant?1.65:1;
  const blink=motion&&p.hp>0?Math.sin(timeMs*.0022+(p.x*17+p.y*11))*.012*c:0;
  const glow=kind==='enemy'?'rgba(244,119,102,.68)':kind==='one'?'rgba(248,216,146,.67)':kind==='two'?'rgba(119,225,202,.60)':kind==='three'?'rgba(201,171,242,.65)':'rgba(242,177,124,.62)';
  ctx.save();
  // Selection/readiness stays BELOW the sprite, never over its face or HP.
  if(selected||active){
    ctx.strokeStyle=selected?'rgba(255,170,113,.97)':glow;
    ctx.lineWidth=Math.max(1.6,c*.038);
    ctx.beginPath();ctx.ellipse(pt.x,pt.y+c*.27*scale,c*.43*scale,c*.17*scale,0,0,Math.PI*2);ctx.stroke();
  }
  // The quest-one D8 guardian has a low, ember-coloured in-world ring.
  // Its presence is purely visual; no targeting or cell semantics are altered.
  if(roomId==='watchpost'&&kind==='enemy'&&p.variant==='boss'){
    softOval(ctx,pt.x,pt.y+c*.22,c*.82,c*.36,'227,88,41',.29);
    ctx.strokeStyle='rgba(255,177,91,.70)';ctx.lineWidth=Math.max(2,c*.025);
    ctx.beginPath();ctx.ellipse(pt.x,pt.y+c*.26,c*.61,c*.23,0,0,Math.PI*2);ctx.stroke();
  }
  // A low shadow catches the real silhouette's feet, not an arbitrary square.
  softOval(ctx,pt.x+c*.08*scale,pt.y+c*.31*scale,c*.49*scale,c*.15*scale,
    '5,13,9',light?.75:.53);
  // Larger hero silhouettes bring the original illustrated art up to the same
  // readable visual scale as the full-size D6 creatures at tablet resolution.
  const clearing=isPremiumWoodlandRoom(roomId);
  const watchpostBoss=roomId==='watchpost'&&kind==='enemy'&&p.variant==='boss';
  const cleanEnemySprite=kind==='enemy'&&((watchpostBoss&&ready('guardianD8'))||(p.faces===6&&ready('woodlandD6')));
  if(watchpostBoss)sprite=ready('guardianD8')?art.guardianD8:ready('watchpostBoss')?art.watchpostBoss:sprite;
  else if(kind==='enemy'&&p.faces===6&&ready('woodlandD6'))sprite=art.woodlandD6;
  const imageSize=c*(watchpostBoss?(cleanEnemySprite?1.42:1.83):kind==='enemy'?(cleanEnemySprite?1.15:1.26):1.28)*scale;
  const left=pt.x-imageSize*(cleanEnemySprite||watchpostBoss||clearing&&kind!=='enemy'?.50:.59),top=pt.y-imageSize*(cleanEnemySprite?.65:watchpostBoss?.58:clearing?.59:.56)+blink;
  ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  // Two subtle effects: environmental cast shadow and warm/cool edge scattering.
  ctx.shadowColor='rgba(6,16,10,.82)';ctx.shadowBlur=c*.13;
  ctx.shadowOffsetX=c*.065;ctx.shadowOffsetY=c*.09;
  if(clearing&&kind==='enemy'&&!watchpostBoss&&!cleanEnemySprite&&sprite.naturalHeight>0){
    // Original dice PNG contains old red/green HUD slivers at its top/bottom.
    // Crop those from the *drawn image* and let this renderer supply the live HP.
    const sh=sprite.naturalHeight,sw=sprite.naturalWidth;
    const trimTop=sh*.115,trimBottom=sh*.125;
    ctx.drawImage(sprite,0,trimTop,sw,sh-trimTop-trimBottom,left,top,imageSize,imageSize);
  }else ctx.drawImage(sprite,left,top,imageSize,imageSize);
  ctx.restore();
  // Keep the full original identification and HP feedback. These are HUD
  // overlays rather than tiles: there is no filled box around the character.
  ctx.save();ctx.textAlign='center';ctx.textBaseline='alphabetic';
  const fontSize=Math.max(9,c*(giant?.235:.215));
  ctx.font=`700 ${fontSize}px system-ui,sans-serif`;
  ctx.lineJoin='round';ctx.lineWidth=Math.max(2.4,fontSize*.32);
  ctx.strokeStyle='rgba(7,17,18,.94)';ctx.fillStyle='#fff2d9';
  const text=label|| (kind==='enemy'?`D${p.faces||8}`:(p.name||'Player'));
  const y=pt.y+c*(giant?.78:.49);
  // A narrow translucent nameplate floats under each figure, never a sprite frame.
  if(clearing){
    const plateWidth=Math.min(c*1.35,Math.max(c*.52,text.length*fontSize*.59+c*.10));
    const plateHeight=fontSize*1.36;
    ctx.fillStyle='rgba(6,20,18,.70)';
    ctx.beginPath();ctx.roundRect(pt.x-plateWidth/2,y-fontSize*.99,plateWidth,plateHeight,plateHeight*.34);ctx.fill();
  }
  ctx.fillStyle='#fff2d9';ctx.strokeText(text,pt.x,y);ctx.fillText(text,pt.x,y);
  if(kind==='enemy'){
    const ratio=Number.isFinite(p.maxHp)&&p.maxHp>0?Math.max(0,Math.min(1,p.hp/p.maxHp)):1;
    const width=c*(giant?.94:.70),height=Math.max(4,c*.075),left=pt.x-width*.5;
    const top=y+c*.085;
    ctx.fillStyle='rgba(13,19,19,.96)';ctx.fillRect(left-1,top-1,width+2,height+2);
    ctx.fillStyle='#e78482';ctx.fillRect(left,top,width*ratio,height);
  }else if(p.hp===0){
    ctx.font=`700 ${fontSize}px system-ui`;ctx.strokeText('DOWN',pt.x,pt.y-c*.53);
    ctx.fillStyle='#ffaaa1';ctx.fillText('DOWN',pt.x,pt.y-c*.53);
  }
  ctx.restore();ctx.restore();return true;
}
