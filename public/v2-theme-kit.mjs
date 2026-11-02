/**
 * DICEBOUND V2 — environment art kit for all 133 campaign rooms.
 * Client-only deterministic drawing; never reads/mutates rules, positions, wins or loot.
 * Decorative objects are always rendered under character and hazard markers.
 */
export const QUEST_THEMES = Object.freeze({
  1:'forest',2:'mine',3:'giantforest',4:'quarry',5:'desert',6:'marsh',
  7:'monastery',8:'diceworks',9:'warrens',10:'chaos',11:'sunken',
  12:'city',13:'sky',14:'abyss',15:'celestial'
});
export const QUEST_ROOM_COUNTS=Object.freeze({1:3,2:5,3:5,4:5,5:8,6:8,7:8,8:8,9:8,10:10,11:10,12:10,13:15,14:15,15:15});
export function roomTheme(roomId){
 if(roomId==='camp')return 'camp';
 if(roomId==='woodland'||roomId==='clearing'||roomId==='watchpost')return 'forest';
 const m=/^q(\d+)r(\d+)$/.exec(String(roomId||''));
 if(!m)return null;
 const q=Number(m[1]),r=Number(m[2]);
 return r>=1&&r<=QUEST_ROOM_COUNTS[q]?QUEST_THEMES[q]||null:null;
}
const CONFIG=Object.freeze({
 forest:{name:'WOODLAND',floor1:'#30453a',floor2:'#182d28',highlight:'#a1a76e',shadow:'#091f1b',mark:'#806d44',light:'#ffd487',accent:'#809f58',detail:'fern'},
 mine:{name:'CRYSTAL MINES',floor1:'#444f62',floor2:'#1a2838',highlight:'#aeb7c3',shadow:'#090d20',mark:'#72679e',light:'#bb99ff',accent:'#7bceff',detail:'crystal'},
 giantforest:{name:'ANCIENT ROOTS',floor1:'#45553e',floor2:'#1b2921',highlight:'#a6a676',shadow:'#10190f',mark:'#7c6249',light:'#e5cb81',accent:'#74b77a',detail:'roots'},
 quarry:{name:'THE QUARRY',floor1:'#6d6351',floor2:'#383831',highlight:'#d4bd83',shadow:'#211d18',mark:'#ba925d',light:'#f4d793',accent:'#e4bb5e',detail:'chisel'},
 desert:{name:'SUN-BAKED RUINS',floor1:'#947452',floor2:'#49372d',highlight:'#f0d3a0',shadow:'#2a2022',mark:'#c7a264',light:'#ffd18d',accent:'#d9a95b',detail:'dunes'},
 marsh:{name:'FEN & CRYPT',floor1:'#2c5654',floor2:'#102d36',highlight:'#89b3a8',shadow:'#06191f',mark:'#488177',light:'#7edecd',accent:'#8ac3a0',detail:'ripples'},
 monastery:{name:'THE MONASTERY',floor1:'#777279',floor2:'#30303e',highlight:'#c9b7a3',shadow:'#1d1d2a',mark:'#866b74',light:'#ffe6a2',accent:'#b48099',detail:'mosaic'},
 diceworks:{name:'THE DICEWORKS',floor1:'#59616a',floor2:'#252d3e',highlight:'#bcae9c',shadow:'#111b27',mark:'#a7764d',light:'#ffb56d',accent:'#e6a756',detail:'gears'},
 warrens:{name:'THOUSANDFOLD WARRENS',floor1:'#574054',floor2:'#221a2c',highlight:'#b99a9d',shadow:'#140f1d',mark:'#947289',light:'#c59df6',accent:'#b86bb7',detail:'burrow'},
 chaos:{name:'THE CHAOS DIMENSION',floor1:'#4f436f',floor2:'#1a143c',highlight:'#d4a4ed',shadow:'#100820',mark:'#c46bcc',light:'#de82f9',accent:'#87b3fa',detail:'chaos'},
 sunken:{name:'SUNKEN KINGDOM',floor1:'#376e78',floor2:'#133345',highlight:'#97d1cd',shadow:'#061923',mark:'#65aaaf',light:'#7be8db',accent:'#a6ecdc',detail:'waves'},
 city:{name:'THE OCCUPIED CITY',floor1:'#686057',floor2:'#2c2930',highlight:'#cfbca3',shadow:'#1e171d',mark:'#a88669',light:'#f2ba83',accent:'#c98665',detail:'cobble'},
 sky:{name:'CLOUDWARD REALMS',floor1:'#7e95a0',floor2:'#364d6b',highlight:'#e4d9c1',shadow:'#1b3658',mark:'#bac3cd',light:'#ebedf9',accent:'#c9e5ef',detail:'wind'},
 abyss:{name:'THE ABYSS',floor1:'#323359',floor2:'#10132e',highlight:'#958bc4',shadow:'#090b1a',mark:'#7774bf',light:'#9099e9',accent:'#a9a1ee',detail:'runes'},
 celestial:{name:'THE LAST ROLL',floor1:'#535273',floor2:'#202239',highlight:'#ebd5a9',shadow:'#151020',mark:'#b5a0b8',light:'#efc77d',accent:'#ead09d',detail:'stars'},
 camp:{name:'ADVENTURERS’ CAMP',floor1:'#6c5845',floor2:'#322e2a',highlight:'#dfbb82',shadow:'#1f2228',mark:'#9b7c50',light:'#ffce8a',accent:'#b48d5b',detail:'planks'}
});
export const THEME_CONFIG=CONFIG;
export const allThemeNames=Object.freeze(Object.keys(CONFIG));
const TAU=Math.PI*2;
const rand=(x,y,z=0)=>{let h=(Math.imul(x+17,374761393)^Math.imul(y+31,668265263)^Math.imul(z+71,2246822519))|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295};
const roomSeed=id=>{let n=0;for(let i=0;i<String(id).length;i++)n=Math.imul(n^id.charCodeAt(i),16777619)|0;return n&65535};
const gradient=(c,x,y,w,h,a,b)=>{const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,a);g.addColorStop(1,b);return g};
function stroke(c,x,y,X,Y,col,width=1){c.strokeStyle=col;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.stroke()}
function circle(c,x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,TAU);c.fill()}
function ellipse(c,x,y,rx,ry,color,ang=0){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,ang,0,TAU);c.fill()}
function diamond(c,x,y,hw,hh){c.beginPath();c.moveTo(x,y-hh);c.lineTo(x+hw,y);c.lineTo(x,y+hh);c.lineTo(x-hw,y);c.closePath()}
function curve(c,x,y,u,v,x2,y2,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(u,v,x2,y2);c.stroke()}
function sigil(c,x,y,r,theme,seed){
 const k=CONFIG[theme];c.save();c.translate(x,y);c.strokeStyle=k.accent+'99';c.lineWidth=Math.max(.8,r*.045);
 c.beginPath();c.arc(0,0,r*.69,0,TAU);c.stroke();c.beginPath();c.arc(0,0,r*.42,0,TAU);c.stroke();
 for(let i=0;i<6;i++){const a=i*TAU/6+seed*.06;stroke(c,Math.cos(a)*r*.48,Math.sin(a)*r*.48,Math.cos(a)*r*.68,Math.sin(a)*r*.68,k.highlight+'9c',Math.max(.8,r*.035))}
 c.restore();
}
function floorMotif(c,x,y,s,tx,ty,t,seed){
 const r=s*.5, cx=x+r,cy=y+r,h=rand(tx,ty,seed+24),o=CONFIG[t],th=Math.max(.7,s*.012);
 if(t==='forest'||t==='giantforest'||t==='marsh'){
  if(h>.38){for(let i=0;i<3;i++){
   const x1=x+s*(.15+rand(tx,i,seed)*.7),y1=y+s*(.23+rand(ty,i,seed+1)*.54);
   curve(c,x1,y1,x1+s*.08,y1-s*.08,x1+s*.17,y1-s*.12,t==='marsh'?'#a2d3a271':'#83a96b8d',th);
   ellipse(c,x1+s*.08,y1-s*.07,s*.035,s*.09,'#769d6199',-1);
  }}
  if(t==='marsh'){ellipse(c,cx,cy,r*.65,r*.20,'#75c0bb22',-.2);for(let i=0;i<2;i++){
  c.strokeStyle='#a1dedc4d';c.lineWidth=th;c.beginPath();c.ellipse(cx,cy,r*(.3+i*.22),r*(.10+i*.08),-.3,0,TAU);c.stroke()}}
  if(t==='giantforest')curve(c,x+s*.10,y+s*.87,x+s*.35,y+s*.25,x+s*.91,y+s*.40,'#3a3329ae',s*.07);
 }else if(t==='mine'||t==='quarry'){
  if(h>.50){const posx=x+s*(.2+rand(tx,ty,seed+33)*.4),posy=y+s*(.2+rand(tx,ty,seed+44)*.4);
   stroke(c,posx,posy,posx+s*.22,posy+s*.15,o.highlight+'70',th);
   stroke(c,posx+s*.22,posy+s*.15,posx+s*.27,posy-s*.03,o.shadow+'b8',th*1.7)}
  if(t==='mine'){ellipse(c,x+s*.77,y+s*.31,s*.055,s*.035,'#b6a2ef64',-.4)}
  else for(let k=0;k<3;k++)stroke(c,x+s*.16,y+s*(.15+k*.085),x+s*.35,y+s*(.15+k*.085),'#c7ad827a',th);
 }else if(t==='desert'){
  for(let k=0;k<2;k++)curve(c,x+s*.08,y+s*(.2+k*.29),x+s*.4,y+s*(.10+k*.29),x+s*.88,y+s*(.19+k*.29),'#e4c18a53',th);
  if(h>.55)ellipse(c,x+s*.57,y+s*.65,s*.1,s*.035,'#3a241b52');
 }else if(t==='monastery'||t==='city'){
  if(t==='monastery'&&h>.67)sigil(c,cx,cy,r*.65,t,seed);
  else {
    stroke(c,x+s*.15,y+s*.32,x+s*.85,y+s*.32,o.shadow+'77',th);
    stroke(c,x+s*.48,y+s*.32,x+s*.48,y+s*.73,o.highlight+'43',th);
    stroke(c,x+s*.12,y+s*.73,x+s*.82,y+s*.73,o.shadow+'77',th);
  }
 }else if(t==='diceworks'){
  if(h>.65){c.strokeStyle=o.accent+'88';c.lineWidth=th*1.5;c.beginPath();c.arc(cx,cy,s*.23,0,TAU);c.stroke();circle(c,cx,cy,s*.04,o.shadow)}
  else for(let k=0;k<3;k++)stroke(c,x+s*.24,y+s*(.23+k*.21),x+s*.80,y+s*(.23+k*.21),o.shadow+'66',th);
 }else if(t==='warrens'){
  for(let k=0;k<3;k++)curve(c,x+s*.15,y+s*(.24+k*.19),x+s*(.37+k*.03),y+s*.6,x+s*.8,y+s*(.28+k*.15),o.accent+'5d',th);
 }else if(t==='chaos'||t==='abyss'||t==='celestial'){
  if(h>.55)sigil(c,cx,cy,r*(t==='celestial'?.6:.4),t,seed);
  if(t==='chaos'){
   curve(c,x+s*.10,y+s*.75,x+s*.37,y+s*.27,x+s*.57,y+s*.44,'#b9a0f2a1',th*1.6);
   stroke(c,x+s*.57,y+s*.44,x+s*.87,y+s*.15,'#b9a0f2a1',th*1.5);
  }
  if(t==='celestial'){for(let i=0;i<3;i++)circle(c,x+s*rand(tx,i,seed+11),y+s*rand(ty,i,seed+12),Math.max(1,s*.011),'#f2dfa9aa')}
 }else if(t==='sunken'){
  for(let k=0;k<2;k++)curve(c,x+s*.11,y+s*(.22+k*.24),x+s*.40,y+s*(.05+k*.25),x+s*.90,y+s*(.21+k*.25),o.highlight+'63',th);
  if(h>.48)ellipse(c,x+s*.23,y+s*.78,s*.12,s*.05,'#d3f8e253',.1);
 }else if(t==='sky'){
  curve(c,x+s*.08,y+s*.22,x+s*.30,y+s*.05,x+s*.70,y+s*.23,'#f4f6fa73',th*1.6);
  curve(c,x+s*.20,y+s*.58,x+s*.65,y+s*.42,x+s*.89,y+s*.46,'#ebecdb4f',th);
 }else if(t==='camp'){
  for(let k=0;k<3;k++)stroke(c,x+s*.12,y+s*(.21+k*.29),x+s*.88,y+s*(.21+k*.29),'#1c1d205c',th*1.3);
  circle(c,x+s*.16,y+s*.19,s*.016,'#e7c99f8a');circle(c,x+s*.85,y+s*.77,s*.016,'#e7c99f8a');
 }
}
/** Paint theme-specific texture *within* the real collision tile. */
export function paintThemeFloor(c,{x,y,size,tileX,tileY,roomId}){
 const t=roomTheme(roomId);if(!t)return false;
 const p=CONFIG[t],seed=roomSeed(roomId),h=rand(tileX,tileY,seed),s=size;
 c.save();c.beginPath();c.rect(x,y,s,s);c.clip();
 c.fillStyle=gradient(c,x,y,s,s,h>.42?p.floor1:p.floor2,p.floor2);c.fillRect(x,y,s,s);
 // A calm centre and irregular surface modulation, never false blocking shapes.
 for(let i=0;i<10;i++){
  const px=x+s*rand(tileX,tileY,seed+11+i*5),py=y+s*rand(tileX,tileY,seed+12+i*5);
  const radius=s*(.016+.035*rand(tileX,tileY,seed+13+i*5));
  ellipse(c,px,py,radius*1.7,radius*.52,i%3?p.highlight+'27':p.shadow+'60',rand(i,tileX,seed)*TAU);
 }
 floorMotif(c,x,y,s,tileX,tileY,t,seed);
 // Offset grain adds unique arrangement room-by-room without random flicker.
 for(let k=0;k<4;k++){
  const px=x+s*rand(tileX,k,seed+60),py=y+s*rand(tileY,k,seed+61);
  circle(c,px,py,Math.max(.4,s*.009),p.highlight+'37');
 }
 const shaded=c.createLinearGradient(x,y,x+s*.75,y+s);shaded.addColorStop(0,p.highlight+'22');shaded.addColorStop(.65,'#00000000');shaded.addColorStop(1,p.shadow+'53');
 c.fillStyle=shaded;c.fillRect(x,y,s,s);
 c.lineWidth=Math.max(.65,s*.012);c.strokeStyle=p.highlight+'42';c.strokeRect(x+.5,y+.5,s-1,s-1);
 c.restore();return true;
}
/** For illustrated view, share the same palette and motifs, masked to the diamond. */
export function paintThemeIso(c,{position,halfW,halfH,tileX,tileY,roomId}){
 const t=roomTheme(roomId);if(!t)return false;
 const p=CONFIG[t],seed=roomSeed(roomId),x=position.x,y=position.y;
 c.save();diamond(c,x,y,halfW,halfH);c.clip();
 c.fillStyle=gradient(c,x-halfW,y-halfH,halfW*2,halfH*2,p.floor1,p.floor2);c.fillRect(x-halfW,y-halfH,halfW*2,halfH*2);
 c.save();c.translate(x-halfW,y-halfH);c.scale(halfW*2/90,halfH*2/90);
 floorMotif(c,0,0,90,tileX,tileY,t,seed);c.restore();
 for(let i=0;i<5;i++){const px=x+(rand(tileX,i,seed)*2-1)*halfW,py=y+(rand(tileY,i,seed)*2-1)*halfH;
 ellipse(c,px,py,halfW*.038,halfH*.04,p.highlight+'55')}
 c.restore();diamond(c,x,y,halfW,halfH);c.lineWidth=1;c.strokeStyle=p.highlight+'6f';c.stroke();return true;
}
export function paintThemeBackdrop(c,w,h,roomId){
 const t=roomTheme(roomId);if(!t)return false;
 const p=CONFIG[t],seed=roomSeed(roomId);
 c.save();c.fillStyle=gradient(c,0,0,w,h,p.floor1,p.shadow);c.fillRect(0,0,w,h);
 const g=c.createRadialGradient(w*.43,h*.38,0,w*.51,h*.51,Math.max(w,h)*.72);
 g.addColorStop(0,p.accent+'47');g.addColorStop(.6,p.floor2+'20');g.addColorStop(1,p.shadow+'cc');c.fillStyle=g;c.fillRect(0,0,w,h);
 for(let i=0;i<18;i++){
 const px=w*rand(i,44,seed),py=h*rand(i,18,seed);circle(c,px,py,1+rand(i,9,seed)*2,p.highlight+'33')}
 c.restore();return true;
}
function rock(c,x,y,r,p,seed){
 c.save();c.translate(x,y);c.fillStyle=gradient(c,-r,-r,2*r,2*r,p.highlight,p.floor2);
 c.beginPath();c.moveTo(-r*.70,-r*.35);c.lineTo(-r*.35,-r*.8);c.lineTo(r*.35,-r*.7);c.lineTo(r*.8,-r*.21);c.lineTo(r*.55,r*.63);c.lineTo(-r*.48,r*.65);c.closePath();c.fill();
 curve(c,-r*.55,-r*.21,-r*.1,-r*.52,r*.33,-r*.58,p.highlight+'9c',Math.max(1,r*.04));
 if(rand(seed,7)>.45)ellipse(c,-r*.15,-r*.59,r*.22,r*.07,p.accent+'90',-.2);c.restore();
}
function pillar(c,x,y,r,p,seed){
 c.save();c.translate(x,y);c.fillStyle=p.shadow;
 c.fillRect(-r*.46,-r*.15,r*.95,r*.8);
 c.fillStyle=gradient(c,-r,-r,r*2,r*1.4,p.highlight,p.floor2);c.fillRect(-r*.35,-r*.77,r*.7,r*1.4);
 c.fillStyle=p.highlight;c.fillRect(-r*.52,-r*.75,r*1.04,r*.15);c.fillRect(-r*.49,r*.52,r*.98,r*.18);
 for(let i=0;i<3;i++)stroke(c,-r*.22,-r*(.41-i*.28),r*.20,-r*(.41-i*.28),p.shadow+'8c',Math.max(.7,r*.03));
 c.restore();
}
function amberLight(c,x,y,r,p){
 c.save();const g=c.createRadialGradient(x,y,0,x,y,r*2.2);g.addColorStop(0,p.light+'a0');g.addColorStop(.35,p.light+'32');g.addColorStop(1,p.light+'00');c.fillStyle=g;c.fillRect(x-r*2.2,y-r*2.2,r*4.4,r*4.4);c.restore();
}
function crystal(c,x,y,r,p,seed){
 amberLight(c,x,y,r*.7,p);
 for(let i=0;i<3;i++){
  const dx=x+r*(i-1)*.36,h=r*(.65+rand(seed,i)*.5);
  c.fillStyle=i===1?p.accent:p.highlight;c.strokeStyle=p.light+'b8';c.lineWidth=Math.max(.7,r*.03);
  c.beginPath();c.moveTo(dx-r*.18,y+r*.25);c.lineTo(dx-r*.23,y-h*.36);c.lineTo(dx,y-h);c.lineTo(dx+r*.19,y-h*.31);c.lineTo(dx+r*.20,y+r*.23);c.closePath();c.fill();c.stroke();
 }
}
function banner(c,x,y,r,p,seed){
 c.save();c.fillStyle=p.mark;c.strokeStyle=p.highlight;c.lineWidth=Math.max(1,r*.04);
 c.beginPath();c.moveTo(x-r*.42,y-r*.74);c.lineTo(x+r*.42,y-r*.74);c.lineTo(x+r*.42,y+r*.36);c.lineTo(x,y+r*.63);c.lineTo(x-r*.42,y+r*.36);c.closePath();c.fill();c.stroke();
 stroke(c,x-r*.25,y-r*.43,x+r*.24,y-r*.43,p.highlight+'a8',Math.max(.8,r*.035));
 circle(c,x,y-r*.15,r*.11,p.accent);c.restore();
}
function barrel(c,x,y,r,p){
 c.save();ellipse(c,x,y+r*.27,r*.44,r*.24,p.shadow);
 c.fillStyle=p.mark;c.fillRect(x-r*.38,y-r*.52,r*.76,r*.79);
 c.fillStyle=p.highlight;ellipse(c,x,y-r*.52,r*.38,r*.19,p.highlight);
 for(let i=0;i<2;i++)stroke(c,x-r*.38,y-r*.28+i*r*.49,x+r*.38,y-r*.28+i*r*.49,p.shadow+'bb',r*.09);
 c.restore();
}
function treeRoots(c,x,y,r,p,seed){
 c.save();ellipse(c,x,y+r*.18,r*.65,r*.25,p.shadow+'a6');
 c.fillStyle=p.mark;c.fillRect(x-r*.18,y-r*.67,r*.38,r);
 for(let i=0;i<5;i++){
 const a=(i/5)*TAU;curve(c,x,y-r*.36,x+Math.cos(a)*r*.55,y-r*.84,x+Math.cos(a)*r*.85,y-r*.45,p.accent+'b2',Math.max(1,r*.18));}
 for(let i=0;i<4;i++)circle(c,x+r*(rand(seed,i)-.5),y-r*(.45+rand(seed,i+6)*.40),r*.23,p.accent+'a4');
 c.restore();
}
function gear(c,x,y,r,p,seed){
 c.save();c.strokeStyle=p.accent;c.lineWidth=Math.max(1,r*.11);
 c.beginPath();c.arc(x,y,r*.45,0,TAU);c.stroke();
 for(let i=0;i<8;i++){let a=i*TAU/8;stroke(c,x+Math.cos(a)*r*.44,y+Math.sin(a)*r*.44,x+Math.cos(a)*r*.69,y+Math.sin(a)*r*.69,p.highlight,Math.max(1,r*.12))}
 circle(c,x,y,r*.14,p.floor2);c.restore();
}
function roots(c,x,y,r,p,seed){
 for(let i=0;i<4;i++){
  const dx=(i-1.5)*r*.35;
  curve(c,x+dx,y-r*.9,x+dx-r*.15,y,x+dx+r*.27,y+r*.75,p.mark,Math.max(1,r*.11));
  if(i%2)ellipse(c,x+dx-r*.04,y-r*.08,r*.12,r*.21,p.accent+'89',.35);
 }
}
function rune(c,x,y,r,p){sigil(c,x,y,r*.85,'celestial',7);circle(c,x,y,r*.16,p.light+'66')}
function motifObject(c,p,r,theme,seed,iso){
 const cfg=CONFIG[theme];c.save();if(iso){c.translate(p.x,p.y);c.scale(1,.73);c.translate(-p.x,-p.y)}
 c.shadowColor=cfg.shadow+'af';c.shadowBlur=r*.24;c.shadowOffsetY=r*.08;
 const type=cfg.detail,choice=rand(seed,18);
 if(['forest','giantforest'].includes(theme))choice>.26?treeRoots(c,p.x,p.y,r,cfg,seed):rock(c,p.x,p.y,r,cfg,seed);
 else if(theme==='mine'||theme==='chaos'||theme==='abyss')choice>.30?crystal(c,p.x,p.y,r*.9,cfg,seed):rock(c,p.x,p.y,r,cfg,seed);
 else if(theme==='quarry'||theme==='desert')choice>.55?pillar(c,p.x,p.y,r,cfg,seed):rock(c,p.x,p.y,r,cfg,seed);
 else if(theme==='marsh'||theme==='warrens')choice>.60?roots(c,p.x,p.y,r,cfg,seed):rock(c,p.x,p.y,r,cfg,seed);
 else if(theme==='monastery'||theme==='city'||theme==='celestial')choice>.49?banner(c,p.x,p.y,r,cfg,seed):pillar(c,p.x,p.y,r,cfg,seed);
 else if(theme==='diceworks')choice>.25?gear(c,p.x,p.y,r,cfg,seed):barrel(c,p.x,p.y,r,cfg);
 else if(theme==='sunken')choice>.40?pillar(c,p.x,p.y,r,cfg,seed):crystal(c,p.x,p.y,r*.7,cfg,seed);
 else if(theme==='sky')choice>.4?pillar(c,p.x,p.y,r*.85,cfg,seed):rock(c,p.x,p.y,r,cfg,seed);
 else if(theme==='camp')choice>.49?barrel(c,p.x,p.y,r,cfg):banner(c,p.x,p.y,r,cfg,seed);
 c.restore();
}
/** Decorations only at existing blocked tiles, plus faint floor decals on existing open tiles. */
export function paintThemeDressing(c,s,walls,roomId){
 const theme=roomTheme(roomId);if(!theme)return false;
 const cfg=CONFIG[theme],seed=roomSeed(roomId);const occupied=new Set(walls.map(([x,y])=>`${x},${y}`));
 // The real wall position is the only source for substantial scenery.
 for(const [x,y] of walls){const p=s.at(x,y),r=s.cell*(s.iso?.60:.43);
  motifObject(c,p,r,theme,seed+x*37+y*83,s.iso);
 }
 const count=QUEST_ROOM_COUNTS[Number(/^q(\d+)/.exec(roomId)?.[1])||1]||6;
 const dims=Number(/^q(\d+)/.exec(roomId)?.[1])>=10?{w:15,h:11}:Number(/^q(\d+)/.exec(roomId)?.[1])>=5?{w:13,h:9}:{w:9,h:7};
 // An individual room signature: one tasteful centre motif on a safe floor square.
 for(let j=0;j<2;j++){
  const x=2+Math.floor(rand(seed,j,41)*(dims.w-4)),y=1+Math.floor(rand(seed,j,42)*(dims.h-2));
  if(occupied.has(`${x},${y}`))continue;
  const p=s.at(x,y),r=s.cell*(s.iso?.39:.27);
  c.save();c.globalAlpha=.25;
  if(theme==='celestial'||theme==='chaos'||theme==='monastery'||theme==='abyss')sigil(c,p.x,p.y,r,theme,seed);
  else {c.strokeStyle=cfg.accent+'98';c.lineWidth=Math.max(.7,r*.07);
   c.beginPath();c.arc(p.x,p.y,r*.62,0,TAU);c.stroke();}
  c.restore();
 }
 return true;
}
export function paintThemeLight(c,s,walls,roomId){
 const theme=roomTheme(roomId);if(!theme)return false;
 const p=CONFIG[theme],seed=roomSeed(roomId),num=Number(/^q(\d+)/.exec(roomId)?.[1])||1;
 const {w:cols,h:rows}=num>=10?{w:15,h:11}:num>=5?{w:13,h:9}:{w:9,h:7};
 const x=s.iso?0:s.originX,y=s.iso?0:s.originY,w=s.iso?c.canvas.width:cols*s.cell,h=s.iso?c.canvas.height:rows*s.cell;
 c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
 for(let i=0;i<3;i++){
  const loc=s.at(1+rand(i,seed,43)*(cols-2),1+rand(i,seed,53)*(rows-2)),r=s.cell*(2.5+rand(i,seed,63)*2.1);
  const g=c.createRadialGradient(loc.x,loc.y,0,loc.x,loc.y,r);
  g.addColorStop(0,p.light+(i===0?'70':'4d'));g.addColorStop(.47,p.light+'1c');g.addColorStop(1,p.light+'00');
  c.fillStyle=g;c.fillRect(loc.x-r,loc.y-r,r*2,r*2);
 }
 const darkness=c.createRadialGradient(x+w*.53,y+h*.44,w*.10,x+w*.52,y+h*.5,w*.78);
 darkness.addColorStop(0,p.shadow+'00');darkness.addColorStop(.65,p.shadow+'19');darkness.addColorStop(1,p.shadow+'a0');
 c.fillStyle=darkness;c.fillRect(x,y,w,h);c.restore();
 if(!s.iso){c.save();c.strokeStyle=p.highlight+'b7';c.lineWidth=Math.max(1,s.cell*.035);c.strokeRect(x-2,y-2,w+4,h+4);
 c.strokeStyle=p.shadow+'a0';c.lineWidth=2;c.strokeRect(x-5,y-5,w+10,h+10);c.restore()}
 return true;
}
