## 一、 实验目的

1. **打破传统认知**：理解在不购买、不配置任何传统云服务器（ECS）的情况下，如何快速发布公网可访问的 Web 页面。
2. **掌握触发机制**：学习阿里云 Serverless 中最基础的 **HTTP 触发器**的创建与配置。
3. **理解动态计算**：通过修改 URL 参数传递数据，体会云函数如何实时捕捉请求并动态生成不同的前端网页内容。

## 二、 实验环境要求

* 已注册并完成实名认证的阿里云账号。
* 任意现代浏览器（Chrome、Edge 等）。
* 无需安装任何本地开发环境。

---

## 三、 实验具体步骤

### 步骤一：在阿里云创建函数计算服务（预计时长：5 分钟）

1. 登录阿里云控制台，在顶部搜索栏输入并进入 **函数计算 FC**。
2. 在左侧导航栏选择 **函数**，点击蓝色的 **创建函数** 按钮。
3. 选择 **Web 函数** （这会自动为该函数绑定一个能够接收浏览器访问的 HTTP 触发器）。
4. **基础配置**：
* 函数名称填写：`hello-serverless`
* 运行环境选择：**Python 3.10**（或任意 Python 3.x 版本）


5. 其他高级配置保持默认，直接滑动到页面最下方，点击 **创建**。

### 步骤二：编写云端动态网页代码（预计时长：10 分钟）

函数创建成功后，页面会自动跳转到“代码”编辑界面。阿里云 HTTP 触发器的 Python 运行环境采用了标准的 WSGI 接口规范。

请将 Web IDE 编辑器中的默认代码全部清空，替换为以下完整代码：

```python
import urllib.parse

def handler(environ, start_response):
    # 1. 捕捉浏览器 URL 中传递的参数 (例如浏览器访问 ?name=张三)
    query_string = environ.get('QUERY_STRING', '')
    params = urllib.parse.parse_qs(query_string)
    
    # 尝试获取 'name' 参数，如果用户没有在 URL 中提供，则默认叫 "同学"
    name = params.get('name', ['同学'])[0]

    # 2. 准备网页的 HTML 内容，内置了简约的 32px 纯 CSS 网格背景
    html_content = f"""
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
            <title>我的第一个 Serverless 网页</title>
            <style>
                body {{
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    font-weight: bold;
                    text-align: center;
                    margin-top: 15%;
                    background-color: #FFFCF8;
                    background-image: 
                        linear-gradient(#E8E5E1 1px, transparent 1px),
                        linear-gradient(90deg, #E8E5E1 1px, transparent 1px);
                    background-size: 32px 32px;
                    color: #333333;
                }}
                .container {{
                    background: #FFFFFF;
                    display: inline-block;
                    padding: 40px 60px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }}
                h1 {{ 
                    font-size: 2.5em; 
                    margin-bottom: 20px; 
                    color: #222222;
                }}
                p {{ 
                    font-size: 1.1em; 
                    color: #555555; 
                    line-height: 1.6;
                    font-weight: normal;
                }}
                .highlight {{
                    color: #FF6A00;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>你好，<span class="highlight">{name}</span>！</h1>
                <p>恭喜你成功部署了第一个 Serverless 动态网页。</p>
                <p>这里没有 Nginx，没有底层服务器，一切由 <strong>事件驱动</strong>。</p>
            </div>
        </body>
    </html>
    """

    # 3. 设置 HTTP 响应头，告诉浏览器这是一段 HTML 网页文本
    status = '200 OK'
    response_headers = [('Content-type', 'text/html; charset=utf-8')]
    start_response(status, response_headers)

    # 4. 将内容编码并返回给浏览器
    return [html_content.encode('utf-8')]

```

代码粘贴完成后，务必点击编辑器左上角的 **部署代码** 按钮，等待几秒钟提示部署成功。

### 步骤三：访问测试与动态传参验证（预计时长：5 分钟）

1. 在函数详情页的上方，切换到 **触发器管理** 选项卡。
2. 找到系统自动生成的 HTTP 触发器，在配置信息中找到 **公网访问地址**，点击右侧的复制图标。
3. **基础页面测试**：打开浏览器，将复制的地址粘贴到地址栏并回车。您将看到一个带有网格背景的网页，上面显示“你好，同学！”。
4. **动态传参测试**：在浏览器地址栏的最后面，手动加上 `?name=你的名字`。
* 例如原地址为 `[https://hello-serverless-xxx.cn-hangzhou.fcapp.run](https://hello-serverless-xxx.cn-hangzhou.fcapp.run)`
* 修改为 `[https://hello-serverless-xxx.cn-hangzhou.fcapp.run?name=李四](https://hello-serverless-xxx.cn-hangzhou.fcapp.run?name=李四)`


5. 敲击回车刷新网页，页面内容会瞬间重新渲染，标题将变为“你好，李四！”。