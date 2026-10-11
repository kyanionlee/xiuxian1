
/* ================================================================
   问道篇 · 因果与暗线（v1.4.0，Claude）
   独立模块：只包装现有函数，不修改原有代码。
   永久数据：META.karma；本世数据：P.journey.karma
   ================================================================ */
const WENDAO_VERSION = '1.4.0';

/* —— 剧情数据 —— */
// 主线 9 段 × 2 个选择 → 心性（ren 仁 / zhi 执 / qi 契）与关键因果
const K_STORY = [
  [ [{ x:'ren' }, { x:'zhi' }], [{ x:'ren', f:'jiming' }, { x:'zhi' }], [{ x:'ren' }, { x:'zhi', f:'zhengwu' }] ],
  [ [{ x:'ren' }, { x:'zhi' }], [{ x:'qi', f:'gaizhen' }, { x:'zhi', f:'zhengci' }], [{ x:'qi' }, { x:'zhi' }] ],
  [ [{ x:'qi' }, { x:'ren' }], [{ x:'qi' }, { x:'zhi' }], [{ x:'qi' }, { x:'ren' }] ],
];
const XIN_NAME = { ren:'仁', zhi:'执', qi:'契' };
const XIN_DESC = { ren:'救人、记名、守护他人', zhi:'追查真相、独自决定', qi:'信任同伴、共同承担' };

// 主线段落的「因果回响」：满足条件时，在原文后多出一句
const K_ECHO = {
  '0:0': [ M => M.mem.includes(1) && M.life > 1, '这页断简，你好像读过很多遍了。连纸角那道折痕，都折在同一个地方。' ],
  '0:1': [ M => (M.bonds.yan || 0) >= 1, '燕归舟的手按在碑上很久，像是在等碑里的人先开口。' ],
  '0:2': [ M => M.mem.includes(3), '你下意识去找最后一块腰牌。它还不在这里——至少这一世还不在。' ],
  '1:0': [ (M, k) => k.flags.jiming, '你抄下的那些名字里，有一个的笔迹，与鲤七账册上的一模一样。' ],
  '1:2': [ M => M.stele >= 1, '念到师父的名字之前，你先默念了一遍碑上那些被凿掉的名字。' ],
  '2:0': [ M => M.mem.includes(4), '那个背影，和梦里提灯把你抱出黑暗的人，一模一样。' ],
  '2:1': [ M => (M.bonds.su || 0) >= 1, '苏照夜指着星图一角：“看，这一颗是你。它亮过很多次了。”' ],
  '2:2': [ M => M.mem.includes(7), '你想起断简的后半句。这一次，你没有回头，也没有一个人走。' ],
};

// 七片记忆
const K_MEMORY = {
  1: ['钟声', '你梦见山门的钟响了三夜。你数着钟声，忽然发现这不是第一次数——每一次，都是第三夜之后，师父没有回来。醒来时，枕下仍是那页断简。'],
  2: ['渡口', '灰白的河上有一只小船。摆渡人没有回头，只说了一句：“又是你。”你想问他是谁，船已经靠岸。岸边的石阶，你好像走过很多遍。'],
  3: ['腰牌', '祭坛下那一排腰牌，你一块块看过去。最后一块是新的，木纹还泛着光，上面刻的是你的名字。你伸手去拿，它碎成了灰。'],
  4: ['师父的手', '很小的时候，你在一片黑暗里哭。有人提着灯走进来，衣袖上全是血。他把你抱起来，说：“别怕，这一次我带你出去。”是师父的声音。'],
  5: ['轮回井', '井很深，井底沉着无数点微光，像落进水里的星。你认出其中一点在发抖——那是你自己的魂火，正被一寸寸拉回井底。'],
  6: ['账本', '摆渡人的账本摊在船头。每一页都是同一个名字，后面只写一个字：“归”。这个名字写满了整整一本。那是你的名字。'],
  7: ['师父的信', '断简缺的那一半，终于完整了。师父的字很稳：“阵会把你一次次送回来。我去做守门人，你就不必再回来了。若你还是来了——别回头，也别一个人走。”'],
};
const K_MEMORY_HINT = {
  1: '走完一世，便会想起。', 2: '走得再远一些。', 3: '祭坛下的证物，或许不该交出去。', 4: '摆渡人知道你的过去。',
  5: '幽冥深处有一口井。', 6: '与摆渡人相识多世，又轮回多次之后。', 7: '把被凿去的名字，一个个找回来。',
};

