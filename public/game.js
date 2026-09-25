import { createClubs, rng, simulate } from './engine.js';

export const KEY = 'touchline-save-v2';
const names = ['Utrecht United','Eindhoven Rovers','Haarlem FC','Den Haag Stars'];
const opponents = createClubs(91);
const extra = [91,92,93,94].map((seed,i) => ({ ...createClubs(seed)[0], name:names[i] }));
export const initialClubs = [createClubs(42)[0], opponents[1], ...extra];
const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
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
export function newGame(name='Amsterdam Athletic',color='#c5ff70') {
  const clubs=structuredClone(initialClubs);
  clubs[0].name=name.trim().slice(0,32) || 'Amsterdam Athletic';
  return {version:2,clubs,color,round:0,credits:120000,points:0,results:[],training:'Recovery',academy:1,scout:null,market:[],news:[`Welkom bij ${clubs[0].name}. Je eerste seizoen begint vandaag.`],tactics:{formation:'4-3-3',mentality:50,pressing:50,tempo:50}};
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
  const pool=createClubs(900+game.round).flatMap(c=>c.players).filter(p=>p.age<=23);
  game.market=Array.from({length:4},()=>{const p=pool.splice(Math.floor(random()*pool.length),1)[0];return {...p,id:`scout-${game.round}-${p.id}`,fitness:100};});
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
export function playRound(game) {
  if(game.round>=10) return null;
  const fixtures=schedule()[game.round];let own;
  for(let i=0;i<fixtures.length;i++) {
    const [home,away]=fixtures[i];
    const result=simulate({seed:11000+game.round*100+i,clubs:[game.clubs[home],game.clubs[away]],homeTactics:home===0?game.tactics:{},awayTactics:away===0?game.tactics:{}});
    const match={home,away,goals:result.stats.map(s=>s.goals),round:game.round+1};
    game.results.push(match);
    if(home===0||away===0) own={...match,detail:result};
  }
  const mySide=own.home===0?0:1,them=1-mySide;
  const reward=own.goals[mySide]>own.goals[them]?35000:own.goals[mySide]===own.goals[them]?18000:10000;
  game.credits+=reward; game.points+=own.goals[mySide]>own.goals[them]?3:own.goals[mySide]===own.goals[them]?1:0;
  const starters=new Set(own.detail.teams[mySide].map(p=>p.id));
  for(const p of game.clubs[0].players) p.fitness=clamp(p.fitness+(starters.has(p.id)?-13:3),35,100);
  game.news.unshift(`Speeldag ${game.round+1}: ${game.clubs[own.home].name} ${own.goals[0]}–${own.goals[1]} ${game.clubs[own.away].name}. +${reward.toLocaleString('nl-NL')} credits.`);
  game.round++;game.trainingUsed=false;game.scout=null;game.market=[];
  return own;
}
export function newSeason(game) {
  if(game.round<10) return false;
  const place=standings(game).findIndex(row=>row.i===0)+1;
  const bonus=(7-place)*30000;game.credits+=bonus;
  game.news.unshift(`Seizoen afgerond op plaats ${place}. Seizoensbonus: ${bonus.toLocaleString('nl-NL')} credits.`);
  game.round=0;game.results=[];game.trainingUsed=false;game.scout=null;game.market=[];
  return true;
}
