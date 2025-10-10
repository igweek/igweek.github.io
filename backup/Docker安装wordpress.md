# 一、Docker安装wordpress
 
## 1. 引言
 
### 1.1 WordPress简介

WordPress是一款全球领先的开源内容管理系统（CMS），以其强大的功能、灵活的扩展性和友好的用户界面而广受欢迎。无论是个人博客、企业官网还是电子商务平台，WordPress都能提供稳定可靠的解决方案。它基于PHP语言和MySQL数据库构建，拥有庞大的社区支持和丰富的插件、主题生态系统。

### 1.2 Docker与WordPress结合的优势 (强调纯命令行部署的灵活性)

Docker作为一种轻量级容器化技术，为WordPress的部署带来了革命性的变革。通过Docker，我们可以将WordPress及其所有依赖（如MySQL、Nginx、PHP环境）打包成独立的、可移植的容器，从而实现“一次构建，随处运行”。与传统的部署方式相比，Docker化部署具有以下显著优势：

*   **环境隔离**：每个服务（WordPress、MySQL、Nginx）运行在独立的容器中，相互之间互不干扰，避免了环境冲突问题。
*   **部署便捷**：通过简单的`docker run`命令即可快速启动整个WordPress环境，大大简化了部署流程。
*   **可移植性**：容器化的WordPress应用可以在任何支持Docker的平台上运行，无论是开发、测试还是生产环境，都能保持一致性。
*   **资源高效**：容器共享宿主机的操作系统内核，相比虚拟机更加轻量级，资源利用率更高。
*   **易于管理**：容器的生命周期管理（启动、停止、删除、更新）变得简单明了，方便维护。
*   **纯命令行部署的灵ness**：本手册将重点介绍如何完全通过纯命令行`docker run`命令来部署WordPress，这使得用户可以更深入地理解每个组件的配置和交互，提供了极高的灵活性和控制力，尤其适合需要精细化控制和自动化脚本部署的场景。

### 1.3 实验目的

本实验手册旨在指导读者在CentOS 8操作系统上，使用纯命令行Docker技术，从零开始构建一个包含Nginx反向代理的WordPress网站。通过本手册的学习，您将能够：

*   掌握Docker网络、数据卷等核心概念在实际应用中的配置。
*   学会使用`docker run`命令独立启动和管理MySQL、WordPress和Nginx容器。
*   理解Nginx作为反向代理如何与WordPress容器协同工作。
*   完成WordPress的首次安装与基本配置。
*   了解WordPress和MySQL数据持久化与备份的重要性及方法。
*   掌握常见的故障排除技巧和性能优化建议。

通过本实验，您将不仅能够成功部署一个Docker化的WordPress网站，还能对Docker的纯命令行操作有更深入的理解，为后续更复杂的容器化应用部署打下坚实基础。

# 2. 准备工作

在开始使用纯命令行Docker安装WordPress并配置Nginx反向代理之前，确保您的系统环境已正确配置是至关重要的一步。本章节将指导您检查系统要求、验证Docker的安装，并创建必要的项目目录和数据持久化目录，包括Nginx的配置目录。

## 2.1 系统要求与Docker环境验证

本实验手册假设您正在使用 **CentOS 8** 操作系统。为了顺利运行WordPress及其依赖服务（如MySQL和Nginx），您的系统应满足以下基本要求：

*   **操作系统**：CentOS 8 (或兼容的RHEL 8发行版)。
*   **内存**：建议至少4GB RAM，以确保Nginx、WordPress和MySQL容器能够稳定运行。
*   **磁盘空间**：建议至少20GB可用磁盘空间，用于存储Docker镜像、容器数据以及WordPress和Nginx文件。
*   **网络连接**：确保系统可以访问互联网，以便拉取Docker镜像。

此外，您需要确保系统上已正确安装并配置了Docker Engine。如果您尚未安装，请参考上一份实验手册《Docker实验手册 (CentOS 8)》中的“Docker安装与配置”章节进行安装和配置，特别是要确保配置了国内镜像加速，以提高镜像拉取速度。

您可以通过以下命令验证Docker Engine的安装情况：

```bash
docker version
```

如果Docker Engine已正确安装，此命令将显示Docker客户端和服务器的版本信息。请确保服务器版本（Server Version）存在。

## 2.2 创建项目目录和数据持久化目录

为了更好地组织WordPress项目文件和Docker容器的数据，建议为您的WordPress安装创建一个独立的目录。这个目录将包含用于数据持久化的子目录，以及Nginx的配置文件目录。

1.  **创建主项目目录**：

```bash
mkdir ~/wordpress-nginx-docker-run
cd ~/wordpress-nginx-docker-run
```

    此命令将在您的用户主目录下创建一个名为`wordpress-nginx-docker-run`的目录，并进入该目录。所有后续的操作都将在此目录下进行。

2.  **创建数据持久化目录**：

    为了确保WordPress和MySQL的数据在容器重建后不会丢失，我们将使用数据卷进行持久化。我们将创建两个用于绑定挂载的目录，分别用于存储WordPress的文件和MySQL的数据库数据。

```bash
mkdir ./wordpress_data
mkdir ./db_data
```

    *   `./wordpress_data`：将用于存储WordPress的程序文件、主题、插件和上传内容。
    *   `./db_data`：将用于存储MySQL数据库的数据文件。

3.  **创建Nginx配置文件目录**：

    Nginx容器需要一个配置文件来定义反向代理规则。我们将创建一个目录来存放这个配置文件。

```bash
mkdir ./nginx_conf
```

    `./nginx_conf`：将用于存放Nginx的配置文件，例如`nginx.conf`或`default.conf`。

完成以上准备工作后，您的系统已为使用纯命令行部署WordPress和Nginx反向代理做好了充分准备。接下来，我们将开始使用`docker run`命令来启动MySQL数据库容器。


# 3. 纯命令行启动MySQL容器

在部署WordPress之前，我们需要先启动一个MySQL数据库容器。WordPress将使用这个数据库来存储其所有数据。本章节将指导您如何使用`docker run`命令创建并启动一个MySQL容器，并配置其网络和数据持久化。

## 3.1 创建Docker网络

为了让WordPress容器和MySQL容器能够相互通信，我们需要创建一个自定义的Docker网络。这样，容器之间可以通过服务名称而不是IP地址进行通信，增加了灵活性和可维护性。

```bash
docker network create wordpress-network
```

此命令将创建一个名为`wordpress-network`的桥接网络。后续启动WordPress、Nginx和MySQL容器时，我们将它们连接到这个网络。

## 3.2 启动MySQL容器

现在，我们将使用`docker run`命令启动MySQL容器。这个命令会包含数据卷挂载、环境变量设置和网络连接等关键配置。

```bash
docker run \
  --name mysql-db \
  --network wordpress-network \
  -v ~/wordpress-nginx-docker-run/db_data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=root_password \
  -e MYSQL_DATABASE=wordpress_db \
  -e MYSQL_USER=wordpress \
  -e MYSQL_PASSWORD=wordpress_password \
  -d mysql:8.0
```

### 3.2.1 命令参数解析

*   `--name mysql-db`：为MySQL容器指定一个名称为`mysql-db`。这个名称将在Docker网络中作为主机名，供其他容器（如WordPress）访问。
*   `--network wordpress-network`：将MySQL容器连接到我们之前创建的`wordpress-network`网络。
*   `-v ~/wordpress-nginx-docker-run/db_data:/var/lib/mysql`：将宿主机上`~/wordpress-nginx-docker-run/db_data`目录绑定挂载到容器内部的`/var/lib/mysql`路径。这是MySQL存储数据的地方，用于持久化数据库内容。这样即使容器被删除，数据也不会丢失。
*   `-e MYSQL_ROOT_PASSWORD=root_password`：设置MySQL的root用户密码为`root_password`。请在实际生产环境中替换为强密码。
*   `-e MYSQL_DATABASE=wordpress_db`：在容器启动时创建一个名为`wordpress_db`的数据库。
*   `-e MYSQL_USER=wordpress`：创建一个名为`wordpress`的数据库用户。
*   `-e MYSQL_PASSWORD=wordpress_password`：设置`wordpress`用户的密码为`wordpress_password`。请在实际生产环境中替换为强密码。
*   `-d mysql:8.0`：指定使用`mysql:8.0`镜像启动容器，并在后台（detached mode）运行。

