### 实验1：暴力破解攻击（Brute Force）‌

‌涉及模块‌：Proxy + Intruder
‌DVWA模块‌：Brute Force (Low级别)
‌实验步骤‌：
配置浏览器代理到Burp Suite
拦截DVWA的登录请求并发送到Intruder
设置Payload positions选择用户名/密码参数
加载密码字典（可用seclists常用字典）
分析响应长度差异判断成功组合‌教学重点‌：攻击载荷类型选择、结果差异分析、速率控制

### 实验2：命令注入漏洞利用（Command Injection）‌

‌涉及模块‌：Proxy + Repeater
‌DVWA模块‌：Command Injection (Medium级别)
‌实验步骤‌：
拦截正常ping命令请求
在Repeater中添加命令拼接符; whoami
观察响应中的系统命令执行结果
尝试多命令注入&& net user‌拓展任务‌：绕过过滤机制（如将空格替换为${IFS}）
### ‌实验3：文件上传漏洞检测（Upload）‌
‌涉及模块‌：Proxy + Scanner
‌DVWA模块‌：File Upload (High级别)
‌实验步骤‌：
拦截文件上传请求修改后缀为.php
使用Active Scan自动检测漏洞
在Scanner结果中查看风险等级
手动验证漏洞（上传webshell）‌技术讨论‌：MIME类型绕过、Magic Bytes检测

### ‌实验4：SQL盲注攻击（SQL Injection）‌‌

涉及模块‌：Intruder + Logger
‌DVWA模块‌：SQL Injection (Low级别)
‌实验步骤‌：
构造1' AND SLEEP(5)-- 测试延时注入
使用Cluster bomb攻击模式枚举数据库名长度
配置Grep-Match标记成功响应
通过日志分析时间差判断注入结果‌高阶技巧‌：利用Turbo Intruder加速攻击

### 实验5：XSS漏洞利用（Cross-Site Scripting）‌

‌涉及模块‌：Proxy + Decoder
‌DVWA模块‌：XSS Reflected (Impossible级别)
‌实验步骤‌：
拦截用户输入请求并用Decoder进行URL编码
构造<script>alert(document.cookie)</script>
测试不同事件触发方式onmouseover=alert(1)
分析CSP防护机制的绕过方法‌安全实践‌：对比不同防护等级下的攻击难度


### 实验6：CSRF攻击构造（CSRF）‌

‌涉及模块‌：CSRF PoC生成器 + Repeater
‌DVWA模块‌：CSRF (Medium级别)
‌实验步骤‌：
截取密码修改请求生成CSRF PoC
在Repeater中移除CSRF token重放请求
添加Referer头绕过基础防护
构造自动提交表单的恶意页面‌防御对比‌：验证SameSite Cookie设置的影响