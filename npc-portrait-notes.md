# NPC 立绘生成记录

使用内置 image_gen 生成一张 3 列 × 2 行的六人半身立绘图集，没有使用 API/CLI。

最终文件：`assets/npc-portraits.png`（原图）、`assets/npc-portraits.webp`（页面使用）。页面将 WebP 内嵌，再切分为六位角色，因此离线只需 index.html。

角色按游戏现有顺序：沈青蘅、燕归舟、唐问机、鲤七、无灯、苏照夜。

## 最终提示词

Production portrait atlas for a Chinese xianxia fantasy game. Landscape image EXACTLY THREE columns TWO rows, six equal rectangular portrait cells, no text no letters no borders. Each cell is self-contained with generous margins; no person or prop crosses cell boundary. Half-body portraits large readable faces and hands, painterly premium Chinese fantasy illustration, consistent antique gold and jade accents, dramatic gentle lighting, detailed layered traditional robes. Background of each cell dark muted teal atmospheric mountain mist so white UI overlays remain legible. Row1 column1 Shen Qingheng, compassionate adult female physician in ivory and sage green robes, small herb basket and flower hairpin; row1 column2 Yan Guizhou, adult male wandering swordsman, black ponytail, weathered navy robe, holding a broken sword hilt, quiet determined face; row1 column3 Tang Wenji, adult male engineer wearing bronze goggles on forehead, tied-up hair, artisan robes, delicate brass mechanical bird on one hand. Row2 column1 Li Qi, playful adult female merchant with coral-colored robe, pearl ornaments and dark turquoise hair ribbons, holding a glowing pearl; row2 column2 Wudeng, mysterious adult male ferryman in charcoal hooded robe, silver hair, kind tired face partly shaded, holding an antique pale-blue soul lantern; row2 column3 Su Zhaoye, adult female astronomer in midnight blue star-patterned robe, long silver hair, gold celestial hair ornaments, holding bronze astrolabe. All adult, approachable, distinct faces and silhouette, attractive nuanced expressions. Exactly six equally spaced portraits in a regular 3 by 2 grid. No weapons outside cells. No inscriptions.
