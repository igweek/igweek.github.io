## 一、项目背景

某教育科技公司计划上线一个技术博客平台，用于：

* 发布云计算与运维相关文章
* 对外展示企业技术能力
* 提供 SEO 流量入口
* 承载未来 AI 教学资源内容

企业要求：

| 项目    | 要求             |
| ----- | -------------- |
| 服务器   | 部署在中国大陆云服务器    |
| 域名    | 使用低成本国际域名      |
| CDN   | 全球加速与防护        |
| HTTPS | 必须启用           |
| 安全性   | 隐藏源站 IP、防御恶意访问 |
| 运维难度  | 尽量简单           |

最终技术方案：

| 模块     | 方案             |
| ------ | -------------- |
| 云服务器   | 阿里云 ECS        |
| 操作系统   | Ubuntu 22.04   |
| Web 服务 | Nginx          |
| 博客程序   | WordPress      |
| 数据库    | MySQL          |
| PHP 环境 | PHP 8.2        |
| 域名注册   | Gname          |
| DNS 托管 | Cloudflare     |
| CDN 加速 | Cloudflare CDN |
| HTTPS  | Cloudflare SSL |

---

# 二、整体架构

```text
用户浏览器
      ↓
Cloudflare CDN
      ↓
Cloudflare DNS
      ↓
阿里云 ECS
      ↓
Nginx
      ↓
WordPress
      ↓
MySQL
```

---

# 三、项目目标

完成以下内容：

* 购买 ECS
* 配置 Ubuntu
* 安装 LNMP
* 部署 WordPress
* 在 Gname 注册域名
* 域名托管到 Cloudflare
* 开启 CDN 加速
* 配置 HTTPS
* 实现企业博客上线

---

# 四、准备工作

## 1. 准备服务器

在 阿里云 ECS创建服务器。

推荐配置：

| 配置项   | 建议           |
| ----- | ------------ |
| 地域    | 新加坡/香港       |
| CPU   | 2核           |
| 内存    | 2GB          |
| 系统盘   | 40GB         |
| 系统    | Ubuntu 22.04 |
| 公网 IP | 开启           |

原因：

* Cloudflare 海外 CDN 与国际线路更适合
* WordPress 对 2G 内存已经足够

---

## 2. 注册域名

