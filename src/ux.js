/* Clear completion feedback; rewards and completion criteria remain unchanged. */
const uxReward=showReward;
showReward=function(){uxReward();if(RW&&!RW.fail){const panel=overlay.querySelector('.panel');if(panel&&!panel.querySelector('.completion-note'))panel.insertAdjacentHTML('afterbegin','<p class="completion-note" role="status">✓ 本关目标已完成 · 领取一项奖励后，即可进入下一节点</p>');}};
