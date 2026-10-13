>[!note]
① 登录虚拟机（Win7_x64），登录本机数据库服务（数据库根路径：C:\phpStudy\MySQL，账号密码：root：root），请进行以下操作：1. 查询 MySQL 服务的日志路径；2. 分析 MySQL 日志，描述攻击者进行了何种类型的网络攻击？3. 攻击者窃取了哪个数据库的哪个数据表里面的敏感数据？
② 分析 Web 日志文件（c:\files\hack_access.log），日志文件可见该 Web 服务收到了何种类型的网络攻击？攻击者 IP 是？攻击者植入的后门文件名是？

## 一、分析 MySQL 日志

### 1. 登录 MySQL

1. 打开 CMD。
2. 输入：

```
cd /d C:\phpStudy\MySQL\bin
mysql -uroot -proot
```

### 2. 查询 MySQL 日志路径

登录后依次输入：

```
SHOW VARIABLES LIKE 'log_error';
```

查看错误日志路径。

```
SHOW VARIABLES LIKE 'general_log_file';
```

查看通用查询日志路径。

```
SHOW VARIABLES LIKE 'general_log';
```

查看通用查询日志是否开启（ON 表示开启）。

### 3. 分析攻击类型

1. 找到实际存在的 MySQL 日志文件。
2. 用 Notepad++ 打开。
3. 按 `Ctrl + F` 搜索以下关键词：

```
UNION
SELECT
information_schema
INTO OUTFILE
LOAD_FILE
```

根据日志判断：

| 关键词或特征               | 可能的攻击行为      |
| -------------------- | ------------ |
| `UNION SELECT`       | SQL 注入       |
| `information_schema` | 数据库结构探测      |
| 大量异常 `SELECT`        | 数据查询或窃取行为    |
| `INTO OUTFILE`       | 将查询结果写入服务器文件 |
| `LOAD_FILE`          | 尝试读取服务器文件    |

注意：需结合完整 SQL 语句判断，不能仅凭关键词确定攻击成功。若通用日志未开启，还需要检查其他实际留存的日志。

### 4. 查找被窃取的数据库和数据表

在可疑 SQL 语句中，查找：

```
SELECT * FROM 数据库名.数据表名;
```

或者：

```
USE 数据库名;
SELECT * FROM 数据表名;
```

记录涉及敏感数据的数据库名和表名，并结合日志判断是否存在实际数据获取行为。

## 二、分析 Web 日志

### 5. 打开 Web 日志

1. 打开文件夹 `C:\files`。
2. 找到 `hack_access.log`。
3. 使用 Notepad++ 打开。

### 6. 判断攻击类型

按 `Ctrl + F`，依次搜索：

```
union
select
upload
POST
.php
.asp
.aspx
```

| 日志特征               | 可能的攻击类型       |
| ------------------ | ------------- |
| `union select`     | SQL 注入攻击      |
| `../`              | 目录遍历攻击        |
| `POST` 请求上传接口及可疑文件 | 文件上传攻击        |
| 请求异常 PHP、ASP 文件    | WebShell 后门访问 |

### 7. 查找攻击者 IP

1. 找到可疑攻击请求。
2. 查看该日志记录开头的客户端 IP。
3. 对比其他可疑请求，确认攻击来源。

常见日志格式示例：

```
192.168.1.100 - - [时间] "POST /upload.php HTTP/1.1" 200
```

攻击者 IP（示例）：`192.168.1.100`。

### 8. 查找植入的后门文件

1. 搜索 `POST`、`upload`、`.php`、`.asp`、`.aspx`。
2. 查找可疑文件上传记录。
3. 检查后续是否存在对可疑文件的访问。
4. 根据请求 URL、状态码及日志内容确认后门文件名称。

例如：

```
POST /upload.php
GET /uploads/shell.php
```

可疑后门文件名（示例）：`shell.php`。

注意：仅有访问日志不一定能确认上传成功，必要时检查网站目录中的实际文件。

