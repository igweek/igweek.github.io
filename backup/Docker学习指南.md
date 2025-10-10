
# Docker实验手册 (CentOS 8)

## 1. 引言

### 1.1 Docker简介

在当今的软件开发和部署领域，**容器化技术**已成为不可或缺的一部分。Docker作为容器技术的领导者，通过提供一种轻量级、可移植、自给自足的打包机制，彻底改变了应用程序的构建、分发和运行方式。它允许开发者将应用程序及其所有依赖项（代码、运行时、系统工具、系统库等）打包到一个独立的**镜像**中，然后从这个镜像创建**容器**，确保应用程序在任何环境中都能以相同的方式运行，从而解决了“在我机器上可以运行”的问题。

Docker的核心优势在于其**环境一致性**、**快速部署**、**资源隔离**和**高效利用**。它极大地简化了开发、测试和生产环境之间的差异，加速了软件交付流程，并为微服务架构和DevOps实践提供了强大的支持。

### 1.2 实验环境概述 (CentOS 8)

本实验手册将以 **CentOS 8** 操作系统作为基础环境，详细指导您进行Docker的安装、配置和各项操作。CentOS 8作为一款稳定、企业级的Linux发行版，广泛应用于服务器环境。选择CentOS 8旨在模拟真实的生产环境，让您在实践中更好地理解Docker的部署和管理。

考虑到中国国内的网络环境特点，本手册还将特别强调**配置国内镜像加速器**的步骤，以确保您在拉取Docker镜像时能够获得流畅的体验。

### 1.3 实验目的

本实验手册旨在通过一系列详细的实践操作，帮助您全面掌握Docker的核心概念和常用命令，具体目标包括：

*   **掌握Docker的安装与基本配置**：在CentOS 8系统上成功安装Docker Engine，并配置国内镜像加速，以及设置非root用户使用Docker。
*   **熟悉Docker容器的生命周期管理**：学会创建、启动、停止、重启、删除容器，并进行交互式操作、日志查看和资源监控。
*   **理解Docker镜像的管理**：掌握镜像的获取、查看、删除、构建、标记、推送以及导入导出等操作。
*   **学会编写和使用Dockerfile**：通过Dockerfile自动化构建自定义镜像，并了解多阶段构建和最佳实践。
*   **掌握Docker Compose进行多容器应用编排**：使用`docker-compose.yml`文件定义和管理复杂的、多服务的应用程序。

通过完成本手册中的所有实验，您将能够自信地在实际项目中运用Docker技术，提升您的开发和运维效率。


# 2. Docker安装与配置

本章节将详细指导如何在CentOS 8系统上安装Docker Engine，并进行必要的配置，包括国内镜像加速和非root用户使用Docker的设置。这些步骤旨在为后续的Docker实验提供一个稳定且高效的基础环境。

## 2.1 系统要求与准备

在开始安装Docker之前，请确保您的CentOS 8系统满足以下基本要求并完成必要的准备工作：

*   **操作系统**：CentOS 8 (或兼容的RHEL 8发行版)。
*   **内核版本**：Docker要求Linux内核版本为3.10或更高。CentOS 8通常已满足此要求。
*   **硬件资源**：建议至少2GB内存和20GB磁盘空间。
*   **网络连接**：确保系统可以访问互联网以下载Docker软件包和镜像。
*   **更新系统**：在安装任何新软件之前，始终建议更新系统软件包到最新版本，以确保兼容性和安全性 [1]。

**一步修复方案：替换为国内源**

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

然后重新安装：

```bash
sudo dnf install -y docker-ce docker-ce-cli containerd.io
```

> ✅ 这会从 **mirrors.aliyun.com** 下载所有 Docker 相关 RPM 包，国内速度飞快。

---

 **启动 Docker 服务**

```bash
sudo systemctl enable --now docker
```

测试是否可用：

```bash
docker version
```

若输出 Client/Server 版本号即安装成功。

---

**配置镜像加速（国内拉取镜像也更快）**

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

---



## 2.5 Docker服务管理

了解如何管理Docker服务对于日常维护至关重要。以下是一些常用的`systemctl`命令，用于管理Docker守护进程：

*   **启动Docker服务**：
```bash
sudo systemctl start docker
```
*   **停止Docker服务**：
```bash
sudo systemctl stop docker
```
*   **重启Docker服务**：
```bash
sudo systemctl restart docker
```
*   **查看Docker服务状态**：
```bash
sudo systemctl status docker
```
*   **设置Docker服务开机自启**：
```bash
sudo systemctl enable docker
```
*   **禁用Docker服务开机自启**：
```bash
sudo systemctl disable docker
```


# 3. Docker容器管理

Docker容器是Docker的核心概念，它是一个轻量级、可移植、自给自足的软件包，包含运行应用程序所需的一切：代码、运行时、系统工具、系统库等。本章节将详细介绍如何管理Docker容器的生命周期、进行常用操作、配置网络以及管理数据卷。

## 3.1 容器生命周期管理

容器的生命周期包括创建、启动、停止、重启和删除等阶段。掌握这些基本命令是进行Docker操作的基础。

### 3.1.1 创建与启动容器 (`docker run`)

`docker run` 命令用于创建并启动一个新的容器。它是Docker中最常用的命令之一，拥有丰富的参数来控制容器的行为。

**基本语法**：

```bash
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
```

**常用选项**：

*   `-d` 或 `--detach`：后台运行容器。
*   `-p` 或 `--publish`：端口映射，格式为 `宿主机端口:容器端口`。
*   `-v` 或 `--volume`：数据卷挂载，格式为 `宿主机路径:容器路径` 或 `数据卷名称:容器路径`。
*   `--name`：为容器指定一个名称。
*   `-it`：交互式运行容器，通常用于进入容器的shell。
*   `--rm`：容器停止后自动删除。
*   `--network`：指定容器连接的网络。

**实验示例**：

1.  **运行一个Nginx Web服务器容器**：

```bash
docker run -d -p 8080:80 --name my-nginx nginx:latest
```
    此命令将从Docker Hub拉取`nginx:latest`镜像（如果本地没有），然后在后台运行一个名为`my-nginx`的容器，并将宿主机的8080端口映射到容器的80端口。

2.  **运行一个交互式Ubuntu容器**：

```bash
docker run -it --rm ubuntu:latest bash
```
    此命令将启动一个Ubuntu容器，并进入其bash shell。`-it` 选项使得容器可以交互式运行，`--rm` 选项确保容器退出后自动删除。