## 3.3 验证MySQL容器状态

容器启动后，您可以使用以下命令验证MySQL容器是否正常运行：

1.  **查看运行中的容器**：

```bash
docker ps
```

您应该能看到名为`mysql-db`的容器处于`Up`状态。

2.  **查看容器日志**：

```bash
docker logs mysql-db
```

检查日志输出，确保没有错误信息，并且MySQL服务已成功启动。您可能会看到类似“`X.X.X MySQL Community Server - GPL`”的启动信息。

3.  **进入MySQL容器验证数据库**：

您可以进入MySQL容器内部，使用MySQL客户端验证数据库和用户是否已成功创建。

```bash
docker exec -it mysql-db mysql -u root -proot_password
```

进入MySQL命令行后，可以执行以下命令验证：

```sql
SHOW DATABASES;
SELECT User, Host FROM mysql.user;
EXIT;
```

您应该能看到`wordpress_db`数据库和`wordpress`用户。验证完成后，输入`exit`退出MySQL客户端。

至此，MySQL数据库容器已成功启动并配置完成，为WordPress的部署奠定了基础。


# 5. 纯命令行启动Nginx反向代理容器

为了更好地管理流量、提供SSL/TLS加密（HTTPS）以及实现更灵活的部署，我们通常会在WordPress容器前放置一个Nginx反向代理。本章节将指导您如何创建Nginx配置文件，并使用`docker run`命令启动Nginx容器作为WordPress的反向代理。

## 5.1 创建Nginx配置文件

Nginx容器需要一个配置文件来定义其作为反向代理的行为。我们将创建一个名为`default.conf`的文件，并将其放置在之前创建的`~/wordpress-nginx-docker-run/nginx_conf`目录下。

首先，进入Nginx配置目录：

```bash
cd ~/wordpress-nginx-docker-run/nginx_conf
```

然后，使用文本编辑器（如`vi`或`nano`）创建并编辑`default.conf`文件：

```bash
vi default.conf
```

将以下内容复制粘贴到`default.conf`文件中：

```nginx
server {
    listen 80;
    server_name localhost <您的服务器IP地址或域名>;

    location / {
        proxy_pass http://wordpress-app:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5.1.1 配置文件解析

*   `listen 80;`：Nginx监听宿主机的80端口，接收HTTP请求。
*   `server_name localhost <您的服务器IP地址或域名>;`：定义Nginx服务器的名称。请将`<您的服务器IP地址或域名>`替换为实际的IP地址或域名，例如`example.com`。
*   `location /`：匹配所有请求。
*   `proxy_pass http://wordpress-app:80;`：这是反向代理的核心指令。它将所有请求转发到`wordpress-app`容器的80端口。`wordpress-app`是我们在Docker网络中为WordPress容器指定的名称。
*   `proxy_set_header ...;`：这些指令用于设置HTTP请求头，确保WordPress能够正确获取客户端的真实IP地址、主机名和协议信息。这对于WordPress的正常运行和日志记录非常重要。

保存并关闭`default.conf`文件。

## 5.2 启动Nginx容器

现在，我们将使用`docker run`命令启动Nginx容器。这个命令会包含端口映射、配置文件挂载和网络连接等关键配置。

首先，回到主项目目录：

```bash
cd ..
```

然后执行以下`docker run`命令：

```bash
docker run \
  --name nginx-proxy \
  --network wordpress-network \
  -p 80:80 \
  -v ~/wordpress-nginx-docker-run/nginx_conf/default.conf:/etc/nginx/conf.d/default.conf:ro \
  -d nginx:latest
```

### 5.2.1 命令参数解析

*   `--name nginx-proxy`：为Nginx容器指定一个名称为`nginx-proxy`。
*   `--network wordpress-network`：将Nginx容器连接到我们之前创建的`wordpress-network`网络。这使得Nginx容器可以通过服务名称`wordpress-app`访问WordPress容器。
*   `-p 80:80`：将宿主机的80端口映射到Nginx容器的80端口。这样，外部流量将首先到达Nginx，再由Nginx转发给WordPress。
*   `-v ~/wordpress-nginx-docker-run/nginx_conf/default.conf:/etc/nginx/conf.d/default.conf:ro`：将宿主机上我们刚刚创建的`default.conf`文件绑定挂载到Nginx容器内部的`/etc/nginx/conf.d/default.conf`路径。`:ro`表示只读，确保容器不会修改此配置文件。
*   `-d nginx:latest`：指定使用`nginx:latest`镜像启动容器，并在后台（detached mode）运行。

## 5.3 验证Nginx容器状态

容器启动后，您可以使用以下命令验证Nginx容器是否正常运行：

1.  **查看运行中的容器**：

```bash
docker ps
```

您应该能看到名为`nginx-proxy`的容器处于`Up`状态。

2.  **查看容器日志**：

```bash
docker logs nginx-proxy
```

检查日志输出，确保没有错误信息，并且Nginx服务已成功启动。您可能会看到类似“`nginx: [emerg] ...`”或“`nginx: [warn] ...`”的警告或错误信息，需要根据具体情况进行排查。正常启动应显示Nginx的启动信息。

至此，Nginx反向代理容器已成功启动并配置完成，它将作为WordPress网站的入口。接下来，我们将启动WordPress容器，并将其连接到Nginx代理的后端。


# 6. 纯命令行启动WordPress容器

在MySQL容器成功运行并配置好数据库，以及Nginx反向代理容器准备就绪后，我们现在可以启动WordPress容器。本章节将指导您如何使用`docker run`命令创建并启动一个WordPress容器，并配置其与MySQL容器的连接、数据持久化和网络连接。**请注意，WordPress容器的端口将不会直接映射到宿主机，而是通过Nginx反向代理进行访问。**

## 6.1 启动WordPress容器

在您之前创建的`~/wordpress-nginx-docker-run`目录下，执行以下`docker run`命令来启动WordPress容器：

```bash
docker run \
  --name wordpress-app \
  --network wordpress-network \
  -v ~/wordpress-nginx-docker-run/wordpress_data:/var/www/html \
  -e WORDPRESS_DB_HOST=mysql-db:3306 \
  -e WORDPRESS_DB_USER=wordpress \
  -e WORDPRESS_DB_PASSWORD=wordpress_password \
  -e WORDPRESS_DB_NAME=wordpress_db \
  -d wordpress:latest
```

### 6.1.1 命令参数解析

*   `--name wordpress-app`：为WordPress容器指定一个名称为`wordpress-app`。
*   `--network wordpress-network`：将WordPress容器连接到我们之前创建的`wordpress-network`网络。这使得WordPress容器可以通过`mysql-db`这个服务名称访问MySQL容器，同时Nginx容器也可以通过此网络访问WordPress容器。
*   `-v ~/wordpress-nginx-docker-run/wordpress_data:/var/www/html`：将宿主机上`~/wordpress-nginx-docker-run/wordpress_data`目录绑定挂载到WordPress容器内部的`/var/www/html`路径。这是WordPress的安装路径，用于持久化WordPress的核心文件、主题、插件和上传内容。这样即使容器被删除，数据也不会丢失。
*   `-e WORDPRESS_DB_HOST=mysql-db:3306`：指定WordPress连接数据库的主机和端口。`mysql-db`是MySQL容器的名称（在`wordpress-network`网络中作为主机名），`3306`是MySQL的默认端口。**注意：这里必须使用MySQL容器的名称作为主机名，而不是`localhost`或宿主机IP。**
*   `-e WORDPRESS_DB_USER=wordpress`：WordPress连接数据库的用户名，必须与MySQL容器中创建的用户一致。
*   `-e WORDPRESS_DB_PASSWORD=wordpress_password`：WordPress连接数据库的密码，必须与MySQL容器中创建的密码一致。
*   `-e WORDPRESS_DB_NAME=wordpress_db`：WordPress使用的数据库名称，必须与MySQL容器中创建的数据库名称一致。
*   `-d wordpress:latest`：指定使用`wordpress:latest`镜像启动容器，并在后台（detached mode）运行。

