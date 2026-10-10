# 战斗美术更新 · 第二版

使用内置 image_gen 生成三张美术图集，没有使用 API 或 CLI 回退。原始 PNG 和保留透明度的 WebP 副本在 assets 中，游戏使用内嵌 WebP，离线仍只需 index.html。

- monsters-v2.png / .webp：12 格妖物图集，包含赤鬼、冰焰狼、石傀儡、树妖、骷髅弓手、幽魂、僵尸、无常、九尾狐、牛首将军、旱魃、魔王；部分原有同类敌人复用造型。
- terrain-v2.png / .webp：竹海苔石、荒漠砂岩、幽冥玄武岩三种地面。
- scenery-v2.png / .webp：竹丛、砂岩残门、幽冥树、石灯、火盆、鬼门六种场景装饰。装饰没有碰撞，不影响移动。

Canvas 动态效果：怪物呼吸摆动／悬浮、精英法阵、冲锋残影、冻结与眩晕标识、命中火花、死亡消散、剑弧亮边、雷电光晕、爆炸碎焰、飞弹拖尾、环境灵光和暗角。伤害判定和存档格式维持原有规则。

暂停菜单可以切换“战斗特效：华丽／简洁”，设置在本浏览器保留。简洁模式减少附加粒子与辉光，但保留敌方预警。遵循系统减少动态效果偏好，降低怪物摆动等装饰动画。

## 生成时使用的最终提示词

### 怪物图集

Use case: stylized-concept. Asset type: production enemy sprite atlas for a Chinese xianxia top-down action RPG. Create ONE transparent PNG atlas, exactly 4 columns by 3 rows equal square cells, twelve distinct monsters centered in their cells with generous transparent gutters, full bodies and no overlap. Orthographic three-quarter overhead camera consistent across sprites, facing slightly down-left. Premium hand-painted dark fantasy game art, strong readable silhouettes at 80 pixels, intricate but bold materials, dramatic jade/cyan and vermilion rim lighting. Row1: horned vermilion imp with curved blade; lean blue spectral wolf with icy fur; towering moss-covered stone guardian with bronze plates and glowing jade core; ancient twisted root demon with golden eyes and pink spirit blossoms. Row2: skeletal archer with antler bow; floating white-robed faceless ghost with long teal silk ribbons; armored jiangshi with yellow talisman over face; black-and-white underworld executioner with tall hat and hooked chain. Row3: nine-tailed white fox spirit with flowing turquoise fire tails; massive ox-headed demon general in ornate black bronze armor wielding a poleaxe; crimson drought witch floating in ember-red silk; horned celestial demon king with dark wings and a fiery halo. Consistent scale inside cells; boss silhouettes majestic and unique. Real alpha transparency everywhere around characters, no ground, no scenery, no labels, no text, no borders, no UI, no contact sheet background. Ensure twelve isolated complete figures in uniform aligned 4x3 grid.

### 地面图集

Use case: stylized-concept. Asset type: three terrain textures in one atlas for an overhead Chinese fantasy action game. Landscape canvas exactly three equal square panels side by side, no borders and no text. Each panel is a flat top-down ground-only texture, consistent orthographic view, hand-painted premium game environment art. Left panel: dark jade mossy stone courtyard reclaimed by bamboo forest, irregular worn slate slabs, fine roots, sparse fallen gold leaves, small turquoise mineral veins. Middle panel: weathered ochre sandstone temple floor in desert, cracked geometric flagstones, windblown sand drifts, bronze fragments, muted ember mineral cracks. Right panel: charcoal purple underworld temple paving, broken basalt slabs, faint cyan spirit veins, muted violet moss. Keep contrast subtle and dark for bright characters and red hazard markers to read clearly on top; intricate natural surface details but no large foreground objects, no trees, no creatures, no horizon, no perspective vanishing point, no buildings. Panels must meet at exactly 1/3 and 2/3 width, all equal squares, edge-to-edge texture filling each panel.

### 场景物件图集

Use case: stylized-concept. Asset type: environment prop sprite atlas for a Chinese dark fantasy top-down game. ONE PNG transparent atlas exactly 3 columns by 2 rows, six fully isolated props, generous 12% transparent padding inside each cell, nothing crosses cell boundaries. Hand painted premium game art consistent 3/4 overhead orthographic view, painterly material detail and strong silhouette, no outlines. Row 1 left: lush cluster of slender dark jade bamboo, arching foliage, moss-covered stone at base; middle: ruined ochre sandstone shrine arch with weathered carved stone and dry grasses; right: twisted black spirit tree with soft violet leaves and tiny cyan hanging lanterns. Row 2 left: mossy low stone lantern pagoda and pale flowering shrub; middle: ancient bronze brazier with small orange flame, sandstone rubble at base; right: broken dark stone spirit gate with turquoise floating spirit lights and carved talismans. Tall elements mostly above ground origin, soft painted contact shadows only, NO background, no terrain rectangle, no characters, no words, no borders. True alpha transparency around all 6 isolated props, all centered with clear generous gutters.

透明背景修正（同样使用内置 image_gen）：

Remove ALL colored gradient backdrop from this six-prop game sprite atlas and output actual fully transparent alpha background. Preserve the six painted objects, their 3-column 2-row positions, shapes, details, flames, foliage, lanterns, and stone bases exactly. Every empty space surrounding the objects, including gaps between branches, arch opening, and all cell gutters must be transparent. No background glow rectangles, no colored background, no checkerboard painted into image, no ground plane. This is an RGBA cutout texture for a game; an opaque colored background makes it unusable.