### 3.1.2 查看运行中的容器 (`docker ps`)

`docker ps` 命令用于列出当前正在运行的容器。

**基本语法**：

```bash
docker ps [OPTIONS]
```

**常用选项**：

*   `-a` 或 `--all`：显示所有容器，包括已停止的。
*   `-s` 或 `--size`：显示容器的总文件大小。
*   `-q` 或 `--quiet`：只显示容器ID。

**实验示例**：

1.  **查看所有运行中的容器**：

```bash
docker ps
```

2.  **查看所有容器（包括已停止的）**：

```bash
docker ps -a
```

### 3.1.3 停止、启动与重启容器 (`docker stop`, `docker start`, `docker restart`)

这些命令用于控制容器的运行状态。

**基本语法**：

```bash
docker stop [OPTIONS] CONTAINER [CONTAINER...]
docker start [OPTIONS] CONTAINER [CONTAINER...]
docker restart [OPTIONS] CONTAINER [CONTAINER...]
```

**实验示例**：

1.  **停止名为`my-nginx`的容器**：

```bash
docker stop my-nginx
```

2.  **启动已停止的`my-nginx`容器**：

```bash
docker start my-nginx
```

3.  **重启`my-nginx`容器**：

```bash
docker restart my-nginx
```

### 3.1.4 删除容器 (`docker rm`)

`docker rm` 命令用于删除一个或多个已停止的容器。

**基本语法**：

```bash
docker rm [OPTIONS] CONTAINER [CONTAINER...]
```

**常用选项**：

*   `-f` 或 `--force`：强制删除运行中的容器。
*   `-v` 或 `--volumes`：删除与容器关联的匿名数据卷。

**实验示例**：

1.  **删除已停止的`my-nginx`容器**：

```bash
docker rm my-nginx
```

2.  **强制删除运行中的容器**：

```bash
docker rm -f my-nginx
```

## 3.2 容器操作

除了生命周期管理，Docker还提供了一系列命令来与容器进行交互和监控。

### 3.2.1 进入容器 (`docker exec`)

`docker exec` 命令用于在运行中的容器内部执行命令，常用于进入容器的shell进行调试或配置。

**基本语法**：

```bash
docker exec [OPTIONS] CONTAINER COMMAND [ARG...]
```

**常用选项**：

*   `-it`：交互式运行，并分配一个伪TTY。

**实验示例**：

1.  **进入`my-nginx`容器的bash shell**：

```bash
docker exec -it my-nginx bash
```
    在容器内部，您可以像操作普通Linux系统一样执行命令，例如`ls -l /usr/share/nginx/html`。

### 3.2.2 查看容器日志 (`docker logs`)

`docker logs` 命令用于获取容器的日志输出。

**基本语法**：

```bash
docker logs [OPTIONS] CONTAINER
```

**常用选项**：

*   `-f` 或 `--follow`：持续输出日志。
*   `--tail`：显示日志的最后N行。
*   `-t` 或 `--timestamps`：显示时间戳。

**实验示例**：

1.  **查看`my-nginx`容器的实时日志**：

```bash
docker logs -f my-nginx
```

### 3.2.3 查看容器详细信息 (`docker inspect`)

`docker inspect` 命令返回Docker对象的低级信息，包括容器、镜像、网络、数据卷等。它以JSON格式输出详细配置。

**基本语法**：

```bash
docker inspect [OPTIONS] NAME|ID [NAME|ID...]
```

**实验示例**：

1.  **查看`my-nginx`容器的详细信息**：

```bash
docker inspect my-nginx
```

### 3.2.4 查看容器内进程 (`docker top`)

`docker top` 命令用于查看容器内部运行的进程。

**基本语法**：

```bash
docker top CONTAINER [ps OPTIONS]
```

**实验示例**：

1.  **查看`my-nginx`容器内的进程**：

```bash
docker top my-nginx
```

### 3.2.5 查看容器资源使用 (`docker stats`)

`docker stats` 命令用于实时显示一个或多个容器的资源使用情况，包括CPU、内存、网络I/O和块I/O。

**基本语法**：

```bash
docker stats [OPTIONS] [CONTAINER...]
```

**常用选项**：

*   `--no-stream`：不持续输出，只显示一次。

**实验示例**：

1.  **查看所有运行中容器的资源使用情况**：

```bash
docker stats
```

## 3.3 容器网络

Docker提供了强大的网络功能，允许容器之间以及容器与宿主机之间进行通信。Docker默认提供多种网络驱动，如`bridge`、`host`、`none`等，并支持用户自定义网络。

### 3.3.1 查看网络 (`docker network ls`)

`docker network ls` 命令用于列出所有Docker网络。

**基本语法**：

```bash
docker network ls [OPTIONS]
```

**实验示例**：

1.  **列出所有Docker网络**：

```bash
docker network ls
```

### 3.3.2 创建自定义网络 (`docker network create`)

创建自定义网络可以更好地隔离容器，并允许容器通过名称进行通信。

**基本语法**：

```bash
docker network create [OPTIONS] NETWORK
```

**常用选项**：

*   `--driver`：指定网络驱动，默认为`bridge`。

**实验示例**：

1.  **创建一个名为`my-app-network`的bridge网络**：

```bash
docker network create my-app-network
```

### 3.3.3 连接容器到网络 (`docker network connect`)

将运行中的容器连接到指定的网络。

**基本语法**：

```bash
docker network connect [OPTIONS] NETWORK CONTAINER
```

**实验示例**：

1.  **将`my-nginx`容器连接到`my-app-network`**：

```bash
docker network connect my-app-network my-nginx
```

### 3.3.4 断开容器与网络的连接 (`docker network disconnect`)

将容器从指定的网络中移除。

**基本语法**：

```bash
docker network disconnect [OPTIONS] NETWORK CONTAINER
```

**实验示例**：

1.  **将`my-nginx`容器从`my-app-network`断开**：

```bash
docker network disconnect my-app-network my-nginx
```

### 3.3.5 删除网络 (`docker network rm`)

删除一个或多个自定义网络。

**基本语法**：

```bash
docker network rm NETWORK [NETWORK...]
```

**实验示例**：

1.  **删除`my-app-network`**：

```bash
docker network rm my-app-network
```

## 3.4 容器数据卷

