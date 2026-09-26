// Fictional capacities and credit prices, shared by every club in this prototype.
export const ticketPrices=[1,2,3,4];
export const capacityFor=level=>2500+2500*level;
const priceEffect={1:25,2:0,3:-25,4:-40};
const stamp=g=>(g.season-1)*10+g.round;
export function ensureStadium(game){
  if(game.stadium===undefined)game.stadium={schema:1,sinceSeason:game.season,sinceRound:game.round,lastRound:stamp(game),ticketPrice:2,
    totals:{matches:0,visitors:0,revenue:0},archived:{visitors:0,revenue:0},history:[]};
  return game;
}
export function supporterForm(game){
  return game.results.filter(r=>r.home===0||r.away===0).slice(-5).reduce((n,r)=>{
    const side=r.home===0?0:1;
    return n+(r.forfeit?.includes(side)?-2:r.goals[side]>r.goals[1-side]?2:r.goals[side]<r.goals[1-side]?-2:0);
  },0);
}
export function stadiumQuote(game,price=game.stadium.ticketPrice){
  if(!ticketPrices.includes(price))return null;
  const level=game.management.facilities.stadium,capacity=capacityFor(level),reputationBonus=Math.min(20,Math.floor(game.reputation.points/25)),formBonus=supporterForm(game);
  const occupancy=Math.max(10,Math.min(100,60+reputationBonus+formBonus+priceEffect[price]));
  const visitors=Math.floor(capacity*occupancy/100);
  return {level,price,reputationBonus,formBonus,occupancy,capacity,visitors,revenue:visitors*price};
}
export function chooseTicketPrice(game,price){
  if(game.pending||!ticketPrices.includes(price))return false;
  game.stadium.ticketPrice=price;return true;
}
export function ticketIncome(game,home){
  if(!home)return 0;
  if(game.pending)return game.pending.stadiumRules===1?(game.pending.minute===0&&game.pending.abandoned?.length?0:game.pending.stadiumGate?.revenue??0):3000+game.management.facilities.stadium*3000;
  return stadiumQuote(game).revenue;
}
export function settleStadium(game,match,pending){
  const s=game.stadium,time=stamp(game)+1;
  if(!pending||pending!==game.pending||pending.stadiumRules!==1||s.lastRound>=time
    ||(pending.minute!==90&&!pending.abandoned?.length)||match.home!==pending.home||match.away!==pending.away)return null;
  s.lastRound=time;
  if(pending.home!==0)return null;
  const cancelled=pending.minute===0;
  const report={...pending.stadiumGate,cancelled,...(cancelled?{visitors:0,revenue:0}:{})};
  s.totals.matches++;s.totals.visitors+=report.visitors;s.totals.revenue+=report.revenue;s.history.push(report);
  if(s.history.length>20){const old=s.history.shift();s.archived.visitors+=old.visitors;s.archived.revenue+=old.revenue;}
  return report;
}

const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const integer=(v,min,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
export function validStadiumGate(q,report=false){
  if(!object(q)||!integer(q.season,1)||!integer(q.round,1,10)||!integer(q.opponent,1,5)||!integer(q.level,1,5)
    ||!ticketPrices.includes(q.price)||!integer(q.reputationBonus,0,20)||!integer(q.formBonus,-10,10)||q.formBonus%2!==0
    ||q.capacity!==capacityFor(q.level)||q.occupancy!==Math.max(10,Math.min(100,60+q.reputationBonus+q.formBonus+priceEffect[q.price])))return false;
  if(report?typeof q.cancelled!=='boolean':q.cancelled!==undefined)return false;
  const visitors=q.cancelled?0:Math.floor(q.capacity*q.occupancy/100);
  return q.visitors===visitors&&q.revenue===visitors*q.price;
}
export function validStadium(game){
  const s=game.stadium,time=stamp(game);
  if(!object(s)||s.schema!==1||!integer(s.sinceSeason,1,game.season)||!integer(s.sinceRound,0,10)
    ||!integer(s.lastRound,(s.sinceSeason-1)*10+s.sinceRound,time)||!ticketPrices.includes(s.ticketPrice)
    ||!object(s.totals)||!object(s.archived)||!integer(s.totals.matches,0,s.lastRound-((s.sinceSeason-1)*10+s.sinceRound))
    ||!['visitors','revenue'].every(k=>integer(s.totals[k],0)&&integer(s.archived[k],0,s.totals[k]))
    ||!Array.isArray(s.history)||s.history.length!==Math.min(s.totals.matches,20))return false;
  let previous=(s.sinceSeason-1)*10+s.sinceRound,visitors=s.archived.visitors,revenue=s.archived.revenue;
  for(const q of s.history){
    if(!validStadiumGate(q,true))return false;
    const order=(q.season-1)*10+q.round;
    if(order<=previous||order>s.lastRound)return false;
    previous=order;visitors+=q.visitors;revenue+=q.revenue;
  }
  return visitors===s.totals.visitors&&revenue===s.totals.revenue
    && s.archived.visitors<=(s.totals.matches-s.history.length)*15000
    && s.archived.revenue>=s.archived.visitors&&s.archived.revenue<=s.archived.visitors*4;
}
