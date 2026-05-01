# pf2e-compendium-extra-cn 发布流程

## 目录结构

- 工作区：`C:\Users\Taka\Desktop\fvtt\`（翻译文件编辑处）
- 发布区：`C:\Users\Taka\Desktop\fvttpublish\pf2e-compendium-extra\`（GitHub 仓库）
- 翻译文件位置：`compendium/` 目录下（参照 pf2e_compendium_chn 的发布结构，原 `compendium/cn/` 已扁平化）
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

### 4. Git 提交并推送

```powershell
cd C:\Users\Taka\Desktop\fvttpublish\pf2e-compendium-extra
git add -A
git commit -m "release: vA.B.C - <简要变更说明>"
git push
```

### 5. 打包 ZIP

```powershell
Compress-Archive -Path module.json,babele.js,compendium,.gitignore -DestinationPath "pf2e-compendium-extra-cn-vA.B.C.zip" -Force
```

只打包 FVTT 实际需要的内容（`module.json` / `babele.js` / `compendium/` / `.gitignore`）；不要 `-Path *`，否则会把 `glossary_sog.json`、备份文件、`release/`、脚本目录等都塞进 zip。

### 6. 创建 GitHub Release

准备 release notes 文件 `_tmp_release_notes.md`，然后：

```powershell
gh release create A.B.C pf2e-compendium-extra-cn-vA.B.C.zip module.json --title "vA.B.C" --notes-file _tmp_release_notes.md
```

**必须同时上传两个文件**：
- `pf2e-compendium-extra-cn-vA.B.C.zip`（FVTT 下载的模组包）
- `module.json`（FVTT 通过 manifest URL 检查更新用）

### 7. 清理临时文件

```powershell
Remove-Item _tmp_release_notes.md, pf2e-compendium-extra-cn-vA.B.C.zip
```

## 常见错误

- **忘记更新 `download` URL**：FVTT 会下载旧版 zip
- **忘记上传 `module.json` 到 release**：FVTT manifest 检查拿不到新版本信息
- **ZIP 打包前未更新 module.json**：ZIP 内的 module.json 版本号不对
- **新增 pack 文件后忘了跑 regen 脚本**：sidebar 上的 pack 名称仍是英文 —— 因为 patch 在 babele.init 阶段读 `labels.json` / `titles.json` 索引，而不是去解析每个 pack 文件

## FVTT 更新机制说明

1. FVTT 通过 `manifest` URL 获取最新 `module.json`
2. 比较本地版本号与远端 `version` 字段
3. 如果有新版本，通过 `download` URL 下载 zip
4. 因此 **release 附件中的 module.json 和 zip 中的 module.json 必须一致且都是最新版本**
