在 **Debian 13** 上，`fail2ban` 是防止 SSH 暴力破解的利器，它会自动监控登录失败并封禁恶意 IP。下面我给你详细的 **安装与配置步骤**：  

---

## **1. 安装 Fail2Ban**
更新软件包并安装：
```bash
sudo apt update
sudo apt install fail2ban -y
```
安装完成后，服务会自动启动。

检查状态：
```bash
sudo systemctl status fail2ban
```


---

## **2. 创建本地配置文件**
修改 `/etc/fail2ban/jail.local`，

然后编辑：
```bash
sudo nano /etc/fail2ban/jail.local
```

---

## **3. 配置 SSH 监控**

```shell
[DEFAULT]
bantime = 1d
findtime = 5m
maxretry = 3
backend = systemd
ignoreip = 127.0.0.1/8

[sshd]
enabled = true
port = 22
logpath = %(sshd_log)s
```



---

## **4. 重启 Fail2Ban**
```bash
sudo systemctl restart fail2ban
```

查看状态：
```bash
sudo fail2ban-client status
sudo fail2ban-client status sshd
```
你会看到已启用的 jail 和被封禁的 IP。

---

## **5. 自启动 Fail2Ban**
```bash
sudo systemctl enable fail2ban
```