数据卷是用于持久化Docker容器数据或在容器之间共享数据的首选机制。它独立于容器的生命周期，即使容器被删除，数据卷中的数据也不会丢失。

### 3.4.1 创建数据卷 (`docker volume create`)

`docker volume create` 命令用于创建一个新的数据卷。

**基本语法**：

```bash
docker volume create [OPTIONS] VOLUME
```

**实验示例**：

1.  **创建一个名为`my-data`的数据卷**：

```bash
docker volume create my-data
```

### 3.4.2 查看数据卷 (`docker volume ls`)

`docker volume ls` 命令用于列出所有Docker数据卷。

**基本语法**：

```bash
docker volume ls [OPTIONS]
```

**实验示例**：

1.  **列出所有数据卷**：

```bash
docker volume ls
```

### 3.4.3 挂载数据卷到容器 (`docker run -v`)

在`docker run`命令中使用`-v`选项可以将数据卷挂载到容器内部。

**实验示例**：

1.  **运行一个Nginx容器，并将`my-data`数据卷挂载到`/usr/share/nginx/html`**：

```bash
docker run -d -p 8081:80 --name nginx-with-volume -v my-data:/usr/share/nginx/html nginx:latest
```
    现在，`my-data`数据卷中的内容将作为Nginx的网页根目录。

2.  **通过绑定挂载（Bind Mount）将宿主机目录挂载到容器**：

```bash
mkdir -p ~/nginx-html
echo "<h1>Hello from Host!</h1>" > ~/nginx-html/index.html
docker run -d -p 8082:80 --name nginx-bind-mount -v ~/nginx-html:/usr/share/nginx/html nginx:latest
```
    这会将宿主机的`~/nginx-html`目录内容映射到容器的Nginx网页根目录。

### 3.4.4 查看数据卷详细信息 (`docker volume inspect`)

`docker volume inspect` 命令用于查看数据卷的详细信息，包括其挂载点等。

**基本语法**：

```bash
docker volume inspect [OPTIONS] VOLUME [VOLUME...]
```

**实验示例**：

1.  **查看`my-data`数据卷的详细信息**：

```bash
docker volume inspect my-data
```

### 3.4.5 删除数据卷 (`docker volume rm`)

`docker volume rm` 命令用于删除一个或多个数据卷。请注意，只有当数据卷没有被任何容器使用时才能被删除。

**基本语法**：

```bash
docker volume rm [OPTIONS] VOLUME [VOLUME...]
```

**常用选项**：

*   `-f` 或 `--force`：强制删除正在使用的数据卷（不推荐）。

**实验示例**：

1.  **删除`my-data`数据卷**：

```bash
docker volume rm my-data
```

### 3.4.6 清理未使用的本地数据卷 (`docker volume prune`)

`docker volume prune` 命令用于删除所有未被任何容器引用的本地数据卷。

**基本语法**：

```bash
docker volume prune [OPTIONS]
```

**实验示例**：

1.  **清理所有未使用的本地数据卷**：

```bash
docker volume prune
```

通过本章节的学习和实践，您应该已经掌握了Docker容器的基本管理和操作，包括容器的生命周期、交互、监控、网络配置以及数据持久化。这些是构建和管理基于Docker的应用程序的关键技能。



# 4. Docker镜像管理

Docker镜像是一个轻量级、独立、可执行的软件包，它包含了运行某个软件所需的所有内容，包括代码、运行时、库、环境变量和配置文件。本章节将详细介绍如何获取、查看、删除、构建、标记、推送以及导入/导出Docker镜像。

## 4.1 镜像获取 (`docker pull`)

`docker pull` 命令用于从远程镜像仓库（默认为Docker Hub）下载镜像到本地。

**基本语法**：

```bash
docker pull [OPTIONS] NAME[:TAG|@DIGEST]
```

**常用选项**：

*   `--all-tags`：下载仓库中的所有标签镜像。

**实验示例**：

1.  **拉取最新版Ubuntu镜像**：

```bash
docker pull ubuntu:latest
```

2.  **拉取指定版本的Nginx镜像**：

```bash
docker pull nginx:1.21
```

## 4.2 镜像查看 (`docker images`)

`docker images` 或 `docker image ls` 命令用于列出本地主机上的所有镜像。

**基本语法**：

```bash
docker images [OPTIONS] [REPOSITORY]
```

**常用选项**：

*   `-a` 或 `--all`：显示所有镜像（包括中间层镜像）。
*   `-q` 或 `--quiet`：只显示镜像ID。
*   `--filter`：根据条件过滤显示结果，例如 `dangling=true` (显示悬空镜像)。

**实验示例**：

1.  **列出所有本地镜像**：

```bash
docker images
```

2.  **只显示镜像ID**：

```bash
docker images -q
```

3.  **查看特定仓库的镜像**：

```bash
docker images ubuntu
```

## 4.3 镜像删除 (`docker rmi`)

`docker rmi` 命令用于删除一个或多个本地镜像。

**基本语法**：

```bash
docker rmi [OPTIONS] IMAGE [IMAGE...]
```

**常用选项**：

*   `-f` 或 `--force`：强制删除镜像，即使它被容器使用。
*   `--no-prune`：不删除未被标记的父镜像。

**实验示例**：

1.  **删除`nginx:1.21`镜像**：

```bash
docker rmi nginx:1.21
```

2.  **强制删除一个被容器使用的镜像**：

```bash
docker rmi -f ubuntu:latest
```

3.  **删除所有悬空镜像（没有被任何标签引用的镜像）**：

```bash
docker image prune
```

## 4.4 镜像构建 (`docker build`)

`docker build` 命令用于根据Dockerfile文件和上下文构建新的Docker镜像。Dockerfile是一个文本文件，包含了一系列构建镜像的指令。

**基本语法**：

```bash
docker build [OPTIONS] PATH | URL | -
```

**常用选项**：

*   `-t` 或 `--tag`：为构建的镜像指定名称和标签，格式为 `name:tag`。
*   `-f` 或 `--file`：指定Dockerfile文件的路径（如果不是默认的`./Dockerfile`）。
*   `--no-cache`：构建镜像时不使用缓存。

**实验示例**：

1.  **准备Dockerfile**：

    首先，创建一个名为`my-app`的目录，并在其中创建`Dockerfile`文件和`app.py`文件。

