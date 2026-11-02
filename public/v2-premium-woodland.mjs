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
  fernTreeB: './assets/premium-woodland/fern-tree-b.png'
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
export function paintPremiumWoodlandAtmosphere(ctx,s) {
  if (!premiumWoodlandReady() || s.iso) return false;
  const {originX:x,originY:y,cell:c}=s,w=9*c,h=7*c;
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  const vignette=ctx.createRadialGradient(x+w*.50,y+h*.43,w*.27,x+w*.50,y+h*.43,w*.71);
  vignette.addColorStop(0,'rgba(6,17,7,0)');vignette.addColorStop(1,'rgba(4,12,7,.32)');
  ctx.fillStyle=vignette;ctx.fillRect(x,y,w,h);
  // Warm light across the trail; never painted over actor outlines and labels.
  const light=ctx.createRadialGradient(x+w*.61,y+h*.19,0,x+w*.61,y+h*.19,w*.40);
  light.addColorStop(0,'rgba(249,210,123,.10)');light.addColorStop(1,'rgba(249,210,123,0)');
  ctx.fillStyle=light;ctx.fillRect(x,y,w,h);
  ctx.restore();return true;
}
