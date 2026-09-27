import {injuryTypes} from './fitness.js';

export const inboxCategories={all:'Alles',selection:'Selectie',transfers:'Transfers',club:'Clubzaken'};
export const INBOX_READ_LIMIT=128;
export function ensureInbox(game){
  if(game.inbox===undefined)game.inbox={schema:1,read:[]};
  return game;
}
// These fingerprints identify a displayed group, not a security boundary.
function signature(parts){
  let a=2166136261,b=5381;
  for(const c of parts.slice().sort().join('|')){a=Math.imul(a^c.charCodeAt(0),16777619);b=Math.imul(b,33)^c.charCodeAt(0);}
  return (a>>>0).toString(16)+'-'+(b>>>0).toString(16);
}
const num=n=>n.toLocaleString('nl-NL');
const playerCount=n=>`${n} speler${n===1?'':'s'}`;
const days=n=>`${n} speeldag${n===1?'':'en'}`;

// Pure projection of current career facts. Reading never accepts offers or spends money.
export function inboxMessages(game){
  const messages=[],own=game.clubs[0].players,selected=new Set([...game.lineupIds,...game.benchIds].filter(Boolean));
  const add=(key,category,priority,title,text,action,details=[])=>messages.push({key,category,priority,title,text,action,details,read:game.inbox?.read.includes(key)||false});
  for(const [kind,records,label] of [['injuries',game.medical.injuries,'Blessures'],['suspensions',game.discipline.suspensions,'Schorsingen']]){
    const players=own.filter(p=>records[p.id]);if(!players.length)continue;
    const affected=players.filter(p=>selected.has(p.id)).length;
    const key=`${kind}:${signature(players.map(p=>`${p.id}:${records[p.id].season}:${records[p.id].round}:${records[p.id].remaining}:${selected.has(p.id)}`))}`;
    const details=players.map(p=>`${p.name} · ${kind==='injuries'?injuryTypes[records[p.id].kind].label:'Geschorst'} · ${days(records[p.id].remaining)} niet inzetbaar${selected.has(p.id)?' · in je wedstrijdselectie':''}`);
    add(key,'selection',affected?0:1,`${label}: ${playerCount(players.length)} niet inzetbaar`,affected?`${playerCount(affected)} in je basiself of wisselbank ${affected===1?'kan':'kunnen'} niet meedoen. Bekijk je selectie vóór de volgende aftrap.`:'Deze spelers ontbreken tijdelijk. Je huidige basiself en wisselbank bevatten hen niet.',{tab:'squad',label:'BEKIJK SELECTIE'},details);
  }
  for(const expired of [true,false]){
    const players=own.filter(p=>{const c=game.management.contracts[p.id];return expired?c.untilSeason<game.season:c.untilSeason<=game.season+1;}).filter(p=>expired||game.management.contracts[p.id].untilSeason>=game.season);
    if(!players.length)continue;
    const affected=players.filter(p=>selected.has(p.id)).length;
    const key=`contracts:${expired?'expired':'expiring'}:${game.season}:${signature(players.map(p=>`${p.id}:${game.management.contracts[p.id].untilSeason}:${expired&&selected.has(p.id)}`))}`;
    add(key,'club',expired&&affected?0:1,`${players.length} contract${players.length===1?'':'en'} ${expired?'verlopen':'binnenkort afgelopen'}`,
      expired?'Verleng vóór deelname aan een wedstrijd. De spelers blijven geregistreerd.':'Deze contracten lopen dit of volgend seizoen af. Bekijk eerst het nieuwe salaris voordat je verlengt.',
      {tab:'cluboffice',section:'contracts',label:'BEKIJK CONTRACTEN'},players.map(p=>`${p.name} · tot en met seizoen ${game.management.contracts[p.id].untilSeason} · ${num(game.management.contracts[p.id].salary)} credits per speeldag`));
  }
  if(!game.pending){
    for(const o of game.clubMarket.offers.filter(o=>o.status==='open'&&o.season===game.season&&o.round===game.round&&own.some(p=>p.id===o.playerId))){
      add(`incoming:${o.id}`,'transfers',1,`${o.buyerName} biedt op ${o.name}`,`${num(o.price)} credits aangeboden. Beslis vóór je volgende aftrap of seizoensafsluiting. Een bericht openen verkoopt geen speler.`,{tab:'transfers',section:'incoming',label:'BEKIJK ONTVANGEN BIEDINGEN'});
    }
    for(const o of game.transferDesk.offers.filter(o=>['accepted','counter'].includes(o.status)&&o.season===game.season&&o.round===game.round&&game.clubs[o.seller]?.players.some(p=>p.id===o.playerId))){
      add(`outgoing:${o.id}:${o.status}`,'transfers',1,`${o.status==='counter'?'Tegenbod':'Bod geaccepteerd'}: ${o.name}`,`${o.sellerName} vraagt ${num(o.price)} credits. ${game.credits<o.price?'Je clubkas is nu te laag. ':''}De aankoop wacht op jouw bevestiging en vervalt bij de volgende aftrap of seizoensafsluiting.`,{tab:'transfers',section:'clubs',seller:o.seller,label:'BEKIJK AANKOOPAANBOD'});
    }
  }
  if(game.credits<0)add(`finance:${game.season}:${game.round}`,'club',0,'Je clubkas staat rood',`Saldo: ${num(game.credits)} credits. Aankopen en upgrades zijn geblokkeerd. Bekijk je inkomsten, salarissen en kosten.`,{tab:'cluboffice',section:'finances',label:'BEKIJK FINANCIËN'});
  if(!game.management.sponsor&&game.round<10&&!game.pending)add(`sponsor:${game.season}`,'club',2,'Er is nog geen sponsor gekozen','Bekijk welke sponsorafspraak past bij je plannen voor de resterende speeldagen. Je kiest zelf een contract.',{tab:'cluboffice',section:'sponsors',label:'BEKIJK SPONSORS'});
  const completed=own.filter(p=>{const plan=game.development.players[p.id]?.plan;return plan&&p[plan.attribute]>=plan.target;});
  if(completed.length)add(`development:${signature(completed.map(p=>{const plan=game.development.players[p.id].plan;return `${p.id}:${plan.attribute}:${plan.target}`;}))}`,'selection',2,`${completed.length} trainingsdoel${completed.length===1?'':'en'} bereikt`,'De gekozen doelwaarde is gehaald. Bekijk de groei en bepaal zelf of je een volgend doel wilt instellen.',{tab:'training',section:'development',playerId:completed[0].id,label:'BEKIJK ONTWIKKELING'},completed.map(p=>p.name));
  if(game.round===10)add(`season:${game.season}`,'club',1,`Seizoen ${game.season} kan worden afgesloten`,'Bekijk de eindstand en start daarna het volgende seizoen. Je club, spelers en opgebouwde historie blijven behouden.',{tab:'overview',label:'BEKIJK SEIZOEN'});
  if(game.pending)add(`match:${game.season}:${game.round}`,'selection',1,'Er staat een wedstrijd open',`Je bent op minuut ${game.pending.minute}. ${game.pending.paused?'De wedstrijd is gepauzeerd.':'De wedstrijdklok loopt.'} Open de wedstrijd om verder te coachen.`,{tab:'overview',match:true,label:'OPEN WEDSTRIJD'});
  return messages.sort((a,b)=>a.priority-b.priority||a.key.localeCompare(b.key));
}
export function visibleInbox(messages,filters={}){
  return messages.filter(m=>(!filters.category||filters.category==='all'||m.category===filters.category)&&(filters.status!=='unread'||!m.read));
}
export function markInboxRead(game,keys,read=true){
  const active=new Set(inboxMessages(game).map(m=>m.key));
  if(typeof read!=='boolean'||!Array.isArray(keys)||!keys.length||keys.length>INBOX_READ_LIMIT||new Set(keys).size!==keys.length||keys.some(key=>!active.has(key)))return false;
  const next=new Set(game.inbox.read.filter(key=>active.has(key)));
  for(const key of keys){if(read)next.add(key);else next.delete(key);}
  game.inbox.read=[...next].slice(-INBOX_READ_LIMIT);return true;
}
export function validInbox(value){
  return value!==null&&typeof value==='object'&&!Array.isArray(value)&&value.schema===1&&Array.isArray(value.read)&&value.read.length<=INBOX_READ_LIMIT
    && new Set(value.read).size===value.read.length&&value.read.every(key=>typeof key==='string'&&/^(injuries|suspensions|contracts|incoming|outgoing|finance|sponsor|development|season|match):[a-z0-9:-]{1,100}$/.test(key));
}
