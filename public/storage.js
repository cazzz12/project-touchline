import { formations } from './engine.js';
import { KEY, clubNames, migrateSave, nextFixture } from './game.js';

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
const positions = new Set(Object.values(formations).flat());
function player(p) {
  return record(p) && typeof p.id === 'string' && /^real-\d+$/.test(p.id) && text(p.name)
    && integer(p.age, 1, 120) && positions.has(p.position) && playerStats.every(key => number(p[key], 0, 100));
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

// Validate before a file is allowed to replace browser storage. Migration operates
// on the parsed copy, never on the active in-memory career or the stored text.
function validate(game) {
  if (!record(game) || !Array.isArray(game.clubs) || game.clubs.length !== 6
    || !unique(game.clubs.map(c => c?.name))
    || !game.clubs.every(c => record(c) && clubNames.includes(c.name) && list(c.players, player, 55) && c.players.length >= 18)) invalid();
  const allIds = game.clubs.flatMap(c => c.players.map(p => p.id));
  const own = new Set(game.clubs[0].players.map(p => p.id));
  if (!unique(allIds) || !integer(game.round, 0, 10) || !integer(game.season, 1)
    || !number(game.credits) || !number(game.points) || !/^#[\da-f]{6}$/i.test(game.color)
    || !record(game.tactics) || !Object.hasOwn(formations, game.tactics.formation)
    || !['mentality', 'pressing', 'tempo'].every(key => number(game.tactics[key], 0, 100))
    || !list(game.results, result, 30) || !list(game.news, text, 10000)
    || !list(game.market, player, 4) || !unique(game.market.map(p => p.id))
    || game.market.some(p => allIds.includes(p.id))
    || !['Recovery', 'Attacking', 'Defending', 'Fitness'].includes(game.training)
    || !idList(game.lineupIds, own, 11) || !idList(game.benchIds, own, 7)
    || game.benchIds.some(id => game.lineupIds.includes(id)) || !game.lineupIds.includes(game.captainId)) invalid();
  if (game.lastMatch != null) {
    const r = game.lastMatch;
    if (!result(r) || !number(r.reward ?? 0) || !record(r.detail) || !stats(r.detail.stats)
      || !events(r.detail.events) || !coaching(r.detail.coaching || [])) invalid();
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
