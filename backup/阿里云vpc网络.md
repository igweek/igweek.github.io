涉及服务主要包括：

* Alibaba Cloud Virtual Private Cloud（VPC）
* Alibaba Cloud Elastic IP Address（EIP）
* Alibaba Cloud NAT Gateway（NAT）
* Alibaba Cloud Server Load Balancer（SLB）
* Alibaba Cloud ApsaraDB RDS（RDS）

实验中的云服务器统一使用 **ECS** 表示。

---

# 阿里云 VPC 十个经典实验

---

# 实验1：创建 VPC 网络

**实验目标**

理解云上私有网络的创建方式。

**实验步骤**

1 打开阿里云控制台
2 在顶部搜索 **VPC**
3 进入 **VPC控制台**

4 点击 **创建VPC**

填写参数：

| 参数     | 示例          |
| ------ | ----------- |
| VPC名称  | lab-vpc     |
| IPv4网段 | 10.0.0.0/16 |

点击 **确定**

5 创建交换机（子网）

进入：

```
交换机 → 创建交换机
```

填写：

| 参数  | 示例          |
| --- | ----------- |
| 名称  | subnet-a    |
| VPC | lab-vpc     |
| 可用区 | 任意          |
| 网段  | 10.0.1.0/24 |

点击 **创建**

**实验结果**

```
VPC
└── VSwitch subnet-a
      10.0.1.0/24
```

---


# 实验2：ECS 内网通信实验

## 实验目标  
验证同一子网中的 ECS 实例可以通过内网 IP 正常通信  

---

## 实验步骤  

