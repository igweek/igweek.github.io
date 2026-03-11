> 环境：win11 系统 ，NV4060显存8GB，12700KF 32G内存

# Windows 11 本地部署文档
适用环境：

- CPU：i7-12700KF
- 内存：32GB
- 显卡：RTX 4060
- 系统：Windows 11

部署目标：

- 在 Windows 11 本机安装 Ollama
- 本机运行 千问 3.5 9B 模型
- 安装 Dify
- 让 Dify 调用本机 Ollama 的千问模型

***

## 一、整体架构

推荐你这样部署：

- Windows 11 主机：安装 Ollama
- Ollama：运行 Qwen 3.5 9B
- Docker Desktop：运行 Dify
- Dify 通过 `host.docker.internal:11434` 调用 Windows 主机上的 Ollama

简单理解：

- 模型推理在 Windows 本机上跑
- Dify 在 Docker 里跑
- 两者通过本机网络通信

这是你当前机器上最省事、最稳妥的方式。

***

## 二、部署前准备

先准备好下面这些内容：

### 1）更新显卡驱动
先把 NVIDIA 驱动更新到最新稳定版。

### 2）确认系统功能
建议确认以下内容正常：

- Windows 11 已更新
- 可以正常联网
- BIOS 没有限制虚拟化
- 系统盘和数据盘有足够空间

建议预留空间：

- Ollama 模型：至少 10GB 以上
- Dify 容器、镜像、数据库：至少 20GB 以上
- 总建议空闲空间：30GB 以上

### 3）建议规划目录
建议提前规划一个数据目录，例如：

```text
D:\AI\
├─ ollama-models
├─ dify
└─ backups
```

后面模型和容器数据都尽量不要堆在 C 盘。

***

## 三、安装 Ollama

### 1）下载安装
在 Windows 上安装 Ollama。

安装完成后，打开 PowerShell，执行：

```powershell
ollama --version
```

如果能看到版本号，就说明安装成功。

### 2）运行千问 3.5 9B
执行：

```powershell
ollama run qwen3.5:9b
```

第一次运行会自动下载模型，时间取决于你的网络速度。

下载完成后，你会进入交互界面，可以直接输入：

```text
你好，介绍一下你自己
```

如果模型能正常回复，就说明 Ollama 和模型都没问题。

***

## 四、验证 Ollama 服务

Ollama 默认会在本机开放 API 服务。

### 1）查看本地模型
在 PowerShell 执行：

```powershell
ollama list
```

### 2）检查 API 是否正常
执行：

```powershell
curl http://localhost:11434/api/tags
```

如果返回模型列表，说明 API 正常。

### 3）测试生成接口
执行：

```powershell
curl http://localhost:11434/api/generate -Method POST -ContentType "application/json" -Body '{
  "model": "qwen3.5:9b",
  "prompt": "请用一句话介绍上海"
}'
```

如果能返回结果，说明后续 Dify 可以接入。

***

## 五、修改 Ollama 模型存储目录（建议）

如果你不想把模型放在 C 盘，建议提前改目录。

### 1）创建目录
例如：

```powershell
mkdir D:\AI\ollama-models
```

### 2）设置环境变量
打开“系统属性” → “高级系统设置” → “环境变量”

新增系统变量：

```text
变量名：OLLAMA_MODELS
变量值：D:\AI\ollama-models
```

设置完成后，重启 Ollama，最好重启电脑。

### 3）重新验证
重启后再次执行：

```powershell
ollama list
```

后面新下载的模型就会优先放到新目录。

***

## 六、安装 WSL2

虽然你是在 Windows 上装 Docker，但因为 Dify 是 Linux 容器应用，所以推荐启用 WSL2。

### 1）管理员打开 PowerShell
执行：

```powershell
wsl --install
```

执行完成后重启电脑。

### 2）确认安装成功
重启后执行：

```powershell
wsl -l -v
```

如果能看到已安装的 Linux 发行版，并且版本是 2，就说明没问题。

如果还没有 Ubuntu，也可以手动安装 Ubuntu。

***

## 七、安装 Docker Desktop

### 1）安装 Docker Desktop
下载并安装 Docker Desktop。

安装时建议保持默认设置，尤其是：

- 启用 WSL2 backend
- 使用 Linux containers

### 2）首次打开后的设置
打开 Docker Desktop 后，进入设置：

#### General
确认以下选项开启：

- Use WSL 2 based engine

#### Resources
建议给 Docker 分配：

- 内存：8GB 到 12GB
- CPU：4 核以上
- 磁盘空间：至少 60GB

如果你后续还要跑知识库、向量库、文件解析，建议资源给得更宽松一些。

### 3）验证 Docker
打开 PowerShell 执行：

```powershell
docker --version
docker compose version
```

确认都能输出版本信息。

***

## 八、部署 Dify

### 1）进入 WSL 终端
打开 Ubuntu 终端，执行：

```bash
mkdir -p ~/apps
cd ~/apps
git clone https://github.com/langgenius/dify.git
cd dify/docker
```

