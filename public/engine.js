import {keeperAbility,goalChanceAgainstKeeper,keeperMatchStats} from './keepers.js';
import {bookFoul,forfeitingSides} from './discipline.js';
export function rng(seed) {
  let x = seed >>> 0;
  return () => { x += 0x6D2B79F5; let t = x; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const first = ['Mateo','Jules','Amir','Luca','Dario','Noah','Ibrahim','Rafael','Elias','Sandro','Nico','Milan','Tariq','Omar','Theo','Hugo','Yanis','Felix','Kai','Jonas'];
const last = ['Reyes','Navarro','Diallo','Costa','Mendes','Bakker','Silva','Ortega','Okafor','Vega','Moretti','Khan','Mercier','Santos','Idris','Volkov','Jansen','Park','Alvarez','Rossi'];
const roles = ['GK','RB','CB','CB','LB','CDM','CM','CM','RW','LW','ST'];
export const formations = { '4-3-3': roles, '4-4-2': ['GK','RB','CB','CB','LB','RM','CM','CM','LM','ST','ST'], '4-2-3-1': ['GK','RB','CB','CB','LB','CDM','CDM','RW','CAM','LW','ST'] };
Object.assign(formations,{
  '4-1-4-1':['GK','RB','CB','CB','LB','CDM','RM','CM','CM','LM','ST'],
  '4-3-2-1':['GK','RB','CB','CB','LB','CM','CDM','CM','CAM','CAM','ST'],
  '4-2-2-2':['GK','RB','CB','CB','LB','CDM','CDM','CAM','CAM','ST','ST'],
  '3-4-3':['GK','CB','CB','CB','RM','CM','CM','LM','RW','ST','LW'],
  '3-5-2':['GK','CB','CB','CB','RM','CM','CDM','CM','LM','ST','ST'],
  '5-3-2':['GK','RB','CB','CB','CB','LB','CM','CDM','CM','ST','ST'],
  '5-2-3':['GK','RB','CB','CB','CB','LB','CM','CM','RW','ST','LW']
});
const groups = { GK:'GK',RB:'DEF',CB:'DEF',LB:'DEF',CDM:'MID',CM:'MID',CAM:'MID',RM:'WING',LM:'WING',RW:'WING',LW:'WING',ST:'ST' };
// Official squad pages only specify broad roles. Do not invent a preferred side.
export function positionFit(position,role){
  if(position===role)return 1;
  if((position==='DEF'&&groups[role]==='DEF')||(position==='MID'&&['CDM','CM','CAM','LM','RM'].includes(role))||(position==='ATT'&&['RW','LW','ST'].includes(role)))return 1;
  return groups[position]&&groups[position]===groups[role]?.93:.78;
}
const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
const pick = (array, random) => array[Math.floor(random() * array.length)];
export function createClubs(seed = 42) {
  const random = rng(Number(seed));
  return ['Amsterdam Athletic','Rotterdam City'].map((name, club) => ({
    name, players: Array.from({ length: 50 }, (_, i) => {
      const position = roles[i % roles.length];
      const base = 55 + Math.floor(random() * 29);
      const stat = () => clamp(base + Math.floor((random() - .5) * 32), 25, 95);
      return { id: `${club}-${i}`, name: `${pick(first,random)} ${pick(last,random)}`, age: 17 + Math.floor(random()*17), position, attack: stat(), passing: stat(), defending: stat(), pace: stat(), finishing: stat(), composure: stat(), stamina: stat(), fitness: 70 + Math.floor(random()*31), morale: 60 + Math.floor(random()*41) };
    })
  }));
}
function fit(player, role) {
  const group = groups[role], suitability=positionFit(player.position,role),same=suitability===1?20:suitability===.93?8:-12;
  const primary = group === 'GK' ? (player.defending + player.composure)/2 : group === 'DEF' ? player.defending : group === 'ST' ? (player.finishing + player.attack)/2 : (player.attack + player.passing)/2;
  return same + primary*.65 + player.fitness*.12 + player.morale*.08;
}
export function lineUp(club, formation = '4-3-3', keeperRules = 0) {
  if (!formations[formation]) throw new Error('Unknown formation');
  const remaining = [...club.players];
  return formations[formation].map(role => {
    const score=p=>role==='GK'&&keeperRules===1?(p.position==='GK'?10000:0)+keeperAbility(p):fit(p,role);
    remaining.sort((a,b) => score(b)-score(a));
    return remaining.splice(0,1)[0];
  });
}
export function simulate({ seed = 12345, homeTactics = {}, awayTactics = {}, clubs = createClubs(42), homeSelection, awaySelection, startMinute = 1, endMinute = 90, keeperRules = 1, disciplineRules = 0, bookings = [{},{}], dismissed = [[],[]] } = {}) {
  const random = rng(Number(seed));
  const cards=disciplineRules===1,cardRandom=rng(Number(seed)^0x3a19c85b);
  bookings=structuredClone(bookings);dismissed=structuredClone(dismissed);
  const tactics = [homeTactics,awayTactics].map(t => ({ formation: t.formation || '4-3-3', mentality: clamp(Number(t.mentality ?? 50),0,100), pressing: clamp(Number(t.pressing ?? 50),0,100), tempo: clamp(Number(t.tempo ?? 50),0,100) }));
  const teams = clubs.map((club,i) => {
    const ids=i===0?homeSelection:awaySelection;
    if(!ids)return lineUp(club,tactics[i].formation,keeperRules);
    const selected=ids.map(id=>id===null&&cards?null:club.players.find(p=>p.id===id));
    const present=ids.filter(id=>id!==null);
    if(selected.length!==11||selected.some(p=>p===undefined||(!cards&&!p))||new Set(present).size!==present.length||(cards&&present.length>=7&&!selected[0]))throw new Error('Invalid starting XI');
    return selected;
  });
  const stats = clubs.map(() => ({ goals:0, shots:0, onTarget:0, xg:0, passes:0, completed:0, possessions:0, fouls:0 }));
  if(cards)stats.forEach(s=>Object.assign(s,{yellowCards:0,redCards:0}));
  const startedSelections=teams.map(t=>t.filter(Boolean).map(p=>p.id)),playedBySide=[{},{}],keeperMinutes=[{},{}];
  let abandoned=cards?forfeitingSides(teams):[],minutePlayed=startMinute-1;
  const events = [];
  const avg = (team,key) => team.filter(Boolean).reduce((n,p)=>n+p[key],0)/team.filter(Boolean).length;
  const active = team => team.slice(1).filter(Boolean);
  const opponent = i => 1-i;
  const sample = (team) => pick(active(team),random);
  const fit = (player,role) => positionFit(player.position,role);
  for (let minute=startMinute; minute<=endMinute; minute++) {
    if(abandoned.length)break;
    minutePlayed=minute;
    if(cards)teams.forEach((team,side)=>{for(const p of team.filter(Boolean))playedBySide[side][p.id]=(playedBySide[side][p.id]||0)+1;const keeper=team[0];if(keeper)keeperMinutes[side][keeper.id]=(keeperMinutes[side][keeper.id]||0)+1;});
    const count=teams.map(t=>t.filter(Boolean).length);
    const h = (avg(teams[0],'passing') + 2 + tactics[0].pressing*.09)*(cards?count[0]/11:1);
    const a = (avg(teams[1],'passing') + tactics[1].pressing*.09)*(cards?count[1]/11:1);
    const side = random() < h/(h+a) ? 0 : 1;
    const other = opponent(side), atk = sample(teams[side]), def = sample(teams[other]);
    const t = tactics[side], dt = tactics[other], s = stats[side];
    const attackFit=fit(atk,formations[t.formation][teams[side].indexOf(atk)]);
    const defenseFit=fit(def,formations[dt.formation][teams[other].indexOf(def)]);
    s.possessions++;
    const steps = 2 + Math.floor(random()*5);
    let retained = true;
    for (let step=0; step<steps; step++) {
      s.passes++;
      const chance = clamp(.87 + (atk.passing*attackFit-def.defending*defenseFit)*.003 + (atk.morale-70)*.001 + (atk.fitness-70)*.001 - t.tempo*.0006 - dt.pressing*.0006 + (cards?(count[side]-count[other])*.01:0), .3,.95);
      if (random() < chance) s.completed++;
      else {
        retained=false;
        if(random()<(cards?.08+dt.pressing*.001:.13)){
          stats[other].fouls++;
          if(cards){
            const card=bookFoul(bookings[other],dismissed[other],def.id,cardRandom(),dt.pressing);
            if(card){
              if(card.type==='yellow'||card.secondYellow)stats[other].yellowCards++;
              if(card.type==='red'){stats[other].redCards++;teams[other][teams[other].indexOf(def)]=null;}
              events.push({minute,side:other,player:def.name,playerId:def.id,...card});
              abandoned=forfeitingSides(teams);
            }
          }
        }
        break;
      }
    }
    if (!retained) continue;
    const pressure = (t.mentality-50)*.003 + (t.tempo-50)*.0015 - (dt.pressing-50)*.0012;
    const create = clamp(.36 + pressure + (atk.attack*attackFit-def.defending*defenseFit)*.002 + (atk.fitness-70)*.001 + (cards?(count[side]-count[other])*.018:0), .03,.65);
    if (random() >= create) continue;
    s.shots++;
    const xg = clamp(.06 + random()*.29 + (atk.finishing-65)*.001 + (t.mentality-50)*.0004 - (dt.pressing-50)*.0005, .02,.65);
    s.xg += xg;
    const targetChance = clamp(.43 + (atk.composure-60)*.003, .25,.72);
    const onTarget = random() < targetChance;
    if (onTarget) s.onTarget++;
    const shotRoll = random();
    const keeper=teams[other][0],chance=clamp(xg / targetChance,0,1);
    const goal = onTarget && shotRoll < (keeperRules===1?goalChanceAgainstKeeper(chance,keeper):chance);
    if (goal) s.goals++;
    events.push({ minute, side, player: atk.name, playerId:atk.id, type: goal ? 'goal' : onTarget ? 'save' : 'miss', xg: Number(xg.toFixed(2)), score: stats.map(st=>st.goals),...(keeperRules===1?{keeperId:keeper.id,keeper:keeper.name}:{}) });
  }
  stats.forEach(s => { s.xg = Number(s.xg.toFixed(2)); s.possession = Math.round(100*s.possessions/Math.max(1,cards?minutePlayed-startMinute+1:endMinute-startMinute+1)); s.passAccuracy = s.passes ? Math.round(100*s.completed/s.passes) : 0; });
  return { seed:Number(seed), clubs:clubs.map(c=>c.name), tactics, teams, stats, events,...(keeperRules===1?{keeperRules:1,keeping:keeperMatchStats(clubs,events,cards?keeperMinutes:teams.map(team=>({[team[0].id]:endMinute-startMinute+1})))}:{}),...(cards?{disciplineRules:1,bookings,dismissed,playedBySide,keeperMinutes,startedSelections,minute:minutePlayed,abandoned}:{}) };
}
