---
layout: post
title: "Claude Code 全局配置链路全景图 - 从混乱到清晰"
date: 2026-03-06
categories: blog
tags: [Claude Code, 配置管理，知识体系]
author: nobt854
---

经过一段时间的调试、融合各种技巧和模板后，全局配置和项目配置往往变得臃肿混乱。

**"这个配置到底是干什么的？"**
**"这些文件之间的引用关系是怎样的？"**
**"有没有冗余或冲突的规则？"**

当你准备执行 `/clear` 前，不妨先花 5 分钟看看这份全局配置链路分析。

## 生成方式
对claude code说：`现在全局的claude中rules/docs/claude.md这些链路是怎样的？`

---

## 📁 全局配置目录结构

```
~/.claude/
├── CLAUDE.md                    # 主配置文件（入口）
├── settings.json                # 设置配置（权限、钩子、环境变量）
├── .mcp.json                    # MCP 服务器配置
├── docs/                        # 详细文档目录
│   ├── behaviors.md            # 行为规则（紧凑版）
│   ├── behaviors-extended.md   # 行为规则（完整版）
│   ├── behaviors-reference.md  # 行为参考详情
│   ├── content-safety.md       # AI 内容安全与质量控制
│   ├── task-routing.md         # 任务路由指南
│   ├── agents.md               # 子代理协作指南
│   └── scaffolding-checkpoint.md # 新项目技术栈决策
├── rules/                       # 规则目录
│   ├── behaviors.md            # 行为规则（紧凑版，被 CLAUDE.md 引用）
│   ├── memory-flush.md         # 记忆刷新触发规则
│   └── skill-triggers.md       # Skill 触发规则 + URL Fetch 路由
├── memory/                      # 记忆层
│   ├── today.md                # 热数据层 - 每日进度
│   ├── projects.md             # 项目总览
│   ├── goals.md                # 跨日目标
│   └── active-tasks.json       # 任务注册表
├── skills/                      # 技能目录
│   └── [各种技能目录]
└── plugins/                     # 插件目录
```

---

## 🔗 核心引用链路

`CLAUDE.md` 作为主入口，引用了以下文件：

| 引用位置 | 目标文件 | 用途 |
|----------|----------|------|
| 第 25 行 | `docs/task-routing.md` | 任务处理详细路由 |
| 第 137 行 | `rules/skill-triggers.md` | URL Fetch 路由表 |
| 第 185 行 | `rules/behaviors.md` | 经验回忆与进化详细规则 |
| 第 320-330 行 | `memory/*.md`, `docs/*.md`, `skills/*/SKILL.md` | 按需加载索引表 |

---

## 🎯 配置层级分析

### 第一层：主入口（CLAUDE.md）

**核心原则区**（第 1-15 行）
- `Truth > Speed`：证据优先原则
- `Recall First`：遇到问题先查 memory
- `平台服务优先`：能用 Vercel/Supabase/Cloudflare 就不自建

**工作模式区**（第 18-39 行）
- 任务路由决策：主会话 vs 子代理
- 执行计划模板
- 批准规则分级

**文件操作规则**（第 42-57 行）
- 修改类型与执行方式对照表
- Worktree 隔离约束

**安全边界**（第 60-69 行）
- 7 类需要确认的危险操作
- 敏感代码不出境原则

---

### 第二层：规则层（rules/）

#### `rules/behaviors.md` - 行为规则

| 模块 | 核心内容 |
|------|----------|
| VPS 部署规则 | 禁止在 VPS 上 git commit/编辑代码 |
| 文档结构 | 项目级仅保留 PROJECT_CONTEXT.md + CHANGELOG.md |
| 调试协议 | 四阶段调试流程 |
| 实时经验记录 | 4 种触发场景（用户纠正/3 次失败/反直觉发现/认知升级） |
| 记忆搜索规则 | 两阶段 RAG 搜索 |
| 数据写回规则 | 获取指标立即写回 SSOT |

> **核心思想**：经验不等待 session-end，触发后立即记录

---

#### `rules/skill-triggers.md` - Skill 触发规则

**P0 强制触发**：

| 场景 | Skill | 例外情况 |
|------|-------|----------|
| 错误/Bug | `systematic-debugging` | 缺失环境变量/路径错误 |
| 声称完成前 | `verification-before-completion` | 纯调研/文档改动 |
| 退出信号 | `session-end + memory-flush` | 短暂暂停 |
| 新增 Skill/MCP | 安全审计扫描 | 单行配置变更 |
| TaskUpdate 后 | `auto-checkpoint` | 仅查询操作 |

