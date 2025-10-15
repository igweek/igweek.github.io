## 总览

1.  准备三台虚拟机Ubuntu系统
2.  为Ubuntu系统初始化一些配置
3.  安装容器运行时（cri-docker或者containerd，两种方式都介绍）
4.  安装并部署k8s集群
5.  验证集群
6.  如果安装错了，回退它！`kubeadm reset`

## 一、准备三台虚拟机

k8s集群至少准备3台机器，一台master，两台worker。

安装教程我放在了文章末尾，可以到末尾\[附录1\]章节查看

## 二、为Ubuntu系统初始化一些配置

安装k8s之前，必须对系统做一些配置，否则k8s无法启动。

### 2.1 IP规划

我的网段是 `192.168.31.0/24`，所以我的虚拟机地址都在这个网段。可以根据你自己的网段设置IP。至少准备三台虚拟机，我的三台虚拟机IP分配如下，一台master节点，两台worker节点。配置有点多，如果有些配置你不懂，没关系，代码我都准备好了，只要没有特殊说明，就可以直接copy代码执行。^\_^

> 我采用的是桥接网络模式，相当于局域网的一台机器，可以与局域网互相连通
>
> **第2章节的所有命令，如果没有特殊说明，表示在三台机器上都要执行**

| 名称      | ip             |
| --------- | -------------- |
| k8smaster | 192.168.31.224 |
| k8snode1  | 192.168.31.225 |
| k8snode2  | 192.168.31.226 |

### 2.2 准备Root用户

因为ubuntu默认没有开启root用户，而使用root操作会方便很多。 设置root密码



```bash
sudo passwd root
```

切换root


```bash
su - root
```

### 2.3 设置主机名

> 分别为三台机器设置主机名



```bash
sudo hostnamectl set-hostname "k8smaster"
sudo hostnamectl set-hostname "k8snode1"
sudo hostnamectl set-hostname "k8snode2"
```

### 2.4 域名写入host文件



```bash
cat >> /etc/hosts << EOF
192.168.31.224 k8smaster
192.168.31.225 k8snode1
192.168.31.226 k8snode2
# 如果你想多玩几台机器，也可以自行添加
192.168.31.227 k8snode3
EOF
```

可以在master上使用`ping`命令验证


```bash
ping -c 2 k8snode1
```

### 2.5 时间同步

分布式要解决的一个问题就是时钟同步，这里我们借助阿里云服务，实现集群节点与阿里云时钟同步 设置时区为上海


```bash
timedatectl set-timezone Asia/Shanghai
```

#### 安装ntpdate并与阿里云同步


```bash
sudo apt install -y ntpsec-ntpdate
ntpdate ntp.aliyun.com
```

#### 配置自动同步

使用`crontab`设置定时任务，每天晚上0点执行 终端输入



```bash
crontab -e
```

选择一个合适的编辑器，然后在配置末尾加上如下代码，表示每晚0点执行同步命令



```c
0 0 * * * ntpdate ntp.aliyun.com
```

### 2.6 配置内核转发和网桥过滤

生成配置



```bash
cat << EOF | tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF
```

如上配置需要加在如下两个模块



```bash
modprobe overlay
modprobe br_netfilter
```

写到配置文件，永久生效


```bash
cat << EOF | tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF
```

应用配置



```bash
sysctl --system
```

### 2.7 安装ipvs



```bash
apt install -y ipset ipvsadm
```

配置ipvsadm的模块，这些都是算法模块，目的是为了让开机自动加载



```bash
cat << EOF | tee /etc/modules-load.d/ipvs.conf
ip_vs
ip_vs_rr
ip_VS_wrr
ip_vs_sh
nf_conntrack
EOF
```

编写脚本自动加载


```bash
cat << EOF | tee ipvs.sh
#!/bin/sh
modprobe -- ip_vs
modprobe -- ip_vs_rr
modprobe -- ip_vs_wrr
modprobe -- ip_vs_sh
modprobe -- nf_conntrack
EOF
```

