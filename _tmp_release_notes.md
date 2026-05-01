## v1.0.23 — 启用 PF2e homebrew 翻译

### 背景

PF2e 模组（Barbarians+ / Inventors+ / Magic+ / Oracles+ / Wizards+ / Tian Xia+ / Feats+ / Summoners+）通过 `module.json` 的 `flags.<moduleId>.pf2e-homebrew` 注册自定义 trait（如 `overkill`）和自定义 base weapon（如 `axewheel`）。这些数据 **不在合集包里** —— babele 完全看不到，结果是中文翻译列表里这些 trait 始终显示英文。

PF2e 系统在 `i18nInit` 钩子里把 flags 写入 `CONFIG.PF2E.{weaponTraits, featTraits, baseWeaponTypes, traitsDescriptions, ...}`。要翻译，必须在 `setup` 钩子（`i18nInit` 之后、UI 渲染之前）覆盖这些 CONFIG 条目。

### 变更

- **新增 `homebrew/` 目录**：8 个 `<moduleId>.homebrew.json`（barbarians / feats / inventors / magic / oracles-remastered / summoners-plus / tian-xia / wizards），结构 `{moduleId, moduleTitle, homebrew: {baseWeapons, weaponTraits, featTraits, ...}}`
- **新增 `scripts/inject-homebrew.js`**：在 `setup` 钩子里
  - 自动扫描所有 active 模组的 `pf2e-homebrew` flag（不需要手动维护列表，以后装新 Team+ 模组只要往 `homebrew/` 扔对应翻译 JSON 即可）
  - 拉取 `modules/pf2e-compendium-extra-cn/homebrew/<moduleId>.homebrew.json` 并覆盖 `CONFIG.PF2E.<recordKey>[id]`
  - 处理 `baseWeapons → baseWeaponTypes` / `baseArmors → baseArmorTypes` 的特殊重命名
  - 处理 PF2e 的 `TRAIT_PROPAGATIONS`（如 `classTraits` 注册时也会同步写到 `featTraits` 和 `spellTraits`）
  - 跳过形如 `PF2E.TraitDescriptionXxx` 的系统 i18n key（已经被 PF2e 自己翻译了）
- **`module.json`**：`esmodules` 加上 `scripts/inject-homebrew.js`
- **修正 1.0.22 的位置错误**：原本误放进 `compendium/` 的 8 个 `*.homebrew.json` 移到 `homebrew/`（之前 babele 完全没读到这些文件，所以 trait 翻译没生效）
- `RELEASE_PROCESS.md`：补充 `homebrew/` / `scripts/` 目录说明，打包路径加上这两个目录

### 受影响

启用了 Barbarians+ 等 Team+ 系列模组的玩家：升级后 `overkill`、`axewheel`、`modular-moonscythe` 这类 PF2e 系统私有 trait/weapon 才会显示中文。

### 来源

`scripts/inject-homebrew.js` 复制自 [`takaqiao/compendium-extractor` examples/inject-homebrew.js](https://github.com/takaqiao/compendium-extractor/blob/main/examples/inject-homebrew.js)（commit 2b99dae）。
