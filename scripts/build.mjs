import {mkdir,readFile,writeFile,cp,rm,readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import QRCode from 'qrcode';
const root=new URL('../',import.meta.url),source=new URL('src/',root);
if(!existsSync(new URL('assets/motion/manifest.json',source)))execFileSync('python3',['scripts/unpack-assets.py'],{cwd:root,stdio:'inherit'});
const outputName=process.env.BUILD_OUTPUT_DIR||'dist';
if(!['dist','pages-dist'].includes(outputName))throw Error('Unsupported build directory');
const dist=new URL(outputName+'/',root);
const rawBase=process.env.SITE_BASE_PATH||'';
const base=rawBase?'/'+rawBase.replace(/^\/+|\/+$/g,''):'';
if(base&&!/^\/[A-Za-z0-9_-]+$/.test(base))throw Error('Invalid site prefix');
const publicUrl=(process.env.PUBLIC_SITE_URL||'https://eneias-burguer-previa-thiago.thiagochristen1209.chatgpt.site').replace(/\/$/,'');
const prefix=text=>base?text.replace(/(["'`])\/(?=[A-Za-z0-9$#?]|["'`])/g,(_,quote)=>quote+base+'/'):text;
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
await cp(new URL('assets/',source),new URL('assets/',dist),{recursive:true});
// JSON manifests contain paths consumed by the player, so they need the same namespace.
async function namespaceJson(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const url=new URL(entry.name+(entry.isDirectory()?'/':''),dir);if(entry.isDirectory())await namespaceJson(url);else if(entry.name.endsWith('.json'))await writeFile(url,prefix(await readFile(url,'utf8')))}}
await namespaceJson(new URL('assets/',dist));
for(const [name,path] of [['menu-qr','/cardapio/'],['table-04-qr','/cardapio/?mesa=04'],['review-qr','/avaliar/']]){
 const target=publicUrl+path;
 const svg=await QRCode.toString(target,{type:'svg',errorCorrectionLevel:'M',margin:4,color:{dark:'#17120d',light:'#fffaf0'}});
 await writeFile(new URL('assets/'+name+'.svg',dist),svg);
}
await writeFile(new URL('assets/qr-destinations.json',dist),JSON.stringify({menu:publicUrl+'/cardapio/',table04:publicUrl+'/cardapio/?mesa=04',review:publicUrl+'/avaliar/'},null,2));
const allCss=(await Promise.all(['base','brand','routes','vendor-motion','ember','interactive','immersive'].map(x=>readFile(new URL(`shared/${x}.css`,source),'utf8')))).join('\n');
const imports=[...allCss.matchAll(/@import\s+url\([^)]*\)\s*;/g)].map(x=>x[0]).join('\n');
await writeFile(new URL('styles.css',dist),prefix(imports+'\n'+allCss.replace(/@import\s+url\([^)]*\)\s*;/g,'')));
await writeFile(new URL('shared/catalog.js',source),'const catalogProducts='+await readFile(new URL('shared/catalog.json',source),'utf8')+';\n');
const scripts=['shared/catalog','shared/core','shared/ui','shared/menu','shared/orders','apps/catalog','apps/menu','apps/orders','apps/pos','apps/waiter','apps/proposal','shared/interactive','shared/frame-sequence','shared/motion','shared/bootstrap'];
await writeFile(new URL('app.js',dist),prefix((await Promise.all(scripts.map(x=>readFile(new URL(x+'.js',source),'utf8')))).join('\n;\n')));
const pages=[['','catalog','Enéias Burguer · Artesanais em Pinhais'],['cardapio','menu','Cardápio digital · Enéias Burguer'],['pedidos','orders','Seu pedido · Enéias Burguer'],['gerenciamento','pos','Gerenciamento · Enéias Burguer'],['caixa','pos','Caixa · Enéias Burguer'],['garcom','waiter','Salão · Enéias Burguer'],['proposta','proposal','Kit digital · Enéias Burguer'],['avaliar','reviews','Sua experiência · Enéias Burguer']];
for(const [path,app,title] of pages){
 const dir=new URL(path?path+'/':'./',dist);await mkdir(dir,{recursive:true});
 const nav=['pos','waiter'].includes(app)?'<nav class="team-nav"><a href="/proposta/">Apresentação</a><a href="/gerenciamento/">Gerenciamento</a><a href="/garcom/">Salão</a><a href="/pedidos/?mesa=04" target="_blank">Simular mesa 04 ↗</a><a href="/pedidos/" target="_blank">Simular delivery ↗</a></nav>':'';
 await writeFile(new URL('index.html',dir),prefix(`<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#080808"><meta name="robots" content="noindex,nofollow"><meta name="description" content="Enéias Burguer: apresentação, cardápio digital, pedidos e gerenciamento demonstrativo."><title>${title}</title><link rel="stylesheet" href="/styles.css"></head><body data-app="${app}"><a href="#app" class="skip-link">Ir para o conteúdo</a>${nav}<main id="app"></main><div id="overlay-root"></div><div id="toast" role="status" aria-live="polite"></div><script src="/app.js" defer></script></body></html>`));
}
await writeFile(new URL('.nojekyll',dist),'');
console.log(`Build: ${pages.length} páginas · prefixo ${base||'/'} · saída ${outputName}`);