### 2）复制配置文件
执行：

```bash
cp .env.example .env
```

### 3）启动 Dify
执行：

```bash
docker compose up -d
```

第一次启动会拉很多镜像，时间可能比较长。

### 4）查看容器状态
执行：

```bash
docker compose ps
```

如果看到多个服务都是运行状态，就说明基本成功。

### 5）查看日志
如果有异常，执行：

```bash
docker compose logs -f
```

***

## 九、访问 Dify

部署成功后，浏览器打开：

```text
http://localhost
```

正常情况下会出现 Dify 初始化界面。

第一次打开时，你需要：

- 创建管理员账号
- 设置初始工作区
- 登录后台

***

## 十、让 Dify 连接本机 Ollama

这是最关键的一步。

因为 Dify 跑在 Docker 里，而 Ollama 跑在 Windows 主机上，所以在 Dify 里**不能填 `localhost:11434`**。  
因为在容器里，`localhost` 指向容器自己，不是你的 Windows 主机。

你要填写这个地址：

```text
http://host.docker.internal:11434
```

### Dify 中的配置思路
进入 Dify 后台后：

1. 找到模型供应商设置
2. 选择 Ollama
3. 填写连接信息

建议填写如下：

- Base URL：`http://host.docker.internal:11434`
- Model Name：`qwen3.5:9b`

保存后测试连接。

如果测试通过，说明 Dify 已经能调用你本机的 Ollama。

***

## 十一、推荐的部署顺序

按这个顺序做，最稳：

### 第一步：先装 Ollama
```powershell
ollama --version
ollama run qwen3.5:9b
ollama list
```

### 第二步：验证 API
```powershell
curl http://localhost:11434/api/tags
```

### 第三步：安装 WSL2
```powershell
wsl --install
```

### 第四步：安装 Docker Desktop
安装后检查：

```powershell
docker --version
docker compose version
```

### 第五步：部署 Dify
在 Ubuntu 终端执行：

```bash
mkdir -p ~/apps
cd ~/apps
git clone https://github.com/langgenius/dify.git
cd dify/docker
cp .env.example .env
docker compose up -d
```

### 第六步：浏览器打开 Dify
```text
http://localhost
```

### 第七步：在 Dify 后台接入 Ollama
填写：

```text
http://host.docker.internal:11434
```

模型名填写：

```text
qwen3.5:9b
```

***

## 十二、常见问题排查

### 1）Ollama 能跑，但 Dify 连不上
先检查下面几点：

- Ollama 是否已经在运行
- `http://localhost:11434/api/tags` 是否有返回
- Dify 里是不是误填成了 `localhost:11434`
- 正确地址是否填成了 `http://host.docker.internal:11434`

### 2）Dify 页面打不开
检查容器是否启动：

```bash
docker compose ps
```

查看日志：

```bash
docker compose logs -f
```

也要检查 Docker Desktop 是否真的启动了。

### 3）Docker 运行很卡
提高 Docker Desktop 分配资源：

- 内存加到 10GB 或 12GB
- CPU 分配 4 核或更多
- 保证磁盘空间充足

### 4）Qwen 3.5 9B 响应慢
这是正常现象的一部分。4060 可以跑 9B，但它不是高显存卡。  
你这套配置是“可用”，而且已经不错，但如果上下文太长、请求太复杂，速度会下降。

### 5）模型下载很慢
可以先确认网络环境稳定，再重新执行：

```powershell
ollama run qwen3.5:9b
```

***

## 十三、建议的日常使用方式

建议你平时这样使用：

- Ollama 一直在 Windows 后台运行
- Dify 一直在 Docker Desktop 里运行
- 日常通过 Dify 建应用、工作流、知识库
- 模型统一调用本机 Ollama

这样后续要换模型也很方便，比如你想换别的模型，只要先在 Ollama 里拉下来，然后在 Dify 里改模型名即可。

***

## 十四、可直接保存的简版部署文档

你可以把下面这段直接保存成操作说明：

```text
Windows 11 本地部署方案

环境：
- i7 12700KF
- 32GB RAM
- RTX 4060
- Windows 11

目标：
- 本机安装 Ollama
- 运行 qwen3.5:9b
- 安装 Dify
- Dify 对接本机 Ollama

步骤：

1. 安装 Ollama
2. PowerShell 执行：
   ollama --version
   ollama run qwen3.5:9b
   ollama list

3. 验证 Ollama API：
   curl http://localhost:11434/api/tags

4. 安装 WSL2：
   wsl --install

5. 安装 Docker Desktop
   开启 WSL2 backend

6. 在 Ubuntu 中部署 Dify：
   mkdir -p ~/apps
   cd ~/apps
   git clone https://github.com/langgenius/dify.git
   cd dify/docker
   cp .env.example .env
   docker compose up -d

7. 浏览器访问：
   http://localhost

8. 在 Dify 中配置 Ollama：
   Base URL = http://host.docker.internal:11434
   Model = qwen3.5:9b
```


