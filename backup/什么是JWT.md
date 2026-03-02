# 一、JWT 是什么？

JWT 全称：

**JSON Web Token**

它本质是：

👉 一个“加密签名的字符串”  
👉 用来证明“你已经登录”

它长这样：

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

它由三部分组成：

```
Header.Payload.Signature
```

---

# 二、JWT 登录完整流程

我们用你“错题本系统”举例。

---

## 第一步：用户登录

前端发送：

```js
POST /api/login
{
  "username": "tom",
  "password": "123456"
}
```

---

## 第二步：后端验证账号密码

后端：

1. 查询数据库
2. 比对密码
3. 如果正确 → 生成 JWT

例如用：

- [jsonwebtoken](chatgpt://generic-entity?number=0) （Node 常用）
- 或 Python 里的 PyJWT

生成 token：

```js
jwt.sign(
  { userId: 123 },
  "secret_key",
  { expiresIn: "7d" }
)
```

---

## 第三步：后端把 JWT 返回给前端

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 第四步：前端保存 Token

通常保存到：

- localStorage
- 或 cookie（更安全）

```js
localStorage.setItem("token", token)
```

---

## 第五步：之后所有请求都带上 Token

```js
fetch("/api/user", {
  headers: {
    Authorization: "Bearer " + token
  }
})
```

---

## 第六步：后端验证 Token

后端中间件：

```js
jwt.verify(token, "secret_key")
```

验证通过：

✅ 允许访问  
验证失败：

❌ 返回 401

---

# 三、流程图

登录时：

前端 → 用户名密码 → 后端  
后端 → 验证 → 生成 JWT → 返回  

之后：

前端 → 携带 JWT → 后端  
后端 → 验证 JWT → 返回数据  

---

# 四、JWT 和传统 Session 的区别

## 传统 Session

- 登录后，服务器存 session
- 浏览器存一个 sessionId
- 每次请求服务器查 session

缺点：

- 服务器要存状态
- 分布式麻烦

---

## JWT

- 服务器不存登录状态
- 所有信息在 Token 里
- 服务器只负责验证签名

优点：

- 无状态
- 易扩展
- 微服务友好

---

# 五、JWT 里面存什么？

通常存：

```json
{
  "userId": 123,
  "role": "admin",
  "exp": 1710000000
}
```

⚠️ 注意：

JWT 不是加密，只是签名。  
不要放密码！

---

# 六、用在你的 React 项目里

如果你以后把错题本做成 SaaS：

数据库表：

users  
records  
wrong_questions  

流程：

1. 用户注册
2. 登录获得 JWT
3. 所有做题请求都必须带 token
4. 后端根据 token 里的 userId 查询数据

---

# 七、安全进阶（真实项目必须做）

1. Token 设置过期时间
2. 使用 https
3. 使用 HttpOnly cookie
4. 刷新 token（refresh token）
5. 密码加密存储（bcrypt）

---

# 八、一句话总结

JWT 登录本质是：

> 登录成功后，服务器发一个“签名通行证”给你。  
> 以后你带着这个通行证访问系统。
