// Rules for this fictional ten-round league, not official competition rules.
export const YELLOW_LIMIT=3;
export const suspensionFor=(game,id)=>game.discipline?.suspensions?.[id]||null;
export const yellowCount=(game,id)=>game.discipline?.yellows?.[id]||0;
const roundNumber=g=>(g.season-1)*10+g.round;
export function ensureDiscipline(game){
  if(game.discipline===undefined)game.discipline={schema:1,yellows:{},suspensions:{},lastRound:roundNumber(game)};
  return game;
}
export function bookFoul(bookings,dismissed,id,roll,pressing){
  if(dismissed.includes(id))return null;
  const direct=roll<.025+pressing*.00015;
  if(!direct&&roll>=.275+pressing*.00115)return null;
  if(!direct)bookings[id]=(bookings[id]||0)+1;
  const secondYellow=!direct&&bookings[id]===2;
  if(direct||secondYellow){dismissed.push(id);return {type:'red',secondYellow};}
  return {type:'yellow'};
}
export const forfeitingSides=selections=>selections.map((ids,side)=>ids.filter(Boolean).length<7?side:null).filter(side=>side!==null);
export function awardedGoals(detail){
  const score=detail.stats.map(s=>s.goals),out=detail.abandoned||[];
  if(out.length===2)return [0,0];
  if(out.length===1){score[out[0]]=0;score[1-out[0]]=Math.max(3,score[1-out[0]]);}
  return score;
}
export const doubleForfeit=match=>match.forfeit?.length===2;

export function settleDiscipline(game,matches){
  ensureDiscipline(game);const d=game.discipline,number=roundNumber(game)+1;
  if(d.lastRound>=number)return null;
  const report={banned:[],served:[]},own=new Set(game.clubs[0].players.map(p=>p.id));
  // Existing bans serve this fixture first. New bans start next fixture.
  for(const [id,ban] of Object.entries(d.suspensions)){
    ban.remaining--;
    if(!ban.remaining){delete d.suspensions[id];if(own.has(id))report.served.push(game.clubs[0].players.find(p=>p.id===id).name);}
  }
  for(const detail of matches){
    const cards=detail.events.filter(e=>['yellow','red'].includes(e.type));
    for(const id of new Set(cards.map(e=>e.playerId))){
      const events=cards.filter(e=>e.playerId===id),red=events.find(e=>e.type==='red');
      let remaining=0,reason='';
      if(red){remaining=red.secondYellow?1:2;reason=red.secondYellow?'second-yellow':'red';}
      else{
        const count=(d.yellows[id]||0)+events.length;
        if(count>=YELLOW_LIMIT){remaining=1;reason='yellow-limit';}
        d.yellows[id]=count%YELLOW_LIMIT;
      }
      if(remaining){
        d.suspensions[id]={remaining,reason,season:game.season,round:game.round+1};
        if(own.has(id))report.banned.push({id,name:events[0].player,remaining,reason});
      }
    }
  }
  d.lastRound=number;
  for(const p of report.banned)game.news.unshift(`${p.name} is in het spel ${p.remaining} speeldag(en) geschorst.`);
  for(const name of report.served)game.news.unshift(`${name} heeft zijn schorsing uitgezeten.`);
  return report;
}