// 无名碑：每一世补全三个名字（第一章「记下被抹去的名字」+ 第二章「完整保存证词」）
const K_STELE = [
  ['顾长庚', '许观澜', '温在野'],
  ['陆听潮', '沈无咎', '阮青禾'],
  ['宋知秋', '白守拙', '第九行墨迹最新，刻的是你师父的名字。'],
];

// 故人：宿缘台词（第 1 世相识 / 第 2 世起）
const K_KNOWN = {
  yun:  ['“你……我们在哪里见过吗？你的脉象，我好像摸过。”', '“又见面了。这一次，别再一个人走到最后。”'],
  yan:  ['“这把断剑见了你就鸣。奇怪，它从不认生。”', '“你来了。我还欠你一壶酒，上一回没来得及喝。”'],
  tang: ['“你看机关的眼神，像是早就拆过一次。”', '“老朋友。图纸我又改了一版，这次你得活着看完。”'],
  li:   ['“客官面熟。我们做过生意？”', '“你的账我一直记着。这一世，先别急着结清。”'],
  deng: ['“……又是你。”', '“我替你记着每一次。这一程，我陪你多渡一段。”'],
  su:   ['“星图上有一颗星，和你同时亮起。”', '“你回来了。星图上你那一串，又长了一颗。”'],
};

