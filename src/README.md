# 问道篇 v1.4.0 构建源码与交接说明

## 美术外置更新（2026-10-12）

图标批次：`src/icon-manifest.json` 映射 117 张独立的 160×160 WebP；`src/icons.js` 与 `src/icons.css` 负责升级卡、技能树、装备、物资、地图、宗门和职业选择。共覆盖 74 个基础技能/心法图案（职业心法复用对应基础图），12 种兵器、3 类防具、12 种物资、7 类节点和9宗门。图片约 1.03 MB，总量不代表首页下载量；HTML 图片使用 lazy 加载。新增技能时需补 manifest，`src/tests/icons.cjs` 会检查遗漏。

运行时图片现位于仓库根目录 `assets/`，全部使用 WebP 相对路径；必须和 `index.html` 一起部署。首页仅请求背景，战斗图集在进入战斗时请求，NPC 立绘在对应界面显示时请求。图片失败保留原有矢量战斗表现或人物文字，不阻塞启动。HTML 从 6,108,008 字节减少至约 454 KB；这降低启动解码负担，但不代表已证实所有 QQ 内置浏览器白屏原因。

`src/assets.js` 管理按需加载；`src/combat.js` 接入人物立绘；`src/base/ver6.html` 已将旧内嵌图集改为外部路径。`src/assets/` 保留历史 NPC 原图供美术编辑，构建不再嵌入它们。修改图片时优先新增带版本的文件名，避免浏览器旧缓存。

离线打包：先运行 `node src/build.cjs`，再运行 `npm run package:offline`。输出 `dist/xiuxian1-offline.zip`，包含 HTML 和完整 `assets/`。解压整个文件夹再打开 HTML，不可只复制 HTML。

资源专项测试：`node src/tests/assets.cjs`，检查启动请求、进入界面加载、断图回退、手机截图和本地文件协议。该测试启动本机 HTTP 服务；运行环境需要允许浏览器连接本机端口。完整功能和迁移测试仍为 `npm test`。

本目录能在不依赖作者电脑目录、不访问外部美术服务的情况下，重建仓库根目录 `index.html`。以 ver7 为底座，包含配色、小屏、指引与启动兼容修复，以及 Claude 提供的问道篇独立模块。

## 环境与构建

需要 Node.js 22 或更高版本；交接时使用 Node.js 24.16.0 验证。构建只用 Node 内置模块，不需要安装 npm 包，也不需要网络。

在仓库根目录执行：

```sh
node src/build.cjs
```

也可执行 `npm run build`。构建输出为仓库根目录 `index.html`，不是 `src/index.html`。脚本根据自身位置定位路径，能从其他工作目录调用。`npm run verify:baseline` 仅用于历史 ver7 提交，不能用于当前版本。

1.3.0 发布基线 SHA-256：

```text
D8DA7065686C60DB16B58B8421FF07D9BB73B06792847CE9E9B5A14299D00FCA
```

`verify:baseline` 是本次 1.3.0 可重现验收，不是以后所有版本都必须保持的哈希。后续有意修改功能时应记录新的版本基线，不能把真实修改伪装成构建偏差。

## 文件职责

| 路径 | 用途、修改位置 |
| --- | --- |
| `src/build.cjs` | 按确定顺序应用补丁、验证外部图片存在，生成根目录 HTML；改整合位置或补丁规则时修改这里 |
| `src/base/ver6.html` | 构建底座，图集使用根目录 assets 相对路径；不需要作者的旧 outputs 目录 |
| `src/trees.js` | 独立职业主动技能池、心法别名、前置技能与境界要求；在读档校验前注入 |
| `src/combat.js` | ver7 守阵、武器限制、技能树界面、旧档迁移、输入、首领行为、奇遇替换、NPC 立绘接入 |
| `src/style.css` | ver7 人物、技能树、战斗选项与手机样式；后续 UI 修复先修改此文件 |
| `src/assets/npc-portraits.webp` | 构建实际读取的六人图集；缺失时构建失败，不能静默退化为空图 |
| `src/assets/npc-portraits.png` | NPC 图集原始输出，供重新裁切或压缩；不是构建依赖，重建不会重新压缩原图 |
| `src/tests/` | 六组游戏检查、构建哈希校验、测试运行器 |
| `src/tests/fixtures/` | 四份由旧版本独立生成的人工测试存档及来源哈希，不包含玩家私人进度 |
| `package.json` / `package-lock.json` | 仅测试需要 Playwright，精确锁定依赖 |
| `.gitattributes` | 避免跨平台 checkout 改变 HTML / src 输入的换行字节 |

图集生成记录见根目录 `npc-portrait-notes.md`。早期图集已包含在底座 HTML 中，构建不再读取外部原图；要编辑这些资源，必须同步修改实际构建输入，不能仅替换一个未被引用的图片。

## 测试

```sh
npm ci
npx playwright install chromium
npm test
```

Linux 如果缺少浏览器运行库，可按 Playwright 的提示安装系统依赖，或执行 `npx playwright install --with-deps chromium`。

也可使用已安装的 Chrome/Chromium，设置环境变量 `PLAYWRIGHT_EXECUTABLE_PATH` 为浏览器路径后运行测试；默认不依赖固定 Windows 路径。测试创建独立临时浏览器上下文，不读取个人浏览器账户或真实游戏存档。

单组运行示例：

```sh
node src/tests/test.cjs
node src/tests/extra.cjs
node src/tests/legacy-test.cjs
node src/tests/legacy-extra.cjs
node src/tests/legacy-regression.cjs
node src/tests/legacy-migrate.cjs
```

