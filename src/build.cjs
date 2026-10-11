const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'..');let h=fs.readFileSync(path.join(__dirname,'base/ver6.html'),'utf8');
function patch(a,b){if(!h.includes(a))throw Error('Missing '+a.slice(0,90));h=h.replace(a,b);}
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
patch('</style>',fs.readFileSync(path.join(__dirname,'style.css'),'utf8')+'\n</style>');
const art=path.join(__dirname,'assets/npc-portraits.webp');h=h.replace('__NPC_PORTRAITS__','data:image/webp;base64,'+fs.readFileSync(art).toString('base64'));
fs.writeFileSync(path.join(root,'index.html'),h);console.log('Built',Buffer.byteLength(h));
