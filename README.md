# PF2e 第三方合集中文翻译 / PF2e Compendium Extra (CN)

[![GitHub release](https://img.shields.io/github/v/release/takaqiao/pf2e-compendium-extra-cn?style=flat-square&label=release&logo=github)](https://github.com/takaqiao/pf2e-compendium-extra-cn/releases/latest)
[![Foundry version](https://img.shields.io/endpoint?url=https%3A%2F%2Ffoundryshields.com%2Fversion%3Furl%3Dhttps%3A%2F%2Fgithub.com%2Ftakaqiao%2Fpf2e-compendium-extra-cn%2Freleases%2Flatest%2Fdownload%2Fmodule.json&style=flat-square)](https://foundryvtt.com/packages/pf2e-compendium-extra-cn)
[![Total downloads](https://img.shields.io/github/downloads/takaqiao/pf2e-compendium-extra-cn/total?style=flat-square&label=downloads&color=brightgreen)](https://github.com/takaqiao/pf2e-compendium-extra-cn/releases)
[![Latest downloads](https://img.shields.io/github/downloads/takaqiao/pf2e-compendium-extra-cn/latest/total?style=flat-square&label=latest)](https://github.com/takaqiao/pf2e-compendium-extra-cn/releases/latest)
[![Pathfinder 2e](https://img.shields.io/badge/system-PF2e-c1272d?style=flat-square)](https://foundryvtt.com/packages/pf2e)
[![Babele](https://img.shields.io/badge/Babele-required-7b3f99?style=flat-square)](https://foundryvtt.com/packages/babele)

为 Foundry VTT 上 PF2e 系统的常见**第三方合集模组**提供中文翻译，依赖 Babele 加载。

涵盖范围（持续扩充）：
- pf2e-jb2a-macros、pf2e-toolbelt、pf2e-hud、pf2e-visioner、xdy-pf2e-workbench
- abomination-vaults 系列冒险与社区附加包
- 多个 homebrew 模组（traits / weapons / feats 注入）
- Hero Action Deck：52 张英雄行动牌、52 张中文卡面、29 条界面文字

## 亵渎堡垒 1.0.1 补汉（v1.0.67）

补齐 BoB 1.0.1 更新的冒险文字、场景名称和战役管理器界面，以及导入时从 PF2e 系统合集刷新的相关能力、效果和出版信息。旧版显示来源与信物标记继续保留；修正新版信物、鬼火免疫和伤害结算后恐血症提示的中文显示。

更新 Extra 不会重新导入世界。BoB 的 Safe Reimport 会保留主岛已有 Token 和同 ID 场景对象，因此不会包含新版对这些对象的全部修改；选中导入的角色、物品与日志仍会按上游流程更新。BoB 1.0.1 的信物归还自动进度另有上游方法名错误，本版没有更改该流程。

同时收录主服已经使用的法术译文修正和装备来源修正，保留光亮术的空目标字段、Trusty Helmet 的护甲加值条件与 Name Pendant 的负载修正。

涉及的八个 Monster Core 角色继承了当前核心汉化的完整条目，以保留其余译文。以后更新这些核心条目时，需要同步核对 Extra 中对应的条目。

## Magic+ 层面配置汉化（v1.0.66）

补译 Magic+ 1.4.1 层面配置窗口、预设操作和动态预览，以及新规则中的 271 条选项名与说明。PF2e 与 SF2e 两套合集译文同步覆盖，选择值、规则条件、伤害数值和内联语法保持上游内容。

13 种层面召唤宏补上缺少 Token、缺少 Foundry Summons、环阶选择和取消清理等提示。译文适用于从合集读取或新导入的宏；世界中此前保存的宏副本不会自动改写，需重新从合集导入才能使用新提示。

## Team+ Magic 1.4.1 对齐（v1.0.65）

Team+ 的显示适配不再按模组脚本的整文件哈希放行。此前 Magic+ 升到 1.4.1 后脚本字节变了，Dynamic Mastery 按钮等 12 条界面文字和已精通动态法术的中文描述因此全部退回英文。现在模组启用即生效，每一处替换仍要求逐条原文完全一致，原文对不上的条目照常显示上游原文；源码指纹只写进诊断记录。

补译 Magic+ 1.4.1 改动的两页日志：层面形态 3、7、10 环升阶加上无武装打击的额外伤害，天族层面里 Agathion 的豁免调整按上游删去，pf2e 与 sf2e 两份各按原有措辞。新增规则元素名「调整层面 (Magic+)」，移除上游已删除的「模板层面变形」。sf2e 一侧 46 条描述和 1 页日志里的内联链接与掷骰公式跟随上游换成 sf2e 路径。新版的层面配置窗口和新格式规则里的选项文字尚未汉化。

## 清单记录整理（v1.0.64）

只改 `module.json` 里的记录字段，译文和脚本与 1.0.63 相同。Team+ 对齐记录里的 Magic+ 版本写成 1.3.7：它的更新日志只有一处规则修复，按 1.3.7 的合集导出核对，译文覆盖怪物 13/13、物品 401/401，没有多余的键；独立审校记录去掉「本地补丁」标记，那批改动自 1.0.63 起已随正式发行包发布。

## PF2e 8.6.1 与核心汉化 3.2.3 适配（v1.0.63）

PF2e 8.6.1 重新构建后，聊天消息渲染方法的源码与此前登记的版本不同，Eldamon Legends 的一句聊天提示因此退回英文。本版登记了 8.6.1 的源码指纹，此前的登记全部保留；未登记的源码仍保留上游显示。

核心汉化未自行注册时，extra 的补偿注册只指向发行包里实际存在的 `compendium` 目录。核心汉化 3.2.3 会逐个列出已注册目录，有目录列不出时不缓存译文文件清单，也不共享给玩家。

Alchemists+ 补上 8 个物品的未鉴定名称和「化学攻城术」的规则开关标签，SF2e 一侧另修订 11 个条目的术语。Magic+ 1.3.7 的发行脚本与已登记内容一致，显示适配无需改动。

## 适配检查与来源字段匹配（v1.0.62）

AV、Team+、Basic、Eldamon Legends、Leshy 和日志样式显示适配不再按 Foundry、PF2e 或依赖模组的版本数字停用。适配仍检查语言、启用状态、源码与文档身份、所需接口、权限和可见性；未知源码或结构保留上游行为。Team+ 按已审核的源码内容选择适配，支持现役 PF2e 8.6 与 Dailies 4.21 的对应显示入口。

SoG 和 BoB 的变化字段按实际英文原文选择译文，旧版与新版字段可以在同一文档中分别匹配。未知字段保留原文，用户译文及自定义映射继续生效。`compendium` 与旧 `compendium-851` 路径保留相同载荷；原生完整加载、Published 和旧按需加载保留自定义来源优先级，PR43 桥沿用原有来源策略。

纳入 Alchemists+ 1.0.2、Barbarians+ 1.1.5、Magic+ 1.3.6、Tian Xia+ 1.0.1、Wizards+ 1.1.4 的译文与显示适配，保留此前支持的版本。同步现役的 homebrew 翻译索引、Babele 按需加载检查和 BoB 的 libWrapper 接入修正。

## 安装修正（v1.0.57）

修复 1.0.56 安装时的 `languages[2].lang: Incorrect locale information provided`：移除无效的 `zh_Hans` 声明，保留 `cn`、`zh-CN` 和 `zh-Hans`。BoB 与 HAD 的汉化内容保持不变。安装地址无需修改，重新安装或检查更新即可。

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

- Foundry VTT（本模块不设置核心版本号门槛；各适配仍检查所需接口和来源数据，原生验收记录见下文）
- PF2e 系统
- [Babele](https://foundryvtt.com/packages/babele)（已验 2.9.1；运行时检查所需映射接口，不按版本号限制）
- 主翻译包 `pf2e_compendium_chn`（被翻译的第三方模组本身的翻译挂在这里）

详细工作流见 [RELEASE_PROCESS.md](RELEASE_PROCESS.md)。

## 亵渎堡垒系统 bestiary（v1.0.56）

修正 14 个角色中 21 个名称与正文：补回顽皮疯猴的耳聋状态并纠正盗窃目标数、修正稳固步伐的压制对象及时限、回溯过去的时间轴与升环规则，以及其余已核实的规则信息和术语。喷射与长弓涂覆的名称沿用同实体 BoB 项目已审译文。

保留 PF2e 8.5.0 与 8.5.1 的对应规则译文；自 1.0.62 起按 Infect Shame 等变化字段的实际原文匹配，不再按版本选择整包。已有世界中的角色仍是导入快照，不会被此更新自动覆盖。

## 亵渎堡垒 Adventure（v1.0.54）

加入《亵渎堡垒》Bastion of Blasphemies 的 Adventure 汉化，覆盖角色、物品、日志、场景、导入器及战役管理器，并补齐相关规则、纪念品和动态显示。需另行安装原版 `pf2e-bastion-of-blasphemies`；extra 不包含原版冒险资源。

已验环境：BoB 1.0.0、Foundry 14.368、PF2e 8.5.1、Babele 2.9.1、pf2_cn 2.5.1、核心合集汉化 3.1.2。上述版本为原生验收记录，适配仍检查所需接口和来源数据；完整加载和按需加载均已验收。安装或更新 extra 不会自动覆盖已有世界中的冒险文档。

## 憎恶地窟（v1.0.49）

更新官方冒险、系统 bestiary、Addons、Expanded、Gauntlight Extras 与 Otari Extras 的 8 个合集，补齐 Actor、物品、日志、场景及嵌入条目的中文显示。加入结构映射、效果徽记翻译、旧式内容链接显示适配，以及按需加载的重复翻译保护。

已验环境：Foundry 14.367、PF2e 8.5.0、Babele 2.9.1、核心汉化 3.1.2；官方 AV 4.1.3、Addons 2.1.0、Expanded 3.2.0、Gauntlight Extras 2.0.0、Otari Extras 2.1.1。其它版本不在此次原生验收范围内。

基础合集汉化通过正常安装 extra 获得。Addons 2.1.0 和 Expanded 3.2.0 中部分动画、布景与午夜章节插入使用硬编码英文名称；相关兼容修复及弹窗中文另外提供为 Release 的 `av-source-compat-v1.0.49.zip` 附件。它仅适用于原版文件 SHA-256 匹配的上述版本，安装方法见 [兼容补丁说明](compat/av-1.0.49/README.md)。Foundry 更新 extra 不会自动修改这些第三方模块。

本次发布不会覆盖已有世界。原包缺失的链接目标及未安装依赖仍保留原目标；Monk's Enhanced Journal 界面未纳入本次原生验收。

## 原生世界时钟（v1.0.55）

从 1.0.55 起，同时启用本模组和 `pf2_cn` 时，简体中文界面的原生 PF2e 世界时钟使用财商月、仇欲月、生死月、风海月、星梦月、阳愈月、农狩月、人文月、怒灾月、狂噩月、魔法月、苦暗月。

日期显示示例：`4726 AR，怒灾月30日，月之日`。覆盖会移除旧日期模板中失效的序数后缀参数，并让共用序数词返回数字，修正 `30thundefined` 和法术环阶中的英文后缀。

覆盖在语言初始化时同步应用；更新后重新载入游戏页面即可生效。无需修改 `pf2_cn` 或 PF2e 系统文件，不改变游戏时间、日历计算、星期译名及英文界面。回归测试：`node --test tests/world-clock-i18n.test.mjs`。
