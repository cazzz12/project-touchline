export function rng(seed) {
  let x = seed >>> 0;
  return () => { x += 0x6D2B79F5; let t = x; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const first = ['Mateo','Jules','Amir','Luca','Dario','Noah','Ibrahim','Rafael','Elias','Sandro','Nico','Milan','Tariq','Omar','Theo','Hugo','Yanis','Felix','Kai','Jonas'];
const last = ['Reyes','Navarro','Diallo','Costa','Mendes','Bakker','Silva','Ortega','Okafor','Vega','Moretti','Khan','Mercier','Santos','Idris','Volkov','Jansen','Park','Alvarez','Rossi'];
const roles = ['GK','RB','CB','CB','LB','CDM','CM','CM','RW','LW','ST'];
export const formations = { '4-3-3': roles, '4-4-2': ['GK','RB','CB','CB','LB','RM','CM','CM','LM','ST','ST'], '4-2-3-1': ['GK','RB','CB','CB','LB','CDM','CDM','RW','CAM','LW','ST'] };
const groups = { GK:'GK',RB:'DEF',CB:'DEF',LB:'DEF',CDM:'MID',CM:'MID',CAM:'MID',RM:'WING',LM:'WING',RW:'WING',LW:'WING',ST:'ST' };
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
  const group = groups[role], same = player.position === role ? 20 : groups[player.position] === group ? 8 : -12;
  const primary = group === 'GK' ? (player.defending + player.composure)/2 : group === 'DEF' ? player.defending : group === 'ST' ? (player.finishing + player.attack)/2 : (player.attack + player.passing)/2;
  return same + primary*.65 + player.fitness*.12 + player.morale*.08;
}
export function lineUp(club, formation = '4-3-3') {
  if (!formations[formation]) throw new Error('Unknown formation');
  const remaining = [...club.players];
  return formations[formation].map(role => {
    remaining.sort((a,b) => fit(b,role)-fit(a,role));
    return remaining.splice(0,1)[0];
  });
}
export function simulate({ seed = 12345, homeTactics = {}, awayTactics = {}, clubs = createClubs(42), homeSelection, awaySelection, startMinute = 1, endMinute = 90 } = {}) {
  const random = rng(Number(seed));
  const tactics = [homeTactics,awayTactics].map(t => ({ formation: t.formation || '4-3-3', mentality: clamp(Number(t.mentality ?? 50),0,100), pressing: clamp(Number(t.pressing ?? 50),0,100), tempo: clamp(Number(t.tempo ?? 50),0,100) }));
  const teams = clubs.map((club,i) => {
    const ids=i===0?homeSelection:awaySelection;
    if(!ids)return lineUp(club,tactics[i].formation);
    const selected=ids.map(id=>club.players.find(p=>p.id===id));
    if(selected.length!==11||selected.some(p=>!p)||new Set(ids).size!==11)throw new Error('Invalid starting XI');
    return selected;
  });
  const stats = clubs.map(() => ({ goals:0, shots:0, onTarget:0, xg:0, passes:0, completed:0, possessions:0, fouls:0 }));
  const events = [];
  const avg = (team,key) => team.reduce((n,p)=>n+p[key],0)/team.length;
  const active = team => team.slice(1);
  const opponent = i => 1-i;
  const sample = (team) => pick(active(team),random);
  for (let minute=startMinute; minute<=endMinute; minute++) {
    const h = avg(teams[0],'passing') + 2 + tactics[0].pressing*.09;
    const a = avg(teams[1],'passing') + tactics[1].pressing*.09;
    const side = random() < h/(h+a) ? 0 : 1;
    const other = opponent(side), atk = sample(teams[side]), def = sample(teams[other]);
    const t = tactics[side], dt = tactics[other], s = stats[side];
    s.possessions++;
    const steps = 2 + Math.floor(random()*5);
    let retained = true;
    for (let step=0; step<steps; step++) {
      s.passes++;
      const chance = clamp(.66 + (atk.passing-def.defending)*.003 + (atk.morale-70)*.001 + (atk.fitness-70)*.001 - t.tempo*.0011 - dt.pressing*.0011, .3,.91);
      if (random() < chance) s.completed++;
      else { retained = false; if (random()<.13) stats[other].fouls++; break; }
    }
    if (!retained) continue;
    const pressure = (t.mentality-50)*.003 + (t.tempo-50)*.0015 - (dt.pressing-50)*.0012;
    const create = clamp(.17 + pressure + (atk.attack-def.defending)*.002 + (atk.fitness-70)*.001, .03,.49);
    if (random() >= create) continue;
    s.shots++;
    const xg = clamp(.06 + random()*.29 + (atk.finishing-65)*.001 + (t.mentality-50)*.0004 - (dt.pressing-50)*.0005, .02,.65);
    s.xg += xg;
    const onTarget = random() < clamp(.43 + (atk.composure-60)*.003, .25,.72);
    if (onTarget) s.onTarget++;
    const goal = random() < xg * (onTarget ? 1.9 : .12);
    if (goal) s.goals++;
    events.push({ minute, side, player: atk.name, type: goal ? 'goal' : onTarget ? 'save' : 'miss', xg: Number(xg.toFixed(2)), score: stats.map(st=>st.goals) });
  }
  stats.forEach(s => { s.xg = Number(s.xg.toFixed(2)); s.possession = Math.round(100*s.possessions/(endMinute-startMinute+1)); s.passAccuracy = s.passes ? Math.round(100*s.completed/s.passes) : 0; });
  return { seed:Number(seed), clubs:clubs.map(c=>c.name), tactics, teams, stats, events };
}
