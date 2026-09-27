import test from 'node:test';
import assert from 'node:assert/strict';
import {previewLogin} from '../public/preview-login.js';
import {loginView} from '../public/arena-ui.js';
test('local preview uses the existing browser-bound challenge and never offers a production bypass',async()=>{
 const calls=[],api=async(path,body)=>{calls.push({path,body});return path==='/auth/challenge'?{id:'test-proof',testCode:'123456'}:{ok:true};};
 await previewLogin({mode:'local-test',account:null},api);
 assert.deepEqual(calls,[{path:'/auth/challenge',body:{kind:'email',identifier:'preview@touchline.test',link:false}},{path:'/auth/verify',body:{id:'test-proof',code:'123456'}}]);
 for(const session of [null,{mode:'production'},{mode:'local-test',account:{id:'existing'}}]){calls.length=0;if(session?.account)await previewLogin(session,api);else await assert.rejects(previewLogin(session,api),/alleen lokaal/);assert.equal(calls.length,0);}
 const view=localTest=>loginView({esc:String,emailForm:()=>'<form>EMAIL</form>',origin:'https://touchline.example',localTest});
 assert.match(view(true),/DIRECT NAAR HET CLUBHUIS/);assert.doesNotMatch(view(false),/preview-login|DIRECT NAAR HET CLUBHUIS/);
 let verified=false;await assert.rejects(previewLogin({mode:'local-test'},async path=>{if(path==='/auth/verify')verified=true;return {id:'no-code'};}),/testcode ontbreekt/);assert.equal(verified,false);
});
