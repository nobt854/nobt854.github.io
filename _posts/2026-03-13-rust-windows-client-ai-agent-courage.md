---
layout: post
title: "AI Agent 时代的大胆尝试：用 Rust 写 Windows 客户端，从 0 到 1 的踩坑记录"
date: 2026-03-13
categories: blog
tags: [AI, Agent, Rust, Windows, 客户端开发]
author: nobt854
---

> **AI 给你的最大底气，不是它能写多少代码，而是让你敢于尝试完全未知的领域。**

---

## 🎯 事情的起因

作为一个 Java 后端开发者，Windows 客户端开发对我来说完全是个黑盒。

直到最近有个需求：

```
需要一个 Windows 客户端工具：
  - 根据全局配置驱动行为
  - 提供 CLI 命令供第三方调用
  - 轻量、快速、易部署
```

**传统思路：**
- 找现成的工具凑合用
- 或者找个会 C#/.NET 的朋友帮忙
- 最保守：继续用 Java 写个 Swing/JavaFX（然后被 UI 丑哭）
- 找个外包？
- 回复：我不会？

**AI Agent 时代的思路：**
- 直接选一个最适合的技术栈
- 让 Claude Code 带我学
- 边做边学，踩坑就查

**我根据Claude Code给我多个技术选型中，选了 Rust。**

> 在此之前 Rust 语言对我而言是C语言级别的存在

---

## 🤔 为什么是 Rust？

| 考量维度 | Java | C#/.NET | Rust |
|----------|------|---------|------|
| **启动速度** | ⚠️ JVM 预热慢 | ✅ 较快 | ✅ 原生启动 |
| **打包体积** | ⚠️ 需要 JRE | ⚠️ 需要 .NET Runtime | ✅ 单 exe 文件 |
| **CLI 友好度** | ⚠️ 一般 | ⚠️ 一般 | ✅ 原生支持 |
| **学习曲线** | ✅ 熟悉 | ⚠️ 未知 | 🔴 陡峭 |
| **AI 支持度** | ✅ 好 | ✅ 好 | ✅ 很好 |

**选择 Rust 的核心理由：**

> **既然都是学新技术，不如学个最有价值的。**

Rust 连续多年"最受喜爱的编程语言"，并且Claud Code告诉我这是最小体积、高效的选择

---

## 🏗️ 项目启动：从 0 开始的勇气

### 第一阶段：环境搭建

**传统学习方式：**
```
1. 去官网下载安装包
2. 看官方文档学基础语法
3. 跟着教程写 Hello World
4. 花一周理解所有权和借用
5. ...然后就没有然后了
```

**AI Agent 学习方式：**
```
1. 直接说需求："创建 Rust Windows 项目"
2. Claude Code 自动安装 rustup
3. 自动创建项目结构
4. 边写代码边解释语法
5. 遇到问题直接问，立即得到解答
```

**实际耗时：** 30 分钟完成环境搭建 + Hello World

---

### 第二阶段：项目结构设计

**需求驱动的配置结构：**

```
nobt-client/
├── Cargo.toml              # 项目配置
├── src/
│   ├── main.rs             # 入口
│   ├── config/
│   │   ├── mod.rs          # 配置模块
│   │   └── global.rs       # 全局配置加载
│   ├── cli/
│   │   ├── mod.rs          # CLI 模块
│   │   └── commands.rs     # 命令处理
│   └── utils/
│       └── windows.rs      # Windows 特定工具
├── config/
│   └── default.yaml        # 默认配置
└── build.rs                # 构建脚本（用于生成 exe）
```

**这个结构怎么来的？**

不是凭空设计的，是**让 Claude Code 根据需求推荐的**。

---

### 第三阶段：核心功能实现

#### 1. 全局配置加载

```rust
use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Debug, Deserialize, Serialize)]
pub struct GlobalConfig {
    pub server_url: String,
    pub api_key: String,
    pub timeout_secs: u64,
    pub log_level: String,
}

impl GlobalConfig {
    pub fn load(path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let content = fs::read_to_string(path)?;
        let config: GlobalConfig = serde_yaml::from_str(&content)?;
        Ok(config)
    }
}
```

**这段代码的学习过程：**
1. 问："Rust 怎么读 YAML 配置？"
2. Claude Code 推荐 `serde` + `serde_yaml`
3. 解释 `derive(Deserialize)` 的作用
4. 解释 `Result<T, E>` 错误处理
5. 代码写完，语法也学会了

---

#### 2. CLI 命令处理

```rust
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "nobt-client")]
#[command(about = "NOBT Windows 客户端工具")]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    /// 启动服务
    Start,
    /// 停止服务
    Stop,
    /// 查看状态
    Status,
    /// 执行任务
    Run { task_id: String },
}
```

**clap 库的选择：**
- Rust 生态最成熟的 CLI 框架
- 宏驱动，代码简洁
- 自动生成 `--help`

**AI 的价值：**
- 直接告诉你"用 clap"
- 生成完整示例代码
- 解释每个注解的作用
- 省去数小时的文档阅读时间

---

#### 3. Windows exe 打包

**这是最大的坑之一。**

Rust 默认编译出来的是 `.exe` 没错，但：
- 没有图标
- 没有版本信息
- 没有数字签名
- 可能被 Windows Defender 报毒

**解决方案：**