```bash
mkdir -p my-app
cat <<EOF > my-app/Dockerfile
FROM python:3.9-slim-buster
WORKDIR /app
COPY . .
RUN pip install Flask
EXPOSE 5000
CMD ["python", "app.py"]
EOF

echo "Flask" > requirements.txt

cat <<EOF > my-app/app.py
from flask import Flask
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello from Docker!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
EOF
```

2.  **构建镜像**：

    在`my-app`目录下执行：

```bash
docker build -t my-python-app:1.0 my-app
```
    这里的`my-app`表示Dockerfile所在的上下文路径。

3.  **运行构建的镜像**：

```bash
docker run -d -p 5000:5000 --name my-web-app my-python-app:1.0
```
    访问 `http://localhost:5000` 即可看到 "Hello from Docker!"。

## 4.5 镜像标签与推送 (`docker tag`, `docker push`)

`docker tag` 命令用于为镜像添加一个额外的标签，通常用于将本地镜像标记为准备推送到远程仓库的格式。`docker push` 命令用于将本地镜像推送到远程镜像仓库。

### 4.5.1 标记镜像 (`docker tag`)

**基本语法**：

```bash
docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]
```

**实验示例**：

1.  **为`my-python-app:1.0`镜像添加一个新标签，准备推送到Docker Hub**：

    假设您的Docker Hub用户名为`your_dockerhub_username`。

```bash
docker tag my-python-app:1.0 your_dockerhub_username/my-python-app:latest
```

### 4.5.2 登录Docker Hub (`docker login`)

在推送镜像之前，您需要登录到Docker Hub或其他远程仓库。

**基本语法**：

```bash
docker login [OPTIONS] [SERVER]
```

**实验示例**：

1.  **登录Docker Hub**：

```bash
docker login
```
    系统会提示您输入Docker Hub用户名和密码。

### 4.5.3 推送镜像 (`docker push`)

**基本语法**：

```bash
docker push [OPTIONS] NAME[:TAG]
```

**实验示例**：

1.  **推送`my-python-app`镜像到Docker Hub**：

```bash
docker push your_dockerhub_username/my-python-app:latest
```

## 4.6 镜像导入导出 (`docker save`, `docker load`)

`docker save` 和 `docker load` 命令用于将镜像打包成文件进行传输，或从文件加载镜像。

### 4.6.1 导出镜像 (`docker save`)

`docker save` 命令将一个或多个镜像保存到一个tar归档文件中。

**基本语法**：

```bash
docker save [OPTIONS] IMAGE [IMAGE...]
```

**常用选项**：

*   `-o` 或 `--output`：指定输出文件路径。

**实验示例**：

1.  **将`my-python-app:1.0`镜像保存到`my-python-app.tar`文件**：

```bash
docker save -o my-python-app.tar my-python-app:1.0
```

### 4.6.2 导入镜像 (`docker load`)

`docker load` 命令从一个tar归档文件或标准输入中加载镜像。

**基本语法**：

```bash
docker load [OPTIONS]
```

**常用选项**：

*   `-i` 或 `--input`：指定输入文件路径。

**实验示例**：

1.  **从`my-python-app.tar`文件加载镜像**：

```bash
docker load -i my-python-app.tar
```

通过本章节的学习和实践，您应该已经掌握了Docker镜像的完整生命周期管理，包括从远程仓库获取、本地查看与删除、通过Dockerfile构建自定义镜像、以及镜像的标记、推送、导入和导出。这些技能是高效利用Docker进行应用部署和分发的基础。


# 5. Dockerfile

Dockerfile是用于构建Docker镜像的文本文件，它包含了一系列指令，每条指令都在镜像中创建一个层。通过Dockerfile，我们可以自动化镜像的创建过程，实现可重复、版本化的镜像构建。本章节将深入探讨Dockerfile的基本语法、常用指令、构建自定义镜像、多阶段构建以及最佳实践。

## 5.1 Dockerfile基本语法与指令

Dockerfile中的指令按顺序执行，每条指令都会在镜像中创建一个新的层。以下是一些最常用的Dockerfile指令及其用途。

### 5.1.1 `FROM`

`FROM` 指令指定了新镜像所基于的基础镜像。所有Dockerfile都必须以 `FROM` 指令开始。

**语法**：`FROM <image>[:<tag>] [AS <name>]`

```dockerfile
FROM ubuntu:22.04
FROM python:3.9-slim-buster AS builder
```

### 5.1.2 `RUN`

`RUN` 指令用于在当前镜像层上执行命令，并提交结果。它通常用于安装软件包、创建文件或目录等。

**语法**：

*   `RUN <command>` (shell 格式，命令在 `/bin/sh -c` 中运行)
*   `RUN ["executable", "param1", "param2"]` (exec 格式，推荐，避免shell解释器问题)

```dockerfile
RUN apt-get update && apt-get install -y curl
RUN ["/bin/bash", "-c", "echo hello"]
```

### 5.1.3 `CMD`

`CMD` 指令为执行中的容器提供默认的执行命令。如果 `docker run` 命令中指定了其他命令，则 `CMD` 命令会被覆盖。一个Dockerfile中只能有一个 `CMD` 指令，如果有多个，只有最后一个生效。

**语法**：

*   `CMD ["executable","param1","param2"]` (exec 格式，推荐)
*   `CMD ["param1","param2"]` (作为 `ENTRYPOINT` 的默认参数)
*   `CMD command param1 param2` (shell 格式)

```dockerfile
CMD ["nginx", "-g", "daemon off;"]
CMD ["python", "app.py"]
```

### 5.1.4 `ENTRYPOINT`

`ENTRYPOINT` 指令配置容器启动时执行的命令。与 `CMD` 不同，`ENTRYPOINT` 不会被 `docker run` 命令中指定的参数覆盖，而是将这些参数作为 `ENTRYPOINT` 命令的参数。

**语法**：

*   `ENTRYPOINT ["executable", "param1", "param2"]` (exec 格式，推荐)
*   `ENTRYPOINT command param1 param2` (shell 格式)

```dockerfile
ENTRYPOINT ["/usr/bin/cowsay"]
CMD ["hello world"]
```

运行 `docker run my-cowsay-image` 会输出 `hello world`。运行 `docker run my-cowsay-image moo` 会输出 `moo`。

### 5.1.5 `COPY`

`COPY` 指令将本地文件或目录复制到镜像中的指定路径。

**语法**：`COPY [--chown=<user>:<group>] <src>... <dest>`

