
/* ================================================================
   v1.5.1 修复（Claude）
   1. 群体召唤每升一重都多 1 只；统御每重 +1（最多 3 重）；升级卡片写明「几只→几只」。
   2. 技能树、加点、行囊等页面重绘时，保留滚动位置与折叠区的展开状态。
   ================================================================ */
const SUMMON_EVERY_LEVEL = {
  wolfpack: { n:(l, ev) => ev ? 8 : 1 + l, dmg:(l, ev) => ev ? 30 : 7 + 3 * l },
  crows:    { n:(l, ev) => ev ? 7 : l,     dmg:(l, ev) => ev ? 26 : 7 + 3 * l },
  muku:     { n:(l, ev) => ev ? 7 : l,     dmg:(l, ev) => ev ? 36 : 10 + 4 * l },
  zhizhu:   { n:(l, ev) => ev ? 9 : 1 + l, dmg:(l, ev) => ev ? 14 : 4 + 2 * l },
  gu:       { n:(l, ev) => ev ? 8 : 1 + l, dmg:(l, ev) => ev ? 7 : 3 + 1.2 * l },
};
for (const [k, f] of Object.entries(SUMMON_EVERY_LEVEL)){
  if (!SK[k]) continue;
  const base = SK[k].stat;
  SK[k].stat = (l, ev) => Object.assign({}, base(l, ev), { n:f.n(l, ev), dmg:f.dmg(l, ev) });
}
const LEGION_MAX = 3;
const legionBonus = () => Math.min(LEGION_MAX, lv('legion'));
for (const k of Object.keys(SK)){
  const s = SK[k];
  if (k === 'legion' || s.sourcePassive === 'legion'){ s.max = LEGION_MAX; s.desc = () => '每个召唤技能的召唤数量 +1（每重 +1，最多 3 重）'; }
  if (s.summon && s.unit && ['melee', 'swarm', 'ranged'].includes(s.beh)){
    const first = s.desc;
    s.desc = function(l){
      if (l <= 1) return first.call(this, l);
      const a = this.stat(l - 1), b = this.stat(l), c = this.cnt || '只';
      return `${this.unit} ${a.n === b.n ? b.n : a.n + '→' + b.n} ${c}，伤害 ${Math.round(a.dmg)}→${Math.round(b.dmg)}`;
    };
  }
}
syncSummons = function(){
  const bonus = legionBonus();
  for (const k of Object.keys(SK)){
    if (!SK[k].summon) continue;
    const want = P.sk[k] ? Math.min(12, S(k).n + bonus) : 0;
    let cur = SUMS.filter(a => a.sk === k);
    if (cur.length > want){ const drop = new Set(cur.slice(want)); SUMS = SUMS.filter(a => !drop.has(a)); cur = cur.slice(0, want); }
    while (cur.length < want){
      const a = { sk:k, kind:SK[k].kind, i:cur.length, x:P.x + rand(-30, 30), y:P.y + rand(-30, 30), cd:rand(0, 0.6), t:Math.random() * 6, face:0, cool:0 };
      SUMS.push(a); cur.push(a); FXX.push({ k:'shieldup', x:a.x, y:a.y, t:0, dur:0.4 });
    }
  }
};

/* —— 同一页面重绘时保留滚动位置和折叠状态 —— */
const screenKey = () => state + '|' + ((overlay.querySelector('.panel h2') || {}).textContent || '');
const _showOverlayKeep = showOverlay;
showOverlay = function(html){
  const same = !overlay.hidden ? screenKey() : null;
  const panel = overlay.querySelector('.panel');
  const top = overlay.scrollTop, ptop = panel ? panel.scrollTop : 0;
  const open = [...overlay.querySelectorAll('details[open] > summary')].map(s => s.textContent);
  _showOverlayKeep(html);
  if (same && same === screenKey()){
    overlay.querySelectorAll('details > summary').forEach(s => { if (open.includes(s.textContent)) s.parentElement.open = true; });
    overlay.scrollTop = top;
    const p2 = overlay.querySelector('.panel'); if (p2) p2.scrollTop = ptop;
  }
};

/* —— 轮回殿 · 道果（高阶修习）：给大量轮回点提供长期用途 —— */
Object.assign(UPS, {
  suhui:   { name:'宿慧',     max:3,  base:150, tier:2, eff:l => `开局境界 +${2 * l} 级，并获得 ${2 * l} 研习点和 ${2 * l} 属性点` },
  wenyang: { name:'本命温养', max:3,  base:200, tier:2, eff:l => `开局本命兵器为${['', '灵品', '宝品', '仙品'][l]}` },
  daoti:   { name:'先天道体', max:2,  base:300, tier:2, eff:l => `本命技能开局 +${l} 重` },
  hudao:   { name:'护道',     max:1,  base:500, tier:2, eff:() => '每一世额外复生 1 次' },
  fuze:    { name:'福泽',     max:3,  base:120, tier:2, eff:l => `开局灵石 +${150 * l}，机缘 +${2 * l}` },
  daoji:   { name:'道基',     max:50, base:40,  tier:2, eff:l => `所有伤害 +${2 * l}%，气血 +${8 * l}（可一直修习，花费逐重提高）` },
});
function applyDaoguo(){
  const c = CLS(), L = upLv;
  if (L('wenyang') && c) P.eq.weapon = genItem('weapon', L('wenyang'), 0, c.weapon);
  if (L('daoti') && c) for (let i = 0; i < L('daoti'); i++) addSkill(c.start);
  if (L('suhui')){ const n = 2 * L('suhui'); P.lvl += n; P.xpNext = need(P.lvl); P.attrPts += n; P.treePoints = (P.treePoints || 0) + n; }
  if (L('hudao')) P.revives += 1;
  if (L('fuze')){ P.stones += 150 * L('fuze'); P.bonus.luck = (P.bonus.luck || 0) + 2 * L('fuze'); }
  if (L('daoji')){ P.bonus.dmg = (P.bonus.dmg || 0) + 0.02 * L('daoji'); P.bonus.hp = (P.bonus.hp || 0) + 8 * L('daoji'); }
  recalc(); P.hp = P.st.maxHp;
}
const _newRunDaoguo = newRun;
newRun = function(...a){ const r = _newRunDaoguo(...a); try { applyDaoguo(); } catch (e) {} return r; };
const _showMetaDaoguo = showMeta;
showMeta = function(){
  _showMetaDaoguo();
  try {
    const rows = [...overlay.querySelectorAll('[data-act="buy"]')].filter(b => UPS[b.dataset.k] && UPS[b.dataset.k].tier === 2).map(b => b.closest('.mrow')).filter(Boolean);
    const first = overlay.querySelector('.mlist'); if (!rows.length || !first) return;
    first.insertAdjacentHTML('afterend', '<h3>道果 · 高阶修习</h3><p class="help" style="text-align:left;margin:0 0 8px">轮回点的长期用途。前五项强化开局，「道基」可以一直修习下去。</p><div class="mlist" id="daoguo-list"></div>');
    const box = overlay.querySelector('#daoguo-list'); rows.forEach(r => box.appendChild(r));
  } catch (e) {}
};
