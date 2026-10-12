
/* ================================================================
   v1.6.0 轻功（Claude）
   电脑按空格，手机双击屏幕：朝移动方向短距离冲刺，起步瞬间无敌。
   次数、无敌时间、距离、回复速度随境界成长；高品质云履与轮回殿「凌波」可再提升。
   ================================================================ */
const QG = { lastTapUp:0, lastTapX:0, lastTapY:0, down:null, fx:[] };
const QG_DUR = 0.13;
UPS.lingbo = { name:'凌波', max:1, base:400, tier:2, eff:() => '轻功次数 +1，轻功无敌时间 +0.04 秒' };
function qgStats(){
  const tier = Math.min(5, realmTier(P.lvl)), meta = upLv('lingbo'), boots = P.eq && P.eq.boots;
  const bootIf = boots ? (boots.rar >= 4 ? 0.08 : boots.rar >= 3 ? 0.04 : 0) : 0;
  return {
    charges:Math.min(3, 1 + (tier >= 2 ? 1 : 0) + (tier >= 4 ? 1 : 0) + (meta ? 1 : 0)),
    iframe:Math.min(0.3, 0.10 + 0.04 * Math.min(tier, 3) + bootIf + (meta ? 0.04 : 0)),
    dist:110 + 6 * tier,
    cd:Math.max(2.0, 3.2 - 0.24 * tier),
  };
}
function qgState(){ const s = qgStats(); P.qg ||= { c:s.charges, t:0 }; if (P.qg.c > s.charges) P.qg.c = s.charges; return s; }
function qgDash(){
  if (state !== 'play' || !P || !STAGE) return false;
  const s = qgState();
  if (P.dash && P.dash.t < P.dash.dur) return false;
  if (P.qg.c <= 0){ texts.push({ x:P.x, y:P.y - 30, v:'轻功回复中', t:0 }); return false; }
  const v = inputVec(), a = (v.x || v.y) ? Math.atan2(v.y, v.x) : (P.faceA || 0);
  P.dash = { t:0, dur:QG_DUR, vx:Math.cos(a) * s.dist / QG_DUR, vy:Math.sin(a) * s.dist / QG_DUR, a };
  P.qg.c--; P.inv = Math.max(P.inv, s.iframe);
  try { sfx('wind'); } catch (e) {}
  if (!META.qgUsed){ META.qgUsed = true; try { persist(); } catch (e) {} }
  return true;
}
const _updateQG = update;
update = function(dt){
  _updateQG(dt);
  if (state !== 'play' || !P || !STAGE) return;
  const s = qgState();
  if (P.qg.c < s.charges){ P.qg.t += dt; if (P.qg.t >= s.cd){ P.qg.t = 0; P.qg.c++; } } else P.qg.t = 0;
  const d = P.dash;
  if (d && d.t < d.dur){
    const k = Math.min(dt, d.dur - d.t); P.x += d.vx * k; P.y += d.vy * k; d.t += dt;
    QG.fx.push({ x:P.x, y:P.y, t:0, dur:0.25, a:d.a });
  }
  for (const f of QG.fx) f.t += dt;
  QG.fx = QG.fx.filter(f => f.t < f.dur);
  qgHud(s);
};
const _startStageQG = startStage;
startStage = function(node){
  if (P){ P.dash = null; P.qg = null; }
  QG.fx = [];
  const r = _startStageQG(node);
  try {
    qgState();
    if (!META.qgUsed && state === 'play') setTimeout(() => { if (state === 'play') banner(matchMedia('(pointer: coarse)').matches ? '双击屏幕 · 施展轻功' : '按空格 · 施展轻功'); }, 2600);
  } catch (e) {}
  return r;
};

/* —— 输入：空格 / 双击 —— */
addEventListener('keydown', e => {
  if (e.code !== 'Space' || state !== 'play') return;
  e.preventDefault(); if (!e.repeat) qgDash();
}, true);
addEventListener('keyup', e => { if (e.code === 'Space' && state === 'play') e.preventDefault(); }, true);
cvs.addEventListener('pointerdown', e => {
  if (state !== 'play') return;
  const now = performance.now();
  if (now - QG.lastTapUp < 300 && Math.hypot(e.clientX - QG.lastTapX, e.clientY - QG.lastTapY) < 70){ QG.lastTapUp = 0; qgDash(); }
  QG.down = { t:now, x:e.clientX, y:e.clientY, id:e.pointerId };
}, true);
cvs.addEventListener('pointerup', e => {
  const d = QG.down; if (!d || d.id !== e.pointerId) return;
  const now = performance.now();
  if (now - d.t < 230 && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 16){ QG.lastTapUp = now; QG.lastTapX = e.clientX; QG.lastTapY = e.clientY; }
  QG.down = null;
}, true);

/* —— 界面：次数显示与残影 —— */
function qgHud(s){
  let el = document.getElementById('qg-pips');
  if (!el){
    const bar = document.getElementById('hpbar'); if (!bar) return;
    bar.insertAdjacentHTML('afterend', '<span id="qg-pips" style="font-size:12px;letter-spacing:1px;color:#80c8ec;white-space:nowrap;pointer-events:none"></span>');
    el = document.getElementById('qg-pips');
  }
  const full = P.qg.c, prog = full < s.charges ? Math.floor(P.qg.t / s.cd * 100) : 100;
  const txt = '轻功 ' + '◆'.repeat(full) + '◇'.repeat(s.charges - full) + (full < s.charges ? ' ' + prog + '%' : '');
  if (el.textContent !== txt) el.textContent = txt;
}
const _drawWorldQG = drawPhase1World;
drawPhase1World = function(){
  _drawWorldQG();
  const c = ctx;
  for (const f of QG.fx){
    const k = f.t / f.dur;
    c.globalAlpha = 0.35 * (1 - k); c.fillStyle = '#80c8ec';
    c.beginPath(); c.ellipse(f.x, f.y - 4, 9, 15, 0, 0, 7); c.fill();
    c.globalAlpha = 0.5 * (1 - k); c.strokeStyle = '#e6f6ff'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(f.x, f.y); c.lineTo(f.x - Math.cos(f.a) * 26, f.y - Math.sin(f.a) * 26); c.stroke();
  }
  c.globalAlpha = 1;
};
