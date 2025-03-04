[![](https://s2.loli.net/2024/11/21/SPFkmud9yOVBYXi.jpg)](https://s2.loli.net/2024/11/21/SPFkmud9yOVBYXi.jpg)

> SQL 注入（SQL Injection，SQLi）是一种利用 Web 应用程序中输入验证漏洞的攻击方法。攻击者通过在输入字段（如登录框、搜索栏或 URL 参数）中构造恶意 SQL 语句，导致应用程序生成意外的 SQL 查询，从而获得非授权访问数据库的权限，进而获取敏感数据、篡改数据或破坏数据库。
## 1. SQL 注入的基本原理
SQL 注入攻击通过篡改应用程序原本预期的 SQL 查询，将恶意代码注入到数据库操作中。例如，在身份验证场景中，典型的 SQL 查询为：
```sql
SELECT * FROM users WHERE username = 'user' AND password = 'password';
```
攻击者可以输入 `username` 为admin`，将` password留空。此时查询将被更改为：
```sql
SELECT * FROM users WHERE username = 'admin' --' AND password = '';
```
由于 `--或者#` 为注释符，password条件被忽略，SQL 查询实际上变为：
```sql
SELECT * FROM users WHERE username = 'admin';
```
从而绕过了身份验证，直接登录admin 账户。

EX：万能密钥：' or 1=1#
```sql
SELECT * FROM users WHERE username = '' or 1=1#'AND password = 'password';
```
