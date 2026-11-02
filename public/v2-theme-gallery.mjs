import {paintArtBackdrop,paintStoneFloorTile,paintV2Dressing,paintV2Light} from './v2-room-art.mjs';
const rooms=await (await fetch('./v2-gallery-catalog.json')).json();
const $=id=>document.getElementById(id);
const quest=$('quest'),room=$('room'),title=$('roomTitle');
const groups=new Map();for(const r of rooms){if(!groups.has(r.quest))groups.set(r.quest,[]);groups.get(r.quest).push(r)}
for(const [q,items] of groups){const opt=document.createElement('option');opt.value=q;opt.textContent=`${String(q).padStart(2,'0')} · ${items[0].questName}`;quest.append(opt)}
function fillRooms(){room.replaceChildren();for(const r of groups.get(+quest.value)||[]){const o=document.createElement('option');o.value=r.id;o.textContent=r.name;room.append(o)}render()}
quest.addEventListener('change',fillRooms);room.addEventListener('change',render);
const imgs={};const wall=new Image();wall.src='./assets/wallcap.jpeg';wall.addEventListener('load',render);
function hash(x,y,s){let n=Math.imul(x+21,374761393)^Math.imul(y+47,668265263)^Math.imul(s+17,2246822519);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295}
function layout(cols,rows,q,seed){
 // Gallery illustration only. Never exposes server-authoritative maze layouts.
 const a=[];
 for(let y=1;y<rows-1;y++)for(let x=2;x<cols-2;x++){
  if((x<3||x>cols-4)&&y===Math.floor(rows/2))continue;
  const h=hash(x,y,seed+q*19);
  const pillar=(x%4===2&&y%3===1)||(q%3===1&&x%5===3&&y%3===2);
  if((pillar&&h>.17)||(h>.91&&Math.abs(y-Math.floor(rows/2))>1))a.push([x,y]);
 }
 return a;
}
function decorate(c,id,enhanced){
 const m=/^q(\d+)r(\d+)$/.exec(id);const q=id==='woodland'||id==='clearing'||id==='watchpost'?1:Number(m?.[1])||1;
 const roomIndex=m?Number(m[2]):id==='woodland'?1:id==='clearing'?2:3;
 const size=q>=10?{width:15,height:11}:q>=5?{width:13,height:9}:{width:9,height:7};
 const cols=size.width,rows=size.height,w=c.canvas.width,h=c.canvas.height,cs=Math.min((w-48)/cols,(h-55)/rows),x0=(w-cs*cols)/2,y0=(h-cs*rows)/2;
 const s={iso:false,cell:cs,originX:x0,originY:y0,at(x,y){return{x:x0+(x+.5)*cs,y:y0+(y+.5)*cs}}};
 const walls=layout(cols,rows,q,roomIndex*31+q*13);
 if(enhanced)paintArtBackdrop(c,w,h,{theme:id});else{c.fillStyle='#101b2a';c.fillRect(0,0,w,h)}
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
  const X=x0+x*cs,Y=y0+y*cs;
  if(enhanced)paintStoneFloorTile(c,{x:X,y:Y,size:cs,tileX:x,tileY:y,theme:id});
  else{c.fillStyle=(x+y)%2?'#293d4e':'#354b59';c.fillRect(X,Y,cs,cs)}
  c.strokeStyle='#d2b77a35';c.lineWidth=1;c.strokeRect(X+.5,Y+.5,cs-1,cs-1)
 }
 for(const [x,y] of walls){const p=s.at(x,y),X=p.x-cs*.46,Y=p.y-cs*.46;c.save();c.fillStyle='#53616b';c.strokeStyle='#c5b080';c.lineWidth=1.6;c.fillRect(X,Y,cs*.92,cs*.92);c.strokeRect(X,Y,cs*.92,cs*.92);c.restore()}
 if(enhanced){paintV2Dressing(c,s,walls,{roomId:id});paintV2Light(c,s,walls,{roomId:id})}
 const start=s.at(1,Math.floor(rows/2)),exit=s.at(cols-2,Math.floor(rows/2));
 for(const [p,col,label] of [[start,'#72e3d4','P'],[exit,'#f0ce7a','E']]){
  c.save();c.fillStyle='#071621';c.strokeStyle=col;c.lineWidth=3;c.beginPath();c.roundRect(p.x-cs*.23,p.y-cs*.22,cs*.46,cs*.43,5);c.fill();c.stroke();c.fillStyle='#f9ead0';c.textAlign='center';c.font=`bold ${Math.max(11,cs*.22)}px system-ui`;c.fillText(label,p.x,p.y+cs*.09);c.restore();
 }
}
function render(){const chosen=rooms.find(r=>r.id===room.value)||groups.get(1)?.[0];if(!chosen)return;
 title.textContent=`${chosen.name} · ${chosen.environment}`;
 for(const [id,enhanced] of [['old',false],['new',true]]){const c=$(id).getContext('2d');c.clearRect(0,0,c.canvas.width,c.canvas.height);decorate(c,chosen.id,enhanced)}
}
fillRooms();
