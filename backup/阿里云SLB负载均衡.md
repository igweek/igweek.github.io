# **实验内容：阿里云负载均衡 SLB 流量分发实验（ECS 无公网 IP）**

## **实验目标**

1. 部署两台 ECS 实例（私网 IP）并运行 Web 服务。
2. 创建公网型负载均衡 SLB，通过 SLB 的公网 IP 访问 Web 服务。
3. 配置健康检查和轮询调度，测试负载均衡分发效果。
4. 实验过程中 ECS 无需公网 IP，通过 SLB 访问服务即可。

---

## **实验拓扑**

```
          ┌──────────────┐
          │  用户访问   │
          └──────┬──────┘
                 │
        ┌─────────────────┐
        │ 公网型 SLB       │  <- 公网 IP，用户通过互联网访问
        └───────┬─────────┘
                │
         ┌──────┴──────┐
         │             │
 ┌───────────┐   ┌───────────┐
 │  ECS1     │   │  ECS2     │
 │ (私网IP)  │   │ (私网IP)  │
 │ Web服务   │   │ Web服务   │
 └───────────┘   └───────────┘
```

---

## **实验步骤**

### **第一步：创建 VPC 和子网**

1. 登录阿里云 → VPC → 创建 VPC

   * CIDR：例如 `172.16.0.0/16`
2. 在 VPC 下创建子网

   * CIDR：例如 `172.16.1.0/24`
   * 用于部署 ECS 和 SLB 内网访问

---

### **第二步：创建 ECS 实例（私网）**

1. 登录阿里云 → ECS → 创建实例
2. 配置：

   * 地域：与 SLB 相同
   * 网络：选择上一步创建的 VPC 和子网
   * 不分配公网 IP（确保 ECS 没有公网 IP）
   * 安全组：允许 80 端口（HTTP）和 22 端口（SSH）
3. 创建两台 ECS 实例，命名：

   * `WebServer1`
   * `WebServer2`

---

### **第三步：安装 Web 服务**

1. SSH 登录 ECS：

   ```bash
   ssh root@<ECS私网IP>   # 如果在公网不可访问，可通过跳板机或 VPC 内部访问
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

3. 修改默认网页区分两台 ECS：

   ```bash
   echo "This is WebServer1" > /usr/share/nginx/html/index.html
   ```

   ECS2 同理写 `This is WebServer2`

4. 测试本地访问：

   ```bash
   curl http://localhost
   ```

---

### **第四步：创建公网型负载均衡（SLB）**

1. 登录阿里云 → 负载均衡 SLB → 创建负载均衡
2. 配置：

   * 类型：公网型
   * 计费方式：按量/包年随意
   * 规格：实验可选小型
   * VPC：选择 ECS 所在 VPC
   * 公网 IP：创建自动分配
3. 创建完成后，记下 SLB 公网 IP

---

### **第五步：添加后端服务器**

1. 在 SLB 控制台 → 负载均衡实例 → 后端服务器
2. 添加 ECS：

   * 选择 ECS1 和 ECS2（使用私网 IP）
   * 端口：80
   * 权重：100（默认）
3. 配置健康检查：

   * 协议：HTTP
   * 端口：80
   * URL：`/index.html`
   * 健康阈值：3
   * 不健康阈值：3
   * 检查间隔：5 秒
4. 保存配置

---

### **第六步：配置监听器**

1. SLB → 监听器 → 新增监听

   * 协议：HTTP
   * 端口：80
   * 调度算法：轮询（Round-Robin）
2. 绑定到后端服务器组

---

### **第七步：测试负载均衡**

1. 在外网访问 SLB 公网 IP：

   ```bash
   curl http://<SLB公网IP>
   ```
2. 刷新多次或在浏览器访问，轮流显示：

   * `This is WebServer1`
   * `This is WebServer2`
3. 停止 ECS1 的 Nginx 服务，访问 SLB：

   * SLB 自动剔除不健康的 ECS1
   * 访问结果只显示 `This is WebServer2`

