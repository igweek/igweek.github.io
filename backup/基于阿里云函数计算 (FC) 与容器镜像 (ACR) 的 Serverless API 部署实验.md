
## 一、 实验目的

1. 理解 Serverless 架构的核心概念，掌握无服务器环境下的 Web API 部署方法。
2. 掌握使用 Docker 容器化封装应用程序及运行环境的标准流程。
3. 熟悉阿里云容器镜像服务 (ACR) 与函数计算 (FC) 的联合调用，突破传统 Serverless 部署的代码包体积限制。

## 二、 实验环境要求

* **本地环境**：已安装并启动 Docker 的计算机（Windows 推荐使用 WSL2 + Docker Desktop，或原生 Linux/macOS 终端）。
* **云端环境**：已注册并实名认证的阿里云账号。

---

## 三、 实验具体步骤

### 任务 1：本地工程搭建与代码编写

在本地计算机中创建一个名为 `serverless-lab` 的文件夹，并在该文件夹内创建以下三个核心文件：

**1. 编写业务逻辑代码（`main.py`）**
本段代码使用 FastAPI 框架搭建了一个轻量级的 Web 接口，模拟 AI 文本处理。

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

app = FastAPI()

# 定义前端请求的数据格式
class TextRequest(BaseModel):
    text: str

# 定义 POST 接口
@app.post("/analyze")
async def analyze_text(request: TextRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="输入的文本不能为空")
    
    # 模拟文本处理逻辑（实验中可替换为真实的 AI 模型调用）
    text_length = len(request.text)
    # 简单的关键词提取模拟（按空格拆分取前5个词）
    keywords = [word for word in request.text.split() if len(word) > 1][:5]
    
    return {
        "status": "success",
        "message": "文本处理完成",
        "data": {
            "original_length": text_length,
            "preview": request.text[:15] + "..." if text_length > 15 else request.text,
            "keywords": keywords
        }
    }

if __name__ == "__main__":
    # 阿里云 FC 的自定义容器默认监听 9000 端口，且必须绑定到 0.0.0.0
    uvicorn.run(app, host="0.0.0.0", port=9000)

```

**2. 编写依赖清单（`requirements.txt`）**
声明 Python 程序运行所需的第三方库。

```text
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.2

```

**3. 编写镜像构建文件（`Dockerfile`）**
定义如何将上述代码和 Python 环境打包成一个标准的 Docker 镜像。

```dockerfile
# 1. 使用轻量级的 Python 3.10 官方基础镜像
FROM python:3.10-slim

# 2. 设置容器内的工作目录
WORKDIR /app

# 3. 将本地的 requirements.txt 复制到容器内
COPY requirements.txt .

# 4. 使用阿里云国内镜像源加速安装 Python 依赖包
RUN pip install --no-cache-dir -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/

# 5. 将本地的业务代码复制到容器内
COPY main.py .

# 6. 声明容器运行时对外暴露的端口
EXPOSE 9000

# 7. 指定容器启动时执行的命令
CMD ["python", "main.py"]

```

---

### 任务 2：阿里云容器镜像服务 (ACR) 配置

1. 登录阿里云控制台，搜索并进入 **容器镜像服务 ACR**。
2. 在左侧菜单栏点击 **实例列表**，选择 **个人版**。
3. **设置凭证**：点击左侧 **访问凭证**，设置一个固定的 Docker 登录密码（请牢记，下一步终端登录需要用到）。
4. **创建命名空间**：点击左侧 **命名空间**，点击创建，输入一个全局唯一的名称（如您的拼音缩写+学号 `zhangsan-2024`）。
5. **创建镜像仓库**：
* 点击左侧 **镜像仓库** -> **创建镜像仓库**。
* 地域选择 **华东1（杭州）** 或离您最近的地域。
* 命名空间选择上一步创建的名称。
* 仓库名称填写：`api-lab`。
* 仓库类型选择：**公开**。
* 下一步代码源选择：**本地交仓**，点击创建完成。



---

### 任务 3：本地镜像构建与推送云端

在本地包含 Dockerfile 的 `serverless-lab` 文件夹中打开终端（如果是 Windows，在文件夹空白处右键选择“在终端中打开”），依次执行以下命令：

**1. 登录阿里云镜像仓库**
*(请将 `[您的阿里云账号]` 替换为您真实的账号名，回车后输入刚才设置的访问凭证密码)*

```bash
docker login --username=[您的阿里云账号] registry.cn-hangzhou.aliyuncs.com

```

**2. 构建 Docker 镜像**
*(注意命令最后有一个小点 `.`，表示在当前目录寻找 Dockerfile)*

```bash
docker build -t api-lab:v1 .

```

**3. 为镜像打上阿里云仓库标签**
*(请将 `[您的命名空间]` 替换为您在任务2中创建的命名空间)*

```bash
docker tag api-lab:v1 registry.cn-hangzhou.aliyuncs.com/[您的命名空间]/api-lab:v1

```

**4. 推送镜像至云端**

```bash
docker push registry.cn-hangzhou.aliyuncs.com/[您的命名空间]/api-lab:v1

```

等待进度条跑完，显示 `pushed` 后，即可在阿里云 ACR 控制台查看到该镜像。

---

### 任务 4：在函数计算 (FC) 中部署 Serverless API

1. 在阿里云控制台搜索并进入 **函数计算 FC**。确保地域与刚才 ACR 镜像仓库所在的地域**保持一致**。
2. 点击 **创建函数**，选择 **Web 函数**。
3. **基础配置**：函数名称填写 `my-ai-api`。
4. **运行环境**：选择 **容器镜像 (Custom Container)**。
5. **容器镜像配置**：
* 点击“选择镜像”。
* 选择您的个人版实例 -> 对应的命名空间 -> `api-lab` 仓库 -> 选择 `v1` 版本。


6. **网络配置**：在高级配置的“监听端口”中，确保填写为 **9000**。
7. 点击最下方的 **创建** 按钮。系统会自动拉取镜像并启动实例。

---

### 任务 5：配置跨域与接口调用测试

**1. 配置跨域支持 (CORS)**
为了允许网页端前端代码能够直接访问此 API，需要配置跨域：

* 在部署好的函数页面，点击 **触发器管理** 选项卡。
* 找到自动生成的 HTTP 触发器，点击右侧的 **编辑**。
* 找到 **跨域配置 (CORS)**。
* **允许 Methods**：勾选 `POST`。
* **允许 Headers**：填写 `*`。
* 保存配置，并**复制页面上显示的“公网访问地址”**。

**2. 编写客户端测试代码**
在本地任意位置创建一个 `test.py`，用于验证部署在云端的 Serverless API 是否工作正常。

```python
import requests
import json

# 替换为您刚刚在控制台复制的函数公网访问地址
URL = "https://my-ai-api-xxxxxxx.cn-hangzhou.fcapp.run/analyze"

# 准备要处理的文本数据
payload = {
    "text": "阿里云函数计算是一个事件驱动的全托管计算服务。使用容器镜像部署可以完美解决环境依赖的问题。"
}

print("正在向 Serverless API 发送请求...")
# 发送 POST 请求
response = requests.post(URL, json=payload)

# 打印返回结果
if response.status_code == 200:
    print("调用成功！返回结果如下：")
    print(json.dumps(response.json(), indent=4, ensure_ascii=False))
else:
    print(f"调用失败，状态码: {response.status_code}")
    print(response.text)

```

运行该测试脚本，如果能成功打印出包含 `status: success` 和分析结果的 JSON 数据，即标志着整个基于容器部署的 Serverless 实验圆满成功。