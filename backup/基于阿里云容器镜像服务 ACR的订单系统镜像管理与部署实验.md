
# **一、企业案例背景（具体业务）**

某连锁餐饮企业上线“订单服务（order-service）”，负责处理：

- 用户下单  
- 订单查询  
- 状态更新  

该服务需要部署在多台 ECS 上，对外提供统一接口。

原部署方式：

- 上传 jar 包  
- 手动配置环境  
- 手动启动  

问题：

- 每台服务器环境不同  
- 部署步骤不一致  
- 无法统一版本  

改造目标：

- 使用 Docker 封装订单服务  
- 使用 ACR 统一管理镜像  
- 所有服务器从同一镜像部署  

---

# **二、实验环境**

- 云平台：阿里云
- 一台 ECS（Ubuntu 20.04）  
- 已安装 Docker  

---

# **三、实验步骤（完整可操作）**

---

## **步骤1：创建 ACR 仓库**

### 操作

1. 登录阿里云控制台  
2. 进入“容器镜像服务 ACR”  
3. 创建实例（个人版即可）  
4. 创建命名空间：`food-system`  
5. 创建仓库：`order-service`  

---

### 解释

- 命名空间表示一个项目（餐饮系统）  
- 仓库表示一个服务（订单服务）  
- 后续所有镜像都会存储在这个路径下  

---

## **步骤2：准备应用（模拟订单服务）**

### 操作

```bash
mkdir order-service
cd order-service
```

创建页面文件：

```bash
nano index.html
```

内容：

```html
<h1>Order Service v1</h1>
<p>status: running</p>
```

---

### 解释

这里用静态页面模拟后端服务，本质不影响流程  
重点在于“服务如何被打包和发布”

---

## **步骤3：编写 Dockerfile**

### 操作

```bash
nano Dockerfile
```

内容：

```dockerfile
FROM nginx:latest
COPY index.html /usr/share/nginx/html/index.html
```

---

### 解释

- FROM：指定基础运行环境  
- COPY：把应用放入镜像  
- 最终镜像 = nginx + 你的业务内容  

---

## **步骤4：构建镜像**

### 操作

```bash
docker build -t order-service:v1 .
```

---

### 解释

- `order-service`：镜像名称  
- `v1`：版本号  
- 构建后镜像只存在本地  

---

## **步骤5：登录 ACR**

### 操作（从控制台复制）

```bash
docker login --username=你的账号 registry.cn-hangzhou.aliyuncs.com
```

---

### 解释

- 登录后才有权限推送镜像  
- ACR 是私有仓库，默认不允许匿名访问  

---

## **步骤6：标记镜像（关键步骤）**

### 操作

```bash
docker tag order-service:v1 registry.cn-hangzhou.aliyuncs.com/food-system/order-service:v1
```

---

### 解释

这一步的作用：

把本地镜像绑定到远程仓库地址  

格式：

```
仓库地址/命名空间/镜像名:版本
```

如果不做这一步，镜像无法推送到 ACR  

---

## **步骤7：推送镜像到 ACR**

### 操作

```bash
docker push registry.cn-hangzhou.aliyuncs.com/food-system/order-service:v1
```

---

### 解释

- 镜像被上传到云端  
- 所有服务器都可以通过该地址获取镜像  
- ACR 成为唯一“镜像源”  

---

## **步骤8：模拟新服务器部署**

---

### 操作1：删除本地镜像（模拟新机器）

```bash
docker rmi order-service:v1
```

---

### 操作2：从 ACR 拉取

```bash
docker pull registry.cn-hangzhou.aliyuncs.com/food-system/order-service:v1
```

---

### 操作3：运行容器

```bash
docker run -d -p 80:80 registry.cn-hangzhou.aliyuncs.com/food-system/order-service:v1
```

---

### 验证

浏览器访问 ECS 公网 IP：

```
http://服务器IP
```

---

### 解释

- pull：获取镜像  
- run：启动服务  
- 服务器不需要源码，只依赖镜像  

---

## **步骤9：版本升级（v2）**

---

### 操作1：修改内容

```bash
nano index.html
```

改为：

```html
<h1>Order Service v2</h1>
<p>new feature enabled</p>
```

---

### 操作2：重新构建

```bash
docker build -t order-service:v2 .
```

---

### 操作3：标记

```bash
docker tag order-service:v2 registry.cn-hangzhou.aliyuncs.com/food-system/order-service:v2
```

---

### 操作4：推送

```bash
docker push registry.cn-hangzhou.aliyuncs.com/food-system/order-service:v2
```

---

### 解释

- v1 和 v2 可以同时存在  
- 不会覆盖旧版本  
- 版本通过 Tag 区分  

---

## **步骤10：版本切换（回滚）**

---

### 停止当前容器

```bash
docker ps
docker stop 容器ID
```

---

### 启动旧版本

```bash
docker run -d -p 80:80 registry.cn-hangzhou.aliyuncs.com/food-system/order-service:v1
```

---

### 解释

- 回滚本质是“换镜像版本”  
- 不需要重新部署代码  
- 不依赖历史文件  

---

# **四、关键技术点**

- 镜像 = 标准化应用  
- ACR = 镜像集中管理中心  
- Tag = 版本控制核心  
- 部署 = 拉取镜像 + 运行  

---

