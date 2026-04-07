# pf2e-compendium-extra-cn 发布流程

## 目录结构

- 工作区：`C:\Users\Taka\Desktop\fvtt\`（翻译文件编辑处）
- 发布区：`C:\Users\Taka\Desktop\fvttpublish\pf2e-compendium-extra\`（GitHub 仓库）
- 翻译文件位置：`compendium/cn/` 目录下
- GitHub 仓库：`takaqiao/pf2e-compendium-extra-cn`

## 每次更新标准流程

### 1. 复制更新的翻译文件

将工作区的翻译 JSON 文件复制到发布区的 `compendium/cn/` 目录：

```powershell
Copy-Item "C:\Users\Taka\Desktop\fvtt\<文件名>.json" "C:\Users\Taka\Desktop\fvttpublish\pf2e-compendium-extra\compendium\cn\" -Force
```

### 2. 更新 module.json（三处必改）

打开 `module.json`，更新以下三个字段（假设从 X.Y.Z 升到 A.B.C）：

| 字段 | 说明 |
|---|---|
| `version` | 改为新版本号 `A.B.C` |
| `download` | 改为 `https://github.com/takaqiao/pf2e-compendium-extra-cn/releases/download/A.B.C/pf2e-compendium-extra-cn-vA.B.C.zip` |
| `changelog` | 改为 `https://github.com/takaqiao/pf2e-compendium-extra-cn/releases/tag/A.B.C` |

**注意**：`manifest` 字段使用 `latest/download/module.json`，无需修改。

### 3. Git 提交并推送

```powershell
cd C:\Users\Taka\Desktop\fvttpublish\pf2e-compendium-extra
git add -A
git commit -m "release: vA.B.C - <简要变更说明>"
git push
```

### 4. 打包 ZIP

```powershell
Compress-Archive -Path * -DestinationPath "pf2e-compendium-extra-cn-vA.B.C.zip" -Force
```

### 5. 创建 GitHub Release

准备 release notes 文件 `_tmp_release_notes.md`，然后：

```powershell
gh release create A.B.C pf2e-compendium-extra-cn-vA.B.C.zip module.json --title "vA.B.C" --notes-file _tmp_release_notes.md
```

**必须同时上传两个文件**：
- `pf2e-compendium-extra-cn-vA.B.C.zip`（FVTT 下载的模组包）
- `module.json`（FVTT 通过 manifest URL 检查更新用）

### 6. 清理临时文件

```powershell
Remove-Item _tmp_release_notes.md, pf2e-compendium-extra-cn-vA.B.C.zip
```

## 常见错误

- **忘记更新 `download` URL**：FVTT 会下载旧版 zip
- **忘记上传 `module.json` 到 release**：FVTT manifest 检查拿不到新版本信息
- **ZIP 打包前未更新 module.json**：ZIP 内的 module.json 版本号不对

## FVTT 更新机制说明

1. FVTT 通过 `manifest` URL 获取最新 `module.json`
2. 比较本地版本号与远端 `version` 字段
3. 如果有新版本，通过 `download` URL 下载 zip
4. 因此 **release 附件中的 module.json 和 zip 中的 module.json 必须一致且都是最新版本**