```dockerfile
COPY . /app
COPY requirements.txt /tmp/
```

### 5.1.6 `ADD`

`ADD` 指令与 `COPY` 类似，但它支持URL和自动解压tar文件。通常推荐使用 `COPY`，因为它更透明。

**语法**：`ADD [--chown=<user>:<group>] <src>... <dest>`

```dockerfile
ADD http://example.com/latest.tar.gz /tmp/
ADD app.tar.gz /app
```

### 5.1.7 `WORKDIR`

`WORKDIR` 指令为Dockerfile中后续的 `RUN`, `CMD`, `ENTRYPOINT`, `COPY`, `ADD` 指令设置工作目录。

**语法**：`WORKDIR /path/to/workdir`

```dockerfile
WORKDIR /app
COPY . .
RUN ls
```

### 5.1.8 `EXPOSE`

`EXPOSE` 指令声明容器在运行时监听的端口。它仅仅是声明，并不会实际发布端口，发布端口需要在使用 `docker run -p` 时指定。

**语法**：`EXPOSE <port> [<port>/<protocol>...]`

```dockerfile
EXPOSE 80
EXPOSE 80/tcp 443/tcp
```

### 5.1.9 `ENV`

`ENV` 指令设置环境变量，这些变量在构建时和容器运行时都可用。

**语法**：

*   `ENV <key>=<value> ...`
*   `ENV <key> <value>`

```dockerfile
ENV MY_VAR="hello world"
ENV PATH="$PATH:/usr/local/bin"
```

### 5.1.10 `VOLUME`

`VOLUME` 指令创建一个挂载点，将宿主机上的目录或另一个容器中的目录挂载到容器中，用于持久化数据或共享数据。

**语法**：`VOLUME ["/data"]`

```dockerfile
VOLUME /var/lib/mysql
```

### 5.1.11 `USER`

`USER` 指令设置运行 `RUN`, `CMD`, `ENTRYPOINT` 指令的用户或UID。默认情况下，容器以root用户运行。

**语法**：`USER <user>[:<group>]`

```dockerfile
USER appuser
```

### 5.1.12 `ARG`

`ARG` 指令定义了用户在 `docker build` 命令中使用 `--build-arg <varname>=<value>` 标志传递的构建时变量。

**语法**：`ARG <name>[=<default value>]`

```dockerfile
ARG VERSION=1.0
RUN echo "Building version: $VERSION"
```

### 5.1.13 `LABEL`

`LABEL` 指令为镜像添加元数据，例如维护者信息、版本号等。

**语法**：`LABEL <key>="<value>" [<key>="<value>"]...`

```dockerfile
LABEL maintainer="Your Name <your.email@example.com>"
LABEL version="1.0"
```

## 5.2 构建自定义镜像

通过一个实际的例子来演示如何使用Dockerfile构建一个简单的Web应用镜像。

**实验目标**：构建一个基于Python Flask的Web应用镜像。

1.  **创建项目目录和文件**：

```bash
mkdir my-flask-app
cd my-flask-app

cat <<EOF > Dockerfile
FROM python:3.9-slim-buster
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python3", "app.py"]
EOF

echo "Flask" > requirements.txt

cat <<EOF > app.py
from flask import Flask
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello from Flask in Docker!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
EOF
```

2.  **构建镜像**：

    在`my-flask-app`目录下执行：

```bash
docker build -t my-flask-web-app:1.0 .
```
    这里的`.`表示Dockerfile所在的上下文路径。

3.  **运行容器**：

```bash
docker run -d -p 5000:5000 --name flask-app-container my-flask-web-app:1.0
```

4.  **验证**：

    访问 `http://localhost:5000` 或 `http://<your-server-ip>:5000`，应该能看到 "Hello from Flask in Docker!"。

## 5.3 多阶段构建 (Multi-stage builds)

多阶段构建允许您在Dockerfile中使用多个 `FROM` 语句，每个 `FROM` 语句可以开始一个新的构建阶段。这使得您可以将构建时所需的工具和依赖项与运行时所需的最终镜像分离开来，从而显著减小最终镜像的大小。

**实验目标**：使用多阶段构建一个Go语言的Web应用，最终镜像只包含编译后的二进制文件。

1.  **创建项目目录和文件**：

```bash
mkdir my-go-app
cd my-go-app

cat <<EOF > Dockerfile
FROM golang:1.20 AS builder
WORKDIR /app
COPY . .
RUN go mod init my-go-app && go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -o my-app .

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/my-app .
CMD ["./my-app"]
EOF

cat <<EOF > main.go
package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello from Go in Docker!")
	})
	fmt.Println("Server starting on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
EOF
```

2.  **构建镜像**：

    在`my-go-app`目录下执行：

```bash
docker build -t my-go-web-app:1.0 .
```

3.  **运行容器**：

```bash
docker run -d -p 8080:8080 --name go-app-container my-go-web-app:1.0
```

4.  **验证**：

    访问 `http://localhost:8080` 或 `http://<your-server-ip>:8080`，应该能看到 "Hello from Go in Docker!"。

    您还可以比较 `golang:1.20` 镜像和 `alpine:latest` 镜像的大小，会发现最终的 `my-go-web-app:1.0` 镜像非常小。

## 5.4 Dockerfile最佳实践

编写高效、安全、可维护的Dockerfile是Docker开发的关键。以下是一些推荐的最佳实践：

*   **选择合适的基础镜像**：选择尽可能小且官方支持的基础镜像，例如 `alpine`、`slim` 版本，以减小最终镜像大小。
*   **利用构建缓存**：Docker会缓存每个构建步骤。将不经常变化的指令放在Dockerfile的前面，将经常变化的指令（如 `COPY . .`）放在后面，以最大限度地利用缓存。
*   **减少镜像层数**：将多个 `RUN` 命令合并为一个，使用 `&&` 连接，并清理不再需要的包和缓存，例如 `apt-get clean`。
*   **使用 `.dockerignore` 文件**：类似于 `.gitignore`，`.dockerignore` 文件可以排除构建上下文中的不必要文件，减少传输到Docker守护进程的数据量，加快构建速度。
*   **明确指定版本**：在 `FROM`、`RUN apt-get install` 等指令中明确指定镜像和软件包的版本，避免不确定性。
*   **非root用户运行**：为了安全起见，尽量避免以root用户运行容器。在Dockerfile中使用 `USER` 指令切换到非root用户。
*   **使用 `ENTRYPOINT` 和 `CMD` 的exec格式**：exec格式更清晰，且能更好地处理信号。
*   **多阶段构建**：对于需要编译的应用程序（如Go、Java、Node.js），使用多阶段构建可以显著减小最终镜像的大小。
*   **避免安装不必要的软件包**：只安装应用程序运行所需的最小依赖。
*   **使用健康检查**：在Dockerfile中添加 `HEALTHCHECK` 指令，让Docker知道容器何时准备好处理请求。

