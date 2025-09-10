### **实验目标：**

1. 理解 Docker 的基本概念：容器、镜像、仓库等。
2. 掌握 Docker 安装、启动、停止、删除容器与镜像。
3. 熟悉 Docker 网络管理、数据卷（Volumes）管理和镜像构建。
4. 掌握 Docker Compose 的基本用法。
5. 了解 Docker 的安全管理和日志查看。

### **实验环境：**

* 操作系统：CentOS 8
* Docker 版本：最新稳定版

---

### **实验步骤：**

#### **1. 安装 Docker**

首先，在 CentOS 8 上安装 Docker。让学生按照以下步骤进行安装。

```bash
# 更新系统
sudo dnf update -y

# 安装依赖
sudo dnf install -y yum-utils device-mapper-persistent-data lvm2

# 设置 Docker 仓库
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装 Docker
sudo dnf install -y docker-ce docker-ce-cli containerd.io

# 启动 Docker 并设置开机自启
sudo systemctl start docker
sudo systemctl enable docker

# 检查 Docker 状态
sudo systemctl status docker

# 测试 Docker 是否安装成功
sudo docker --version
```

#### **2. 基本 Docker 命令**

熟练掌握 Docker 的常见命令。

* **运行第一个容器**

  ```bash
  sudo docker run hello-world
  ```

  该命令将下载并运行一个简单的镜像，验证 Docker 是否安装成功。
* **查看所有镜像**

  ```bash
  sudo docker images
  ```
* **查看所有容器**

  ```bash
  sudo docker ps -a
  ```
* **启动容器**

  ```bash
  sudo docker run -d --name mynginx nginx
  ```
* **停止容器**

  ```bash
  sudo docker stop mynginx
  ```
* **启动已停止的容器**

  ```bash
  sudo docker start mynginx
  ```
* **删除容器**

  ```bash
  sudo docker rm mynginx
  ```
* **删除镜像**

  ```bash
  sudo docker rmi nginx
  ```
* **查看容器日志**

  ```bash
  sudo docker logs mynginx
  ```

#### **3. Docker 网络管理**

了解 Docker 网络的基本管理。

* **查看网络配置**
  ```bash
  sudo docker network ls
  ```
* **创建一个自定义网络**
  ```bash
  sudo docker network create my_network
  ```
* **将容器连接到网络**
  ```bash
  sudo docker run -d --name container1 --network my_network nginx
  sudo docker run -d --name container2 --network my_network nginx
  ```
* **查看容器的网络设置**
  ```bash
  sudo docker inspect container1
  ```

#### **4. Docker 数据卷（Volumes）管理**

掌握如何管理 Docker 数据卷。

* **创建一个数据卷**
  ```bash
  sudo docker volume create my_volume
  ```
* **查看数据卷**
  ```bash
  sudo docker volume ls
  ```
* **使用数据卷启动容器**
  ```bash
  sudo docker run -d --name my_container -v my_volume:/data nginx
  ```
* **查看容器的数据卷挂载**
  ```bash
  sudo docker inspect my_container
  ```
* **删除数据卷**
  ```bash
  sudo docker volume rm my_volume
  ```

#### **5. 构建自定义 Docker 镜像**

体验如何构建自己的镜像。

* **创建 Dockerfile**
  创建一个 `Dockerfile`，让学生使用下面的内容：
  ```dockerfile
  FROM nginx:latest
  COPY ./index.html /usr/share/nginx/html/index.html
  ```
* **构建 Docker 镜像**
  ```bash
  sudo docker build -t custom_nginx .
  ```
* **查看自定义镜像**
  ```bash
  sudo docker images
  ```
* **运行自定义镜像**
  ```bash
  sudo docker run -d --name custom_nginx_container custom_nginx
  ```

#### **6. 使用 Docker Compose**

通过 Docker Compose 来管理多容器应用。

* **安装 Docker Compose**
  ```bash
  sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  ```
* **创建 `docker-compose.yml` 文件**
  创建一个 `docker-compose.yml` 文件，定义一个包含 Nginx 和 Redis 的多容器应用：
  ```yaml
  version: '3'
  services:
    web:
      image: nginx
      ports:
        - "80:80"
    redis:
      image: redis
  ```
* **启动 Docker Compose 应用**
  ```bash
  sudo docker-compose up -d
  ```
* **查看应用状态**
  ```bash
  sudo docker-compose ps
  ```
* **停止和删除容器**
  ```bash
  sudo docker-compose down
  ```

#### **7. Docker 安全管理**

了解如何进行 Docker 容器的安全配置。

* **查看容器资源限制**
  ```bash
  sudo docker run -d --name limited_container --memory="512m" --cpus="1.0" nginx
  ```
* **限制容器的权限**
  ```bash
  sudo docker run -d --name secure_container --cap-drop=ALL nginx
  ```

#### **8. 高级命令与调试**

一些高级命令，如查看容器的文件系统、调试等。

* **查看容器的文件系统**
  ```bash
  sudo docker exec -it container_name /bin/bash
  ```
* **进入容器交互式模式**
  ```bash
  sudo docker exec -it mynginx bash
  ```
* **监控容器资源**
  ```bash
  sudo docker stats
  ```

---

好的，以下是修改后的综合性实验设计，用于搭建 LNMP 环境并部署一个博客：

### **综合性实验：使用 Docker 搭建 LNMP 环境并部署博客**

