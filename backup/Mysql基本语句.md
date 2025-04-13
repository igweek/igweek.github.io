## 查库名
```sql
 select schema_name from information_schema.schemata
```
`information_schema.schemata`：MySQL系统自带的元数据表，存储所有数据库的元信息。
`schema_name`：该表的字段，表示数据库名称。

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