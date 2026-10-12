import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parse} from 'parse5';
const release=JSON.parse(readFileSync('dist/release.json'));
assert.ok(['dev','staging'].includes(release.environment));
assert.equal(release.frontendOrigin,release.environment==='staging'?'https://d1agflgx6fkdor.cloudfront.net':'https://d3cpf76wsm49vw.cloudfront.net');
assert.equal(existsSync('dist/sitemap.xml'),false,'preview never publishes a public sitemap');
assert.equal(readFileSync('dist/robots.txt','utf8'),'User-agent: *\nDisallow: /\n');
for(const [file,hash] of Object.entries(release.files))assert.equal(createHash('sha256').update(readFileSync('dist/'+file)).digest('hex'),hash);
for(const file of ['index.html','info.html','en/index.html','en/info.html']){
 const doc=parse(readFileSync('dist/'+file,'utf8')),nodes=[];
 function walk(n){nodes.push(n);for(const c of n.childNodes||[])walk(c)}walk(doc);
 const attr=(n,k)=>n.attrs?.find(a=>a.name===k)?.value;
 assert.equal(attr(nodes.find(n=>n.tagName==='html'),'lang'),file.startsWith('en/')?'en':'es');
 assert.ok(nodes.some(n=>n.tagName==='meta'&&attr(n,'name')==='robots'&&attr(n,'content')==='noindex,nofollow'));
 const path=file==='index.html'?'/':file==='en/index.html'?'/en/':'/'+file;
 assert.equal(attr(nodes.find(n=>n.tagName==='link'&&attr(n,'rel')==='canonical'),'href'),release.landingOrigin+path);
 for(const n of nodes.filter(n=>n.tagName==='a')){
  const href=attr(n,'href')||'';
  assert.ok(!href.startsWith('https://zenloth.tech'),'preview does not link to the production app');
  if(attr(n,'data-legal'))assert.equal(href,release.frontendOrigin+(file.startsWith('en/')?'':'/es')+'/'+attr(n,'data-legal'));
 }
}
console.log('PASS: exact preview environment, locales, metadata, legal destinations, excluded sitemap and content digests.');
