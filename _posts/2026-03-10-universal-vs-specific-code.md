---
layout: post
title: "Agent AI 的两种代码：通用代码 vs 非通用代码"
date: 2026-03-10
categories: blog
tags: [AI, Agent, 编程，代码质量]
author: nobt854
---

理论上，Claude Code 和所有的 Agent AI 一样，所有代码全都能写。

但真正用起来才发现：**代码其实分为两种。**

---

## 🎯 两种代码的本质区别

| 代码类型 | 定义 | 难度 |
|----------|------|------|
| **通用代码** | 不要求按个人/公司要求、环境来写的代码 | ⭐ 简单 |
| **非通用代码** | 需要整理和让 Agent 能写自己预期的代码 | ⭐⭐⭐⭐ 困难 |

绝大多数人的主要目标，其实是第二种。

---

## 📦 通用代码：Agent 的舒适区

**什么是通用代码？**

就是那些不需要考虑你的个人偏好、公司规范、特定环境的代码。

```python
# 通用代码示例
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)
```

这段代码，无论谁来写，无论用什么 AI，结果都差不多。因为：
- 算法是标准的
- 没有业务逻辑耦合
- 不需要考虑项目特定规范

**通用代码的特点：**

- ✅ 有标准答案
- ✅ 网上有大量参考
- ✅ Agent 可以信手拈来
- ✅ 几乎不需要上下文

> **通用代码，是 Agent 的舒适区，也是大多数人对 AI 编程的初始认知。**

---

## 🏢 非通用代码：真正的挑战

**什么是非通用代码？**

就是那些需要符合你的预期、你的项目规范、你的公司环境的代码。

```java
// 非通用代码示例 - 某公司内部服务
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final MqProducer mqProducer; // 公司内部封装

    // 必须符合公司的异常处理规范
    @Override
    @Cacheable(value = "user", key = "#id", unless = "#result == null")
    public UserDTO getUserById(Long id) {
        // 必须使用公司统一的日志格式
        log.info("[UserService.getUserById] id={}, traceId={}", id, TraceUtils.getTraceId());

        // 业务逻辑需要符合特定流程
        return doGetUserWithFallback(id);
    }
}
```

这段代码，Agent 能写，但写出来可能不是"你想要的"。因为：
- 需要知道公司的异常处理规范
- 需要知道日志格式要求
- 需要知道缓存和 MQ 的使用约定
- 需要知道项目分层架构

**非通用代码的特点：**

- ⚠️ 没有标准答案
- ⚠️ 需要大量上下文
- ⚠️ Agent 需要"被教育"
- ⚠️ 结果是否符合预期，取决于你整理信息的能力

> **非通用代码，才是 Agent 编程的主战场。**

---

## 🔍 核心洞察

**一个扎心的真相：**

> **通用代码不需要你，非通用代码需要你整理。**

Agent 能写通用代码，但这部分代码：
- 本身就不多
- 网上随便能找到
- 不需要 AI 也能写

而真正有价值的非通用代码：
- 占据工作量的 80% 以上
- 紧密耦合业务和环境
- **需要你整理信息，才能让 Agent 写出符合预期的代码**

**这就是为什么很多人觉得"AI 写代码不行"——不是 AI 不行，是他们没有整理好自己的需求。**

---

## 📈 使用模式的演变

| 阶段 | 认知 | 典型行为 | 结果 |
|------|------|----------|------|
| **玩具期** | "AI 什么都能写" | "帮我写个贪吃蛇" | 能跑就行，不问出处 |
| **觉醒期** | "AI 需要上下文" | 开始整理项目规范 | 代码可用，但需要 review |
| **成熟期** | "AI 需要结构化输入" | 建立完整的 CLAUDE.md / Skills | 代码符合预期，直接可用 |

> **技术驱动型 | 配置爱好者 | 深度使用者**

真正用好 Agent 的人，都在做同一件事：**整理非通用代码的上下文。**

---

## 🛠️ 如何整理非通用代码的上下文？

### 1. 项目规范文档化

```markdown
# CLAUDE.md - 项目规范

## 代码风格
- Java 使用 Lombok 简化样板代码
- 异常处理统一使用 BusinessException
- 日志必须包含 traceId

## 架构约束
- Controller → Service → Repository
- 禁止跨层调用
- DTO 与 Entity 必须分离
```

### 2. 常见任务模板化

```markdown
# Skills - 常见任务模板

## 新增 Service
1. 在 `service/` 目录创建接口和实现
2. 使用 `@RequiredArgsConstructor` 注入依赖
3. 异常处理使用 `BusinessException`
4. 日志格式：`[类名。方法名] 参数={}, traceId={}`
```

### 3. 环境信息结构化

```markdown
## 技术栈
- JDK 17
- Spring Boot 3.2
- MyBatis Plus
- Redis (公司集群：redis-cluster.xxx)

## 本地运行
- 需要配置 `.env` 文件
- 数据库连接使用环境变量
```

---

## ✂️ 给你的建议

### 如果你还在"玩具期"

1. 接受一个事实：**通用代码没多大用**
2. 开始整理你的项目规范
3. 从一个小模块开始，让 Agent 按你的规范写代码

### 如果你已经在"觉醒期"

1. 继续整理，但注意**别过度设计**
2. 优先整理高频任务的上下文
3. 用实际代码质量验证整理效果

### 如果你已经进入"成熟期"

1. 定期 review 整理的上下文，**保持精简**
2. 关注新场景，持续补充上下文
3. 分享经验，帮助别人少走弯路

---

## 🌅 尾声

**两种代码的本质，其实是两种工作流。**

通用代码对应的是：**"帮我写点东西"**

非通用代码对应的是：**"按我的方式，写我需要的东西"**

前者让 AI 玩具化，后者让 AI 工具化。

> **因为最好的系统，不是不能再加东西，而是不能再减东西。**

整理非通用代码的上下文，就是那个"不能再减"的核心。

所以，下次用 Agent 写代码前，先问问自己：

**我整理的信息，够不够让 AI 写出符合预期的非通用代码？**

如果不够，那就从整理开始。