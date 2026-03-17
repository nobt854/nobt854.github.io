---
layout: post
title: "Claude Code 技巧：禁用 Git 提交中的 Co-Authored-By 署名"
date: 2026-03-17
categories: blog
tags: [Claude Code, Git, 技巧，配置]
author: nobt854
---

使用 Claude Code 自动完成 Git commit 时，它会默认添加自己作为参与者，提交信息会变成这样：

```
xxx 自定义或生成的主 commit 信息


-Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

默认这样提交后，Git 仓库的参与者列表就会多出来一个 "Claude"。

---

## 🔍 原理解析

这个行为基于 Git 服务端都支持以 `Co-Authored-By` 用法作为 Git 仓库的参与者标识。

Claude Code 认为自己在代码提交过程中提供了帮助，所以默认添加署名。但有些场景下你可能不希望这样：

| 场景 | 说明 |
|------|------|
| **个人项目** | 不希望参与者列表出现 AI |
| **公司规范** | 提交者必须是真实员工账号 |
| **提交历史整洁** | 保持提交者一致性 |
| **自动化脚本** | CI/CD 流水线不希望出现额外署名 |

---

## 🔧 配置方法

可以通过修改全局的 Claude 配置，让所有的 Git 提交不再自动添加 Co-Authored-By。

**官方文档**：https://code.claude.com/docs/en/settings

### 步骤 1：编辑配置文件

找到 Claude 的全局配置文件：

```
~/.claude/settings.json
```

Windows 系统完整路径：
```
C:\Users\<你的用户名>\.claude\settings.json
```

### 步骤 2：添加配置项

在 `settings.json` 中添加以下配置：

```json
{
  "includeCoAuthoredBy": false,
  "includeGitInstructions": false
}
```

### 配置项说明

| 配置项 | 说明 |
|--------|------|
| `includeCoAuthoredBy` | 控制是否在 commit 信息中添加 Co-Authored-By 署名 |
| `includeGitInstructions` | 控制是否在 Git 操作中提供额外指令说明 |

---

## ✅ 验证效果

配置生效后，再次使用 Claude Code 提交代码：

```bash
# 之前的提交信息
feat: 新增用户登录功能

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>

# 配置后的提交信息
feat: 新增用户登录功能
```

现在提交信息干净清爽，只有你指定的内容。

---

## 📌 小结

一个简单但实用的配置，让你完全控制 Git 提交历史的署名格式。

特别是对于有严格提交规范要求的团队，这个配置可以避免不必要的麻烦。