**Skill 安全审计**（基于 arxiv:2602.20156）：
- 扫描红旗：HTTP URLs、网络调用、文件窃取、破坏性操作、混淆执行
- **"合规语言"是红旗，不是信任信号**

**URL Fetch 路由**：
- 代码仓库 → `gh` CLI
- 文章/博客 → `fetch_jina`
- JS-heavy SPA → Playwright

---

#### `rules/memory-flush.md` - 记忆刷新规则

**触发条件**：
- 非 trivial 任务开始 → 写 today.md session header
- 每完成任务 → 更新 today.md
- 代码提交 → 更新 PROJECT_CONTEXT.md
- 架构决策 → 立即记录到 today.md

**退出信号**（立即执行完整 Flush）：
> "今天就到这里" / "下班了" / "我走了" / "回头聊" / "关闭窗口"

**禁止**：等待/session-end 才保存 / 批量保存 / 假设用户会正常结束

---

### 第三层：文档层（docs/）

按需加载的扩展文档，包含：
- 行为规则完整版
- 任务路由详细指南
- AI 内容安全与质量控制
- 子代理协作指南
- 新项目技术栈决策树

---

### 第四层：记忆层（memory/）

| 层级 | 文件 | 写入内容 |
|------|------|----------|
| 自动记忆 | 项目 `MEMORY.md` | 技术坑、API 详情 |
| 模式库 | `patterns.md` | 跨项目可复用模式 |
| 热数据层 | `today.md` | 每日进度、交接 |
| 任务注册表 | `active-tasks.json` | 跨会话进行中任务 |

---

## 📊 配置合理性检查清单

### ✅ 健康信号

- [ ] CLAUDE.md 引用路径清晰，无循环依赖
- [ ] rules/ 目录存放触发规则，docs/ 存放详细文档
- [ ] 记忆层分层明确，各司其职
- [ ] Skill 触发规则有明确的"何时不用"例外说明
- [ ] 安全审计规则基于论文研究（arxiv:2602.20156）

### ⚠️ 危险信号

- [ ] 同一规则在多个文件中重复出现（SSOT 违规）
- [ ] rules/ 目录下存放详细文档（应该精简）
- [ ] memory/ 文件超过 200 行未归档（应移至 projects.md）
- [ ] CLAUDE.md 超过 500 行（应该拆分到 docs/）
- [ ] Skill 安全审计缺失或流于形式

---

## 💡 配置精简建议

### 可以合并的部分

如果 `rules/behaviors.md` 和 `docs/behaviors-extended.md` 内容差异不大，考虑：
- 保留紧凑版在 rules/
- 将完整版整合进紧凑版（如果"完整"只是示例更多）

### 可以移除的部分

检查是否有：
- 从未被触发的 Skill 规则
- 已经过时不再使用的 MCP server 配置
- 实验性功能的残留配置

### 需要警惕的部分

- **配置膨胀**：每次"这个场景也要管"就加一条规则
- **规则冲突**：不同时期添加的规则可能有隐含冲突
- **文档债务**：`docs/` 目录只增不减

---

## 🔍 配置健康度自检命令

```bash
# 查看 CLAUDE.md 引用了哪些外部文件
grep -n "Read" ~/.claude/CLAUDE.md

# 检查 rules/ 目录文件大小
wc -l ~/.claude/rules/*.md

# 检查 memory/ 目录是否有陈旧文件
ls -la ~/.claude/memory/
```

---

## 🌅 配置治理的核心原则

> **因为最好的系统，不是不能再加东西，而是不能再减东西。**

配置治理不是一次性的 `/clear`，而是：
1. **定期审视**：每次执行 `/clear` 前先做链路分析
2. **减法思维**：问"这条规则还能删掉吗？"而不是"还能加什么？"
3. **SSOT 原则**：同一规则只在一个地方定义
4. **分层清晰**：rules/ 是触发器，docs/ 是说明书，memory/ 是状态

---

## 📝 给你的建议

如果你的全局配置已经混乱：

1. **先执行 `/clear` 前的诊断**：输出当前链路图
2. **标记冲突规则**：用注释标注"待清理"
3. **分批次精简**：不要一次性大改，避免破坏现有工作流
4. **记录精简决策**：在 `docs/config-changelog.md` 中记录删改原因

配置不是为了证明自己有多专业，而是为了让下次启动时，Claude 能更快进入状态。