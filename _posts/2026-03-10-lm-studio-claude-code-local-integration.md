---
layout: post
title: "LM Studio 接入 Claude Code 踩坑实录"
date: 2026-03-10
categories: blog
tags: [LM Studio, Claude Code, 本地模型, 踩坑]
author: nobt854
---

想用本地模型跑 Claude Code？想法很美好，现实有点骨感。

记录一下完整的接入流程和遇到的坑。

---

## 🚀 开启 LM Studio API 服务

只需两步：

### 1. 切换到"开发者"界面

在 LM Studio 左侧导航栏，找到并点击底部的**"开发者"**图标（通常是一个 `</>` 符号）。

### 2. 启动本地服务器

进入开发者界面后，找到左上角的 **"启动服务器"** 开关，点击开启。

开关打开后，会看到服务器地址，通常是：

```
http://localhost:1234/v1
```

记下这个地址，它就是 Claude Code 需要访问的接口。

---

## 🔌 配置 Claude Code 连接

服务开启后，在运行 Claude Code 的终端里设置环境变量：

```bash
# 设置 API 地址，指向 LM Studio 的本地服务
set ANTHROPIC_BASE_URL=http://localhost:1234/v1

# 设置虚拟 API Key（本地服务不需要验证，但 Claude Code 需要这个变量）
set ANTHROPIC_API_KEY=lm-studio

# 指定模型名称（请替换为你的模型实际名称）
set ANTHROPIC_MODEL=gemma-3-4b

# 启动 Claude Code
claude
```

> **关键点**：`gemma-3-4b` 需要替换成你 LM Studio 里显示的确切模型名。可在 LM Studio 聊天界面加载模型后，在顶部查看完整名称。

环境变量仅对当前终端有效，关闭后需要重新设置。

---

## ⚠️ 遇到的第一个坑：Thinking 功能报错

启动后随便输入一句"你好"，直接报错：

```
API Error: 400 {"type":"error","error":{"type":"invalid_request_error","message":"request.thinking.type: Invalid discriminator value. Expected 'enabled' | 'disabled'"}}
```

**根因**：Claude Code 默认启用了 thinking 功能，但 LM Studio 不支持。

**解决方案**：添加额外的环境变量禁用 thinking：

```bash
# 设置基础环境变量
set ANTHROPIC_BASE_URL=http://localhost:1234/v1
set ANTHROPIC_API_KEY=lm-studio
set ANTHROPIC_MODEL=gemma-3-4b

# 禁用 thinking 功能
set CLAUDE_CODE_DISABLE_THINKING=true
set CLAUDE_DISABLE_THINKING=true

# 启动 Claude Code
claude
```

---

## 💸 最终结论：本地玩玩就好

解决了 thinking 问题后，本以为能愉快玩耍了。

结果发现更致命的问题：

| 问题 | 说明 |
|------|------|
| Token 消耗 | 一句"你好"占用 **2.5 万 token** |
| 响应速度 | 本地模型推理慢，等待时间长 |
| 功能限制 | 很多 Claude Code 的高级功能无法使用 |

> **因为最好的系统，不是不能再加东西，而是不能再减东西。**

本地接入 Claude Code，**图个乐可以，真要干活还得是付费版**。

---

## 📝 配置速查表

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `ANTHROPIC_BASE_URL` | `http://localhost:1234/v1` | LM Studio 服务地址 |
| `ANTHROPIC_API_KEY` | `lm-studio` | 虚拟 Key，占位用 |
| `ANTHROPIC_MODEL` | 实际模型名 | 必须与 LM Studio 中一致 |
| `CLAUDE_CODE_DISABLE_THINKING` | `true` | 禁用 thinking 功能 |
| `CLAUDE_DISABLE_THINKING` | `true` | 同上，双重保险 |

---

## 🌅 尾声

本地模型 + Claude Code 的组合，适合：

- ✅ 学习研究 CLI 工作流程
- ✅ 测试简单对话场景
- ✅ 体验本地部署的乐趣

不适合：

- ❌ 实际项目开发
- ❌ 复杂代码任务
- ❌ 追求效率的工作场景

**结论**：本地接入，体验一下就好。真要 productivity，还是乖乖订阅吧。