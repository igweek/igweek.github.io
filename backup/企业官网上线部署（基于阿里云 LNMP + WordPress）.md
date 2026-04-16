

## 实验项目

**企业官网上线部署（基于阿里云 LNMP + WordPress）**

---

# 一、项目背景（企业真实场景）

某中小型企业“华启科技有限公司”计划上线官方网站，用于：

* 展示公司业务与产品
* 发布新闻公告
* 提供客户咨询入口

公司当前情况：

* 无自建机房，全部采用云计算资源
* 技术团队规模较小（1–2人）
* 需要低成本、快速上线、易维护的解决方案

技术选型：

* 云平台：阿里云
* 计算资源：阿里云 ECS
* 架构：LNMP（Linux + Nginx + MySQL + PHP）
* 应用系统：WordPress

---

# 二、实验目标

通过本实验，完成以下能力培养：

1. 掌握云服务器基础配置方法
2. 掌握 LNMP 环境搭建流程
3. 掌握 WordPress 网站部署方法
4. 理解企业网站上线的完整流程

---

# 三、实验环境

| 项目   | 配置                     |
| ---- | ---------------------- |
| 操作系统 | Ubuntu 22.04           |
| 云服务器 | 1台 ECS（公网IP）           |
| 网络   | 安全组开放 22 / 80 / 443    |
| 工具   | SSH（Xshell / Terminal） |

---

# 四、实验任务

## 任务1：服务器初始化

连接服务器：

```bash
ssh root@公网IP
```

更新系统：

```bash
apt update && apt upgrade -y
```

---

## 任务2：部署 Web 服务（Nginx）

安装：

```bash
apt install nginx -y
```

启动并设置开机自启：

```bash
systemctl start nginx
systemctl enable nginx
```

验证：浏览器访问公网IP

---

## 任务3：部署数据库（MySQL）

安装：

```bash
apt install mysql-server -y
```

初始化安全配置：

```bash
mysql_secure_installation
```

创建数据库：

```sql
CREATE DATABASE wordpress DEFAULT CHARACTER SET utf8mb4;

CREATE USER 'wpuser'@'localhost' IDENTIFIED BY '123456@Abc';

GRANT ALL PRIVILEGES ON wordpress.* TO 'wpuser'@'localhost';

FLUSH PRIVILEGES;
```

---

## 任务4：部署 PHP 环境

安装：

```bash
apt install php-fpm php-mysql php-cli php-curl php-gd php-mbstring php-xml php-zip -y
```

启动服务：

```bash
systemctl start php8.1-fpm
systemctl enable php8.1-fpm
```

---

## 任务5：部署 WordPress 程序

下载：

```bash
cd /var/www
wget https://wordpress.org/latest.tar.gz
tar -xvf latest.tar.gz
mv wordpress website
```

设置权限：

```bash
chown -R www-data:www-data /var/www/website
chmod -R 755 /var/www/website
```

配置数据库连接：

```bash
cd /var/www/website
cp wp-config-sample.php wp-config.php
nano wp-config.php
```

修改内容：

```php
define('DB_NAME', 'wordpress');
define('DB_USER', 'wpuser');
define('DB_PASSWORD', '123456@Abc');
define('DB_HOST', 'localhost');
```

---

## 任务6：配置 Nginx 虚拟主机

创建配置文件：

```bash
nano /etc/nginx/sites-available/website
```

写入：

```nginx
server {
    listen 80;
    server_name 公网IP;

    root /var/www/website;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.1-fpm.sock;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

启用站点：

```bash
ln -s /etc/nginx/sites-available/website /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 任务7：网站初始化

浏览器访问：

```
http://公网IP
```

完成 WordPress 安装：

* 设置站点名称（华启科技官网）
* 创建管理员账号
* 设置密码

---

# 五、实验验收标准

学生需完成以下成果：

1. 网站可正常访问
2. 能进入 WordPress 后台
3. 能发布一篇文章（例如“公司简介”）
4. 页面无报错（502 / 403 / 数据库错误）


