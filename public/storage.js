import { formations } from './engine.js';
import { KEY, clubNames, migrateSave, nextFixture } from './game.js';
import { sponsors } from './management.js';

export const RECOVERY_KEY = `${KEY}-before-import`;
export const MAX_BACKUP_BYTES = 2 * 1024 * 1024;
const invalid = () => { throw new Error('Dit bestand bevat geen geldige Touchline-carrière.'); };
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.length > 0 && value.length <= 500;
const number = (value, min = 0, max = Number.MAX_SAFE_INTEGER) => Number.isFinite(value) && value >= min && value <= max;
const integer = (value, min, max) => Number.isInteger(value) && number(value, min, max);
const list = (value, check, max = 1000) => Array.isArray(value) && value.length <= max && value.every(check);
const unique = ids => new Set(ids).size === ids.length;
const idList = (ids, known, length) => list(ids, id => known.has(id), 55) && unique(ids) && (length === undefined || ids.length === length);
const playerStats = ['attack', 'passing', 'defending', 'pace', 'finishing', 'composure', 'stamina', 'fitness', 'morale'];
const positions = new Set([...Object.values(formations).flat(),'DEF','MID','ATT']);
function player(p) {
  return record(p) && typeof p.id === 'string' && /^(real-\d+|club-[a-z0-9-]{1,100})$/.test(p.id) && text(p.name)
    && (p.age===null||integer(p.age, 1, 120)) && positions.has(p.position)
    && (p.number===undefined||integer(p.number,1,99)) && playerStats.every(key => number(p[key], 0, 100));
}
function stats(items) {
  return Array.isArray(items) && items.length === 2 && items.every(s => record(s)
    && ['goals', 'shots', 'onTarget', 'xg', 'passes', 'completed', 'possessions', 'fouls', 'possession', 'passAccuracy'].every(key => number(s[key])));
}
function events(items) {
  return list(items, e => record(e) && integer(e.minute, 1, 90) && integer(e.side, 0, 1)
    && text(e.player) && ['goal', 'save', 'miss'].includes(e.type) && number(e.xg, 0, 1));
}
function coaching(items) {
  return list(items, e => record(e) && integer(e.minute, 0, 90) && text(e.text), 10000);
}
function fixture(m) {
  return record(m) && integer(m.home, 0, 5) && integer(m.away, 0, 5) && m.home !== m.away;
}
function result(m) {
  return fixture(m) && Array.isArray(m.goals) && m.goals.length === 2 && m.goals.every(n => integer(n, 0, 90)) && integer(m.round, 1, 10);
}
const signedMoney = value => integer(value,-1e12,1e12);
function cashEntry(e){return record(e)&&integer(e.id,1)&&integer(e.season,1)&&integer(e.round,1,11)&&signedMoney(e.amount)&&signedMoney(e.balance)&&text(e.category)&&text(e.label);}
const recordKeys=['matches','wins','draws','losses','goalsFor','goalsAgainst','points'];
const seasonRecord=r=>record(r)&&recordKeys.every(key=>integer(r[key],0));
function management(game){
  const m=game.management;
  if(!record(m)||m.schema!==1||!text(m.managerName)||m.managerName.length>40||!integer(m.sinceSeason,1)||!integer(m.sinceRound,0,10)||!integer(m.xp,0)
    ||!signedMoney(m.ledgerOpening)||!list(m.ledger,cashEntry,500)||!integer(m.nextEntry,1)||!unique(m.ledger.map(e=>e.id))
    ||!record(m.contracts)||Object.keys(m.contracts).length>2000||!Object.values(m.contracts).every(c=>record(c)&&integer(c.salary,0,1e9)&&integer(c.untilSeason,1))
    ||!game.clubs[0].players.every(p=>Object.hasOwn(m.contracts,p.id))
    ||!record(m.facilities)||!['stadium','training','medical'].every(k=>integer(m.facilities[k],1,5))
    ||!record(m.staff)||!['coach','scout'].every(k=>integer(m.staff[k],0,3))
    ||typeof m.developmentUsed!=='boolean'||!record(m.auto)||!['protectLead','chaseGoal','subTired'].every(k=>typeof m.auto[k]==='boolean'))return false;
  let balance=m.ledgerOpening;
  for(const entry of m.ledger){balance+=entry.amount;if(balance!==entry.balance||entry.id>=m.nextEntry)return false;}
  if(balance!==game.credits)return false;
  if(m.sponsor!==null&&(!record(m.sponsor)||!Object.hasOwn(sponsors,m.sponsor.kind)||!integer(m.sponsor.season,1)||!integer(m.sponsor.startRound,0,9)))return false;
  if(!seasonRecord(m.archivedTotals)||!integer(m.archivedTotals.titles,0)||!integer(m.archivedTotals.seasons,0)
    ||!list(m.history,h=>record(h)&&integer(h.season,1)&&integer(h.place,1,6)&&clubNames.includes(h.club)&&seasonRecord(h.record)
      &&list(h.results,result,30)&&list(h.table,r=>record(r)&&clubNames.includes(r.name)&&['i','p','w','d','l','gf','ga','pts'].every(k=>integer(r[k],0)),6),50)
    ||!unique(m.history.map(h=>h.season))||!record(m.playerStats)||Object.keys(m.playerStats).length>2000)return false;
  return Object.values(m.playerStats).every(p=>record(p)&&text(p.name)&&['appearances','starts','minutes','goals','seasonAppearances','seasonGoals'].every(k=>integer(p[k],0))&&integer(p.season,1)&&list(p.clubs,c=>clubNames.includes(c),6));
}

