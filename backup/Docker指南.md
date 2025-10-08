# 一、Hello World

Docker 允许你在容器内运行应用程序，使用 docker run 命令来在容器内运行一个应用程序。 本教程将带你了解 Docker 的基本用法，从最简单的示例开始，逐步深入 Docker 的核心概念。

##### 准备工作

在开始之前，请确保你已经正确安装了 Docker。你可以通过运行 `docker --version` 命令来验证安装。

## 1\. 运行第一个容器：Hello World

让我们从最简单的示例开始，运行一个输出 "Hello world" 的容器：

```text
docker run ubuntu:15.10 /bin/echo "Hello world"
```

### 命令参数说明

- `docker`：Docker 的二进制执行文件
- `run`：与前面的 docker 组合来运行一个容器
- `ubuntu:15.10`：指定要运行的镜像，如果本地不存在会从 Docker Hub 下载
- `/bin/echo "Hello world"`：在容器中执行的命令

### 命令执行流程

1. Docker 客户端联系 Docker 守护进程
2. Docker 守护进程检查本地是否有 ubuntu:15.10 镜像，如果没有则从 Docker Hub 下载
3. Docker 守护进程基于该镜像创建新的容器
4. Docker 守护进程分配一个文件系统给容器，并在镜像层外挂载一个读写层
5. Docker 守护进程创建网络接口，连接容器到默认网络
6. Docker 守护进程设置 IP 地址，从池中分配一个 IP 给容器
7. Docker 守护进程在容器中执行 /bin/echo "Hello world" 命令
8. Docker 守护进程将命令的输出流回应给 Docker 客户端，客户端将输出发送给用户终端

##### 预期输出

运行上述命令后，你应该会看到终端输出：`Hello world`

## 2\. 运行交互式容器

通过 Docker 的 -i 和 -t 参数，我们可以创建一个具有交互能力的容器，这让我们能够像使用传统虚拟机一样使用容器：

```text
docker run -i -t ubuntu:15.10 /bin/bash
```

### 参数说明

- `-t`：在新容器内指定一个伪终端或终端
- `-i`：允许你对容器内的标准输入 (STDIN) 进行交互
- `/bin/bash`：在容器内启动 bash shell

运行后，你将进入容器的 bash 终端，提示符类似于：

```text
root@0123ce188bd8:/#
```

### 在容器内执行命令

现在你可以在容器内执行各种命令，就像在普通的 Linux 系统中一样：

```text
# 查看系统版本
root@0123ce188bd8:/# cat /etc/os-release
NAME="Ubuntu"
VERSION="15.10 (Wily Werewolf)"
ID=ubuntu
ID_LIKE=debian
PRETTY_NAME="Ubuntu 15.10"
VERSION_ID="15.10"
HOME_URL="http://www.ubuntu.com/"
SUPPORT_URL="http://help.ubuntu.com/"
BUG_REPORT_URL="http://bugs.launchpad.net/ubuntu/"

# 查看主机名
root@0123ce188bd8:/# hostname
0123ce188bd8

# 查看进程
root@0123ce188bd8:/# ps aux
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.2  18240  3248 pts/0    Ss   00:42   0:00 /bin/bash
root        17  0.0  0.1  34424  2836 pts/0    R+   00:42   0:00 ps aux
```

##### 退出容器

你可以通过以下两种方式退出容器：

- 输入 `exit` 命令
- 使用 `CTRL+D` 快捷键

退出后，容器会停止运行，但不会被删除。你可以使用 `docker ps -a` 命令查看所有容器，包括已停止的容器。

## 3\. 后台运行容器

在实际应用中，我们通常需要让容器在后台运行。使用 -d 参数可以让容器在后台运行，这对于运行服务类应用特别有用：

```text
docker run -d ubuntu:15.10 /bin/sh -c "while true; do echo hello world; sleep 1; done"
```

### 参数说明

- `-d`：让容器在后台运行
- `/bin/sh -c "command"`：在容器中执行 shell 命令
- `while true; do ... done`：创建一个无限循环，每秒输出一次 "hello world"

运行后，Docker 会返回一个容器 ID，类似这样：

```text
2b1b7a428627c51ab8810d541d759f072b4fc75487eed05812646b8534a2fe63
```

### 容器管理

使用 docker ps 命令查看运行中的容器：

```text
$ docker ps
CONTAINER ID   IMAGE          COMMAND                  CREATED          STATUS          PORTS     NAMES
2b1b7a428627   ubuntu:15.10   "/bin/sh -c 'while t…"   10 seconds ago   Up 9 seconds              amazing_cori
```

### docker ps 输出说明

- `CONTAINER ID`：容器的唯一标识符
- `IMAGE`：使用的镜像
- `COMMAND`：启动容器时运行的命令
- `CREATED`：容器的创建时间
- `STATUS`：容器的当前状态
- `PORTS`：容器的端口映射信息
- `NAMES`：容器的名称（如果没有指定，Docker 会自动分配一个随机名称）

### 容器状态说明

- `created`：已创建但未启动
- `restarting`：重启中
- `running` 或 `Up`：运行中
- `removing`：迁移中
- `paused`：暂停
- `exited`：已停止
- `dead`：死亡（无法启动）

### 查看容器日志

使用 docker logs 命令查看容器的输出：

```text
# 通过容器 ID 查看日志
$ docker logs 2b1b7a428627
hello world
hello world
hello world
...

# 通过容器名称查看日志
$ docker logs amazing_cori
hello world
hello world
hello world
...

# 实时查看日志（类似 tail -f）
$ docker logs -f 2b1b7a428627
hello world
hello world
hello world
...（持续输出）

# 查看最近的 5 条日志
$ docker logs --tail 5 2b1b7a428627
hello world
hello world
hello world
hello world
hello world
```

### 停止容器

使用 docker stop 命令停止运行中的容器：

```text
# 通过容器 ID 停止容器
$ docker stop 2b1b7a428627

# 通过容器名称停止容器
$ docker stop amazing_cori
```

##### 验证容器状态

停止容器后，可以再次使用 `docker ps` 命令确认容器已经停止运行。 停止的容器不会在输出中显示，除非使用 `docker ps -a` 命令查看所有容器。

## 4\. 命名容器

默认情况下，Docker 会为每个容器分配一个随机名称。但在实际应用中，为了便于管理，我们通常会为容器指定一个有意义的名称。 使用 --name 参数可以为容器指定名称：

```text
docker run --name hello-docker -d ubuntu:15.10 /bin/sh -c "while true; do echo hello docker; sleep 1; done"
```

现在，我们可以使用这个名称来引用容器：

```text
# 查看容器日志
$ docker logs hello-docker
hello docker
hello docker
hello docker
...

# 停止容器
$ docker stop hello-docker

# 启动已停止的容器
$ docker start hello-docker

# 重启容器
$ docker restart hello-docker
```

##### 注意事项

- 容器名称必须是唯一的。如果尝试创建同名容器，Docker 会返回错误。
- 容器名称可以包含字母、数字、下划线、点和连字符。
- 容器名称必须以字母或数字开头。

## 5\. 容器生命周期管理

了解容器的完整生命周期对于有效管理 Docker 环境至关重要。以下是容器生命周期的主要阶段和相关命令：

### 创建容器

创建但不启动容器

```text
docker create --name my-container ubuntu:15.10
```

这个命令会创建一个容器但不会启动它。创建后的容器处于 "created" 状态。

### 启动容器

启动已创建或已停止的容器

```text
docker start my-container
```

这个命令会启动一个已创建或已停止的容器。启动后的容器处于 "running" 状态。

### 暂停和恢复容器

暂时冻结容器中的所有进程

```text
# 暂停容器
docker pause my-container

# 恢复容器
docker unpause my-container
```

暂停容器会冻结容器中的所有进程，但不会释放资源。暂停的容器处于 "paused" 状态。

### 停止容器

优雅地停止容器中的所有进程

```text
docker stop my-container
```

这个命令会发送 SIGTERM 信号给容器中的主进程，如果进程在一定时间内（默认 10 秒）没有退出， Docker 会发送 SIGKILL 信号强制终止进程。停止后的容器处于 "exited" 状态。

### 强制停止容器

立即终止容器中的所有进程

```text
docker kill my-container
```

这个命令会立即发送 SIGKILL 信号给容器中的主进程，强制终止容器。 这可能会导致数据丢失，应该只在容器无法正常停止时使用。

### 删除容器

永久删除容器

```text
# 删除已停止的容器
docker rm my-container

# 强制删除正在运行的容器
docker rm -f my-container

# 删除所有已停止的容器
docker container prune
```

删除容器会永久移除容器及其文件系统。如果容器中有未保存的数据，这些数据将会丢失。

##### 容器状态转换

容器状态可以按照以下方式转换：

- **created** → **running**：通过 `docker start`
- **running** → **paused**：通过 `docker pause`
- **paused** → **running**：通过 `docker unpause`
- **running** → **exited**：通过 `docker stop` 或 `docker kill`
- **exited** → **running**：通过 `docker start`
- 任何状态 → 删除：通过 `docker rm`（运行中的容器需要使用 `-f` 参数）

## 6\. 下一步

恭喜！你已经学习了 Docker 的基本用法。现在你可以：

- 运行简单的容器
- 在交互模式下使用容器
- 在后台运行容器
- 查看容器日志
- 停止和删除容器
- 管理容器的完整生命周期

接下来，你可以继续学习以下内容：

### 容器操作

深入了解容器的管理和操作

学习更多关于容器的创建、启动、停止、删除等操作，以及如何管理容器的资源和配置。

### 镜像管理

学习如何管理 Docker 镜像

了解如何拉取、构建、推送和管理 Docker 镜像，以及如何使用 Dockerfile 创建自定义镜像。

##### 实践建议

