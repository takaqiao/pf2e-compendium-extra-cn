# PF2e 第三方合集中文翻译 / PF2e Compendium Extra (CN)

[![GitHub release](https://img.shields.io/github/v/release/takaqiao/pf2e-compendium-extra-cn?style=flat-square&label=release&logo=github)](https://github.com/takaqiao/pf2e-compendium-extra-cn/releases/latest)
[![Foundry version](https://img.shields.io/endpoint?url=https%3A%2F%2Ffoundryshields.com%2Fversion%3Furl%3Dhttps%3A%2F%2Fgithub.com%2Ftakaqiao%2Fpf2e-compendium-extra-cn%2Freleases%2Flatest%2Fdownload%2Fmodule.json&style=flat-square)](https://foundryvtt.com/packages/pf2e-compendium-extra-cn)
[![Total downloads](https://img.shields.io/github/downloads/takaqiao/pf2e-compendium-extra-cn/total?style=flat-square&label=downloads&color=brightgreen)](https://github.com/takaqiao/pf2e-compendium-extra-cn/releases)
[![Latest downloads](https://img.shields.io/github/downloads/takaqiao/pf2e-compendium-extra-cn/latest/total?style=flat-square&label=latest)](https://github.com/takaqiao/pf2e-compendium-extra-cn/releases/latest)
[![Foundry VTT](https://img.shields.io/badge/Foundry%20VTT-v12%20%7C%20v14-orange?style=flat-square&logo=foundryvirtualtabletop&logoColor=white)](https://foundryvtt.com/)
[![Pathfinder 2e](https://img.shields.io/badge/system-PF2e-c1272d?style=flat-square)](https://foundryvtt.com/packages/pf2e)
[![Babele](https://img.shields.io/badge/Babele-required-7b3f99?style=flat-square)](https://foundryvtt.com/packages/babele)

为 Foundry VTT 上 PF2e 系统的常见**第三方合集模组**提供中文翻译，依赖 Babele 加载。

涵盖范围（持续扩充）：
- pf2e-jb2a-macros、pf2e-toolbelt、pf2e-hud、pf2e-visioner、xdy-pf2e-workbench
- abomination-vaults 系列冒险与社区附加包
- 多个 homebrew 模组（traits / weapons / feats 注入）

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

- Foundry VTT v12 ~ v14
- PF2e 系统
- [Babele](https://foundryvtt.com/packages/babele) v2.7.5+
- 主翻译包 `pf2e_compendium_chn`（被翻译的第三方模组本身的翻译挂在这里）

详细工作流见 [RELEASE_PROCESS.md](RELEASE_PROCESS.md)。