// 故人个人线（第一、二段；第三段留待下个版本）
const K_ARCS = {
  yun: [
    { t:'疫村的井', b:'山下疫村的病人，身上都有同样的青斑。沈青蘅蹲在井边，舀起一瓢水对着光看：“不是毒。是灵气，浓得不该出现在凡人的井里。”她抬头看你，等你决定先做什么。',
      c:[['先帮她煎药救人', 'ren', '你们守着药炉熬了一夜。天亮时，第一个孩子退了热。沈青蘅说：“病根还在，但人先活下来了。”'],
         ['随她去查井的源头', 'zhi', '井脉一路通向山腹，越往深处，灵气越浊。沈青蘅在石壁上做了个记号：“这股气，是从某座阵里漏出来的。”']] },
    { t:'阵下之泉', b:'你们循着井脉，找到旧阵漏出浊气的泉眼。沈青蘅按住泉边的石头，忽然停住：“我是不是……也这样找过一次？和你一起？”封住泉眼能救下这一村，浊气却会流向下游。',
      c:[['封住泉眼，先救眼前的人', 'ren', '泉眼封住了。沈青蘅背起药篓往下游走：“那边的人，我去一个个看。你别管我，往前走。”'],
         ['留着泉眼，记下它的位置', 'qi', '沈青蘅把泉眼画进随身的药谱：“等你找到不吃人的阵心，这里就是第一处要补的地方。我等你回来。”']] },
  ],
  yan: [
    { t:'剑鸣', b:'修剑的炉火映在燕归舟脸上。他第一次说起那柄断剑的来历：“是我师兄的。我们约好一起出关，他先一步进了封印，再没出来。”',
      c:[['帮他继续修剑', 'qi', '你们一锤一锤敲到天亮。断剑仍是断的，剑鸣却比昨夜清亮了许多。燕归舟难得笑了：“它认你。”'],
         ['问他师兄为何入封印', 'zhi', '燕归舟沉默很久：“宗门说他是去镇妖。可镇妖的人，为什么要提前写好遗书？”']] },
    { t:'剑魂', b:'界碑前，断剑忽然自己鸣响。一道剑影从碑中走出，向燕归舟抱拳——是他的师兄。剑影只说了一句：“归舟，别等了。”燕归舟握剑的手在抖。',
      c:[['劝燕归舟放下', 'ren', '剑影散去前，向你点了点头。燕归舟把断剑收回鞘中：“他让我别等。可我总得送他一程。”'],
         ['答应他，一起把师兄带出来', 'qi', '燕归舟把断剑横在你们之间：“这句话，我记下了。哪一世都算数。”']] },
  ],
  tang: [
    { t:'祖传的齿轮', b:'唐问机腰间挂着一枚老齿轮，刻着一个“唐”字。你在旧阵炉心见过一模一样的齿轮。他察觉你的目光，下意识用袖子遮了遮。',
      c:[['装作没看见', 'ren', '你移开目光，聊起渡船的榫卯。唐问机松了口气，过了一会儿，自己低声说：“谢谢。等我想好怎么说。”'],
         ['当面问他', 'zhi', '唐问机苦笑：“你眼睛真尖。那是我家的东西。至于它为什么会在阵里……让我再查查，查清了一定告诉你。”']] },
    { t:'先祖手稿', b:'唐问机摊开一卷发黄的手稿：“旧阵是我先祖造的。他本意是镇住妖潮，后来宗门改了阵心，让它吃人的魂火。我修了一辈子机关，都在替他还账。”',
      c:[['这不是你的罪', 'ren', '唐问机把手稿卷起来，又慢慢展开：“你说得对。可总得有人把它改回来——那个人，可以是我。”'],
         ['那就一起把账算清', 'qi', '唐问机在手稿空白处画下第一笔：“好。先祖造了一座吃人的阵，我就造一座不吃人的。你替我盯着。”']] },
  ],
  li: [
    { t:'不收的珠子', b:'鲤七什么都收，唯独把你递来的潮珠推了回来：“你的东西，我收过一次了。”说完他自己也愣住，像是说漏了嘴。',
      c:[['追问“一次”是什么时候', 'zhi', '鲤七摇着扇子打哈哈：“说错了，说错了。做买卖的，嘴快。”可他翻账册的手，停在了某一页上。'],
         ['笑着收回珠子', 'ren', '鲤七看着你，忽然叹了口气：“你这人，每次都这样。”你问他“每次”是什么意思，他已经去招呼别的客人了。']] },
    { t:'不翻的那一页', b:'鲤七的账册里，有一页用红线缝死了。他说那是“欠得最久的一笔账”。红线的缝隙里，你看见了两个字：守门。',
      c:[['替他保守秘密', 'ren', '鲤七把账册合上，第一次没有讨价还价：“这份人情，我记一辈子。也许不止一辈子。”'],
         ['请他拆开那一页', 'zhi', '鲤七摸着红线，摇了摇头：“还不是时候。等你把碑上的名字都找回来，我就拆给你看。”']] },
  ],
  deng: [
    { t:'无名游魂', b:'安置游魂时，一个游魂忽然向你深深一拜，叫你“恩人”。你不记得自己救过谁。无灯在船头淡淡地说：“它比你记性好。”',
      c:[['送它过河', 'ren', '游魂上了船，回头望了你三次。无灯撑篙离岸：“上一回，你也是这样送它的。”'],
         ['问它在哪里见过你', 'zhi', '游魂张了张嘴，却说不出话。无灯替它答：“在你不记得的地方。别急，有些事，你会一点点想起来。”']] },
    { t:'又是你', b:'船行到河心，无灯终于开口：“你还记得上一次吗？你也站在这个位置，问我同一句话。”河水下有无数点微光，正缓缓沉向深处。',
      c:[['我记得一点', 'qi', '无灯第一次回头看你：“那就够了。记得一点的人，才走得出去。”'],
         ['告诉我上一次发生了什么', 'zhi', '无灯沉默了很久：“上一次，你死在界门前。再上一次，也是。这条河，送你回来过很多回。”']] },
  ],
  su: [
    { t:'多出来的星', b:'苏照夜的星图上，有一颗星本不该存在。她核了三百年的旧图，每一份都没有它；可每次观星，它都在同一个位置亮起。',
      c:[['那颗星是什么？', 'zhi', '苏照夜在那颗星旁写了个问号：“我也想知道。但我注意到，它亮起的那一天，你恰好上了山。”'],
         ['也许是有人在等', 'ren', '苏照夜怔了一下，笑了：“观星的人，很少这样想。不过……也许你说得对。”']] },
    { t:'往世之星', b:'苏照夜把那颗星周围的暗星连成一条线：“这些都是你。每一颗，是你的一世。你死过很多次，每次都回到这里。”',
      c:[['这些星会一直增加吗？', 'zhi', '苏照夜的笔停在半空：“按旧星图，会。直到某一世，有人在这串星的末尾，补上第四笔。”'],
         ['那就让下一颗亮得久一点', 'qi', '苏照夜把这句话写在星图边上：“我会看着它。这一次，别让我看着它熄灭。”']] },
  ],
};