通过遵循这些最佳实践，您可以创建出更优化、更安全的Docker镜像，从而提升应用程序的部署效率和稳定性。


# 4. Docker镜像管理

Docker镜像是一个轻量级、独立、可执行的软件包，它包含了运行某个软件所需的所有内容，包括代码、运行时、库、环境变量和配置文件。本章节将详细介绍如何获取、查看、删除、构建、标记、推送以及导入/导出Docker镜像。

## 4.1 镜像获取 (`docker pull`)

`docker pull` 命令用于从远程镜像仓库（默认为Docker Hub）下载镜像到本地。

**基本语法**：

```bash
docker pull [OPTIONS] NAME[:TAG|@DIGEST]
```

**常用选项**：

*   `--all-tags`：下载仓库中的所有标签镜像。

**实验示例**：

1.  **拉取最新版Ubuntu镜像**：

```bash
docker pull ubuntu:latest
```

2.  **拉取指定版本的Nginx镜像**：

```bash
docker pull nginx:1.21
```

## 4.2 镜像查看 (`docker images`)

`docker images` 或 `docker image ls` 命令用于列出本地主机上的所有镜像。

**基本语法**：

```bash
docker images [OPTIONS] [REPOSITORY]
```

**常用选项**：

*   `-a` 或 `--all`：显示所有镜像（包括中间层镜像）。
*   `-q` 或 `--quiet`：只显示镜像ID。
*   `--filter`：根据条件过滤显示结果，例如 `dangling=true` (显示悬空镜像)。

**实验示例**：

1.  **列出所有本地镜像**：

```bash
docker images
```

2.  **只显示镜像ID**：

```bash
docker images -q
```

3.  **查看特定仓库的镜像**：

```bash
docker images ubuntu
```

## 4.3 镜像删除 (`docker rmi`)

`docker rmi` 命令用于删除一个或多个本地镜像。

**基本语法**：

```bash
docker rmi [OPTIONS] IMAGE [IMAGE...]
```

**常用选项**：

*   `-f` 或 `--force`：强制删除镜像，即使它被容器使用。
*   `--no-prune`：不删除未被标记的父镜像。

**实验示例**：

1.  **删除`nginx:1.21`镜像**：

```bash
docker rmi nginx:1.21
```

2.  **强制删除一个被容器使用的镜像**：

```bash
docker rmi -f ubuntu:latest
```

3.  **删除所有悬空镜像（没有被任何标签引用的镜像）**：

```bash
docker image prune
```

## 4.4 镜像构建 (`docker build`)

`docker build` 命令用于根据Dockerfile文件和上下文构建新的Docker镜像。Dockerfile是一个文本文件，包含了一系列构建镜像的指令。

**基本语法**：

```bash
docker build [OPTIONS] PATH | URL | -
```

**常用选项**：

*   `-t` 或 `--tag`：为构建的镜像指定名称和标签，格式为 `name:tag`。
*   `-f` 或 `--file`：指定Dockerfile文件的路径（如果不是默认的`./Dockerfile`）。
*   `--no-cache`：构建镜像时不使用缓存。

**实验示例**：

1.  **准备Dockerfile**：

    首先，创建一个名为`my-app`的目录，并在其中创建`Dockerfile`文件和`app.py`文件。

```bash
mkdir -p my-app
cat <<EOF > my-app/Dockerfile
FROM python:3.9-slim-buster
WORKDIR /app
COPY . .
RUN pip install Flask
EXPOSE 5000
CMD ["python", "app.py"]
EOF

echo "Flask" > requirements.txt

cat <<EOF > my-app/app.py
from flask import Flask
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello from Docker!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
EOF
```

2.  **构建镜像**：

    在`my-app`目录下执行：

```bash
docker build -t my-python-app:1.0 my-app
```
    这里的`my-app`表示Dockerfile所在的上下文路径。

3.  **运行构建的镜像**：

```bash
docker run -d -p 5000:5000 --name my-web-app my-python-app:1.0
```
    访问 `http://localhost:5000` 即可看到 "Hello from Docker!"。

## 4.5 镜像标签与推送 (`docker tag`, `docker push`)

`docker tag` 命令用于为镜像添加一个额外的标签，通常用于将本地镜像标记为准备推送到远程仓库的格式。`docker push` 命令用于将本地镜像推送到远程镜像仓库。

### 4.5.1 标记镜像 (`docker tag`)

**基本语法**：

```bash
docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]
```

**实验示例**：

1.  **为`my-python-app:1.0`镜像添加一个新标签，准备推送到Docker Hub**：

    假设您的Docker Hub用户名为`your_dockerhub_username`。

```bash
docker tag my-python-app:1.0 your_dockerhub_username/my-python-app:latest
```

### 4.5.2 登录Docker Hub (`docker login`)

在推送镜像之前，您需要登录到Docker Hub或其他远程仓库。

**基本语法**：

```bash
docker login [OPTIONS] [SERVER]
```

**实验示例**：

1.  **登录Docker Hub**：

```bash
docker login
```
    系统会提示您输入Docker Hub用户名和密码。

### 4.5.3 推送镜像 (`docker push`)

**基本语法**：

```bash
docker push [OPTIONS] NAME[:TAG]
```

**实验示例**：

1.  **推送`my-python-app`镜像到Docker Hub**：

```bash
docker push your_dockerhub_username/my-python-app:latest
```

## 4.6 镜像导入导出 (`docker save`, `docker load`)

`docker save` 和 `docker load` 命令用于将镜像打包成文件进行传输，或从文件加载镜像。

### 4.6.1 导出镜像 (`docker save`)

`docker save` 命令将一个或多个镜像保存到一个tar归档文件中。

**基本语法**：

```bash
docker save [OPTIONS] IMAGE [IMAGE...]
```

**常用选项**：

*   `-o` 或 `--output`：指定输出文件路径。

**实验示例**：

