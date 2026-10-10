# 美术与维护

本次使用内置 image_gen 工具生成两张原创游戏美术，未使用 API/CLI 回退方式。

- `assets/world.png`：山水主视觉原图。`assets/world.jpg` 是用于游戏内嵌的压缩副本。
- `assets/sprites.png`：4×3 透明角色与场景装饰图集原图。`assets/sprites.webp` 为游戏内嵌副本，保留透明通道。
- `index.html` 已包含两张使用中的图片；不依赖外部字体、网络图片或框架。原有部分小型妖物和技能特效仍使用 Canvas 绘制。

主视觉最终提示词：

> Create a premium Chinese xianxia game environment key art, ultra wide landscape 1536x1024. Painterly traditional blue-green shanshui fused with rich atmospheric fantasy illustration. A tiny white-robed sword cultivator on a rocky ledge at lower right, immense layered jade mountains, ancient temple perched on cliffs to the right, luminous winding river and mist, distant golden sun, bamboo silhouettes in foreground. Dark deep teal edges, antique gold sunlight, tactile ink and mineral pigment. Left third mostly atmospheric dark negative space suitable for game title overlay. Cinematic detailed professional game concept art, no text no lettering no logo no UI. Used as offline HTML game title screen and world map background.

角色图集最终提示词：

> Asset type: professional Chinese xianxia 2D game sprite atlas. Create ONE landscape image 1536x1024 with EXACTLY 4 columns x 3 rows equal cells (384x341 pixels each), transparent background. Every sprite centered in its own cell with generous empty margins, completely separate, no overlap, no grid lines, no text. Full body top-down three quarter isometric game sprites, facing down-right, hand-painted jade green antique gold ink fantasy style, strong readable silhouettes, polished detailed shading. Row 1 from left: white-haired jade-robed sword cultivator with flowing sleeves and gold sword; dark emerald horned imp demon; silver blue wolf with glowing eyes; bulky moss-covered stone golem. Row 2 from left: crimson bamboo tree demon with twisted roots; ancient skeletal armored soldier with spear; purple translucent floating female ghost with long silk robes; crimson black horned demon king in ornate armor holding a giant blade. Row 3 from left: elegant nine-tailed white fox spirit with luminous blue tails; ancient golden guardian general with halberd and red cape; clustered lush bamboo and mossy rock environment prop; broken ancient pagoda stone lantern with jade light environment prop. Keep every sprite within inner 70% of its cell so atlas cells can be cropped independently. Consistent scale except bosses slightly bigger; no scenic backgrounds, no floor plane, genuine transparent background.

## 存档兼容约定

存储键 `yjwx-save-stable` 应长期保持稳定；`yjwx-save-previous` 是最近一次自动备份。轮回旧键 `yjwx-meta-v4` 保留兼容。读取旧 `yjwx-run-v4` 时迁移地图进度，不强行再生成地图。

存档封装 `format: yjwx-shanhai`、`schema: 1` 包含版本、时间、轮回、设置和 checkpoint。checkpoint 分为 map / battle。战斗存档保留角色、地图、关卡、对象数组、飞剑和投射物的命中集合、首领引用。恢复时重建 Set 对象和首领引用。新的状态字段应提供旧存档缺省值。升级 schema 必须新增迁移，而不能直接丢弃旧存档。

存档码前缀 YJWX1 为 UTF-8 JSON 的 Base64；YJWX2 为同一 JSON 的 gzip + Base64。压缩能力不足时仍能使用 JSON 文件备份。

新功能在单文件后段的 `SHANHAI_VERSION` 标记开始，保留原版主体便于比对。未来规模继续扩大时建议将源码分模块维护、最终构建为单文件；不要删除兼容读取逻辑。
