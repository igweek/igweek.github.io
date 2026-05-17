>在传统的 Web 开发中，如果我们想做一个简单的 IP 查询工具，通常需要购买云服务器、配置 Nginx、搭建后端环境（如 Node.js 或 Python Flask），并维护一套 IP 数据库。这不仅费时费力，而且对于个人实验或低频使用的工具来说，服务器的固定成本也是一笔开销。
本文将带你通过 **Serverless（无服务器架构）** 彻底解决这些痛点。我们将利用**阿里云函数计算 FC (Function Compute)** 作为后端，配合原生 **Python 3.10** 和免费的高精度 IP 数据源，构建一个零服务器运维、按量计费（几乎免费）、自动弹性扩容的全栈 IP 查询系统。

---

## 一、 系统架构设计

在进入代码之前，我们先来看一下这个系统的整体数据流向。理解这个生命周期有助于我们后续调试代码。

1. **前端浏览器** 发起一个标准的 HTTP POST 请求，携带用户输入的 IP 地址。
2. **阿里云 HTTP 网关** 拦截请求，处理安全策略，并将请求调度给底层的 **Serverless 函数实例**。
3. **Serverless 函数 (Python)** 激活，首先处理跨域（CORS）握手，然后作为安全代理，向**真实的第三方 IP 数据源**发起请求。
4. **数据源** 返回包含地理位置、运营商等信息的 JSON 数据。
5. **Serverless 函数** 过滤清洗有用字段，组装干净的响应体，通过网关原路返回给前端。

---

## 二、 后端核心实现：阿里云云函数（Python）

为了保证函数能够**秒级冷启动**并拥有极致的性能，我们选择使用 Python 3.10 自带的 `urllib` 标准库，**不依赖任何外部第三方库（如 requests）**。这样可以避免在阿里云打包上传依赖层的繁琐步骤。

在阿里云函数计算控制台创建 **Web 函数**，并将 `index.py` 代码替换为以下内容：

```python
import json
import urllib.request
import urllib.parse

def handler(environ, start_response):
    """
    阿里云函数计算 Web 运行环境的标准 WSGI 处理函数
    """
    # 1. 彻底解决跨域问题 (CORS)
    # 浏览器的常规 POST 请求会先发送一个 OPTIONS 预检请求，必须正确响应
    if environ['REQUEST_METHOD'] == 'OPTIONS':
        status = '204 No Content'
        headers = [
            ('Access-Control-Allow-Origin', '*'),
            ('Access-Control-Allow-Methods', 'POST, OPTIONS'),
            ('Access-Control-Allow-Headers', 'Content-Type, Authorization'),
            ('Access-Control-Max-Age', '86400')  # 缓存预检结果，减少请求次数
        ]
        start_response(status, headers)
        return [b'']

    # 2. 解析前端传输的 JSON 负载
    ip_address = ''
    if environ['REQUEST_METHOD'] == 'POST':
        try:
            request_body_size = int(environ.get('CONTENT_LENGTH', 0))
            request_body = environ['wsgi.input'].read(request_body_size)
            body_json = json.loads(request_body)
            ip_address = body_json.get('ip', '').strip()
        except Exception as e:
            # 解析失败则默认为空
            pass

    # 验证输入有效性
    if not ip_address:
        status = '400 Bad Request'
        headers = [('Content-type', 'application/json'), ('Access-Control-Allow-Origin', '*')]
        start_response(status, headers)
        return [json.dumps({"error": "请输入有效的 IP 地址"}, ensure_ascii=False).encode('utf-8')]

    # 3. 接入真实的底层 IP 数据源 (使用免费高精度的 ip-api 接口，指定中文返回)
    api_url = f"http://ip-api.com/json/{ip_address}?lang=zh-CN"
    
    try:
        # 构造请求，加入标准的浏览器 User-Agent，防止被数据源的风控系统拦截
        req = urllib.request.Request(
            api_url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        
        # 发起网络请求并设置 5 秒超时保护
        with urllib.request.urlopen(req, timeout=5) as response:
            source_data = json.loads(response.read().decode('utf-8'))

        # 4. 数据清洗与业务逻辑转换
        if source_data.get('status') == 'success':
            result = {
                "success": True,
                "ip": source_data.get("query"),
                "country": source_data.get("country", "未知国家"),
                "region": source_data.get("regionName", "未知省份"),
                "city": source_data.get("city", "未知城市"),
                "isp": source_data.get("isp", "未知运营商")
            }
        else:
            # 针对数据源返回的特定错误（如私有IP、格式错误等）进行友好提示
            message = source_data.get('message', '解析失败')
            if message == 'private range':
                error_msg = "该地址为局域网私if有IP，无法查询公网地理位置"
            else:
                error_msg = f"数据源无法解析该IP: {message}"
            result = {"success": False, "error": error_msg}

    except Exception as e:
        # 捕捉网络超时或其它未知异常
        result = {"success": False, "error": f"后端代理请求数据源失败: {str(e)}"}

    # 5. 构建响应返回前端
    status = '200 OK'
    headers = [
        ('Content-type', 'application/json; charset=utf-8'),
        ('Access-Control-Allow-Origin', '*')  # 允许任何前端域跨域调用
    ]
    start_response(status, headers)
    return [json.dumps(result, ensure_ascii=False).encode('utf-8')]

```

