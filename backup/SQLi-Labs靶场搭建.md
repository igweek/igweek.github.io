## 一、SQLi-Labs
SQLi-Labs是一个专业的SQL注入练习平台，适用于GET和POST场景。GET和POST是HTTP协议中两种常用的请求方法。
- GET请求最主要从服务器获取数据。通常以查询字符串的形式附加在URL后面。例如：http://example.com/api?name=value
- POST请求主要用于向服务器发送数据，通常用于提交表单或上传文件。请求参数通过请求体（body）传递，而不是通过URL。数据量没有严格限制，适合发送大量数据。

## 二、SQLi-Labs下载
[下载地址](https://github.com/Audi-1/sqli-labs)

## 三、安装
1. 下载、安装、启动phpstudy
2. 将下载的 SQLi-Labs.zip 解压到phpstudy网站根目录下。
3. 修改 db-creds.inc 里代码如下：
例如：我的配置文件路径是“C:\phpStudy\WWW\sqli-labs-master\sql-connections”
![图片.png](https://pic.myla.eu.org/file/1741179360031_图片.png)
因为phpstudy默认的mysql数据库地址是“127.0.0.1 或 localhost"，用户名和密码都是"root"。主要是修改’$dbpass‘为root
4. 浏览器打开“http://127.0.0.1/sqli-labs/”访问首页，并点击“Setup/reset Database”以创建数据库，创建表并填充数据。
![图片.png](https://pic.myla.eu.org/file/1741179424741_图片.png)
![图片.png](https://pic.myla.eu.org/file/1741179454080_图片.png)
5. 现在浏览器打开 "http://127.0.0.1/sqli-labs/"向下翻，就可以看到有很多不同的注入点了，分为基本SQL注入、高级SQL注入、SQL堆叠注入、挑战四个部份，总共约75个SQL注入漏洞。
![图片.png](https://pic.myla.eu.org/file/1741179502770_图片.png)

## 注意事项
1. **如果80端口被占用如何释放**
```bash
netsh http show servicestate
```
任务管理器--找出PID--结束进程
2. **如果Mysql无法启动**
右键开始--运行--services.msc
停止Mysql
运行--cmd--sc delete mysql
3. **php版本**
php版本选择php5版本，否则会报错