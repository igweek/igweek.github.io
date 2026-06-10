## 前言

我有一台只有公网 IPv6 地址的 VPS，准备将其作为 Komari 监控主控端。为了减少额外开销，Komari 直接安装在系统中运行，不使用 Docker，也不安装 1Panel。

但这里存在一个问题：Komari 主控机只有 IPv6，而需要接入监控的客户机大多只有 IPv4。IPv4 客户机无法直接访问 IPv6-only 服务器，所以即使 Komari 安装成功，客户机也无法直接连接主控端。

本文采用以下方案解决：

```text
Komari 原生安装
Nginx 反向代理
Cloudflare 提供 IPv4 入口
Let’s Encrypt 签发源站证书
Cloudflare SSL 设置为完全（严格）
```

最终访问链路如下：

```text
IPv4 Komari 客户机
        ↓ HTTPS
Cloudflare IPv4 边缘节点
        ↓ HTTPS，通过 IPv6 回源
IPv6-only VPS 上的 Nginx
        ↓ HTTP 本机转发
Komari 127.0.0.1:25774
```

这样既能让 IPv4 客户机正常连接，又可以实现客户端到 Cloudflare、Cloudflare 到源站的全程 HTTPS。

---

## 一、环境说明

本文使用的环境如下：

```text
操作系统：Debian 12 / Ubuntu 22.04 或更高版本
服务器网络：仅公网 IPv6
权限：root
Komari：原生安装
Komari端口：25774
反向代理：Nginx
DNS托管：Cloudflare
证书：Let’s Encrypt
证书验证方式：Cloudflare DNS-01
Cloudflare SSL模式：完全（严格）
```

假设使用的域名为：

```text
komari.example.com
```

实际操作时，请将其替换成自己的域名。

---

## 二、为什么只配置 Nginx 不行

Nginx 只能处理已经到达服务器的请求。

如果客户机只有 IPv4，而主控服务器只有 IPv6，两者之间无法直接建立连接。请求在到达 Nginx 之前就已经失败了。

例如，IPv6 主控端地址为：

```text
2001:db8::1234
```

支持 IPv6 的设备可以通过下面的地址访问 Komari：

```text
http://[2001:db8::1234]:25774
```

但 IPv4-only 客户机无法访问该地址。

因此，必须增加一个同时支持 IPv4 和 IPv6 的中间入口。本文使用 Cloudflare：

```text
IPv4客户机
    ↓ IPv4
Cloudflare
    ↓ IPv6
IPv6-only VPS
```

Cloudflare 负责提供 IPv4 入口，Nginx 则负责将标准的 HTTPS 端口转发给 Komari。

---

## 三、检查服务器 IPv6 网络

查看服务器 IPv6 地址：

```bash
ip -6 addr
```

查看公网出口 IPv6：

```bash
curl -6 https://api64.ipify.org
echo
```

测试 IPv6 网络：

```bash
ping -6 -c 4 cloudflare.com
```

查看 IPv6 默认路由：

```bash
ip -6 route
```

正常情况下，应当存在类似：

```text
default via xxxx::1 dev eth0
```

如果无法访问外部 IPv6 网络，需要先解决服务器的 IPv6 路由或 DNS 问题。

---

## 四、配置 Cloudflare DNS

登录 Cloudflare，进入域名的 DNS 管理页面，添加一条 AAAA 记录。

配置如下：

```text
类型：AAAA
名称：komari
内容：VPS的公网IPv6地址
代理状态：已代理
TTL：自动
```

例如：

```text
AAAA  komari  2001:db8::1234  已代理
```

最终域名为：

```text
komari.example.com
```

注意：

* 不需要添加虚假的 A 记录；
* 服务器没有公网 IPv4 不影响使用；
* AAAA 记录必须填写真实的公网 IPv6；
* 小黄云需要开启，否则 IPv4 客户机无法访问；
* 后面使用 DNS-01 申请证书时，不需要关闭小黄云。

---

## 五、安装基础工具

执行：

```bash
apt update
apt install -y curl ca-certificates nginx
```

启动 Nginx，并设置开机启动：

```bash
systemctl enable --now nginx
```

检查服务状态：

```bash
systemctl status nginx
```

---

## 六、原生安装 Komari

下载安装脚本：

```bash
curl -fsSL \
https://raw.githubusercontent.com/komari-monitor/komari/main/install-komari.sh \
-o /root/install-komari.sh
```

添加执行权限：

```bash
chmod +x /root/install-komari.sh
```

执行安装：

```bash
bash /root/install-komari.sh
```

安装完成后，检查 Komari 服务：

```bash
systemctl status komari
```

查看日志：

```bash
journalctl -u komari -n 100 --no-pager
```

检查监听端口：

```bash
ss -lntp | grep 25774
```

