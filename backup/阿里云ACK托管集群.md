## 实验目标

本实验的目标是完成一个可真实运行的 Nginx 静态站点部署流程，并理解 Docker、ACK、Deployment、Service、滚动更新之间的关系。

## 实验环境

本实验建议使用阿里云 ACK 托管集群，官方文档说明首次使用前需要先开通 ACK，并在控制台完成 RAM 授权；创建测试集群时，如果需要公网管理能力，可以勾选使用 EIP 暴露 API Server。
另外，需要一台安装了 Docker 的本地电脑，以及能访问 ACK 控制台和执行 kubectl 的环境；Service 是 Kubernetes 用来把一组 Pod 公开为网络服务的标准方式，并可为 Pod 提供统一访问入口和负载均衡。

建议准备以下条件：

- 阿里云账号，已实名认证。
- 已开通 ACK，并完成 RAM 授权。
- 已安装 Docker Desktop 或 Linux Docker 环境。
- 已安装 kubectl。
- 已有镜像仓库可用，教学中建议直接使用阿里云 ACR，便于 ACK 拉取镜像。
- 一个简单静态网页项目目录。

## 实验内容

本实验统一命名为：

**实验：基于 ACK 的容器化应用部署、访问与滚动更新**

实验主线如下：

1. 编写一个简单静态网页。
2. 编写 Dockerfile 并本地构建镜像运行。
3. 创建 ACK 托管集群并获取 kubeconfig。
4. 将镜像推送到镜像仓库。
5. 使用 Deployment 部署 2 个副本。
6. 创建 Service 对外暴露访问。
7. 修改网页内容，构建 v2 镜像并更新 Deployment。
8. 观察滚动更新过程。

## 实验步骤

## 第一步：准备网页文件

先在本地创建一个目录，例如 `ack-nginx-demo`，并在里面创建 `index.html`。
网页内容尽量简单，便于后续观察版本变化，例如第一页写明 “Version 1 running on ACK”。这样后面更新镜像时，可以明显看到页面内容是否已经切换。

示例 `index.html`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>ACK Demo</title>
</head>
<body>
  <h1>ACK 综合实验</h1>
  <p>Version 1 running on ACK</p>
</body>
</html>
```

## 第二步：编写 Dockerfile

在同一目录下创建 `Dockerfile`。
Docker 镜像的核心作用是把应用和运行环境打包在一起，本实验选择用官方 Nginx 镜像作为基础镜像，再把网页复制进去即可，这是最容易跑通的方式。

示例 `Dockerfile`：

```bash
FROM nginx:1.25
COPY index.html /usr/share/nginx/html/index.html
EXPOSE 80
```

解释：

- `FROM nginx:1.25` 表示使用官方 Nginx 镜像。
- `COPY` 把你的网页替换到 Nginx 默认站点目录。
- `EXPOSE 80` 表示容器对外提供 80 端口，虽然它本身不真正开放端口，但能帮助理解镜像用途。

## 第三步：本地构建镜像并运行

进入项目目录后执行：

```bash
docker build -t ack-nginx-demo:v1 .
```

镜像构建成功后执行：

```bash
docker run -d -p 8080:80 --name ack-demo ack-nginx-demo:v1
```

然后浏览器访问：

```bash
http://localhost:8080
```

如果看到页面显示 `Version 1 running on ACK`，说明本地容器化成功。
这一步非常关键，因为它先验证“应用本身没问题”，后面如果 ACK 部署失败，就能把问题聚焦到 Kubernetes 或云资源配置，而不是网页或镜像本身。

可以再执行：

```bash
docker ps
```

查看容器是否正常运行。

解释：

- `docker build` 是把目录内容打成镜像。
- `docker run -p 8080:80` 是把宿主机 8080 端口映射到容器 80 端口。

## 第四步：推送镜像到镜像仓库

因为 ACK 集群中的节点要拉取镜像，所以镜像不能只存在本地，必须推送到仓库。
最方便的是阿里云 ACR，因为与 ACK 配合自然，后续镜像拉取也更顺畅。

以阿里云 **ACR** 个人版/企业版为例，大致流程是：

1. 在控制台创建命名空间。
2. 创建镜像仓库。
3. 按控制台提供的登录命令登录仓库。
4. 给镜像重新打标签并推送。

典型命令形式如下：

```bash
docker tag ack-nginx-demo:v1 <你的ACR地址>/ack-nginx-demo:v1
docker login --username=<用户名> <你的ACR地址>
docker push <你的ACR地址>/ack-nginx-demo:v1
```

解释：

- 这里 `<你的ACR地址>` 必须换成你自己控制台里仓库真实地址。

## 第五步：创建 ACK 托管集群

阿里云官方文档说明，首次创建 ACK 托管集群前，要先开通容器服务并为角色授权，然后在控制台选择“创建集群”，选择 ACK 托管集群；若个人测试需要公网连接集群，可以勾选“使用 EIP 暴露 API Server”。

建议实验中按下面做：

1. 登录阿里云容器服务 ACK 控制台。
2. 首次使用先点击开通服务。
3. 按提示完成 RAM 授权。
4. 进入“集群列表”，点击“创建集群”。
5. 选择“ACK 托管集群”。
6. 选择地域、VPC、交换机和节点规格。
7. 节点数量建议 2 台，便于观察 Pod 调度分布。
8. 创建完成后等待集群状态变为运行中。

解释：

- 工作节点本质上仍是 ECS。

## 第六步：连接集群并检查状态

集群创建成功后，在 ACK 控制台下载 kubeconfig，或根据控制台指引配置 kubectl。
然后执行：

```bash
kubectl get nodes
```

如果显示节点状态为 `Ready`，说明集群可正常访问。
再执行：

```bash
kubectl get pod -A
```

这条命令用于查看所有命名空间下的 Pod，可以观察到一些 `kube-system` 基础组件正在运行，这就是“基础组件状态”。ACK 官方相关文档也强调集群基础功能和系统组件状态是需要检查的内容。

解释：

- `kubectl get nodes` 看集群节点是否就绪。
- `kubectl get pod -A` 看系统组件与业务 Pod。

## 第七步：编写 Deployment 清单

创建 `deployment.yaml` 文件，内容如下：

```bash
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ack-nginx-demo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ack-nginx-demo
  template:
    metadata:
      labels:
        app: ack-nginx-demo
    spec:
      containers:
      - name: nginx
        image: <你的ACR地址>/ack-nginx-demo:v1
        ports:
        - containerPort: 80
