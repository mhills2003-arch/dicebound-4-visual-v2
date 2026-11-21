import {chaos} from './v2-chaos-plan.mjs';
import {warrens} from './v2-warrens-plan.mjs';
import {diceworks} from './v2-diceworks-plan.mjs';
import {rooms as monastery} from './v2-monastery-plan.mjs';

const isWarrens = id => Object.hasOwn(warrens,id);
const isChaos=id=>Object.hasOwn(chaos,id);
const paintedPlans={...warrens,...chaos};
const rooms = {...monastery,...Object.fromEntries(Object.keys(paintedPlans).map(id=>[id,[]])),...Object.fromEntries(Object.entries(diceworks).map(([id,r])=>[id,r.machinery]))};
const isWorks = id => Object.hasOwn(diceworks,id);
const prefix = id => isWorks(id)?'diceworks/':'monastery/';
const obstacleKey = (id,name) => prefix(id)+(isWorks(id)?'machinery/':'obstacles/')+name;
const integratedBoard = id => id === 'q8r1' ? 'diceworks/floors/8-1-engine-pit-r3' : floorKey(id)+'-integrated-r4';
const images = new Map();
const floorKey = id => isChaos(id) ? 'chaos/floors/10-'+id.slice(4) : isWarrens(id) ? 'warrens/floors/9-'+id.slice(-1) : prefix(id)+(isWorks(id)?'floors/8-':'terrain/7-')+id.slice(-1);
function warrensEnemy(p) {
  if (p.variant==='boss' || (p.clone && p.faces===20)) return 'boss20';
  const role=p.clone && p.parentId!=='nest' ? 'cloner' : p.role;
  return role+p.faces;
}
const diceworksEnemy = p => (p.variant==='boss'?'boss':p.role)+p.faces;
const chaosSprites={
  normal:'warrens/enemies/normal12',swift:'warrens/enemies/swift14',ranged:'diceworks/enemies/ranged14',
  teleporter:'warrens/enemies/teleporter14',cloner:'warrens/enemies/cloner14',ghost:'chaos/enemies/ghost',
  ninja:'monastery/enemies/ninja-d20',armoured:'diceworks/enemies/armoured14',healer:'monastery/enemies/healer-d12'
};
const chaosSprite=p=>p.variant==='boss'?'warrens/enemies/boss20':chaosSprites[p.role]||chaosSprites.normal;
const enemyKey = (id,p) => isChaos(id)?chaosSprite(p): isWarrens(id) ? 'warrens/enemies/'+warrensEnemy(p) : isWorks(id)?'diceworks/enemies/'+diceworksEnemy(p):'monastery/enemies/' + (p.clone ? 'cloner' : p.role === 'normal' ? 'ordinary' : p.role) + '-d' + p.faces;
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
export const ready = (id,blocked=[]) => has(id) && (!paintedPlans[id]||matchesFootprint(id,blocked)) && !!loaded(floorKey(id));
export function floor(ctx,s,id,blocked = []) {
  const image = integratedImage(id,blocked) || loaded(floorKey(id));
  ctx.drawImage(image,s.originX,s.originY,s.cell*(isChaos(id)?15:13),s.cell*(isChaos(id)?11:9));
}
const footprints = Object.fromEntries(Object.entries(rooms).map(([id,items]) => {
  const cells = new Set();
  if(paintedPlans[id]) paintedPlans[id].blueprint.forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='#')cells.add(y*row.length+x)}));
  for(const [,x,y,w,h] of items) for(let j=0;j<h;j++) for(let i=0;i<w;i++) cells.add((y+j)*13+x+i);
  return [id,cells];
}));
function matchesFootprint(id,blocked) {
  const actual = new Set(blocked.map(([x,y])=>y*(isChaos(id)?15:13)+x));
  return actual.size === footprints[id].size && [...actual].every(cell=>footprints[id].has(cell));
}
function integratedImage(id,blocked) {
  return isWorks(id) && matchesFootprint(id,blocked) && loaded(integratedBoard(id));
}
export function walls(ctx,s,id,blocked) {
  if(paintedPlans[id]) return matchesFootprint(id,blocked) && !!loaded(floorKey(id));
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
// Visible bounds in source pixels, excluding the soft transparent fringe.
const diceworksBounds = {
  armoured10: [0, 0, 433, 486],
  armoured12: [1, 0, 452, 522],
  armoured14: [0, 0, 452, 555],
  boss20: [0, 1, 675, 606],
  healer10: [1, 0, 624, 615],
  healer12: [0, 0, 757, 638],
  ninja12: [0, 0, 717, 638],
  normal10: [0, 0, 471, 582],
  normal12: [1, 1, 559, 575],
  ranged10: [0, 1, 648, 554],
  ranged12: [1, 0, 737, 575],
  ranged14: [0, 0, 706, 632],
  swift10: [1, 0, 496, 603],
  swift12: [1, 0, 569, 617],
};
const chaosBounds = {
  "warrens/enemies/boss20": [
    34,
    3,
    479,
    369
  ],
  "monastery/enemies/ninja-d20": [
    0,
    0,
    851,
    842
  ],
  "diceworks/enemies/armoured14": [
    0,
    0,
    452,
    555
  ],
  "monastery/enemies/healer-d12": [
    0,
    0,
    652,
    640
  ],
  "warrens/enemies/swift14": [
    36,
    23,
    381,
    434
  ],
  "warrens/enemies/cloner14": [
    42,
    23,
    467,
    455
  ],
  "diceworks/enemies/ranged14": [
    0,
    0,
    706,
    632
  ],
  "warrens/enemies/normal12": [
    43,
    83,
    357,
    431
  ],
  "warrens/enemies/teleporter14": [
    46,
    17,
    451,
    431
  ],
  "chaos/enemies/ghost": [
    0,
    0,
    399,
    527
  ]
};
const warrensBounds = {
  boss20: [34,3,479,369],
  cloner10: [22,63,434,454],
  cloner12: [27,132,444,478],
  cloner14: [42,23,467,455],
  ninja12: [10,63,354,412],
  ninja14: [28,35,379,427],
  normal10: [21,104,331,425],
  normal12: [43,83,357,431],
  ranged10: [37,38,384,423],
  ranged12: [25,13,394,434],
  swift10: [19,50,357,441],
  swift12: [5,139,385,473],
  swift14: [36,23,381,434],
  teleporter14: [46,17,451,431],
};
export function actor(ctx,s,p,kind,base,{label,selected,active,roomId}) {
  const enemy=kind==='enemy',image=enemy?loaded(enemyKey(roomId,p)):base;
  if(!image?.naturalWidth)return false;
  const c=s.cell,pt=s.at(p.x,p.y),boss=p.variant==='boss';
  const w=image.naturalWidth,h=image.naturalHeight;
  let left,top,dw,dh;
  if(!enemy){
    // Use the same player image, dimensions and resting anchor as Q5.
    dw=dh=c*1.28;
    left=pt.x-dw/2; top=pt.y-dh*.65;
  }else{
    let bounds;
    if(isWorks(roomId)) bounds=diceworksBounds[diceworksEnemy(p)];
    if(isChaos(roomId)) bounds=chaosBounds[chaosSprite(p)];
    if(isWarrens(roomId)) bounds=warrensBounds[warrensEnemy(p)];
    const [x,y,right,bottom]=bounds || [0,0,w,h];
    const span=c*(boss?1.34:1.10)*(p.clone?.82:1);
    const scale=span/Math.max(right-x,bottom-y);
    dw=w*scale; dh=h*scale;
    left=pt.x-(x+right)*scale/2;
    top=pt.y+c*.35-bottom*scale;
  }
  ctx.save();
  if(active||selected){
    ctx.strokeStyle='#ffdc88';ctx.lineWidth=Math.max(2,c*.04);ctx.beginPath();
    ctx.ellipse(pt.x,pt.y+c*.22,c*.44,c*.19,0,0,Math.PI*2);ctx.stroke();
  }
  ctx.drawImage(image,left,top,dw,dh);
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
