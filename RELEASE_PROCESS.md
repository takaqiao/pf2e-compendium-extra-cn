# pf2e-compendium-extra-cn 发布流程

## 目录结构

- 工作区：`C:\Users\Taka\Desktop\fvtt\`（翻译文件编辑处）
- 发布区：`C:\Users\Taka\Desktop\fvttpublish\pf2e-compendium-extra\`（GitHub 仓库）
- 翻译文件位置：
  - `compendium/`：babele 翻译的合集包 JSON（每个 pack 一个文件 + `labels.json` + `titles.json`）
  - `homebrew/`：PF2e 系统的 homebrew 翻译 JSON（每个 PF2e 模组一个 `<moduleId>.homebrew.json`），由 `scripts/inject-homebrew.js` 在 `setup` 钩子里覆盖 `CONFIG.PF2E.{weaponTraits, featTraits, baseWeaponTypes, traitsDescriptions, ...}`
  - `scripts/`：构建/运行时辅助脚本
- GitHub 仓库：`takaqiao/pf2e-compendium-extra-cn`

## 每次更新标准流程

### 1. 复制更新的翻译文件

将工作区的翻译 JSON 文件复制到发布区的 `compendium/` 目录：

```powershell
Copy-Item "C:\Users\Taka\Desktop\fvtt\<文件名>.json" "C:\Users\Taka\Desktop\fvttpublish\pf2e-compendium-extra\compendium\" -Force
```

### 2. 重新生成 labels.json / titles.json

只要 `compendium/` 下增删了 pack 文件、改了某个 pack 的 `label` 或 `entries[*].name`，就要重跑：

```powershell
python scripts\regen-labels-titles.py
```

脚本会扫描 `compendium/*.json`，重写 `labels.json` 与 `titles.json`。**漏跑这一步**：sidebar 上新 pack 名仍是英文，合集包浏览器列表里条目名也是英文（pack 内容点开仍是中文，但索引层翻不到）。

### 3. 更新 module.json（三处必改）

打开 `module.json`，更新以下三个字段（假设从 X.Y.Z 升到 A.B.C）：

| 字段 | 说明 |
|---|---|
| `version` | 改为新版本号 `A.B.C` |
| `download` | 改为 `https://github.com/takaqiao/pf2e-compendium-extra-cn/releases/download/A.B.C/pf2e-compendium-extra-cn-vA.B.C.zip` |
| `changelog` | 改为 `https://github.com/takaqiao/pf2e-compendium-extra-cn/releases/tag/A.B.C` |

**注意**：`manifest` 字段使用 `latest/download/module.json`，无需修改。

### 4. 提交并推 tag —— 发版由 CI 完成

`.github/workflows/release.yml` 监听形如 `X.Y.Z` 的 tag（`on.push.tags: "[0-9]+.[0-9]+.[0-9]+"`）。
推上 tag 之后 CI 会自己完成打包与发布，**不要再手工 `gh release create`**，否则会和 CI 撞车。

```powershell
cd C:\Users\Taka\Desktop\fvttpublish\pf2e-compendium-extra
git add -A
git commit -m "release: vA.B.C - <简要变更说明>"
git push
git tag A.B.C
git push origin A.B.C     # <- 这一步才是发版触发器
gh run watch
```

CI 依次做四件事：

1. 校验 `module.json` 的 `version` 与 tag 一致、`download` URL 指向该 tag
2. 按**白名单**打包（见 §5）
3. 建 release，同时上传 zip 与 `module.json`（`fail_on_unmatched_files: true`）
4. 向 foundryvtt.com 的 package registry 发布该版本

**release notes 取自被打 tag 那个 commit 的 message**（`git log -1 --format=%B`）
＋ `.github/release-body-template.md`。所以 commit message 就是 changelog：沿用
`release: vX.Y.Z - <摘要>` ＋ 空行 ＋ 项目符号正文。

⚠️ 若 PR 走 squash-merge，GitHub 会用 PR 标题+描述替换掉 commit message。
CI 读的是 **tag 所在 commit** 的 message —— 要么把同样正文写进 PR 描述，
要么用 `--merge` 合并。

### 5. zip 白名单（CI 内，仅供核对）

```
module.json  babele.js  inject-lang.js  compendium  homebrew  lang  scripts  .gitignore
```

`inject-lang.js` 与 `lang/` **必须在内**：`module.json` 的 `esmodules` 声明了
`inject-lang.js`，漏掉它模组会因 404 起不来；`lang/external/<模组id>.json` 是用来
覆盖第三方模组自带 i18n 的载荷。

> 本文件此前的 §5–§7 写的是手工 `Compress-Archive` + `gh release create` 流程。
> 那与 CI 并存会撞车，且那份 `-Path` 清单**漏了 `inject-lang.js` 和 `lang`**，
> 照它打出来的包会缺一个已声明的 esmodule。已废弃。

## 常见错误

- **忘记更新 `download` URL**：FVTT 会下载旧版 zip
- **忘记上传 `module.json` 到 release**：FVTT manifest 检查拿不到新版本信息
- **ZIP 打包前未更新 module.json**：ZIP 内的 module.json 版本号不对
- **新增 pack 文件后忘了跑 regen 脚本**：sidebar 上的 pack 名称仍是英文 —— 因为 patch 在 babele.init 阶段读 `labels.json` / `titles.json` 索引，而不是去解析每个 pack 文件
- **homebrew 翻译放进了 `compendium/`**：babele 不读这种文件（结构是 `{moduleId, moduleTitle, homebrew}` 不是 `{label, entries, ...}`），结果什么都不会生效。必须放在 `homebrew/` 下并由 `scripts/inject-homebrew.js` 在 setup 钩子覆盖 `CONFIG.PF2E.*`

## FVTT 更新机制说明

1. FVTT 通过 `manifest` URL 获取最新 `module.json`
2. 比较本地版本号与远端 `version` 字段
3. 如果有新版本，通过 `download` URL 下载 zip
4. 因此 **release 附件中的 module.json 和 zip 中的 module.json 必须一致且都是最新版本**
