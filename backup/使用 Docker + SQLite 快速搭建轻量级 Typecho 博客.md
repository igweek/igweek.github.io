>Typecho 是一款极其轻量、高效的开源博客程序。相比于 WordPress，它更适合个人开发者和追求极简的用户。
本文将介绍如何使用 **Docker** 配合 **SQLite** 数据库进行部署。
选择 SQLite 的理由很简单：**省资源、易维护**。你不再需要运行一个庞大的 MySQL 数据库，所有数据都存储在一个 `.db` 文件中，备份时只需拷贝一个文件夹，真正做到“即插即用”。

## 准备工作

确保你的服务器已经安装了 Docker 和 Docker Compose。如果尚未安装，可以使用官方一键脚本：

```bash
curl -fsSL https://get.docker.com | bash
systemctl start docker && systemctl enable docker

```

---

## 部署步骤

### 1. 创建项目目录

首先，我们在服务器上创建一个目录来存放博客数据并创建好数据文件夹并赋予正确的用户权限。

```bash
# 创建工作目录
mkdir -p /root/typecho/data

# 进入目录
cd /root/typecho

# 【关键步骤】修改 data 目录的所有者为 www-data (UID 33)
# 这一步是为了配合 Docker 容器内的 Apache 用户，防止网页无法写入数据库文件

chown -R 33:33 data

```

> **注意**：执行完 `chown` 命令后，不会有任何提示输出，这是正常的。

### 2. 编排容器 (docker-compose.yml)

在 `/root/typecho` 目录下，创建一个名为 `docker-compose.yml` 的文件：

```bash
nano docker-compose.yml

```

将以下内容复制并粘贴进去：

```yaml
version: '3'

services:
  typecho:
    image: joyqi/typecho:nightly-php7.4-apache
    container_name: typecho-blog
    restart: always
    ports:
      - "80:80"  # 如果服务器80端口被占用，可修改为 "8080:80"
    volumes:
      # 将宿主机的 data 目录映射到容器内
      - ./data:/app/usr
    environment:
      - TIMEZONE=Asia/Shanghai

```

*按 `Ctrl+O` 保存，`Ctrl+X` 退出编辑器。*

### 3. 启动博客

确认文件无误后，一行命令拉起服务：

```bash
docker compose up -d

```

---

## 网页安装向导

1. 打开浏览器，访问 `http://你的服务器IP`。
2. 点击“我准备好了，开始下一步”。
3. **配置数据库（重要）**：
* **数据库适配器**：选择 **SQLite**。
* **数据库文件路径**：**保持默认**（通常显示为 `/app/usr/...`），千万不要手动修改它。


4. 设置管理员账号（用户名、密码、邮箱）。
5. 点击“确认安装”。


---

## 数据备份与迁移

使用 Docker + SQLite 的最大优势在于备份极其简单。你的所有文章、评论、上传的图片、安装的主题都在 `/root/typecho/data` 目录下。

**如何备份：**
只需打包这一个文件夹：

```bash
cd /root
tar -czvf typecho_backup.tar.gz typecho

```

**如何恢复/迁移：**
在任何一台装有 Docker 的新服务器上：

1. 解压备份包。
2. 进入目录运行 `docker compose up -d`。
3. 网站即可 100% 复原上线。

---

## 结语

通过 Docker 隔离环境，配合 SQLite 的单文件特性，我们用最少的系统资源（内存占用极低）搭建了一个稳定、现代化的博客系统。无论是作为技术笔记还是生活记录，这都是一个高性价比的选择。

> 我们还可以通过开启 BBR 拥塞控制算法 来解决丢包导致的卡顿问题。实测开启后，页面加载流畅度提升明显。

一键开启 BBR：

```Bash
echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
sysctl -p
```
验证是否开启成功：

```Bash
lsmod | grep bbr
# 输出里包含 tcp_bbr 即为成功
```