```toml
# Cargo.toml
[profile.release]
opt-level = "z"     # 优化体积
lto = true          # 链接时优化
codegen-units = 1   # 增加优化时间

[package.metadata.winres]
LegalCopyright = "Copyright © 2026 nobt854"
FileDescription = "NOBT Client"
ProductName = "NOBT Client"
```

```rust
// build.rs
fn main() {
    if cfg!(target_os = "windows") {
        let mut res = winres::WindowsResource::new();
        res.set_icon("assets/icon.ico");
        res.compile().unwrap();
    }
}
```

**这个过程谁教我的？** Claude Code。

**如果我自己摸索？** 可能要在 Stack Overflow 泡三天。

---

## 📊 实际效果对比

| 指标 | 传统学习方式 | AI Agent 学习方式 |
|------|--------------|-------------------|
| **环境搭建** | 2-3 小时 | 30 分钟 |
| **第一个可运行程序** | 1-2 天 | 2 小时 |
| **配置功能完成** | 3-5 天 | 1 天 |
| **CLI 功能完成** | 5-7 天 | 2 天 |
| **打包发布** | 1-2 周 | 3 天 |
| **总体时间** | 2-3 周 | 约 1 周 |

**效率提升：3-4 倍**

但这不是重点。

**重点是：如果没有 AI，我可能根本不会开始。**

---

## 🔍 核心洞察

### 洞察 1：AI 降低了"试错成本"

**传统学习新技术的成本：**
```
买书/买课 → 看基础语法 → 写 Demo → 遇到问题 → 查文档 → 卡住 → 放弃
```

**AI Agent 时代的学习成本：**
```
说需求 → AI 生成代码 → 运行 → 遇到问题 → 问 AI → 立即解决 → 继续
```

**最大的区别：** 前者容易放弃，后者能持续获得正反馈。

---

### 洞察 2：AI 不是替代你学，是让你学得更快

有一种观点：**"用 AI 写代码，自己学不到东西。"**

**我的体验：恰恰相反。**

| 场景 | 纯手写 | 用 AI |
|------|--------|-------|
| **遇到语法错误** | 查文档 30 分钟 | AI 解释 30 秒 |
| **不知道用哪个库** | Google 1 小时 | AI 直接推荐 |
| **理解概念** | 看视频教程 2 小时 | AI 举例说明 5 分钟 |
| **调试 Bug** | 打印日志猜原因 | AI 分析 + 修复建议 |

**AI 省去的不是学习时间，是无效摸索时间。**

---

### 洞察 3：纸上谈兵的时代结束了

**AI 之前的"学习路径"：**
```
1. 先学基础语法
2. 再看面向对象
3. 然后学设计模式
4. 最后才能做项目
```

**AI 时代的"学习路径"：**
```
1. 有个想法/需求
2. 直接开始做
3. 遇到问题问 AI
4. 做完项目，技能也学会了
```

> **最好的学习，不是准备好了再开始，而是开始了自然就准备好了。**

---

## 🛠️ 给实践者的建议

### 如果你想尝试新技术

**传统建议：**
- 先系统学习基础
- 买本好书慢慢啃
- 找个培训班

**AI 时代的建议：**
1. **直接开始做项目**：有需求驱动，学得最快
2. **让 AI 当私人教练**：遇到任何问题立即问
3. **小步快跑**：每个功能点都快速验证
4. **不要怕犯错**：AI 会帮你快速修复

---

### 如何克服"未知恐惧"

**恐惧的来源：**
- 不知道从哪开始
- 不知道会遇到什么坑
- 不知道能不能学会

**AI 的解法：**

| 恐惧 | AI 解法 |
|------|------|
| 不知道从哪开始 | AI 直接给出第一步 |
| 不知道会遇到什么坑 | AI 提前预警常见问题 |
| 不知道能不能学会 | AI 随时解答疑问 |

**最大的底气：** 你知道无论如何，都有个随叫随到的专家帮你。

---

### 选择技术栈的原则

**我的经验：**

| 原则 | 说明 |
|------|------|
| **选生态成熟的** | Rust 有 cargo、crates.io、clap |
| **选 AI 支持好的** | 训练数据多，回答质量高 |
| **选长期有价值的** | 不是昙花一现的框架 |
| **选适合自己成长的** | 稍微跳一跳够得着的难度 |

**Rust 完美符合这四个原则。**

---

## 📈 项目当前状态

**已完成：**
- ✅ 全局配置加载（YAML 格式）
- ✅ CLI 命令框架（clap）
- ✅ Windows exe 打包（带图标）
- ✅ 基础错误处理

**进行中：**
- ⚠️ 第三方调用 API 实现
- ⚠️ 服务常驻后台功能
- ⚠️ 日志系统集成

**下一步：**
- 性能优化
- 数字签名
- 安装包制作

---

## 🌅 尾声

**AI Agent 时代，最大的风险不是"尝试了失败"，而是"因为害怕而不敢尝试"。**

> **纸上谈兵一万次，不如真正动手做一次。**

Rust 的所有权和借用，我刚接触时也觉得很反人类。

但当第一个可运行的 exe 出现在我面前时，那种成就感是无可替代的。

**因为我知道：**
- 这不是抄的，是一行一行写出来的
- 这不是别人教的，是边做边学学会的
- 这不是碰巧跑通的，是理解了原理的

**AI 给我的不是代码，是尝试的勇气。**

**而你，准备好尝试什么了？**

也许是一门新技术，也许是一个新项目，也许是一次职业转型。

**不管是什么，开始吧。**

因为最好的学习时间，永远是现在。