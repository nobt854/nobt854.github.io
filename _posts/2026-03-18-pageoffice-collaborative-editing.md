---
layout: post
title: "PageOffice 协同编辑实现方案对比：SetDrByUserWord vs SetDrByUserWord2"
date: 2026-03-18
categories: blog
tags: [技术, PageOffice, 协同编辑, Word]
author: nobt854
---

PageOffice 提供了两种实现不同用户修改指定区域的方案，本文对比分析它们的实现原理和并发处理机制。

---

## 🔍 方案概述

| 方案 | 核心机制 | 并发问题 |
|------|----------|----------|
| **SetDrByUserWord** | 不同用户只能修改指定区域 | 存在覆盖风险 |
| **SetDrByUserWord2** | 基于子文档隔离的指定区域编辑 | 无并发冲突 |

---
## PageOffice Demo源码
https://gitee.com/pageoffice/springboot-pageoffice

## ⚠️ SetDrByUserWord 的覆盖问题

**核心机制**：实现不同用户只能修改指定区域。

**并发问题**：若同一时间修改文档，会存在后保存的覆盖前保存的内容。

> **场景示例**：A 和 B 同时在不同电脑打开编辑，编辑后 A 先保存、B 再保存，此时服务器上只有 B 保存的修改，A 的修改丢失。

---

## ✅ SetDrByUserWord2 的解决方案

**核心机制**：基于不同用户只能修改指定区域，额外控制可以同一时间进入文档编辑。

**实现方式**：

1. 主文档中通过 `setValue` 嵌套各自的子文档：
   ```java
   d1.setValue("[word]/doc/SetDrByUserWord2/content1.doc[/word]");
   ```

2. A 和 B 只能各自改各自的子文档

3. 同时修改也不会有并发问题，最终不需要合并

4. 修改子文档后，主文档重新刷新即可通过嵌套展示最新内容

---

## 📊 并发问题对比

| 维度 | SetDrByUserWord | SetDrByUserWord2 |
|------|-----------------|------------------|
| **存储结构** | 单文件 `test.doc` | 主文档 `test.doc` + 2 个子文档 `content1.doc`/`content2.doc` |
| **A 编辑区域** | `PO_A_pro1`, `PO_A_pro2` | `PO_com1`（实际内容是 `content1.doc`） |
| **B 编辑区域** | `PO_B_pro1`, `PO_B_pro2` | `PO_com2`（实际内容是 `content2.doc`） |
| **A 保存结果** | 整个 `test.doc`（包含 B 的未修改区域） | 只保存 `content1.doc` |
| **B 保存结果** | 整个 `test.doc`（覆盖 A 的修改） | 只保存 `content2.doc` |
| **并发冲突** | ❌ 存在 - 后保存者覆盖前者 | ✅ 无冲突 - 各自保存不同文件 |

---

## 🏗️ SetDrByUserWord2 的核心设计

```
┌─────────────────────────────────────┐
│        test.doc (主文档)            │
│  ┌─────────────────────────────┐    │
│  │  [word]content1.doc[/word]  │ ◄──┼── A 用户编辑 ──► 保存到 content1.doc
│  │       (PO_com1 区域)        │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │  [word]content2.doc[/word]  │ ◄──┼── B 用户编辑 ──► 保存到 content2.doc
│  │       (PO_com2 区域)        │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**关键点**：

- `setSubmitAsFile(true)` - 让数据区域以独立文件形式提交
- `getFileBytes()` - 只提取该区域的内容字节，不牵扯其他区域
- 子文档物理隔离，天然避免并发覆盖

---

## 🎯 实际效果

| 步骤 | 动作 | 结果 |
|------|------|------|
| 1 | A 先保存 | `content1.doc` 更新 |
| 2 | B 后保存 | `content2.doc` 更新（互不影响） |
| 3 | 刷新主文档 | 自动加载两个子文档的最新内容 |

> **设计思想**：通过"分而治之"的并发解决方案，文件级别的隔离避免了传统单文档的覆盖问题。