**重要提示**：与之前直接暴露WordPress端口不同，这里我们没有使用`-p`参数将WordPress容器的80端口映射到宿主机。这是因为Nginx反向代理容器已经占用了宿主机的80端口，并负责将外部请求转发到WordPress容器内部的80端口。

## 6.2 验证WordPress容器状态

容器启动后，您可以使用以下命令验证WordPress容器是否正常运行：

1.  **查看运行中的容器**：

```bash
docker ps
```

您应该能看到名为`wordpress-app`的容器处于`Up`状态。

2.  **查看容器日志**：

```bash
docker logs wordpress-app
```

检查日志输出，确保没有错误信息，并且WordPress服务已成功启动。您可能会看到类似“`Apache/2.4.58 (Debian) PHP/8.2.13 Development Server (http://localhost:80) configured -- resuming normal operations`”的启动信息，或者关于数据库连接成功的提示。

至此，WordPress容器已成功启动并连接到MySQL数据库，并通过Docker网络等待Nginx反向代理的请求。接下来，您将通过Nginx访问WordPress进行首次安装配置。


# 7. WordPress配置与访问

在Nginx反向代理容器和WordPress容器都成功启动后，您现在可以通过Nginx的入口访问WordPress进行首次安装配置。本章节将详细指导这些操作。

## 7.1 首次访问WordPress进行安装配置

1.  **打开Web浏览器**：

    在您的宿主机上打开任意Web浏览器（如Chrome, Firefox等）。

2.  **访问WordPress安装页面**：

    在浏览器地址栏输入您的宿主机IP地址或您在Nginx配置中设置的域名。由于Nginx监听宿主机的80端口，因此直接访问即可：

```
http://localhost
```
    或者，如果您是在远程服务器上操作，请替换`localhost`为您的服务器IP地址或域名：

```
http://<您的服务器IP地址或域名>
```

3.  **选择语言**：

    首次访问时，WordPress会提示您选择安装语言。选择您偏好的语言（例如“简体中文”），然后点击“继续”。

4.  **欢迎页面**：

    您将看到WordPress的欢迎页面，提示您需要数据库信息。点击“现在就开始！”。

5.  **数据库连接信息**：

    在数据库连接信息页面，填写以下内容：

    *   **数据库名**：`wordpress_db` (与`docker run`命令中`MYSQL_DATABASE`一致)
    *   **用户名**：`wordpress` (与`docker run`命令中`MYSQL_USER`一致)
    *   **密码**：`wordpress_password` (与`docker run`命令中`MYSQL_PASSWORD`一致)
    *   **数据库主机**：`mysql-db:3306` (这是MySQL容器的名称和端口，在Docker网络中作为主机名)
    *   **表前缀**：`wp_` (保持默认或自定义，不影响功能)

    填写完毕后，点击“提交”。

6.  **运行安装**：

    如果数据库连接成功，您将看到“运行安装”页面。点击“运行安装”。

7.  **站点信息**：

    填写您的站点信息：

    *   **站点标题**：您的网站名称 (例如：`我的Docker Nginx WordPress博客`)
    *   **用户名**：WordPress后台登录用户名 (例如：`admin`)
    *   **密码**：WordPress后台登录密码 (请设置一个强密码并牢记)
    *   **您的电子邮件**：用于接收通知和密码重置 (例如：`your_email@example.com`)
    *   **搜索引擎可见性**：根据需要勾选或取消勾选“建议搜索引擎不索引本站点”（通常在开发阶段勾选，生产环境取消勾选）。

    填写完毕后，点击“安装WordPress”。

8.  **安装成功**：

    安装成功后，您将看到“成功！”页面。点击“登录”即可进入WordPress后台管理界面。

至此，您的WordPress网站已通过纯命令行Docker和Nginx反向代理成功安装并运行。

## 7.2 (可选) 通过MySQL客户端连接数据库

如果您需要直接管理MySQL数据库，可以通过宿主机上的MySQL客户端或Docker容器内的MySQL客户端连接到`mysql-db`容器。

1.  **从宿主机连接 (需要安装MySQL客户端)**：

    **注意**：在我们的配置中，MySQL容器的3306端口并未映射到宿主机，因此无法从宿主机直接访问。更推荐的方式是进入MySQL容器内部进行操作。

2.  **进入MySQL容器内部连接**：

    这是更推荐的方式，可以直接在MySQL容器内部使用其自带的客户端。

```bash
docker exec -it mysql-db mysql -u wordpress -pwordpress_password wordpress_db
```

    进入MySQL命令行后，您可以执行SQL命令来管理数据库，例如：

```sql
SHOW TABLES;
SELECT User, Host FROM mysql.user;
EXIT;
```

    您应该能看到`wordpress_db`数据库和`wordpress`用户。验证完成后，输入`exit`退出MySQL客户端。

通过本章节，您已经完成了WordPress的首次安装和配置，并学会了如何（可选地）通过MySQL客户端管理其底层数据库。


# 8. 数据持久化与备份

对于任何生产环境的应用程序，数据持久化和备份都是至关重要的环节。WordPress作为一个内容管理系统，其核心数据（文章、页面、用户、配置等）存储在MySQL数据库中，而其文件数据（主题、插件、上传的媒体文件等）则存储在文件系统中。Nginx作为反向代理，其配置文件也需要持久化。本章节将回顾我们在`docker run`命令中如何实现数据持久化，并简要介绍备份策略。

## 8.1 数据持久化的重要性

Docker容器的设计理念是轻量级和无状态的。这意味着容器在停止或删除后，其内部写入的所有数据都会丢失。对于WordPress、MySQL和Nginx这类需要存储数据或配置的应用，如果数据不进行持久化，那么每次容器重建或更新都会导致数据丢失或配置重置，这是不可接受的。

Docker提供了**数据卷（Volumes）**机制来解决这个问题。数据卷是宿主机文件系统中的一个特殊目录，它可以被挂载到容器内部的指定路径。数据卷独立于容器的生命周期，即使容器被删除，数据卷中的数据依然存在，从而实现了数据的持久化存储。

## 8.2 WordPress、MySQL和Nginx数据卷配置回顾

在之前的`docker run`命令中，我们通过`-v`参数为WordPress、MySQL和Nginx服务配置了数据持久化：

### 8.2.1 MySQL容器的数据持久化

```bash
docker run \
  # ... 其他参数 ...
  -v ~/wordpress-nginx-docker-run/db_data:/var/lib/mysql \
  # ... 其他参数 ...
  mysql:8.0
```

*   `-v ~/wordpress-nginx-docker-run/db_data:/var/lib/mysql`：这行配置将宿主机上`~/wordpress-nginx-docker-run/db_data`目录（我们在准备工作中创建的）绑定挂载到MySQL容器内部的`/var/lib/mysql`路径。MySQL数据库的所有数据文件（包括`wordpress_db`数据库中的所有表和数据）都将存储在这个宿主机目录中。这确保了数据库数据在MySQL容器被删除或更新后不会丢失。

### 8.2.2 WordPress容器的数据持久化

```bash
docker run \
  # ... 其他参数 ...
  -v ~/wordpress-nginx-docker-run/wordpress_data:/var/www/html \
  # ... 其他参数 ...
  wordpress:latest
```

*   `-v ~/wordpress-nginx-docker-run/wordpress_data:/var/www/html`：这行配置将宿主机上`~/wordpress-nginx-docker-run/wordpress_data`目录绑定挂载到WordPress容器内部的`/var/www/html`路径。WordPress的所有程序文件、主题、插件、上传的媒体文件等都将存储在这个宿主机目录中。这意味着您可以直接在宿主机上访问和管理这些文件，并且在WordPress容器被删除或更新后，这些数据依然会保留。

### 8.2.3 Nginx容器的配置文件持久化

```bash
docker run \
  # ... 其他参数 ...
  -v ~/wordpress-nginx-docker-run/nginx_conf/default.conf:/etc/nginx/conf.d/default.conf:ro \
  # ... 其他参数 ...
  nginx:latest
```