---

## 三、 前端核心实现：极简极美的静态页面

前端采用纯原生 **HTML5 + CSS3 + Vanilla JS** 编写，没有任何框架负担。在视觉上，我们摒弃了容易造成视觉疲劳的毛玻璃效果，转而采用更加硬朗、干净的**现代极简主义设计**。配合 `32px` 的复古浅色工程网格背景，让实验呈现出工业设计的美感。

新建 `index.html`，并将代码替换如下。**注意修改代码中提示的云函数 URL。**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Serverless IP 极速查询</title>
    <style>
        * {
            box-sizing: border-box;
        }
        body {
            /* 采用现代化、无衬线的系统默认字体族 */
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            /* 32px * 32px 的浅色复古工程网格背景 */
            background-color: #FFFCF8;
            background-image: linear-gradient(#f0ebe1 1px, transparent 1px), linear-gradient(90deg, #f0ebe1 1px, transparent 1px);
            background-size: 32px 32px;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            color: #24292e;
        }
        .card {
            background: #ffffff;
            padding: 40px;
            border-radius: 6px;
            /* 干净的硬边缘低饱和度阴影，避免脏感 */
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
            border: 1px solid #e1e4e8;
            width: 100%;
            max-width: 440px;
        }
        h2 {
            margin-top: 0;
            font-size: 24px;
            font-weight: 600;
            text-align: center;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        .subtitle {
            font-size: 13px;
            color: #586069;
            text-align: center;
            margin-bottom: 32px;
        }
        .input-group {
            display: flex;
            margin-bottom: 24px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            border-radius: 6px;
            overflow: hidden;
        }
        input[type="text"] {
            flex: 1;
            padding: 14px 16px;
            border: 1px solid #d1d5da;
            border-right: none;
            border-radius: 6px 0 0 6px;
            font-size: 14px;
            outline: none;
            color: #24292e;
            transition: border-color 0.25s ease;
        }
        input[type="text"]:focus {
            border-color: #24292e;
        }
        button {
            padding: 14px 28px;
            border: 1px solid #24292e;
            background-color: #24292e;
            color: #ffffff;
            border-radius: 0 6px 6px 0;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: background-color 0.2s ease, border-color 0.2s ease;
        }
        button:hover {
            background-color: #444c56;
            border-color: #444c56;
        }
        button:disabled {
            background-color: #959da5;
            border-color: #959da5;
            cursor: not-allowed;
        }
        #result {
            background: #f6f8fa;
            border: 1px solid #e1e4e8;
            padding: 20px;
            border-radius: 6px;
            font-size: 14px;
            line-height: 2;
            display: none;
        }
        .error-box {
            color: #cb2431;
            background: #ffeef0;
            border: 1px solid #f9c2c6;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 13px;
        }
        .data-row {
            display: flex;
            border-bottom: 1px solid #eaecef;
            padding: 6px 0;
        }
        .data-row:last-child {
            border-bottom: none;
        }
        .label {
            color: #6a737d;
            width: 80px;
            font-weight: 500;
        }
        .value {
            color: #24292e;
            font-weight: 600;
        }
        .loading-text {
            color: #586069;
            text-align: center;
            font-style: italic;
        }
    </style>
</head>
<body>

    <div class="card">
        <h2>IP 地理位置查询</h2>
        <div class="subtitle">基于阿里云 Serverless 计算架构实验</div>
        
        <div class="input-group">
            <input type="text" id="ipInput" placeholder="请输入标准公网 IP，如 8.8.8.8">
            <button id="queryBtn" onclick="queryIP()">查询</button>
        </div>
        
        <div id="result"></div>
    </div>

    <script>
        // =========================================================
        // 关键配置：请将下方字符串替换为你在阿里云函数计算中获得的 HTTP 触发器公网 URL
        // =========================================================
        const ALIYUN_FC_URL = 'YOUR_ALIBABA_CLOUD_FUNCTION_URL'; 

        async function queryIP() {
            const inputEl = document.getElementById('ipInput');
            const btnEl = document.getElementById('queryBtn');
            const resultDiv = document.getElementById('result');
            
            const ip = inputEl.value.trim();

            if (!ip) {
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = '<div class="error-box">错误：输入不能为空，请输入有效的 IP 地址。</div>';
                return;
            }

            // 进入加载状态，禁用按钮防止重复提交
            btnEl.disabled = true;
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = '<div class="loading-text">正在通过阿里云 Serverless 节点向全球数据源检索...</div>';

            try {
                const response = await fetch(ALIYUN_FC_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ip: ip })
                });

                if (!response.ok) {
                    throw new Error(`HTTP 异常状态码: ${response.status}`);
                }

                const data = await response.json();

                if (data.success === false || data.error) {
                    resultDiv.innerHTML = `<div class="error-box">解析失败：${data.error}</div>`;
                } else {
                    // 渲染标准干净的数据表格
                    resultDiv.innerHTML = `
                        <div class="data-row"><span class="label">查询目标</span><span class="value">${data.ip}</span></div>
                        <div class="data-row"><span class="label">所属国家</span><span class="value">${data.country}</span></div>
                        <div class="data-row"><span class="label">地理位置</span><span class="value">${data.region} ${data.city}</span></div>
                        <div class="data-row"><span class="label">网络集成</span><span class="value">${data.isp}</span></div>
                    `;
                }
            } catch (error) {
                resultDiv.innerHTML = `
                    <div class="error-box">
                        <strong>网络联调失败！</strong><br>
                        1. 请检查 index.html 中的 ALIYUN_FC_URL 是否已正确替换。<br>
                        2. 请按 F12 打开浏览器控制台查看 Console/Network 报错。
                    </div>`;
                console.error('Request Failed:', error);
            } finally {
                // 恢复按钮状态
                btnEl.disabled = false;
            }
        }

        // 绑定回车键一键查询
        document.getElementById('ipInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                queryIP();
            }
        });
    </script>
