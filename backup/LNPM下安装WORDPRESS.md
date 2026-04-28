
## 🧱 一、安装 LNMP 环境

### 1. 安装 Nginx

```bash
sudo dnf install epel-release -y
sudo dnf install nginx -y
sudo systemctl enable --now nginx
```

### 2. 安装 MariaDB（MySQL 的开源分支）

```bash
sudo dnf install mariadb-server -y
sudo systemctl enable --now mariadb
sudo mysql_secure_installation
```

> 执行 `mysql_secure_installation` 时建议设置 root 密码，禁止远程登录，移除测试数据库。

### 3. 安装 PHP 和扩展

WordPress 至少需要 PHP 7.4（CentOS 8 默认仓库中 PHP 版本较低，需引入 Remi 源）：

```bash
sudo dnf install -y https://rpms.remirepo.net/enterprise/remi-release-8.rpm
sudo dnf module reset php -y
sudo dnf module enable php:remi-7.4 -y
sudo dnf install php php-fpm php-mysqlnd php-gd php-xml php-mbstring php-curl php-zip -y
sudo systemctl enable --now php-fpm
```

---

## 🗄️ 二、创建 WordPress 数据库

```bash
sudo mysql -u root -p
```

在 MariaDB 中创建数据库和用户：

```sql
CREATE DATABASE wordpress DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'wpuser'@'localhost' IDENTIFIED BY 'StrongPassword';
GRANT ALL PRIVILEGES ON wordpress.* TO 'wpuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 🌐 三、下载并配置 WordPress

### 1. 下载 WordPress 并移动到网站目录

```bash
cd /tmp
curl -O https://wordpress.org/latest.tar.gz
tar -xzf latest.tar.gz
sudo mv wordpress /usr/share/nginx/html/
sudo chown -R nginx:nginx /usr/share/nginx/html/wordpress
```

### 2. 配置 `wp-config.php`

```bash
cd /usr/share/nginx/html/wordpress
cp wp-config-sample.php wp-config.php
```

编辑 `wp-config.php`（推荐使用 `vim` 或 `nano`）：

```php
define( 'DB_NAME', 'wordpress' );
define( 'DB_USER', 'wpuser' );
define( 'DB_PASSWORD', 'StrongPassword' );
define( 'DB_HOST', 'localhost' );
define( 'DB_CHARSET', 'utf8mb4' );
```

---

## 🔧 四、配置 Nginx 虚拟主机

编辑配置文件，例如：

```bash
sudo vim /etc/nginx/conf.d/wordpress.conf
```

配置内容如下（假设域名为 `example.com`）：

```nginx
server {
    listen 80;
    server_name example.com;

    root /usr/share/nginx/html/wordpress;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/run/php-fpm/www.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires max;
        log_not_found off;
    }
}
```

然后检查配置并重启 Nginx：

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## ✅ 五、访问 WordPress 安装界面

打开浏览器访问：`http://your_server_ip` 或你的域名，进入 WordPress 安装引导界面。

---