*   `-v ~/wordpress-nginx-docker-run/nginx_conf/default.conf:/etc/nginx/conf.d/default.conf:ro`：这行配置将宿主机上我们创建的`default.conf`文件绑定挂载到Nginx容器内部的`/etc/nginx/conf.d/default.conf`路径。`:ro`表示只读，确保容器不会修改此配置文件。通过这种方式，Nginx的配置得以持久化，即使Nginx容器被删除或重建，其配置也能保持一致。

通过这种方式，我们确保了WordPress网站的所有关键数据和Nginx配置都存储在宿主机的文件系统中，从而实现了数据的持久化。

## 8.3 简要备份策略

尽管数据已经持久化，但为了应对宿主机故障、误操作或数据损坏等情况，定期备份这些持久化数据仍然是必不可少的。以下是一些简单的备份策略：

1.  **备份WordPress文件数据**：

    由于WordPress的文件数据存储在宿主机的`~/wordpress-nginx-docker-run/wordpress_data`目录下，您只需定期备份这个目录即可。可以使用`tar`命令进行打包压缩，并将其存储到安全的位置（例如，远程存储、云存储或另一个物理磁盘）。

```bash
# 停止WordPress容器以确保文件一致性（可选，但推荐）
docker stop wordpress-app

# 备份WordPress文件
tar -czvf wordpress_files_backup_$(date +%Y%m%d).tar.gz ~/wordpress-nginx-docker-run/wordpress_data

# 启动WordPress容器
docker start wordpress-app
```

2.  **备份MySQL数据库数据**：

    备份MySQL数据库的最佳实践是使用`mysqldump`工具。您可以在MySQL容器内部执行`mysqldump`命令，将数据库导出为SQL文件，然后将该文件复制到宿主机进行备份。

```bash
docker exec mysql-db mysqldump -u wordpress -pwordpress_password wordpress_db > ~/wordpress-nginx-docker-run/db_data/wordpress_db_backup_$(date +%Y%m%d).sql

# 此时，备份文件已在宿主机的 ~/wordpress-nginx-docker-run/db_data 目录下
# 您可以进一步将此SQL文件移动或复制到其他备份位置
```

    **注意**：上述`mysqldump`命令中的`wordpress`是数据库用户名，`wordpress_password`是密码，`wordpress_db`是数据库名，这些都应与`docker run`命令中配置的一致。备份文件被直接写入到`db_data`目录，因此它会持久化在宿主机上。

3.  **备份Nginx配置文件**：

    Nginx的配置文件`default.conf`已经存储在宿主机的`~/wordpress-nginx-docker-run/nginx_conf`目录下，因此您只需确保这个目录被包含在您的宿主机备份策略中即可。

4.  **自动化备份**：

    为了确保备份的及时性和可靠性，建议将上述备份命令编写成脚本，并结合`cron`等工具进行自动化调度，实现定期自动备份。

通过实施有效的数据持久化和备份策略，您可以大大提高WordPress网站的健壮性和数据安全性，确保在发生意外情况时能够迅速恢复服务。


# 9. 故障排除与优化

在使用纯命令行Docker部署WordPress并配置Nginx反向代理时，可能会遇到各种问题，例如容器无法启动、端口冲突、数据库连接失败或Nginx代理配置错误等。本章节将提供一些常见的故障排除方法和优化建议，帮助您确保WordPress网站的稳定运行和良好性能。

## 9.1 常见问题及解决方案

### 9.1.1 容器无法启动

当您执行 `docker run` 命令后，如果发现容器没有成功启动，可以按照以下步骤进行排查：

1.  **查看容器日志**：

    这是排查容器启动问题的首要步骤。通过查看容器的日志输出，通常可以找到启动失败的具体原因。

```bash
docker logs <容器名称或ID>
```

    例如，查看MySQL容器的日志：

```bash
docker logs mysql-db
```

    查看WordPress容器的日志：

```bash
docker logs wordpress-app
```

    查看Nginx容器的日志：

```bash
docker logs nginx-proxy
```

    日志中可能会显示配置错误、依赖缺失或权限问题等信息。

2.  **检查端口冲突**：

    如果日志显示端口被占用，可能是宿主机上的其他进程占用了Nginx所需的端口（默认为80）。

    *   **识别占用端口的进程**：

```bash
sudo netstat -tulnp | grep :80
```

    *   **解决方案**：
        *   停止占用端口的进程。
        *   修改Nginx容器的端口映射，例如将Nginx的80端口映射到宿主机的8080端口：

```bash
docker run \
  --name nginx-proxy \
  --network wordpress-network \
  -p 8080:80 \
  -v ~/wordpress-nginx-docker-run/nginx_conf/default.conf:/etc/nginx/conf.d/default.conf:ro \
  -d nginx:latest
```

        修改后，需要先停止并删除旧容器，然后重新启动新容器：

```bash
docker stop nginx-proxy
docker rm nginx-proxy
# 重新执行修改后的 docker run 命令
```

### 9.1.2 数据库连接问题

WordPress网站显示“Error establishing a database connection”（建立数据库连接错误）是常见问题。这通常是由于WordPress容器无法连接到MySQL数据库容器造成的。

1.  **检查环境变量**：

    确保WordPress容器启动命令中的数据库连接环境变量与MySQL容器中创建的数据库信息完全一致。

    *   `WORDPRESS_DB_HOST`：必须是MySQL容器的名称，即`mysql-db`，并包含端口`mysql-db:3306`。
    *   `WORDPRESS_DB_USER`：必须与`MYSQL_USER`一致。
    *   `WORDPRESS_DB_PASSWORD`：必须与`MYSQL_PASSWORD`一致。
    *   `WORDPRESS_DB_NAME`：必须与`MYSQL_DATABASE`一致。

2.  **检查网络连接**：

    确保`wordpress-app`和`mysql-db`容器都连接到同一个Docker网络（例如`wordpress-network`）。您可以通过进入WordPress容器并尝试ping数据库服务来验证网络连通性：

```bash
docker exec -it wordpress-app bash
ping mysql-db
exit
```

    如果`ping mysql-db`失败，则表示网络配置有问题。请检查两个容器是否都使用了`--network wordpress-network`参数。

3.  **检查MySQL服务状态**：

    确保MySQL容器正在运行且没有错误。查看`mysql-db`容器的日志：

```bash
docker logs mysql-db
```

    如果MySQL服务启动失败，WordPress自然无法连接。

### 9.1.3 WordPress权限问题

有时WordPress在安装主题、插件或上传媒体文件时可能会遇到权限问题。

1.  **检查数据卷权限**：

    确保宿主机上`~/wordpress-nginx-docker-run/wordpress_data`目录的权限允许WordPress容器内的用户写入。WordPress容器通常以`www-data`用户运行。

    *   **解决方案**：更改宿主机上`wordpress_data`目录的所有者为Docker容器内WordPress进程的用户ID（通常是33，对应`www-data`用户），或者给予更宽松的权限（不推荐在生产环境使用）。

```bash
sudo chown -R 33:33 ~/wordpress-nginx-docker-run/wordpress_data
# 或者，如果不知道确切UID/GID，可以尝试更宽松的权限（生产环境不推荐）
sudo chmod -R 777 ~/wordpress-nginx-docker-run/wordpress_data
```

### 9.1.4 Nginx反向代理问题

如果Nginx容器正常运行，但无法通过浏览器访问WordPress，或者出现“502 Bad Gateway”等错误，可能是Nginx配置或与WordPress容器的连接问题。

1.  **检查Nginx配置**：

    确保`~/wordpress-nginx-docker-run/nginx_conf/default.conf`文件中的`proxy_pass`指向正确的WordPress容器服务名和端口（`http://wordpress-app:80`）。

2.  **检查Nginx容器日志**：

    查看Nginx容器的日志，通常会显示代理失败的具体原因。

```bash
docker logs nginx-proxy
```

3.  **检查WordPress容器是否可达**：

    进入Nginx容器内部，尝试ping WordPress容器的服务名，确保网络连通性。

```bash
docker exec -it nginx-proxy bash
ping wordpress-app
exit
```

    如果ping失败，检查两个容器是否都连接到`wordpress-network`。