</body>
</html>

```

---

## 四、 详尽实验操作指南

### 步骤 1：开通阿里云函数计算 FC

1. 登录阿里云控制台，搜索 **函数计算 FC**。
2. 首次进入根据提示开通服务（新用户通常有一定额度的免费试用包）。

### 步骤 2：创建 Web 函数后端

1. 在左侧导航栏点击 **函数**，然后点击 **创建函数**。
2. 选择 **Web 函数**（更适合快速构建带有路由和标准 WSGI 的网络服务）。
3. 填写基本参数：
* **函数名称**：输入 `ip-lookup-service`。
* **运行环境**：下拉菜单中选择 **Python 3.10**（或 Python 3.9）。


4. 在下方代码源配置中，选择**内联编辑器**。
5. 点击创建。

### 步骤 3：代码贴入与触发器检查

1. 进入新建函数的代码编辑界面，双击打开 `index.py`，清空官方默认模板，将上面 **第二节** 的 Python 代码完整复制进去。
2. 点击控制台顶部的 **部署代码 (Deploy)** 按钮。
3. 切换到 **触发器管理** 标签页。你会看到系统自动生成了一个 **HTTP 触发器**。
4. 复制其中的 **公网访问地址**。由于我们使用了免鉴权的匿名访问，这个 URL 就是你后端的公网 API。

### 步骤 4：联调前端

1. 在本地电脑创建 `index.html`，贴入 **第三节** 提供的全套前端代码。
2. 将代码中的 `const ALIYUN_FC_URL = 'YOUR_ALIBABA_CLOUD_FUNCTION_URL';` 修改为你刚才复制的公网触发器地址。
3. 双击在浏览器中打开 `index.html`，输入例如 `1.1.1.1` 或 `140.205.94.189`，点击查询，即可瞬间看到毫秒级返回的地理位置结果。


## 结语

通过这个实验，我们成功解锁了全栈开发的新姿势。前端页面可以丢在任何免费的静态托管服务上（如 GitHub Pages、Vercel），后端交给阿里云 Serverless 托管。当没有人访问时，后端没有任何实例在运行，**完全不产生扣费**；而当大量流量涌入时，阿里云会自动在全球范围弹性扩展出成百上千个实例来应对请求。这就是无服务器架构的魅力！

