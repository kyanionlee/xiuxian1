const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'..');let h=fs.readFileSync(path.join(__dirname,'base/ver6.html'),'utf8');
function patch(a,b){if(!h.includes(a))throw Error('Missing '+a.slice(0,90));h=h.replace(a,b);}
patch('<body>','<body>\n'+fs.readFileSync(path.join(__dirname,'boot.html'),'utf8'));
patch("readTheme(); darkMQ.addEventListener('change', readTheme);","readTheme(); if(darkMQ.addEventListener)darkMQ.addEventListener('change',readTheme);else if(darkMQ.addListener)darkMQ.addListener(readTheme);");
patch('山 海 纪 · 同行篇','山 海 纪 · 战斗传承篇 v1.3.0');
patch('全新交互奇遇','地域奇遇');
// The journey extension used the same name as the original skill reward function.
const j=h.indexOf('/* 山海同行:');h=h.slice(0,j)+h.slice(j).replace(/\bgrant\(/g,'grantSupply(');
patch("const SHANHAI_VERSION = '1.2.0';",fs.readFileSync(path.join(__dirname,'trees.js'),'utf8')+"\nconst SHANHAI_VERSION = '1.3.0';");
patch("const lv = k => (P && P.sk[k]) || 0;","const lv = k => (P && (P.sk[k] || P.sk[P.cls+'_'+k])) || 0;");
patch("if (dP > far && !e.boss && !e.elite)","if (dP > far && !e.toCore && !e.boss && !e.elite)");
patch("if(e.boss&&e.cc<.6&&e.charge<=0)","if(e.boss&&!e.bossV7&&e.cc<.6&&e.charge<=0)");
patch('c.globalAlpha=.43;c.fillStyle=terrainPatterns[scene]','c.globalAlpha=settings.clearBattle?.2:.43;c.fillStyle=terrainPatterns[scene]');
patch('c.globalAlpha=.82;c.drawImage(sceneryArt','c.globalAlpha=settings.clearBattle?.28:.82;c.drawImage(sceneryArt');
patch('for (const b of ebullets){ c.globalAlpha = 0.3; c.fillStyle = C.violet;', 'for (const b of ebullets){ c.globalAlpha = 0.3; c.fillStyle = b.color || C.violet;');
patch('if(s.clock>=s.hazardAt){','if(s.clock>=s.hazardAt&&!enemies.some(e=>e.bossV7&&!e.dead)){');
patch("for (const t of texts){ c.globalAlpha = 1 - t.t / 0.7; c.fillStyle = t.heal ? C.jade : t.crit ? C.gold : C.ink; if (t.crit) c.font = '700 16px \"Noto Serif SC\", serif'; c.fillText(t.v, t.x, t.y - t.t * 30); if (t.crit) c.font = '700 13px \"Noto Serif SC\", serif'; }","for(const t of texts)drawDamageV7(t);");
patch('showTitle();\nrequestAnimationFrame(frame);',fs.readFileSync(path.join(__dirname,'combat.js'),'utf8')+'\nshowTitle();\nrequestAnimationFrame(frame);');
patch('</style>',['style.css','readability.css'].map(f=>fs.readFileSync(path.join(__dirname,f),'utf8')).join('\n')+'\n</style>');
patch('showTitle();\nrequestAnimationFrame(frame);',['guide.js','ux.js'].map(f=>fs.readFileSync(path.join(__dirname,f),'utf8')).join('\n')+'\nshowTitle();\nwindow.gameBootReady();\nrequestAnimationFrame(frame);');
patch("const SHANHAI_VERSION = '1.3.0';","const SHANHAI_VERSION = '1.4.0';");
patch('战斗传承篇 v1.3.0','问道篇 v1.4.0');
patch('showTitle();\nwindow.gameBootReady();',fs.readFileSync(path.join(__dirname,'karma.js'),'utf8')+'\nshowTitle();\nwindow.gameBootReady();');
// v1.5.0 配乐模块（Claude）：放在 karma.js 之后，曲目文件在仓库 assets/music/。
patch('showTitle();\nwindow.gameBootReady();',fs.readFileSync(path.join(__dirname,'music.js'),'utf8')+'\nshowTitle();\nwindow.gameBootReady();');
patch("const SHANHAI_VERSION = '1.4.0';","const SHANHAI_VERSION = '1.5.0';");
patch('问道篇 v1.4.0','问道篇 v1.5.0');
// v1.5.1 修复（Claude）：召唤数量逐重增长、页面重绘保留滚动与折叠状态。
patch('showTitle();\nwindow.gameBootReady();',fs.readFileSync(path.join(__dirname,'fixes.js'),'utf8')+'\nshowTitle();\nwindow.gameBootReady();');
patch("const SHANHAI_VERSION = '1.5.0';","const SHANHAI_VERSION = '1.5.1';");
patch('问道篇 v1.5.0','问道篇 v1.5.1');
patch('const ARTX = {};',fs.readFileSync(path.join(__dirname,'assets.js'),'utf8')+'\nconst ARTX = {};');
patch('  im.src = src; return im;','  deferBattleArt(im,src); return im;');
for(const name of ['spriteAtlas','monsterArt','terrainArt','sceneryArt']){
  const re=new RegExp(name+"\\.src='(assets/[^']+)';");
  if(!re.test(h))throw Error('Missing external art '+name);
  h=h.replace(re,(_,url)=>`deferBattleArt(${name},'${url}');`);
}
patch('function startStage(node){','function startStage(node){\nloadBattleArt();');
if(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]{100}/.test(h))throw Error('Embedded image in output');
for(const match of h.matchAll(/assets\/[a-z0-9-]+\.webp/g))if(!fs.existsSync(path.join(root,match[0])))throw Error('Missing '+match[0]);
const icons=fs.readFileSync(path.join(__dirname,'icons.js'),'utf8').replace('__ICON_MANIFEST__',JSON.stringify(JSON.parse(fs.readFileSync(path.join(__dirname,'icon-manifest.json'),'utf8'))));
patch('showTitle();\nwindow.gameBootReady();',icons+'\nshowTitle();\nwindow.gameBootReady();');
h=h.replaceAll('${s.icon}','${skillIcon(s)}').replaceAll('${itemGlyph(it)}','${itemArt(it)}').replaceAll('${mapIcon(n.type,x,y)}','${paintedMapIcon(n.type,x,y)}');
patch('<h3>${it.icon} · ${it.name}</h3>','<h3>${iconMarkup("supply_"+k,it.icon)} ${it.name}</h3>');
patch('<h3>${SK[k].name}</h3>','<h3>${skillIcon(SK[k])} ${SK[k].name}</h3>');
patch('</style>',fs.readFileSync(path.join(__dirname,'icons.css'),'utf8')+'\n</style>');
for(const url of Object.values(JSON.parse(fs.readFileSync(path.join(__dirname,'icon-manifest.json'),'utf8'))))if(!fs.existsSync(path.join(root,url)))throw Error('Missing icon '+url);
fs.writeFileSync(path.join(root,'index.html'),h);console.log('Built',Buffer.byteLength(h));