## 9.2 性能优化建议

为了提高Docker化WordPress网站的性能和响应速度，可以考虑以下优化措施：

1.  **使用高性能数据卷**：

    对于生产环境，建议将`wordpress_data`和`db_data`目录放置在SSD硬盘上，以提高文件I/O和数据库读写性能。

2.  **配置WordPress缓存插件**：

    安装并配置WordPress缓存插件（如WP Super Cache, W3 Total Cache, LiteSpeed Cache等），可以显著减少数据库查询和页面生成时间，提高网站加载速度。

3.  **优化MySQL配置**：

    根据您的服务器资源和WordPress网站的负载情况，调整MySQL容器的配置参数（例如`innodb_buffer_pool_size`），以优化数据库性能。这可以通过在`docker run`命令中添加`--mysql-config-file`参数或挂载自定义的`my.cnf`文件来实现。

4.  **使用CDN**：

    对于静态资源（图片、CSS、JavaScript），使用内容分发网络（CDN）可以加快全球用户的访问速度，并减轻服务器负载。

5.  **定期清理Docker资源**：

    定期清理不再使用的Docker镜像、容器和数据卷，可以释放磁盘空间，保持系统整洁。

```bash
docker system prune -a
```

    **注意**：此命令会删除所有停止的容器、未使用的网络、悬空镜像以及所有构建缓存。执行前请确保您了解其影响。

6.  **资源限制**：

    在`docker run`命令中为WordPress、MySQL和Nginx容器设置CPU和内存限制，防止单个容器耗尽宿主机资源，影响其他服务。

```bash
# WordPress容器的资源限制示例
docker run \
  --name wordpress-app \
  --network wordpress-network \
  -v ~/wordpress-nginx-docker-run/wordpress_data:/var/www/html \
  -e WORDPRESS_DB_HOST=mysql-db:3306 \
  -e WORDPRESS_DB_USER=wordpress \
  -e WORDPRESS_DB_PASSWORD=wordpress_password \
  -e WORDPRESS_DB_NAME=wordpress_db \
  --cpus="0.5" \
  --memory="512m" \
  -d wordpress:latest

# MySQL容器的资源限制示例
docker run \
  --name mysql-db \
  --network wordpress-network \
  -v ~/wordpress-nginx-docker-run/db_data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=root_password \
  -e MYSQL_DATABASE=wordpress_db \
  -e MYSQL_USER=wordpress \
  -e MYSQL_PASSWORD=wordpress_password \
  --cpus="0.5" \
  --memory="1g" \
  -d mysql:8.0

# Nginx容器的资源限制示例
docker run \
  --name nginx-proxy \
  --network wordpress-network \
  -p 80:80 \
  -v ~/wordpress-nginx-docker-run/nginx_conf/default.conf:/etc/nginx/conf.d/default.conf:ro \
  --cpus="0.2" \
  --memory="128m" \
  -d nginx:latest
```



# 二、利用docker compose安装
# Docker安装WordPress实验手册 (CentOS 8)

## 1. 引言

### 1.1 WordPress简介

WordPress是一款全球领先的开源内容管理系统（CMS），以其易用性、灵活性和强大的社区支持而闻名。它允许用户轻松创建和管理网站、博客和电子商务平台，无需专业的编程知识。WordPress拥有庞大的主题和插件生态系统，可以满足各种网站建设需求。

### 1.2 Docker与WordPress结合的优势

将WordPress与Docker结合使用，可以带来多方面的优势：

*   **环境一致性**：Docker确保WordPress及其依赖（如MySQL）在任何环境中都能以相同的方式运行，避免了“在我机器上可以运行”的问题。
*   **快速部署**：通过Docker Compose，可以一键部署整个WordPress服务栈，大大简化了安装和配置过程。
*   **资源隔离**：每个服务（WordPress、MySQL）都在独立的容器中运行，相互之间隔离，提高了系统的稳定性和安全性。
*   **易于管理**：Docker Compose提供了一套统一的命令来管理整个应用，包括启动、停止、重启和删除，使得维护工作更加便捷。
*   **数据持久化**：通过数据卷机制，可以确保WordPress网站的数据（包括数据库和文件）在容器生命周期之外得到持久化存储，方便备份和迁移。
*   **可移植性**：整个WordPress应用栈可以作为一个整体轻松地在不同的服务器之间迁移。

### 1.3 实验目的

本实验手册旨在通过详细的步骤和代码示例，指导您在CentOS 8系统上使用Docker Compose部署一个完整的WordPress网站。具体目标包括：

*   **掌握环境准备**：确保CentOS 8系统满足Docker运行要求，并验证Docker和Docker Compose的安装。
*   **学会编写`docker-compose.yml`**：理解WordPress、MySQL和phpMyAdmin服务在Docker Compose中的配置方法。
*   **成功部署WordPress**：通过Docker Compose一键启动WordPress网站，并完成首次安装配置。
*   **理解数据持久化**：掌握数据卷在WordPress和MySQL中的应用，确保数据安全。
*   **了解故障排除与优化**：学习解决常见问题和提升WordPress网站性能的技巧。

通过本手册的学习，您将能够自信地在Docker环境中部署和管理WordPress网站，为您的个人项目或企业应用提供强大的支持。





# 2. 准备工作

在开始使用Docker安装WordPress之前，确保您的系统环境已正确配置是至关重要的一步。本章节将指导您检查系统要求、验证Docker和Docker Compose的安装，并创建必要的项目目录。

## 2.1 系统要求与Docker环境验证

本实验手册假设您正在使用 **CentOS 8** 操作系统。为了顺利运行WordPress及其依赖服务（如MySQL），您的系统应满足以下基本要求：

*   **操作系统**：CentOS 8 (或兼容的RHEL 8发行版)。
*   **内存**：建议至少2GB RAM，以确保WordPress和MySQL容器能够稳定运行。
*   **磁盘空间**：建议至少20GB可用磁盘空间，用于存储Docker镜像、容器数据以及WordPress文件。
*   **网络连接**：确保系统可以访问互联网，以便拉取Docker镜像。

此外，您需要确保系统上已正确安装并配置了Docker Engine和Docker Compose。如果您尚未安装，请参考上一份实验手册《Docker实验手册 (CentOS 8)》中的“Docker安装与配置”章节进行安装和配置，特别是要确保配置了国内镜像加速，以提高镜像拉取速度。

您可以通过以下命令验证Docker Engine和Docker Compose的安装情况：

1.  **验证Docker Engine**：

```bash
docker version
```

    如果Docker Engine已正确安装，此命令将显示Docker客户端和服务器的版本信息。请确保服务器版本（Server Version）存在。

2.  **验证Docker Compose**：

```bash
docker compose version
```

    如果Docker Compose已正确安装，此命令将显示Docker Compose的版本信息。请注意，新版本的Docker Compose作为Docker CLI的插件，命令是`docker compose`（无连字符）。

## 2.2 创建项目目录

为了更好地组织WordPress项目文件和Docker Compose配置，建议为您的WordPress安装创建一个独立的目录。这个目录将包含`docker-compose.yml`文件以及WordPress和MySQL的数据持久化目录。

1.  **创建主项目目录**：

```bash
mkdir ~/wordpress-docker
cd ~/wordpress-docker
```

    此命令将在您的用户主目录下创建一个名为`wordpress-docker`的目录，并进入该目录。所有后续的操作都将在此目录下进行。

2.  **创建数据持久化目录**：

    为了确保WordPress和MySQL的数据在容器重建后不会丢失，我们将使用数据卷进行持久化。虽然Docker Compose会自动创建匿名数据卷，但为了方便管理和备份，我们通常会创建具名数据卷或绑定挂载宿主机目录。在这里，我们先创建两个用于绑定挂载的目录，以便后续配置数据卷时使用。

```bash
mkdir ./wordpress_data
mkdir ./db_data
```

    *   `./wordpress_data`：将用于存储WordPress的程序文件、主题、插件和上传内容。
    *   `./db_data`：将用于存储MySQL数据库的数据文件。

完成以上准备工作后，您的系统已为使用Docker Compose部署WordPress做好了充分准备。接下来，我们将开始编写`docker-compose.yml`文件来定义WordPress服务栈。





