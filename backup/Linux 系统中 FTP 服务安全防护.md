>[!note]
创建 test 普通用户，然后给其设置一个密码，并修改该登录 shell 为 /bin/sh；最后将该用户禁用。
修改 /etc/vsftpd.conf 配置文件，关闭匿名用户。
修改 /etc/vsftpd.conf 配置文件，限制本地用户只能在自己的家目录中活动。
修改 /etc/vsftpd.conf 配置文件，设置每个 IP 的最大客户端连接数目为 5。
修改 /etc/vsftpd.conf 配置文件，设置服务监听端口为 2121。
设置客户端同时最大连接数为 100。
设置匿名用户的家目录为 /ftphome。
禁止所有用户进行写操作

# CentOS 7 FTP 服务安全防护操作步骤

## 一、创建并禁用 test 用户

### 1. 创建普通用户

```
useradd test
```

### 2. 设置用户密码

```
passwd test
```

### 3. 修改登录 Shell 为 /bin/sh

```
usermod -s /bin/sh test
```

### 4. 禁用 test 用户

```
usermod -L test
usermod -e 1970-01-02 test
```

### 5. 验证用户配置

```
grep '^test:' /etc/passwd
passwd -S test
chage -l test
```

## 二、配置 FTP 服务

### 6. 安装 vsftpd

```
yum install -y vsftpd
```

### 7. 创建匿名用户家目录

```
mkdir -p /ftphome
```

### 8. 备份配置文件

CentOS 7 默认配置文件路径为 `/etc/vsftpd/vsftpd.conf`。

```
cp /etc/vsftpd/vsftpd.conf /etc/vsftpd/vsftpd.conf.bak
```

### 9. 修改配置文件

```
vi /etc/vsftpd/vsftpd.conf
```

按 `i` 进入编辑模式，找到对应配置项进行修改，没有的则添加。

```
# 关闭匿名用户
anonymous_enable=NO

# 允许本地用户登录
local_enable=YES

# 限制本地用户只能在自己的家目录中活动
chroot_local_user=YES

# 禁止所有用户进行写操作
write_enable=NO

# 每个IP最大客户端连接数为5
max_per_ip=5

# FTP服务监听端口为2121
listen_port=2121

# 最大客户端同时连接数为100
max_clients=100

# 匿名用户家目录
anon_root=/ftphome

# 启用IPv4监听
listen=YES
listen_ipv6=NO
```

注意：`anonymous_enable=NO` 表示匿名用户无法登录，但仍按考试要求配置 `anon_root=/ftphome`。

如果本地用户登录时出现 `500 OOPS: vsftpd: refusing to run with writable root inside chroot()`，可在本题禁止写入的前提下增加：

```
allow_writeable_chroot=YES
```

编辑完成后按 `Esc`，输入：

```
:wq
```

## 三、重启 FTP 服务

### 10. 启动并设置开机自启

```
systemctl restart vsftpd
systemctl enable vsftpd
```

### 11. 查看服务运行状态

```
systemctl status vsftpd
```

显示 `active (running)` 表示服务运行正常。

### 12. 查看监听端口

```
ss -lntp | grep 2121
```

## 四、配置防火墙和 SELinux

### 13. 开放2121端口

```
firewall-cmd --permanent --add-port=2121/tcp
firewall-cmd --reload
```

### 14. 允许 SELinux 使用2121端口

如果系统启用了 SELinux，执行：

```
yum install -y policycoreutils-python
semanage port -a -t ftp_port_t -p tcp 2121
```

如果提示该端口已存在于 SELinux 规则中，应先检查已有端口类型，再决定是否修改。