### 1 进入控制台  
登录 [Alibaba Cloud ECS](chatgpt://generic-entity?number=0) 控制台  

---

### 2 创建 ECS1  

参数如下：

网络：lab-vpc  
交换机：subnet-a  
私网 IP：自动分配  
公网 IP：不分配  

---

### 3 创建 ECS2  

参数与 ECS1 相同：

网络：lab-vpc  
交换机：subnet-a  
公网 IP：不分配  

---

### 4 登录 ECS1  

使用远程连接工具登录 ECS1：  

在控制台中打开 ECS1，使用 [Alibaba Cloud Workbench](chatgpt://generic-entity?number=1) 进行连接  

---

### 5 获取 ECS2 内网 IP  

在控制台查看 ECS2 的私网 IP 地址  

---

### 6 测试内网通信  

在 ECS1 中执行：

```bash
ping ECS2内网IP
```

---

## 实验结果  

可以 ping 通 ECS2  

---

## 实验结论  

同一 VPC 且同一交换机内的 ECS 实例，默认通过内网互通，即使没有公网 IP，也可以通过内网 IP 实现通信

---

# 实验3：没有公网 IP 是否能访问互联网

**实验目标**

理解 VPC 默认不允许访问公网。

**实验步骤**

1 创建一台 ECS

| 参数   | 示例       |
| ---- | -------- |
| 网络   | lab-vpc  |
| 交换机  | subnet-a |
| 公网IP | 不分配      |

2 登录 ECS

3 执行命令

```
ping www.baidu.com
```

或

```
curl www.baidu.com
```

**实验结果**

访问失败。

说明：

```
私网ECS默认无法访问互联网
```

---

# 实验4：EIP 公网访问实验

**实验目标**

理解公网 IP 的作用。

**实验步骤**

1 打开 EIP 控制台

2 点击

```
申请弹性公网IP
```

选择：

| 参数   | 示例     |
| ---- | ------ |
| 带宽   | 1 Mbps |
| 计费方式 | 按量付费   |

3 创建成功后

点击

```
绑定实例
```

选择：

```
ECS
```

4 绑定刚才创建的 ECS

5 在本地电脑测试

```
ssh ECS公网IP
```

**实验结果**

成功登录 ECS。

说明：

```
EIP = 公网入口
```
再测试
```
ping www.baidu.com
````

是否能够ping通

---

# 实验5：安全组防火墙实验

**实验目标**

理解安全组的访问控制。

**实验步骤**

1 进入 ECS 控制台

2 打开

```
安全组
```

3 找到 ECS 使用的安全组

4 添加规则

```
入方向规则
```

配置：

| 协议  | 端口 | 来源        |
| --- | -- | --------- |
| TCP | 22 | 0.0.0.0/0 |

5 保存规则

6 从本地 SSH 登录

```
ssh ECS公网IP
```

7 删除该规则

再次测试 SSH

**实验结果**

SSH 无法连接。

说明：

```
安全组控制端口访问
```

---

# 实验6：不同子网通信实验

**实验目标**

理解 VPC 内不同子网之间的通信。

**实验步骤**

1 创建第二个交换机

```
名称：subnet-b
网段：10.0.2.0/24
```

2 创建两台 ECS

ECS1

```
子网：subnet-a
```

ECS2

```
子网：subnet-b
```

3 登录 ECS1

4 执行

```
ping ECS2内网IP
```

**实验结果**

可以通信。

说明：

```
VPC内不同子网默认互通
```

> 阿里云 VPC 内置路由功能，无需用户手动配置路由器即可实现子网间通信
同一 VPC 内自动通，不同 VPC 才需要你手动打通
---

# 实验7：NAT 网关上网实验

**实验目标**

让私网 ECS 可以访问互联网。

**实验步骤**

1 进入 NAT 控制台

2 创建 NAT 网关

| 参数  | 示例       |
| --- | -------- |
| VPC | lab-vpc  |
| 交换机 | subnet-a |

3 绑定 EIP

4 创建 SNAT 规则

配置：

| 参数      | 示例       |
| ------- | -------- |
| VSwitch | subnet-a |
| 公网IP    | 绑定的EIP   |

5 登录 ECS

测试

```
ping www.baidu.com
```

**实验结果**

访问成功。

原理：

```
私网IP → NAT → 公网IP
```

---

# 实验8：负载均衡实验

**实验目标**

实现流量分发。

**实验步骤**

1 创建两台 ECS

```
ECS1
ECS2
```

2 安装 Web 服务

在两台 ECS 执行：

```
yum install nginx -y
```

修改页面：

ECS1

```
echo ECS1 > /usr/share/nginx/html/index.html
```

ECS2

```
echo ECS2 > /usr/share/nginx/html/index.html
```

3 启动 nginx

```
systemctl start nginx
```

4 创建 SLB

进入 SLB 控制台

创建：

* 公网负载均衡

5 添加后端服务器

```
ECS1
ECS2
```

6 浏览器访问

```
SLB公网IP
```

**实验结果**

页面在 ECS1 和 ECS2 之间切换。

---

# 实验9：私有数据库架构

**实验目标**

理解数据库放在私网的安全架构。

**实验步骤**

1 创建 RDS 数据库

选择：

```
MySQL
```

网络：

```
VPC：lab-vpc
交换机：subnet-b
```

2 创建 ECS Web 服务器

```
子网：subnet-a
```

3 在 ECS 安装 MySQL 客户端

```
yum install mysql -y
```

4 连接数据库

```
mysql -h RDS地址 -u 用户名 -p
```

**实验结果**

ECS 可以访问 RDS。

公网无法访问数据库。

---

# 实验10：企业三层架构实验

**实验目标**

搭建标准云架构。

**实验步骤**

创建三个子网：

```
web-subnet   10.0.1.0/24
app-subnet   10.0.2.0/24
db-subnet    10.0.3.0/24
```

部署：

| 层   | 资源  |
| --- | --- |
| Web | ECS |
| App | ECS |
| DB  | RDS |

配置访问规则：

```
公网 → Web
Web → App
App → DB
```

安全组限制：

```
公网 ❌ DB
```

**实验结果**

完成典型三层架构：

```
用户
 ↓
SLB
 ↓
Web
 ↓
App
 ↓
DB
```