# 3. 使用Docker Compose安装WordPress

Docker Compose是部署多容器应用程序的强大工具，它允许您通过一个YAML文件定义和管理WordPress及其依赖服务（如MySQL数据库）。本章节将指导您编写`docker-compose.yml`文件，并使用它来启动WordPress应用。

## 3.1 `docker-compose.yml` 文件编写

在您之前创建的`~/wordpress-docker`目录下，创建一个名为`docker-compose.yml`的文件。此文件将定义WordPress、MySQL以及可选的phpMyAdmin服务。

```bash
cd ~/wordpress-docker
cat <<EOF > docker-compose.yml
version: '3.8'

services:
  wordpress:
    image: wordpress:latest
    ports:
      - "80:80"
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress_password
      WORDPRESS_DB_NAME: wordpress_db
    volumes:
      - ./wordpress_data:/var/www/html
    depends_on:
      - db
    restart: always
    networks:
      - wordpress-network

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: wordpress_db
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress_password
    volumes:
      - ./db_data:/var/lib/mysql
    restart: always
    networks:
      - wordpress-network

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    ports:
      - "8080:80"
    environment:
      PMA_HOST: db
      MYSQL_ROOT_PASSWORD: root_password
    depends_on:
      - db
    restart: always
    networks:
      - wordpress-network

networks:
  wordpress-network:
    driver: bridge

volumes:
  wordpress_data:
  db_data:
EOF
```

## 3.2 文件说明与配置项解析

上述`docker-compose.yml`文件定义了三个服务：`wordpress`、`db`（MySQL数据库）和`phpmyadmin`，以及一个自定义网络和两个数据卷。

### 3.2.1 `wordpress` 服务

*   **`image: wordpress:latest`**：使用Docker Hub上官方提供的最新版WordPress镜像 [3]。
*   **`ports: - "80:80"`**：将宿主机的80端口映射到WordPress容器的80端口，这样可以通过宿主机的IP地址或域名访问WordPress。
*   **`environment`**：设置WordPress连接MySQL数据库所需的环境变量。这些变量必须与`db`服务中定义的数据库信息一致。
    *   `WORDPRESS_DB_HOST: db`：指定数据库主机名为`db`，这是Docker Compose网络中MySQL服务的服务名称。
    *   `WORDPRESS_DB_USER: wordpress`：WordPress连接数据库的用户名。
    *   `WORDPRESS_DB_PASSWORD: wordpress_password`：WordPress连接数据库的密码。
    *   `WORDPRESS_DB_NAME: wordpress_db`：WordPress使用的数据库名称。
*   **`volumes: - ./wordpress_data:/var/www/html`**：将宿主机当前目录下的`wordpress_data`目录绑定挂载到容器内的`/var/www/html`目录。这是WordPress的安装路径，用于持久化WordPress的核心文件、主题、插件和上传内容。这样即使容器被删除，数据也不会丢失。
*   **`depends_on: - db`**：声明`wordpress`服务依赖于`db`服务。这意味着`db`服务会先于`wordpress`服务启动。
*   **`restart: always`**：设置容器的重启策略为`always`，即无论容器因何种原因停止，都会自动重启。
*   **`networks: - wordpress-network`**：将`wordpress`服务连接到名为`wordpress-network`的自定义网络。

### 3.2.2 `db` 服务 (MySQL数据库)

*   **`image: mysql:8.0`**：使用Docker Hub上官方提供的MySQL 8.0镜像 [4]。
*   **`environment`**：设置MySQL数据库的环境变量，用于初始化数据库和创建用户。
    *   `MYSQL_ROOT_PASSWORD: root_password`：MySQL的root用户密码。
    *   `MYSQL_DATABASE: wordpress_db`：要创建的数据库名称，与WordPress服务中配置的数据库名称一致。
    *   `MYSQL_USER: wordpress`：要创建的数据库用户，与WordPress服务中配置的用户名一致。
    *   `MYSQL_PASSWORD: wordpress_password`：要创建的数据库用户密码，与WordPress服务中配置的密码一致。
*   **`volumes: - ./db_data:/var/lib/mysql`**：将宿主机当前目录下的`db_data`目录绑定挂载到容器内的`/var/lib/mysql`路径。这是MySQL存储数据的地方，用于持久化数据库内容。
*   **`restart: always`**：设置容器的重启策略为`always`。
*   **`networks: - wordpress-network`**：将`db`服务连接到名为`wordpress-network`的自定义网络。

### 3.2.3 `phpmyadmin` 服务 (可选)

*   **`image: phpmyadmin/phpmyadmin`**：使用Docker Hub上官方提供的phpMyAdmin镜像 [5]，这是一个用于管理MySQL数据库的Web界面工具。
*   **`ports: - "8080:80"`**：将宿主机的8080端口映射到phpMyAdmin容器的80端口，这样可以通过`http://宿主机IP:8080`访问phpMyAdmin。
*   **`environment`**：设置phpMyAdmin连接MySQL数据库所需的环境变量。
    *   `PMA_HOST: db`：指定phpMyAdmin连接的数据库主机名为`db`。
    *   `MYSQL_ROOT_PASSWORD: root_password`：phpMyAdmin连接MySQL时使用的root用户密码。
*   **`depends_on: - db`**：声明`phpmyadmin`服务依赖于`db`服务。
*   **`restart: always`**：设置容器的重启策略为`always`。
*   **`networks: - wordpress-network`**：将`phpmyadmin`服务连接到名为`wordpress-network`的自定义网络。

### 3.2.4 `networks` 和 `volumes` 部分

*   **`networks: wordpress-network:`**：定义了一个名为`wordpress-network`的自定义桥接网络。所有连接到此网络的容器都可以通过服务名称相互通信，例如WordPress容器可以通过`db`这个名称访问MySQL容器。
*   **`volumes: wordpress_data:` 和 `db_data:`**：定义了两个具名数据卷。虽然我们在这里使用了绑定挂载，但声明这些数据卷有助于Docker Compose管理它们的生命周期，并在某些情况下提供更好的抽象。实际上，由于我们使用了 `./wordpress_data` 和 `./db_data` 进行绑定挂载，这些具名数据卷的声明在这里主要是为了完整性，实际数据将存储在宿主机对应的目录下。

## 3.3 启动WordPress应用

在`docker-compose.yml`文件所在的`~/wordpress-docker`目录下，执行以下命令来启动WordPress应用程序栈：

```bash
docker compose up -d
```

*   `-d` 或 `--detach`：表示在后台运行容器，这样您可以在终端继续执行其他命令。

执行此命令后，Docker Compose将执行以下操作：

1.  检查`wordpress`、`mysql`和`phpmyadmin`镜像是否存在。如果不存在，将从Docker Hub拉取它们。
2.  创建`wordpress-network`网络。
3.  启动`db`服务（MySQL容器）。
4.  启动`wordpress`服务（WordPress容器）。
5.  启动`phpmyadmin`服务（phpMyAdmin容器）。
6.  将宿主机的80端口映射到WordPress容器的80端口，将宿主机的8080端口映射到phpMyAdmin容器的80端口。

您可以使用以下命令查看所有服务的运行状态：

```bash
docker compose ps
```

如果所有服务都显示为`Up`状态，则表示WordPress应用程序已成功启动。



# 4. WordPress配置与访问

在Docker Compose成功启动WordPress服务栈后，您可以通过Web浏览器访问WordPress进行首次安装配置，并可选地通过phpMyAdmin管理数据库。本章节将详细指导这些操作。

## 4.1 首次访问WordPress进行安装配置

1.  **打开Web浏览器**：

    在您的宿主机上打开任意Web浏览器（如Chrome, Firefox等）。

2.  **访问WordPress安装页面**：

    在浏览器地址栏输入您的宿主机IP地址或`localhost`。由于我们在`docker-compose.yml`中将宿主机的80端口映射到了WordPress容器的80端口，因此直接访问即可：

```
http://localhost
```
    或者，如果您是在远程服务器上操作，请替换`localhost`为您的服务器IP地址：

```
http://<您的服务器IP地址>
```

