/* Independent active pools and class-specific passive IDs, before save validation. */
function defineTreeArtSkill(id,name,icon,style,pair){def(id,{cat:'g',name,icon,max:6,evo:{name:name+'·真意',pair,desc:'范围、伤害或护持效果增强'},stat:(l,ev)=>({dmg:(9+l*7)*(ev?1.8:1),r:(95+l*9)*(ev?1.25:1),cd:Math.max(1.4,4.6-l*.3),n:ev?5:3,style}),desc(l){return ({line:'剑意贯穿前方，伤害随重数提高',rain:'在妖群脚下留下预兆，随后落下剑雨',shield:'周期凝聚护盾，并震退近身妖物',return:'旋刃环身，命中周围妖物',quake:'重击地面，震伤并短暂定身近敌',soul:'冥火吞噬周围妖物，附加减速',prison:'布下禁锢印记，短暂定身妖群',heal:'以清音调息，少量治疗并击退近敌',wave:'扩散音波，对周围妖物造成伤害',slow:'寒音贯耳，范围减速并造成伤害',storm:'布下雷阵，延时轰击并定身',flame:'布下火阵，持续灼烧阵内妖物',spring:'灵阵凝元，为自身提供护盾',chain:'符光连锁，轰击并眩晕周围妖物',burst:'爆裂符印延时炸开，造成范围伤害',poison:'播下蛊毒，范围中毒并减速'})[style]+` · 第 ${l} 重`;},upd(dt,s){P.t[id]=(P.t[id]||0)-dt;if(P.t[id]>0)return;const t=nearest(P.x,P.y,450);if(!t&&!['heal','shield','spring'].includes(style))return;P.t[id]=s.cd*P.st.cdMul;const r=s.r*P.st.area;
 if(style==='line'){const a=Math.atan2(t.y-P.y,t.x-P.x);line(P.x,P.y,a,r*2.3,20,s.dmg,90,'g');fx.push({k:'thrust',x:P.x,y:P.y,a,len:r*2.3,w:20,t:0,dur:.25});}
 else if(['rain','storm','burst','prison'].includes(style)){strikes.push({k:style==='rain'?'thunder':'seal',x:t.x,y:t.y,r,dmg:s.dmg,t:0,delay:.65,cat:'g',stun:style!=='rain'});}
 else if(['shield','spring'].includes(style)){addShield(P.st.maxHp*(.035+.007*(P.sk[id]||1)),0);aoe(P.x,P.y,r,s.dmg*.4,120,'g');fx.push({k:'ring',x:P.x,y:P.y,r,t:0,dur:.45});}
 else if(style==='heal'){heal(P.st.maxHp*.025);aoe(P.x,P.y,r,s.dmg*.35,100,'g');fx.push({k:'ring',x:P.x,y:P.y,r,t:0,dur:.6});}
 else if(style==='flame'){zones.push({x:t.x,y:t.y,r:r*.7,t:0,dur:2.3,tick:0,dmg:s.dmg*.3});}
 else if(style==='poison'){for(const e of enemies)if(!e.dead&&d2(e,P)<r*r)applyPoison(e,s.dmg*.25,3);aoe(P.x,P.y,r,s.dmg*.3,20,'g',{slow:1.5});}
 else {aoe(P.x,P.y,r,s.dmg,style==='return'?40:110,'g',{slow:['soul','slow'].includes(style)?1.5:0,stun:(style==='quake'||style==='chain')?.5:0});fx.push({k:'ring',x:P.x,y:P.y,r,t:0,dur:.45});}
 }});ACTIVE.push(id);}
for(const row of [
 ['jian_line','穿云剑意','剑','line','focus'],['jian_rain','落星剑雨','剑','rain','mind'],['jian_guard','护体剑罡','剑','shield','armor'],['jian_return','回风剑轮','剑','return','heart'],
 ['ti_quake','撼山震','拳','quake','heart'],['ti_guard','不动明王','体','shield','body'],
 ['hun_fire','幽冥魂焰','魂','soul','heart'],['hun_prison','锁魂狱','魂','prison','mind'],
 ['yue_heal','清心曲','音','heal','body'],['yue_shield','护心弦','音','shield','armor'],['yue_slow','寒江吟','音','slow','mind'],['yue_wave','破阵曲','音','wave','heart'],
 ['array_storm','九霄雷阵','阵','storm','mind'],['array_flame','离火阵','阵','flame','heart'],['array_spring','聚灵阵','阵','spring','body'],['array_prison','困龙阵','阵','prison','focus'],
 ['fu_chain','五雷连符','符','chain','mind'],['fu_burst','焚天符印','符','burst','heart'],['du_seed','蚀心蛊毒','毒','poison','toxin']
])defineTreeArtSkill(...row);
const V7_POOLS={jian:['sword','jian_line','jian_guard','jian_rain','jian_return'],fa:['ice','wind','wood','thunder','meteor'],ti:['fist','staff','aura','ti_guard','ti_quake'],hun:['banner','drain','seal','hun_fire','hun_prison'],yue:['sonic','yue_heal','yue_shield','yue_slow','yue_wave'],array:['zhenpan','array_spring','array_flame','array_prison','array_storm'],fu:['fire','hushen','zhenyao','fu_chain','fu_burst'],yushou:['wolfpack','spiritfox','crows','stoneling','bees','turtle','roc'],kuilei:['muku','tieku','nuku','zhizhu','huoku'],du:['dart','miasma','gu','rot','du_seed']};
const V7_TREE={},V7_OWNER={},V7_PASSIVES={};
const basePassives=Object.keys(SK).filter(k=>SK[k].cat==='p');
for(const [cls,pool]of Object.entries(V7_POOLS)){
 CLASSES[cls].pool=pool;V7_PASSIVES[cls]=[];
 for(const k of basePassives){if(CLASS_ONLY_PASSIVES.has(k)&&!CLASSES[cls].passives?.includes(k))continue;const id=cls+'_'+k;def(id,{...SK[k],id,name:CLASSES[cls].name+'·'+SK[k].name,sourcePassive:k});V7_PASSIVES[cls].push(id);V7_OWNER[id]=cls;}
 CLASSES[cls].passives=V7_PASSIVES[cls];
 pool.forEach((k,i)=>{V7_OWNER[k]=cls;V7_TREE[k]={tier:[0,0,1,1,2,2,3][i],parent:i===0?null:pool[i<=2?0:i-2],rank:i?2:0};const pair=cls+'_'+SK[k].evo.pair;SK[k].evo={...SK[k].evo,pair:SK[pair]?pair:V7_PASSIVES[cls][0]};});
}
// Pact/toxin passives used by poison evolutions remain in the poison tree.
for(const k of ['pact','toxin','contagion']){const id='du_'+k;if(!SK[id]){def(id,{...SK[k],id,name:'毒师·'+SK[k].name,sourcePassive:k});V7_PASSIVES.du.push(id);V7_OWNER[id]='du';}}
SK.gu.evo.pair='du_pact';SK.rot.evo.pair='du_contagion';SK.miasma.evo.pair='du_toxin';SK.du_seed.evo.pair='du_toxin';
