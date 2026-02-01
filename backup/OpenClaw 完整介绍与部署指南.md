
## 什么是 OpenClaw

OpenClaw 是一款 **开源、自托管的个人 AI 助手与自动化框架**，允许你在自己的设备或服务器上运行一个智能代理，它不仅能**聊天，还能执行真实任务、访问系统资源、管理日程、处理邮件和自动化工作流**。该项目在开源社区极受关注，GitHub 星标数已破十万，是 2026 年最热门的开源个人 AI 项目之一。

核心特点：

* **本地优先、自托管**：运行在用户自己的服务器或设备上，数据完全掌控在自己手里，不依赖第三方云服务。
* **多渠道交互**：支持 WhatsApp、Telegram、Discord、Slack、Google Chat、Signal、iMessage 等主流通讯渠道。
* **主动智能代理**：不仅被动回答，还可**执行任务、操作系统、自动化工作流**。
* **可扩展性强**：插件式架构，可集成 50+ 服务和模型如 OpenAI、Anthropic、Ollama 本地模型。

---

## 系统和环境准备

**基础要求**

| 项       | 要求                                        |
| ------- | ----------------------------------------- |
| 操作系统    | Linux *首选*，macOS 支持较好，Windows 可通过 WSL2 安装 |
| Node.js | ≥ v22（OpenClaw 运行时环境）                     |
| 包管理     | npm 或 pnpm                                |
| 服务器     | 2 核、4 GB 内存及以上（推荐 VPS 或个人服务器）             |

---

## 部署方式一：本地/服务器快速安装

1. **安装 Node.js 与 npm**

```bash
# 检查版本
node -v
npm -v
```

2. **运行官方安装脚本（自动处理依赖）**

```bash
curl -fsSL https://openclaw.bot/install.sh | bash
```

> 脚本会安装 OpenClaw 并启动交互式配置向导。

3. **启动设置向导**

```bash
openclaw onboard --install-daemon
```

* 按提示选择快速入门（QuickStart）或自定义模式。
* 填写需要连接的 AI 模型 API Key（如 OpenAI/Anthropic）。

---

## 部署方式二：Docker 容器化部署

**推荐用于生产或团队环境**

1. 创建 `docker-compose.yml`：

```yaml
version: "3.8"
services:
  openclaw:
    image: openclaw/openclaw:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./data:/root/.openclaw
```

2. 启动容器

```bash
docker-compose up -d
```

3. 查看日志确认启动

```bash
docker-compose logs -f openclaw
```

4. 守护进程 & 持久化

* 挂载数据卷实现配置与记忆持久化
* 使用 `restart: unless-stopped` 保持服务长期在线

> Docker 模式更易于升级和横向部署，适合在 AWS、Hetzner 等 VPS 上运行。

---

## 部署方式三：云服务器一键部署（如轻量应用服务器）

多数云平台（例如 1Panel 或 Tencent Cloud Lighthouse）支持 **一键安装模板**：

1. 在云面板选择 OpenClaw 一键安装模板。
2. 配置关键参数（API Keys、端口等）。
3. 自动完成部署，无需手动命令行。

---

## 启动与守护进程配置

### 作为系统服务（Linux）

```bash
openclaw daemon install
openclaw daemon start
openclaw daemon status
```

### 使用 PM2 进程管理

```bash
npm install -g pm2
pm2 start openclaw --name openclaw
pm2 save
pm2 startup
```

---

## 配置常见功能

### 连接通讯渠道（示例 WhatsApp）

1. 在服务运行终端输入：

```bash
openclaw gateway
```

2. 使用手机扫码连接 WhatsApp。
3. 在控制台完成授权。

---

## 常见部署建议

📌 **安全考虑**

* 永不暴露 OpenClaw 端口在公网，优先通过反向代理 + HTTPS 或 VPN/Tailscale 访问。
* API Key 等凭证不要硬编码在脚本中。

📌 **模型选择**

* 支持 OpenAI、Anthropic、Ollama 本地
* 推荐使用本地模型减小延迟和数据泄露风险。

📌 **资源监控**

* 建议标配至少 4 GB RAM 以上
* 守护进程配置自动重启提升稳定性

---

## 结语

OpenClaw 作为自托管 AI 助手框架，突破了传统聊天机器人的被动响应限制，将 AI 与自动化深度结合，并以隐私优先、本地优先的设计赢得社区关注。无论是个人助理还是自动化工作流机器人，通过上面步骤即可快速部署，并可根据需求进一步扩展。