3.  **选择语言**：

    首次访问时，WordPress会提示您选择安装语言。选择您偏好的语言（例如“简体中文”），然后点击“继续”。

4.  **欢迎页面**：

    您将看到WordPress的欢迎页面，提示您需要数据库信息。点击“现在就开始！”。

5.  **数据库连接信息**：

    在数据库连接信息页面，填写以下内容：

    *   **数据库名**：`wordpress_db` (与`docker-compose.yml`中`MYSQL_DATABASE`一致)
    *   **用户名**：`wordpress` (与`docker-compose.yml`中`MYSQL_USER`一致)
    *   **密码**：`wordpress_password` (与`docker-compose.yml`中`MYSQL_PASSWORD`一致)
    *   **数据库主机**：`db` (这是Docker Compose网络中MySQL服务的服务名称)
    *   **表前缀**：`wp_` (保持默认或自定义，不影响功能)

    填写完毕后，点击“提交”。

6.  **运行安装**：

    如果数据库连接成功，您将看到“运行安装”页面。点击“运行安装”。

7.  **站点信息**：

    填写您的站点信息：

    *   **站点标题**：您的网站名称 (例如：`我的Docker WordPress博客`)
    *   **用户名**：WordPress后台登录用户名 (例如：`admin`)
    *   **密码**：WordPress后台登录密码 (请设置一个强密码并牢记)
    *   **您的电子邮件**：用于接收通知和密码重置 (例如：`your_email@example.com`)
    *   **搜索引擎可见性**：根据需要勾选或取消勾选“建议搜索引擎不索引本站点”（通常在开发阶段勾选，生产环境取消勾选）。

    填写完毕后，点击“安装WordPress”。

8.  **安装成功**：

    安装成功后，您将看到“成功！”页面。点击“登录”即可进入WordPress后台管理界面。

至此，您的WordPress网站已通过Docker Compose成功安装并运行。

## 4.2 (可选) 访问phpMyAdmin管理数据库

如果您在`docker-compose.yml`中包含了phpMyAdmin服务，您可以通过Web浏览器访问它来管理WordPress的数据库。

1.  **打开Web浏览器**：

    在您的宿主机上打开任意Web浏览器。

2.  **访问phpMyAdmin**：

    在浏览器地址栏输入您的宿主机IP地址或`localhost`，并加上phpMyAdmin映射的端口号（默认为8080）：

```
http://localhost:8080
```
    或者，如果您是在远程服务器上操作，请替换`localhost`为您的服务器IP地址：

```
http://<您的服务器IP地址>:8080
```

3.  **登录phpMyAdmin**：

    在phpMyAdmin登录页面，填写以下内容：

    *   **用户名**：`root` (这是MySQL的root用户)
    *   **密码**：`root_password` (与`docker-compose.yml`中`MYSQL_ROOT_PASSWORD`一致)

    填写完毕后，点击“登录”。

4.  **管理数据库**：

    登录成功后，您将看到phpMyAdmin的管理界面。在左侧导航栏中，您可以找到`wordpress_db`数据库，并可以查看、编辑其中的表和数据。这对于数据库的调试和管理非常有用。

通过本章节，您已经完成了WordPress的首次安装和配置，并学会了如何使用phpMyAdmin管理其底层数据库。



# 5. 数据持久化与备份

对于任何生产环境的应用程序，数据持久化和备份都是至关重要的环节。WordPress作为一个内容管理系统，其核心数据（文章、页面、用户、配置等）存储在MySQL数据库中，而其文件数据（主题、插件、上传的媒体文件等）则存储在文件系统中。本章节将回顾我们在`docker-compose.yml`中如何实现数据持久化，并简要介绍备份策略。

## 5.1 数据持久化的重要性

Docker容器的设计理念是轻量级和无状态的。这意味着容器在停止或删除后，其内部写入的所有数据都会丢失。对于WordPress和MySQL这类需要存储数据的应用，如果数据不进行持久化，那么每次容器重建或更新都会导致数据丢失，这是不可接受的。

Docker提供了**数据卷（Volumes）**机制来解决这个问题。数据卷是宿主机文件系统中的一个特殊目录，它可以被挂载到容器内部的指定路径。数据卷独立于容器的生命周期，即使容器被删除，数据卷中的数据依然存在，从而实现了数据的持久化存储。

## 5.2 WordPress和MySQL数据卷配置回顾

在`docker-compose.yml`文件中，我们通过`volumes`配置项为WordPress和MySQL服务配置了数据持久化：

```yaml
services:
  wordpress:
    # ... 其他配置 ...
    volumes:
      - ./wordpress_data:/var/www/html
    # ... 其他配置 ...

  db:
    # ... 其他配置 ...
    volumes:
      - ./db_data:/var/lib/mysql
    # ... 其他配置 ...
```

*   **WordPress数据持久化**：
    *   `./wordpress_data:/var/www/html`：这行配置将宿主机上`~/wordpress-docker/wordpress_data`目录（我们在准备工作中创建的）绑定挂载到WordPress容器内部的`/var/www/html`路径。WordPress的所有程序文件、主题、插件、上传的媒体文件等都将存储在这个宿主机目录中。这意味着您可以直接在宿主机上访问和管理这些文件，并且在WordPress容器被删除或更新后，这些数据依然会保留。

*   **MySQL数据持久化**：
    *   `./db_data:/var/lib/mysql`：这行配置将宿主机上`~/wordpress-docker/db_data`目录绑定挂载到MySQL容器内部的`/var/lib/mysql`路径。MySQL数据库的所有数据文件（包括`wordpress_db`数据库中的所有表和数据）都将存储在这个宿主机目录中。同样，这确保了数据库数据在MySQL容器被删除或更新后不会丢失。

通过这种方式，我们确保了WordPress网站的所有关键数据都存储在宿主机的文件系统中，从而实现了数据的持久化。

## 5.3 简要备份策略

尽管数据已经持久化，但为了应对宿主机故障、误操作或数据损坏等情况，定期备份这些持久化数据仍然是必不可少的。以下是一些简单的备份策略：

1.  **备份WordPress文件数据**：

    由于WordPress的文件数据存储在宿主机的`~/wordpress-docker/wordpress_data`目录下，您只需定期备份这个目录即可。可以使用`tar`命令进行打包压缩，并将其存储到安全的位置（例如，远程存储、云存储或另一个物理磁盘）。

```bash
# 停止WordPress容器以确保文件一致性（可选，但推荐）
docker compose stop wordpress

# 备份WordPress文件
tar -czvf wordpress_files_backup_$(date +%Y%m%d).tar.gz ~/wordpress-docker/wordpress_data

# 启动WordPress容器
docker compose start wordpress
```

2.  **备份MySQL数据库数据**：

    备份MySQL数据库的最佳实践是使用`mysqldump`工具。您可以在MySQL容器内部执行`mysqldump`命令，将数据库导出为SQL文件，然后将该文件复制到宿主机进行备份。

```bash
# 在MySQL容器内部执行mysqldump命令
docker exec db mysqldump -u wordpress -pwordpress_password wordpress_db > ~/wordpress-docker/db_data/wordpress_db_backup_$(date +%Y%m%d).sql

# 此时，备份文件已在宿主机的 ~/wordpress-docker/db_data 目录下
# 您可以进一步将此SQL文件移动或复制到其他备份位置
```

    **注意**：上述`mysqldump`命令中的`wordpress`是数据库用户名，`wordpress_password`是密码，`wordpress_db`是数据库名，这些都应与`docker-compose.yml`中配置的一致。备份文件被直接写入到`db_data`目录，因此它会持久化在宿主机上。

3.  **自动化备份**：

    为了确保备份的及时性和可靠性，建议将上述备份命令编写成脚本，并结合`cron`等工具进行自动化调度，实现定期自动备份。

通过实施有效的数据持久化和备份策略，您可以大大提高WordPress网站的健壮性和数据安全性，确保在发生意外情况时能够迅速恢复服务。



# 6. 故障排除与优化

在使用Docker部署WordPress时，可能会遇到各种问题，例如容器无法启动、端口冲突或数据库连接失败等。本章节将提供一些常见的故障排除方法和优化建议，帮助您确保WordPress网站的稳定运行和良好性能。

