## 一、项目背景（企业真实场景）
**项目名称**：XX科技有限公司 官方网站搭建
**环境**：阿里云ECS（Ubuntu 22.04 LTS）
**业务需求**：
- 搭建企业官网，支持后台管理、文章发布、产品展示
- 使用容器化部署（Docker），便于迁移、扩容、维护
- 数据持久化，保证服务器重启/容器重建数据不丢失
- 生产级稳定性、安全、可运维
- 架构简单可靠，运维成本低

**架构方案**：
> ECS（Ubuntu22.04）+ Docker + Docker Compose  
> → MySQL 8.0（数据库）  
> → WordPress（Web服务）  
> → 自定义网桥、数据持久化、自启动、安全密码

---

# 二、服务器信息（企业真实格式）
- 系统：Ubuntu 22.04 LTS
- 位置：阿里云上海可用区
- 配置：2核 4GB（企业生产最低标准）
- 公网IP：假设 `120.xx.xx.xx`
- 管理员：运维部
- 部署方式：**容器化标准化部署**

---

# 三、实施步骤（企业标准操作流程 SOP）

## 步骤1：登录服务器，系统初始化（企业必做）
```bash
sudo apt update
sudo apt upgrade -y
```
**作用**：更新系统源、安全补丁，保证生产环境稳定。

## 步骤2：安装官方 Docker（企业不使用自带旧版docker.io）
```bash
curl -fsSL https://get.docker.com | sudo bash
```

设置开机自启、启动服务：
```bash
sudo systemctl enable docker
sudo systemctl start docker
```

检查：
```bash
docker --version
```

## 步骤3：安装 Docker Compose Plugin（企业v2版本）
```bash
sudo apt install docker-compose-plugin -y
```

检查：
```bash
docker compose version
```

---

# 步骤4：创建企业规范目录（生产必须标准化）
企业不会随便乱放文件，统一路径：
```bash
sudo mkdir -p /data/project/wordpress
cd /data/project/wordpress
```

目录规划：
- `/data/project/wordpress` 项目根目录
- `mysql/` 数据库数据（持久化）
- `html/` 网站程序文件
- `compose.yaml` 部署配置文件

---

# 步骤5：编写生产级 compose.yaml（核心交付件）
```bash
sudo nano compose.yaml
```

## 企业正式配置（完全可上线）
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: wp-mysql
    restart: always
    volumes:
      - ./mysql:/var/lib/mysql
    environment:
      MYSQL_ROOT_PASSWORD: Root@2026#xx
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wp_user
      MYSQL_PASSWORD: Wp@2026#xx
    networks:
      - wp_network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  wordpress:
    image: wordpress:latest
    container_name: wp-web
    restart: always
    depends_on:
      - mysql
    ports:
      - "80:80"
    volumes:
      - ./html:/var/www/html
    environment:
      WORDPRESS_DB_HOST: mysql:3306
      WORDPRESS_DB_USER: wp_user
      WORDPRESS_DB_PASSWORD: Wp@2026#xx
      WORDPRESS_DB_NAME: wordpress
    networks:
      - wp_network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  wp_network:
    driver: bridge
```

## 企业级要点解释（非常重要，可写进报告）
1. **MySQL 8.0**：企业生产标准，不再使用5.7
2. **restart: always**：故障自动恢复，生产高可用
3. **自定义网桥 wp_network**：容器间安全隔离通信
4. **普通用户 wp_user**：禁止程序用root连接数据库（安全规范）
5. **强密码**：企业密码策略（大小写+数字+符号）
6. **volumes 持久化**：数据落地宿主机，容器删除数据不丢
7. **日志限制**：防止日志占满磁盘（生产必备）

---

# 步骤6：启动服务（企业标准部署命令）
```bash
sudo docker compose up -d
```

输出类似：
```
Pulling mysql ... done
Pulling wordpress ... done
Creating wp-mysql ... done
Creating wp-web   ... done
```

**解释**：
- 自动下载官方镜像
- 创建容器、网络、数据目录
- 后台静默运行（生产标准）

查看运行状态：
```bash
sudo docker compose ps
```

显示如下即为**企业环境正常上线**：
```
NAME      STATUS  PORTS
wp-mysql  Up      3306/tcp
wp-web    Up      0.0.0.0:80->80/tcp
```

---

# 步骤7：阿里云安全组配置（企业必须操作）
开放 80 端口，否则外网无法访问：
- 方向：入方向
- 协议：TCP
- 端口：80
- 对象：0.0.0.0/0

这是**企业上线必备的网络策略**。

---

# 步骤8：Web 初始化安装（企业上线流程）
浏览器访问：
```
http://120.xx.xx.xx
```

按照企业规范设置：
- 网站标题：XX科技有限公司官网
- 管理员用户名：**不能用 admin**（企业安全），例如 `xxadmin`
- 高强度密码
- 企业邮箱

安装完成 → 进入后台：
```
http://IP/wp-admin
```

---

# 四、企业运维规范（必写案例内容）
## 1. 日常管理
```bash
docker compose stop      # 停止
docker compose start     # 启动
docker compose restart   # 重启
docker compose down      # 销毁容器（数据不删）
docker compose up -d     # 重新启动
```

## 2. 数据库备份（企业每日必备）
```bash
docker exec wp-mysql mysqldump -uwp_user -p'Wp@2026#xx' wordpress > backup_$(date +%Y%m%d).sql
```

## 3. 日志查看
```bash
docker compose logs -f
```

---

