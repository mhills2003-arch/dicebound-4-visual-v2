import {diceworks} from './v2-diceworks-plan.mjs';
import {rooms as monastery} from './v2-monastery-plan.mjs';

const rooms = {...monastery,...Object.fromEntries(Object.entries(diceworks).map(([id,r])=>[id,r.machinery]))};
const isWorks = id => Object.hasOwn(diceworks,id);
const prefix = id => isWorks(id)?'diceworks/':'monastery/';
const obstacleKey = (id,name) => prefix(id)+(isWorks(id)?'machinery/':'obstacles/')+name;
const integratedBoard = id => id === 'q8r1' ? 'diceworks/floors/8-1-engine-pit-r3' : floorKey(id)+'-integrated-r4';
const images = new Map();
const floorKey = id => prefix(id)+(isWorks(id)?'floors/8-':'terrain/7-')+id.slice(-1);
const enemyKey = (id,p) => isWorks(id)?'diceworks/enemies/'+(p.variant==='boss'?'boss':p.role)+p.faces:'monastery/enemies/' + (p.clone ? 'cloner' : p.role === 'normal' ? 'ordinary' : p.role) + '-d' + p.faces;
export const has = id => Object.hasOwn(rooms,id);
function request(key) {
  if (images.has(key)) return;
  const image = new Image();
  images.set(key,image);
  image.src = new URL('./assets/premium-'+key+'.webp',import.meta.url);
}
function loaded(key) {
  const image = images.get(key);
  return image?.complete && image.naturalWidth ? image : null;
}
export function loadRoom(id,enemies) {
  if (isWorks(id)) request(integratedBoard(id));
  request(floorKey(id));
  for (const [name] of rooms[id]) request(obstacleKey(id,name));
  for (const enemy of enemies) request(enemyKey(id,enemy));
}
export const ready = id => has(id) && !!loaded(floorKey(id));
export function floor(ctx,s,id,blocked = []) {
  const image = integratedImage(id,blocked) || loaded(floorKey(id));
  ctx.drawImage(image,s.originX,s.originY,s.cell*13,s.cell*9);
}
const footprints = Object.fromEntries(Object.entries(rooms).map(([id,items]) => {
  const cells = new Set();
  for(const [,x,y,w,h] of items) for(let j=0;j<h;j++) for(let i=0;i<w;i++) cells.add((y+j)*13+x+i);
  return [id,cells];
}));
function matchesFootprint(id,blocked) {
  const actual = new Set(blocked.map(([x,y])=>y*13+x));
  return actual.size === footprints[id].size && [...actual].every(cell=>footprints[id].has(cell));
}
function integratedImage(id,blocked) {
  return isWorks(id) && matchesFootprint(id,blocked) && loaded(integratedBoard(id));
}
export function walls(ctx,s,id,blocked) {
  if (integratedImage(id,blocked)) return true;
  const expected = footprints[id];
  if (blocked.length!==expected.size || blocked.some(([x,y])=>!expected.has(y*13+x))) return false;
  if (rooms[id].some(([name])=>!loaded(obstacleKey(id,name)))) return false;
  ctx.save();
  ctx.shadowColor = '#17151580';ctx.shadowOffsetY = s.cell*.035;ctx.shadowBlur = s.cell*.025;
  for(const [name,x,y,w,h,rotation=0] of rooms[id]) {
    const image=loaded(obstacleKey(id,name)), width=(w-.06)*s.cell,height=(h-.06)*s.cell;
    const aspect=rotation?image.naturalHeight/image.naturalWidth:image.naturalWidth/image.naturalHeight;
    const ratio=id==='q7r1'?width/height:aspect*Math.max(isWorks(id)?.70:.82,Math.min(isWorks(id)?1.40:1.22,width/height/aspect));
    const dw=Math.min(width,height*ratio),dh=dw/ratio;
    const centre=s.at(x+(w-1)/2,y+(h-1)/2);
    if(rotation){
      ctx.save();ctx.translate(centre.x,centre.y);ctx.rotate(-Math.PI/2);
      ctx.drawImage(image,-dh/2,-dw/2,dh,dw);ctx.restore();
    }else ctx.drawImage(image,centre.x-dw/2,centre.y-dh/2,dw,dh);
  }
  ctx.restore();
  return true;
}
export function actor(ctx,s,p,kind,base,{label,selected,active,roomId}) {
  const enemy=kind==='enemy',image=enemy?loaded(enemyKey(roomId,p)):base;
  if(!image?.naturalWidth)return false;
  const c=s.cell,pt=s.at(p.x,p.y),boss=p.variant==='boss';
  const scale=Math.min(c*(boss?1:.9)/image.naturalWidth,c*(boss?1:.9)/image.naturalHeight)*(p.clone?.82:1);
  const dw=image.naturalWidth*scale,dh=image.naturalHeight*scale;
  ctx.save();
  if(active||selected){
    ctx.strokeStyle='#ffdc88';ctx.lineWidth=Math.max(2,c*.04);ctx.beginPath();
    ctx.ellipse(pt.x,pt.y+c*.22,c*.44,c*.19,0,0,Math.PI*2);ctx.stroke();
  }
  ctx.drawImage(image,pt.x-dw/2,pt.y+c*.28-dh,dw,dh);
  const title=boss?'Boss D'+p.faces:p.hp===0?'DOWN':label;
  const fs=Math.max(9,c*.17);
  ctx.font='bold '+fs+'px system-ui';ctx.textAlign='center';
  const width=ctx.measureText(title).width+c*.12;
  ctx.fillStyle='#172022ed';ctx.fillRect(pt.x-width/2,pt.y+c*.28,width,fs*1.2);
  ctx.fillStyle=boss?'#ffdc8c':'#fff';ctx.fillText(title,pt.x,pt.y+c*.28+fs);
  if(enemy){
    const y=pt.y+c*.28+fs*1.2,h=Math.max(2,c*.045);
    ctx.fillStyle='#252024';ctx.fillRect(pt.x-c*.33,y,c*.66,h);
    ctx.fillStyle='#d4ac83';ctx.fillRect(pt.x-c*.33,y,c*.66*Math.max(0,Math.min(1,p.hp/(p.maxHp||1))),h);
  }
  ctx.restore();return true;
}
