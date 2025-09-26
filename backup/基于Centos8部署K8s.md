## 1. 环境准备

### 1.1 系统要求

- 至少 2 台 CentOS 8 服务器（1 台 Master，1 台或多台 Node）
- 每台服务器至少 2GB RAM、2 个 CPU 核心
- 网络互通（关闭防火墙或配置规则）

### 1.2 配置主机名和 hosts 文件（所有节点）

```bash
# 设置主机名（以 master 节点为例）
hostnamectl set-hostname k8s-master

# 编辑 /etc/hosts，添加所有节点的 IP 和主机名
echo "192.168.1.100 k8s-master" >> /etc/hosts
echo "192.168.1.101 k8s-node1" >> /etc/hosts
```

### 1.3 关闭防火墙、SELinux 和 Swap（所有节点）

```bash
# 关闭防火墙
systemctl stop firewalld
systemctl disable firewalld

# 关闭 SELinux
setenforce 0
sed -i 's/^SELINUX=enforcing/SELINUX=disabled/' /etc/selinux/config

# 关闭 Swap
swapoff -a
sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab
```

### 1.4 配置内核参数（所有节点）

```bash
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

modprobe overlay
modprobe br_netfilter

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF

sysctl --system
```

---

## 2. 安装容器运行时（所有节点）

### 2.1 安装 Docker

```bash
# 添加 Docker 仓库
dnf config-manager --add-repo=https://download.docker.com/linux/centos/docker-ce.repo

# 安装 Docker
dnf install docker-ce docker-ce-cli containerd.io -y

# 启动并设置开机自启
systemctl enable --now docker
```

### 2.2 配置 Docker 使用 systemd 作为 cgroup driver

```bash
cat > /etc/docker/daemon.json <<EOF
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2"
}
EOF

systemctl restart docker
```

---

## 3. 安装 Kubernetes 组件（所有节点）

### 3.1 添加 Kubernetes 仓库

```bash
cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-\$basearch
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
EOF
```

### 3.2 安装 kubelet、kubeadm、kubectl

```bash
# 安装指定版本（例如 1.23.0）
dnf install kubelet-1.23.0 kubeadm-1.23.0 kubectl-1.23.0 -y

# 启动 kubelet 并设置开机自启
systemctl enable --now kubelet
```

---

## 4. 初始化 Master 节点

### 4.1 使用 kubeadm 初始化集群

```bash
# 初始化集群（替换 --apiserver-advertise-address 为 Master 节点 IP）
kubeadm init --apiserver-advertise-address=192.168.1.100 --pod-network-cidr=10.244.0.0/16

# 初始化成功后，按提示配置 kubectl
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

### 4.2 安装网络插件（例如 Flannel）

```bash
# 应用 Flannel 配置
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
```

---

## 5. 加入 Worker 节点

在每个 Node 节点上执行以下命令（来自 `kubeadm init` 输出的提示）：

```bash
kubeadm join 192.168.1.100:6443 --token <token> --discovery-token-ca-cert-hash <hash>
```

---

## 6. 验证集群状态

在 Master 节点上运行：

```bash
# 查看节点状态
kubectl get nodes

# 查看所有 Pod 状态
kubectl get pods --all-namespaces
```

---

## 7. 常见问题及解决

- **如果节点状态为 NotReady**：检查网络插件（Flannel）是否正常运行。
- **如果 kubeadm init 失败**：使用 `kubeadm reset` 重置后重试。
- **镜像拉取失败**：可尝试手动拉取镜像或配置国内镜像源。

---

## 8. 下一步建议

- 部署 Dashboard 可视化界面
- 配置持久化存储（如 NFS）
- 设置 Ingress 控制器

## 9. 部署 Kubernetes Dashboard（可视化界面）

### 9.1 安装 Dashboard

```bash
# 部署 Dashboard
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
```

### 9.2 创建访问服务（NodePort 方式）

```bash
# 编辑 Dashboard 服务类型为 NodePort
kubectl patch svc kubernetes-dashboard -n kubernetes-dashboard -p '{"spec": {"type": "NodePort"}}'
```

### 9.3 创建管理员账户和授权

```bash
# 创建服务账户和集群角色绑定
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
EOF
```

### 9.4 获取访问令牌

```bash
# 获取 Token 用于登录
kubectl -n kubernetes-dashboard describe secret $(kubectl -n kubernetes-dashboard get secret | grep admin-user | awk '{print $1}')
```

### 9.5 访问 Dashboard

- 浏览器访问：`https://<Master节点IP>:<NodePort端口>`
- 使用上一步获取的 Token 登录

---

## 10. 配置持久化存储（NFS 示例）

### 10.1 安装 NFS 服务器（可选，在存储节点操作）

```bash
# 安装 NFS 服务端
dnf install nfs-utils -y

# 创建共享目录
mkdir /nfsdata
chmod 777 /nfsdata

# 配置导出目录
echo "/nfsdata *(rw,sync,no_root_squash)" >> /etc/exports

# 启动服务
systemctl enable --now nfs-server
```

### 10.2 在所有节点安装 NFS 客户端

```bash
dnf install nfs-utils -y
```

### 10.3 创建 PersistentVolume 和 PersistentVolumeClaim

```yaml
# nfs-pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: nfs-pv
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteMany
  nfs:
    server: <NFS服务器IP>
    path: "/nfsdata"
---
# nfs-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: nfs-pvc
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 10Gi
```

应用配置：

```bash
kubectl apply -f nfs-pv.yaml
kubectl apply -f nfs-pvc.yaml
```

---

## 11. 安装 Ingress 控制器（以 Nginx Ingress 为例）

### 11.1 部署 Ingress Controller

```bash
# 使用 Helm 安装（需先安装 Helm）
helm upgrade --install ingress-nginx ingress-nginx \
  --repo https://kubernetes.github.io/ingress-nginx \
  --namespace ingress-nginx --create-namespace
```

### 11.2 验证安装

```bash
kubectl get pods -n ingress-nginx
```

---

## 12. 日常维护命令

### 12.1 查看集群信息

```bash
kubectl cluster-info
kubectl get componentstatuses
```

### 12.2 管理节点

```bash
# 驱逐节点（维护前）
kubectl drain <节点名> --ignore-daemonsets

# 恢复节点
kubectl uncordon <节点名>
```

### 12.3 日志排查

```bash
# 查看 Pod 日志
kubectl logs <pod-name> -n <namespace>

# 查看节点事件
kubectl describe node <节点名>
```

---

## 13. 安全建议

1. **定期更新**：及时升级 kubelet、kubeadm 和 kubectl 到最新稳定版。
2. **网络策略**：使用 Calico 或 Cilium 等网络插件增强网络隔离。
3. **RBAC 控制**：遵循最小权限原则分配服务账户权限。
4. **备份 etcd**：定期备份集群数据（`etcdctl snapshot save`）