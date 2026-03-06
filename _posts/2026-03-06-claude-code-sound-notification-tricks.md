---
layout: post
title: "让 Claude Code 主动出声：一个提升摸鱼效率的 hooks 技巧"
date: 2026-03-06
categories: blog
tags: [AI, Claude Code, 开发工具, 效率技巧]
author: nobt854
---

事情是这样的。

你有没有过这种经历：

> 让 Claude Code 处理一个长任务，然后切出去刷手机/回消息/摸鱼。
>
> 过了一会儿，心虚地切回来："它应该早就完了吧？"
>
> 结果发现——它在一个权限确认弹窗那里卡了 20 分钟。

或者：

> 让它并行处理三个子代理，不知道哪个会先完成。
>
> 只能隔几秒看一眼："有消息吗？有吗？现在呢？"

**太累了。**

---

## 💡 灵感来源

某天我在想：

> 为什么不能让 Claude Code 在需要我确认、或者完成任务的时候，**主动播放声音通知我**？

就像你家的门铃——有人来了会自动响，不用你每隔几分钟跑到门口看一眼"有人吗？现在呢？"

于是我去研究了 `settings.json` 里的 `hooks` 配置。

然后发现了新大陆。

---

## 🔧 技术实现

### 核心思路

在 `~/.claude/settings.json` 中添加 `hooks` 配置，让特定事件触发时播放蜂鸣声。

Windows 系统下，PowerShell 的 `[console]::beep(频率，时长)` 可以发出蜂鸣声。

### 完整配置

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "permission_prompt|idle_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -c \"[console]::beep(600,150);[console]::beep(600,150);[System.Threading.Thread]::Sleep(50);[console]::beep(800,300)\"",
            "timeout": 2
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -c \"[console]::beep(300,400);[System.Threading.Thread]::Sleep(100);[console]::beep(200,600)\"",
            "timeout": 2
          }
        ]
      }
    ],
    "TaskCompleted": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -c \"[console]::beep(800,100);[console]::beep(1000,100);[console]::beep(1200,100);[console]::beep(800,300)\"",
            "timeout": 2
          }
        ]
      }
    ],
    "PermissionRequest": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -c \"[console]::beep(400,150);[console]::beep(500,150);[console]::beep(600,150);[console]::beep(700,400)\"",
            "timeout": 2
          }
        ]
      }
    ]
  }
}
```

---

## 🔊 声音设计

### 1. 权限请求（PermissionRequest）

```
嘟~ 嘟嘟~ 嘟嘟嘟~ 嘟嘟嘟嘟~~
400Hz → 500Hz → 600Hz → 700Hz，音调递增
```

**使用场景**：需要确认危险操作（删除文件、git push、执行命令等）

**听感**：渐进式提醒，类似"有人需要你确认！"

---

### 2. 任务完成（TaskCompleted）

```
叮！叮！叮！叮~~~~
800Hz → 1000Hz → 1200Hz → 800Hz，经典完成音效
```

**使用场景**：长任务完成、子代理返回结果

**听感**：类似游戏任务完成的提示音，听到就开心

---

### 3. 任务停止（Stop）

```
嘟~~~ 嘟~~~~
300Hz → 200Hz，音调递减
```

**使用场景**：任务被手动停止

**听感**：表示"已结束"，类似下班的铃声（？）

---

### 4. 通知提醒（Notification）

```
嘟嘟！嘟~~~
600Hz × 2 + 800Hz，短促提醒
```

**使用场景**：`permission_prompt` 或 `idle_prompt` 触发

**听感**：类似消息提醒，提示"需要你看一眼"

---

## 🎹 自定义你的声音

### 蜂鸣声参数说明

```powershell
[console]::beep(频率，时长)
# 频率：20Hz - 20000Hz（人耳可听范围）
# 时长：毫秒
```

### 推荐频率参考

| 频率 | 听感 | 适合场景 |
|------|------|----------|
| 200-400Hz | 低沉 | 结束/停止 |
| 400-600Hz | 中音 | 普通提醒 |
| 600-800Hz | 明亮 | 重要提醒 |
| 800-1200Hz | 尖锐 | 紧急/完成 |

### 自定义示例

**急促提醒**（适合紧急确认）：
```powershell
powershell.exe -c "[console]::beep(900,100);[console]::beep(900,100);[console]::beep(900,100);[console]::beep(900,500)"
```

**温柔提醒**（适合后台任务完成）：
```powershell
powershell.exe -c "[console]::beep(500,200);[console]::beep(700,300)"
```

**赛博朋克风**（适合...装 X）：
```powershell
powershell.exe -c "[console]::beep(440,100);[console]::beep(554,100);[console]::beep(659,100);[console]::beep(880,200)"
```
> 注：这是 A 大调和弦，假装自己在《银翼杀手》里

---

## 📊 实际使用场景

### 场景 1：长任务并行处理

```
你：同时处理这三个子任务
Claude Code：好的，已启动三个子代理

