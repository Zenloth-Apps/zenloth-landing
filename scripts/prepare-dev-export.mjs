import { cpSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
// Keep preview links in the same authorized environment. Production sources
// retain their canonical customer URLs and are published in the documented order.
const environment = process.argv[2] || 'dev';
if (!['dev', 'staging'].includes(environment)) throw new Error('Only dev and staging exports are supported');
const frontendOrigin = environment === 'dev' ? 'https://d3cpf76wsm49vw.cloudfront.net' : 'https://d1agflgx6fkdor.cloudfront.net';
const landingOrigin = environment === 'staging' ? process.env.LANDING_STAGING_ORIGIN : 'https://info.zenloth.tech';
if (environment === 'staging' && !/^https:\/\/d[a-z0-9]+\.cloudfront\.net$/.test(landingOrigin || '')) throw new Error('Exact staging CloudFront origin required');
rmSync('dist',{recursive:true,force:true});
mkdirSync('dist/en',{recursive:true});
for(const file of ['index.html','info.html','en/index.html','en/info.html']){
 const html=readFileSync(file,'utf8').replaceAll('https://info.zenloth.tech', landingOrigin).replace(/href="https:\/\/zenloth\.tech(?=["/?#])/g, 'href="'+frontendOrigin).replace('</head>','<meta name="robots" content="noindex,nofollow"></head>');writeFileSync('dist/'+file,html);
}
cpSync('src','dist/src',{recursive:true});
writeFileSync('dist/robots.txt','User-agent: *\nDisallow: /\n');
writeFileSync('dist/404.html','<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Page not found | Zenloth</title><meta name="robots" content="noindex,nofollow"></head><body><main><h1>Page not found</h1><p lang="es">Página no encontrada.</p><a href="/">Zenloth</a></main></body></html>');
const files = Object.fromEntries(['index.html','info.html','en/index.html','en/info.html','robots.txt','404.html'].map(file => [file, createHash('sha256').update(readFileSync('dist/'+file)).digest('hex')]));
writeFileSync('dist/release.json',JSON.stringify({revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),environment,frontendOrigin,landingOrigin,files})+'\n');