执行脚本



```bash
sh ipvs.sh
```

验证脚本是否生效


```bash
lsmod | grep ip_vs
```

### 2.8 关闭swap分区

**步骤1：首先，查看当前启用的交换分区，可以使用 swapon 命令：**



```bash
sudo swapon --show
```

输出会类似于：


```
NAME      TYPE  SIZE   USED  PRIO
/dev/sda2 partition 4G    0B    -2
```

**步骤2：禁用交换分区** 下面命令只是临时禁用


```bash
sudo swapoff -a
```

**步骤 3：禁止交换分区在系统启动时自动挂载**

```bash
sudo vim /etc/fstab
```

注释掉如下行


```
/dev/sda2 none swap sw 0 0
```

> 至此，Ubuntu服务器配置就初始化成功了，下面可以开始准备集群环境了！

## 三、安装容器运行时

> **第三章节的所有命令，如果没有特殊说明，表示在三台机器上都要执行**

k8s1.24（包含1.24）版本后移除了内置的docker引擎，推荐使用`containerd`容器运行时。官网大势所趋，没什么好说的。但是！！！国内的网络实在是无法拉取镜像，导致集群根本搭建不起来。尝试了以下各种方法都没解决

- 宿主机使用魔法上网，虚拟机使用NAT网络，共享宿主机的魔法网络。（失败！）
- 为containerd配置国内镜像源，特指阿里云（失败）

> 无奈之下，还是使用`cri-docker`作为容器运行时吧！但是安装containerd的内容我也会放到\[附录2\]，有哪位大神可以分享containerd拉取镜像不失败的办法可以评论区留下链接！

### 3.1 安装Docker

