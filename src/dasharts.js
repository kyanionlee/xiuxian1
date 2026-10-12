
/* ================================================================
   v1.6.0 轻功联动（Claude）
   职业轻功：学会本职业核心技能后自动激活，技能重数越高、进化后越强。
   云履轻功词条：宝品以上云履可能带，神品必带；可与职业轻功叠加。
   ================================================================ */
const SUMMON_KEYS = () => Object.keys(SK).filter(k => SK[k].summon);
const DASH_ARTS = {
  jian:   { need:['sword'], name:'剑气穿行', desc:'冲刺路径上的妖物全部受到剑气伤害' },
  fa:     { need:['ice', 'wind'], name:'寒霜步', desc:'冲刺路径结霜，妖物受伤并减速 2 秒' },
  ti:     { need:['fist', 'staff'], name:'崩山落', desc:'落地时震荡周围，造成伤害并短暂定身' },
  hun:    { need:['banner', 'drain'], name:'噬魂步', desc:'吸取穿过的妖物，造成伤害并回复气血' },
  yue:    { need:['sonic'], name:'惊弦', desc:'起步时奏出一圈音波，伤害并减速周围妖物' },
  array:  { need:['zhenpan'], name:'阵步', desc:'在起步处留下一座小阵盘，减速并持续伤害' },
  fu:     { need:['fire', 'zhenyao'], name:'遁符', desc:'起步处留下两道爆符，片刻后炸开' },
  yushou: { need:null, name:'唤灵', desc:'所有召唤物立即出击，并跟随你到落点' },
  kuilei: { need:['muku', 'tieku', 'nuku', 'huoku', 'zhizhu'], name:'替身傀', desc:'起步处留下一具替身傀儡，片刻后自爆' },
  du:     { need:['dart', 'miasma', 'gu', 'rot'], name:'毒影', desc:'冲刺路径上的妖物全部中毒' },
};
const DASH_FX = {
  pierce: { name:'穿影', desc:'冲刺路径上的妖物受到伤害' },
  burn:   { name:'焰踪', desc:'冲刺路径留下灼烧的火焰' },
  shield: { name:'护体', desc:'每次轻功后获得 6% 气血的护盾' },
  refund: { name:'回风', desc:'30% 几率不消耗轻功次数' },
};
function dashArt(){
  const a = P && DASH_ARTS[P.cls]; if (!a) return null;
  const need = a.need || SUMMON_KEYS();
  const lvl = Math.max(0, ...need.map(k => P.sk[k] || 0)); if (!lvl) return null;
  return Object.assign({ lvl, ev:need.some(k => P.evo[k]), cls:P.cls }, a);
}
const dashBase = () => Math.max(P.eq.weapon ? weaponDmg(P.eq.weapon) : 10, 12 + P.lvl * 1.5);
function pathEnemies(sx, sy, ex, ey, w){
  const dx = ex - sx, dy = ey - sy, L2 = dx * dx + dy * dy || 1;
  return enemies.filter(e => {
    if (e.dead) return false;
    const t = Math.max(0, Math.min(1, ((e.x - sx) * dx + (e.y - sy) * dy) / L2));
    return (e.x - sx - dx * t) ** 2 + (e.y - sy - dy * t) ** 2 < (w + e.r) ** 2;
  });
}
const DASH_TIMERS = [];
function dashStart(sx, sy){
  const art = dashArt(), base = dashBase(), A = P.st.area;
  if (!art) return;
  const f = (0.8 + 0.2 * art.lvl) * (art.ev ? 1.6 : 1);
  if (art.cls === 'yue'){ aoe(sx, sy, 110 * A, base * 0.6 * f, 160, 'g', { slow:1.5 }); fx.push({ k:'notes', x:sx, y:sy, r:110 * A, t:0, dur:0.6, seed:Math.random() * 9 }); }
  if (art.cls === 'array'){ STAGE.fz = STAGE.fz || []; STAGE.fz.push({ x:sx, y:sy, r:85 * A, t:0, dur:2.5, dmg:base * 0.3 * f, tick:0, stunT:0, stun:art.ev }); }
  if (art.cls === 'fu') for (let i = 0; i < 2; i++){ const x = sx + rand(-22, 22), y = sy + rand(-22, 22); DASH_TIMERS.push({ t:0.55, x, y, k:'fu', fn:() => explode(x, y, 60 * A, base * 1.0 * f, 'g') }); }
  if (art.cls === 'kuilei'){ DASH_TIMERS.push({ t:0.7, x:sx, y:sy, k:'kuilei', fn:() => { explode(sx, sy, 85 * A, base * 1.4 * f, 'w'); shake = Math.max(shake, 4); } }); }
  if (art.cls === 'yushou') for (const a of SUMS) a.cd = 0;
}
function dashEnd(sx, sy, ex, ey){
  const art = dashArt(), base = dashBase(), A = P.st.area, boots = P.eq.boots, dfx = boots && boots.dashFx;
  const ang = Math.atan2(ey - sy, ex - sx), len = Math.hypot(ex - sx, ey - sy);
  if (art){
    const f = (0.8 + 0.2 * art.lvl) * (art.ev ? 1.6 : 1);
    if (art.cls === 'jian'){ for (const e of pathEnemies(sx, sy, ex, ey, 22)) hit(e, base * 1.2 * f, sx, sy, 60, 'w'); fx.push({ k:'thrust', x:sx, y:sy, a:ang, len, w:16, t:0, dur:0.25 }); }
    if (art.cls === 'fa') for (const e of pathEnemies(sx, sy, ex, ey, 26)) hit(e, base * 0.5 * f, sx, sy, 20, 'g', { slow:2 });
    if (art.cls === 'du') for (const e of pathEnemies(sx, sy, ex, ey, 26)){ hit(e, base * 0.2 * f, sx, sy, 10, 'g'); applyPoison(e, base * 0.4 * f, 4); }
    if (art.cls === 'hun'){ const hs = pathEnemies(sx, sy, ex, ey, 24); for (const e of hs) hit(e, base * 0.7 * f, sx, sy, 30, 'g'); heal(P.st.maxHp * 0.015 * Math.min(5, hs.length), true); }
    if (art.cls === 'ti'){ aoe(ex, ey, 90 * A, base * 1.3 * f, 200, 'w', { stun:0.5 }); fx.push({ k:'slam', x:ex, y:ey, r:90 * A, t:0, dur:0.35 }); shake = Math.max(shake, 5); }
    if (art.cls === 'yushou') for (const a of SUMS){ a.x = ex + rand(-40, 40); a.y = ey + rand(-40, 40); a.cd = 0; }
  }
  if (dfx === 'pierce') for (const e of pathEnemies(sx, sy, ex, ey, 22)) hit(e, base * 0.8, sx, sy, 40, 'w');
  if (dfx === 'burn') for (let i = 1; i <= 3; i++) zones.push({ x:sx + (ex - sx) * i / 3, y:sy + (ey - sy) * i / 3, r:34 * A, t:0, dur:2, tick:0, dmg:base * 0.25 });
  if (dfx === 'shield') addShield(P.st.maxHp * 0.06, 0);
  if (dfx === 'refund' && Math.random() < 0.3){ const s = qgStats(); if (P.qg.c < s.charges){ P.qg.c++; texts.push({ x:P.x, y:P.y - 30, v:'回风', t:0, heal:true }); } }
}
const _qgDashArts = qgDash;
qgDash = function(){
  const sx = P ? P.x : 0, sy = P ? P.y : 0, ok = _qgDashArts();
  if (ok){ P.dash.sx = sx; P.dash.sy = sy; try { dashStart(sx, sy); } catch (e) {} }
  return ok;
};
const _updateArts = update;
update = function(dt){
  _updateArts(dt);
  if (state !== 'play' || !P || !STAGE) return;
  const d = P.dash;
  if (d && d.sx != null && d.t >= d.dur && !d.ended){ d.ended = true; try { dashEnd(d.sx, d.sy, P.x, P.y); } catch (e) {} }
  for (let i = DASH_TIMERS.length - 1; i >= 0; i--){ const t = DASH_TIMERS[i]; t.t -= dt; if (t.t <= 0){ DASH_TIMERS.splice(i, 1); try { t.fn(); } catch (e) {} } }
};
const _startStageArts = startStage;
startStage = function(node){ DASH_TIMERS.length = 0; return _startStageArts(node); };
const _drawWorldArts = drawPhase1World;
drawPhase1World = function(){
  _drawWorldArts();
  const c = ctx;
  for (const t of DASH_TIMERS){
    c.globalAlpha = 0.6 + 0.4 * Math.sin(time * 20);
    if (t.k === 'fu'){ c.fillStyle = '#e6c879'; c.fillRect(t.x - 5, t.y - 8, 10, 16); c.fillStyle = '#c0392b'; c.fillRect(t.x - 1.5, t.y - 5, 3, 10); }
    else { c.fillStyle = '#9a6b3d'; c.fillRect(t.x - 5, t.y - 6, 10, 11); c.beginPath(); c.arc(t.x, t.y - 10, 4, 0, 7); c.fill(); c.fillStyle = '#ffd76a'; c.beginPath(); c.arc(t.x, t.y - 16, 2, 0, 7); c.fill(); }
  }
  c.globalAlpha = 1;
};

