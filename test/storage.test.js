import test from 'node:test';
import assert from 'node:assert/strict';
import { KEY, advanceMatch, beginMatch, makeSubstitution, newGame, playRound } from '../public/game.js';
import { MAX_BACKUP_BYTES, RECOVERY_KEY, exportBackup, parseBackup, readStoredGame, restoreBackup, writeGame } from '../public/storage.js';

function memory(raw) {
  const entries=new Map(raw===undefined?[]:[[KEY,raw]]);
  return { entries, getItem:key=>entries.get(key)??null, setItem:(key,value)=>entries.set(key,value) };
}
function advanceTo(game,minute) {
  while(game.pending&&game.pending.minute<minute){game.pending.paused=false;advanceMatch(game);}
}

test('backup round trip preserves a substituted live match and its deterministic result',()=>{
  const game=newGame('FC Utrecht');beginMatch(game);advanceTo(game,63);game.pending.paused=true;
  makeSubstitution(game,game.pending.selection[2],game.pending.bench[0]);
  game.pending.paused=false;
  const before=structuredClone(game),raw=exportBackup(game),restored=parseBackup(raw);
  assert.deepEqual(game,before,'export does not pause or mutate the active game');
  assert.equal(restored.pending.paused,true);
  assert.equal(restored.pending.minute,63);
  assert.equal(restored.pending.subs,1);
  assert.deepEqual(restored.pending.selection,game.pending.selection);
  advanceTo(game,90);advanceTo(restored,90);
  assert.deepEqual(restored.lastMatch,game.lastMatch);
  assert.equal(restored.credits,game.credits);
  assert.deepEqual(parseBackup(exportBackup(restored)).lastMatch,restored.lastMatch);
});

test('legacy saves migrate without modifying their stored source',()=>{
  for(const version of [2,3,4,5]){
    const old=newGame('PSV');old.version=version;old.credits=76543;
    if(version<5){delete old.benchIds;delete old.captainId;}
    const raw=JSON.stringify(old),storage=memory(raw),loaded=readStoredGame(storage);
    assert.equal(loaded.error,'',`version ${version}`);
    assert.equal(loaded.game.version,5);
    assert.equal(loaded.game.clubs[0].name,'PSV');
    assert.equal(loaded.game.credits,76543);
    assert.equal(loaded.game.benchIds.length,7);
    assert.equal(storage.getItem(KEY),raw);
  }
});

test('version 4 halftime backups retain their score and remain playable',()=>{
  const game=newGame('FC Twente');beginMatch(game);advanceTo(game,45);
  const live=game.pending;
  game.version=4;
  game.pending={home:live.home,away:live.away,selection:live.selection,subs:0,first:{
    teams:[game.clubs[0].players.filter(p=>live.selection.includes(p.id)),game.clubs[5].players.filter(p=>live.opponentSelection.includes(p.id))],
    stats:live.stats,events:live.events
  }};
  delete game.benchIds;delete game.captainId;
  const restored=parseBackup(JSON.stringify(game));
  assert.equal(restored.pending.minute,45);
  assert.deepEqual(restored.pending.stats,live.stats);
  advanceTo(restored,90);assert.equal(restored.round,1);
});

test('malformed and unsupported backups never replace existing data',()=>{
  const raw=JSON.stringify(newGame('AZ')),storage=memory(raw);
  for(const bad of ['{','null','[]','{}',JSON.stringify({version:99}),JSON.stringify({format:'touchline-backup',backupVersion:2}), ' '.repeat(MAX_BACKUP_BYTES+1)]){
    assert.throws(()=>parseBackup(bad));
    assert.equal(storage.getItem(KEY),raw);
  }
  for(const change of [
    g=>{g.clubs[0].players[0].passing=null;},
    g=>{g.tactics.formation='unknown';},
    g=>{g.results=[{home:99,away:1,round:1,goals:[0,0]}];},
    g=>{g.color='red;position:fixed';},
    g=>{beginMatch(g);g.pending.selection[0]='missing-player';},
    g=>{beginMatch(g);g.pending.stats=[];},
    g=>{beginMatch(g);g.pending.played=null;},
    g=>{playRound(g);g.lastMatch.detail.events=[null];}
  ]){
    const broken=newGame();change(broken);
    assert.throws(()=>restoreBackup(storage,broken));
    assert.equal(storage.getItem(KEY),raw);
    assert.equal(storage.getItem(RECOVERY_KEY),null);
  }
});

test('corrupt saved bytes are preserved and distinct from an empty browser',()=>{
  const storage=memory('{broken');
  const loaded=readStoredGame(storage);
  assert.equal(loaded.game,null);assert.equal(loaded.raw,'{broken');assert.ok(loaded.error);
  assert.equal(storage.getItem(KEY),'{broken');
  assert.deepEqual(readStoredGame(memory()),{game:null,raw:null,error:''});
});

test('unavailable storage and quota errors do not throw from ordinary loading and saving',()=>{
  const denied={getItem(){throw new Error('SecurityError');},setItem(){throw new Error('QuotaExceededError');}};
  assert.equal(readStoredGame(denied).game,null);
  assert.match(readStoredGame(denied).error,/niet beschikbaar/);
  assert.equal(writeGame(denied,newGame()),false);
  const game=newGame(),storage=memory(JSON.stringify(game));
  storage.setItem=()=>{throw new Error('QuotaExceededError');};
  assert.equal(readStoredGame(storage).game.clubs[0].name,'Ajax','loading never needs to write');
});

test('confirmed replacement keeps an exact recovery copy and can be undone',()=>{
  const original=newGame('Feyenoord');playRound(original);
  const raw=JSON.stringify(original),storage=memory(raw),replacement=newGame('AZ');
  const restored=restoreBackup(storage,replacement);
  assert.equal(restored.clubs[0].name,'AZ');
  assert.equal(storage.getItem(RECOVERY_KEY),raw);
  restoreBackup(storage,readStoredGame(storage,RECOVERY_KEY).game);
  assert.deepEqual(readStoredGame(storage).game,original);
  assert.equal(readStoredGame(storage,RECOVERY_KEY).game.clubs[0].name,'AZ');
});

test('failure during either restore write preserves the original career',()=>{
  for(const failKey of [RECOVERY_KEY,KEY]){
    const raw=JSON.stringify(newGame('PSV')),storage=memory(raw),setItem=storage.setItem;
    storage.setItem=(key,value)=>{if(key===failKey)throw new Error('QuotaExceededError');setItem(key,value);};
    assert.throws(()=>restoreBackup(storage,newGame('AZ')));
    assert.equal(storage.getItem(KEY),raw);
  }
});

test('recovery can preserve newer in-memory progress after a failed autosave',()=>{
  const game=newGame('PSV'),storage=memory(JSON.stringify(game));
  playRound(game); // This result has not yet reached browser storage.
  restoreBackup(storage,newGame('AZ'),game);
  const recovered=readStoredGame(storage,RECOVERY_KEY).game;
  assert.equal(recovered.round,1);
  assert.deepEqual(recovered.lastMatch,game.lastMatch);
  assert.equal(recovered.credits,game.credits);
});