// Validate before a file is allowed to replace browser storage. Migration operates
// on the parsed copy, never on the active in-memory career or the stored text.
function validate(game) {
  if (!record(game) || !Array.isArray(game.clubs) || game.clubs.length !== 6
    || !unique(game.clubs.map(c => c?.name))
    || !game.clubs.every(c => record(c) && clubNames.includes(c.name) && list(c.players, player, 55) && c.players.length >= 18)) invalid();
  const allIds = game.clubs.flatMap(c => c.players.map(p => p.id));
  const own = new Set(game.clubs[0].players.map(p => p.id));
  if (!unique(allIds) || !integer(game.round, 0, 10) || !integer(game.season, 1)
    || !signedMoney(game.credits) || !number(game.points) || !/^#[\da-f]{6}$/i.test(game.color)
    || !record(game.tactics) || !Object.hasOwn(formations, game.tactics.formation)
    || !['mentality', 'pressing', 'tempo'].every(key => number(game.tactics[key], 0, 100))
    || !list(game.results, result, 30) || !list(game.news, text, 10000)
    || !list(game.market, player, 4) || !unique(game.market.map(p => p.id))
    || game.market.some(p => allIds.includes(p.id))
    || !['Recovery', 'Attacking', 'Defending', 'Fitness'].includes(game.training)
    || !idList(game.lineupIds, own, 11) || !idList(game.benchIds, own, 7)
    || game.benchIds.some(id => game.lineupIds.includes(id)) || !game.lineupIds.includes(game.captainId)||!management(game)) invalid();
  if (game.lastMatch != null) {
    const r = game.lastMatch;
    if (!result(r) || !number(r.reward ?? 0) || !record(r.detail) || !stats(r.detail.stats)
      || !events(r.detail.events) || !coaching(r.detail.coaching || [])
      || (r.settlement!==undefined&&(!record(r.settlement)||!signedMoney(r.settlement.net)||!list(r.settlement.entries,cashEntry,8)))) invalid();
  }
  if (game.pending != null) {
    const p = game.pending, expected = nextFixture(game);
    if (!fixture(p) || !expected || p.home !== expected[0] || p.away !== expected[1]) invalid();
    const opponent = new Set(game.clubs[p.home === 0 ? p.away : p.home].players.map(player => player.id));
    if (!integer(p.minute, 0, 89) || !integer(p.subs, 0, 3) || !idList(p.selection, own, 11)
      || !idList(p.bench, own) || p.bench.length > 7 || !idList(p.used, own) || p.used.length !== p.subs
      || !unique([...p.selection, ...p.bench, ...p.used]) || !p.selection.includes(p.captainId)
      || !idList(p.opponentSelection, opponent, 11) || !stats(p.stats) || !events(p.events) || !coaching(p.coaching)
      || !record(p.played) || !Object.entries(p.played).every(([id, minutes]) => own.has(id) && integer(minutes, 0, p.minute))) invalid();
    if((p.startedSelection!==undefined&&!idList(p.startedSelection,own,11))||['autoChased','autoProtected'].some(key=>p[key]!==undefined&&typeof p[key]!=='boolean'))invalid();
    p.paused = true;
  }
  return game;
}

export function parseBackup(raw) {
  if (typeof raw !== 'string' || new TextEncoder().encode(raw).length > MAX_BACKUP_BYTES) {
    throw new Error('Kies een Touchline-backup van maximaal 2 MB.');
  }
  let data;
  try { data = JSON.parse(raw.replace(/^\uFEFF/, '')); } catch { invalid(); }
  if (data?.format === 'touchline-backup') {
    if (data.backupVersion !== 1) throw new Error('Deze backup komt uit een nieuwere versie van Touchline.');
    data = data.game;
  }
  if (!record(data) || ![2, 3, 4, 5].includes(data.version)) {
    throw new Error('Dit saveformaat wordt niet ondersteund. Je huidige carrière blijft bewaard.');
  }
  try { return validate(migrateSave(data)); } catch { invalid(); }
}

export function exportBackup(game, now = new Date()) {
  const copy = structuredClone(game);
  if (copy.pending) copy.pending.paused = true;
  return JSON.stringify({ format: 'touchline-backup', backupVersion: 1, exportedAt: now.toISOString(), game: copy }, null, 2);
}

export function readStoredGame(storage, key = KEY) {
  let raw = null;
  try {
    raw = storage.getItem(key);
    return { game: raw === null ? null : parseBackup(raw), raw, error: '' };
  } catch (error) {
    return { game: null, raw, error: raw === null ? 'Browseropslag is niet beschikbaar.' : error.message };
  }
}

export function writeGame(storage, game) {
  try { storage.setItem(KEY, JSON.stringify(game)); return true; } catch { return false; }
}

export function restoreBackup(storage, game, currentGame = null) {
  // A single setItem is atomic. If reserving the previous save or replacing the
  // current save fails, the current key remains untouched and the UI keeps playing it.
  const candidate = parseBackup(JSON.stringify(game));
  const stored = storage.getItem(KEY);
  // Include progress still in memory after an earlier autosave failure.
  const previous = currentGame ? JSON.stringify(currentGame) : stored;
  if (previous !== null) storage.setItem(RECOVERY_KEY, previous);
  storage.setItem(KEY, JSON.stringify(candidate));
  return candidate;
}