/* —— 云履轻功词条 —— */
const _genItemArts = genItem;
genItem = function(slot, rar, ch, type){
  const it = _genItemArts(slot, rar, ch, type);
  if (it && it.slot === 'boots' && it.rar >= 2 && (it.rar >= 4 || Math.random() < 0.5)) it.dashFx = pick(Object.keys(DASH_FX));
  return it;
};
const _itemLinesArts = itemLines;
itemLines = function(it){
  const out = _itemLinesArts(it);
  if (it && it.dashFx && DASH_FX[it.dashFx]) out.push(`<span class="r4">轻功·${DASH_FX[it.dashFx].name}：${DASH_FX[it.dashFx].desc}</span>`);
  return out;
};

/* —— 在技能树和功法面板写明当前的轻功联动 —— */
function dashArtNote(){
  const a = DASH_ARTS[P.cls]; if (!a) return '';
  const on = dashArt(), boots = P.eq.boots && P.eq.boots.dashFx && DASH_FX[P.eq.boots.dashFx];
  const needTxt = a.need ? a.need.map(k => SK[k] ? SK[k].name : k).join('或') : '任一召唤技能';
  return `<p class="help" style="text-align:left">轻功联动「${a.name}」：${a.desc}。${on ? `已激活（第 ${on.lvl} 重${on.ev ? '，已进化' : ''}）` : `学会${needTxt}后激活`}${boots ? `；云履「${boots.name}」：${boots.desc}` : ''}。</p>`;
}
for (const fn of ['showTree', 'showSkills']){
  if (typeof window[fn] !== 'function') continue;
  const orig = window[fn];
  window[fn] = function(...args){ const r = orig.apply(this, args); try { const h = overlay.querySelector('.panel .help') || overlay.querySelector('.panel .sub'); if (h && P) h.insertAdjacentHTML('afterend', dashArtNote()); } catch (e) {} return r; };
}
