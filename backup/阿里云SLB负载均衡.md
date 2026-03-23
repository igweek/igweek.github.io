## **实验场景**

**目标：**
在阿里云上搭建两个 Web 服务器（ECS），通过阿里云负载均衡（SLB）将流量分发，实现高可用和负载均衡。用户访问负载均衡的域名时，可以轮询访问不同的后端 ECS 实例。

**实验架构示意图：**

```
          ┌──────────────┐
          │  用户访问   │
          └──────┬──────┘
                 │
        ┌───────────────┐
        │ 阿里云负载均衡 │
        └───────────────┘
             │      │
      ┌──────┘      └──────┐
      │                     │
┌───────────┐         ┌───────────┐
│  ECS实例1 │         │  ECS实例2 │
│ (Web服务) │         │ (Web服务) │
└───────────┘         └───────────┘
```

**技术点：**

* ECS 实例部署 Web 服务
* SLB 配置监听和后端服务器组
* 健康检查机制
* 测试访问分流效果

---

## **实验步骤**

### **第一步：准备 ECS 实例**

1. 登录阿里云控制台 → **ECS实例** → **创建实例**
2. 配置：

   * 地域：与后续负载均衡保持一致
   * 实例规格：小型实例即可（如：ecs.t5-lc2m1.nano）
   * 镜像：选择 **Linux Ubuntu 22.04 或 CentOS 7**
   * 网络：VPC + 子网
   * 安全组：允许 22/80/443 端口（SSH 和 HTTP）
3. 启动两台 ECS，分别命名为 `WebServer1` 和 `WebServer2`

---

### **第二步：安装 Web 服务**

1. SSH 登录 ECS：

   ```bash
   ssh root@<ECS1公网IP>
   ```

2. 安装 Nginx：

   * **Ubuntu:**

     ```bash
     apt update
     apt install nginx -y
     systemctl start nginx
     systemctl enable nginx
     ```
   * **CentOS:**

     ```bash
     yum install epel-release -y
     yum install nginx -y
     systemctl start nginx
     systemctl enable nginx
     ```

3. 修改默认首页，区分两台服务器：

   ```bash
   echo "This is WebServer1" > /usr/share/nginx/html/index.html
   ```

   ECS2 也同理，写 `This is WebServer2`。

4. 测试访问：

   ```bash
   curl http://localhost
   ```

   确认网页显示对应文本。

---

### **第三步：创建负载均衡实例（SLB）**

1. 登录阿里云 → **负载均衡SLB** → **创建负载均衡**
2. 配置：

   * 类型：公网型（如果需要外网访问）
   * 地域：与 ECS 保持一致
   * 规格：小型（实验即可）
   * 带宽：按需（实验可以 1 Mbps）
3. 创建后，获取 SLB 公网 IP（或绑定域名）

---

### **第四步：配置后端服务器**

1. 在 SLB 控制台 → 选择 **负载均衡实例** → **后端服务器**
2. 添加 ECS：

   * WebServer1 和 WebServer2
   * 端口：80
   * 权重：100（默认即可）
3. 配置健康检查：

   * 协议：HTTP
   * 端口：80
   * URL：`/index.html`
   * 健康阈值：3
   * 不健康阈值：3
   * 检查间隔：5 秒
4. 保存

---

### **第五步：配置监听**

1. 在 SLB → **监听**

   * 协议：HTTP
   * 端口：80
   * 调度算法：轮询（Round-Robin）
2. 绑定到后端服务器组

---

### **第六步：测试负载均衡**

1. 访问 SLB 公网 IP：

   ```bash
   curl http://<SLB公网IP>
   ```
2. 刷新多次或在浏览器访问，应该轮流显示：

   * `This is WebServer1`
   * `This is WebServer2`
3. 可停止一台 ECS，再访问，SLB 会自动剔除不健康的服务器。

---

### **第七步：扩展实验（可选）**

* 修改权重测试流量分配比例（如 WebServer1 权重 70，WebServer2 权重 30）
* HTTPS 配置：

  * 在 SLB 上配置证书
  * 测试 HTTPS 流量分发
* 后端多端口服务（如 HTTP+HTTPS 或 WebSocket）

---

### **实验总结**

1. SLB 实现了 ECS 的负载均衡与高可用。
2. 健康检查保证故障服务器不接收流量。
3. 通过调度算法可以实现流量分配策略。
4. 对网站高并发和容错能力有直接帮助。

---