可参考[官网](https://link.juejin.cn/?target=https%3A%2F%2Fdocs.docker.com%2Fengine%2Finstall%2Fubuntu%2F "https://docs.docker.com/engine/install/ubuntu/")安装，也可以按照如下步骤安装，

1.  安装apt仓库



```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

2.  安装最新版docker



```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

3.  使用 `docker --version` 检查

### 3.2 配置Docker镜像加速

众所周知，国内docker下载镜像很困难，需要我们手动设置国内的镜像源。

修改 `/etc/docker/daemon.json`，如果该文件不存在就创建该文件并把以下内容写入文件。



```json
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://doublezonline.cloud",
    "https://dislabaiot.xyz",
    "https://docker.fxxk.dedyn.io",
    "https://dockerpull.org",
    "https://docker.unsee.tech",
    "https://hub.rat.dev",
    "https://docker.1panel.live",
    "https://docker.nastool.de",
    "https://docker.zhai.cm",
    "https://docker.5z5f.com",
    "https://a.ussh.net",
    "https://docker.udayun.com",
    "https://hub.geekery.cn"
  ],
  "insecure-registries": ["kubernetes-register.sswang.com"],
  "exec-opts": ["native.cgroupdriver=systemd"]
}
```

然后重启



```bash
systemctl daemon-reload
systemctl restart docker
```

设置开机重启



```bash
systemctl enable docker
```

### 3.3 安装cri-docker

为什么需要安装cri-docker？他相当于一个桥梁，k8s通过调用cri-docker来间接调用docker服务安装最新版本，这里为 `0.3.16`


使用wget（或其他方式）下载到服务器上



```bash
wget https://github.com/Mirantis/cri-dockerd/releases/download/v0.3.16/cri-dockerd-0.3.16.amd64.tgz
```

### 3.3.1 配置cri-docker

解压



```bash
tar xf cri-dockerd-0.3.16.amd64.tgz
```

解压完成后，其实只有一个文件：`cri-dockerd`

我们只需要把它移动到 `/usr/bin` 下即可 移动文件到 `/usr/bin` 目录



```bash
cp cri-dockerd/cri-dockerd /usr/local/bin/
cp cri-dockerd/cri-dockerd /usr/bin/
```

查看版本号（只为验证）



```bash
cri-dockerd --version
```

设置开机启动脚本，创建文件 `/etc/systemd/system/cri-dockerd.service` ，写入如下内容（完全复制即可）

> k8s1.32版本对应的pause是3.10



```toml
cat > /etc/systemd/system/cri-dockerd.service<<-EOF
[Unit]
Description=CRI Interface for Docker Application Container Engine
Documentation=https://docs.mirantis.com
After=network-online.target firewalld.service docker.service
Wants=network-online.target
Requires=cri-dockerd.socket     # 修正为 cri-dockerd.socket（与文件名一致）

[Service]
Type=notify
ExecStart=/usr/local/bin/cri-dockerd --pod-infra-container-image=registry.cn-hangzhou.aliyuncs.com/google_containers/pause:3.10 \
 --network-plugin=cni --cni-conf-dir=/etc/cni/net.d --cni-bin-dir=/opt/cni/bin --container-runtime-endpoint=unix:///var/run/cri-dockerd.sock --cri-dockerd-root-directory=/var/lib/dockershim --docker-endpoint=unix:///var/run/docker.sock --cri-dockerd-root-directory=/var/lib/docker
ExecReload=/bin/kill -s HUP $MAINPID
TimeoutSec=0
RestartSec=2
Restart=always
StartLimitBurst=3
StartLimitInterval=60s
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
TasksMax=infinity
Delegate=yes
KillMode=process
[Install]
WantedBy=multi-user.target
EOF
```

创建 `/etc/systemd/system/cri-docker.socket` 文件，并写入如下内容



```toml
cat > /etc/systemd/system/cri-dockerd.socket <<-EOF
[Unit]
Description=CRI Docker Socket for the API
PartOf=cri-dockerd.service    # 保持与服务文件名一致

[Socket]
ListenStream=/var/run/cri-dockerd.sock
SocketMode=0660
SocketUser=root
SocketGroup=docker

[Install]
WantedBy=sockets.target
EOF
```

执行开机启动



```bash
systemctl daemon-reload
systemctl enable cri-dockerd.service
systemctl restart cri-dockerd.service
```

验证启动信息



```ruby
root@k8snode2:~# ls  /var/run | grep docker
cri-dockerd.sock
docker
docker.pid
docker.sock
```

## 四、安装&部署k8s集群

> **第4章节的所有命令，有的需要在三台机器上都执行，有的只需要在worker上执行，有的只需要在master上执行。我会标注**

激动(≧▽≦)/，终于开始安装k8s本体了！这里以安装1.32版本为例

### 4.1 基本工具

1.  更新 `apt` 包索引并安装使用 Kubernetes `apt` 仓库所需要的包：



```bash
# 三台机器都执行
sudo apt-get update
# apt-transport-https 可能是一个虚拟包（dummy package）；如果是的话，你可以跳过安装这个包
sudo apt-get install -y apt-transport-https ca-certificates curl gpg
```

### 4.2 公共签名密钥（1.32）

如果 `/etc/apt/keyrings` 目录不存在，则应在 curl 命令之前创建它，请阅读下面的注释。 `sudo mkdir -p -m 755 /etc/apt/keyrings`



```bash
# 三台机器都执行
# 如果 `/etc/apt/keyrings` 目录不存在，则应在 curl 命令之前创建它，请阅读下面的注释。
# sudo mkdir -p -m 755 /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.32/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
```

验证



```ruby
root@k8smaster:~# ls /etc/apt/keyrings/
kubernetes-apt-keyring.gpg
```

### 4.3 准备源仓库



```bash
# 三台机器都执行
# 此操作会覆盖 /etc/apt/sources.list.d/kubernetes.list 中现存的所有配置。
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.32/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
```

验证



```ruby
root@k8smaster:~# ls /etc/apt/sources.list.d/
kubernetes.list  ubuntu.sources.curtin.orig
ubuntu.sources
```

#### 查看软件依赖（非必看章节，可直接跳到4.4开始安装）



```bash
apt update
apt-cache policy kubeadm
```

输出结果



```ruby
root@k8smaster:~# apt-cache policy kubeadm
kubeadm:
  Installed: 1.32.2-1.1
  Candidate: 1.32.2-1.1
  Version table:
 *** 1.32.2-1.1 500
        500 https://pkgs.k8s.io/core:/stable:/v1.32/deb  Packages
        100 /var/lib/dpkg/status
     1.32.1-1.1 500
        500 https://pkgs.k8s.io/core:/stable:/v1.32/deb  Packages
     1.32.0-1.1 500
        500 https://pkgs.k8s.io/core:/stable:/v1.32/deb  Packages
```

#### 查看软件依赖树（非必看章节，可直接跳到4.4开始安装）



```bash
apt-cache showpkg kubeadm
```

#### 查看软件版本（非必看章节，可直接跳到4.4开始安装）



```bash
apt-cache madison kubeadm
```

输出结果



```ruby
root@k8smaster:~# apt-cache policy kubeadm
kubeadm:
  Installed: 1.32.2-1.1
  Candidate: 1.32.2-1.1
  Version table:
 *** 1.32.2-1.1 500
        500 https://pkgs.k8s.io/core:/stable:/v1.32/deb  Packages
        100 /var/lib/dpkg/status
     1.32.1-1.1 500
        500 https://pkgs.k8s.io/core:/stable:/v1.32/deb  Packages
     1.32.0-1.1 500
        500 https://pkgs.k8s.io/core:/stable:/v1.32/deb  Packages
root@k8smaster:~# apt-cache madison kubeadm
   kubeadm | 1.32.2-1.1 | https://pkgs.k8s.io/core:/stable:/v1.32/deb  Packages
   kubeadm | 1.32.1-1.1 | https://pkgs.k8s.io/core:/stable:/v1.32/deb  Packages
   kubeadm | 1.32.0-1.1 | https://pkgs.k8s.io/core:/stable:/v1.32/deb  Packages
```

### 4.4 安装

`kubeadm kubectl kubelet`是安装k8s的工具。

安装默认版本



```bash
# 三台机器都执行
sudo apt-get install -y kubelet kubeadm kubectl
```

> 参考：安装指定版本 比如，当前版本是1.32.2，但是我想安装`1.31.0-1.1`版本，可以使用如下命令 sudo apt-get install -y kubelet=1.31.0-1.1 kubeadm=1.31.0-1.1 kubectl=1.31.0-1.1

#### 锁定版本

为了防止自动更新



```bash
# 三台机器都执行
apt-mark hold kubelet kubeadm kubectl
```

如果想升级版本，可以解锁



```bash
apt-mark unhold kubelet kubeadm kubectl
```

### 4.5 配置kubelet

进入文件kubelet，1.30版本之后都是在 `/etc/default/kubelet`，之前字啊 `/etc/sysconfig/kubelet`



```bash
# 三台机器都执行
vim /etc/default/kubelet
```

添加为如下配置，配置cgroup管理



```markdown
# 三台机器都执行

KUBELET_EXTRA_ARGS="--cgroup-driver=systemd"
```

设置开机自启动

**注意：** 这里只是设置开机启动，但是并没有启动 `kubelet`。请不要在此刻启动kubelet。那什么时候启动呢？等kubeadm init 的时候会自动带起来 `kubelet`



```bash
# 三台机器都执行
systemctl enable kubelet
```

### 4.6 初始化集群

**初始化集群的操作，请在master上操作，加入集群的命令请在worker节点操作。命令会详细说明**

#### 4.6.1 规划集群网段

规划pod/service网段，这两个网段和宿主机网段不能重复！原则只有一个：三个网段不重复，没有交叉即可！

- 宿主机网段：前面已经规划过。即：192.168.31.0/24
- service网段：10.96.0.0/12
- pod网段：10.244.0.0/16

#### 4.6.2 执行kubeadm init命令

执行kubeadm来初始化集群，注意不要完全抄如下命令，请自行更改参数值。下面有参数释义。



```bash
# master节点执行
kubeadm init  \
--kubernetes-version=1.32.2  \
--control-plane-endpoint=k8smaster  \
--apiserver-advertise-address=192.168.31.224  \
--pod-network-cidr=10.244.0.0/16  \
--service-cidr=10.96.0.0/12  \
--image-repository=registry.aliyuncs.com/google_containers   \
--cri-socket=unix:///var/run/cri-dockerd.sock  \
--upload-certs   \
--v=9
```

参数释义：

- kubernetes-version：指定k8s的版本，我这里是1.32.2，你的也许是1.31.1-1.1等
- control-plane-endpoint：可以理解为集群master的命名，随意写即可
- apiserver-advertise-address：集群中master的地址！注意不要抄，写你自己虚拟机的ip地址
- pod-network-cidr：pod网段地址，4.6.1已经规划过了，只要不与集群网段和service网段重复即可
- service-cidr：service网段地址，4.6.1已经规划过了，只要不与集群网段和pod网段重复即可
- image-repository：指定使用国内镜像
- cri-socket：指定使用的容器运行时，如果你使用的containerd容器，那就不用写这个参数
- v：日志级别，9表示输出的信息会很详细

根据自己的ip设置好参数后，在master！注意是master节点，上执行`kubeadm init`命令。可能会需要一两分钟下载镜像，执行完毕后输出如下：

> 执行的时候如果出错可能是因为命令里有空格，实在不行你可以手敲。命令是对的。问题已修正，修正日期：2025/03/01


输出中有两段非常重要的命令（请注意，不要copy我的命令1、命令2.请使用你自己控制台输出的命令）

命令1：



```bash
# master节点执行
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

命令2：命令2的意思是使当前节点加入k8s集群。**其中cri-socket是指定容器运行时，如果你是containerd，可以不用写该参数。**



```bash
# 其余worker节点执行
kubeadm join k8smaster:6443 --token xz5yda.n039y3u3vhr7r79e \
	--discovery-token-ca-cert-hash sha256:a352ce9721a4ff2cec99275309c2373cbd9815ba36193b957871c0b09862d6c6 \
   --cri-socket=unix:///var/run/cri-dockerd.sock
```

请把命令1在master节点执行。命令2分别在其他的worker节点执行

然后执行 `kubectl get nodes`命令就可以看到三台机器都在同一个集群了。



```sql
root@k8smaster:~# kubectl get nodes
NAME        STATUS      ROLES           AGE   VERSION
k8smaster   NotReady    control-plane   15h   v1.32.2
k8snode1    NotReady    <none>          15h   v1.32.2
k8snode2    NotReady    <none>          15h   v1.32.2
```

但是节点都还是`NoteReady`状态，接下来我们来配置Pod网络，让集群变成`Ready`状态。需要使用calico组件完成

### 4.7 安装calico

**4.7 章节的命令，请在master上操作**


#### 4.7.1 安装

直接copy官网的第一步命令，在master节点上安装



```bash
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.29.2/manifests/tigera-operator.yaml
```

#### 4.7.2 下载配置文件

不能直接按照官网的第二步操作 官网第二步为：



```bash
# master执行
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.29.2/manifests/custom-resources.yaml
```

应当先下载里面的配置文件，我们去修改配置文件



```bash
# master执行
wget  https://raw.githubusercontent.com/projectcalico/calico/v3.29.2/manifests/custom-resources.yaml
```

#### 4.7.3 编辑配置文件修改pod网段



```bash
# master执行
vim custom-resources.yaml
```

修改其中的网段为之前规划好的pod网段`10.244.0.0/16`（4.6.1规划的，可以回去看一看）



#### 4.7.4 运行calico

使用create而不是apply



```bash
# master节点执行
kubectl create -f custom-resources.yaml
```

如果安装过程中由于网络或其他问题，安装失败，想删除资源，可以使用。一般只要是镜像源配置对了就不会失败



```bash
# master节点执行
kubectl delete -f custom-resources.yaml
```

检查calico是否运行成功

执行如下命令，可以看到命名空间 `calico-system` 下正在运行的容器


```bash
kubectl get pod -n calico-system
```

使用`watch`命令可以持续监视pod状态



```sql
watch kubectl get pod -n calico-system
```

所有STATUS=Running表示运行成功



```sql
NAME                                       READY   STATUS    RESTARTS   AGE
calico-kube-controllers-676b574787-jjgj2   1/1     Running   0          15h
calico-node-j7ggr                          1/1     Running   0          15h
calico-node-pzwk7                          1/1     Running   0          15h
calico-node-qxgt6                          1/1     Running   0          15h
calico-typha-6fb6b7cc5c-vkrcd              1/1     Running   0          15h
calico-typha-6fb6b7cc5c-vtnrl              1/1     Running   0          15h
csi-node-driver-78dq8                      2/2     Running   0          15h
csi-node-driver-w49l8                      2/2     Running   0          15h
csi-node-driver-zx9d2                      2/2     Running   0          15h
```

此刻再次查看node状态，就会是Ready了



```sql
$ kubectl get nodes
NAME        STATUS   ROLES           AGE   VERSION
k8smaster   Ready    control-plane   15h   v1.32.2
k8snode1    Ready    <none>          15h   v1.32.2
k8snode2    Ready    <none>          15h   v1.32.2
```

至此，k8s集群就安装好了！！🎉🎉🎉🎉接下来可以安装一个nginx检验集群了

#### 4.7.5 calico问题排查(安装成功请忽略本节）

pod运行状态如下： 执行如下命令，可以看到命名空间 `calico-system` 下正在运行的容器


```bash
kubectl get pod -n calico-system
```

使用`watch`命令可以持续监视pod状态



```sql
watch kubectl get pod -n calico-system
```

pod运行状态如下：


```scss
root@k8smaster:~# kubectl get pod -n calico-system
NAME                                       READY   STATUS              RESTARTS   AGE
calico-kube-controllers-7cdcb4d576-4c6g5   0/1     Pending             0          32s
calico-node-68kl9                          0/1     Init:0/2            0          32s
calico-node-mpzvq                          0/1     Init:0/2            0          32s
calico-node-xnwgb                          0/1     Init:0/2            0          32s
calico-typha-65c7654fbf-vps5z              0/1     ContainerCreating   0          31s
calico-typha-65c7654fbf-wnc2s              0/1     ContainerCreating   0          32s
csi-node-driver-7jqk8                      0/2     ContainerCreating   0          32s
csi-node-driver-rsvfk                      0/2     ContainerCreating   0          32s
csi-node-driver-xsx7s                      0/2     ContainerCreating   0          32s
```

如果出现问题，可以通过如下命令查看报错信息，其中 `calico-node-pdf78` 为上面查看的pod名称


```bash
kubectl describe pod calico-node-pdf78  -n calico-system
```

监控输出如下



```
Tolerations:                 :NoSchedule op=Exists
                             :NoExecute op=Exists
                             CriticalAddonsOnly op=Exists
                             node.kubernetes.io/disk-pressure:NoSchedule op=Exists
                             node.kubernetes.io/memory-pressure:NoSchedule op=Exists
                             node.kubernetes.io/network-unavailable:NoSchedule op=Exists
                             node.kubernetes.io/not-ready:NoExecute op=Exists
                             node.kubernetes.io/pid-pressure:NoSchedule op=Exists
                             node.kubernetes.io/unreachable:NoExecute op=Exists
                             node.kubernetes.io/unschedulable:NoSchedule op=Exists
Events:
  Type     Reason       Age    From               Message
  ----     ------       ----   ----               -------
  Normal   Scheduled    4m39s  default-scheduler  Successfully assigned calico-system/calico-node-68kl9 to k8snode1
  Warning  FailedMount  4m38s  kubelet            MountVolume.SetUp failed for volume "node-certs" : failed to sync secret cache: timed out waiting for the condition
  Normal   Pulling      4m37s  kubelet            Pulling image "docker.io/calico/pod2daemon-flexvol:v3.29.2"
```

## 五、检验k8s集群

### 5.1 编写资源文件

安装一个nginx服务检验集群的可用性。首先在编写一个`～/nginx.yaml`资源文件



```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginxweb
  annotations:
    abc: test
spec:
  selector:
    matchLabels:
      app: nginxweb1
  replicas: 2
  template:
    metadata:
      labels:
        app: nginxweb1
    spec:
      containers:
        - name: nginxwebc
          image: nginx:latest
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: nginxweb-service
spec:
  externalTrafficPolicy: Cluster
  selector:
    app: nginxweb1
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
      nodePort: 30180
  type: NodePort
```

### 5.2 运行资源



```bash
kubectl create -f nginx.yaml
```

### 5.3 查看资源状态

查看service状态


```sql
root@k8smaster:~# kubectl get service
NAME               TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
kubernetes         ClusterIP   10.96.0.1       <none>        443/TCP        15h
nginxweb-service   NodePort    10.111.233.14   <none>        80:30180/TCP   15h
```

查看pod状态


```sql
root@k8smaster:~# kubectl get pod -o wide
NAME                       READY   STATUS    RESTARTS   AGE   IP               NODE       NOMINATED NODE   READINESS GATES
nginxweb-b6795994c-8267f   1/1     Running   0          16h   10.244.185.199   k8snode2   <none>           <none>
nginxweb-b6795994c-9nz5s   1/1     Running   0          16h   10.244.249.2     k8snode1   <none>           <none>
```

### 5.4 访问nginx页面

#### 5.4.1 集群内部网络访问，在任意一台集群机器上执行



```
curl 10.244.249.2
```

其中ip地址为nginx的pod的ip地址，这个地址是集群分配的地址，请使用你服务器上的pod地址访问，你可以选择任意一个pod地址。

#### 5.4.2 集群外部访问

通过5.3章节可以看到service的端口映射是30180，你自己机器上可能映射的是其他端口

知道端口后，可以在局域网内的任意一台机器上访问如下链接`<ip>:30180`

其中ip是虚拟机的任意IP，比如我选择master节点`192.168.31.224`

访问地址如下


```
192.168.31.224:30180
```

能看到访问nginx成功！


> 至此k8s集群安装完毕！验证完毕！祝你有一个愉快的k8s学习之旅！^\_^

## 六、回退k8s集群/重置k8s集群

k8s安装步骤确实繁琐，可能我们某一步错了，或者遇到各种问题，都得重头再来太麻烦。这时我们可以使用kubeadm提供的reset命令来回退集群。

1.  **_所有节点_**执行reset命令

    
    ```bash
    kubeadm reset
    ```

2.  **master**节点执行如下命令

 

    ```bash
    rm -rf /root/.kube
    rm -rf /etc/cni/net.d
    rm -rf /etc/kubernetes/*
    ```

3.  **worker**节点执行如下命令

   
    ```bash
    rm -rf /root/.kube
    rm -rf /etc/cni/net.d
    rm -rf /etc/kubernetes/*
    ```

4.  重启docker或containerd服务（你安装的什么运行时就重启什么运行时）

    

    ```bash
    systemctl restart docker
    ```

5.  按照4.5～4.7章节重新执行`kubeadm init`即可