测试本地访问：

```bash
curl -I http://127.0.0.1:25774
```

如果返回 `200` 或 `302`，说明 Komari 已正常运行。

---

## 七、让 Komari 只监听本机

由于外部访问统一经过 Nginx，没有必要将 Komari 的 `25774` 端口直接暴露到公网。

查看 Komari 的 systemd 配置：

```bash
systemctl cat komari
```

找到类似：

```ini
ExecStart=/opt/komari/komari server -l 0.0.0.0:25774
```

编辑服务文件：

```bash
systemctl edit --full komari
```

将监听地址修改为：

```ini
ExecStart=/opt/komari/komari server -l 127.0.0.1:25774
```

注意，程序路径应以服务器实际配置为准，只修改监听地址。

保存后执行：

```bash
systemctl daemon-reload
systemctl restart komari
```

再次检查：

```bash
ss -lntp | grep 25774
```

理想结果为：

```text
127.0.0.1:25774
```

再测试一次：

```bash
curl -I http://127.0.0.1:25774
```

---

## 八、创建 Cloudflare API Token

Let’s Encrypt 证书采用 DNS-01 验证。这样不需要关闭小黄云，也不依赖服务器 80 端口。

进入 Cloudflare：

```text
个人资料
→ API令牌
→ 创建令牌
```

选择模板：

```text
编辑区域 DNS
```

权限设置为：

```text
区域 → DNS → 编辑
区域 → 区域 → 读取
```

区域资源选择：

```text
仅包括
→ 特定区域
→ example.com
```

这里选择根域名，例如：

```text
example.com
```

而不是：

```text
komari.example.com
```

创建完成后复制 API Token。

不要使用权限过大的 Global API Key，也不要把 Token 发布到博客或 GitHub。

---

## 九、安装 Certbot 和 Cloudflare 插件

执行：

```bash
apt update
apt install -y certbot python3-certbot-dns-cloudflare
```

检查 Certbot：

```bash
certbot --version
```

检查插件：

```bash
certbot plugins
```

输出中应当包含：

```text
dns-cloudflare
```

---

## 十、保存 Cloudflare API Token

创建目录：

```bash
mkdir -p /root/.secrets/certbot
```

创建配置文件：

```bash
nano /root/.secrets/certbot/cloudflare.ini
```

写入：

```ini
dns_cloudflare_api_token = 你的Cloudflare_API_Token
```

保存后设置权限：

```bash
chmod 600 /root/.secrets/certbot/cloudflare.ini
```

检查权限：

```bash
ls -l /root/.secrets/certbot/cloudflare.ini
```

应当显示：

```text
-rw------- 1 root root
```

---

## 十一、申请 Let’s Encrypt 证书

执行：

```bash
certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /root/.secrets/certbot/cloudflare.ini \
  --dns-cloudflare-propagation-seconds 60 \
  -d komari.example.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email
```

需要替换：

```text
komari.example.com
your-email@example.com
```

申请过程中，Certbot 会通过 Cloudflare API 临时创建 TXT 记录：

```text
_acme-challenge.komari.example.com
```

验证完成后，该记录会被自动删除。

证书申请成功后，文件通常位于：

```text
/etc/letsencrypt/live/komari.example.com/fullchain.pem
/etc/letsencrypt/live/komari.example.com/privkey.pem
```

其中：

```text
fullchain.pem：完整证书链
privkey.pem：证书私钥
```

---

## 十二、检查证书

查看 Certbot 管理的证书：

```bash
certbot certificates
```

查看证书信息：

```bash
openssl x509 \
  -in /etc/letsencrypt/live/komari.example.com/fullchain.pem \
  -noout \
  -subject \
  -issuer \
  -dates \
  -ext subjectAltName
```

应当可以看到：

```text
DNS:komari.example.com
```

---

## 十三、配置 Nginx HTTPS 反向代理

创建配置文件：

```bash
nano /etc/nginx/sites-available/komari
```

