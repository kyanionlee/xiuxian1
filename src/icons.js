/* Painted UI only; identifiers, skill effects and save data stay unchanged. */
const ICONS=__ICON_MANIFEST__;
function iconMarkup(key,fallback,category='',rarity=null){
 const url=ICONS[key];if(!url)return fallback;
 return `<span class="paint-icon icon-${category}"${rarity===null?'':` style="--icon-rarity:${['#a8aaa1','#7edeb4','#82c9ff','#d5a3ff','#ffd676'][rarity]||'#a8aaa1'}"`}><span aria-hidden="true">${fallback}</span><img src="${url}" alt="" loading="lazy" decoding="async" onerror="this.hidden=true"></span>`;
}
function skillIcon(s){return iconMarkup(s.sourcePassive||s.id,s.icon,s.cat);}
function itemArt(it){return iconMarkup(it.slot==='weapon'?'weapon_'+it.type:'equip_'+it.slot,itemGlyph(it),'equipment',it.rar);}
function paintedMapIcon(type,x,y){return mapIcon(type,x,y)+`<image href="${ICONS['node_'+type]}" x="${x-18}" y="${y-18}" width="36" height="36" style="pointer-events:none" onerror="this.style.display='none'"/>`;}
const setupIcons=showSetup;showSetup=function(){setupIcons();overlay.querySelectorAll('[data-act="ssect"]').forEach(el=>{const k=el.dataset.k;el.insertAdjacentHTML('afterbegin',iconMarkup('sect_'+k,SECTS[k].name[0],'sect'));});overlay.querySelectorAll('[data-act="scls"]').forEach(el=>{const s=SK[CLASSES[el.dataset.k].start];el.insertAdjacentHTML('afterbegin',skillIcon(s));});};
const shopIcons=renderShop;renderShop=function(...args){shopIcons(...args);overlay.querySelectorAll('.good').forEach((el,i)=>{const it=SHOP.goods[i]?.item;if(it)el.insertAdjacentHTML('afterbegin',itemArt(it));});};
