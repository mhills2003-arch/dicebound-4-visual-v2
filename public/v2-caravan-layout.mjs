/** One authored footprint source, shared by server collision and production art. */
const rectangle=(x,y,w,h)=>Array.from({length:w*h},(_,i)=>[x+i%w,y+Math.floor(i/w)]);
export const CARAVAN_SCENERY=Object.freeze([
 {asset:'crag',x:0,y:0,w:2,h:2,cells:[[0,0],[1,0],[0,1]]},
 {asset:'northGate',x:3,y:1,w:3,h:2,cells:rectangle(3,1,3,2)},
 {asset:'stall',x:9,y:1,w:2,h:3,cells:rectangle(9,1,2,3)},
 {asset:'well',x:6,y:4,w:2,h:2,cells:rectangle(6,4,2,2)},
 {asset:'southGate',x:3,y:6,w:3,h:2,cells:rectangle(3,6,3,2)},
 {asset:'camel',x:9,y:6,w:2,h:2,cells:rectangle(9,6,2,2)},
 {asset:'crag',x:11,y:7,w:2,h:2,rotate:Math.PI,cells:[[12,7],[11,8],[12,8]]}
]);
export const CARAVAN_WALLS=Object.freeze(CARAVAN_SCENERY.flatMap(piece=>piece.cells));
const occupied=new Set(CARAVAN_WALLS.map(p=>p.join(',')));
export const CARAVAN_ROWS=Object.freeze(Array.from({length:9},(_,y)=>Array.from({length:13},(_,x)=>occupied.has(`${x},${y}`)?'#':'.').join('')));
// Swift dice cover both flanks; the remaining guard line leaves manoeuvring room.
export const CARAVAN_SPAWNS=Object.freeze([[9,4],[11,2],[11,6],[6,1],[6,7],[11,4],[7,3]]);