（你切出去刷手机/回消息/摸鱼）

🔔 叮！叮！叮！叮~~~~ （TaskCompleted）

你切回来：嗯，第一个完成了，看看结果
```

**收益**：不需要隔几秒看一眼，声音响了起来就行

---

### 场景 2：权限确认

```
Claude Code：需要确认执行 git push

🔔 嘟~ 嘟嘟~ 嘟嘟嘟~ 嘟嘟嘟嘟~~ （PermissionRequest）

你：哦需要确认，看一下
```

**收益**：不会卡在确认界面浪费时间

---

### 场景 3：后台监控

```
你：监控这个服务的日志
Claude Code：好的，后台运行中

（你继续写代码）

🔔 嘟嘟！嘟~~~（Notification）

你：嗯，有通知，看看是什么
```

**收益**：可以安心做其他事，有声音再介入

---

## ⚠️ 注意事项

### 1. 系统音量

确保系统音量不是静音状态，否则听不到。

### 2. 蜂鸣声依赖

Windows 的 `[console]::beep()` 依赖系统蜂鸣器驱动，某些精简版系统可能需要额外配置。

### 3. 声音干扰

如果在开放办公环境，建议调低音量或改用震动/视觉提醒。

### 4. macOS/Linux 替代方案

```bash
# macOS
osascript -e 'beep'

# Linux（需要 xdg-utils）
xdg-open /usr/share/sounds/alsa/Front_Center.wav
```

---

## 📝 给你的建议

如果你也想尝试：

1. **先复制配置** —— 直接复制到 `~/.claude/settings.json`
2. **测试一下** —— 执行一个需要确认的操作，听声音
3. **按喜好调整** —— 频率和时长可以按自己喜好改
4. **别太吵** —— 选个不太突兀的声音，避免吓到自己或同事

---

## 🌅 尾声

这个技巧的本质是：

> **让工具主动适应你的工作流，而不是你主动适配工具的等待。**

你可以：

- 安心写代码
- 安心摸鱼
- 安心回消息

声音响的时候，再介入确认。

**因为最好的工具，不是让你时刻盯着它，而是它需要你的时候，会主动告诉你。**

---

## 📎 附：完整配置速查

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "permission_prompt|idle_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -c \"[console]::beep(600,150);[console]::beep(600,150);[System.Threading.Thread]::Sleep(50);[console]::beep(800,300)\"",
            "timeout": 2
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -c \"[console]::beep(300,400);[System.Threading.Thread]::Sleep(100);[console]::beep(200,600)\"",
            "timeout": 2
          }
        ]
      }
    ],
    "TaskCompleted": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -c \"[console]::beep(800,100);[console]::beep(1000,100);[console]::beep(1200,100);[console]::beep(800,300)\"",
            "timeout": 2
          }
        ]
      }
    ],
    "PermissionRequest": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -c \"[console]::beep(400,150);[console]::beep(500,150);[console]::beep(600,150);[console]::beep(700,400)\"",
            "timeout": 2
          }
        ]
      }
    ]
  }
}
```

> 复制，粘贴，生效。
>
> 然后你就可以安心摸鱼了。