| 测试 | 覆盖 |
| --- | --- |
| `test.cjs` | ver7 职业限制、技能树、迁移、守阵、首领、设置、手机布局 |
| `extra.cjs` | 替换奇遇、奖励去重、指针输入、远程攻阵、首领预警恢复 |
| `legacy-test.cjs` | 同行篇主线、地域、批量分解、物资、NPC、存档 |
| `legacy-extra.cjs` | 地方事件、跨轮回好感、触屏交互、大字号保存 |
| `legacy-regression.cjs` | 十职业技能与进化、召唤、副业、旧职业兼容 |
| `legacy-migrate.cjs` | 导入 fixtures 中四个旧版本存档，核对血量、灵石、职业与暂停状态 |

截图和报告写入被忽略的 `test-results/<测试名>/`，不会写回 `src/` 或覆盖其他组报告。历史迁移脚本原先实时运行作者机器上的旧 HTML；交接版改为读取随仓库保存的旧版本样本，避免依赖未提交的旧游戏文件。

交接时还修正了旧同行测试的布置：测试怪物放在玩家附近，并关闭随机词缀，避免出生位置变化导致“同伴减速”检查误报；未改游戏逻辑。干净克隆验证通过 609 项检查及 4 份旧档迁移。

这些测试不等于真实 iPhone/微信全流程验收。v1.4.0 已修复奇遇按钮的深色文字配深色背景，并检查了 320、360、390 像素小屏布局。启动增加旧主题监听接口兼容和可见错误提示；用户截图的白屏原因尚不能仅凭图片确定。

## 存档与维护约束

**不能更改存档键 `yjwx-save-stable` 和 `yjwx-save-previous`。** 保留旧格式导入和迁移；新增技能定义必须在含该技能的存档验证之前加载。当前没有账号云存档。

以后按以下顺序交付：修改 `src/` → 构建 → 针对性测试及必要回归 → 将源码与生成的根目录 `index.html` 一起提交。不要只改成品 HTML，下次构建会覆盖它。

这是旧单文件版本的完整可重建源码，不是把全部历史代码彻底模块化。进一步拆分底座时应单独提交，并先证明行为与旧档兼容。

## 问道篇 v1.4.0

新增 karma.js：因果簿、故人往事、跨世记忆，最后注入。guide.js：新手指引；readability.css：配色与小屏布局；ux.js：过关提示；boot.html：加载与失败提示。修改界面请优先编辑这些文件。tests/wendao.cjs 覆盖新功能及小屏、启动兼容。

verify:baseline 仅用于历史 ver7 源码提交，不适用于 v1.4.0；新版本先构建再运行 npm test。原 ver7 SHA-256 保留作历史核对。

## v1.5 新增源码（Claude）

- `music.js`：场景配乐模块，在 karma.js 之后注入。曲目在仓库根目录 `assets/music/`，离线包需要连同该文件夹一起打包。
- `fixes.js`：v1.5.1 修复（召唤数量逐重增长、统御、页面重绘保留滚动与折叠状态）与轮回殿「道果」高阶项目（UPS 中 tier:2，开局效果在 applyDaoguo），最后注入。
- 注入顺序（build.cjs）：karma.js → music.js → fixes.js → `showTitle();`。新模块应排在 fixes.js 之前或之后，取决于是否需要包装它修改过的函数。

- `qinggong.js`：v1.6.0 轻功（空格 / 双击冲刺、无敌帧、次数回复、HUD 与残影），在 fixes.js 之后注入。数值集中在 `qgStats()`。
- `dasharts.js`：轻功联动（职业轻功 `DASH_ARTS`、云履词条 `DASH_FX`），在 qinggong.js 之后、notice.js 之前注入。效果在 `dashStart` / `dashEnd` 中实现。
- `rush.js`：鸣钟赏（提前迎战奖励），包装 rush / assault / summonFinal，数值在文件开头注释。在 dasharts.js 之后、notice.js 之前注入。
- `feedback.js`：v1.6.0 试玩反馈修正（引妖、从容难度、出发提醒、职业平衡、环身技能特效、自动流畅模式等），在 rush.js 之后、notice.js 之前注入。
- `notice.js`：更新公告，最后注入。**每次发布新版本时，在 `NOTICES` 数组最前面加一条**（版本号、标题、要点），老玩家首次打开就会看到。是否已读存在 `settings.noticeSeen` / `settings.noticeNever`。

## 手机界面与战斗表现补丁（待主维护者构建发布）

- `mobile-polish.js`：暂停入口防重复、底部继续按钮、默认展开心法、触屏鸣钟/引妖文案；落剑、雕玉印、雷阵、禁锢及环身特效。仅绘制变化，保留伤害、半径、命中时机和存档键。
- `mobile-polish.css`：紧凑手机卡片和图标、44px 触控目标、暂停底栏。
- 在 `feedback.js` 之后、`notice.js` 之前注入；图标样式后加载补丁样式。
- 本次按作者要求只提交 src，不生成根目录成品、不改版本号。由主维护者统一更新公告、版本及成品后发布。
- 定向验证：`node src/tests/mobile-polish.cjs`。构建结果仅存内存，不读写根目录 index.html；检查四个视口、反复暂停/切页、心法、触控功能及特效绘制。不代替完整测试或真机验收。

## v1.6.1 新增源码（Claude）

- `v161.js`：确认框 `askConfirm`、属性加点暂存、研习引导、开局宗门、杂兵与兽潮外圈、流派共鸣。在 `mobile-polish.js` 之后、`notice.js` 之前注入；数值集中在文件开头的 `V161`。
- 定向测试 `node src/tests/v161.cjs`（构建只在内存中进行），已加入 `run.cjs`；`mobile-polish.cjs` 也一并加入。
- 所有测试现在都读取 `PLAYWRIGHT_EXECUTABLE_PATH`。
- 交接手册改名为 `docs/handbook.md`。
