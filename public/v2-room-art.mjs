import {roomTheme,paintThemeFloor,paintThemeIso,paintThemeBackdrop,paintThemeDressing,paintThemeLight} from './v2-theme-kit.mjs';
/**
 * DICEBOUND V2 · Smuggler's Station visual vertical slice.
 * Pure Canvas artwork: NO input handlers, collision rules, item definitions,
 * procedural game data, networking or game-state mutation.
 * Every coordinate is a visual projection of an existing server-authoritative tile.
 */
export const V2_ART_ROOM = 'q5r7';
export const V2_WOODLAND_ROOM = 'woodland';
export const isV2ArtRoom = id => id === V2_ART_ROOM || id === V2_WOODLAND_ROOM || Boolean(roomTheme(id));
const TAU = Math.PI * 2;
const hash = (x,y,s=0) => {let n=Math.imul((x+31)*1103515245,(y+71)*12345) ^ Math.imul(s+37,2654435761);n^=n>>>16;n=Math.imul(n,2246822519);return ((n^(n>>>13))>>>0)/4294967295};
const point = (ctx,x,y,r,color) => {ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=color;ctx.fill()};
function line(ctx,x1,y1,x2,y2,color,w=1){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineWidth=w;ctx.strokeStyle=color;ctx.stroke()}
const grad = (ctx,x0,y0,x1,y1,a,b) => {const g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,a);g.addColorStop(1,b);return g};
function diamond(ctx,p,hw,hh){ctx.beginPath();ctx.moveTo(p.x,p.y-hh);ctx.lineTo(p.x+hw,p.y);ctx.lineTo(p.x,p.y+hh);ctx.lineTo(p.x-hw,p.y);ctx.closePath()}

