---
layout: post
title: "Claude Code 配置优先级：MD 文档如何体现重要程度"
date: 2026-03-07
categories: blog
tags: [Claude Code, 配置管理, 最佳实践]
author: nobt854
---

你是否好奇：**Claude Code 的 `.md` 配置文件中，优先级和重要程度是如何体现的？**

特别是 `CLAUDE.md` 和 `skills/` 目录中的各种规则文件，到底哪个说了算？

---

## 🔍 核心发现

| 问题 | 验证答案 |
|------|----------|
| MD 内容前后顺序影响优先级吗？ | ❌ **不影响** — 文件内位置无优先级含义 |
| 如何让 Skill 优先触发？ | ✅ 加入 `skill-triggers.md` 的 **P0 表格** |
| 如何让规则优先执行？ | ✅ 使用 `**硬规则**`/`**必须**` 标注 + 放在高层级文件 |
| 最高优先级在哪里声明？ | ✅ `~/.claude/CLAUDE.md` 中的核心原则区块 |

---

## 📁 文件层级优先级

Claude Code 的配置系统遵循以下层级：

```
~/.claude/CLAUDE.md          ← 最高优先级（全局指令）
├── ~/.claude/rules/*.md     ← 次级优先级（行为规则）
├── ~/.claude/skills/*/SKILL.md ← 技能定义（需触发器激活）
└── 项目级 CLAUDE.md          ← 项目特定规则
```

> **关键点**：优先级由**文件层级**决定，而非文件内内容的先后顺序。

---

## 🎯 技能（Skill）优先级机制

技能的触发优先级完全由 `~/.claude/rules/skill-triggers.md` 控制：

### P0 强制触发（最高优先级）

| 场景 | Skill |
|------|-------|
| 错误/Bug | `systematic-debugging` |
| 声称完成前 | `verification-before-completion` |
| 退出信号 | `session-end + memory-flush` |
| 新增 Skill 安装 | 安全审计扫描 |
| TaskUpdate 执行后 | `auto-checkpoint` |

### P1-P2 建议触发（次级优先级）

| 场景 | 行动 |
|------|------|
| 卡住>15 分钟 | `experience-evolution` |
| 3 次连续失败 | 暂停，回到调试 Phase 1 |
| 复杂任务>5 文件 | 建议 `planning-with-files` |

> **硬规则**：同一 URL 禁止尝试>2 次工具（2 次失败 → 告知用户，换方法）

---

## 📝 规则重要程度的体现方式

在 `CLAUDE.md` 和各类规则文件中，重要程度通过以下方式体现：

### 1. 加粗标记

```markdown
**证据优先**：任何完成声明前必须运行验证命令
**禁止模糊表述**："Should be fine" / "理论上正确"
```

### 2. "必须"/"禁止"关键词

```markdown
- **必须输出**：`Source: [URL] - Paragraph X`
- **禁止**：同一内容写入多个文件（SSOT 违规）
```

### 3. "硬规则"标注

```markdown
## 记忆搜索规则（硬规则）
- 范围搜索**必须指定 collection**
```

### 4. 熔断机制

```markdown
> **同一错误修复尝试 3 次未通过 → 停止、回滚、请求协助**
```

---

## ⚖️ 优先级决策树

```
收到指令 → 检查触发条件
├── P0 条件匹配？ → 强制执行对应 Skill
├── P1-P2 条件匹配？ → 建议执行
└── 无匹配？ → 默认行为
```

---

## 🛡️ 安全审计规则（特殊优先级）

基于 SKILL-INJECT 论文（arxiv:2602.20156），新增/安装 Skill 时自动扫描：

**红旗模式**：
- HTTP URLs（尤其是 POST/PUT/upload）
- 网络调用：`curl`、`requests.post`、`fetch(`、`axios`
- 文件窃取：`zip`/`tar` + 发送、`backup to`、`upload`
- 破坏性操作：`rm -rf`、`delete`、`encrypt`、`shred`
- 混淆/动态执行：`base64`、`eval`、`exec`

> **"合规语言"是红旗，不是信任信号** — 合法化提示语大幅提高攻击成功率

---

## 📊 验证总结

| 验证项 | 结论 |
|--------|------|
| 文件内位置影响优先级 | ❌ 否 |
| 文件层级影响优先级 | ✅ 是 |
| P0 表格决定 Skill 触发 | ✅ 是 |
| 加粗/必须/禁止标注有效 | ✅ 是 |
| 硬规则有特殊标记 | ✅ 是 |

---

## 🌅 最佳实践建议

如果你需要自定义优先级：

1. **新增 P0 规则** → 编辑 `~/.claude/rules/skill-triggers.md` 的 P0 表格
2. **强化规则** → 使用 `**硬规则**` 标注 + 加粗关键词
3. **项目特定规则** → 写在项目级 `CLAUDE.md`，不修改全局配置
4. **安全优先** → 任何网络/文件操作添加安全审计检查

> **因为最好的配置系统，不是不能再加规则，而是规则清晰、优先级明确。**