1.  **将`my-python-app:1.0`镜像保存到`my-python-app.tar`文件**：

```bash
docker save -o my-python-app.tar my-python-app:1.0
```

### 4.6.2 导入镜像 (`docker load`)

`docker load` 命令从一个tar归档文件或标准输入中加载镜像。

**基本语法**：

```bash
docker load [OPTIONS]
```

**常用选项**：

*   `-i` 或 `--input`：指定输入文件路径。

**实验示例**：

1.  **从`my-python-app.tar`文件加载镜像**：

```bash
docker load -i my-python-app.tar
```

通过本章节的学习和实践，您应该已经掌握了Docker镜像的完整生命周期管理，包括从远程仓库获取、本地查看与删除、通过Dockerfile构建自定义镜像、以及镜像的标记、推送、导入和导出。这些技能是高效利用Docker进行应用部署和分发的基础。


# 6. Docker Compose

Docker Compose是一个用于定义和运行多容器Docker应用程序的工具。通过一个YAML文件来配置应用程序的服务，然后使用一个命令即可从配置中创建并启动所有服务。这使得管理复杂的、多服务的应用程序变得非常简单。本章节将介绍Docker Compose的安装、`docker-compose.yml`文件的编写以及常用命令。

## 6.1 Docker Compose简介与安装

### 6.1.1 Docker Compose简介

在实际应用中，一个完整的应用程序往往由多个服务组成，例如Web服务器、数据库、缓存等。这些服务可能需要运行在不同的容器中，并且它们之间需要相互通信。手动管理这些容器（创建、启动、连接）会非常繁琐。Docker Compose正是为了解决这个问题而生，它允许您：

*   **使用YAML文件定义应用程序的服务**：在一个文件中配置所有服务，包括镜像、端口映射、数据卷、网络等。
*   **一键启动所有服务**：通过一个命令启动、停止、重建和查看所有服务。
*   **服务间通信**：Compose会自动为服务创建网络，使得服务可以通过服务名称相互发现和通信。

### 6.1.2 Docker Compose安装

在CentOS 8上，Docker Compose通常作为Docker Engine的一部分，通过`docker-compose-plugin`包进行安装。如果您在安装Docker Engine时已经包含了此插件，则无需额外安装。您可以通过运行`docker compose version`命令来验证是否已安装。

```bash
docker compose version
```

如果显示版本信息，则表示已安装。如果未安装，或者您需要安装独立版本的Docker Compose（旧版本），可以按照以下步骤进行：

1.  **下载Docker Compose二进制文件**：

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```
    **注意**：请根据实际情况替换`v2.23.3`为最新稳定版本。

2.  **添加执行权限**：

```bash
sudo chmod +x /usr/local/bin/docker-compose
```

3.  **验证安装**：

```bash
docker-compose --version
```

    **注意**：新版本的Docker Compose作为Docker CLI的插件，命令是`docker compose` (无连字符)。旧版本独立安装的命令是`docker-compose` (有连字符)。本手册将主要使用`docker compose`命令。

## 6.2 `docker-compose.yml` 文件编写

`docker-compose.yml` 是Docker Compose的核心配置文件，它使用YAML格式定义了应用程序的服务、网络和数据卷。以下是其主要结构和常用配置项。

### 6.2.1 文件结构

一个典型的`docker-compose.yml`文件包含以下顶级键：

*   `version`：指定Compose文件的版本，通常建议使用最新版本（如`3.8`）。
*   `services`：定义应用程序中的各个服务。每个服务都将运行在一个独立的容器中。
*   `networks`：定义应用程序使用的网络。
*   `volumes`：定义应用程序使用的数据卷。

### 6.2.2 `services` 配置项

`services` 部分是`docker-compose.yml`文件中最重要的部分，它定义了应用程序的各个组件。每个服务可以配置以下常用属性：

*   `image`：指定用于创建容器的镜像。
*   `build`：指定Dockerfile的路径，用于构建自定义镜像。
*   `ports`：端口映射，格式与`docker run -p`类似。
*   `volumes`：数据卷挂载，格式与`docker run -v`类似。
*   `environment`：设置环境变量。
*   `depends_on`：定义服务之间的依赖关系，确保依赖服务先启动。
*   `networks`：指定服务连接的网络。
*   `restart`：定义容器的重启策略（如`always`, `on-failure`, `no`）。

**示例 `docker-compose.yml` 文件**：

我们将创建一个包含一个Web服务（Nginx）和一个数据库服务（MySQL）的简单应用。

```yaml
version: '3.8'

services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/html:/usr/share/nginx/html
    depends_on:
      - db
    networks:
      - app-network

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: my_database
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  db_data:
```

**文件说明**：

*   **`web` 服务**：
    *   使用 `nginx:latest` 镜像。
    *   将宿主机的80端口映射到容器的80端口。
    *   挂载本地 `./nginx/conf.d` 和 `./nginx/html` 目录到容器内，用于Nginx配置和网页文件。
    *   `depends_on: - db` 表示 `web` 服务依赖于 `db` 服务，`db` 服务会先启动。
    *   连接到 `app-network` 网络。
*   **`db` 服务**：
    *   使用 `mysql:8.0` 镜像。
    *   设置MySQL的root密码和数据库名称环境变量。
    *   使用名为 `db_data` 的数据卷来持久化MySQL数据。
    *   连接到 `app-network` 网络。
*   **`networks` 部分**：
    *   定义了一个名为 `app-network` 的自定义桥接网络，所有服务都将连接到此网络。
*   **`volumes` 部分**：
    *   定义了一个名为 `db_data` 的数据卷，用于 `db` 服务的持久化存储。

## 6.3 多容器应用编排

使用`docker-compose.yml`文件定义好应用程序后，就可以使用`docker compose`命令来管理整个应用栈。

### 6.3.1 启动应用 (`docker compose up`)

`docker compose up` 命令会根据`docker-compose.yml`文件创建并启动所有服务。如果服务所需的镜像不存在，它会自动拉取；如果服务容器已存在，它会尝试重建或更新。

**基本语法**：

```bash
docker compose up [OPTIONS] [SERVICE...]
```

**常用选项**：

*   `-d` 或 `--detach`：在后台运行容器。
*   `--build`：在启动前重新构建服务镜像。
*   `--force-recreate`：强制重新创建容器。

**实验示例**：

1.  **准备Nginx配置和网页文件**：

    在`docker-compose.yml`文件同级目录下创建`nginx`目录，并在其中创建`conf.d`和`html`子目录。

```bash
mkdir -p nginx/conf.d
mkdir -p nginx/html

