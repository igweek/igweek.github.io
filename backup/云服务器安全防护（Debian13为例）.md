
> [!important]
云服务器一旦暴露公网，SSH 扫描和暴力破解几乎是“秒级发生”的事情。  
本文以 **Debian 13** 为例，在**不禁止 root 登录**的前提下，通过以下三项核心措施完成基础防护：

- 将 SSH 端口修改至 50000 以上高位端口  
- 禁止密码登录，仅允许 SSH 密钥登录（root 同样适用）  
- 安装并配置 Fail2Ban，自动封禁扫描和爆破 IP  

适合个人 VPS、学习服务器、轻量生产环境。

---

## 一、修改 SSH 端口到 50000 以上

### 1. 修改 SSH 服务端配置文件

SSH 服务端的配置文件路径是固定的：

```
/etc/ssh/sshd_config
```

使用 root 编辑：

```bash
nano /etc/ssh/sshd_config
```

在文件中 **找到或新增** 以下配置（注意不要重复）：

```ini
Port 50222
AddressFamily inet
PermitRootLogin yes
```

说明：

- `Port 50222`  
  将默认 22 端口改为高位端口（50000–60000 均可）
- `AddressFamily inet`  
  只监听 IPv4，减少 IPv6 下的无意义扫描
- `PermitRootLogin yes`  
  明确允许 root 登录（后续用密钥约束安全性）

如果原有配置前面有 `#`，需要去掉注释。

---

### 2. 重启 SSH 服务

```bash
systemctl restart ssh
```

---

### 3. 验证 SSH 是否监听新端口

```bash
ss -lntp | grep ssh
```

应看到类似：

```
0.0.0.0:50222
```

---

### 4. 新窗口测试登录

```bash
ssh -p 50222 root@服务器IP
```

确认可以正常登录后，再进行下一步。

---

## 二、生成 SSH 密钥（本地操作）

**密钥必须在你用来连接服务器的那台电脑上生成，不是在服务器上。**

### 1. 在本地终端执行

```bash
ssh-keygen -t ed25519
```

一路回车即可：

- 不修改路径  
- 是否设置 passphrase 视个人习惯

生成完成后，会得到两个文件：

```bash
ls ~/.ssh
```

```
id_ed25519
id_ed25519.pub
```

说明：

- `id_ed25519`：私钥，只保存在本地
- `id_ed25519.pub`：公钥，需要上传到服务器

---

## 三、将 root 公钥上传到服务器

此时你仍然可以用 **root + 密码** 登录服务器，这是最后一次使用密码。

---

### 方法一（推荐）：ssh-copy-id

在本地执行：

```bash
ssh-copy-id -p 50222 root@服务器IP
```

输入一次 root 密码即可。

该命令会自动完成：

- 创建 `/root/.ssh/`
- 写入 `authorized_keys`
- 设置正确权限

---

### 方法二（手动方式，理解原理）

#### 1. 本地查看公钥内容

```bash
cat ~/.ssh/id_ed25519.pub
```

复制输出的整一行。

---

#### 2. 使用密码登录服务器

```bash
ssh -p 50222 root@服务器IP
```

---

#### 3. 在服务器上执行

```bash
mkdir -p /root/.ssh
chmod 700 /root/.ssh
nano /root/.ssh/authorized_keys
```

将公钥粘贴进去，保存退出。

---

#### 4. 设置文件权限

```bash
chmod 600 /root/.ssh/authorized_keys
```

---

### 5. 验证密钥登录是否生效

在本地新开一个终端：

```bash
ssh -p 50222 root@服务器IP
```

正确表现：

- 不再要求输入服务器密码
- 直接登录（或仅询问密钥 passphrase）

确认成功后，才能进入下一步。

---

## 四、禁止密码登录，仅允许密钥登录

### 1. 修改 SSH 配置

```bash
nano /etc/ssh/sshd_config
```

确认或修改以下配置：

```ini
PasswordAuthentication no
ChallengeResponseAuthentication no
UsePAM no

PubkeyAuthentication yes
PermitRootLogin yes
```

说明：

- 完全关闭密码认证
- root 仍然允许，但只能使用密钥

---

### 2. 重启 SSH

```bash
systemctl restart ssh
```

---

### 3. 再次验证

```bash
ssh -p 50222 root@服务器IP
```

如果还能输入服务器密码，说明配置未生效，不要继续。

---

## 五、安装并配置 Fail2Ban（阻止扫描与爆破）

### 1. 安装 Fail2Ban

```bash
apt update
apt install -y fail2ban
```

---

### 2. 创建本地配置文件

不要直接修改 `jail.conf`，而是创建：

```bash
nano /etc/fail2ban/jail.local
```

写入以下内容：

```ini
[DEFAULT]
bantime  = 1d
findtime = 10m
maxretry = 3
backend  = systemd

[sshd]
enabled  = true
port     = 50222
logpath  = %(sshd_log)s
```

含义：

- 10 分钟内失败 3 次
- 封禁 1 天
- 仅针对 SSH
- 端口与实际 SSH 端口一致

---

### 3. 启动并设置开机自启

```bash
systemctl enable fail2ban
systemctl restart fail2ban
```

---

### 4. 查看 Fail2Ban 状态

```bash
fail2ban-client status
fail2ban-client status sshd
```

---

### 5. 查看已封禁 IP

```bash
fail2ban-client get sshd banned
```

---

## 六、（可选）启用基础防火墙

```bash
apt install -y ufw
ufw allow 50222/tcp
ufw enable
```

---

## 七、最终安全状态总结

完成以上步骤后，你的 Debian 13 云服务器将具备：

- SSH 高位端口，避免 90% 低级扫描  
- root 登录保留，但仅限密钥  
- 密码爆破彻底失效  
- Fail2Ban 自动封禁异常 IP  
- 可长期无人值守运行  

---

## 结语

真正有效的服务器安全并不是“禁止一切”，而是在**使用习惯、风险与运维成本之间取得平衡**。  
在允许 root 登录的现实前提下，上述方案已经能覆盖绝大多数公网攻击场景。

后续可进一步加强的方向包括：

- Fail2Ban 与 nftables 联动 DROP  
- 仅允许特定 IP 登录 SSH  
- Cloudflare Zero Trust SSH  
- SSH 端口敲门（Port Knocking）