## 6.1 常见问题及解决方案

### 6.1.1 容器无法启动

当您执行 `docker compose up -d` 后，如果发现某些服务没有成功启动，可以按照以下步骤进行排查：

1.  **查看服务日志**：

    这是排查容器启动问题的首要步骤。通过查看容器的日志输出，通常可以找到启动失败的具体原因。

```bash
docker compose logs <服务名称>
```

    例如，查看WordPress服务的日志：

```bash
docker compose logs wordpress
```

    查看数据库服务的日志：

```bash
docker compose logs db
```

    日志中可能会显示配置错误、依赖缺失或权限问题等信息。

2.  **检查端口冲突**：

    如果日志显示端口被占用，可能是宿主机上的其他进程占用了WordPress或phpMyAdmin所需的端口（默认为80和8080）。

    *   **识别占用端口的进程**：

```bash
sudo netstat -tulnp | grep :80
sudo netstat -tulnp | grep :8080
```

    *   **解决方案**：
        *   停止占用端口的进程。
        *   修改`docker-compose.yml`文件中WordPress或phpMyAdmin服务的端口映射，例如将WordPress的80端口映射到宿主机的8081端口：

```yaml
wordpress:
  ports:
    - "8081:80"
```

        修改后，需要重新构建并启动服务：

```bash
docker compose up -d --build
```

3.  **检查`docker-compose.yml`文件语法**：

    YAML文件对格式和缩进非常敏感。即使是很小的语法错误也可能导致服务无法启动。

    *   **验证语法**：

```bash
docker compose config --quiet
```

        如果命令没有输出任何内容，则表示`docker-compose.yml`文件语法正确。如果有错误，它会打印出详细的错误信息。

    *   **解决方案**：根据错误信息修正`docker-compose.yml`文件中的语法错误。

### 6.1.2 数据库连接问题

WordPress网站显示“Error establishing a database connection”（建立数据库连接错误）是常见问题。这通常是由于WordPress容器无法连接到MySQL数据库容器造成的。

1.  **检查环境变量**：

    确保`wordpress`服务中的数据库连接环境变量与`db`服务中的MySQL配置完全一致。

    *   `WORDPRESS_DB_HOST`：必须是MySQL服务的服务名称，即`db`。
    *   `WORDPRESS_DB_USER`：必须与`MYSQL_USER`一致。
    *   `WORDPRESS_DB_PASSWORD`：必须与`MYSQL_PASSWORD`一致。
    *   `WORDPRESS_DB_NAME`：必须与`MYSQL_DATABASE`一致。

2.  **检查网络连接**：

    确保`wordpress`和`db`服务都连接到同一个Docker网络（例如`wordpress-network`）。您可以通过进入WordPress容器并尝试ping数据库服务来验证网络连通性：

```bash
docker exec -it <wordpress容器ID或名称> bash
ping db
exit
```

    如果`ping db`失败，则表示网络配置有问题。

3.  **检查MySQL服务状态**：

    确保MySQL容器正在运行且没有错误。查看`db`服务的日志：

```bash
docker compose logs db
```

    如果MySQL服务启动失败，WordPress自然无法连接。

### 6.1.3 WordPress权限问题

有时WordPress在安装主题、插件或上传媒体文件时可能会遇到权限问题。

1.  **检查数据卷权限**：

    确保宿主机上`~/wordpress-docker/wordpress_data`目录的权限允许WordPress容器内的用户写入。WordPress容器通常以`www-data`用户运行。

    *   **解决方案**：更改宿主机上`wordpress_data`目录的所有者为Docker容器内WordPress进程的用户ID（通常是33，对应`www-data`用户），或者给予更宽松的权限（不推荐在生产环境使用）。

```bash
sudo chown -R 33:33 ~/wordpress-docker/wordpress_data
# 或者，如果不知道确切UID/GID，可以尝试更宽松的权限（生产环境不推荐）
sudo chmod -R 777 ~/wordpress-docker/wordpress_data
```

## 6.2 性能优化建议

为了提高Docker化WordPress网站的性能和响应速度，可以考虑以下优化措施：

1.  **使用高性能数据卷**：

    对于生产环境，建议将`wordpress_data`和`db_data`目录放置在SSD硬盘上，以提高文件I/O和数据库读写性能。

2.  **配置WordPress缓存插件**：

    安装并配置WordPress缓存插件（如WP Super Cache, W3 Total Cache, LiteSpeed Cache等），可以显著减少数据库查询和页面生成时间，提高网站加载速度。

3.  **优化MySQL配置**：

    根据您的服务器资源和WordPress网站的负载情况，调整MySQL容器的配置参数（例如`innodb_buffer_pool_size`），以优化数据库性能。这可以通过在`docker-compose.yml`中为`db`服务添加`command`或`config`文件挂载来实现。

4.  **使用CDN**：

    对于静态资源（图片、CSS、JavaScript），使用内容分发网络（CDN）可以加快全球用户的访问速度，并减轻服务器负载。

5.  **定期清理Docker资源**：

    定期清理不再使用的Docker镜像、容器和数据卷，可以释放磁盘空间，保持系统整洁。

```bash
docker system prune -a
```

    **注意**：此命令会删除所有停止的容器、未使用的网络、悬空镜像以及所有构建缓存。执行前请确保您了解其影响。

6.  **资源限制**：

    在`docker-compose.yml`中为WordPress和MySQL服务设置CPU和内存限制，防止单个容器耗尽宿主机资源，影响其他服务。

```yaml
wordpress:
  # ...
  deploy:
    resources:
      limits:
        cpus: '0.5'
        memory: 512M

db:
  # ...
  deploy:
    resources:
      limits:
        cpus: '0.5'
        memory: 1G
```

通过掌握这些故障排除技巧和性能优化建议，您将能够更有效地管理和维护您的Docker化WordPress网站，确保其稳定、高效地运行。





# 7. 总结与展望

本实验手册详细介绍了如何在CentOS 8系统上，利用Docker Compose快速、高效地部署WordPress网站。通过本次实验，您应该已经掌握了以下关键技能和概念：

*   **环境准备**：了解了Docker化WordPress的系统要求，并学会了验证Docker和Docker Compose的安装。
*   **Docker Compose应用**：掌握了`docker-compose.yml`文件的编写，理解了如何定义WordPress、MySQL和phpMyAdmin服务，以及如何配置网络和数据卷。
*   **WordPress安装与配置**：成功启动了WordPress服务栈，并通过Web界面完成了WordPress的首次安装和基本配置。
*   **数据持久化**：深入理解了数据卷在Docker环境中实现数据持久化的重要性，并回顾了WordPress和MySQL数据卷的配置。
*   **故障排除与优化**：学习了如何诊断和解决常见的Docker和WordPress部署问题，并获得了一些性能优化的建议。

通过Docker Compose部署WordPress，不仅简化了部署流程，还提供了环境隔离、易于管理和高度可移植性等诸多优势。这使得WordPress网站的开发、测试和生产环境能够保持高度一致，大大提高了工作效率和系统稳定性。

## 7.1 展望

Docker和容器技术在Web应用部署领域正发挥着越来越重要的作用。未来，您可以进一步探索以下方向，以提升您的Docker和WordPress应用水平：

*   **HTTPS配置**：为您的WordPress网站配置SSL/TLS证书，实现HTTPS加密访问，提高网站安全性。这通常可以通过Nginx反向代理容器结合Let\'s Encrypt实现。
*   **负载均衡与高可用**：在生产环境中，可以考虑使用Docker Swarm或Kubernetes等容器编排工具，实现WordPress网站的负载均衡和高可用性，以应对高并发访问。
*   **CI/CD集成**：将Docker化WordPress的部署流程集成到持续集成/持续部署（CI/CD）管道中，实现自动化测试和部署。
*   **性能监控**：利用Prometheus、Grafana等监控工具，对WordPress容器的性能指标进行实时监控，及时发现并解决潜在问题。
*   **自定义镜像**：根据特定需求，创建自定义的WordPress或MySQL Docker镜像，预装常用插件、主题或优化配置。