Docker 的学习最好通过实践来加深理解。尝试运行不同类型的容器，如 Web 服务器、数据库等， 观察它们的行为和交互方式。查看我们的示例部分，了解如何部署常见的应用程序。

# 二、容器操作


Docker 容器是一个轻量级、可移植、自给自足的软件环境，用于运行应用程序。容器将应用程序及其所有依赖项 （包括库、配置文件、系统工具等）封装在一个标准化的包中，使得应用能够在任何地方一致地运行。

## 基本概念

### 镜像（Image）

容器的静态模板，包含了应用程序运行所需的所有依赖和文件。镜像是不可变的。

### 容器（Container）

镜像的一个运行实例，具有自己的文件系统、进程、网络等，且是动态的。容器从镜像启动，并在运行时保持可变。

## 常用命令


| 命令           | 功能                         | 示例                   |
| -------------- | ---------------------------- | ---------------------- |
| `docker run`   | 启动一个新的容器并运行命令   | `docker run -d ubuntu` |
| `docker ps`    | 列出当前正在运行的容器       | `docker ps`            |
| `docker ps -a` | 列出所有容器（包括已停止的） | `docker ps -a`         |

## 容器操作

### 获取镜像

如果本地没有所需的镜像，可以使用 docker pull 命令从 Docker Hub 下载：

```text
docker pull ubuntu
```

### 启动容器

使用 ubuntu 镜像启动一个交互式容器：

```text
docker run -it ubuntu /bin/bash
```

### 参数说明

- `-i`：交互式操作
- `-t`：终端
- `/bin/bash`：容器启动后执行的命令

### 后台运行

使用 -d 参数让容器在后台运行：

```text
docker run -itd --name ubuntu-test ubuntu /bin/bash
```

### 进入容器

有两种方式可以进入运行中的容器：

### 使用 docker attach

```text
docker attach container_id
```

注意：使用 attach 命令退出容器时，容器会停止运行。

### 使用 docker exec（推荐）

```text
docker exec -it container_id /bin/bash
```

推荐使用此方法，因为退出容器时不会导致容器停止。

### 导出和导入容器

```text
# 导出容器
docker export container_id > ubuntu.tar

# 导入容器快照
cat docker/ubuntu.tar | docker import - test/ubuntu:v1
```

### 运行 Web 应用

以下示例展示如何运行一个 Python Flask Web 应用：

```text
# 拉取镜像
docker pull training/webapp

# 运行容器
docker run -d -P training/webapp python app.py

# 指定端口映射
docker run -d -p 5000:5000 training/webapp python app.py
```

##### 端口映射说明

- `-P`：随机映射端口
- `-p 5000:5000`：将容器的 5000 端口映射到主机的 5000 端口

## 常见问题

### 权限不足问题

执行 docker 命令时出现权限不足错误：

```text
Got permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock
```

解决方法 1：使用 sudo

在 docker 命令前加上 sudo

解决方法 2：将用户添加到 docker 用户组

```text
sudo groupadd docker     # 添加 docker 用户组
sudo gpasswd -a $USER docker     # 将当前用户加入到 docker 用户组
newgrp docker     # 更新用户组
docker ps    # 测试 docker 命令
```

# 三、Docker 镜像管理


当运行容器时，使用的镜像如果在本地中不存在，Docker 就会自动从 Docker 镜像仓库中下载，默认是从 Docker Hub 公共镜像源下载。

## 列出镜像列表

我们可以使用 docker images 来列出本地主机上的镜像：

```text
$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
ubuntu              14.04               90d5884b1ee0        5 days ago          188 MB
php                 5.6                 f40e9e0f10c8        9 days ago          444.8 MB
nginx               latest              6f8d099c3adc        12 days ago         182.7 MB
mysql               5.6                 f2e8d6c772c0        3 weeks ago         324.6 MB
httpd               latest              02ef73cf1bc0        3 weeks ago         194.4 MB
ubuntu              15.10               4e3b13c8a266        4 weeks ago         136.3 MB
hello-world         latest              690ed74de00f        6 months ago        960 B
training/webapp     latest              6fae60ef3446        11 months ago       348.8 MB
```

### 列表项说明

- `REPOSITORY`：表示镜像的仓库源
- `TAG`：镜像的标签
- `IMAGE ID`：镜像ID
- `CREATED`：镜像创建时间
- `SIZE`：镜像大小

##### 关于标签

同一仓库源可以有多个 TAG，代表这个仓库源的不同版本，如 ubuntu 仓库源里，有 15.10、14.04 等多个不同的版本，我们使用 REPOSITORY:TAG 来定义不同的镜像。

使用指定版本的镜像，例如 ubuntu 15.10：

```text
$ docker run -t -i ubuntu:15.10 /bin/bash
root@d77ccb2e5cca:/#
```

### 参数说明

- `-i`：交互式操作
- `-t`：终端
- `ubuntu:15.10`：这是指用 ubuntu 15.10 版本镜像为基础来启动容器
- `/bin/bash`：放在镜像名后的是命令，这里我们希望有个交互式 Shell，因此用的是 /bin/bash

## 获取新的镜像

当我们在本地主机上使用一个不存在的镜像时 Docker 就会自动下载这个镜像。如果我们想预先下载这个镜像，我们可以使用 docker pull 命令来下载它。

```text
$ docker pull ubuntu:13.10
13.10: Pulling from library/ubuntu
6599cadaf950: Pull complete
23eda618d451: Pull complete
f0be3084efe9: Pull complete
52de432f084b: Pull complete
a3ed95caeb02: Pull complete
Digest: sha256:15b79a6654811c8d992ebacdfbd5152fcf3d165e374e264076aa435214a947a3
Status: Downloaded newer image for ubuntu:13.10
```

## 查找镜像

