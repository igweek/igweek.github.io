> ① 登录虚拟机（Win7_x64），登录本机数据库服务（数据库根路径：C:\phpStudy\MySQL，账号密码：root：root），请进行以下操作：1. 查询 MySQL 服务的日志路径；2. 分析 MySQL 日志，描述攻击者进行了何种类型的网络攻击？3. 攻击者窃取了哪个数据库的哪个数据表里面的敏感数据？
② 分析 Web 日志文件（c:\files\hack_access.log），日志文件可见该 Web 服务收到了何种类型的网络攻击？攻击者 IP 是？攻击者植入的后门文件名是？


## 步骤 1：设置 DVWA 安全等级为 Low

先打开 DVWA 安全页面，安全等级选 Low，点提交。下面所有操作都要在 Low 级别下做，Low 没有任何防护，SQL 注入和文件上传才能成功。

![DVWA 安全等级 Low](https://cdn.nodeimage.com/i/LQ1k1mpFRoRCWOVEQDrfIin1kYRQxYho.webp)

## 步骤 2：登录 MySQL，打开 general_log，查询日志路径

cmd 里进 MySQL 的 bin 目录登录：

```text
D:\phpStudy\MySQL\bin>mysql -uroot -proot
```

注意：`mysql -u root:root` 会报 ERROR 1045，正确写法是 `-uroot -proot`，账号密码之间没有空格。然后打开总日志，再查日志路径：

```sql
mysql> SET GLOBAL general_log = 'ON';
mysql> SHOW VARIABLES LIKE '%general_log%';
```

结果：`general_log` 是 ON，`general_log_file` 是 `D:\phpStudy\MySQL\data\303JF-4849.log`。

![MySQL 登录并查询 general_log](https://cdn.nodeimage.com/i/aliXKMTARTnsjvaahfTXblkiBKhkYHY3.webp)

## 步骤 3：做 SQL 注入

打开 DVWA 的 SQL 注入页面，用户 ID 输入 `' or 1=1 -- '`，点提交，页面一次回显全部 5 个用户（admin、Gordon、Hack、Pablo、Bob），注入成功。

![DVWA SQL 注入，输入 ' or 1=1 -- ' 回显全部用户](https://cdn.nodeimage.com/i/VRixb8TvlzdRaMaG74skB7f2dexLxhaO.webp)

## 步骤 4：分析 MySQL 日志，确定攻击类型

用记事本打开 `D:\phpStudy\MySQL\data\303JF-4849.log`，2026 年 11 月 9 日 15:08:31 有这样一条查询：

```sql
SELECT first_name, last_name FROM users WHERE user_id = "' or 1=1 -- '"
```

`' or 1=1 -- '` 闭合了原查询条件，`or 1=1` 恒成立，`-- '` 注释掉后面内容，WHERE 对所有行都成立。结论：攻击类型是 SQL 注入。

![303JF-4849.log 里的注入语句](https://cdn.nodeimage.com/i/zLuSJbS6v0NMSGcA3UTIgo9k7nTHrxoY.webp)

## 步骤 5：确定被窃取的数据库和数据表

注入语句执行之前先 `USE dvwa`，注入查询的是 `users` 表的 `first_name`、`last_name` 两个字段。结论：被窃取的是 dvwa 数据库 users 表，也就是全部用户的姓名。

![SELECT first_name, last_name FROM users](https://cdn.nodeimage.com/i/oiJkyFc36hdOZ3KYL3FkoTHqN4XWr3hA.webp)

## 步骤 6：文件上传，植入后门

打开 DVWA 的文件上传页面，选 shell.php 点上传，页面提示 `.../.../hackable/uploads/shell.php 上传成功！`。结论：Web 服务受到的攻击是文件上传漏洞利用，攻击者植入的后门文件是 shell.php。

![DVWA 文件上传，shell.php 上传成功](https://cdn.nodeimage.com/i/DuaQxL5po5YpT2XbKAGD47hhPDOGrtGn.webp)

## 步骤 7：找到 Apache 访问日志的位置

打开 `D:\phpStudy\Apache\conf\httpd.conf`，搜 CustomLog，看到：

```apache
CustomLog "logs/access.log" combined
```

访问日志在 `D:\phpStudy\Apache\logs\access.log`。

![D:\phpStudy\Apache\conf\httpd.conf](https://cdn.nodeimage.com/i/80h6vNFpohPhIzgqAthJwjgBZYNR9ayo.webp)

![httpd.conf 里的 CustomLog 配置](https://cdn.nodeimage.com/i/cj7lxDnNuzdhydGC7qDYrriQZy5vXGdY.webp)

## 步骤 8：重启 Apache

在 phpStudy 控制面板点「重启」，重启 Apache。

![phpStudy 控制面板，点重启](https://cdn.nodeimage.com/i/X0Xz6xmIODdqmdsqm6w0jdy1N0XXOv9a.webp)


## 步骤 9：验证后门能执行

浏览器打开上传后的 shell.php，页面显示 `upload test ok`，说明上传的 PHP 文件被执行了。

![浏览器打开 shell.php，显示 upload test ok](https://cdn.nodeimage.com/i/5KPGiL9o02co2q6gQKsPiulVa3XTK7Y4.webp)


## 步骤 10：打开 access.log，确定攻击者 IP

打开 `D:\phpStudy\Apache\logs\access.log`，搜 shell.php：

```text
172.17.78.199 - - [09/Nov/2026:15:55:12 +0800] "POST /dvwak/dvwa3/vulnerabilities/upload/ HTTP/1.1" 200 4216
172.17.78.199 - - [09/Nov/2026:15:56:06 +0800] "GET /dvwak/dvwa3/hackable/uploads/shell.php HTTP/1.1" 200 14
```

15:55:12，172.17.78.199 向上传页面 POST，上传了 shell.php；15:56:06，同一 IP 访问 shell.php，返回 200。结论：攻击者 IP 是 172.17.78.199。日志里 127.0.0.1 的那几行是本机自己访问，不是攻击者。

![D:\phpStudy\Apache\logs\access.log](https://cdn.nodeimage.com/i/coa4UF5bw7SejQXFbsJU5TG52Owp30E8.webp)

![access.log 里上传和访问 shell.php 的记录](https://cdn.nodeimage.com/i/uFKeCRzWTQeNtB1D1AGnZIrafYRdmexv.webp)


