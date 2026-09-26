import {resolve} from 'node:path';
import {existsSync} from 'node:fs';
import {openDatabase,backupDatabase} from '../backend/database.js';
import {configuration} from '../backend/server.js';
const source=configuration().dbPath,target=resolve(process.argv[2]||`backups/touchline-${new Date().toISOString().replace(/[:.]/g,'-')}.sqlite`);
if(!existsSync(source))throw new Error('Er bestaat nog geen database. Start eerst de server.');
if(existsSync(target)||resolve(source)===target)throw new Error('Kies een nieuw backupbestand; bestaande bestanden worden niet overschreven.');
const db=openDatabase(source);try{await backupDatabase(db,target);console.log(`Databasebackup opgeslagen: ${target}`);}finally{db.close();}