写入：

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name komari.example.com;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;

    server_name komari.example.com;

    ssl_certificate /etc/letsencrypt/live/komari.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/komari.example.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    location / {
        proxy_pass http://127.0.0.1:25774;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_connect_timeout 60s;
        proxy_send_timeout 3600s;
        proxy_read_timeout 3600s;

        proxy_buffering off;
        proxy_request_buffering off;
    }
}
```

将所有：

```text
komari.example.com
```

替换成自己的域名。

其中最关键的是：

```nginx
listen [::]:80;
listen [::]:443 ssl;
```

因为服务器只有 IPv6，所以必须监听 IPv6 的 80 和 443 端口。

反向代理目标为：

```nginx
proxy_pass http://127.0.0.1:25774;
```

---

## 十四、启用 Nginx 配置

创建软链接：

```bash
ln -s /etc/nginx/sites-available/komari \
/etc/nginx/sites-enabled/komari
```

如果服务器没有其他网站，可以删除默认站点：

```bash
rm -f /etc/nginx/sites-enabled/default
```

检查 Nginx 配置：

```bash
nginx -t
```

重新加载：

```bash
systemctl reload nginx
```

检查监听端口：

```bash
ss -lntp | grep -E ':80|:443'
```

应当看到：

```text
[::]:80
[::]:443
```

---

## 十五、开放防火墙

如果启用了 UFW：

```bash
ufw allow 80/tcp
ufw allow 443/tcp
```

如果 SSH 使用默认 22 端口：

```bash
ufw allow 22/tcp
```

查看规则：

```bash
ufw status
```

如果服务商还有安全组或网络防火墙，也要开放 IPv6 入站：

```text
TCP 80
TCP 443
```

Komari 的 `25774` 不需要开放，因为它只监听本机。

---

## 十六、测试源站 HTTPS

先测试 Komari：

```bash
curl -I http://127.0.0.1:25774
```

然后绕过 Cloudflare，直接测试源站：

```bash
curl -kI \
  --resolve komari.example.com:443:[服务器IPv6地址] \
  https://komari.example.com
```

例如：

```bash
curl -kI \
  --resolve komari.example.com:443:[2001:db8::1234] \
  https://komari.example.com
```

正常情况下会返回：

```text
HTTP/1.1 200 OK
```

或者：

```text
HTTP/1.1 302 Found
```

如果返回 `502 Bad Gateway`，检查：

```bash
systemctl status komari
ss -lntp | grep 25774
curl -I http://127.0.0.1:25774
```

---

## 十七、设置 Cloudflare 完全（严格）

确认以下条件已经满足：

```text
Let’s Encrypt证书申请成功
Nginx引用了正确证书
Nginx监听IPv6的443端口
服务器防火墙开放443
AAAA记录指向正确IPv6
```

进入 Cloudflare：

```text
SSL/TLS
→ 概述
→ SSL/TLS加密模式
```

选择：

```text
完全（严格）
```

不要继续使用“灵活”。

完全（严格）模式会验证：

* 源站证书是否有效；
* 证书是否过期；
* 证书域名是否匹配；
* 证书是否由受信任的证书机构签发。

Let’s Encrypt 属于公共可信证书机构，可以满足要求。

最终链路如下：

```text
客户端
    ↓ HTTPS
Cloudflare
    ↓ HTTPS
IPv6源站Nginx
    ↓ HTTP本机连接
Komari 127.0.0.1:25774
```

---

## 十八、测试公网访问

在普通 IPv4 客户机上执行：

```bash
curl -I https://komari.example.com
```

正常情况下会返回：

```text
HTTP/2 200
```

或者：

```text
HTTP/2 302
```

查看详细信息：

```bash
curl -vI https://komari.example.com
```

开启 Cloudflare 代理后，客户端看到的是 Cloudflare 边缘证书，而不是源站的 Let’s Encrypt 证书，这是正常现象。

两段证书分别负责：

```text
客户端 → Cloudflare：Cloudflare边缘证书
Cloudflare → 源服务器：Let’s Encrypt证书
```

---

## 十九、添加 Komari 客户机

登录 Komari 后台：

```text
https://komari.example.com
```

添加节点并复制后台生成的 Agent 安装命令。

Agent 的主控地址必须使用：

```text
https://komari.example.com
```

不要使用：

```text
http://[服务器IPv6]:25774
```

也不要在域名后添加：

```text
:25774
```

正确访问链路为：

```text
Komari Agent
    ↓
https://komari.example.com
    ↓
Cloudflare
    ↓
IPv6源站Nginx
    ↓
Komari主控
```

---

## 二十、配置证书自动续期

测试续期：

```bash
certbot renew --dry-run
```

如果显示：

```text
Congratulations, all simulated renewals succeeded
```

说明续期配置正常。

检查 Certbot 定时器：

```bash
systemctl status certbot.timer
```

查看定时任务：

```bash
systemctl list-timers | grep certbot
```

如果未启用：

```bash
systemctl enable --now certbot.timer
```

---


## 总结

在只有公网 IPv6 地址的 VPS 上，可以直接原生安装 Komari，不需要 Docker，也不需要 1Panel。

如果客户机只有 IPv4，单独配置 Nginx 无法解决 IPv4 访问 IPv6 的问题。通过 Cloudflare 代理，可以给 IPv4 客户机提供入口，再通过 IPv6 回源到服务器。

这样既解决了 IPv4 客户机访问 IPv6-only Komari 主控的问题，也实现了客户端到 Cloudflare、Cloudflare 到源服务器两段链路的 HTTPS 加密。