```

执行部署：

```bash
kubectl apply -f deployment.yaml
```

然后查看：

```bash
kubectl get deployments
kubectl get pods -o wide
```

解释：

- `replicas: 2` 表示部署 2 个副本。
- `kubectl get pods -o wide` 可以看到 Pod 被调度到哪台节点上，便于观察“副本调度结果”。
- Deployment 它负责副本保持和滚动更新，这也是 Kubernetes 官方实践里最常用的应用部署方式。

如果你想更明显看到调度效果，可以把副本改成 3：

```bash
kubectl scale deployment ack-nginx-demo --replicas=3
```

再查看：

```bash
kubectl get pods -o wide
```

这样能更清楚观察 Pod 分布情况。

## 第八步：创建 Service 对外访问

阿里云文档说明，Service 用于把一组 Pod 公开为网络服务，并为这些 Pod 提供统一的 DNS 名称和负载均衡能力。

创建 `service.yaml`：

```bash
apiVersion: v1
kind: Service
metadata:
  name: ack-nginx-demo-svc
spec:
  selector:
    app: ack-nginx-demo
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

执行：

```bash
kubectl apply -f service.yaml
```

查看 Service：

```bash
kubectl get svc
```

等待一段时间后，如果 `EXTERNAL-IP` 出现公网 IP，说明阿里云已经为这个 Service 分配了负载均衡访问入口。
然后在浏览器访问该公网 IP，即可看到网页内容。

解释：

- `type: LoadBalancer` 在 ACK 中通常会联动云上负载均衡资源。
- 可以把这里和之前学过的 SLB 联系起来：Service 是 Kubernetes 层面的服务抽象，而云负载均衡负责真正的外部流量接入。

## 第九步：修改页面并构建 v2 镜像

现在把 `index.html` 改掉，例如改成：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>ACK Demo</title>
</head>
<body>
  <h1>ACK 综合实验</h1>
  <p>Version 2 running on ACK</p>
</body>
</html>
```

重新构建镜像：

```bash
docker build -t ack-nginx-demo:v2 .
```

重新打标签并推送：

```bash
docker tag ack-nginx-demo:v2 <你的ACR地址>/ack-nginx-demo:v2
docker push <你的ACR地址>/ack-nginx-demo:v2
```

解释：

- 这一步模拟真实开发中的“代码更新后重新发布”。
- 不建议覆盖 `v1` 标签，最好用 `v1`、`v2` 这种明确版本，便于观察变更。

## 第十步：更新 Deployment 并观察滚动发布

执行下面命令更新镜像：

```bash
kubectl set image deployment/ack-nginx-demo nginx=<你的ACR地址>/ack-nginx-demo:v2
```

查看发布状态：

```bash
kubectl rollout status deployment/ack-nginx-demo
```

也可以持续观察 Pod 变化：

```bash
kubectl get pods -w
```

Kubernetes 官方命令文档说明，`kubectl rollout` 用于管理 Deployment 等资源的上线过程，而 `kubectl rollout restart` 可以触发 Deployment 重启上线。
这里虽然我们主要用 `set image` 触发更新，但核心目的相同，都是让学生看到旧 Pod 逐步被新 Pod 替换，这就是滚动更新。

更新完成后再次访问之前的 Service 公网 IP，应该看到页面内容已变成：

`Version 2 running on ACK`

解释：

- Deployment 不会一下子把所有旧 Pod 删光，而是逐步替换。
- 这就是为什么业务升级时可以尽量不中断服务。

## 验收标准

实验成功的标准可以定为：

- 本地 Docker 容器运行成功，可通过 `localhost:8080` 访问页面。
- ACK 集群创建成功，`kubectl get nodes` 显示节点为 `Ready`。
- Deployment 成功创建，至少有 2 个 Pod 正常运行。
- `kubectl get pods -o wide` 能看到 Pod 调度到节点上的结果。
- Service 创建成功，并能通过外部 IP 访问页面。
- 镜像更新为 v2 后，页面内容成功变化。
- 能使用 `kubectl rollout status` 观察发布完成状态。