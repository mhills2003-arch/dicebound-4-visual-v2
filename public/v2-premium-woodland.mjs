/**
 * DICEBOUND V2 · Premium Woodland vertical slice · Quest 1 / Woodland Path ONLY.
 * Visual assets are genuine environment textures and transparent scenery pieces.
 * The game's server controls every wall, position, target, HP and turn.
 * No state mutations, input handlers, fetch calls, random gameplay or WebSockets.
 */
export const PREMIUM_ROOM = 'woodland';
export const PREMIUM_FILES = Object.freeze({
  ground: './assets/premium-woodland/forest-ground.jpg',
  boulderA: './assets/premium-woodland/boulder-a.png',
  boulderB: './assets/premium-woodland/boulder-b.png',
  fernTreeA: './assets/premium-woodland/fern-tree-a.png',
  fernTreeB: './assets/premium-woodland/fern-tree-b.png',
  canopyA: './assets/premium-woodland/canopy-a.png',
  canopyB: './assets/premium-woodland/canopy-b.png'
});
const art = Object.create(null);
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
export function paintPremiumWoodlandFloor(ctx,s) {
  if (!premiumWoodlandReady() || s.iso) return false;
  const {originX:x, originY:y, cell:c} = s;
  ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(art.ground,x,y,9*c,7*c);
  // The tactical grid is accessible, but deliberately subordinate to the scene.
  ctx.lineWidth=Math.max(.6,c*.012);
  ctx.strokeStyle='rgba(228,213,164,.20)';
  for(let i=1;i<9;i++){ctx.beginPath();ctx.moveTo(x+i*c,y);ctx.lineTo(x+i*c,y+7*c);ctx.stroke()}
  for(let i=1;i<7;i++){ctx.beginPath();ctx.moveTo(x,y+i*c);ctx.lineTo(x+9*c,y+i*c);ctx.stroke()}
  ctx.restore();return true;
}
export function paintPremiumWoodlandWall(ctx,s,x,y) {
  if (!premiumWoodlandReady() || s.iso) return false;
  const {cell:c} = s,pt=s.at(x,y);
  const name=woodlandObstacleArt(x,y),img=art[name];
  ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  // The visual silhouette may exceed a cell; its authoritative footprint never does.
  const r=c*(name.startsWith('boulder')?1.36:1.65);
  const px=pt.x-r/2,py=pt.y-r/2-c*.09;
  ctx.shadowColor='rgba(4,12,8,.76)';ctx.shadowBlur=c*.17;
  ctx.shadowOffsetY=c*.08;
  ctx.drawImage(img,px,py,r,r);
  ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  // Clear, thin occupied-square outline independent of the illustrated silhouette.
  ctx.strokeStyle='rgba(216,194,135,.57)';ctx.lineWidth=Math.max(1,c*.024);
  ctx.strokeRect(s.originX+x*c+2,s.originY+y*c+2,c-4,c-4);
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
export function paintPremiumWoodlandGroundLighting(ctx,s,walls=[]){
  if(!premiumWoodlandReady() || s.iso) return false;
  const {originX:x,originY:y,cell:c}=s,w=9*c,h=7*c;
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
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
export function paintPremiumWoodlandAtmosphere(ctx,s,sunlight=true){
  if(!premiumWoodlandReady() || s.iso) return false;
  const {originX:x,originY:y,cell:c}=s,w=9*c,h=7*c;
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
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
    {sx:.22,sy:-.12,dx:.30,dy:1.05,power:.047},
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