// Fill only the real logical tile. Stone grain is stable across frames and does
// not pretend to be a wall, obstacle, pickup or interactable.
export function paintStoneFloorTile(ctx,{x,y,size,tileX,tileY,texture,theme}){
 if(theme==='woodland')return paintWoodlandFloorTile(ctx,{x,y,size,tileX,tileY});
 if(paintThemeFloor(ctx,{x,y,size,tileX,tileY,roomId:theme}))return;
 const k=hash(tileX,tileY),c=size;
 ctx.save();ctx.fillStyle=grad(ctx,x,y,x+c,y+c,k<.33?'#4c514e':k<.68?'#56564d':'#465053', '#252d33');ctx.fillRect(x,y,c,c);
 if(texture?.complete&&texture.naturalWidth){ctx.save();ctx.globalAlpha=.105;ctx.drawImage(texture,x,y,c,c);ctx.restore()}
 ctx.fillStyle=grad(ctx,x,y,x,y+c,'#e8bc7d10','#050d16a0');ctx.fillRect(x,y,c,c);
 ctx.strokeStyle='#e7c28a24';ctx.lineWidth=Math.max(.55,c*.012);ctx.strokeRect(x+.7,y+.7,c-1.4,c-1.4);
 // Occasional chipped grout and flecks; deterministic, never moving.
 if(k>.43){
  const nx=x+c*(.18+hash(tileX,tileY,1)*.49),ny=y+c*(.22+hash(tileX,tileY,2)*.44);
  line(ctx,nx,ny,nx+c*.16,ny+c*.055,'#070e17a5',Math.max(.6,c*.023));
  line(ctx,nx+c*.16,ny+c*.055,nx+c*.21,ny-c*.045,'#a8a49a48',Math.max(.4,c*.012));
 }
 for(let i=0;i<3;i++){
  const a=hash(tileX,tileY,4+i),b=hash(tileX,tileY,8+i);
  point(ctx,x+c*(.10+a*.79),y+c*(.08+b*.84),Math.max(.45,c*.010),i%2?'#d8c5a42c':'#080b143e');
 }
 ctx.restore();
}
export function paintIsoFloorTile(ctx,{position,halfW,halfH,tileX,tileY,theme}){
 if(theme==='woodland')return paintWoodlandIsoTile(ctx,{position,halfW,halfH,tileX,tileY});
 if(paintThemeIso(ctx,{position,halfW,halfH,tileX,tileY,roomId:theme}))return;
 const k=hash(tileX,tileY);ctx.save();diamond(ctx,position,halfW,halfH);ctx.clip();
 ctx.fillStyle=grad(ctx,position.x-halfW,position.y-halfH,position.x+halfW,position.y+halfH,k<.45?'#666153':'#525b59','#283742');
 ctx.fillRect(position.x-halfW,position.y-halfH,halfW*2,halfH*2);
 ctx.fillStyle='#d6c49a13';ctx.fillRect(position.x-halfW,position.y-halfH,halfW*2,halfH*.6);
 if(k>.53){line(ctx,position.x-halfW*.38,position.y-halfH*.1,position.x+halfW*.15,position.y+halfH*.27,'#0b1a27a1',Math.max(.6,halfW*.025));}
 ctx.restore();ctx.strokeStyle='#c8ab7655';ctx.lineWidth=1;diamond(ctx,position,halfW,halfH);ctx.stroke();
}
export function paintArtBackdrop(ctx,width,height,{theme}={}){
 if(theme==='woodland')return paintWoodlandBackdrop(ctx,width,height);
 if(paintThemeBackdrop(ctx,width,height,theme))return;
 ctx.save();ctx.fillStyle=grad(ctx,0,0,0,height,'#19262b','#070f1b');ctx.fillRect(0,0,width,height);
 const pool=ctx.createRadialGradient(width*.55,height*.43,5,width*.54,height*.5,Math.max(width,height)*.68);
 pool.addColorStop(0,'#93714a3b');pool.addColorStop(.46,'#253a3b29');pool.addColorStop(1,'#050c1688');ctx.fillStyle=pool;ctx.fillRect(0,0,width,height);
 for(let i=0;i<16;i++){
   const px=hash(i,11)*width,py=hash(i,29)*height;
   point(ctx,px,py,.6+hash(i,41),i%3?'#dabb8245':'#dbeedc34');
 }
 ctx.restore();
}
function floorPos(s,x,y){return s.at(x,y)}
function openCell(walls,x,y){return !walls.has(`${x},${y}`)}
function drawSeal(ctx,p,r,iso){
 ctx.save();ctx.translate(p.x,p.y);if(iso)ctx.scale(1,.59);ctx.globalAlpha=.40;
 const ring=ctx.createRadialGradient(0,0,r*.3,0,0,r);ring.addColorStop(0,'#cba46e19');ring.addColorStop(1,'#f2bc6830');point(ctx,0,0,r,ring);
 ctx.strokeStyle='#dda86b';ctx.lineWidth=Math.max(1,r*.025);ctx.beginPath();ctx.arc(0,0,r*.82,0,TAU);ctx.stroke();
 ctx.beginPath();ctx.arc(0,0,r*.60,0,TAU);ctx.stroke();
 ctx.fillStyle='#e1c78a';ctx.beginPath();ctx.moveTo(0,-r*.83);ctx.lineTo(r*.16,-r*.15);ctx.lineTo(r*.76,0);ctx.lineTo(r*.12,r*.17);ctx.lineTo(0,r*.78);ctx.lineTo(-r*.15,r*.16);ctx.lineTo(-r*.74,0);ctx.lineTo(-r*.13,-r*.16);ctx.closePath();ctx.fill();
 ctx.fillStyle='#4f554e';point(ctx,0,0,r*.17,'#39424b');ctx.restore();
}
function drawFloorDetail(ctx,s,x,y,kind){
 const p=floorPos(s,x,y),r=Math.max(4,s.cell*(s.iso?.30:.31));ctx.save();ctx.translate(p.x,p.y);
 if(s.iso)ctx.scale(1,.60);
 ctx.globalAlpha=.55;ctx.lineCap='round';
 if(kind==='rope'){
  ctx.strokeStyle='#b18d59';ctx.lineWidth=Math.max(1.2,r*.14);
  for(const [rr,off] of [[.83,0],[.58,-.09],[.33,.08]]){ctx.beginPath();ctx.ellipse(0,0,r*rr,r*rr*.75,off,0,TAU);ctx.stroke()}
  line(ctx,-r*.75,r*.52,-r*1.1,r*.84,'#b18d59',Math.max(1,r*.11));
 }else if(kind==='scuff'){
  for(let i=0;i<4;i++)line(ctx,-r*.75+i*r*.39,-r*.12,r*(-.34+i*.37),r*.34,'#0d121e7e',Math.max(.6,r*.075));
 }else if(kind==='mosaic'){
  ctx.strokeStyle='#a5a09a';ctx.lineWidth=Math.max(.6,r*.08);
  for(let i=0;i<4;i++){let a=i*Math.PI/2;line(ctx,Math.cos(a)*r*.37,Math.sin(a)*r*.37,Math.cos(a)*r*.82,Math.sin(a)*r*.82,'#a5a09a',Math.max(.6,r*.08))}
  ctx.beginPath();ctx.arc(0,0,r*.41,0,TAU);ctx.stroke();
 }
 ctx.restore();
}
function drawCrate(ctx,p,r,iso){
 ctx.save();ctx.translate(p.x,p.y);if(iso)ctx.scale(1,.78);ctx.shadowBlur=r*.45;ctx.shadowColor='#03070dc7';
 ctx.fillStyle='#6c5034';ctx.strokeStyle='#bb9260';ctx.lineWidth=Math.max(1,r*.08);
 ctx.beginPath();ctx.rect(-r*.55,-r*.67,r*1.1,r*1.1);ctx.fill();ctx.stroke();
 ctx.strokeStyle='#d0a86c8a';line(ctx,-r*.44,-r*.57,r*.44,r*.35,'#d0a86c8a',Math.max(1,r*.08));line(ctx,r*.43,-r*.57,-r*.42,r*.35,'#d0a86c8a',Math.max(1,r*.08));
 ctx.fillStyle='#281f20';point(ctx,-r*.40,-r*.50,Math.max(1,r*.07),'#282020');point(ctx,r*.40,r*.30,Math.max(1,r*.07),'#282020');ctx.restore();
}
function drawBanner(ctx,p,r,iso){
 ctx.save();ctx.translate(p.x,p.y-r*.20);if(iso)ctx.scale(1,.78);
 ctx.shadowColor='#0709129c';ctx.shadowBlur=r*.30;
 ctx.fillStyle='#5d2e31';ctx.strokeStyle='#e2bb79';ctx.lineWidth=Math.max(1,r*.045);
 ctx.beginPath();ctx.moveTo(-r*.46,-r*.75);ctx.lineTo(r*.46,-r*.75);ctx.lineTo(r*.46,r*.68);ctx.lineTo(0,r*.96);ctx.lineTo(-r*.46,r*.68);ctx.closePath();ctx.fill();ctx.stroke();
 line(ctx,0,-r*.43,0,r*.44,'#dbbb7d',Math.max(1,r*.06));line(ctx,-r*.29,r*.06,r*.30,r*.06,'#dbbb7d',Math.max(1,r*.06));
 point(ctx,0,-r*.44,Math.max(.75,r*.075),'#f4d99b');ctx.restore();
}
function drawCrystal(ctx,p,r,iso){
 ctx.save();ctx.translate(p.x,p.y);if(iso)ctx.scale(1,.7);
 const glow=ctx.createRadialGradient(0,0,1,0,0,r*2.5);glow.addColorStop(0,'#a66ee69a');glow.addColorStop(1,'#a66ee600');ctx.fillStyle=glow;ctx.fillRect(-r*2.5,-r*2.5,r*5,r*5);
 for(const [off,k] of [[-.32,.72],[.19,1],[.48,.61]]){
  ctx.fillStyle=k===1?'#bb87ee':'#7655ab';ctx.strokeStyle='#e3baff';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(off*r,r*.30);ctx.lineTo((off-.25)*r,-r*.20);ctx.lineTo(off*r,-k*r);ctx.lineTo((off+.30)*r,-r*.12);ctx.closePath();ctx.fill();ctx.stroke();
 }
 ctx.restore();
}
function drawBrazier(ctx,p,r,iso){
 ctx.save();ctx.translate(p.x,p.y);if(iso)ctx.scale(1,.75);
 const glow=ctx.createRadialGradient(0,-r*.28,0,0,-r*.20,r*3.9);glow.addColorStop(0,'#ffc8767c');glow.addColorStop(.38,'#c889372e');glow.addColorStop(1,'#c8893700');ctx.fillStyle=glow;ctx.fillRect(-r*4,-r*4,r*8,r*8);
 ctx.shadowBlur=Math.max(5,r*.42);ctx.shadowColor='#000c';
 ctx.fillStyle='#322d2d';ctx.fillRect(-r*.47,r*.24,r*.92,r*.22);ctx.fillStyle='#b6a080';ctx.fillRect(-r*.52,r*.02,r*1.04,r*.22);
 ctx.shadowColor='#ffb73c';ctx.shadowBlur=r;
 const flame=grad(ctx,0,-r*1.4,0,r*.2,'#fff4b8','#dc6225');ctx.fillStyle=flame;
 ctx.beginPath();ctx.moveTo(0,r*.20);ctx.bezierCurveTo(-r*.75,-r*.3,-r*.35,-r*.77,0,-r*1.22);ctx.bezierCurveTo(r*.31,-r*.47,r*.55,-r*.32,0,r*.20);ctx.fill();
 ctx.fillStyle='#fff8d6';ctx.beginPath();ctx.ellipse(0,-r*.11,r*.14,r*.32,0,0,TAU);ctx.fill();ctx.restore();
}
function drawWallRelief(ctx,s,x,y,kind){
 const p=s.at(x,y),r=Math.max(5,s.cell*(s.iso?.37:.39));
 if(kind==='crate')drawCrate(ctx,p,r,s.iso);
 if(kind==='torch')drawBrazier(ctx,p,r*.78,s.iso);
 if(kind==='banner')drawBanner(ctx,p,r,s.iso);
 if(kind==='crystal')drawCrystal(ctx,p,r,s.iso);
}