// 秘闻（暗线）在因果簿中的显示
const K_SECRETS = [
  { id:'fourth', name:'第四笔', hint:'苏照夜说，旧星图上少了一笔。', done:M => M.ends.includes('renew') },
  { id:'stele', name:'无名碑', hint:'碑上被凿去的名字，需要有人一世一世地找回来。', done:M => M.stele >= 3, prog:M => M.stele + '/3' },
  { id:'liname', name:'鲤七的真名', hint:'鲤七的账册里，有一页从不翻开。', done:() => false },
  { id:'ledger', name:'摆渡人的账本', hint:'无灯总是说：“又是你。”', done:M => M.mem.includes(6) },
  { id:'sword', name:'断剑重铸', hint:'燕归舟的断剑，鸣声里藏着另一个人。', done:() => false },
  { id:'plan', name:'改阵图', hint:'唐问机说过：若你要留这座阵，他来改它。', done:() => false },
  { id:'end', name:'轮回尽处', hint:'当你想起一切的时候。', done:() => false },
];
const XIN_EPILOGUE = {
  ren:'你记住了许多人的名字，他们也记住了你。',
  zhi:'你把真相一寸寸挖了出来，代价也由你一寸寸承受。',
  qi:'最后那一步，你不是一个人迈出去的。',
};

