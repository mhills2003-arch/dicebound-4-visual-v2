import {ensureCaravanTrialPlayer} from './caravan-trial.mjs';
import { DurableObject } from 'cloudflare:workers';
import {createMaze,joinMaze,leaveMaze,mazeTravel,mazeSearch,mazeClaim,mazeBonus,mazeAction,mazeRetreat,mazeReward,mazeVoteAbandon,mazeTick,nextMazeDeadline,mazePublic,resumeMazeClock} from './maze-play.mjs';
import {ensureChat,chatForViewer,postChat,togglePersonalMute,reportChat,toggleAdminMute} from './chat.mjs';
import {freshState,ensurePlayer,markDisconnected,move,submitAction,claimLoot,resetTestAdventure,equipItem,unequipItem,bindEnchantment,usePotion,claimTrainingRack,enterQuest,replayQuest,rollMovement,voteFinishQuest,returnToCamp,buyFromShop,sellToShop,resumeQuest,submitSequentialAction,endTurn,assertGlobalTurn,tick,publicState,ROOM_DATA,claimQuestReward,selectClass} from './engine.mjs';

const ROOT='/dicebound-v2';
const COOKIE='db4_v2_session';
const trialWorlds = new Map([
  ['balance-v9', 'quest-v9-balance-trial'],
  ['caravan-q5-r1', 'quest-v2-caravan-q5-r1'],
  ['rushing-dunes-q5-r2', 'quest-v2-rushing-dunes-q5-r2'],
  ['quest5-room3', 'quest-v2-complete-q5-r3'],
  ['quest5-room4', 'quest-v2-complete-q5-r4'],
  ['quest5-room5', 'quest-v2-complete-q5-r5'],
  ['quest5-room6', 'quest-v2-complete-q5-r6'],
  ['quest5-room7', 'quest-v2-complete-q5-r7'],
  ['quest5-room8', 'quest-v2-complete-q5-r8']
]);
const encoder=new TextEncoder();
const reply=(value,status=200,headers={})=>new Response(typeof value==='string'?value:JSON.stringify(value),{status,headers:{'cache-control':'no-store',...headers,'content-type':typeof value==='string'?'text/html; charset=utf-8':'application/json; charset=utf-8'}});
function b64url(bytes){let out='';for(const b of bytes)out+=String.fromCharCode(b);return btoa(out).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function readCookie(req){return (req.headers.get('cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(`${COOKIE}=`))?.slice(COOKIE.length+1)||null}
async function signature(data, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return b64url(new Uint8Array(mac));
}
async function validSession(req,env){
  if(!env.COOKIE_SECRET||env.COOKIE_SECRET.length<32)return null;
  const cookie=readCookie(req);
  if(!cookie)return null;
  const [data,mac]=cookie.split('.');if(!data||!mac||cookie.split('.').length!==2)return null;
  if((await signature(data,env.COOKIE_SECRET))!==mac)return null;
  try{
    const parsed=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(data.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))));
    if(!['one','two','three','four'].includes(parsed.id)||parsed.exp<=Date.now())return null;
    const index={one:1,two:2,three:3,four:4}[parsed.id];
    if(index>=3&&(!env['INVITE_TOKEN_'+index]||env['INVITE_TOKEN_'+index].length<24))return null;
    return {id:parsed.id,name:env['PLAYER_'+index+'_NAME']||`Player ${['One','Two','Three','Four'][index-1]}`};
  }catch{return null}
}
function loginScreen(error=''){
  const message=error?'<p class="error" role="alert">That invitation code was not accepted.</p>':'';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DICEBOUND 4.0 V2 — Visual Lab</title><style>body{min-height:100dvh;display:grid;place-items:center;background:radial-gradient(#1c3550,#050b16);font:16px system-ui;color:#e9dcc0;margin:0}.card{max-width:370px;width:calc(100% - 48px);padding:30px;background:#101b2be8;border:1px solid #9f804a;border-radius:20px;box-shadow:0 25px 90px #0008}h1{font:32px Georgia;color:#e9c77b}.error{color:#ffaaaa}label{display:block;margin:18px 0 8px}input{width:100%;box-sizing:border-box;padding:12px;border-radius:9px;border:1px solid #9f804a;background:#081323;color:white;font-size:17px}button{width:100%;margin-top:18px;padding:13px;background:#d9b978;color:#151a23;border:0;border-radius:10px;font-weight:700}small{color:#c2c8cc}</style></head><body><main class="card"><h1>🎲 DICEBOUND 4.0 V2</h1><p>Isolated visual development copy · adult testers only</p>${message}<form action="${ROOT}/api/login" method="POST"><label for="code">Parent-issued invitation code</label><input id="code" name="code" type="password" autocomplete="off" required minlength="20" maxlength="256"><button type="submit">Enter prototype</button></form><p><small>For development testing only. Do not invite children until parental authentication, moderation and privacy safeguards are complete.</small></p></main></body></html>`;
}
function goodOrigin(req){const origin=req.headers.get('origin');if(!origin)return false;try{return new URL(origin).origin===new URL(req.url).origin}catch{return false}}
function configured(env){return env.INVITE_TOKEN_1?.length>=24&&env.INVITE_TOKEN_2?.length>=24&&env.COOKIE_SECRET?.length>=32&&env.INVITE_TOKEN_1!==env.INVITE_TOKEN_2&&![env.INVITE_TOKEN_1,env.INVITE_TOKEN_2,env.COOKIE_SECRET].some(x=>x.includes('REPLACE_WITH'))}
async function doLogin(req,env){
  if(!configured(env))return reply('Server invitation secrets are not configured.',503);
  if(!goodOrigin(req))return reply('Origin mismatch.',403);
  const type=req.headers.get('content-type')||'';
  if(!type.includes('application/x-www-form-urlencoded')&&!type.includes('multipart/form-data'))return reply('Unsupported form.',415);
  const form=await req.formData();const code=String(form.get('code')||'');
  const id=code===env.INVITE_TOKEN_1?'one':code===env.INVITE_TOKEN_2?'two':(env.INVITE_TOKEN_3?.length>=24&&code===env.INVITE_TOKEN_3)?'three':(env.INVITE_TOKEN_4?.length>=24&&code===env.INVITE_TOKEN_4)?'four':null;
  if(!id)return reply(loginScreen(true),401);
  const data=b64url(encoder.encode(JSON.stringify({id,exp:Date.now()+1000*60*60*12})));
  const cookie=`${COOKIE}=${data}.${await signature(data,env.COOKIE_SECRET)}; HttpOnly; SameSite=Strict; Path=${ROOT}; Max-Age=43200${new URL(req.url).protocol==='https:'?'; Secure':''}`;
  return new Response(null,{status:303,headers:{'location':`${ROOT}/`,'set-cookie':cookie,'cache-control':'no-store'}});
}
export default {
  async fetch(req,env){
    const u=new URL(req.url);if(u.pathname===ROOT)return Response.redirect(u.origin+ROOT+'/',308);
    if(!u.pathname.startsWith(ROOT+'/'))return new Response('Not found',{status:404});
    // Public, non-sensitive probe: distinguishes a missing Worker route from an asset 404.
    if(req.method==='GET'&&u.pathname===ROOT+'/health')return new Response('DICEBOUND V2 router OK',{status:200,headers:{'content-type':'text/plain; charset=utf-8','cache-control':'no-store'}});
    // Unauthenticated, non-sensitive deployment fingerprint. Verifies that the
    // Worker and its bound static files belong to the same cinematic V2 build.
    if(req.method==='GET'&&u.pathname===ROOT+'/version'){
      const assets = [
        ['html','/index.html'], ['js','/app.js'], ['css','/styles.css'],
        ['woodlandArt','/assets/premium-woodland/training-clearing-ground.jpg'],
        ['caravanArt','/assets/premium-desert/caravan-ground-q5-r1.webp'],
        ['dunesArt','/assets/premium-desert/rushing-dunes-ground-r1.webp'],
        ...['ridge-ground','caravan-ground','crossing-ground','shieldwall-ground','smuggler-ground','toll-ground','toll-boss-d16']
          .map(name => [name, '/assets/premium-desert/q5-' + name + '-r1.webp'])
      ];
      const checks = await Promise.all(assets.map(async ([name, path]) => {
        try {
          const r = await env.ASSETS.fetch(new Request(u.origin + path));
          return {name, status: r.status, body: r.ok && !path.startsWith('/assets/') ? await r.text() : ''};
        } catch { return {name, status: 0, body: ''}; }
      }));
      const ready = checks.every(check => check.status === 200)
        && checks[0].body.includes('id="cinematicQ5Room"')
        && checks[0].body.includes('v2-q5-complete-20261112-r1')
        && checks[1].body.includes('initPremiumDesert') && checks[2].body.includes('.cin-room');
      return new Response(JSON.stringify({worker:'dicebound-4-visual-v2', build:'v2-q5-complete-20261112-r1',
        cinematicAssetsReady: ready, checks: Object.fromEntries(checks.map(check => [check.name, check.status]))}),
        {status:200,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
    }
    if(req.method==='POST'&&u.pathname===ROOT+'/api/login')return doLogin(req,env);
    const identity=await validSession(req,env);
    if(!identity)return reply(loginScreen(),401,{'x-frame-options':'DENY'});
    if(req.method==='GET'&&u.pathname===ROOT+'/api/me')return reply(identity);
    if(req.method==='POST'&&u.pathname===ROOT+'/api/logout'){
      if(!goodOrigin(req))return reply('Origin mismatch.',403);
      return new Response(null,{status:303,headers:{location:ROOT+'/', 'set-cookie':`${COOKIE}=; Path=${ROOT}; Max-Age=0; HttpOnly; SameSite=Strict`}});
    }
    if(req.method==='GET'&&u.pathname===ROOT+'/api/ws'){
      if(req.headers.get('upgrade')?.toLowerCase()!=='websocket')return reply('Upgrade required',426);
      const requestedTrial = u.searchParams.get('trial');
      const trialWorld = trialWorlds.get(requestedTrial);
      const world = trialWorld || 'quest-01-two-player-prototype';
      const object = env.V2_GAME_ROOM.get(env.V2_GAME_ROOM.idFromName(world));
      const headers=new Headers(req.headers);
      headers.delete('x-dicebound-trial');
      headers.set('x-dicebound-player',identity.id);
      headers.set('x-dicebound-name',identity.name);
      if(trialWorld)headers.set('x-dicebound-trial',requestedTrial);
      return object.fetch(new Request('https://game-internal/connect',{headers}));
    }
    if(req.method!=='GET'&&req.method!=='HEAD')return reply('Method not allowed',405);
    if(u.pathname.includes('/api/'))return reply('Not found',404);
    // PRIVATE ASSET GATE. Worker authenticates before serving each file.
    // Cloudflare's default root assets path works on accounts without base_path.
    const assetUrl=new URL(req.url);
    assetUrl.pathname=(u.pathname===ROOT+'/')?'/index.html':u.pathname.slice(ROOT.length);
    const result=await env.ASSETS.fetch(new Request(assetUrl.toString(),req));
    const headers=new Headers(result.headers);headers.set('cache-control','private, no-store');headers.set('x-content-type-options','nosniff');headers.set('x-frame-options','DENY');headers.set('referrer-policy','no-referrer');
    return new Response(result.body,{status:result.status,statusText:result.statusText,headers});
  }
};

export class GameRoom extends DurableObject {
  constructor(ctx,env){super(ctx,env);this.ready=ctx.blockConcurrencyWhile(async()=>{
    this.game=await ctx.storage.get('live')||freshState();
    this.chat=ensureChat(await ctx.storage.get('chat-v1'));
    const online=new Set(ctx.getWebSockets().map(ws=>ws.deserializeAttachment()?.id).filter(Boolean));
    for(const p of Object.values(this.game.players))p.connected=online.has(p.id);
  });}
  async fetch(req){
    await this.ready;
    if(req.headers.get('upgrade')?.toLowerCase()!=='websocket')return new Response('WebSocket required',{status:426});
    const id=req.headers.get('x-dicebound-player');
    if(!['one','two','three','four'].includes(id))return new Response('Not authorised',{status:403});
    const {0:client,1:server}=Object.values(new WebSocketPair());
    for(const older of this.ctx.getWebSockets()){
      if(older.deserializeAttachment()?.id===id)older.close(4000,'Joined on another device');
    }
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({id});
    if(req.headers.get('x-dicebound-trial')==='balance-v9')this.game.balanceTrial=true;
    const trial = req.headers.get('x-dicebound-trial');
    if(trial==='caravan-q5-r1'||trial==='rushing-dunes-q5-r2'||/^quest5-room[3-8]$/.test(trial||'')){
      const startRoom=trial==='caravan-q5-r1'?'q5r1':trial==='rushing-dunes-q5-r2'?'q5r2':'q5r'+trial.slice(-1);
      ensureCaravanTrialPlayer(this.game,id,req.headers.get('x-dicebound-name'),startRoom);
    }
    else ensurePlayer(this.game,id,req.headers.get('x-dicebound-name'),null);
    resumeMazeClock(this.game,id);
    this.announce(`${this.game.players[id].name} joined the adventure.`);
    await this.persist(null);
    this.broadcast();
    this.sendChat(server);
    return new Response(null,{status:101,webSocket:client});
  }
  announce(text){this.game.log.push({at:Date.now(),text});this.game.log=this.game.log.slice(-35)}
  sendChat(ws){try{ws.send(JSON.stringify(chatForViewer(this.chat,ws.deserializeAttachment()?.id)))}catch{}}
  broadcastChat(){for(const ws of this.ctx.getWebSockets())this.sendChat(ws)}
  async handleChatPacket(ws,id,packet){
    if(packet.type==='chat-send')postChat(this.chat,{id,name:this.game.players[id].name,text:packet.text});
    else if(packet.type==='chat-mute')togglePersonalMute(this.chat,id,packet.player);
    else if(packet.type==='chat-report')reportChat(this.chat,id,packet.messageId,packet.reason);
    else if(packet.type==='chat-admin-mute')toggleAdminMute(this.chat,id,packet.player);
    else throw new Error('Unknown chat command');
    await this.ctx.storage.put('chat-v1',this.chat);
    this.broadcastChat();
  }
  broadcast(){for(const ws of this.ctx.getWebSockets()){
    try{ws.send(JSON.stringify({type:'state',state:{...publicState(this.game,ws.deserializeAttachment()?.id),maze:mazePublic(this.game,ws.deserializeAttachment()?.id)}}))}catch{}
  }}
  async persist(reason){
    // Durable live coordination data is separate from the designated adventure
    // snapshots: room entry, boss victory and checkpoint activation (Decision 114).
    await this.ctx.storage.put('live',this.game);
    if(reason)await this.ctx.storage.put('adventureSnapshot',{reason,at:Date.now(),state:this.game});
    await this.schedule();
  }
  async schedule(){
    // One clock for the whole party, even when everyone is in different quests.
    const ordinary=this.game.turn?.activePlayer===null?Infinity:this.game.turn?.deadline||Infinity;
    const nextTime=Math.min(ordinary,nextMazeDeadline(this.game));const next=Number.isFinite(nextTime)?nextTime:null;
    if(next)await this.ctx.storage.setAlarm(Math.max(Date.now()+100,next));
    else await this.ctx.storage.deleteAlarm();
  }
  async webSocketMessage(ws,msg){
    await this.ready;
    if(typeof msg!=='string'||msg.length>1500)return;
    const id=ws.deserializeAttachment()?.id;
    if(!id||!this.game.players[id]?.connected)return;
    try{
      const packet=JSON.parse(msg);
      if(!packet||typeof packet!=='object'||Array.isArray(packet))throw new Error('Invalid command');
      // Supervised chat runs outside turn order. Its messages have their own
      // bounded storage and never alter dungeon, quest or combat saves.
      if(['chat-send','chat-mute','chat-report','chat-admin-mute'].includes(packet.type)){
        await this.handleChatPacket(ws,id,packet);return;
      }
      if(this.game.players[id].mazeSlot&&!packet.type.startsWith('maze-')&&!['ping','chat-send','chat-mute','chat-report','chat-admin-mute'].includes(packet.type))throw new Error('Leave the Maze before using campaign actions');
      // All gameplay changes are gated by the same global turn owner.
      // Rolling must precede movements and tactical actions; inventory controls
      // remain available during downtime (but still respect combat rules).
      const freePackets=['ping','reset-lab'];
      const inventoryPackets=['equip','unequip','bind-enchant','class-select'];
      if(!freePackets.includes(packet.type)&&!inventoryPackets.includes(packet.type)&&packet.type!=='end-turn'&&!packet.type.startsWith('maze-'))
        assertGlobalTurn(this.game,id);
      let result;
      if(packet.type==='maze-create')result=createMaze(this.game,id,packet.slot,crypto.randomUUID());
      else if(packet.type==='maze-join')result=joinMaze(this.game,id,packet.slot);
      else if(packet.type==='maze-leave')result=leaveMaze(this.game,id);
      else if(packet.type==='maze-travel')result=mazeTravel(this.game,id,packet.dir);
      else if(packet.type==='maze-search')result=mazeSearch(this.game,id);
      else if(packet.type==='maze-claim')result=mazeClaim(this.game,id,packet.slot);
      else if(packet.type==='maze-bonus')result=mazeBonus(this.game,id);
      else if(packet.type==='maze-action')result=mazeAction(this.game,id,packet.action);
      else if(packet.type==='maze-retreat')result=mazeRetreat(this.game,id);
      else if(packet.type==='maze-reward')result=mazeReward(this.game,id,packet.category);
      else if(packet.type==='maze-abandon')result=mazeVoteAbandon(this.game,id);
      else if(packet.type==='move')result=move(this.game,id,packet.dir);
      else if(packet.type==='action'){if(packet.action?.type==='move')throw new Error('Use dice movement');result=submitSequentialAction(this.game,id,packet.action);}
      else if(packet.type==='claim')result=claimLoot(this.game,id,packet.slot);
      else if(packet.type==='claim-quest-reward')result=claimQuestReward(this.game,id,packet.quest,packet.category);
      else if(packet.type==='class-select')result=selectClass(this.game,id,packet.klass);
      else if(packet.type==='equip')result=equipItem(this.game,id,packet.itemId,packet.slot||null);
      else if(packet.type==='training-rack')result=claimTrainingRack(this.game,id);
      else if(packet.type==='enter-quest')result=enterQuest(this.game,id,packet.quest);
      else if(packet.type==='replay-quest')result=replayQuest(this.game,id,packet.quest);
      else if(packet.type==='roll-move')result=rollMovement(this.game,id);
      else if(packet.type==='end-turn')result=endTurn(this.game,id);
      else if(packet.type==='return-camp')result=returnToCamp(this.game,id);
      else if(packet.type==='finish-quest')result=voteFinishQuest(this.game,id);
      else if(packet.type==='shop-buy')result=buyFromShop(this.game,id,packet.sku);
      else if(packet.type==='shop-sell')result=sellToShop(this.game,id,packet.kind,packet.itemId);
      else if(packet.type==='resume-quest')result=resumeQuest(this.game,id);
      else if(packet.type==='unequip')result=unequipItem(this.game,id,packet.slot);
      else if(packet.type==='bind-enchant')result=bindEnchantment(this.game,id,packet.enchantId,packet.itemId);
      else if(packet.type==='potion')result=this.game.rooms[this.game.players[id].room].battle.status==='active' ? submitSequentialAction(this.game,id,{type:'potion',target:packet.target||id}) : usePotion(this.game,id,packet.target);
      else if(packet.type==='reset-lab'){
        if(id!=='one')throw new Error('Only Player One can reset this technical test adventure');
        const caravanTrial=this.game.caravanTrial;
        const startRoom=this.game.caravanTrialRoom||'q5r1';
        this.game=resetTestAdventure(this.game);
        if(caravanTrial){
          this.game.caravanTrial=true;
          this.game.caravanTrialRoom=startRoom;
          for(const player of Object.values(this.game.players))if(player.connected)ensureCaravanTrialPlayer(this.game,player.id,player.name,startRoom);
        }
        result={saved:'lab-reset'};
      }
      else if(packet.type==='ping'){ws.send(JSON.stringify({type:'pong'}));return}
      else throw new Error('Unknown command');
      await this.persist(result?.saved||null);this.broadcast();
    }catch(err){ws.send(JSON.stringify({type:'error',message:String(err.message||'Invalid action').slice(0,150)}))}
  }
  async webSocketClose(ws){await this.disconnect(ws)}
  async webSocketError(ws){await this.disconnect(ws)}
  async disconnect(ws){
    await this.ready;
    const id=ws.deserializeAttachment()?.id;
    // If same user has rejoined on another socket, do not mark them disconnected.
    const another=this.ctx.getWebSockets().some(s=>s!==ws&&s.deserializeAttachment()?.id===id&&s.readyState===1);
    if(id&&!another){markDisconnected(this.game,id);this.announce(`${this.game.players[id].name} disconnected safely.`);await this.persist(null);this.broadcast()}
  }
  async alarm(){await this.ready;const mazeChanged=mazeTick(this.game);const changes=tick(this.game);if(changes.length||mazeChanged){const save=changes.map(c=>c.result?.saved).find(Boolean);await this.persist(save||null);this.broadcast()}else await this.schedule()}
}