/** Visual-only tile-attached decorations, never new collision objects. */
export function paintV2Dressing(ctx,projection,wallCoords,{roomId}={}){
 if(roomId==='woodland')return paintWoodlandDressing(ctx,projection,wallCoords);
 if(roomId!==V2_ART_ROOM && paintThemeDressing(ctx,projection,wallCoords,roomId))return;
 if(!isV2ArtRoom(roomId))return;
 const s=projection,walls=new Set(wallCoords.map(([x,y])=>`${x},${y}`));
 const floor=[ [6,4,'seal'],[2,2,'rope'],[9,7,'scuff'],[2,6,'scuff'],[10,2,'mosaic'] ];
 for(const [x,y,kind] of floor){if(!openCell(walls,x,y))continue;const p=s.at(x,y);if(kind==='seal')drawSeal(ctx,p,s.cell*(s.iso?1.0:1.25),s.iso);else drawFloorDetail(ctx,s,x,y,kind)}
 const wallSet=wallCoords.filter(([x,y])=>x>1&&x<12&&y>0&&y<8).sort((a,b)=>(a[1]*13+a[0])-(b[1]*13+b[0]));
 // Choose different distributed wall anchors from actual authoritative walls.
 const anchors=[];
 for(const w of wallSet){if(anchors.every(([px,py])=>Math.abs(px-w[0])+Math.abs(py-w[1])>3))anchors.push(w);if(anchors.length===8)break}
 const motifs=['torch','crate','banner','torch','crystal','crate','torch','banner'];
 anchors.forEach(([x,y],i)=>drawWallRelief(ctx,s,x,y,motifs[i]));
}

