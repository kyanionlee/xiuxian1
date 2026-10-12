/* External art is optional: combat keeps its existing vector fallback. */
const battleArtQueue=[];
function deferBattleArt(image,url){battleArtQueue.push([image,url]);return image;}
function loadBattleArt(){
  while(battleArtQueue.length){const [image,url]=battleArtQueue.shift();image.decoding='async';image.src=url;}
}
function artImage(url,label,className){
  return `<img class="${className||''}" src="${url}" alt="${label}" loading="lazy" decoding="async" onerror="this.hidden=true">`;
}
