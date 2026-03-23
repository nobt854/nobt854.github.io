---
layout: post
title: "Codex 学习路线图：4 个阶段 + 1 个长期习惯"
date: 2026-03-23
categories: blog
tags: [Codex, OpenAI, AI Coding, 技术]
author: nobt854
catalog: true
---

先建立一个正确心智模型：Codex 不是“补全工具升级版”，而是“会读代码、改代码、跑命令、做审查、补测试”的 coding agent。官方文档把它分成几种主要使用面：Web/Cloud 里做后台并行任务，IDE extension 里嵌入开发流，CLI 在本地终端直接读写和执行代码，SDK 则适合接到 CI/CD 或你自己的代理系统里。参考：<https://platform.openai.com/docs/codex/overview>、<https://platform.openai.com/docs/guides/code-generation>

我建议你按“4 个阶段 + 1 个长期习惯”学，不要一开始就钻配置细节。

---

## 🎯 阶段 1：3 天入门，先把 Codex 当高级结对程序员

目标是学会 4 种基本任务：

- 读代码并解释架构
- 找 bug 并修复
- 对现有改动补测试
- 做 PR review

每天只做一种，且都在真实仓库里做。官方给的典型 prompt 也基本就是这 4 类：理解请求流、找漏洞、审查 diff、补测试、修 UI。参考：<https://platform.openai.com/docs/codex/overview>

建议练法：

1. 让它先“解释再动手”
2. 再让它“只改最小闭环”
3. 最后让它“补测试并验证”

你要重点观察的不是它写了多少代码，而是：

- 它是否先找上下文
- 是否会复用现有模式
- 是否能把变更收敛到最小
- 是否能自己验证

---

## 🧭 阶段 2：1 周进阶，掌握本地 CLI 工作流

这一阶段的关键不是“多会配”，而是形成稳定命令式协作习惯。CLI 的价值在于它能在你的机器上读、改、跑。官方也把 CLI 视为本地 coding agent 的主要入口之一。参考：<https://platform.openai.com/docs/guides/code-generation>

你要刻意练 3 件事：

- 任务拆解：一次只给一个清晰目标，别把“重构 + 修 bug + 补文档 + 改样式”混成一条
- 验证闭环：每次都要求它运行测试、lint、类型检查或至少给出未验证项
- 审查模式：对它的输出做人工 code review，而不是直接接受

实战题目：

- “先解释这个模块的职责边界，再列 3 个重构方向，不要改代码”
- “修复这个报错，只允许改相关模块，最后跑测试”
- “对当前 diff 做 review，优先找行为回归和缺失测试”

---

## ⚙️ 阶段 3：1 到 2 周，掌握配置、约束和上下文注入

这一阶段你才开始认真整理“怎么让 Codex 长期更顺手”。

优先掌握这 3 类：

- 全局配置：`~/.codex/config.toml`
- 项目指令：项目根 `AGENTS.md`
- 文档接入：MCP，尤其是官方 Docs MCP

官方明确支持在 `config.toml` 里配置 MCP，而且 CLI 和 IDE extension 共用这份配置；官方还明确提到 `AGENTS.md` 作为给 agent 的规则载体。参考：<https://platform.openai.com/docs/docs-mcp>

你应该把项目里的这些信息收敛进 `AGENTS.md`：

- 测试命令
- 代码风格
- 哪些目录不要碰
- review 优先级
- PR/commit 约束
- 常见陷阱

这一步做完，Codex 的稳定性会明显提升。因为高手和新手的差别，通常不在“问得更花”，而在“上下文治理更稳”。

---

## 🚀 阶段 4：2 到 4 周，进入高手区：多环境、多任务、长链路

这一阶段你要学的是“把 Codex 当工程系统的一部分”，不是聊天对象。

重点能力：

- Web/Cloud 后台并行委派任务
- 用 GitHub / PR / diff 驱动 review
- 用 SDK 或 agent workflow 接 CI/CD
- 给 cloud task 配环境、网络权限、依赖安装策略

官方文档强调 Codex Cloud 的强项是后台并行任务；每个云任务都有隔离容器，且网络默认是关的，需要按环境控制。参考：<https://platform.openai.com/docs/codex/overview>、<https://platform.openai.com/docs/codex/agent-network>

高手实践不是“让它无所不能”，而是：

- 把网络权限收紧到必要域名
- 把 setup 脚本和依赖安装显式化
- 对 untrusted 内容保持 prompt injection 警惕
- 永远 review 输出和工作日志

---

## 🤖 模型选择

按我今天查到的 OpenAI 官方文档，`GPT-5.2-Codex` 是当前默认的 Codex 优化模型页面，定位是“long-horizon, agentic coding tasks”，支持 `low`、`medium`、`high`、`xhigh` 推理强度。参考：<https://platform.openai.com/docs/models/gpt-5.2-codex>

如果你是从零开始，建议：

- 日常开发：`medium`
- 难 bug、复杂重构、深度 review：`high`
- 非常长链路且容错要求高：再考虑 `xhigh`

不要默认全开高推理。高手不是一直开最强，而是按任务切档位。

---

## 🗓️ 30 天实战安排

1. 第 1 周：只练“理解代码、修 bug、补测试、做 review”。
2. 第 2 周：把 `AGENTS.md`、测试命令、约束、常用 prompt 固化下来。
3. 第 3 周：开始在真实 PR 和真实缺陷单里使用，要求每次都有验证结论。
4. 第 4 周：接入 Docs MCP、尝试 cloud task、尝试把一个固定流程接进 CI 或脚本。

---

## 📌 成为高手的分水岭

你可以用这 6 条自测：

- 能区分 ask / review / code 三种任务姿势
- 会先给约束，再给目标，再给验收标准
- 会把项目规则放进 `AGENTS.md`
- 会要求测试和验证，不只看“能不能改出来”
- 会限制网络和外部输入，知道 prompt injection 风险
- 会把 Codex 用在真实工程流里，而不是只拿来问零散问题

---

## 🧩 你现在最值得做的第一步

不是继续看概念，而是马上搭一套最小工作流：

- `~/.codex/config.toml`
- 项目根 `AGENTS.md`
- 配上 OpenAI Docs MCP：<https://platform.openai.com/docs/docs-mcp>

如果你要，我下一条可以直接给你一份“Claude Code 用户迁移到 Codex 的 14 天实战清单”，按每天做什么、写什么 `AGENTS.md`、怎么练 prompt、怎么验收来列。
