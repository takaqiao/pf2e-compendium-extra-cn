# PF2e 第三方合集中文翻译 / PF2e Compendium Extra (CN)

[![GitHub release](https://img.shields.io/github/v/release/takaqiao/pf2e-compendium-extra-cn?style=flat-square&label=release&logo=github)](https://github.com/takaqiao/pf2e-compendium-extra-cn/releases/latest)
[![Foundry version](https://img.shields.io/endpoint?url=https%3A%2F%2Ffoundryshields.com%2Fversion%3Furl%3Dhttps%3A%2F%2Fgithub.com%2Ftakaqiao%2Fpf2e-compendium-extra-cn%2Freleases%2Flatest%2Fdownload%2Fmodule.json&style=flat-square)](https://foundryvtt.com/packages/pf2e-compendium-extra-cn)
[![Total downloads](https://img.shields.io/github/downloads/takaqiao/pf2e-compendium-extra-cn/total?style=flat-square&label=downloads&color=brightgreen)](https://github.com/takaqiao/pf2e-compendium-extra-cn/releases)
[![Latest downloads](https://img.shields.io/github/downloads/takaqiao/pf2e-compendium-extra-cn/latest/total?style=flat-square&label=latest)](https://github.com/takaqiao/pf2e-compendium-extra-cn/releases/latest)
[![Foundry VTT](https://img.shields.io/badge/Foundry%20VTT-v13%20%7C%20v14-orange?style=flat-square&logo=foundryvirtualtabletop&logoColor=white)](https://foundryvtt.com/)
[![Pathfinder 2e](https://img.shields.io/badge/system-PF2e-c1272d?style=flat-square)](https://foundryvtt.com/packages/pf2e)
[![Babele](https://img.shields.io/badge/Babele-required-7b3f99?style=flat-square)](https://foundryvtt.com/packages/babele)

为 Foundry VTT 上 PF2e 系统的常见**第三方合集模组**提供中文翻译，依赖 Babele 加载。

涵盖范围（持续扩充）：
- pf2e-jb2a-macros、pf2e-toolbelt、pf2e-hud、pf2e-visioner、xdy-pf2e-workbench
- abomination-vaults 系列冒险与社区附加包
- 多个 homebrew 模组（traits / weapons / feats 注入）
- Hero Action Deck：52 张英雄行动牌、52 张中文卡面、29 条界面文字

## Hero Action Deck 汉化（v1.0.56）

已归并 [pf2e-hero-deck-cn 1.0.0](https://github.com/takaqiao/pf2e-hero-deck-cn/releases/tag/1.0.0) 的完整汉化。使用时启用上游 `pf2e-hero-deck-unofficial` 和 extra，世界语言设为中文（`cn`）；未使用 HAD 的世界无需安装它。

从独立汉化迁移时，先停用 `pf2e-hero-deck-cn`，保留其安装文件，由 GM 重新进入世界。extra 会把现有世界牌堆中 52 种已知旧中文卡图路径迁入 extra，并将配置的手牌、弃牌堆默认英文名改为中文。自定义图片和名称保持原样，牌的 ID、排序、抽取状态及所属牌堆均保留；不需要删除任何牌堆。确认已有牌面显示正常后，可卸载旧独立汉化。

新建牌堆使用 extra 的完整译文；安装汉化之前创建的英文世界牌堆仍是旧快照，此次迁移只修复旧中文卡图路径，不覆盖已有牌的正文。仍有手牌或正在进行的牌局时，请保留这些世界文档。

旧独立汉化与 extra 同时启用时，世界路径迁移暂不执行；完成停用旧汉化后重新进入即可。HAD 本体仍须启用。

卡面、译文及授权说明来自原汉化包。规则、美术和代码归属见 [HAD 授权说明](assets/hero-action-deck/LICENSE.txt)；卡面基于 ChasarooniZ 公开模板，字体文件未分发。

## 安装 / Install

在 Foundry → **附加模块 → 安装模块** 中粘贴 manifest URL：

```
https://github.com/takaqiao/pf2e-compendium-extra-cn/releases/latest/download/module.json
```

## 内容结构 / Layout

- `compendium/` — Babele 翻译的合集包 JSON（每个 pack 一个文件，加 `labels.json` / `titles.json` 索引）
- `homebrew/` — PF2e 系统的 homebrew 翻译 JSON（每个目标 PF2e 模组一个 `<moduleId>.homebrew.json`）；由 `scripts/inject-homebrew.js` 在 `setup` 钩子覆盖 `CONFIG.PF2E.{weaponTraits, featTraits, baseWeaponTypes, traitsDescriptions, ...}`
- `babele.js` — Babele register 入口
- `scripts/regen-labels-titles.py` — 改动 `compendium/` 后重新生成索引

## 依赖 / Requires

- Foundry VTT v13 ~ v14（Babele 2.9.1 要求 v13 起；本次原生验收使用 v14）
- PF2e 系统
- [Babele](https://foundryvtt.com/packages/babele) v2.9.1（憎恶地窟结构映射已绑定此版本接口）
- 主翻译包 `pf2e_compendium_chn`（被翻译的第三方模组本身的翻译挂在这里）

详细工作流见 [RELEASE_PROCESS.md](RELEASE_PROCESS.md)。

## 亵渎堡垒系统 bestiary（v1.0.56）

修正 14 个角色中 21 个名称与正文：补回顽皮疯猴的耳聋状态并纠正盗窃目标数、修正稳固步伐的压制对象及时限、回溯过去的时间轴与升环规则，以及其余已核实的规则信息和术语。喷射与长弓涂覆的名称沿用同实体 BoB 项目已审译文。

保留 PF2e 8.5.0 基线，8.5.1 使用独立译文变体同步 Infect Shame 检定参数；版本选源同时覆盖原生完整加载、玩家发布源和核心汉化按需入口。已有世界中的角色仍是导入快照，不会被此更新自动覆盖。

## 亵渎堡垒 Adventure（v1.0.54）

加入《亵渎堡垒》Bastion of Blasphemies 的 Adventure 汉化，覆盖角色、物品、日志、场景、导入器及战役管理器，并补齐相关规则、纪念品和动态显示。需另行安装原版 `pf2e-bastion-of-blasphemies`；extra 不包含原版冒险资源。

已验环境：BoB 1.0.0、Foundry 14.368、PF2e 8.5.1、Babele 2.9.1、pf2_cn 2.5.1、核心合集汉化 3.1.2。BoB 适配绑定上述版本；完整加载和按需加载均已验收。安装或更新 extra 不会自动覆盖已有世界中的冒险文档。

## 憎恶地窟（v1.0.49）

更新官方冒险、系统 bestiary、Addons、Expanded、Gauntlight Extras 与 Otari Extras 的 8 个合集，补齐 Actor、物品、日志、场景及嵌入条目的中文显示。加入结构映射、效果徽记翻译、旧式内容链接显示适配，以及按需加载的重复翻译保护。

已验环境：Foundry 14.367、PF2e 8.5.0、Babele 2.9.1、核心汉化 3.1.2；官方 AV 4.1.3、Addons 2.1.0、Expanded 3.2.0、Gauntlight Extras 2.0.0、Otari Extras 2.1.1。其它版本不在此次原生验收范围内。

基础合集汉化通过正常安装 extra 获得。Addons 2.1.0 和 Expanded 3.2.0 中部分动画、布景与午夜章节插入使用硬编码英文名称；相关兼容修复及弹窗中文另外提供为 Release 的 `av-source-compat-v1.0.49.zip` 附件。它仅适用于原版文件 SHA-256 匹配的上述版本，安装方法见 [兼容补丁说明](compat/av-1.0.49/README.md)。Foundry 更新 extra 不会自动修改这些第三方模块。

本次发布不会覆盖已有世界。原包缺失的链接目标及未安装依赖仍保留原目标；Monk's Enhanced Journal 界面未纳入本次原生验收。

## 原生世界时钟（v1.0.55）

从 1.0.55 起，同时启用本模组和 `pf2_cn` 时，简体中文界面的原生 PF2e 世界时钟使用财商月、仇欲月、生死月、风海月、星梦月、阳愈月、农狩月、人文月、怒灾月、狂噩月、魔法月、苦暗月。

日期显示示例：`4726 AR，怒灾月30日，月之日`。覆盖会移除旧日期模板中失效的序数后缀参数，并让共用序数词返回数字，修正 `30thundefined` 和法术环阶中的英文后缀。

覆盖在语言初始化时同步应用；更新后重新载入游戏页面即可生效。无需修改 `pf2_cn` 或 PF2e 系统文件，不改变游戏时间、日历计算、星期译名及英文界面。回归测试：`node --test tests/world-clock-i18n.test.mjs`。
