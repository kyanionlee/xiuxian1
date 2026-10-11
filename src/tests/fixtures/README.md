# 旧版本迁移样本

这些是专为测试生成的新开局存档，不是用户实际进度。

- `shanhai-original.json`：原山海纪。
- `claude-ver5.json`：Claude 交付的 ver5 原文件。
- `integrated-ver5.json`：整合版 ver5 / 1.1.1。
- `ver6.json`：同行篇 / 1.2.0。

每个样本都在对应原始 HTML 的独立浏览器上下文中执行：选择傀儡师/矿工（旧版没有此选择时保持剑修），开始新局，进入首个战斗节点，将气血设为 47、灵石设为 123，调用该版本自己的 `captureBattle()` 和 `envelope()` 导出。

`manifest.json` 保存生成源 HTML 的 SHA-256 和导入后的预期值。随机地图和装备属于固定样本内容；测试不依赖某一次随机结果。迁移测试只依赖这里保存的 JSON，不需要联网获取历史构建。另有 legacy-regression.cjs 对旧召唤职业技能迁移进行针对性验证。
