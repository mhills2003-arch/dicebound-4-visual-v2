import {paintArtBackdrop,paintStoneFloorTile,paintV2Dressing,paintV2Light} from './v2-room-art.mjs';
const canvas=document.getElementById('previewCanvas');const ctx=canvas.getContext('2d');
// Gallery sample of the real, fixed q5r7 topology. This never enters game state.
const WALLS=[[3,1],[4,1],[7,1],[3,2],[4,2],[7,2],[7,3],[7,4],[10,4],[3,5],[4,5],[7,5],[10,5],[3,6],[4,6],[10,6],[10,7]];
const set=new Set(WALLS.map(([x,y])=>`${x},${y}`));
const s={iso:false,cell:68,originX:78,originY:54,at(x,y){return {x:this.originX+(x+.5)*this.cell,y:this.originY+(y+.5)*this.cell}}};
let mode='enhanced';const texture=new Image();texture.src='./assets/wallcap.jpeg';texture.onload=render;
function drawPreviewWall(x,y){
 const c=s.cell,X=s.originX+x*c,Y=s.originY+y*c;
 ctx.save();ctx.shadowColor='#03050ad9';ctx.shadowOffsetY=5;ctx.shadowBlur=8;
 const p=ctx.createLinearGradient(X,Y,X+c,Y+c);p.addColorStop(0,'#877860');p.addColorStop(1,'#4b3c31');ctx.fillStyle=p;ctx.fillRect(X+2,Y+2,c-4,c-4);ctx.restore();
 if(texture.complete&&texture.naturalWidth){ctx.globalAlpha=.3;ctx.drawImage(texture,X+4,Y+4,c-8,c-14);ctx.globalAlpha=1}
 ctx.strokeStyle='#c4ac7c';ctx.lineWidth=2;ctx.strokeRect(X+4,Y+4,c-8,c-13);
 for(const offset of [.3,.62]){ctx.strokeStyle='#3a312e';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X+6,Y+c*offset);ctx.lineTo(X+c-6,Y+c*offset);ctx.stroke()}
}
function drawDemoMarker(x,y,label,enemy=false){
 const {x:px,y:py}=s.at(x,y),w=s.cell*.5;
 ctx.save();ctx.shadowBlur=12;ctx.shadowColor=enemy?'#e56a6e70':'#80e9ca70';
 ctx.fillStyle=enemy?'#492b3b':'#183e46';ctx.strokeStyle=enemy?'#ee9a8e':'#8cecd0';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(px-w/2,py-w/2,w,w,7);ctx.fill();ctx.stroke();
 ctx.shadowBlur=0;ctx.fillStyle='#f7e7c8';ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.fillText(label,px,py+4);ctx.restore();
}
function render(){
 ctx.clearRect(0,0,canvas.width,canvas.height);
 if(mode==='enhanced')paintArtBackdrop(ctx,canvas.width,canvas.height);
 else{ctx.fillStyle='#0a1626';ctx.fillRect(0,0,canvas.width,canvas.height)}
 for(let y=0;y<9;y++)for(let x=0;x<13;x++){
  const X=s.originX+x*s.cell,Y=s.originY+y*s.cell,c=s.cell;
  if(mode==='enhanced')paintStoneFloorTile(ctx,{x:X,y:Y,size:c,tileX:x,tileY:y,texture});
  else{ctx.fillStyle=(x+y)%2?'#253847':'#314858';ctx.fillRect(X,Y,c,c);ctx.strokeStyle='#b9a16a50';ctx.strokeRect(X+.5,Y+.5,c-1,c-1)}
 }
 for(const [x,y] of WALLS)drawPreviewWall(x,y);
 if(mode==='enhanced'){paintV2Dressing(ctx,s,WALLS,{roomId:'q5r7'});paintV2Light(ctx,s,WALLS,{roomId:'q5r7'});}
 for(const [x,y,label,enemy] of [[1,4,'K',false],[2,4,'O',false],[9,1,'S',true],[8,3,'R',true],[11,5,'A',true],[9,7,'N',true]])if(!set.has(`${x},${y}`))drawDemoMarker(x,y,label,enemy);
}
for(const button of ['enhanced','original'])document.getElementById(button).addEventListener('click',()=>{
 mode=button;for(const b of ['enhanced','original'])document.getElementById(b).setAttribute('aria-pressed',String(mode===b));
 document.getElementById('previewStatus').textContent=mode==='enhanced'?'Enhanced view':'Original-style board';render();
});
render();