cat <<EOF > nginx/conf.d/default.conf
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html;
    }
}
EOF

cat <<EOF > nginx/html/index.html
<!DOCTYPE html>
<html>
<head>
    <title>Docker Compose Nginx</title>
</head>
<body>
    <h1>Hello from Nginx via Docker Compose!</h1>
    <p>This is a multi-container application example.</p>
</body>
</html>
EOF
```

2.  **启动应用程序**：

    在包含`docker-compose.yml`文件的目录下执行：

```bash
docker compose up -d
```
    这将启动 `web` 和 `db` 两个服务。

3.  **验证**：

    访问 `http://localhost:80` 或 `http://<your-server-ip>:80`，应该能看到Nginx提供的网页。

### 6.3.2 停止并移除应用 (`docker compose down`)

`docker compose down` 命令会停止并移除`docker-compose.yml`文件中定义的所有服务、网络和数据卷（除非数据卷被明确声明为外部的）。

**基本语法**：

```bash
docker compose down [OPTIONS]
```

**常用选项**：

*   `--volumes` 或 `-v`：同时移除匿名数据卷和在`volumes`部分定义的数据卷。
*   `--rmi all`：移除所有镜像。

**实验示例**：

1.  **停止并移除应用程序**：

```bash
docker compose down
```

2.  **停止并移除应用程序，包括数据卷**：

```bash
docker compose down -v
```

### 6.3.3 查看服务状态 (`docker compose ps`)

`docker compose ps` 命令用于列出Compose项目中所有服务的运行状态。

**基本语法**：

```bash
docker compose ps [OPTIONS] [SERVICE...]
```

**实验示例**：

1.  **查看所有服务的状态**：

```bash
docker compose ps
```

### 6.3.4 查看服务日志 (`docker compose logs`)

`docker compose logs` 命令用于查看Compose项目中所有服务或指定服务的日志输出。

**基本语法**：

```bash
docker compose logs [OPTIONS] [SERVICE...]
```

**常用选项**：

*   `-f` 或 `--follow`：持续输出日志。
*   `--tail`：显示日志的最后N行。

**实验示例**：

1.  **查看所有服务的实时日志**：

```bash
docker compose logs -f
```

2.  **查看`web`服务的日志**：

```bash
docker compose logs web
```

## 6.4 Compose常用命令

除了上述命令，Docker Compose还提供了一些其他有用的命令：

*   **`docker compose build`**：构建（或重新构建）服务镜像。
```bash
docker compose build [SERVICE...]
```
*   **`docker compose start`**：启动已停止的服务容器。
```bash
docker compose start [SERVICE...]
```
*   **`docker compose stop`**：停止运行中的服务容器，但不删除它们。
```bash
docker compose stop [SERVICE...]
```
*   **`docker compose restart`**：重启服务容器。
```bash
docker compose restart [SERVICE...]
```
*   **`docker compose exec`**：在运行中的服务容器中执行命令。
```bash
docker compose exec web bash
```
*   **`docker compose config`**：验证并查看Compose文件的配置。
```bash
docker compose config
```
*   **`docker compose pull`**：拉取服务所需的镜像。
```bash
docker compose pull [SERVICE...]
```

通过本章节的学习和实践，您应该已经掌握了Docker Compose的基本概念、`docker-compose.yml`文件的编写以及如何使用`docker compose`命令来管理多容器应用程序。Docker Compose极大地简化了复杂应用的部署和管理，是Docker生态系统中不可或缺的工具。



# 7. 总结与展望

## 7.1 实验回顾

通过本实验手册的学习和实践，您已经全面掌握了Docker在CentOS 8环境下的核心技术。我们从Docker的安装与国内镜像加速配置开始，逐步深入到容器的生命周期管理、交互操作、网络配置和数据持久化。随后，我们探讨了镜像的获取、查看、删除、构建、标记、推送以及导入导出等管理操作。接着，我们学习了如何编写Dockerfile来自动化镜像构建，并了解了多阶段构建的优势和Dockerfile的最佳实践。最后，我们掌握了Docker Compose，通过YAML文件编排和管理多容器应用程序，极大地提升了应用部署和管理的效率。

这些实验不仅覆盖了Docker的常用命令，还通过实际案例帮助您理解了Docker在实际应用中的工作原理和最佳实践。您现在应该能够独立地在CentOS 8系统上部署、管理和维护基于Docker的应用程序。

## 7.2 Docker生态系统简述

Docker不仅仅是一个容器运行时，它更是一个庞大的生态系统，围绕着容器技术提供了丰富的工具和服务：

*   **Docker Hub**：官方的公共镜像仓库，提供了海量的官方和社区镜像。
*   **Docker Desktop**：适用于Windows和macOS的桌面应用程序，提供了Docker Engine、Kubernetes、Compose等工具的集成环境。
*   **Docker Swarm**：Docker官方提供的容器编排工具，用于管理和部署集群中的容器。
*   **Kubernetes (K8s)**：目前最流行的容器编排系统，由Google开源，提供了更强大的自动化部署、扩展和管理容器化应用的能力。
*   **Containerd**：一个行业标准的容器运行时，Docker Engine底层就是使用Containerd来管理容器生命周期。
*   **BuildKit**：一个改进的镜像构建引擎，提供了更快的构建速度和更丰富的功能。

## 7.3 未来学习方向

掌握了Docker的基础知识和实践技能后，您可以进一步探索以下方向，以深化您的容器化技术栈：

*   **Kubernetes**：学习Kubernetes是容器化技术进阶的必经之路，它能帮助您管理大规模的容器集群和复杂的微服务架构。
*   **CI/CD与DevOps**：将Docker集成到持续集成/持续部署（CI/CD）流程中，实现自动化测试、构建和部署。
*   **容器安全**：深入了解容器安全最佳实践，包括镜像扫描、运行时安全、网络隔离等。
*   **服务网格 (Service Mesh)**：如Istio、Linkerd等，用于管理微服务之间的通信，提供流量控制、可观测性和安全性。
*   **无服务器计算 (Serverless)**：结合容器技术，探索AWS Lambda、Google Cloud Functions等无服务器平台。
*   **云原生应用开发**：学习如何设计和开发符合云原生原则的应用程序，充分利用容器和微服务架构的优势。

