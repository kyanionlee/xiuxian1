/* ================================================================
   v1.6.2 主动大招（Claude）
   每个主修一个手动释放的大招：电脑 Q 键，手机点「大招」按钮。
   开战 8 秒后可用，冷却 40 秒（冷却缩减有效，最低 24 秒）；释放瞬间无敌 0.6 秒。
   伤害随境界与章节成长（ultBase），学会的本职业技能越多越强（每个主动技能 +6%）。
   ================================================================ */
const ULT = { pet:0, cd:40, minCd:24, first:8, inv:0.6, t:0, ready:false };
document.head.insertAdjacentHTML('beforeend', `<style id="ult-style">
#advance #ult-btn{margin:0 8px 0 0;min-height:44px;width:108px;padding:7px 6px;font-size:13px!important;line-height:1.3;border-radius:12px;background:#5a2a1ced;color:#ffe9b8;border:1px solid #e6c879;box-shadow:0 2px 8px #0004}
#advance #ult-btn.ready{background:#8a3a1c;box-shadow:0 0 12px #ffb34799;animation:ultPulse 1.2s infinite}
#advance #ult-btn:disabled{opacity:.6}
@keyframes ultPulse{50%{box-shadow:0 0 20px #ffb347cc}}
</style>`);
function ultBase(){
  const ch = STAGE ? STAGE.ch : 0, act = Object.keys(P.sk || {}).filter(k => SK[k] && SK[k].cat !== 'p').length;
  return (18 + 2.2 * (P.lvl || 1)) * (1 + 0.9 * ch) * (1 + 0.06 * act);
}
const ULTS = {
  jian:  { name:'万剑归宗', desc:'向四周放出 16 道剑气，再落下一圈剑雨' },
  fa:    { name:'天火焚城', desc:'六颗陨火砸向妖群，落点留下火海' },
  ti:    { name:'金刚伏魔', desc:'震碎周身妖物并定身，获得大量护盾' },
  hun:   { name:'百鬼夜行', desc:'冥火吞噬大范围妖物，减速并按伤害回血' },
  yue:   { name:'十面埋伏', desc:'连续三圈音浪向外扩散，击退并重创妖物' },
  array: { name:'周天大阵', desc:'以自身为阵心，八方雷落并定身阵中妖物' },
  fu:    { name:'五雷轰顶', desc:'十道天雷劈向最近的妖物' },
  yushou:{ name:'万兽奔腾', desc:'灵兽狂暴 8 秒（伤害 ×1.8），并震退周围妖物' },
  kuilei:{ name:'机关城',   desc:'傀儡狂暴 8 秒（伤害 ×1.8），自身获得护盾' },
  du:    { name:'万毒归宗', desc:'剧毒覆盖大范围妖物，持续重创并减速' },
};
function ultCd(){ return Math.max(ULT.minCd, ULT.cd * (P && P.st ? P.st.cdMul : 1)); }
function castUlt(){
  const s = STAGE; if (state !== 'play' || !s || s.done || !P) return;
  if (ULT.t > 0) return toast(`大招冷却中：${Math.ceil(ULT.t)} 秒`);
  const cls = P.cls in ULTS ? P.cls : 'jian', U = ULTS[cls], base = ultBase(), area = P.st.area;
  ULT.t = ultCd(); P.inv = Math.max(P.inv || 0, ULT.inv);
  banner(U.name); try { sfx('evo'); } catch (e) {} shake = Math.max(shake || 0, 8);
  const ring = (r, dur = 0.6) => fx.push({ k:'ring', x:P.x, y:P.y, r, t:0, dur });
  const near = (n, R) => enemies.filter(e => !e.dead && d2(e, P) < R * R).sort((a, b) => d2(a, P) - d2(b, P)).slice(0, n);
  if (cls === 'jian'){
    for (let i = 0; i < 16; i++){ const a = i / 16 * Math.PI * 2; line(P.x, P.y, a, 420 * area, 18, base * 1.4, 120, 'w'); fx.push({ k:'thrust', x:P.x, y:P.y, a, len:420 * area, w:18, t:0, dur:0.35 }); }
    for (let i = 0; i < 8; i++){ const a = i / 8 * Math.PI * 2; strikes.push({ k:'thunder', x:P.x + Math.cos(a) * 170 * area, y:P.y + Math.sin(a) * 170 * area, r:80 * area, dmg:base * 1.2, t:0, delay:0.5, cat:'w', stun:false }); }
  } else if (cls === 'fa'){
    const tg = near(6, 520); while (tg.length < 6) tg.push({ x:P.x + rand(-260, 260), y:P.y + rand(-200, 200) });
    tg.forEach((e, i) => { strikes.push({ k:'thunder', x:e.x, y:e.y, r:95 * area, dmg:base * 2.2, t:0, delay:0.45 + i * 0.12, cat:'g', stun:false }); zones.push({ x:e.x, y:e.y, r:70 * area, t:0, dur:3, tick:0, dmg:base * 0.25 }); });
  } else if (cls === 'ti'){
    const r = 230 * area; aoe(P.x, P.y, r, base * 2, 320, 'w', { stun:1.4 }); ring(r); ring(r * 0.6, 0.45);
    addShield(P.st.maxHp * 0.35, 0);
  } else if (cls === 'hun'){
    const r = 300 * area; let tot = 0;
    for (const e of enemies) if (!e.dead && d2(e, P) < r * r){ const h = e.hp; hit(e, base * 1.6, P.x, P.y, 60, 'g', { slow:3 }); tot += Math.max(0, h - Math.max(0, e.hp)); }
    heal(Math.min(P.st.maxHp * 0.3, tot * 0.15), true); ring(r, 0.8);
  } else if (cls === 'yue'){
    [0, 0.35, 0.7].forEach((dl, i) => setTimeout(() => { if (state !== 'play' || STAGE !== s) return; const r = (160 + i * 90) * area; aoe(P.x, P.y, r, base * 1.1, 260, 'g', { slow:1.5 }); ring(r, 0.5); }, dl * 1000));
  } else if (cls === 'array'){
    const r = 260 * area; aoe(P.x, P.y, r, base * 0.6, 40, 'g', { stun:1.8 }); ring(r, 0.9);
    for (let i = 0; i < 8; i++){ const a = i / 8 * Math.PI * 2; strikes.push({ k:'seal', x:P.x + Math.cos(a) * r * 0.6, y:P.y + Math.sin(a) * r * 0.6, r:90 * area, dmg:base * 1.5, t:0, delay:0.6, cat:'g', stun:true }); }
  } else if (cls === 'fu'){
    const tg = near(10, 600); tg.forEach((e, i) => strikes.push({ k:'thunder', x:e.x, y:e.y, r:70 * area, dmg:base * 2, t:0, delay:0.25 + i * 0.08, cat:'g', stun:true }));
    if (!tg.length) ring(200 * area);
  } else if (cls === 'yushou' || cls === 'kuilei'){
    FLOW.frenzyT = Math.max(FLOW.frenzyT || 0, 8); ULT.pet = 8; recalc();
    const r = 200 * area; aoe(P.x, P.y, r, base * 0.8, 280, 'g'); ring(r);
    if (cls === 'kuilei') addShield(P.st.maxHp * 0.25, 0);
  } else if (cls === 'du'){
    const r = 320 * area; for (const e of enemies) if (!e.dead && d2(e, P) < r * r) applyPoison(e, base * 0.45, 6);
    aoe(P.x, P.y, r, base * 0.7, 40, 'g', { slow:3 }); ring(r, 0.8);
  }
  try { captureBattle(); } catch (e) {}
  hud();
}
// 灵兽 / 傀儡大招：狂暴期间额外 ×1.125（与万灵齐啸的 ×1.6 相乘约 ×1.8）
const _recalcUlt = recalc;
recalc = function(...a){ const r = _recalcUlt(...a); try { if (P && ULT.pet > 0) P.st.petMul *= 1.125; } catch (e) {} return r; };
advanceEl.insertAdjacentHTML('afterbegin', '<button class="btn" id="ult-btn">大招 [Q]</button>');
const ultBtn = document.getElementById('ult-btn');
ultBtn.addEventListener('click', () => { try { audioInit(); } catch (e) {} castUlt(); });
document.addEventListener('keydown', e => { if (e.code === 'KeyQ' && state === 'play' && !e.repeat){ e.preventDefault(); castUlt(); } });
const _startUlt = startStage;
startStage = function(...a){ const r = _startUlt(...a); ULT.t = ULT.first; ULT.pet = 0; return r; };
const _updUlt = update;
update = function(dt, ...a){
  const r = _updUlt(dt, ...a);
  if (state === 'play'){
    if (ULT.t > 0) ULT.t = Math.max(0, ULT.t - dt);
    if (ULT.pet > 0){ ULT.pet -= dt; if (ULT.pet <= 0){ ULT.pet = 0; recalc(); } }
  }
  return r;
};
const _hudUlt = hud;
hud = function(...a){
  const r = _hudUlt(...a);
  try {
    if (!ultBtn || !P) return r;
    const U = ULTS[P.cls] || ULTS.jian, ready = ULT.t <= 0 && STAGE && !STAGE.done;
    ultBtn.textContent = ready ? `${U.name} [Q]` : `${U.name} ${Math.ceil(ULT.t)}s`;
    ultBtn.classList.toggle('ready', !!ready); ultBtn.disabled = !ready; ultBtn.title = U.desc;
  } catch (e) {}
  return r;
};
// 技能树顶部说明本职业大招
const _showTreeUlt = showTree;
showTree = function(...a){
  const r = _showTreeUlt(...a);
  try { const U = ULTS[P.cls]; const h = overlay.querySelector('.panel h2'); if (U && h) h.insertAdjacentHTML('afterend', `<section class="flow-panel"><p><b>主动大招 · ${U.name}</b>　${U.desc}。电脑按 Q，手机点战斗右下的大招按钮；冷却 ${Math.round(ultCd())} 秒，释放瞬间无敌。</p></section>`); } catch (e) {}
  return r;
};