在 [Gname](https://gname.vip/tld-eu-cc.html?utm_source=chatgpt.com) 注册域名。

例如：

```text
example-blog.cc
```

---

## 3. 注册 Cloudflare

进入：

[Cloudflare 中国官网](https://www.cloudflare-cn.com/?utm_source=chatgpt.com)

注册账号。

---

# 五、部署 ECS 环境

---

# 六、连接服务器

Windows：

推荐使用：

* Xshell
* FinalShell
* MobaXterm

连接命令：

```bash
ssh root@服务器公网IP
```

---

# 七、更新系统

```bash
apt update && apt upgrade -y
```

---

# 八、安装 Nginx

```bash
apt install nginx -y
```

启动服务：

```bash
systemctl start nginx
systemctl enable nginx
```

查看状态：

```bash
systemctl status nginx
```

浏览器访问：

```text
http://服务器IP
```

出现 Welcome to nginx 即成功。

---

# 九、安装 MySQL

```bash
apt install mysql-server -y
```

启动数据库：

```bash
systemctl enable mysql
systemctl start mysql
```

进入数据库：

```bash
mysql
```

创建数据库：

```sql
CREATE DATABASE wordpress DEFAULT CHARACTER SET utf8mb4;
```

创建用户：

```sql
CREATE USER 'wpuser'@'localhost' IDENTIFIED BY '123456Aa!';
```

授权：

```sql
GRANT ALL PRIVILEGES ON wordpress.* TO 'wpuser'@'localhost';
```

刷新权限：

```sql
FLUSH PRIVILEGES;
```

退出：

```sql
exit
```

---

# 十、安装 PHP

安装 PHP 及扩展：

```bash
apt install php-fpm php-mysql php-curl php-gd php-mbstring php-xml php-zip -y
```

查看版本：

```bash
php -v
```

---

# 十一、部署 WordPress

进入网站目录：

```bash
cd /var/www/
```

下载 WordPress：

```bash
wget https://wordpress.org/latest.tar.gz
```

解压：

```bash
tar -zxvf latest.tar.gz
```

修改目录名称：

```bash
mv wordpress blog
```

设置权限：

```bash
chown -R www-data:www-data /var/www/blog
```

---

# 十二、配置 Nginx

创建站点配置：

```bash
nano /etc/nginx/sites-available/blog
```

写入：

```nginx
server {
    listen 80;
    server_name example-blog.cc www.example-blog.cc;

    root /var/www/blog;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
    }
}
```

启用站点：

```bash
ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
```

测试配置：

```bash
nginx -t
```

重启：

```bash
systemctl restart nginx
```

---

# 十三、配置 Cloudflare 托管

---

# 十四、添加域名

进入 Cloudflare：

```text
Websites
→ Add Site
```

输入域名：

```text
example-blog.cc
```

选择免费套餐即可。

---

# 十五、修改 Nameserver

Cloudflare 会提供：

```text
xxx.ns.cloudflare.com
xxx.ns.cloudflare.com
```

进入 Gname：

```text
域名管理
→ Nameserver
```

替换为 Cloudflare 提供的 NS。

等待生效。

通常：

```text
5分钟 ~ 2小时
```

---

# 十六、添加 DNS 记录

进入：

```text
DNS
```

添加：

| 类型 | 名称  | 内容      |
| -- | --- | ------- |
| A  | @   | ECS公网IP |
| A  | www | ECS公网IP |

开启橙色云：

```text
Proxy Status → Proxied
```

这表示：

* 开启 CDN
* 隐藏源站 IP
* 启用 Cloudflare 防护

---

# 十七、开放 ECS 安全组

进入阿里云：

```text
ECS
→ 安全组
→ 入方向规则
```

开放：

| 端口  | 说明    |
| --- | ----- |
| 22  | SSH   |
| 80  | HTTP  |
| 443 | HTTPS |

---

# 十八、配置 HTTPS

进入 Cloudflare：

```text
SSL/TLS
```

模式选择：

```text
Flexible
```

后续企业环境建议：

```text
Full
```

开启：

```text
Always Use HTTPS
```

此时：

```text
http 自动跳转 https
```

---

# 十九、完成 WordPress 安装

浏览器访问：

```text
https://example-blog.cc
```

进入 WordPress 初始化页面。

填写：

| 项目    | 内容        |
| ----- | --------- |
| 数据库名  | wordpress |
| 用户名   | wpuser    |
| 密码    | 123456Aa! |
| 数据库地址 | localhost |

完成安装。

---

# 二十、企业级优化方案

---

# 1. 隐藏源站 IP

问题：

如果攻击者直接访问 ECS IP：

```text
CDN 将失效
```

解决：

Nginx 配置只允许 Cloudflare IP 访问。

---

# 2. 开启缓存

Cloudflare：

```text
Caching
→ Cache Rules
```

缓存静态资源：

* jpg
* png
* css
* js

提升访问速度。

---

# 3. 防 CC 攻击

进入：

```text
Security
```

开启：

```text
Bot Fight Mode
```

---

# 4. 自动备份

企业建议：

| 备份内容  | 方式        |
| ----- | --------- |
| 数据库   | mysqldump |
| 网站文件  | rsync     |
| ECS快照 | 阿里云快照     |

---

# 二十一、最终效果

实现：

* 企业博客上线
* 全球 CDN 加速
* HTTPS 安全访问
* 域名托管
* 防御恶意流量
* 隐藏源站 IP

用户访问流程：

```text
用户
↓
Cloudflare CDN
↓
阿里云 ECS
↓
WordPress
```

---

# 二十二、为什么企业喜欢这种架构

| 优势    | 说明                |
| ----- | ----------------- |
| 成本低   | Cloudflare 免费 CDN |
| 安全性高  | 隐藏真实 IP           |
| 部署简单  | 运维难度低             |
| SEO友好 | HTTPS + CDN       |
| 扩展方便  | 后续可接对象存储、WAF      |

---

# 二十三、适合教学的知识点

本实验可以覆盖：

| 技术方向  | 知识点        |
| ----- | ---------- |
| Linux | Ubuntu 运维  |
| Web   | Nginx      |
| 数据库   | MySQL      |
| PHP   | LNMP 架构    |
| 云计算   | 阿里云 ECS    |
| DNS   | 域名解析       |
| CDN   | Cloudflare |
| 安全    | HTTPS、防护   |
| 运维    | 网站上线流程     |

---

# 二十四、项目总结

本案例模拟了企业真实的网站上线流程。

相比本地测试环境：

* 更接近真实互联网部署
* 涉及 DNS、CDN、HTTPS
* 涉及云服务器运维
* 涉及安全与性能优化
