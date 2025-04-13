## 查库名
```sql
 select schema_name from information_schema.schemata
```
## 查表名
```sql
 select table_name from information_schema.tables where table_schema='security'
```
## 查列名
```sql
 select column_name from information_schema.columns where table_name='users'
```
## 查字段
```sql
 select id,username,password from security.users
```