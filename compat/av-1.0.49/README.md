# 憎恶地窟：可选脚本兼容补丁（extra 1.0.49）

此附件用于 **Abomination Vaults Addons 2.1.0** 与 **Abomination Vaults Expanded 3.2.0**。它只修改这两个已安装模块的 7 个脚本；不包含第三方模块完整源码、冒险包、素材、世界数据或备份。请自行安装原模块及配套 **pf2e-compendium-extra-cn 1.0.49**。本附件不是可导入 Foundry 的模块。

标准合集、Actor、Item 的汉化与浏览不依赖本附件。以下扩展功能需要它：

- Addons：贝科拉攻击动画在需要新建 Token 时，按稳定身份找到汉化后的贝科拉；“凄凉灯塔的复仇”布景找到正确危害 Actor。
- Expanded：启用“插入日志”后，在 C1、C8、C34、C35 正确截取并插入中文“午夜的献祭”段落。未打补丁时，原脚本按英文标题截取中文文本可能报错；不会修改基础日志正文。
- Addons 的开场动画选择框、部分通知；Expanded 的贝科拉之握方向框、关闭按钮和依赖提示使用中文。动画原本需要的 Sequencer/JB2A 等依赖仍需安装。

已验证环境：Foundry **14.367**、PF2e **8.5.0**、Babele **2.9.1**、核心汉化 **3.1.2**、上述两个模块的确切版本。补丁内仍保留中文语言、模块版本和实体来源限制。

## 必须先做

1. **完全关闭 Foundry 服务及其他正在使用该 Data 目录的 Foundry 实例。** `verify.py` 不检查进程，也不会替你停服。
2. 将此附件的四个文件放在同一文件夹；准备 Python 3 与 Git（Windows 可使用 Git for Windows）。
3. 备份 `manifest.json` 列出的 **全部 7 个原文件**，保留相对 `Data/modules` 的目录结构，备份放在模块目录之外。没有完整备份不要应用补丁。
4. 确认两个模块版本完全匹配。校验必须显示 `PASS`，且退出码为 0。任一文件缺失、SHA 不符、混合版本或自行改过文件都必须停止。

`verify.py` **只读**：只核对两个模块的版本、补丁 SHA 和全部 7 个目标文件 SHA，不安装、不备份、不修改文件。`before` 要求全部为原版；`after` 要求全部为修补版，不接受混合状态。

原始与修补脚本均为 **UTF-8、LF 换行**。不要用编辑器、FTP 文本模式或 `unix2dos` 转换换行；CRLF 文件会被严格 SHA 校验拒绝。不要使用 `--ignore-whitespace`、`--3way`、`--reject` 或自行强行套用。

## Windows / PowerShell：应用

把两个路径改为实际目录。每一步失败都会停止该步骤；不要跳过错误继续执行。

```powershell
$AvCompat = (Resolve-Path 'C:\Downloads\av-source-compat-v1.0.49').Path
$AvModules = (Resolve-Path 'C:\FoundryData\Data\modules').Path

python "$AvCompat\verify.py" --modules "$AvModules" --expect before
if ($LASTEXITCODE -ne 0) { throw '原版 SHA/版本校验失败，停止。' }

git -c core.autocrlf=false -C "$AvModules" apply --check --unidiff-zero "$AvCompat\av-source-compat.patch"
if ($LASTEXITCODE -ne 0) { throw '补丁检查失败，停止。' }

git -c core.autocrlf=false -C "$AvModules" apply --unidiff-zero "$AvCompat\av-source-compat.patch"
if ($LASTEXITCODE -ne 0) { throw '应用失败；保持停服，按下方恢复说明处理。' }

python "$AvCompat\verify.py" --modules "$AvModules" --expect after
if ($LASTEXITCODE -ne 0) { throw '修补后 SHA 校验失败；不要启动 Foundry。' }
```

全部通过后再启动 Foundry，并确认 extra 与对应原模块已启用。

## Linux / Bash：应用

```bash
AV_COMPAT='/path/to/av-source-compat-v1.0.49'
AV_MODULES='/path/to/FoundryData/Data/modules'

python3 "$AV_COMPAT/verify.py" --modules "$AV_MODULES" --expect before &&
git -c core.autocrlf=false -C "$AV_MODULES" apply --check --unidiff-zero "$AV_COMPAT/av-source-compat.patch" &&
git -c core.autocrlf=false -C "$AV_MODULES" apply --unidiff-zero "$AV_COMPAT/av-source-compat.patch" &&
python3 "$AV_COMPAT/verify.py" --modules "$AV_MODULES" --expect after
```

`&&` 会在任一步失败时停止后续步骤。确认最后校验显示 `PASS` 后再启动 Foundry；失败时保持停服。

## 恢复原版

先停服。仅当所有 7 文件仍为本补丁的精确修补版时，可以反向应用：

Windows / PowerShell（沿用上面的路径变量）：

```powershell
python "$AvCompat\verify.py" --modules "$AvModules" --expect after
if ($LASTEXITCODE -ne 0) { throw '文件不是完整修补版；不要反向套用，改用备份恢复。' }

git -c core.autocrlf=false -C "$AvModules" apply --check --reverse --unidiff-zero "$AvCompat\av-source-compat.patch"
if ($LASTEXITCODE -ne 0) { throw '反向检查失败，停止。' }

git -c core.autocrlf=false -C "$AvModules" apply --reverse --unidiff-zero "$AvCompat\av-source-compat.patch"
if ($LASTEXITCODE -ne 0) { throw '恢复失败；保持停服并恢复备份。' }

python "$AvCompat\verify.py" --modules "$AvModules" --expect before
if ($LASTEXITCODE -ne 0) { throw '原版 SHA 恢复校验失败；不要启动 Foundry。' }
```

Linux / Bash：

```bash
python3 "$AV_COMPAT/verify.py" --modules "$AV_MODULES" --expect after &&
git -c core.autocrlf=false -C "$AV_MODULES" apply --check --reverse --unidiff-zero "$AV_COMPAT/av-source-compat.patch" &&
git -c core.autocrlf=false -C "$AV_MODULES" apply --reverse --unidiff-zero "$AV_COMPAT/av-source-compat.patch" &&
python3 "$AV_COMPAT/verify.py" --modules "$AV_MODULES" --expect before
```

若应用中断、只有部分文件改变、版本已更新，或文件又被其他人编辑：**不要继续应用或反向套用**。保持停服；先另外保存当前异常文件以免丢失其他修改，再从应用前的备份恢复全部 7 个原文件到各自原路径，运行 `--expect before` 验证。没有匹配备份时，重新安装准确的 Addons 2.1.0 / Expanded 3.2.0 原版后再校验；不以关闭 SHA 校验替代恢复。

## 更新边界

原模块更新可能覆盖本补丁。即使版本号相同，只要目标文件 SHA 不同，也不要应用此附件。它不支持自动混合版本、不写规则或世界文档，不负责更新既有世界汉化。不要将修补后的完整第三方模块重新打包传播。