我们可以从 Docker Hub 网站来搜索镜像（[https://hub.docker.com/](https://hub.docker.com/)），也可以使用 docker search 命令来搜索镜像。

例如搜索 httpd 镜像：

```text
$ docker search httpd
NAME                                    DESCRIPTION                                     STARS     OFFICIAL   AUTOMATED
httpd                                  The Apache HTTP Server Project                  3795      [OK]
centos/httpd-24-centos7               Platform for running Apache httpd 2.4 or bui…   40
centos/httpd                                                                          33                   [OK]
arm32v7/httpd                          The Apache HTTP Server Project                  10
arm64v8/httpd                          The Apache HTTP Server Project                  9
solsson/httpd-openidc                  mod_auth_openidc on official httpd image, w…   8                    [OK]
```

### 搜索结果说明

- `NAME`：镜像仓库源的名称
- `DESCRIPTION`：镜像的描述
- `OFFICIAL`：是否 docker 官方发布
- `STARS`：类似 Github 里面的 star，表示点赞、喜欢的意思
- `AUTOMATED`：自动构建

## 删除镜像

镜像删除使用 docker rmi 命令，比如我们删除 hello-world 镜像：

```text
docker rmi hello-world
```

## 创建镜像

当我们从 Docker 镜像仓库中下载的镜像不能满足我们的需求时，我们可以通过以下两种方式对镜像进行更改：

1. 从已经创建的容器中更新镜像，并且提交这个镜像
2. 使用 Dockerfile 指令来创建一个新的镜像

### 更新镜像

更新镜像之前，我们需要使用镜像来创建一个容器：

```text
$ docker run -t -i ubuntu:15.10 /bin/bash
root@e218edb10161:/# apt-get update
root@e218edb10161:/# apt-get upgrade -y
root@e218edb10161:/# exit
```

在完成操作之后，我们可以通过命令 docker commit 来提交容器副本：

```text
$ docker commit -m="has update" -a="sean" e218edb10161 sean/ubuntu:v2
sha256:70bf1840fd7c0d2d8ef0a42a817eb29f854c1af8f7c59fc03ac7bdee9545aff8
```

### 参数说明

- `-m`：提交的描述信息
- `-a`：指定镜像作者
- `e218edb10161`：容器 ID
- `sean/ubuntu:v2`：指定要创建的目标镜像名

### 构建镜像

我们使用命令 docker build，从零开始来创建一个新的镜像。为此，我们需要创建一个 Dockerfile 文件，其中包含一组指令来告诉 Docker 如何构建我们的镜像。

首先，创建一个 Dockerfile 文件：

```text
FROM    centos:6.7
MAINTAINER      Fisher "fisher@sudops.com"

RUN     /bin/echo 'root:123456' |chpasswd
RUN     useradd sean
RUN     /bin/echo 'sean:123456' |chpasswd
RUN     /bin/echo -e "LANG=\"en_US.UTF-8\"" >/etc/default/local
EXPOSE  22
EXPOSE  80
CMD     /usr/sbin/sshd -D
```

##### Dockerfile 说明

- 每一个指令都会在镜像上创建一个新的层
- 每一个指令的前缀都必须是大写的
- 第一条 FROM，指定使用哪个镜像源
- RUN 指令告诉 Docker 在镜像内执行命令

使用 docker build 命令构建镜像：

```text
$ docker build -t sean/centos:6.7 .
Sending build context to Docker daemon 17.92 kB
Step 1 : FROM centos:6.7
 ---> d95b5ca17cc3
Step 2 : MAINTAINER Fisher "fisher@sudops.com"
 ---> Using cache
 ---> 0c92299c6f03
Step 3 : RUN /bin/echo 'root:123456' |chpasswd
 ---> Using cache
 ---> 0397ce2fbd0a
```

### 参数说明

- `-t`：指定要创建的目标镜像名
- `.`：Dockerfile 文件所在目录，可以指定 Dockerfile 的绝对路径

## 设置镜像标签

我们可以使用 docker tag 命令，为镜像添加一个新的标签：

```text
$ docker tag 860c279d2fec sean/centos:dev
$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
sean/centos         6.7                 860c279d2fec        5 hours ago         190.6 MB
sean/centos         dev                 860c279d2fec        5 hours ago         190.6 MB
```

##### 标签说明

docker tag 命令的语法为：docker tag 镜像ID 用户名称/镜像源名(repository name):新的标签名(tag)


# 四、Docker 网络配置


前面我们实现了通过网络端口来访问运行在 Docker 容器内的服务。容器中可以运行一些网络应用，要让外部也可以访问这些应用，可以通过 -P 或 -p 参数来指定端口映射。

## 网络端口映射

我们创建一个 Python 应用的容器：

```text
$ docker run -d -P training/webapp python app.py
fce072cc88cee71b1cdceb57c2821d054a4a59f67da6b416fceb5593f059fc6d
```

使用 docker ps 查看端口映射情况：

```text
$ docker ps
CONTAINER ID    IMAGE               COMMAND            ...           PORTS                     NAMES
fce072cc88ce    training/webapp     "python app.py"    ...     0.0.0.0:32768->5000/tcp   grave_hopper
```

### 端口映射参数说明

- `-P`：容器内部端口随机映射到主机的端口
- `-p`：容器内部端口绑定到指定的主机端口

使用 -p 参数指定端口映射：

```text
$ docker run -d -p 5000:5000 training/webapp python app.py
33e4523d30aaf0258915c368e66e03b49535de0ef20317d3f639d40222ba6bc0

$ docker ps
CONTAINER ID    IMAGE           COMMAND           ...    PORTS                     NAMES
33e4523d30aa    training/webapp "python app.py"   ...    0.0.0.0:5000->5000/tcp    berserk_bartik
```

### 指定网络地址绑定

我们可以指定容器绑定的网络地址，比如绑定 127.0.0.1：

```text
$ docker run -d -p 127.0.0.1:5001:5000 training/webapp python app.py
95c6ceef88ca3e71eaf303c2833fd6701d8d1b2572b5613b5a932dfdfe8a857c
```

### UDP 端口映射

默认情况下，-p 参数都是绑定 TCP 端口。如果要绑定 UDP 端口，可以在端口后面加上 /udp：

```text
$ docker run -d -p 127.0.0.1:5000:5000/udp training/webapp python app.py
6779686f06f6204579c1d655dd8b2b31e8e809b245a97b2d3a8e35abe9dcd22a
```

### 查看端口绑定

使用 docker port 命令可以查看端口的绑定情况：

```text
$ docker port adoring_stonebraker 5000
127.0.0.1:5001
```

## Docker 容器互联

端口映射并不是唯一把 Docker 连接到另一个容器的方法。Docker 有一个连接系统允许将多个容器连接在一起，共享连接信息。

### 容器命名

创建容器时，可以使用 --name 参数来指定容器名称：

```text
$ docker run -d -P --name sean training/webapp python app.py
43780a6eabaaf14e590b6e849235c75f3012995403f97749775e38436db9a441
```

### 新建网络

创建一个新的 Docker 网络：

```text
docker network create -d bridge test-net
```

### 网络参数说明

- `-d`：指定 Docker 网络类型，可以是 bridge 或 overlay
- `bridge`：桥接网络，用于单机容器通信
- `overlay`：覆盖网络，用于 Swarm mode 下的容器通信

### 连接容器

运行两个容器并连接到新建的 test-net 网络：

```text
# 运行第一个容器
$ docker run -itd --name test1 --network test-net ubuntu /bin/bash

# 运行第二个容器
$ docker run -itd --name test2 --network test-net ubuntu /bin/bash
```

##### 安装 ping 工具

如果容器中没有 ping 命令，可以通过以下命令安装：

```text
apt-get update
apt install iputils-ping
```

## 配置 DNS

可以在宿主机的 /etc/docker/daemon.json 文件中设置所有容器的 DNS：

```text
{
  "dns": [
    "114.114.114.114",
    "8.8.8.8"
  ]
}
```

##### 配置生效

配置完成后，需要重启 Docker 服务才能生效。

### 验证 DNS 配置

使用以下命令查看容器的 DNS 配置：

```text
docker run -it --rm ubuntu cat etc/resolv.conf
```

### 手动指定 DNS

如果只想为特定容器配置 DNS，可以使用以下参数：

```text
docker run -it --rm -h host_ubuntu --dns=114.114.114.114 --dns-search=test.com ubuntu
```

### DNS 参数说明

- `--rm`：容器退出时自动清理容器内部的文件系统
- `-h HOSTNAME`：设定容器的主机名
- `--dns=IP_ADDRESS`：添加 DNS 服务器
- `--dns-search=DOMAIN`：设定容器的搜索域

## Windows 系统特别说明

##### Windows 端口映射问题

在 Windows 系统中，由于 Docker 实际运行在虚拟机中，localhost 指向的是虚拟机而不是 Windows 主机，这可能导致端口映射访问问题。

### 解决方案

1\. 查找 Docker 虚拟机的 IP 地址：

```text
docker-machine ip default
```

2\. 使用虚拟机 IP 访问服务，例如：

```text
http://192.168.99.100:8888
```

### 获取容器 IP

如果需要获取容器的 IP 地址，可以使用以下命令：

```text
docker inspect container_id
```

# 五、仓库管理


仓库（Repository）是集中存放镜像的地方。以下介绍一下 Docker Hub。当然不止 Docker Hub， 只是远程的服务商不一样，操作都是一样的。

## Docker Hub

目前 Docker 官方维护了一个公共仓库 Docker Hub。大部分需求都可以通过在 Docker Hub 中直接下载镜像来实现。

### 注册

在 [https://hub.docker.com](https://hub.docker.com/) 免费注册一个 Docker 账号。

### Docker Hub 功能

- 免费托管公共镜像
- 自动构建（Automated Builds）
- 团队协作
- 官方镜像认证
- Web 钩子集成

## 登录和退出

登录需要输入用户名和密码，登录成功后，我们就可以从 Docker Hub 上拉取自己账号下的全部镜像。

### 登录

```text
docker login
```

##### 登录凭证

登录成功后，凭证会保存在 ~/.docker/config.json 文件中，下次使用 Docker 命令时会自动使用该凭证。

### 退出

退出 Docker Hub 可以使用以下命令：

```text
docker logout
```

## 拉取镜像

你可以通过 docker search 命令来查找官方仓库中的镜像，并利用 docker pull 命令来将它下载到本地。

### 搜索镜像

以 ubuntu 为关键词进行搜索：

```text
docker search ubuntu
```

### 搜索结果说明

- `NAME`：镜像仓库名称
- `DESCRIPTION`：镜像描述
- `STARS`：镜像的星级评分
- `OFFICIAL`：是否为官方镜像
- `AUTOMATED`：是否为自动构建的镜像

### 下载镜像

使用 docker pull 将官方 ubuntu 镜像下载到本地：

```text
docker pull ubuntu
```

## 推送镜像

用户登录后，可以通过 docker push 命令将自己的镜像推送到 Docker Hub。

##### 镜像命名规则

推送镜像前，需要先将镜像按照规范进行命名。格式为：用户名/镜像名:标签。

以下命令中的 username 请替换为你的 Docker 账号用户名：

```text
# 标记镜像
$ docker tag ubuntu:18.04 username/ubuntu:18.04

# 查看镜像列表
$ docker image ls
REPOSITORY      TAG        IMAGE ID            CREATED           ...
ubuntu          18.04      275d79972a86        6 days ago        ...
username/ubuntu 18.04      275d79972a86        6 days ago        ...

# 推送镜像
$ docker push username/ubuntu:18.04

# 查看推送的镜像
$ docker search username/ubuntu
```

### 推送注意事项

- 必须先登录 Docker Hub
- 镜像必须按规范命名
- 推送过程可能较慢，取决于镜像大小和网络状况
- 推送成功后，可以在 Docker Hub 网站上查看

## 私有仓库

除了使用 Docker Hub 这样的公共仓库外，用户还可以创建和使用私有仓库。私有仓库适用于需要严格控制访问权限或内部使用的场景。

##### 私有仓库优势

- 更好的访问控制
- 更快的下载速度
- 更高的安全性
- 更好的隐私保护

# 六、Dockerfile


## 什么是 Dockerfile？

Dockerfile 是一个文本文件，包含了构建 Docker 镜像的所有指令。通过定义一系列命令和参数， Dockerfile 指导 Docker 构建一个自定义的镜像。

## 使用 Dockerfile 定制镜像

下面以定制一个 nginx 镜像为例，构建好的镜像内会有一个 /usr/share/nginx/html/index.html 文件。

### 创建 Dockerfile

在一个空目录下，新建一个名为 Dockerfile 文件，并在文件内添加以下内容：

```text
FROM nginx
RUN echo '这是一个本地构建的nginx镜像' > /usr/share/nginx/html/index.html
```

### 基本指令说明

- `FROM`：定制的镜像都是基于 FROM 的镜像，这里的 nginx 就是定制需要的基础镜像
- `RUN`：用于执行后面跟着的命令行命令

### RUN 指令的两种格式

1\. shell 格式：

```text
RUN <命令行命令>
```

2\. exec 格式：

```text
RUN ["可执行文件", "参数1", "参数2"]
# 例如：
RUN ["./test.php", "dev", "offline"]  # 等价于 RUN ./test.php dev offline
```

##### 注意镜像层数

Dockerfile 的指令每执行一次都会在 Docker 上新建一层。所以过多无意义的层，会造成镜像膨胀过大。

例如，下面的写法会创建 3 层镜像：

```text
FROM centos
RUN yum -y install wget
RUN wget -O redis.tar.gz "http://download.redis.io/releases/redis-5.0.3.tar.gz"
RUN tar -xvf redis.tar.gz
```

可以简化为以下格式（只创建 1 层镜像）：

```text
FROM centos
RUN yum -y install wget \
    && wget -O redis.tar.gz "http://download.redis.io/releases/redis-5.0.3.tar.gz" \
    && tar -xvf redis.tar.gz
```

## 构建镜像

在 Dockerfile 文件的存放目录下，执行构建动作：

```text
docker build -t nginx:v3 .
```

##### 构建说明

- \-t 参数用于指定镜像名称和标签
- 最后的 . 表示构建上下文路径

## 上下文路径

上下文路径是指 Docker 在构建镜像时可以使用的文件路径。当需要使用到本机的文件时（比如复制文件到镜像中）， Docker build 命令会将这个路径下的所有内容打包。

##### 为什么需要上下文？

由于 Docker 的运行模式是 C/S，我们本机是 C，Docker 引擎是 S。实际的构建过程是在 Docker 引擎下完成的，所以这个时候无法直接用到本机的文件。这就需要把本机指定目录下的文件打包提供给 Docker 引擎使用。

##### 注意

上下文路径下不要放无用的文件，因为会一起打包发送给 Docker 引擎，如果文件过多会造成构建过程缓慢。

## Dockerfile 指令详解


| 指令       | 说明                                                    |
| ---------- | ------------------------------------------------------- |
| FROM       | 指定基础镜像，用于后续的指令构建                        |
| MAINTAINER | 指定 Dockerfile 的作者/维护者（已弃用，推荐使用 LABEL） |
| LABEL      | 添加镜像的元数据，使用键值对的形式                      |
| RUN        | 在构建过程中在镜像中执行命令                            |
| CMD        | 指定容器创建时的默认命令（可以被覆盖）                  |
| ENTRYPOINT | 设置容器创建时的主要命令（不可被覆盖）                  |
| EXPOSE     | 声明容器运行时监听的特定网络端口                        |
| ENV        | 在容器内部设置环境变量                                  |
| ADD        | 将文件、目录或远程URL复制到镜像中                       |
| COPY       | 将文件或目录复制到镜像中                                |
| VOLUME     | 为容器创建挂载点或声明卷                                |
| WORKDIR    | 设置后续指令的工作目录                                  |
| USER       | 指定后续指令的用户上下文                                |
| ARG        | 定义构建过程中的变量                                    |
| ONBUILD    | 当镜像被用作另一个构建过程的基础时，添加触发器          |

### COPY 指令

复制指令，从上下文目录中复制文件或者目录到容器里指定路径。

```text
COPY [--chown=<user>:<group>] <源路径1>... <目标路径>
COPY [--chown=<user>:<group>] ["<源路径1>",... "<目标路径>"]

# 示例
COPY hom* /mydir/
COPY hom?.txt /mydir/
```

### ADD 指令

ADD 指令和 COPY 的使用格类似，但具有额外功能：

### ADD vs COPY

ADD 优点：

在执行 <源文件> 为 tar 压缩文件的情况下，会自动解压到 <目标路径>

ADD 缺点：

- 在不解压的前提下，无法复制 tar 压缩文件
- 会令镜像构建缓存失效，可能会令镜像构建变得较慢

### CMD 指令

CMD 指令用于指定容器启动时要运行的命令：

```text
# 格式
CMD <shell 命令>
CMD ["<可执行文件或命令>","<param1>","<param2>",...]
CMD ["<param1>","<param2>",...]  # 该写法是为 ENTRYPOINT 指令指定的程序提供默认参数
```

##### CMD vs RUN

- CMD 在 docker run 时运行
- RUN 是在 docker build 时运行
- 如果 Dockerfile 中存在多个 CMD 指令，仅最后一个生效

### ENTRYPOINT 指令

ENTRYPOINT 指令用于配置容器启动时的可执行程序：

```text
# 格式
ENTRYPOINT ["<executeable>","<param1>","<param2>",...]

# 示例
FROM nginx

ENTRYPOINT ["nginx", "-c"] # 定参
CMD ["/etc/nginx/nginx.conf"] # 变参
```

### 运行示例

1\. 不传参运行：

```text
docker run nginx:test
```

将执行：nginx -c /etc/nginx/nginx.conf

2\. 传参运行：

```text
docker run nginx:test -c /etc/nginx/new.conf
```

将执行：nginx -c /etc/nginx/new.conf

### ENV 指令

设置环境变量：

```text
# 格式
ENV <key> <value>
ENV <key1>=<value1> <key2>=<value2>...

# 示例
ENV NODE_VERSION 7.2.0

RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz"
```

### ARG 指令

构建参数：

```text
# 格式
ARG <参数名>[=<默认值>]

# 示例
ARG VERSION=1.0.0
ARG BUILD_DATE
```

##### ENV vs ARG

- ARG 设置的变量仅在构建过程中有效
- ENV 设置的变量在容器运行时仍然存在

### VOLUME 指令

定义匿名数据卷：

```text
# 格式
VOLUME ["<路径1>", "<路径2>"...]
VOLUME <路径>

# 示例
VOLUME /data
VOLUME ["/data1", "/data2"]
```

### EXPOSE 指令

声明端口：

```text
# 格式
EXPOSE <端口1> [<端口2>...]

# 示例
EXPOSE 80 443
EXPOSE 8080
```

### WORKDIR 指令

设置工作目录：

```text
# 格式
WORKDIR <工作目录路径>

# 示例
WORKDIR /app
WORKDIR /usr/src/app
```

### USER 指令

指定运行容器时的用户：

```text
# 格式
USER <用户名>[:<用户组>]

# 示例
USER nginx
USER nginx:nginx
```

### HEALTHCHECK 指令

配置容器健康检查：

```text
# 格式
HEALTHCHECK [选项] CMD <命令>
HEALTHCHECK NONE

# 示例
HEALTHCHECK --interval=5m --timeout=3s CMD curl -f http://localhost/ || exit 1
```

### ONBUILD 指令

为镜像添加触发器：

```text
# 格式
ONBUILD <其它指令>

# 示例
ONBUILD ADD . /app/src
ONBUILD RUN /usr/local/bin/python-build --dir /app/src
```

### LABEL 指令

为镜像添加元数据：

```text
# 格式
LABEL <key>=<value> <key>=<value> ...

# 示例
LABEL version="1.0" description="This is my custom image"
LABEL org.opencontainers.image.authors="sean"
```

# 七、Docker Compose


## Compose 简介

Compose 是用于定义和运行多容器 Docker 应用程序的工具。通过 Compose，您可以使用 YML 文件来配置应用程序需要的所有服务。然后，使用一个命令，就可以从 YML 文件配置中创建并启动所有服务。

### Compose 使用的三个步骤

1. 使用 Dockerfile 定义应用程序的环境
2. 使用 docker-compose.yml 定义构成应用程序的服务，这样它们可以在隔离环境中一起运行
3. 执行 docker-compose up 命令来启动并运行整个应用程序

### 配置示例

docker-compose.yml 的配置案例如下：

```text
version: '3'
services:
  web:
    build: .
    ports:
      - "5000:5000"
    volumes:
      - .:/code
      - logvolume01:/var/log
    links:
      - redis
  redis:
    image: redis
volumes:
  logvolume01: {}
```

## Compose 安装

### Linux 安装

Linux 上我们可以从 Github 上下载它的二进制包来使用，最新发行的版本地址：[https://github.com/docker/compose/releases](https://github.com/docker/compose/releases)

运行以下命令以下载 Docker Compose 的当前稳定版本：

```text
sudo curl -L "https://github.com/docker/compose/releases/download/v2.2.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

##### 国内加速

你可以使用以下命令通过国内镜像加速安装：

```text
curl -L https://get.daocloud.io/docker/compose/releases/download/v2.4.1/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
```

将可执行权限应用于二进制文件：

```text
sudo chmod +x /usr/local/bin/docker-compose
```

创建软链：

```text
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```

测试是否安装成功：

```text
docker-compose version
```

##### Alpine Linux 注意事项

对于 Alpine，需要以下依赖包：py-pip，python-dev，libffi-dev，openssl-dev，gcc，libc-dev，和 make。

### macOS 安装

Mac 的 Docker 桌面版和 Docker Toolbox 已经包括 Compose 和其他 Docker 应用程序，因此 Mac 用户不需要单独安装 Compose。

### Windows 安装

Windows 的 Docker 桌面版和 Docker Toolbox 已经包括 Compose 和其他 Docker 应用程序，因此 Windows 用户不需要单独安装 Compose。

## 使用教程

### 1\. 准备

创建一个测试目录：

```text
mkdir composetest
cd composetest
```

在测试目录中创建一个名为 app.py 的文件：

```text
import time

import redis
from flask import Flask

app = Flask(__name__)
cache = redis.Redis(host='redis', port=6379)

def get_hit_count():
    retries = 5
    while True:
        try:
            return cache.incr('hits')
        except redis.exceptions.ConnectionError as exc:
            if retries == 0:
                raise exc
            retries -= 1
            time.sleep(0.5)

@app.route('/')
def hello():
    count = get_hit_count()
    return 'Hello World! I have been seen {} times.\n'.format(count)
```

创建 requirements.txt 文件：

```text
flask
redis
```

### 2\. 创建 Dockerfile

```text
FROM python:3.7-alpine
WORKDIR /code
ENV FLASK_APP app.py
ENV FLASK_RUN_HOST 0.0.0.0
RUN apk add --no-cache gcc musl-dev linux-headers
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
COPY . .
CMD ["flask", "run"]
```

### Dockerfile 说明

- `FROM python:3.7-alpine`：使用 Python 3.7 Alpine 镜像作为基础镜像
- `WORKDIR /code`：设置工作目录为 /code
- `ENV FLASK_APP app.py`：设置环境变量
- `RUN apk add`：安装 gcc 等依赖
- `COPY`：复制项目文件
- `CMD`：设置默认的容器启动命令

### 3\. 创建 docker-compose.yml

```text
version: '3'
services:
  web:
    build: .
    ports:
      - "5000:5000"
  redis:
    image: "redis:alpine"
```

### 配置说明

- 定义了两个服务：web 和 redis
- web 服务使用当前目录的 Dockerfile 构建
- 将容器的 5000 端口映射到主机的 5000 端口
- redis 服务使用 Docker Hub 的公共 Redis 镜像

### 4\. 构建和运行

在测试目录中执行以下命令来启动应用程序：

```text
docker-compose up
```

##### 后台运行

如果想在后台执行该服务可以加上 -d 参数：

```text
docker-compose up -d
```

## 配置指令参考

### version

指定 docker-compose.yml 文件的版本。

```text
version: "3.7"
```

### build

配置构建时的选项。

```text
version: "3.7"
services:
  webapp:
    build:
      context: ./dir
      dockerfile: Dockerfile-alternate
      args:
        buildno: 1
      labels:
        - "com.example.description=Accounting webapp"
      target: prod
```

### build 配置项

- `context`：上下文路径
- `dockerfile`：指定构建镜像的 Dockerfile 文件名
- `args`：添加构建参数
- `labels`：设置构建镜像的标签
- `target`：多层构建，可以指定构建哪一层

### command

覆盖容器启动后默认执行的命令。

```text
command: ["bundle", "exec", "thin", "-p", "3000"]
```

### depends_on

设置依赖关系。

```text
version: "3.7"
services:
  web:
    build: .
    depends_on:
      - db
      - redis
  redis:
    image: redis
  db:
    image: postgres
```

##### 注意

depends_on 不会等待服务完全启动才启动依赖它的服务。它只保证启动顺序。

### environment

设置环境变量。

```text
environment:
  RACK_ENV: development
  SHOW: 'true'
```

### ports

暴露端口。

```text
ports:
  - "3000"
  - "8000:8000"
  - "49100:22"
  - "127.0.0.1:8001:8001"
```

### volumes

挂载数据卷或主机目录。

```text
volumes:
  - /var/lib/mysql
  - ./cache:/tmp/cache
  - ~/configs:/etc/configs/:ro
```

### networks

配置容器连接的网络。

```text
services:
  web:
    networks:
      - frontend
      - backend
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
```

# 八、Docker Machine


## 简介

Docker Machine 可以集中管理所有的 docker 主机，比如快速的给 100 台服务器安装上 docker。它支持多种平台，包括：

- 本地虚拟机（如 VirtualBox、VMware）
- 云服务提供商（如阿里云、腾讯云、AWS、DigitalOcean）

## 安装

##### 前提条件

安装 Docker Machine 之前你需要先安装 Docker。

### Linux 安装命令

```text
base=https://github.com/docker/machine/releases/download/v0.16.0 &&
curl -L $base/docker-machine-$(uname -s)-$(uname -m) >/tmp/docker-machine &&
sudo mv /tmp/docker-machine /usr/local/bin/docker-machine &&
chmod +x /usr/local/bin/docker-machine
```

验证安装：

```text
docker-machine version
```

## 基本使用

以下示例使用 VirtualBox 驱动程序来说明 Docker Machine 的基本用法：

### 1\. 列出可用的机器

```text
docker-machine ls
```

### 2\. 创建机器

```text
docker-machine create --driver virtualbox test
```

\--driver 参数指定用来创建机器的驱动类型，这里使用 virtualbox

### 3\. 查看机器的 IP

```text
docker-machine ip test
```

### 4\. 停止/启动机器

```text
docker-machine stop test
docker-machine start test
```

### 5\. 连接到机器

```text
docker-machine ssh test
```

## 命令参考

### 常用命令

#### 管理命令

- `active`：查看当前激活状态的 Docker 主机
- `config`：查看当前激活状态 Docker 主机的连接信息
- `create`：创建 Docker 主机
- `env`：显示连接到某个主机需要的环境变量
- `inspect`：以 JSON 格式输出指定 Docker 的详细信息

#### 操作命令

- `start/stop/restart`：启动/停止/重启指定的主机
- `rm`：删除某台 Docker 主机
- `ssh`：通过 SSH 连接到主机上
- `scp`：在 Docker 主机之间复制文件
- `mount`：使用 SSHFS 挂载目录

#### 其他命令

- `upgrade`：更新 Docker 版本
- `url`：获取主机的监听 URL
- `version`：显示版本信息
- `help`：显示帮助信息

# 九、Docker安装Centos


[免费加速镜像，付费体验更佳 — 限时低至5元](https://dev.xuanyuan.dev/)

[首页](https://dockerdocs.xuanyuan.me/)

Docker 安装 CentOS

## Docker 安装 CentOS

CentOS（Community Enterprise Operating System）是 Linux 发行版之一，它是来自于 Red Hat Enterprise Linux（RHEL）依照开放源代码规定发布的源代码所编译而成。由于出自同样的源代码，因此有些要求高度稳定性的服务器以 CentOS 替代商业版的 Red Hat Enterprise Linux 使用。

## 1\. 查看可用的 CentOS 版本

访问 CentOS 镜像库地址：[https://dockers.xuanyuan.me/image/library/centos](https://dockers.xuanyuan.me/image/library/centos)

##### 版本说明

- 默认标签是 centos:latest，代表最新版本
- CentOS 7 是目前最稳定的版本之一
- 建议在生产环境中使用稳定版本

## 2\. 拉取指定版本的 CentOS 镜像

这里我们以安装 CentOS 7 为例：

```text
docker pull centos:centos7
```

## 3\. 查看本地镜像

使用以下命令查看是否已安装了 CentOS 7：

```text
docker images
```

##### 镜像信息

在输出中可以看到：

- REPOSITORY：显示为 centos
- TAG：显示为 centos7
- IMAGE ID：镜像的唯一标识
- CREATED：创建时间
- SIZE：镜像大小

## 4\. 运行容器

使用以下命令创建并启动 CentOS 容器：

```text
docker run -itd --name centos-test centos:centos7
```

##### 参数说明

- `-i`：交互式操作
- `-t`：终端
- `-d`：后台运行
- `--name`：指定容器名称

### 进入容器

使用以下命令进入运行中的容器：

```text
docker exec -it centos-test /bin/bash
```

## 5\. 验证安装

使用以下命令查看容器的运行信息：

```text
docker ps
```

##### 常用操作

在容器中可以执行以下操作：

```text
# 更新包索引
yum update

# 安装软件包
yum install package-name

# 查看系统信息
cat /etc/centos-release

# 退出容器
exit
```

# 十、Docker安装Nginx


Nginx 是一个高性能的 HTTP 和反向代理 web 服务器，同时也提供了 IMAP/POP3/SMTP 服务。它以其高性能、稳定性、丰富的功能集、简单的配置和低资源消耗而闻名。

## 1\. 查看可用的 Nginx 版本

访问 Nginx 镜像库地址：[https://dockers.xuanyuan.me/image/library/nginx](https://dockers.xuanyuan.me/image/library/nginx)

此外，我们还可以使用 docker search 命令来查看可用版本：

```text
docker search nginx
```

### 搜索结果示例


| NAME                | DESCRIPTION                                 | STARS | OFFICIAL |
| ------------------- | ------------------------------------------- | ----- | -------- |
| nginx               | Official build of Nginx.                    | 3260  | \[OK\]   |
| jwilder/nginx-proxy | Automated Nginx reverse proxy for docker... | 674   |          |

## 2\. 拉取最新版的 Nginx 镜像

使用以下命令拉取官方的最新版本的镜像：

```text
docker pull nginx:latest
```

## 3\. 查看本地镜像

使用以下命令来查看是否已安装了 Nginx：

```text
docker images
```

##### 镜像信息

在输出中可以看到：

- REPOSITORY：显示为 nginx
- TAG：显示为 latest
- IMAGE ID：镜像的唯一标识
- CREATED：创建时间
- SIZE：镜像大小

## 4\. 运行容器

使用以下命令来运行 Nginx 容器：

```text
docker run --name nginx-test -p 8080:80 -d nginx
```

### 参数说明

- `--name nginx-test`：指定容器名称
- `-p 8080:80`：端口映射，将本地 8080 端口映射到容器内部的 80 端口
- `-d`：后台运行容器
- `nginx`：使用 nginx 镜像

## 5\. 验证安装

通过以下方式验证 Nginx 是否安装成功：

### 检查容器状态

```text
docker ps
```

### 访问 Nginx

在浏览器中访问：`http://localhost:8080`

##### 常用操作

以下是一些常用的 Nginx 容器操作命令：

```text
# 停止 Nginx 容器
docker stop nginx-test

# 启动 Nginx 容器
docker start nginx-test

# 重启 Nginx 容器
docker restart nginx-test

# 进入容器
docker exec -it nginx-test /bin/bash

# 查看 Nginx 配置
docker exec nginx-test nginx -t

# 查看容器日志
docker logs nginx-test
```

## 6\. 自定义配置

如果需要自定义 Nginx 配置，可以通过以下方式挂载配置文件：

```text
# 创建目录
mkdir -p ~/nginx/www ~/nginx/logs ~/nginx/conf

# 运行容器
docker run --name nginx-test \
    -p 8080:80 \
    -v ~/nginx/www:/usr/share/nginx/html \
    -v ~/nginx/conf/nginx.conf:/etc/nginx/nginx.conf \
    -v ~/nginx/logs:/var/log/nginx \
    -d nginx
```

##### 目录说明

- ~/nginx/www：存放网站文件
- ~/nginx/logs：存放日志文件
- ~/nginx/conf：存放配置文件

# 十一、Docker安装Node.js


Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行环境，是一个让 JavaScript 运行在服务端的开发平台。

## 1\. 查看可用的 Node 版本

可以通过标签列表查看其他版本的 Node，默认是最新版本 node:latest

你也可以在标签列表中找到其他你想要的版本：

此外，我们还可以用 docker search node 命令来查看可用版本：

```text
$ docker search node
NAME                              DESCRIPTION                                     STARS     OFFICIAL   AUTOMATED
node                               Node.js is a JavaScript-based platform for...   12345     [OK]
nodered/node-red-docker          Node-RED Docker images.                         234                  [OK]
bitnami/node                     Bitnami Node.js Docker Image                    156                  [OK]
nodeshift/centos7-s2i-nodejs     NodeJS container images for OpenShift v3 ...   43
...
```

## 2\. 拉取最新版的 node 镜像

这里我们拉取官方的最新版本的镜像：

```text
$ docker pull node:latest
```

## 3\. 查看本地镜像

使用以下命令来查看是否已安装了 node

```text
$ docker images
```

在上图中可以看到我们已经安装了最新版本（latest）的 node 镜像。

## 4\. 运行容器

安装完成后，我们可以使用以下命令来运行 node 容器：

```text
$ docker run -itd --name node-test node
```

### 参数说明

`--name node-test`：容器名称。

## 5\. 验证安装

最后进入查看容器运行的 node 版本:

```text
$ docker exec -it node-test /bin/bash
root@6c5d265c68a6:/# node -v
v20.11.1
```

## 补充说明

### 使用 Docker 运行 Node.js 应用的一些建议

- 建议使用特定版本标签而不是 latest，以确保环境的稳定性
- 对于生产环境，推荐使用官方的 slim 或 alpine 版本以减小镜像体积
- 记得使用 volume 挂载来持久化应用数据和配置文件
- 在开发环境中可以使用 -v 参数挂载本地代码目录，方便开发调试
- 可以使用 docker-compose 来管理多容器的 Node.js 应用

## 提示

##### 开始之前

确保您已经安装了 Docker，并且可以访问 Docker Hub。本教程将指导您如何在 Docker 中安装和使用 Node.js。


# 十二、Docker安装PHP


PHP 是一种流行的通用脚本语言，特别适合于 Web 开发。通过 Docker 安装和运行 PHP，我们可以快速搭建开发环境，并确保开发和生产环境的一致性。

## 1\. 安装 PHP 镜像

我们可以通过以下两种方式来安装 PHP：

### 方法一：使用 docker pull 命令

```text
docker pull php:5.6-fpm
```

### 方法二：使用 docker search 命令查找可用版本

```text
docker search php
```

### 搜索结果示例


| NAME                    | DESCRIPTION                                    | STARS | OFFICIAL |
| ----------------------- | ---------------------------------------------- | ----- | -------- |
| php                     | While designed for web development, the PHP... | 1232  | \[OK\]   |
| richarvey/nginx-php-fpm | Container running Nginx + PHP-FPM...           | 207   |          |

##### 版本说明

PHP Docker 镜像提供了多种标签版本：

- latest：最新版本
- fpm：FastCGI Process Manager 版本
- apache：带 Apache 的版本
- alpine：基于 Alpine Linux 的轻量级版本

## 2\. Nginx + PHP 部署

在实际应用中，我们通常需要将 PHP 与 Web 服务器（如 Nginx）配合使用。以下是具体的配置步骤：

### 启动 PHP-FPM 容器

```text
docker run --name myphp-fpm -v ~/nginx/www:/www -d php:5.6-fpm
```

### 参数说明

- `--name myphp-fpm`：设置容器名称
- `-v ~/nginx/www:/www`： 将主机目录挂载到容器内
- `-d`：后台运行容器

### 配置 Nginx

创建 Nginx 配置文件目录并添加配置：

```text
mkdir -p ~/nginx/conf/conf.d
```

创建配置文件 ~/nginx/conf/conf.d/default.conf：

```text
server {
    listen       80;
    server_name  localhost;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm index.php;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }

    location ~ \.php$ {
        fastcgi_pass   php:9000;
        fastcgi_index  index.php;
        fastcgi_param  SCRIPT_FILENAME  /www/$fastcgi_script_name;
        include        fastcgi_params;
    }
}
```

### 启动 Nginx 容器

```text
docker run --name sean-php-nginx -p 8083:80 -d \
    -v ~/nginx/www:/usr/share/nginx/html:ro \
    -v ~/nginx/conf/conf.d:/etc/nginx/conf.d:ro \
    --link myphp-fpm:php \
    nginx
```

##### 配置说明

- 端口 8083 映射到容器的 80 端口
- 挂载本地 HTML 目录到容器
- 挂载本地 Nginx 配置目录到容器
- 通过 --link 连接 PHP-FPM 容器

## 3\. 高级配置：PHP + MySQL + phpMyAdmin

### 启动 MySQL 容器

```text
# 创建必要的目录
mkdir -p ~/docker/mysql/{data,logs,conf}

# 启动 MySQL 容器
docker run -p 3306:3306 --name mysql-server \
    -v ~/docker/mysql/conf:/etc/mysql \
    -v ~/docker/mysql/logs:/logs \
    -v ~/docker/mysql/data:/mysql_data \
    -e MYSQL_ROOT_PASSWORD=123456 \
    -d mysql
```

### 启动 phpMyAdmin 容器

```text
docker run --name myadmin -d --link mysql-server:db -p 8080:80 phpmyadmin/phpmyadmin
```

##### 访问说明

- PHP 应用访问地址：http://localhost:8083
- phpMyAdmin 访问地址：http://localhost:8080
- MySQL 端口：3306

### 测试 PHP 安装

在 ~/nginx/www 目录下创建 index.php 文件：

```text
<?php
echo phpinfo();
?>
```

# 十三、docker安装mysql


MySQL 是世界上最受欢迎的开源数据库。凭借其可靠性、易用性和性能，MySQL 已成为 Web 应用程序的数据库优先选择。

## 1\. 查看可用的 MySQL 版本

可以通过标签列表查看其他版本的 MySQL，默认是最新版本 mysql:latest。

##### 提示

你也可以使用 docker search mysql 命令来查看可用版本

```text
$ docker search mysql
NAME                     DESCRIPTION                                     STARS     OFFICIAL   AUTOMATED
mysql                    MySQL is a widely used, open-source relati...   2529      [OK]
mysql/mysql-server       Optimized MySQL Server Docker images. Crea...   161                  [OK]
centurylink/mysql        Image containing mysql. Optimized to be li...   45                   [OK]
sameersbn/mysql                                                          36                   [OK]
google/mysql             MySQL server for Google Compute Engine          16                   [OK]
appcontainers/mysql      Centos/Debian Based Customizable MySQL Con...   8                    [OK]
marvambass/mysql         MySQL Server based on Ubuntu 14.04              6                    [OK]
drupaldocker/mysql       MySQL for Drupal                                2                    [OK]
azukiapp/mysql           Docker image to run MySQL by Azuki - http:...   2                    [OK]
```

## 2\. 拉取 MySQL 镜像

这里我们拉取官方的最新版本的镜像：

```text
$ docker pull mysql:latest
```

## 3\. 查看本地镜像

使用以下命令来查看是否已安装了 mysql：

```text
$ docker images
```

在输出中可以看到我们已经安装了最新版本（latest）的 mysql 镜像。

## 4\. 运行容器

安装完成后，我们可以使用以下命令来运行 mysql 容器：

```text
$ docker run -itd --name mysql-test -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123456 mysql
```

### 参数说明

- `-p 3306:3306`：映射容器服务的 3306 端口到宿主机的 3306 端口，外部主机可以直接通过 宿主机ip:3306 访问到 MySQL 的服务。
- `MYSQL_ROOT_PASSWORD=123456`：设置 MySQL 服务 root 用户的密码。
- `-d`：后台运行容器
- `--name mysql-test`：指定容器名称

##### 验证安装

通过 docker ps 命令查看容器运行状态。本机可以通过 root 用户和设置的密码访问 MySQL 服务。

## 5\. MySQL 配置

### 配置文件说明

MySQL(5.7.19+) 的默认配置文件是 /etc/mysql/my.cnf 文件。如果想要自定义配置，建议向 /etc/mysql/conf.d 目录中创建 .cnf 文件。

1\. 创建配置文件目录：

```text
# pwd
/opt
# mkdir -p docker_v/mysql/conf
# cd docker_v/mysql/conf
# touch my.cnf
```

2\. 启动带配置的容器：

```text
docker run -p 3306:3306 --name mysql \
-v /opt/docker_v/mysql/conf:/etc/mysql/conf.d \
-e MYSQL_ROOT_PASSWORD=123456 \
-d mysql
```

## 6\. MySQL 8.0 特别说明

##### 认证方式变更

MySQL 8.0 版本对用户认证方式做了调整，如需使用旧版客户端连接，需要特别配置。

### MySQL 8.0 安装步骤

1\. 启动容器：

```text
docker run --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=your_password -d mysql
```

2\. 进入容器：

```text
docker exec -it mysql bash
```

3\. 登录 MySQL：

```text
mysql -u root -p
```

4\. 创建远程访问用户：

```text
CREATE USER 'remote'@'%' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT ALL PRIVILEGES ON *.* TO 'remote'@'%';
FLUSH PRIVILEGES;
```

## 常见问题

### 数据持久化

要确保数据不会因容器删除而丢失，启动时需要挂载数据目录：

```text
docker run -d \
--name mysql \
-p 3306:3306 \
-v /my/data/path:/var/lib/mysql \
-e MYSQL_ROOT_PASSWORD=123456 \
mysql
```

### 远程连接问题

如果无法远程连接 MySQL，请检查：

- 确保端口映射正确（-p 3306:3306）
- 检查防火墙是否开放 3306 端口
- 确保创建了允许远程连接的用户
- 对于 MySQL 8.0，确保使用了正确的认证方式


# 十四、Docker 安装 Tomcat


Apache Tomcat 是一个开源的 Java Servlet 容器，实现了 Java Servlet、JavaServer Pages、Java Expression Language 和 WebSocket 技术。使用 Docker 可以快速在隔离的容器中运行 Tomcat。

## 安装方法

### 方法一：使用 Docker Pull

最简单的方式开始使用 Docker 版 Tomcat

1. ### 查看可用版本

   使用 docker search 命令查找可用的 Tomcat 版本：


   ```text
   docker search tomcat
   ```
2. ### 拉取镜像

   拉取官方的 Tomcat 镜像：


   ```text
   docker pull tomcat
   ```
3. ### 验证安装

   检查镜像是否下载成功：


   ```text
   docker images | grep tomcat
   ```

### 方法二：使用 Dockerfile

构建自定义的 Tomcat 镜像

1. ### 创建目录结构


   ```text
   mkdir -p ~/tomcat/webapps ~/tomcat/logs ~/tomcat/conf
   ```
2. ### 创建 Dockerfile

   创建一个名为 Dockerfile 的文件，内容如下：


   ```text
   FROM openjdk:8-jre

   ENV CATALINA_HOME /usr/local/tomcat
   ENV PATH $CATALINA_HOME/bin:$PATH
   RUN mkdir -p "$CATALINA_HOME"
   WORKDIR $CATALINA_HOME

   ENV TOMCAT_MAJOR 8
   ENV TOMCAT_VERSION 8.5.32
   ENV TOMCAT_SHA512 fc010f4643cb9996cad3812594190564d0a30be717f659110211414faf8063c61fad1f18134154084ad3ddfbbbdb352fa6686a28fbb6402d3207d4e0a88fa9ce

   # 更多配置省略，详见文档
   # 完整的 Dockerfile 请参考官方文档

   EXPOSE 8080
   CMD ["catalina.sh", "run"]
   ```
3. ### 构建镜像


   ```text
   docker build -t tomcat .
   ```

## 运行 Tomcat 容器

### 容器配置

启动和配置你的 Tomcat 容器

### 基本运行命令

```text
docker run --name tomcat -p 8080:8080 -v $PWD/test:/usr/local/tomcat/webapps/test -d tomcat
```

### 命令参数说明

- `--name tomcat`：为容器指定一个名称
- `-p 8080:8080`：将主机端口映射到容器端口
- `-v $PWD/test:/usr/local/tomcat/webapps/test`：将本地目录挂载到容器中
- `-d`：以守护进程模式运行容器

### 验证容器状态

```text
docker ps
```

## 重要说明

##### 数据卷挂载

webapps 目录是部署 Java Web 应用程序的位置。请确保挂载的目录具有正确的权限。

##### 端口配置

启动容器前确保主机的 8080 端口未被占用。如果需要，可以映射到其他端口（例如：-p 8081:8080）。

##### 容器日志

使用以下命令查看容器日志：docker logs tomcat



# 十五、Docker 安装 Python


Python 是一个广泛使用的高级编程语言，以其简洁的语法和丰富的生态系统而闻名。本指南将介绍如何使用 Docker 安装和运行 Python。

## 方法一：使用官方镜像

### 1\. 查找 Python 镜像

访问 Python 镜像库地址：[https://dockers.xuanyuan.me/image/library/python](https://dockers.xuanyuan.me/image/library/python)

可以通过标签列表查看其他版本的 Python，默认是最新版本 python:latest。

此外，我们还可以用 docker search python 命令来查看可用版本：

```text
$ docker search python
NAME                           DESCRIPTION                        STARS     OFFICIAL   AUTOMATED
python                         Python is an interpreted,...       982       [OK]
kaggle/python                  Docker image for Python...         33                   [OK]
azukiapp/python                Docker image to run Python ...     3                    [OK]
vimagick/python                mini python                        2                    [OK]
tsuru/python                   Image for the Python ...           2                    [OK]
pandada8/alpine-python         An alpine based python image       1                    [OK]
1science/python                Python Docker images based on ...  1                    [OK]
lucidfrontier45/python-uwsgi   Python with uWSGI                 1                    [OK]
orbweb/python                  Python image                       1                    [OK]
```

### 2\. 拉取镜像

这里我们拉取官方的镜像，标签为 3.5：

```text
$ docker pull python:3.5
```

### 3\. 查看本地镜像

等待下载完成后，我们就可以在本地镜像列表里查到 REPOSITORY 为 python, 标签为 3.5 的镜像：

```text
$ docker images python:3.5
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
python              3.5                 045767ddf24a        9 days ago          684.1 MB
```

## 方法二：使用 Dockerfile 构建

### 1\. 创建目录结构

```text
$ mkdir -p ~/python ~/python/myapp
$ cd ~/python
```

##### 目录说明

myapp 目录将映射为 python 容器配置的应用目录。

### 2\. 创建 Dockerfile

在 python 目录下创建 Dockerfile，内容如下：

```text
FROM buildpack-deps:jessie

# remove several traces of debian python
RUN apt-get purge -y python.*

# http://bugs.python.org/issue19846
ENV LANG C.UTF-8

# gpg key
ENV GPG_KEY 97FC712E4C024BBEA48A61ED3A5CA953F73C700D

ENV PYTHON_VERSION 3.5.1

# if this is called "PIP_VERSION", pip explodes with "ValueError: invalid truth value '<VERSION>'"
ENV PYTHON_PIP_VERSION 8.1.2

RUN set -ex \
        && curl -fSL "https://www.python.org/ftp/python/${PYTHON_VERSION%%[a-z]*}/Python-$PYTHON_VERSION.tar.xz" -o python.tar.xz \
        && curl -fSL "https://www.python.org/ftp/python/${PYTHON_VERSION%%[a-z]*}/Python-$PYTHON_VERSION.tar.xz.asc" -o python.tar.xz.asc \
        && export GNUPGHOME="$(mktemp -d)" \
        && gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$GPG_KEY" \
        && gpg --batch --verify python.tar.xz.asc python.tar.xz \
        && rm -r "$GNUPGHOME" python.tar.xz.asc \
        && mkdir -p /usr/src/python \
        && tar -xJC /usr/src/python --strip-components=1 -f python.tar.xz \
        && rm python.tar.xz \
        \
        && cd /usr/src/python \
        && ./configure --enable-shared --enable-unicode=ucs4 \
        && make -j$(nproc) \
        && make install \
        && ldconfig \
        && pip3 install --no-cache-dir --upgrade --ignore-installed pip==$PYTHON_PIP_VERSION \
        && find /usr/local -depth \
                \( \
                    $ -type d -a -name test -o -name tests $ \
                    -o \
                    $ -type f -a -name '*.pyc' -o -name '*.pyo' $ \
                \) -exec rm -rf '{}' + \
        && rm -rf /usr/src/python ~/.cache

# make some useful symlinks that are expected to exist
RUN cd /usr/local/bin \
        && ln -s easy_install-3.5 easy_install \
        && ln -s idle3 idle \
        && ln -s pydoc3 pydoc \
        && ln -s python3 python \
        && ln -s python3-config python-config

CMD ["python3"]
```

### 3\. 构建镜像

通过 Dockerfile 创建镜像：

```text
$ docker build -t python:3.5 .
```

创建完成后，我们可以在本地的镜像列表里查找到刚刚创建的镜像：

```text
$ docker images python:3.5
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
python              3.5                 045767ddf24a        9 days ago          684.1 MB
```

## 使用 Python 镜像

### 1\. 创建测试文件

在 ~/python/myapp 目录下创建一个 helloworld.py 文件：

```text
#!/usr/bin/python

print("Hello, World!");
```

### 2\. 运行容器

```text
$ docker run -v $PWD/myapp:/usr/src/myapp -w /usr/src/myapp python:3.5 python helloworld.py
```

### 命令说明

- `-v $PWD/myapp:/usr/src/myapp`：将主机中当前目录下的 myapp 挂载到容器的 /usr/src/myapp
- `-w /usr/src/myapp`：指定容器的 /usr/src/myapp 目录为工作目录
- `python helloworld.py`：使用容器的 python 命令来执行工作目录中的 helloworld.py 文件

运行结果：

```text
Hello, World!
```


# 十六、Docker 安装 Redis  


Redis 是一个开源的使用 ANSI C 语言编写、支持网络、可基于内存亦可持久化的日志型、Key-Value 的 NoSQL 数据库，并提供多种语言的 API。

## 1\. 查看可用的 Redis 版本

访问 Redis 镜像库地址：[https://dockers.xuanyuan.me/image/library/redis](https://dockers.xuanyuan.me/image/library/redis)

可以通过标签列表查看其他版本的 Redis，默认是最新版本 redis:latest。

##### 版本选择

建议在生产环境中使用指定版本号的镜像，而不是使用 latest 标签。这样可以确保应用的稳定性和可预测性。

此外，我们还可以用 docker search redis 命令来查看可用版本：

```text
$ docker search redis
NAME                      DESCRIPTION                   STARS  OFFICIAL  AUTOMATED
redis                     Redis is an open source ...   2321   [OK]
sameersbn/redis                                         32                   [OK]
torusware/speedus-redis   Always updated official ...   29             [OK]
bitnami/redis             Bitnami Redis Docker Image    22                   [OK]
anapsix/redis             11MB Redis server image ...   6                    [OK]
webhippie/redis           Docker images for redis       4                    [OK]
```

## 2\. 拉取 Redis 镜像

这里我们拉取官方的最新版本的镜像：

```text
$ docker pull redis:latest
```

## 3\. 查看本地镜像

使用以下命令来查看是否已安装了 redis：

```text
$ docker images
```

## 4\. 运行容器

安装完成后，我们可以使用以下命令来运行 redis 容器：

```text
$ docker run -itd --name redis-test -p 6379:6379 redis
```

### 参数说明

- `-p 6379:6379`：映射容器服务的 6379 端口到宿主机的 6379 端口。外部可以直接通过 宿主机ip:6379 访问到 Redis 的服务。
- `--name redis-test`：为容器指定一个名称
- `-d`：后台运行容器
- `-it`：交互式终端

## 5\. 验证安装

通过 docker ps 命令查看容器的运行信息：

```text
$ docker ps
```

接着我们通过 redis-cli 连接测试使用 redis 服务：

```text
$ docker exec -it redis-test /bin/bash
```

##### 连接说明

进入容器后，可以使用 redis-cli 命令来操作 Redis。如果需要在容器外部连接 Redis，可以使用 Redis 客户端通过 127.0.0.1:6379 进行连接。

## 数据持久化

如果需要持久化 Redis 数据，可以使用以下命令启动容器：

```text
$ docker run -itd --name redis-test -p 6379:6379 -v /docker/redis/data:/data redis redis-server --appendonly yes
```

### 持久化说明

- `-v /docker/redis/data:/data`：将容器中的 /data 目录挂载到主机的 /docker/redis/data 目录
- `--appendonly yes`：启用 Redis 的 AOF 持久化功能


# 十七、Docker 安装 MongoDB


MongoDB 是一个免费的开源跨平台面向文档的 NoSQL 数据库程序。它使用 JSON 格式存储数据，支持各种编程语言， 是目前最流行的 NoSQL 数据库之一。

## 1\. 查看可用的 MongoDB 版本

访问 MongoDB 镜像库地址：[https://dockers.xuanyuan.me/image/library/mongo](https://dockers.xuanyuan.me/image/library/mongo)

可以通过标签列表查看其他版本的 MongoDB，默认是最新版本 mongo:latest。

此外，我们还可以用 docker search mongo 命令来查看可用版本：

```text
$ docker search mongo
NAME                              DESCRIPTION                      STARS     OFFICIAL   AUTOMATED
mongo                             MongoDB document databases ...   1989      [OK]
mongo-express                     Web-based MongoDB admin int...   22        [OK]
mvertes/alpine-mongo              light MongoDB container          19                   [OK]
mongooseim/mongooseim-docker      MongooseIM server the lates...   9                    [OK]
torusware/speedus-mongo           Always updated official Mon...   9                    [OK]
jacksoncage/mongo                 Instant MongoDB sharded cluster  6                    [OK]
mongoclient/mongoclient           Official docker image for M...   4                    [OK]
jadsonlourenco/mongo-rocks        Percona Mongodb with Rocksd...   4                    [OK]
```

## 2\. 拉取 MongoDB 镜像

这里我们拉取官方的最新版本的镜像：

```text
$ docker pull mongo:latest
```

## 3\. 查看本地镜像

使用以下命令来查看是否已安装了 mongo：

```text
$ docker images
```

### 镜像信息

在输出中可以看到我们已经安装了最新版本（latest）的 mongo 镜像，包含以下信息：

- REPOSITORY：显示为 mongo
- TAG：显示为 latest
- IMAGE ID：镜像的唯一标识
- CREATED：创建时间
- SIZE：镜像大小

## 4\. 运行容器

安装完成后，我们可以使用以下命令来运行 mongo 容器：

```text
docker run -d -p 27017:27017 --name my-mongo-container mongo
```

### 参数说明

- `-d`：后台运行容器
- `-p 27017:27017`：将容器的 27017 端口映射到主机的 27017 端口
- `--name my-mongo-container`：指定容器名称

## 5\. 验证安装

最后我们可以通过 docker ps 命令查看容器的运行信息：

```text
# docker ps
CONTAINER ID   IMAGE      ...   PORTS                    NAMES
d53e5d57668b   mongo      ...  :::27017->27017/tcp   my-mongo-container
```

##### 验证成功

你应该能够看到名为 my-mongo-container 的 MongoDB 容器正在运行。

## 6\. 连接到 MongoDB

接下来我们可以使用 MongoDB 客户端（例如 mongo shell）连接到运行中的 MongoDB 容器。

### 使用 mongosh 连接

你可以使用以下命令连接到 MongoDB：

```text
$ mongosh --host 127.0.0.1 --port 27017
Current Mongosh Log ID: 656d34911ff5455b0c3afdc0
Connecting to:          mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.1.0
Using MongoDB:          7.0.4
Using Mongosh:          2.1.0

For mongosh info see: https://docs.mongodb.com/mongodb-shell/
...
```

这将连接到本地主机的 27017 端口，你可以根据之前映射的端口进行调整。

### 进入容器命令行

进入 MongoDB 容器的 bash shell 命令如下：

```text
docker exec -it my-mongo-container bash
```

## 7\. 清理容器

记得在不再需要时停止和删除容器，可以使用以下命令：

```text
docker stop my-mongo-container
docker rm my-mongo-container
```

##### 数据持久化

默认情况下，删除容器会同时删除数据。如果需要保留数据，请使用数据卷：

```text
docker run -d -p 27017:27017 -v mongodb_data:/data/db --name my-mongo-container mongo
```


# 十八、Docker 安装 Apache


## 使用官方镜像安装

### 1\. 查找镜像

使用以下命令在 Docker Hub 上搜索 httpd 镜像：

```text
docker search httpd
```

### 搜索结果示例


| NAME         | DESCRIPTION                    | STARS | OFFICIAL |
| ------------ | ------------------------------ | ----- | -------- |
| httpd        | The Apache HTTP Server Project | 524   | \[OK\]   |
| centos/httpd |                                | 7     |          |

### 2\. 拉取镜像

使用以下命令拉取官方镜像：

```text
docker pull httpd
```

### 3\. 验证安装

查看已下载的镜像：

```text
docker images httpd
```

## 运行 Apache 容器

### 启动容器

使用以下命令启动 Apache 容器：

```text
docker run -d -p 80:80 -v $PWD/www/:/usr/local/apache2/htdocs/ -v $PWD/conf/httpd.conf:/usr/local/apache2/conf/httpd.conf -v $PWD/logs/:/usr/local/apache2/logs/ httpd
```

### 参数说明

- `-p 80:80`：将容器的 80 端口映射到主机的 80 端口
- `-v $PWD/www/:/usr/local/apache2/htdocs/`：挂载网站文件目录
- `-v $PWD/conf/httpd.conf:/usr/local/apache2/conf/httpd.conf`：挂载配置文件
- `-v $PWD/logs/:/usr/local/apache2/logs/`：挂载日志目录

### 验证容器运行状态

查看运行中的容器：

```text
docker ps
```

### 测试 Apache 服务

在浏览器中访问：`http://localhost` 或 `http://服务器IP`

##### 提示

如果无法访问，请检查：

- 确保 80 端口未被其他服务占用
- 检查防火墙是否允许 80 端口访问
- 查看容器日志：`docker logs CONTAINER_ID`



# 十九、Docker Compose 参考


## Docker Compose 概述

Docker Compose 是一个用于定义和运行多容器 Docker 应用程序的工具。通过 Compose，您可以使用 YAML 文件来配置应用程序的服务。然后，使用一个命令，就可以从配置中创建并启动所有服务。

本参考文档基于 Docker Compose V2 版本。如果您使用的是旧版本，某些配置可能不适用。

## 基本结构

一个典型的 docker-compose.yml 文件包含以下主要部分：services（服务）、networks（网络）和 volumes（数据卷）。

```text
version: "3.8"
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=secret
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:

networks:
  frontend:
  backend:
```

## 服务配置参考

### 构建配置

用于配置服务的构建选项


| 配置项     | 说明                   |
| ---------- | ---------------------- |
| build      | 指定构建上下文路径     |
| context    | 构建的上下文路径       |
| dockerfile | 指定 Dockerfile 文件名 |
| args       | 构建参数               |

### 运行配置

用于配置服务的运行时选项


| 配置项      | 说明               |
| ----------- | ------------------ |
| command     | 覆盖默认命令       |
| entrypoint  | 覆盖默认入口点     |
| environment | 设置环境变量       |
| env_file    | 从文件加载环境变量 |

## 网络配置

Docker Compose 允许您定义多个网络，服务可以连接到这些网络。

```text
networks:
  frontend:
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: 172.16.238.0/24
  backend:
    driver: bridge
```

## 数据卷配置

数据卷用于持久化数据和共享数据。

```text
volumes:
  db_data:
    driver: local
  cache:
    driver: local
    driver_opts:
      type: tmpfs
      device: tmpfs
      o: size=100m
```

## 完整示例

以下是一个包含多个服务、网络和数据卷的完整示例。

```text
version: "3.8"
services:
  web:
    build:
      context: ./web
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - api
    networks:
      - frontend
      - backend
    environment:
      - API_URL=http://api:3000

  api:
    build: ./api
    ports:
      - "3000:3000"
    depends_on:
      - db
      - redis
    networks:
      - backend
    environment:
      - DB_HOST=db
      - REDIS_HOST=redis

  db:
    image: mysql:8.0
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - backend
    environment:
      - MYSQL_ROOT_PASSWORD=secret
      - MYSQL_DATABASE=myapp

  redis:
    image: redis:alpine
    networks:
      - backend
    volumes:
      - redis_data:/data

volumes:
  db_data:
  redis_data:

networks:
  frontend:
  backend:
```

## 最佳实践

### 版本控制

将 docker-compose.yml 文件纳入版本控制系统

- 使用 .env 文件存储敏感信息
- 在 .gitignore 中排除 .env 文件
- 提供 .env.example 作为模板

### 服务命名

采用清晰的服务命名规范

- 使用有意义的服务名称
- 避免使用特殊字符
- 保持命名一致性

### 网络规划

合理规划网络结构

- 按功能分离网络
- 限制服务的网络访问
- 使用自定义网络而不是 links

### 数据持久化

正确管理数据持久化

- 使用命名卷而不是绑定挂载
- 为重要数据配置备份策略
- 注意数据卷的权限设置