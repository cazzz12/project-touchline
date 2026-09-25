// Generated game skills, never official ratings. Missing values are derived once
// from existing skills, without consuming the match engine's random stream.
export const keeperSkills={reflexes:'Reflexen',handling:'Balvastheid',positioning:'Positionering'};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function keeperAttributes(p){
  return {
    reflexes:p.reflexes===undefined?Math.round(p.defending*.6+p.composure*.4):p.reflexes,
    handling:p.handling===undefined?Math.round(p.defending*.5+p.composure*.5):p.handling,
    positioning:p.positioning===undefined?Math.round(p.defending*.7+p.composure*.3):p.positioning
  };
}
export function ensureKeeperSkills(game){
  for(const p of [...game.clubs.flatMap(c=>c.players),...(game.market||[])]){
    if(p.position==='GK')Object.assign(p,keeperAttributes(p));
  }
  return game;
}
export function keeperRating(p){
  const s=keeperAttributes(p);
  return s.reflexes*.5+s.handling*.25+s.positioning*.25;
}
export function keeperAbility(p){
  const quality=keeperRating(p)*(.6+.4*p.fitness/100)+(p.morale-70)*.04;
  return clamp(quality*(p.position==='GK'?1:.4),0,100);
}
export const goalChanceAgainstKeeper=(chance,p)=>clamp(chance*clamp(1+(65-keeperAbility(p))*.012,.6,1.75),.02,.98);

// Attribute each shot to the player occupying the keeper slot at that minute.
export function keeperMatchStats(clubs,events,minutesBySide){
  return clubs.map((club,side)=>Object.entries(minutesBySide[side]).filter(([,minutes])=>minutes>0).map(([id,minutes])=>{
    const faced=events.filter(e=>e.side!==side&&e.keeperId===id);
    const saves=faced.filter(e=>e.type==='save').length,conceded=faced.filter(e=>e.type==='goal').length;
    return {id,name:club.players.find(p=>p.id===id).name,minutes,saves,conceded,cleanSheet:minutes>=60&&conceded===0};
  }));
}
