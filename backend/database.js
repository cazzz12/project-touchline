import {DatabaseSync,backup} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {randomBytes} from 'node:crypto';

export function openDatabase(path){
  if(path!==':memory:')mkdirSync(dirname(resolve(path)),{recursive:true});
  const db=new DatabaseSync(path,{timeout:5000});
  db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;');
  const version=db.prepare('PRAGMA user_version').get().user_version;
  if(version>1){db.close();throw new Error('Deze database vraagt een nieuwere Touchline-versie.');}
  if(version===0)transaction(db,()=>{
    db.exec(`
      CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, created INTEGER NOT NULL);
      CREATE TABLE identities (kind TEXT NOT NULL, identifier TEXT NOT NULL, account TEXT NOT NULL REFERENCES accounts(id), PRIMARY KEY(kind,identifier));
      CREATE TABLE sessions (hash TEXT PRIMARY KEY, account TEXT NOT NULL REFERENCES accounts(id), csrf TEXT NOT NULL, created INTEGER NOT NULL, expires INTEGER NOT NULL);
      CREATE TABLE challenges (id TEXT PRIMARY KEY, kind TEXT NOT NULL, identifier TEXT NOT NULL, proof TEXT NOT NULL, browser TEXT NOT NULL, account TEXT REFERENCES accounts(id), expires INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
      CREATE TABLE leagues (id TEXT PRIMARY KEY, owner TEXT NOT NULL REFERENCES accounts(id), code TEXT UNIQUE NOT NULL, version INTEGER NOT NULL, state TEXT NOT NULL);
      CREATE TABLE members (league TEXT NOT NULL REFERENCES leagues(id), account TEXT NOT NULL REFERENCES accounts(id), club INTEGER NOT NULL CHECK(club BETWEEN 0 AND 5), PRIMARY KEY(league,account), UNIQUE(league,club));
      CREATE TABLE operations (account TEXT NOT NULL REFERENCES accounts(id), id TEXT NOT NULL, fingerprint TEXT NOT NULL, result TEXT NOT NULL, created INTEGER NOT NULL, PRIMARY KEY(account,id));
      PRAGMA user_version=1;
    `);
    db.prepare('INSERT INTO settings VALUES (?,?)').run('auth-secret',randomBytes(32).toString('hex'));
  });
  return db;
}
export function transaction(db,fn){db.exec('BEGIN IMMEDIATE');try{const result=fn();db.exec('COMMIT');return result;}catch(error){db.exec('ROLLBACK');throw error;}}
export async function backupDatabase(db,path){mkdirSync(dirname(resolve(path)),{recursive:true});await backup(db,path);}
