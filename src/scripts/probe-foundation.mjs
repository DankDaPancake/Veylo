// Explicit local integration probe. Uses the current .env database; only SELECT 1.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

const cwd=fileURLToPath(new URL('..',import.meta.url));
const results=[];
async function check(name, env, expected, minimum=0) {
  const started=performance.now();
  const child=spawn(process.execPath,['scripts/db-check.mjs'],{cwd,env,windowsHide:true});
  let output=''; child.stdout.on('data',b=>output+=b);child.stderr.on('data',b=>output+=b);
  const status=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',resolve);});
  const elapsed=Math.round(performance.now()-started);
  assert.equal(status,expected,name);
  assert.ok(elapsed>=minimum && elapsed<25000,`${name}: elapsed ${elapsed}`);
  assert.ok(!output.includes('secret-never-print'),name+' leaked password');
  if(env.DATABASE_URL)assert.ok(!output.includes(env.DATABASE_URL),name+' leaked URL');
  results.push({name,status,elapsed_ms:elapsed,output:output.trim()});
}
const missing={...process.env};delete missing.DATABASE_URL;
await check('missing environment',missing,1);
await check('malformed URL',{...process.env,DATABASE_URL:'https://user:secret-never-print@localhost/db'},1);
await check('real PostgreSQL SELECT 1',process.env,0);
const sockets=new Set();
const server=createServer(socket=>{
  sockets.add(socket);
  socket.on('error',()=>{ /* A killed probe may reset this deliberately stalled socket. */ });
  socket.on('close',()=>sockets.delete(socket));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try {
  await check('unresponsive PostgreSQL handshake',{...process.env,DATABASE_URL:`postgresql://user:secret-never-print@127.0.0.1:${server.address().port}/veylo?connect_timeout=60`},1,19000);
} finally { for(const socket of sockets)socket.destroy();await new Promise(resolve=>server.close(resolve)); }
console.log(JSON.stringify({status:'PASS',results},null,2));
