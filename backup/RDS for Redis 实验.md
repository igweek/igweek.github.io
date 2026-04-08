实验基于：

* ECS（应用服务器）
* RDS MySQL（数据库）
* RDS for Redis（缓存）
* VPC（内网通信）

核心技术：Redis

---

# 一、实验总体目标（先让学生知道在干嘛）

实现一个电商接口：

👉 查询商品信息时

* 先查 Redis
* 没有再查 MySQL
* 并写入 Redis

最终效果：
**访问速度明显提升 + 数据库压力下降**

---

# 二、实验拓扑（建议你让学生画出来）

```
浏览器
   ↓
ECS（Flask应用）
   ↓
Redis（先查缓存）
   ↓
MySQL（查真实数据）
```

---

# 三、步骤一：创建 RDS for Redis

进入阿里云控制台：

### 1. 创建实例

路径：

> 云数据库 Redis版 → 创建实例

配置建议：

* 地域：和 ECS 一致
* 网络类型：**VPC（必须）**
* 版本：Redis 5.0 或 6.0
* 架构：主从版
* 实例规格：最小即可（教学用）

---

### 2. 设置白名单

进入 Redis 实例：

> 白名单设置 → 添加 ECS 内网IP

例如：

```
192.168.0.10
```

👉 不设置会**连接失败（重点报错点）**

---

### 3. 获取连接信息

记录：

* 内网地址：`r-xxxx.redis.rds.aliyuncs.com`
* 端口：6379
* 密码：创建时设置

---

# 四、步骤二：准备 MySQL 数据

进入你的 **RDS MySQL**

---

### 1. 创建数据库

```sql
CREATE DATABASE shop;
```

---

### 2. 创建商品表

```sql
CREATE TABLE product (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    price DECIMAL(10,2),
    stock INT,
    description TEXT
);
```

---

### 3. 插入数据

```sql
INSERT INTO product (name, price, stock, description)
VALUES 
('iPhone 15', 5999, 100, 'Apple smartphone'),
('Huawei Mate 60', 4999, 200, 'Huawei phone'),
('Xiaomi 14', 3999, 300, 'Xiaomi phone');
```

---

# 五、步骤三：在 ECS 上部署应用

## 1. 登录 ECS

```bash
ssh root@你的公网IP
```

---

## 2. 安装环境

```bash
yum install -y python3
pip3 install flask redis pymysql
```

---

## 3. 创建项目文件

```bash
mkdir redis-demo
cd redis-demo
vim app.py
```

---

## 4. 写入完整代码（核心！）

```python
from flask import Flask, jsonify
import redis
import pymysql
import json
import time

app = Flask(__name__)

# Redis连接
r = redis.Redis(
    host='你的Redis内网地址',
    port=6379,
    password='你的密码',
    decode_responses=True
)

# MySQL连接
db = pymysql.connect(
    host='你的MySQL地址',
    user='用户名',
    password='密码',
    database='shop'
)

@app.route('/product/<int:pid>')
def get_product(pid):
    key = f"product:{pid}"

    # 1. 查Redis
    data = r.get(key)

    if data:
        return jsonify({
            "source": "redis",
            "data": json.loads(data)
        })

    # 2. 查MySQL
    cursor = db.cursor()
    cursor.execute("SELECT * FROM product WHERE id=%s", (pid,))
    result = cursor.fetchone()

    if not result:
        return "Not Found"

    product = {
        "id": result[0],
        "name": result[1],
        "price": float(result[2]),
        "stock": result[3],
        "desc": result[4]
    }

    # 模拟数据库慢查询
    time.sleep(1)

    # 3. 写入Redis（缓存60秒）
    r.setex(key, 60, json.dumps(product))

    return jsonify({
        "source": "mysql",
        "data": product
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

---

## 5. 启动服务

```bash
python3 app.py
```

---

## 6. 开放端口（安全组）

放行：

```
TCP 5000
```

---

# 六、步骤四：测试效果（重点实验）

浏览器访问：

```
http://ECS公网IP:5000/product/1
```

---

## 第一次访问（预期）

返回：

```json
{
  "source": "mysql",
  "data": {...}
}
```

👉 因为 Redis 还没数据

---

## 第二次访问（关键）

返回：

```json
{
  "source": "redis",
  "data": {...}
}
```

👉 命中缓存！

---

# 七、性能对比实验（必须做）

## 方法一：手动测试

连续刷新页面：

* 第一次：明显慢（1秒）
* 后续：几乎秒开

---

## 方法二：压测（推荐）

安装工具：

```bash
yum install -y httpd-tools
```

测试：

```bash
ab -n 100 -c 10 http://你的IP:5000/product/1
```

对比：

| 场景     | 响应时间 |
| ------ | ---- |
| 无Redis | 慢    |
| 有Redis | 快    |

---

# 八、缓存一致性实验

## 修改数据库

```sql
UPDATE product SET price = 2999 WHERE id = 1;
```

---

## 再访问接口

👉 你会发现：

**Redis 还是旧数据！**

---

## 解决方法

### 方法1：删除缓存

```python
r.delete("product:1")
```

---

### 方法2：等待过期（TTL）

60秒后自动更新

---

# 九、常见报错

### 1. Redis连接失败

👉 原因：没加白名单

---

### 2. 超时

👉 VPC不一致

---

### 3. 访问不了接口

👉 安全组没开5000端口

---

