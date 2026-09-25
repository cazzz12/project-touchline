import { lineUp, rng, simulate } from './engine.js';
import { realPlayers } from './real-players.js';

export const KEY = 'touchline-save-v2';
export const clubNames = ['Ajax','Feyenoord','PSV','AZ','FC Utrecht','FC Twente'];
const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
const positions={G:['GK'],D:['RB','CB','CB','LB'],M:['CDM','CM','CM','CAM'],F:['RW','LW','ST']};
function fromSource(source,index){
  const random=rng(505+index*739),base=55+Math.floor(random()*28);
  const stat=()=>clamp(base+Math.floor((random()-.5)*28),30,95);
  return {id:`real-${index}`,name:source.name,age:2026-source.birthYear,position:positions[source.role][index%positions[source.role].length],attack:stat(),passing:stat(),defending:stat(),pace:stat(),finishing:stat(),composure:stat(),stamina:stat(),fitness:75+Math.floor(random()*26),morale:70+Math.floor(random()*31)};
}
const rosterCounts={G:3,D:16,M:17,F:14};
const squads=Array.from({length:6},()=>[]);
const reserves=[];
for(const role of Object.keys(rosterCounts)){
  const pool=realPlayers.map((p,i)=>({p,i})).filter(({p})=>p.role===role);
  pool.forEach(({p,i},n)=>{const player=fromSource(p,i);if(n<rosterCounts[role]*6)squads[n%6].push(player);else reserves.push(player);});
}
export const initialClubs=clubNames.map((name,i)=>({name,players:squads[i]}));
export const rating = p => Math.round((p.attack+p.passing+p.defending+p.pace+p.finishing+p.composure)/6);
export const cost = p => Math.round((rating(p)-40)**2 * 145);
export function schedule() {
  let order=[0,1,2,3,4,5]; const rounds=[];
  for(let round=0;round<5;round++) {
    rounds.push(Array.from({length:3},(_,i)=>round%2 ? [order[5-i],order[i]] : [order[i],order[5-i]]));
    order=[order[0],order[5],...order.slice(1,5)];
  }
  return [...rounds,...rounds.map(day=>day.map(([a,b])=>[b,a]))];
}
export function newGame(name='Ajax',color='#c5ff70') {
  const clubs=structuredClone(initialClubs);
  const selected=clubNames.includes(name)?name:'Ajax';
  clubs[0].name=selected;
  clubs.slice(1).forEach((club,i)=>{club.name=clubNames.filter(n=>n!==selected)[i];});
  return prepareSquad({version:5,clubs,color,round:0,credits:120000,points:0,results:[],training:'Recovery',academy:1,scout:null,market:[],news:[`Welkom bij ${clubs[0].name}. Je eerste seizoen begint vandaag.`],tactics:{formation:'4-3-3',mentality:50,pressing:50,tempo:50},lineupIds:lineUp(clubs[0]).map(p=>p.id),pending:null,season:1,lastMatch:null,reportOpen:false});
}
export function prepareSquad(game){
  const players=game.clubs[0].players,known=new Set(players.map(p=>p.id));
  if(!Array.isArray(game.lineupIds)||game.lineupIds.length!==11||new Set(game.lineupIds).size!==11||game.lineupIds.some(id=>!known.has(id)))game.lineupIds=lineUp(game.clubs[0],game.tactics.formation).map(p=>p.id);
  const starters=new Set(game.lineupIds),eligible=players.filter(p=>!starters.has(p.id)).sort((a,b)=>rating(b)-rating(a));
  const preferred=game.benchIds||[eligible.find(p=>p.position==='GK')?.id];
  game.benchIds=[...new Set([...preferred,...eligible.map(p=>p.id)])].filter(id=>known.has(id)&&!starters.has(id)).slice(0,7);
  if(!starters.has(game.captainId))game.captainId=game.lineupIds.map(id=>players.find(p=>p.id===id)).sort((a,b)=>b.composure-a.composure)[0].id;
  return game;
}
export function migrateSave(old){
  if(!old||!Array.isArray(old.clubs))return null;
  if([4,5].includes(old.version)){
    const game=prepareSquad(old);game.version=5;game.season=game.season||1;
    if(game.pending?.first){
      const p=game.pending,side=p.home===0?0:1,initial=p.first.teams[side].map(player=>player.id);
      p.minute=45;p.stats=p.first.stats;p.events=p.first.events;p.played=Object.fromEntries(initial.map(id=>[id,45]));
      p.used=initial.filter(id=>!p.selection.includes(id));p.bench=[...new Set([...game.benchIds,...initial])].filter(id=>!p.selection.includes(id)&&!p.used.includes(id)).slice(0,7);
      p.opponentSelection=p.first.teams[1-side].map(player=>player.id);p.captainId=p.selection.includes(game.captainId)?game.captainId:p.selection[0];p.subs=p.subs||0;p.coaching=[];delete p.first;
    }
    if(game.pending)game.pending.paused=true;
    return game;
  }
  if(old.version!==2&&old.version!==3)return null;
  const selected=clubNames.includes(old.clubs[0]?.name)?old.clubs[0].name:'Ajax',fresh=newGame(selected,old.color);
  return {...fresh,credits:old.credits,round:old.round,results:old.results||[],points:old.points||0,tactics:old.tactics||fresh.tactics,trainingUsed:false,news:[`Je club speelt nu als ${selected} met echte spelersnamen. Uitslagen en credits zijn bewaard.`,...(old.news||[])].slice(0,20)};
}
export function setStarter(game,slot,id){
  if(game.pending||!Number.isInteger(slot)||slot<0||slot>10||!game.clubs[0].players.some(p=>p.id===id))return false;
  prepareSquad(game);
  if(game.lineupIds.some((selected,index)=>selected===id&&index!==slot))return false;
  const previous=game.lineupIds[slot],benchSlot=game.benchIds.indexOf(id);game.lineupIds[slot]=id;
  if(benchSlot>=0)game.benchIds[benchSlot]=previous;
  prepareSquad(game);return true;
}
export function setBench(game,slot,id){
  if(game.pending||!Number.isInteger(slot)||slot<0||slot>6||game.lineupIds.includes(id)||!game.clubs[0].players.some(p=>p.id===id))return false;
  if(game.benchIds.some((selected,index)=>selected===id&&index!==slot))return false;
  game.benchIds[slot]=id;return true;
}
export function setCaptain(game,id){
  if(game.pending||!game.lineupIds.includes(id))return false;
  game.captainId=id;return true;
}
export function makeSubstitution(game,outId,inId){
  const p=game.pending;
  if(!p||!p.paused||p.minute>=90||p.subs>=3||p.selection.includes(inId)||!p.bench.includes(inId)||p.used.includes(inId))return false;
  const index=p.selection.indexOf(outId);if(index<0)return false;
  const players=game.clubs[0].players;p.selection[index]=inId;p.bench=p.bench.filter(id=>id!==inId);p.used.push(outId);p.subs++;
  if(p.captainId===outId)p.captainId=p.selection.find(id=>id===game.captainId)||p.selection[0];
  p.coaching.push({minute:p.minute,text:`Wissel: ${players.find(player=>player.id===outId).name} → ${players.find(player=>player.id===inId).name}`});return true;
}
export function standings(game) {
  const table=game.clubs.map((c,i)=>({i,name:c.name,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}));
  for(const match of game.results){
    const a=table[match.home],b=table[match.away]; a.p++;b.p++;a.gf+=match.goals[0];a.ga+=match.goals[1];b.gf+=match.goals[1];b.ga+=match.goals[0];
    if(match.goals[0]>match.goals[1]){a.w++;b.l++;a.pts+=3;} else if(match.goals[0]<match.goals[1]){b.w++;a.l++;b.pts+=3;} else{a.d++;b.d++;a.pts++;b.pts++;}
  }
  return table.sort((a,b)=>b.pts-a.pts || (b.gf-b.ga)-(a.gf-a.ga) || b.gf-a.gf);
}
export function nextFixture(game) {return schedule()[game.round]?.find(pair=>pair.includes(0));}
export function train(game,focus) {
  if(!['Recovery','Attacking','Defending','Fitness'].includes(focus)) return false;
  if(game.trainingUsed||game.pending) return false;
  const players=game.clubs[0].players;
  for(const p of players){
    if(focus==='Recovery') p.fitness=clamp(p.fitness+9,0,100);
    if(focus==='Fitness') {p.fitness=clamp(p.fitness+3,0,100);p.stamina=clamp(p.stamina+1,0,99);}
    if(focus==='Attacking') {p.attack=clamp(p.attack+1,0,99);p.fitness=clamp(p.fitness-4,0,100);}
    if(focus==='Defending') {p.defending=clamp(p.defending+1,0,99);p.fitness=clamp(p.fitness-4,0,100);}
  }
  game.training=focus;game.trainingUsed=true;game.news.unshift(`${focus} training afgerond. Nieuwe sessie na je volgende wedstrijd.`);return true;
}
export function scout(game) {
  if(game.pending || game.scout || game.credits<15000) return false;
  const random=rng(13000+game.round*271+game.results.length*19);
  const owned=new Set(game.clubs.flatMap(c=>c.players.map(p=>p.id)));
  const pool=reserves.filter(p=>!owned.has(p.id));
  if(pool.length<4)return false;
  game.credits-=15000;
  game.market=Array.from({length:4},()=>{const p=pool.splice(Math.floor(random()*pool.length),1)[0];return {...p,fitness:100};});
  game.scout='completed';game.news.unshift('Scouts hebben vier jonge spelers gevonden. Bekijk de transfermarkt.');return true;
}
export function signPlayer(game,id) {
  if(game.pending)return false;
  const index=game.market.findIndex(p=>p.id===id);
  if(index<0 || game.clubs[0].players.length>=55) return false;
  const p=game.market[index],price=cost(p);
  if(game.credits<price) return false;
  game.credits-=price;game.clubs[0].players.push(p);game.market.splice(index,1);
  game.news.unshift(`${p.name} tekent bij ${game.clubs[0].name} voor ${price.toLocaleString('nl-NL')} credits.`);return true;
}
const statKeys=['goals','shots','onTarget','xg','passes','completed','possessions','fouls'];
const emptyStats=()=>Object.fromEntries([...statKeys,'possession','passAccuracy'].map(key=>[key,0]));
export function beginMatch(game){
  if(game.pending)return game.pending;if(game.round>=10)return null;
  prepareSquad(game);const [home,away]=nextFixture(game),other=home===0?away:home;game.reportOpen=false;
  game.pending={home,away,minute:0,selection:[...game.lineupIds],bench:[...game.benchIds],captainId:game.captainId,opponentSelection:lineUp(game.clubs[other]).map(p=>p.id),used:[],subs:0,played:{},stats:[emptyStats(),emptyStats()],events:[],coaching:[],paused:true};return game.pending;
}
export function matchFitness(player,minutes=0){return clamp(Math.round(player.fitness-minutes*(.08+(100-player.stamina)*.0015)),25,100);}
export function advanceMatch(game){
  const p=game.pending;if(!p||p.paused||p.minute>=90)return null;
  const minute=p.minute+1,mySide=p.home===0?0:1;
  const clubs=[game.clubs[p.home],game.clubs[p.away]].map((club,side)=>({...club,players:club.players.map(player=>({...player,fitness:matchFitness(player,side===mySide?(p.played[player.id]||0):p.minute)}))}));
  const own=p.selection,other=p.opponentSelection;
  const part=simulate({seed:73001+(game.season||1)*100000+game.round*1000+minute,clubs,homeTactics:mySide===0?game.tactics:{},awayTactics:mySide===1?game.tactics:{},homeSelection:mySide===0?own:other,awaySelection:mySide===1?own:other,startMinute:minute,endMinute:minute});
  p.selection.forEach(id=>p.played[id]=(p.played[id]||0)+1);p.minute=minute;
  p.stats.forEach((s,i)=>{statKeys.forEach(key=>s[key]+=part.stats[i][key]);s.xg=Number(s.xg.toFixed(2));s.possession=Math.round(100*s.possessions/minute);s.passAccuracy=s.passes?Math.round(100*s.completed/s.passes):0;});
  p.events.push(...part.events.map(event=>({...event,score:p.stats.map(s=>s.goals)})));
  if(minute===45||minute===90)p.paused=true;
  if(minute===90)return finishMatch(game);return null;
}
export function finishMatch(game){
  const p=game.pending;if(!p||p.minute!==90)return null;
  const fixtures=schedule()[game.round];let own;
  for(let i=0;i<fixtures.length;i++){
    const [home,away]=fixtures[i];
    const result=home===p.home&&away===p.away?{clubs:[game.clubs[home].name,game.clubs[away].name],teams:[home===0?p.selection:p.opponentSelection,away===0?p.selection:p.opponentSelection].map((ids,side)=>ids.map(id=>game.clubs[side===0?home:away].players.find(player=>player.id===id))),stats:structuredClone(p.stats),events:structuredClone(p.events),coaching:structuredClone(p.coaching),played:{...p.played},captainId:p.captainId}:simulate({seed:11000+(game.season||1)*100000+game.round*100+i,clubs:[game.clubs[home],game.clubs[away]]});
    const match={home,away,goals:result.stats.map(s=>s.goals),round:game.round+1};game.results.push(match);if(home===0||away===0)own={...match,detail:result};
  }
  const side=own.home===0?0:1,them=1-side,reward=own.goals[side]>own.goals[them]?35000:own.goals[side]===own.goals[them]?18000:10000;
  game.credits+=reward;game.points+=own.goals[side]>own.goals[them]?3:own.goals[side]===own.goals[them]?1:0;
  for(const player of game.clubs[0].players)player.fitness=p.played[player.id]?matchFitness(player,p.played[player.id]):Math.min(player.fitness+3,100);
  own.reward=reward;game.news.unshift(`Speeldag ${game.round+1}: ${game.clubs[own.home].name} ${own.goals[0]}–${own.goals[1]} ${game.clubs[own.away].name}. +${reward.toLocaleString('nl-NL')} credits.`);
  game.round++;game.trainingUsed=false;game.scout=null;game.market=[];game.pending=null;game.lastMatch=own;game.reportOpen=true;return own;
}
export function playRound(game){if(!beginMatch(game))return null;while(game.pending){game.pending.paused=false;advanceMatch(game);}return game.lastMatch;}
export function newSeason(game) {
  if(game.round<10) return false;
  const place=standings(game).findIndex(row=>row.i===0)+1;
  const bonus=(7-place)*30000;game.credits+=bonus;
  game.news.unshift(`Seizoen afgerond op plaats ${place}. Seizoensbonus: ${bonus.toLocaleString('nl-NL')} credits.`);
  game.season=(game.season||1)+1;game.reportOpen=false;game.round=0;game.results=[];game.trainingUsed=false;game.scout=null;game.market=[];
  return true;
}
