## 一键脚本

- **GNU/Linux 更换系统软件源**

```bash
bash <(curl -sSL https://pic.geek.nyc.mn/main.sh)
```

- **Docker 安装与换源**
```bash
bash <(curl -sSL https://pic.geek.nyc.mn/docker.sh)
```
- **Docker 更换镜像加速器**
```bash
bash <(curl -sSL https://pic.geek.nyc.mn/docker.sh) --only-registry
```

## 传统方式 （centos8为例）

**为了防止出错，先备份现有的 yum 源文件：**

```bash
sudo mkdir -p /etc/yum.repos.d/backup
sudo mv /etc/yum.repos.d/*.repo /etc/yum.repos.d/backup/
```
**更换阿里云yum源：**

```bash
sudo tee /etc/yum.repos.d/CentOS-Base.repo << 'EOF'
[BaseOS]
name=CentOS-$releasever - Base - mirrors.aliyun.com
baseurl=https://mirrors.aliyun.com/centos-vault/8.5.2111/BaseOS/\$basearch/os/
gpgcheck=1
enabled=1
gpgkey=https://mirrors.aliyun.com/centos-vault/8.5.2111/RPM-GPG-KEY-CentOS-Official

[AppStream]
name=CentOS-$releasever - AppStream - mirrors.aliyun.com
baseurl=https://mirrors.aliyun.com/centos-vault/8.5.2111/AppStream/\$basearch/os/
gpgcheck=1
enabled=1
gpgkey=https://mirrors.aliyun.com/centos-vault/8.5.2111/RPM-GPG-KEY-CentOS-Official

[extras]
name=CentOS-$releasever - Extras - mirrors.aliyun.com
baseurl=https://mirrors.aliyun.com/centos-vault/8.5.2111/extras/\$basearch/os/
gpgcheck=1
enabled=1
gpgkey=https://mirrors.aliyun.com/centos-vault/8.5.2111/RPM-GPG-KEY-CentOS-Official
EOF
```

**清除缓存并重建**

```bash
sudo dnf clean all
sudo dnf makecache
```


**替换为国内docker源**

执行以下命令（逐行复制）👇：

```bash
# 1. 删除掉官方 Docker 源
sudo rm -f /etc/yum.repos.d/docker-ce.repo

# 2. 添加阿里云镜像源
sudo tee /etc/yum.repos.d/docker-ce.repo <<-'EOF'
[docker-ce-stable]
name=Docker CE Stable - mirror.aliyun.com
baseurl=https://mirrors.aliyun.com/docker-ce/linux/centos/8/x86_64/stable/
enabled=1
gpgcheck=0
EOF

# 3. 清理缓存并刷新源
sudo dnf clean all
sudo dnf makecache
```

**安装docker**

```bash
sudo dnf install -y docker-ce docker-ce-cli containerd.io
```

> ✅ 这会从 **mirrors.aliyun.com** 下载所有 Docker 相关 RPM 包，国内速度飞快。

---

 **启动 Docker 服务**

```bash
sudo systemctl enable --now docker
```

**测试是否可用：**

```bash
docker version
```

若输出 Client/Server 版本号即安装成功。

---

**配置镜像加速**

编辑配置文件：

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.1panel.live",
    "https://mirror.ccs.tencentyun.com",
    "https://docker.m.daocloud.io",
    "https://hub-mirror.c.163.com"
  ]
}
EOF
```

重启服务：

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

验证：

```bash
docker info | grep -A3 "Registry Mirrors"
```

---

## 🧰 如果仍然失败（内网或无公网的情况）

你可以：

1. 手动下载 RPM 包：
   在一台能上网的机器上访问
   [https://mirrors.aliyun.com/docker-ce/linux/centos/8/x86_64/stable/Packages/](https://mirrors.aliyun.com/docker-ce/linux/centos/8/x86_64/stable/Packages/)
   下载以下三个包：

   ```
   containerd.io-xxxx.rpm
   docker-ce-xxxx.rpm
   docker-ce-cli-xxxx.rpm
   ```

   然后拷贝到服务器执行：

   ```bash
   sudo dnf localinstall *.rpm -y
   ```
