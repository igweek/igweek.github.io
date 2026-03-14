> 配置：i7 12700kf 内存 32GB 显卡 4060 8GB ，ollama和dify均在docker中运行，并且能够显卡直通，以达到最佳的性能，同时迁移也更方便。

* **Docker Desktop** 负责运行所有服务
* **Ollama** 负责推理模型
* **Qwen3.5 9B** 作为大模型
* **Dify** 负责 AI 应用平台
* **NVIDIA CUDA** 提供 GPU 加速

Docker → WSL2 → GPU passthrough → Ollama → Dify 调用 Ollama API

# 一、最终架构（推荐）

```
Windows 10
   │
WSL2
   │
Docker Desktop
   │
 ┌───────────────┐
 │   dify        │
 │  (web+api)    │
 └──────┬────────┘
        │ http
 ┌──────▼────────┐
 │   ollama      │
 │   qwen3.5:9b  │
 │   GPU推理     │
 └───────────────┘
        │
     RTX4060
```

优点：

* GPU加速
* 容器化
* 可以整体迁移
* 不污染系统

---

# 二、第一步：准备 GPU 直通

Docker 要使用 GPU，必须先配置 **WSL2 GPU support**。

### 1 安装 NVIDIA 驱动

安装最新 **CUDA 驱动**（非常关键）

[https://www.nvidia.com/download](https://www.nvidia.com/download)

安装后测试：

```bash
nvidia-smi
```

能看到 4060。

---

### 2 安装 WSL2

管理员 PowerShell：

```powershell
wsl --install
```

安装完成后重启。

再安装 Ubuntu：

```powershell
wsl --install -d Ubuntu
```

---

### 3 Docker 开启 WSL2

安装 **Docker Desktop**

设置：

```
Settings
 → General
 → Use WSL2 backend
```

然后：

```
Settings
 → Resources
 → WSL Integration
 → Ubuntu 打开
```

---

# 三、测试 Docker GPU

运行：

```bash
docker run --rm --gpus all nvidia/cuda:12.3.0-base-ubuntu22.04 nvidia-smi
```

如果看到 4060：

说明 **GPU passthrough 成功**。

---

# 四、Docker 部署 Ollama（GPU版）

创建目录：

```
ai-platform
 ├ docker-compose.yml
 └ ollama
      └ models
```

docker-compose.yml：

```yaml
version: "3"

services:

  ollama:
    image: ollama/ollama
    container_name: ollama
    restart: always
    ports:
      - "11434:11434"

    volumes:
      - ./ollama:/root/.ollama

    deploy:
      resources:
        reservations:
          devices:
            - capabilities: [gpu]

    runtime: nvidia
```

启动：

```bash
docker compose up -d
```

---

# 五、下载 Qwen3.5 9B

进入容器：

```bash
docker exec -it ollama bash
```

下载模型：

```bash
ollama run qwen2.5:7b
```

或者：

```bash
ollama run qwen:9b
```

（如果有 qwen3.5 版本直接拉）

模型会保存到：

```
ai-platform/ollama/models
```

这样以后 **迁移只需要复制 models 目录**。

---

# 六、Docker 部署 Dify

创建目录：

```
ai-platform
 ├ dify
 └ docker-compose.yml
```

直接下载官方 compose：

```bash
git clone https://github.com/langgenius/dify.git
```

进入：

```
dify/docker
```

启动：

```bash
docker compose up -d
```

访问：

```
http://localhost
```

---

# 七、Dify 连接 Ollama

进入 **Dify → Model Provider**

选择：

```
Ollama
```

填写：

```
API URL
http://host.docker.internal:11434
```

模型名：

```
qwen:9b
```

即可。

---

# 八、性能

4060 + Qwen9B：

| 模式    | 速度             |
| ----- | -------------- |
| GPU推理 | 25~40 tokens/s |
| CPU推理 | 5 tokens/s     |

差距 **5-8倍**。

所以 GPU 非常关键。

---

# 九、强烈建议的优化

修改环境变量：

```
OLLAMA_NUM_PARALLEL=1
OLLAMA_GPU_LAYERS=40
```

4060 8GB 基本可以：

```
30-40 GPU layers
```

---

# 十、你这个架构的优势


* 所有组件 **Docker化**
* 模型 **独立存储**
* **GPU加速**
* **可迁移**
* **可扩展**