#### **实验背景：**

该实验旨在通过使用 Docker 搭建 LNMP 环境（Nginx、MySQL、PHP），并部署一个简单的博客系统。通过这个过程，可以掌握 Docker 容器管理、镜像构建、容器网络配置等技能，并在容器化环境中完成 Web 应用的搭建和管理。

#### **实验目标：**

1. 理解 Docker 的基础概念：容器、镜像、网络、数据卷等。
2. 使用 Docker 启动 Nginx、MySQL 和 PHP 容器，搭建 LNMP 环境。
3. 使用 Docker Compose 管理多容器应用。
4. 部署并配置一个简单的博客系统（如 WordPress 或自定义博客系统）。
5. 配置数据卷，实现容器与宿主机的数据共享。
6. 掌握 Docker 常用命令，如容器管理、日志查看、镜像管理等。

#### **实验要求：**

* 在 CentOS 8 上安装 Docker 和 Docker Compose。
* 搭建 LNMP 环境，使用 Nginx 作为 Web 服务器，MySQL 作为数据库，PHP 作为后端处理。
* 部署一个简单的博客系统（如 WordPress）。

---

### **实验步骤：**

#### **1. 环境准备：**

首先，确保 CentOS 8 上已安装 Docker 和 Docker Compose。

* 安装 Docker：

  ```bash
  sudo dnf install -y docker-ce docker-ce-cli containerd.io
  sudo systemctl start docker
  sudo systemctl enable docker
  ```

* 安装 Docker Compose：

  ```bash
  sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  ```

#### **2. 创建项目目录结构：**

在 `~/docker-lnmp` 目录下创建文件和子目录，组织 Docker 配置文件。

```bash
mkdir -p ~/docker-lnmp
cd ~/docker-lnmp
```

#### **3. 创建 `docker-compose.yml` 文件：**

使用 Docker Compose 来定义 Nginx、MySQL 和 PHP 容器，简化多容器的管理。

`docker-compose.yml`:

```yaml
version: '3.8'

services:
  web:
    image: nginx:latest
    container_name: nginx
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - php
      - db

  php:
    image: php:7.4-fpm
    container_name: php
    volumes:
      - ./html:/var/www/html

  db:
    image: mysql:5.7
    container_name: mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: blog_db
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

#### **4. 创建 Nginx 配置文件：**

创建一个简单的 `nginx.conf` 文件，配置 Nginx 来处理 PHP 请求。

`nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.php index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~ \.php$ {
        fastcgi_pass php:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME /var/www/html$document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    error_log  /var/log/nginx/error.log;
    access_log /var/log/nginx/access.log;
}
```

#### **5. 创建博客 HTML 文件（可选）：**

创建一个简单的 HTML 文件或者下载 WordPress 来作为博客系统的前端展示。

`html/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Docker Blog</title>
</head>
<body>
    <h1>Welcome to the Docker Blog!</h1>
    <p>This is a simple blog deployed using Docker.</p>
</body>
</html>
```

#### **6. 启动 LNMP 环境：**

使用 Docker Compose 启动整个环境。

```bash
cd ~/docker-lnmp
sudo docker-compose up -d
```

该命令会启动 Nginx、PHP 和 MySQL 容器，并通过 Docker Compose 管理它们。`-d` 参数让容器在后台运行。

#### **7. 部署 WordPress（可选）：**

如果想要部署一个动态博客系统（如 WordPress），可以修改 `docker-compose.yml` 配置文件，替换为 WordPress 服务。

修改 `docker-compose.yml` 文件，增加 WordPress 服务：

```yaml
  wordpress:
    image: wordpress:latest
    container_name: wordpress
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_NAME: blog_db
      WORDPRESS_DB_USER: root
      WORDPRESS_DB_PASSWORD: rootpassword
    ports:
      - "8080:80"
    depends_on:
      - db
```

然后，重新启动 Docker Compose：

```bash
sudo docker-compose up -d
```

#### **8. 测试与访问：**

* 打开浏览器，访问 `http://<your_server_ip>`，查看是否可以看到博客页面（静态或 WordPress 博客）。
* 如果是 WordPress，访问 `http://<your_server_ip>:8080` 进行 WordPress 设置，配置数据库连接等。

#### **9. 管理 Docker 容器：**

* **查看容器：**

  ```bash
  sudo docker ps
  ```

* **查看容器日志：**

  ```bash
  sudo docker logs nginx
  sudo docker logs php
  sudo docker logs mysql
  ```

* **停止和删除容器：**

  ```bash
  sudo docker-compose down
  ```

* **清理容器和镜像：**

  ```bash
  sudo docker system prune -a
  ```

#### **10. 扩展与优化：**

* **使用数据卷持久化数据库**：通过 Docker 数据卷配置，确保 MySQL 数据在容器重启时不会丢失。
* **配置资源限制**：可以为 MySQL 和 PHP 容器配置资源限制，避免系统资源的过度消耗。

---

### **实验总结：**

通过本实验，可以掌握如何使用 Docker 搭建 LNMP 环境，包括：

1. 使用 Docker Compose 管理多容器应用。
2. 配置并部署 Nginx、PHP 和 MySQL 服务。
3. 管理容器生命周期和查看日志。
4. 使用 Docker 数据卷持久化数据。
5. 扩展应用，部署动态博客系统（如 WordPress）