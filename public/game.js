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
  return {version:4,clubs,color,round:0,credits:120000,points:0,results:[],training:'Recovery',academy:1,scout:null,market:[],news:[`Welkom bij ${clubs[0].name}. Je eerste seizoen begint vandaag.`],tactics:{formation:'4-3-3',mentality:50,pressing:50,tempo:50},lineupIds:lineUp(clubs[0]).map(p=>p.id),pending:null};
}
export function migrateSave(old){
  if(!old||!Array.isArray(old.clubs))return null;
  if(old.version===4)return old;
  if(old.version!==2&&old.version!==3)return null;
  const selected=clubNames.includes(old.clubs[0]?.name)?old.clubs[0].name:'Ajax';
  const fresh=newGame(selected,old.color);
  return {...fresh,credits:old.credits,round:old.round,results:old.results||[],points:old.points||0,tactics:old.tactics||fresh.tactics,trainingUsed:false,news:['Je club speelt nu als Ajax (of jouw gekozen bestaande club) met echte spelersnamen. Uitslagen en credits zijn bewaard.',...(old.news||[])].slice(0,20)};
}
export function setStarter(game,slot,id){
  if(game.pending||slot<0||slot>10||!game.clubs[0].players.some(p=>p.id===id))return false;
  if(!Array.isArray(game.lineupIds)||game.lineupIds.length!==11)game.lineupIds=lineUp(game.clubs[0],game.tactics.formation).map(p=>p.id);
  if(game.lineupIds.some((selected,index)=>selected===id&&index!==slot))return false;
  game.lineupIds[slot]=id;return true;
}
export function makeSubstitution(game,outId,inId){
  const pending=game.pending;
  if(!pending||pending.subs>=3||pending.selection.includes(inId)||!game.clubs[0].players.some(p=>p.id===inId))return false;
  const index=pending.selection.indexOf(outId);
  if(index<0)return false;
  pending.selection[index]=inId;pending.subs=(pending.subs||0)+1;return true;
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
  if(game.trainingUsed) return false;
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
  if(game.scout || game.credits<15000) return false;
  game.credits-=15000;
  const random=rng(13000+game.round*271+game.results.length*19);
  const owned=new Set(game.clubs.flatMap(c=>c.players.map(p=>p.id)));
  const pool=reserves.filter(p=>!owned.has(p.id));
  if(pool.length<4)return false;
  game.market=Array.from({length:4},()=>{const p=pool.splice(Math.floor(random()*pool.length),1)[0];return {...p,fitness:100};});
  game.scout='completed';game.news.unshift('Scouts hebben vier jonge spelers gevonden. Bekijk de transfermarkt.');return true;
}
export function signPlayer(game,id) {
  const index=game.market.findIndex(p=>p.id===id);
  if(index<0 || game.clubs[0].players.length>=55) return false;
  const p=game.market[index],price=cost(p);
  if(game.credits<price) return false;
  game.credits-=price;game.clubs[0].players.push(p);game.market.splice(index,1);
  game.news.unshift(`${p.name} tekent bij ${game.clubs[0].name} voor ${price.toLocaleString('nl-NL')} credits.`);return true;
}
export function beginMatch(game){
  if(game.pending)return game.pending;
  if(game.round>=10)return null;
  const fixture=nextFixture(game),home=fixture[0],away=fixture[1];
  const selection=game.lineupIds?.length===11?game.lineupIds:lineUp(game.clubs[0],game.tactics.formation).map(p=>p.id);
  const opts={seed:11000+game.round*100+schedule()[game.round].findIndex(pair=>pair.includes(0)),clubs:[game.clubs[home],game.clubs[away]],homeTactics:home===0?game.tactics:{},awayTactics:away===0?game.tactics:{},homeSelection:home===0?selection:undefined,awaySelection:away===0?selection:undefined};
  const first=simulate({...opts,endMinute:45});
  game.pending={home,away,selection:[...selection],first};return game.pending;
}
export function finishMatch(game){
  const pending=game.pending;if(!pending)return null;
  const {home,away,selection,first}=pending;
  const fixtures=schedule()[game.round];let own;
  for(let i=0;i<fixtures.length;i++) {
    const [h,a]=fixtures[i];
    let result;
    if(h===home&&a===away){
      const second=simulate({seed:22000+game.round*100+i,clubs:[game.clubs[h],game.clubs[a]],homeTactics:h===0?game.tactics:{},awayTactics:a===0?game.tactics:{},homeSelection:h===0?selection:undefined,awaySelection:a===0?selection:undefined,startMinute:46,endMinute:90});
      const stats=first.stats.map((s,j)=>{const t=second.stats[j],merged={};for(const key of ['goals','shots','onTarget','passes','completed','possessions','fouls'])merged[key]=s[key]+t[key];merged.xg=Number((s.xg+t.xg).toFixed(2));merged.possession=Math.round(100*merged.possessions/90);merged.passAccuracy=merged.passes?Math.round(100*merged.completed/merged.passes):0;return merged;});
      result={clubs:first.clubs,teams:second.teams,stats,events:[...first.events,...second.events]};
    }else result=simulate({seed:11000+game.round*100+i,clubs:[game.clubs[h],game.clubs[a]]});
    const match={home:h,away:a,goals:result.stats.map(s=>s.goals),round:game.round+1};
    game.results.push(match);
    if(h===0||a===0) own={...match,detail:result};
  }
  const mySide=own.home===0?0:1,them=1-mySide;
  const reward=own.goals[mySide]>own.goals[them]?35000:own.goals[mySide]===own.goals[them]?18000:10000;
  game.credits+=reward; game.points+=own.goals[mySide]>own.goals[them]?3:own.goals[mySide]===own.goals[them]?1:0;
  const starters=new Set([...first.teams[mySide],...own.detail.teams[mySide]].map(p=>p.id));
  for(const p of game.clubs[0].players) p.fitness=clamp(p.fitness+(starters.has(p.id)?-13:3),35,100);
  game.news.unshift(`Speeldag ${game.round+1}: ${game.clubs[own.home].name} ${own.goals[0]}–${own.goals[1]} ${game.clubs[own.away].name}. +${reward.toLocaleString('nl-NL')} credits.`);
  game.round++;game.trainingUsed=false;game.scout=null;game.market=[];game.pending=null;
  return own;
}
export function playRound(game){if(!beginMatch(game))return null;return finishMatch(game);}
export function newSeason(game) {
  if(game.round<10) return false;
  const place=standings(game).findIndex(row=>row.i===0)+1;
  const bonus=(7-place)*30000;game.credits+=bonus;
  game.news.unshift(`Seizoen afgerond op plaats ${place}. Seizoensbonus: ${bonus.toLocaleString('nl-NL')} credits.`);
  game.round=0;game.results=[];game.trainingUsed=false;game.scout=null;game.market=[];
  return true;
}