/** Light and shadow run before units/markers, so enemies remain readable. */
export function paintV2Light(ctx,s,wallCoords,{roomId}={}){
 if(roomId==='woodland')return paintWoodlandLight(ctx,s,wallCoords);
 if(roomId!==V2_ART_ROOM && paintThemeLight(ctx,s,wallCoords,roomId))return;
 if(!isV2ArtRoom(roomId))return;
 const cols=13,rows=9;
 let x,y,w,h;
 if(s.iso){x=0;y=0;w=ctx.canvas.width;h=ctx.canvas.height;}
 else{x=s.originX;y=s.originY;w=cols*s.cell;h=rows*s.cell;}
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
 const centers=[[2,2,'#e5a24c'],[10,2,'#8e70bd'],[8,6,'#e2a558']];
 for(const [cx,cy,color] of centers){const p=s.at(cx,cy),r=s.cell*(s.iso?5.5:3.2);
  const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);
  g.addColorStop(0,color+'33');g.addColorStop(.40,color+'14');g.addColorStop(1,color+'00');ctx.fillStyle=g;ctx.fillRect(p.x-r,p.y-r,2*r,2*r);
 }
 const v=ctx.createRadialGradient(x+w*.5,y+h*.46,w*.13,x+w*.5,y+h*.46,w*.68);v.addColorStop(0,'#080c1400');v.addColorStop(1,'#0408126a');ctx.fillStyle=v;ctx.fillRect(x,y,w,h);
 ctx.restore();
 if(!s.iso){
  // Decorative outer cornice; identical logical board edges and exits.
  ctx.save();ctx.strokeStyle='#e0b472a6';ctx.lineWidth=Math.max(1,s.cell*.055);
  ctx.strokeRect(x-2,y-2,w+4,h+4);ctx.strokeStyle='#3b2f27';ctx.lineWidth=2;ctx.strokeRect(x-5,y-5,w+10,h+10);
  ctx.restore();
 }
}

