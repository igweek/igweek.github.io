## 查库名
```sql
 select schema_name from information_schema.schemata
```
- `information_schema.schemata`：MySQL系统自带的元数据表，存储所有数据库的元信息。
- `schema_name`：该表的字段，表示数据库名称。

## 查表名
```sql
 select table_name from information_schema.tables where table_schema='security'
```
- `information_schema.tables`：存储所有表的元数据（如表名、所属数据库等）。
- `table_schema`：字段表示表所属的数据库名称（与 schema_name 对应）。
- `WHERE table_schema` = 'security'：过滤出属于 security 数据库的表。

## 查列名
```sql
 select column_name from information_schema.columns where table_name='users'
```

- `information_schema.columns`：存储所有列的元数据（如列名、数据类型等）。
- `table_name`：字段表示列所属的表名称。
- `WHERE table_name` = 'users'：过滤出属于 users 表的列。

## 查字段
```sql
 select id,username,password from security.users
```

- `security.users`：表示 security 数据库中的 users 表。
- `username, password`：具体要查询的字段名。