/* —— 数据存取 —— */
function kmeta(){
  META.karma ||= {};
  const M = META.karma;
  if (!M.v){
    M.v = 1; M.life = M.life || META.runs || 0; M.mem = M.mem || []; M.bonds = M.bonds || {}; M.arcs = M.arcs || {};
    M.ends = M.ends || []; M.deaths = M.deaths || 0; M.stele = M.stele || 0; M.pendingDream = M.pendingDream || null;
    if ((META.runs || 0) > 0 && !M.mem.includes(1)) M.mem.push(1);
    for (const k of Object.keys(TRAVELERS)) if (contact(k) >= 30 && !M.bonds[k]) M.bonds[k] = 1;
  }
  M.mem ||= []; M.bonds ||= {}; M.arcs ||= {}; M.ends ||= [];
  return M;
}
function jk(){
  const j = journey(); if (!j) return null;
  j.karma ||= { flags:{}, xin:{ ren:0, zhi:0, qi:0 }, arcDone:{}, dream:null, dreamShown:false, ended:false };
  const k = j.karma; k.flags ||= {}; k.xin ||= { ren:0, zhi:0, qi:0 }; k.arcDone ||= {};
  return k;
}
const topXin = k => ['qi', 'ren', 'zhi'].sort((a, b) => k.xin[b] - k.xin[a])[0];
const bondOf = n => kmeta().bonds[n] || 0;
const esc = s => String(s).replace(/[<>&]/g, c => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;' })[c]);
if (!document.getElementById('wendao-style')) document.head.insertAdjacentHTML('beforeend', `<style id="wendao-style">
.karma-echo{color:#e6c879;font-style:italic;border-left:3px solid #e6c87966;padding-left:12px}
.karma-sec{margin-top:18px;text-align:left}.karma-sec h3{margin:0 0 8px;color:#e6c879}
.karma-row{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:15px;line-height:1.7}
.karma-list p{margin:4px 0;line-height:1.7}.karma-dim{opacity:1;color:#c7d8d3}
.karma-line{margin:6px 0 0;font-size:14px;color:#e6c879}
</style>`);

/* —— 主线选择写入因果 —— */
const kChooseStory = chooseStory;
chooseStory = function(i){
  try {
    if (state === 'story' && storyPending && [0, 1].includes(i) && !journey().seen[storyPending.key]){
      const { ch, beat } = storyPending, m = K_STORY[ch] && K_STORY[ch][beat] && K_STORY[ch][beat][i], k = jk();
      if (m && k){ k.flags['s' + ch + beat + i] = true; if (m.f) k.flags[m.f] = true; k.xin[m.x]++; }
    }
  } catch (e) {}
  return kChooseStory(i);
};

/* —— 主线段落加入因果回响 —— */
const kEnterNode = enterNode;
enterNode = function(id){
  const r = kEnterNode(id);
  try {
    if (state === 'story' && storyPending){
      const e = K_ECHO[storyPending.ch + ':' + storyPending.beat], body = overlay.querySelector('.panel .story');
      if (e && body && e[0](kmeta(), jk())) body.insertAdjacentHTML('afterend', `<p class="story karma-echo">${e[1]}</p>`);
    }
  } catch (e) {}
  return r;
};

/* —— 开局：计入世数，准备前世的梦 —— */
const kNewRun = newRun;
newRun = function(...a){
  const r = kNewRun(...a);
  try { const M = kmeta(), k = jk(); M.life++; if (M.pendingDream){ k.dream = M.pendingDream; M.pendingDream = null; } } catch (e) {}
  return r;
};
function showDream(n, first){
  const m = K_MEMORY[n]; if (!m) return;
  state = 'dream';
  showOverlay(`<div class="panel"><p class="journey-kicker">记忆碎片 · ${n}/7</p><h2>${m[0]}</h2><p class="story">${m[1]}</p>
    <div class="actions">${first ? btn('k-dream-ok', '醒来', null, 'red') : btn('j-story', '返回剧情手札', null, 'ghost')}</div></div>`);
}
const kShowMap = showMap;
showMap = function(){
  const k = P && RUN ? jk() : null;
  if (k && k.dream && !k.dreamShown) return showDream(k.dream, true);
  const r = kShowMap();
  try {
    const M = kmeta(), ban = overlay.querySelector('.journey-banner');
    if (ban && P) ban.insertAdjacentHTML('beforeend', `<p class="karma-line">第 ${M.life} 世 · 记忆 ${M.mem.length}/7 · 心性 ${XIN_NAME[topXin(k)]}</p>`);
  } catch (e) {}
  return r;
};

/* —— 故人：宿缘台词与个人线 —— */
function arcState(n){
  const M = kmeta(), k = jk(), seg = (M.arcs[n] || 0) + 1;
  if (seg > 2 || k.arcDone[n]) return null;
  if (seg === 1 && contact(n) < 15) return { seg, lock:'好感达到 15 后，会愿意和你说起往事。' };
  if (seg === 2 && bondOf(n) < 1) return { seg, lock:'需要在某一世与他结为知交（宿缘 1 世）。' };
  return { seg };
}
const kShowPerson = showPerson;
showPerson = function(n){
  const r = kShowPerson(n);
  try {
    if (state !== 'person' || !TRAVELERS[n]) return r;
    const b = bondOf(n), story = overlay.querySelector('.panel .story');
    if (b >= 1 && story) story.insertAdjacentHTML('beforebegin', `<p class="story karma-echo">${K_KNOWN[n][b >= 2 ? 1 : 0]}</p>`);
    const st = arcState(n), back = overlay.querySelector('[data-act="j-people"]'), A = K_ARCS[n];
    if (back && A){
      let html = `<section class="journey-banner"><h3>往事 · 宿缘 ${b} 世</h3>`;
      if (!st) html += `<p>${(kmeta().arcs[n] || 0) >= 2 ? '他的往事，你已听到这里。后面的故事，要等以后。' : '这一世，他已经说过一段往事了。'}</p>`;
      else if (st.lock) html += `<p>${st.lock}</p>`;
      else html += `<p>第 ${st.seg} 段：「${A[st.seg - 1].t}」</p>${btn('k-arc', '听他说起往事', n, 'ghost')}`;
      back.insertAdjacentHTML('beforebegin', html + '</section>');
    }
  } catch (e) {}
  return r;
};
function showArc(n){
  const st = arcState(n); if (!st || st.lock) return;
  const a = K_ARCS[n][st.seg - 1]; state = 'arc';
  showOverlay(`<div class="panel">${typeof portraitMarkup === 'function' ? portraitMarkup(n) : ''}<p class="journey-kicker">${TRAVELERS[n].name} · 往事 ${st.seg}</p><h2>${a.t}</h2>
    <p class="story">${a.b}</p>${a.c.map((c, i) => btn('k-arcc', c[0], n + ':' + i, 'story-choice ghost')).join('')}
    <div class="actions">${btn('j-npc', '以后再说', n, 'ghost')}</div></div>`);
}
function chooseArc(v){
  const [n, si] = String(v).split(':'), i = +si, st = arcState(n);
  if (state !== 'arc' || !st || st.lock || ![0, 1].includes(i)) return;
  const a = K_ARCS[n][st.seg - 1], c = a.c[i], M = kmeta(), k = jk();
  M.arcs[n] = st.seg; k.arcDone[n] = true; k.flags['arc:' + n + ':' + st.seg + ':' + i] = true; k.xin[c[1]]++;
  addContact(n, 5); record(`${TRAVELERS[n].name}说起「${a.t}」：你选择${c[0]}。`);
  captureMap();
  showOverlay(`<div class="panel"><p class="journey-kicker">${TRAVELERS[n].name} · 往事 ${st.seg} · 心性 ${XIN_NAME[c[1]]} +1</p><h2>${a.t}</h2>
    <p class="story">${c[2]}</p><p class="help">好感 +5</p><div class="actions">${btn('j-npc', '返回', n, 'red')}</div></div>`);
}

/* —— 一世结束：结算记忆、宿缘、无名碑 —— */
function lifeEnd(win){
  const M = kmeta(), k = jk(), j = journey(), rep = { bonds:[], mem:null, stele:false };
  if (!win) M.deaths++;
  if (win){ const e = j.ending || 'guard'; if (!M.ends.includes(e)) M.ends.push(e); }
  for (const n of Object.keys(TRAVELERS)) if (contact(n) >= 30){ M.bonds[n] = (M.bonds[n] || 0) + 1; rep.bonds.push(n); }
  if (k.flags.jiming && k.flags.zhengci && M.stele < 3){ M.stele++; rep.stele = true; }
  const ok = { 1:true, 2:RUN.ch >= 1, 3:!!k.flags.zhengwu, 4:contact('deng') >= 30, 5:RUN.ch >= 2 && (j.routes[2] || 0) === 0,
               6:(M.bonds.deng || 0) >= 2 && M.life >= 5, 7:M.stele >= 3 };
  const got = [1, 2, 3, 4, 5, 6, 7].find(n => !M.mem.includes(n) && ok[n]);
  if (got){ M.mem.push(got); M.mem.sort((a, b) => a - b); M.pendingDream = got; rep.mem = got; }
  rep.xin = topXin(k);
  return rep;
}
const kGameOver = gameOver;
gameOver = function(win){
  let rep = null;
  try { if (P && RUN){ const k = jk(); if (k && !k.ended){ k.ended = true; rep = lifeEnd(win); } } } catch (e) {}
  const r = kGameOver(win);
  try {
    persist();
    const panel = overlay.querySelector('.panel');
    if (rep && panel){
      const M = kmeta(), lines = [];
      if (rep.mem) lines.push(`你想起了一些事：记忆碎片「${K_MEMORY[rep.mem][0]}」（${M.mem.length}/7），下一世开始时会梦见它。`);
      if (rep.bonds.length) lines.push(`宿缘加深：${rep.bonds.map(n => `${TRAVELERS[n].name}（${M.bonds[n]} 世）`).join('、')}。`);
      if (rep.stele) lines.push(`无名碑上又找回了三个名字（${M.stele}/3）。`);
      if (win) lines.push(XIN_EPILOGUE[rep.xin]);
      if (lines.length) panel.insertAdjacentHTML('beforeend', `<section class="journey-banner karma-sec"><h3>因果 · 第 ${M.life} 世</h3>${lines.map(t => `<p>${t}</p>`).join('')}</section>`);
    }
  } catch (e) {}
  return r;
};

/* —— 剧情手札：因果簿 —— */
const kShowStoryBook = showStoryBook;
showStoryBook = function(){
  const r = kShowStoryBook();
  try {
    const M = kmeta(), k = jk(), back = overlay.querySelector('.panel [data-act="map"]'); if (!back || !k) return r;
    const xin = Object.keys(XIN_NAME).map(x => `<span>${XIN_NAME[x]} ${k.xin[x]}<small class="karma-dim">（${XIN_DESC[x]}）</small></span>`).join('');
    const mem = [1, 2, 3, 4, 5, 6, 7].map(n => M.mem.includes(n)
      ? btn('k-mem', `${n} · ${K_MEMORY[n][0]}`, n, 'ghost sm')
      : `<span class="karma-dim">${n} · ？？？ —— ${K_MEMORY_HINT[n]}</span>`).join('');
    const bonds = Object.keys(TRAVELERS).filter(n => TRAVELERS[n].ch <= RUN.ch || bondOf(n) > 0)
      .map(n => `<span>${TRAVELERS[n].name}：好感 ${contact(n)} · 宿缘 ${bondOf(n)} 世 · 往事 ${M.arcs[n] || 0}/3</span>`).join('');
    const names = K_STELE.slice(0, M.stele).flat();
    const stele = names.length ? names.map(t => `<p>${t}</p>`).join('') : '<p class="karma-dim">碑面空空。被凿去的名字，要在同一世里「记下名字」并「保存证词」才能找回。</p>';
    const sec = K_SECRETS.map(s => s.done(M) ? `<p>✦ ${s.name} · 已解开${s.prog ? '（' + s.prog(M) + '）' : ''}</p>`
      : `<p class="karma-dim">？？？ · ${s.hint}${s.prog ? '（' + s.prog(M) + '）' : ''}</p>`).join('');
    back.insertAdjacentHTML('beforebegin', `
      <section class="karma-sec"><h3>因果簿 · 第 ${M.life} 世</h3><p class="help" style="text-align:left">你的选择会被记住。有些因果跨越轮回，在很久以后才结出果。</p></section>
      <section class="karma-sec"><h3>本世心性</h3><div class="karma-row">${xin}</div></section>
      <section class="karma-sec"><h3>记忆碎片 ${M.mem.length}/7</h3><div class="karma-row">${mem}</div></section>
      <section class="karma-sec"><h3>宿缘</h3><div class="karma-row">${bonds || '<span class="karma-dim">尚未结识故人。</span>'}</div></section>
      <section class="karma-sec karma-list"><h3>无名碑 ${M.stele}/3</h3>${stele}</section>
      <section class="karma-sec karma-list"><h3>秘闻</h3>${sec}</section>`);
  } catch (e) {}
  return r;
};

/* —— 按钮处理 —— */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b || b.disabled || !b.dataset.act.startsWith('k-')) return;
  e.stopImmediatePropagation(); if (!P || !RUN) return;
  const a = b.dataset.act, k = b.dataset.k;
  try { audioInit(); sfx('click'); } catch (err) {}
  if (a === 'k-dream-ok'){ const c = jk(); c.dreamShown = true; captureMap(); showMap(); }
  else if (a === 'k-mem') showDream(+k, false);
  else if (a === 'k-arc') showArc(k);
  else if (a === 'k-arcc') chooseArc(k);
}, true);
kmeta();