// ---------------- WOODLAND PATH • REAL QUEST 1, ROOM 1 ----------------
// Visual effects only. No gameplay entities, exits, collision cells or commands.
// Everything is drawn from the deterministic (x,y) floor and real wall map.
const WOODLAND_COLS=9,WOODLAND_ROWS=7;
function leaf(ctx,x,y,r,angle,col){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle=col;
 ctx.beginPath();ctx.moveTo(-r*.85,0);ctx.quadraticCurveTo(0,-r*.58,r,0);
 ctx.quadraticCurveTo(0,r*.58,-r*.85,0);ctx.fill();
 ctx.strokeStyle='#e5dfa635';ctx.lineWidth=Math.max(.35,r*.055);
 ctx.beginPath();ctx.moveTo(-r*.68,0);ctx.lineTo(r*.74,0);ctx.stroke();ctx.restore();
}
function fern(ctx,x,y,r,a,color){
 ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.lineCap='round';
 line(ctx,0,r*.40,0,-r*.75,color,Math.max(.8,r*.10));
 for(let i=0;i<5;i++){
  const yy=r*(.24-i*.22),w=r*(.55-i*.085);
  line(ctx,0,yy,-w,yy-r*.16,color,Math.max(.7,r*.10));
  line(ctx,0,yy,w,yy-r*.18,color,Math.max(.7,r*.10));
 }ctx.restore();
}
function paintWoodlandFloorTile(ctx,{x,y,size:c,tileX:tx,tileY:ty}){
 const k=hash(tx,ty,201);ctx.save();ctx.beginPath();ctx.rect(x,y,c,c);ctx.clip();
 ctx.fillStyle=grad(ctx,x,y,x+c*.9,y+c, k>.5?'#314137':'#34493c',k>.5?'#171e22':'#1c2b25');ctx.fillRect(x,y,c,c);
 // The old flat checkerboard becomes an irregular central earthen trail.
 // This is appearance only: all real walkable squares remain exactly the same.
 const pathY=3.18+Math.sin((tx+.5)*.82)*.34;
 const dist=Math.abs(ty+.5-pathY);
 if(dist<1.95){
  const alpha=Math.max(0,.92-dist*.48);
  ctx.globalAlpha=alpha;
  const g=grad(ctx,x,y,x+c,y+c,'#846f53','#514c3b');ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(x,y+c*(.08+.15*hash(tx,ty,202)));
  ctx.bezierCurveTo(x+c*.45,y-c*.08,x+c*.60,y+c*.18,x+c,y+c*(.05+.10*hash(tx,ty,209)));
  ctx.lineTo(x+c,y+c*.91);ctx.bezierCurveTo(x+c*.5,y+c*.75,x+c*.30,y+c*1.05,x,y+c*.89);ctx.closePath();ctx.fill();
  ctx.globalAlpha=1;
 }
 // Fine soil grain, dappled moss and pebbles: fixed per tile, no redraw flicker.
 for(let i=0;i<32;i++){
  const xx=x+c*(.03+.94*hash(tx,ty,301+i*3));
  const yy=y+c*(.03+.94*hash(tx,ty,302+i*3));
  const z=.5+c*(.007+.015*hash(tx,ty,303+i*3));
  ctx.fillStyle=i%4===0?'#ccb68e33':i%3===0?'#07151a4d':'#72946334';
  ctx.beginPath();ctx.ellipse(xx,yy,z*1.15,z*.6,hash(tx,ty,331+i)*6.2,0,TAU);ctx.fill();
 }
 for(let i=0;i<8;i++){
  const px=x+c*hash(tx,ty,410+i*3),py=y+c*hash(tx,ty,411+i*3);
  leaf(ctx,px,py,c*(.035+.03*hash(tx,ty,412+i*3)),hash(tx,ty,413+i)*6.2,
    ['#aa894a9e','#cf9d48ad','#697f36bb','#74533ca1','#d8ad64a0'][i%5]);
 }
 if(dist>1.05){
  const v=hash(tx,ty,510);
  for(let i=0;i<3;i++)fern(ctx,x+c*(.18+i*.32),y+c*(.17+hash(tx,ty,516+i)*.65),c*(.065+v*.05),i*1.35,'#658d54b0');
 }
 if(k>.56){
  ctx.strokeStyle='#0e201c8c';ctx.lineWidth=Math.max(1,c*.018);ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(x+c*.08,y+c*(.18+k*.28));ctx.quadraticCurveTo(x+c*.43,y+c*.55,x+c*.73,y+c*.65);ctx.stroke();
 }
 ctx.strokeStyle='#c7ba8c32';ctx.lineWidth=Math.max(.6,c*.011);ctx.strokeRect(x+.4,y+.4,c-.8,c-.8);
 ctx.restore();
}
function paintWoodlandIsoTile(ctx,{position:p,halfW:hw,halfH:hh,tileX, tileY}){
 ctx.save();diamond(ctx,p,hw,hh);ctx.clip();
 ctx.fillStyle=grad(ctx,p.x-hw,p.y-hh,p.x+hw,p.y+hh,'#49624a','#17271d');
 ctx.fillRect(p.x-hw,p.y-hh,hw*2,hh*2);
 if(Math.abs(tileY+.5-(3.18+Math.sin((tileX+.5)*.82)*.34))<1.7){
  ctx.fillStyle='#8875559e';ctx.fillRect(p.x-hw,p.y-hh,hw*2,hh*2);
 }
 for(let i=0;i<9;i++){
  const xx=p.x+(hash(tileX,tileY,600+i)*2-1)*hw,yy=p.y+(hash(tileX,tileY,700+i)*2-1)*hh;
  leaf(ctx,xx,yy,hw*.07,hash(tileX,tileY,800+i)*TAU,['#ba984d8f','#5984438f','#b8a16d9f'][i%3]);
 }ctx.restore();diamond(ctx,p,hw,hh);ctx.strokeStyle='#a9bb8550';ctx.lineWidth=1;ctx.stroke();
}
function paintWoodlandBackdrop(ctx,w,h){
 ctx.save();ctx.fillStyle=grad(ctx,0,0,0,h,'#20382f','#061419');ctx.fillRect(0,0,w,h);
 for(let i=0;i<26;i++){
  const xx=hash(i,121)*w,yy=h*(.01+hash(i,132)*.97);
  const r=Math.max(14,w*(.025+.043*hash(i,143)));
  const g=ctx.createRadialGradient(xx,yy,0,xx,yy,r);
  g.addColorStop(0,i%3?'#46644155':'#76825c4d');g.addColorStop(1,'#0b1c1b00');ctx.fillStyle=g;
  ctx.fillRect(xx-r,yy-r,r*2,r*2);
 }ctx.restore();
}
function woodlandRock(ctx,p,r,seed=0,iso=false){
 ctx.save();ctx.translate(p.x,p.y);if(iso)ctx.scale(1,.73);
 // Sculpted rounded boulder facets, not a new logical obstacle.
 ctx.shadowColor='#031110d9';ctx.shadowBlur=r*.22;ctx.shadowOffsetY=r*.12;
 const g=grad(ctx,-r,-r,r,r,'#8b9282','#313d3c');ctx.fillStyle=g;
 ctx.beginPath();ctx.moveTo(-r*.67,-r*.31);ctx.lineTo(-r*.39,-r*.73);ctx.lineTo(r*.31,-r*.68);
 ctx.lineTo(r*.77,-r*.28);ctx.lineTo(r*.59,r*.51);ctx.lineTo(-r*.36,r*.62);ctx.lineTo(-r*.78,r*.19);ctx.closePath();ctx.fill();
 ctx.shadowBlur=0;ctx.strokeStyle='#c3b99b75';ctx.lineWidth=Math.max(.8,r*.045);
 ctx.beginPath();ctx.moveTo(-r*.60,-r*.26);ctx.lineTo(-r*.28,-r*.61);ctx.lineTo(r*.25,-r*.57);ctx.stroke();
 ctx.fillStyle='#598348aa';ctx.beginPath();ctx.ellipse(-r*.24,-r*.53,r*.27,r*.075,-.22,0,TAU);ctx.fill();
 for(let i=0;i<4;i++){const v=hash(seed,i);leaf(ctx,r*(v-.4),r*(hash(seed,i,9)-.5),r*.16,v*TAU,i%2?'#6b944da9':'#c49b5c8d');}
 ctx.restore();
}
function woodlandTree(ctx,p,r,seed=0,iso=false){
 ctx.save();ctx.translate(p.x,p.y);if(iso)ctx.scale(1,.70);
 ctx.shadowColor='#04130ec4';ctx.shadowBlur=r*.30;ctx.shadowOffsetY=r*.10;
 // Brown trunk embedded in the actual wall cell, leafy canopy over the trunk.
 ctx.fillStyle='#392f24';ctx.beginPath();ctx.ellipse(0,r*.14,r*.34,r*.43,-.20,0,TAU);ctx.fill();
 ctx.shadowBlur=0;
 for(let i=0;i<6;i++){
  const a=(i/6)*TAU+hash(seed,22)*.5;
  line(ctx,0,r*.23,Math.cos(a)*r*.71,Math.sin(a)*r*.59+r*.20,'#51402b',Math.max(1,r*.13));
 }
 const blobs=[[-.36,-.35,.46],[.23,-.52,.48],[.53,-.14,.34],[-.43,.13,.38],[.07,.13,.51]];
 blobs.forEach(([dx,dy,k],i)=>{
  const g=ctx.createRadialGradient((dx-.2)*r,(dy-.22)*r,r*.04,dx*r,dy*r,k*r);
  g.addColorStop(0,i%2?'#8b9e64':'#8fa966');g.addColorStop(.60,'#406345');g.addColorStop(1,'#223f35');
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(dx*r,dy*r,k*r,k*r*.84,0,0,TAU);ctx.fill();
 });
 for(let i=0;i<9;i++){
  const a=hash(seed,i,910)*TAU,rr=r*(.14+.47*hash(seed,i,911));
  leaf(ctx,Math.cos(a)*rr,Math.sin(a)*rr-r*.22,r*(.09+hash(seed,i,912)*.04),a,'#adc27466');
 }ctx.restore();
}
function woodlandFallenLeaves(ctx,p,r,seed=0,iso=false){
 ctx.save();ctx.translate(p.x,p.y);if(iso)ctx.scale(1,.65);
 for(let i=0;i<5;i++){const a=hash(seed,i,88)*TAU;const t=hash(seed,i,89)*r*.68;
  leaf(ctx,Math.cos(a)*t,Math.sin(a)*t,r*(.065+.06*hash(seed,i,93)),a*1.7,i%2?'#d0a35a9e':'#9b6b399c');}
 ctx.restore();
}
function paintWoodlandDressing(ctx,s,wallCoords){
 const walls=new Set(wallCoords.map(([x,y])=>`${x},${y}`));
 const boundary=[];
 // Architectural identity comes from REAL blocked squares: mossy boulders and
 // young trees occupy only tiles that the server already regards as walls.
 for(const [x,y] of wallCoords){
  const p=s.at(x,y),r=s.cell*(s.iso?.69:.47);
  if(hash(x,y,123)>.49)woodlandTree(ctx,p,r,x*17+y*37,s.iso);
  else woodlandRock(ctx,p,r,x*17+y*37,s.iso);
 }
 for(let y=0;y<WOODLAND_ROWS;y++)for(let x=0;x<WOODLAND_COLS;x++){
  if(walls.has(`${x},${y}`))continue;
  const p=s.at(x,y),r=s.cell*(s.iso?.24:.27);
  if(hash(x,y,56)>.56)woodlandFallenLeaves(ctx,p,r,x*19+y*41,s.iso);
  // Fern fronds near tile corners: leave the centre free for tokens / targets.
  if(hash(x,y,67)>.50){
   const off=s.cell*(s.iso?.35:.32);const sign=hash(x,y,61)>.5?1:-1;
   fern(ctx,p.x+off*sign,p.y+off*.64,r*.61,hash(x,y,75)*TAU,'#7eaa63b9');
  }
 }
 // Top and bottom forest-edge silhouettes frame the actual 9×7 playfield.
 if(!s.iso){
  const x0=s.originX,y0=s.originY,w=WOODLAND_COLS*s.cell,h=WOODLAND_ROWS*s.cell;
  ctx.save();ctx.beginPath();ctx.rect(x0,y0,w,h);ctx.clip();
  for(let i=0;i<16;i++){
   const px=x0+(i+.25)*w/16,top=i%2===0;
   const py=top?y0-s.cell*.16:y0+h+s.cell*.16;
   const rad=s.cell*(.25+.11*hash(i,3));
   const g=ctx.createRadialGradient(px,py,rad*.12,px,py,rad*1.2);
   g.addColorStop(0,'#52744a8b');g.addColorStop(1,'#172c2200');ctx.fillStyle=g;
   ctx.beginPath();ctx.arc(px,py,rad*1.25,0,TAU);ctx.fill();
  }
  ctx.restore();
 }
}
function paintWoodlandLight(ctx,s,wallCoords){
 // Transparent amber sunlight and gentle fog; no visual hazard indicators.
 const x=s.iso?0:s.originX,y=s.iso?0:s.originY;
 const w=s.iso?ctx.canvas.width:WOODLAND_COLS*s.cell;
 const h=s.iso?ctx.canvas.height:WOODLAND_ROWS*s.cell;
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
 const sun=[{x:6.7,y:1.15,r:4.1},{x:1.8,y:2.6,r:2.8},{x:5.4,y:5.8,r:2.8}];
 sun.forEach((loc,i)=>{
  const p=s.at(loc.x,loc.y),rad=s.cell*loc.r;
  const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,rad);
  g.addColorStop(0,i===0?'#ffce738a':'#fff0a249');
  g.addColorStop(.26,i===0?'#eac57a43':'#d9cf9530');
  g.addColorStop(1,'#eddb7a00');ctx.fillStyle=g;ctx.fillRect(p.x-rad,p.y-rad,rad*2,rad*2);
 });
 const v=ctx.createRadialGradient(x+w*.49,y+h*.41,w*.06,x+w*.5,y+h*.5,w*.72);
 v.addColorStop(0,'#0b170c00');v.addColorStop(.7,'#15271a13');v.addColorStop(1,'#071b19b8');
 ctx.fillStyle=v;ctx.fillRect(x,y,w,h);ctx.restore();
 if(!s.iso){
  ctx.save();ctx.strokeStyle='#b2ba816e';ctx.lineWidth=Math.max(1,s.cell*.042);
  ctx.strokeRect(x-2,y-2,w+4,h+4);ctx.strokeStyle='#2d4b3699';ctx.lineWidth=2;
  ctx.strokeRect(x-5,y-5,w+10,h+10);ctx.restore();
 }
}
