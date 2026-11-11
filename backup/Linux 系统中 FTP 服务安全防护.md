> centos7系统中FTP 服务安全防护
创建 test 普通用户，然后给其设置一个密码，并修改该登录 shell 为 /bin/sh；最后将该用户禁用。
修改 /etc/vsftpd.conf 配置文件，关闭匿名用户。
修改 /etc/vsftpd.conf 配置文件，限制本地用户只能在自己的家目录中活动。
修改 /etc/vsftpd.conf 配置文件，设置每个 IP 的最大客户端连接数目为 5。
修改 /etc/vsftpd.conf 配置文件，设置服务监听端口为 2121。
设置客户端同时最大连接数为 100。
设置匿名用户的家目录为 /ftphome。
禁止所有用户进行写操作

## 一、题目要求与对应命令

| 考核要求             | 命令或配置                     |
| ---------------- | ------------------------- |
| 创建 test 用户       | `useradd test`            |
| 设置密码             | `passwd test`             |
| 修改 Shell         | `usermod -s /bin/sh test` |
| 禁用 test 用户       | `usermod -L test`         |
| 关闭匿名登录           | `anonymous_enable=NO`     |
| 限制在自己的家目录        | `chroot_local_user=YES`   |
| 每个 IP 最多 5 个连接   | `max_per_ip=5`            |
| FTP 监听端口 2121    | `listen_port=2121`        |
| 最大客户端连接数 100     | `max_clients=100`         |
| 匿名用户根目录 /ftphome | `anon_root=/ftphome`      |
| 禁止所有用户写操作        | `write_enable=NO`         |

## 二、创建并禁用 test 用户

先切换到 root：

```
su - root
```

### 第1步：创建普通用户

```
useradd test
```

验证：

```
id test
```

显示 test 用户的 UID、GID 信息，说明创建成功。

### 第2步：设置密码

```
passwd test
```

输入两次密码即可。

### 第3步：修改登录 Shell

```
usermod -s /bin/sh test
```

查看结果：

```
grep '^test:' /etc/passwd
```

预期结果类似：

```
test:x:1001:1001::/home/test:/bin/sh
```

最后一个字段为 `/bin/sh` 即正确。

### 第4步：禁用用户

```
usermod -L test
```

验证：

```
passwd -S test
```

出现 `LK` 表示密码已经锁定。

这里需要注意，`usermod -L` 锁定的是密码，并不保证禁止 SSH 密钥等其他认证方式。如果考试中的“禁用用户”要求账户完全不能登录，可以额外执行：

```
usermod -e 1 test
```

这会使账户过期，禁止普通账户认证登录。

## 三、安装 FTP 服务

### 第1步：检查 vsftpd 是否已安装

```
rpm -q vsftpd
```

如果出现：

```
package vsftpd is not installed
```

说明需要安装。

### 第2步：安装 vsftpd

```
yum install -y vsftpd
```

如果系统能够正常访问配置的软件仓库，会自动下载安装。

### 第3步：检查配置文件位置

```
ls -l /etc/vsftpd/vsftpd.conf
```

正常情况下可以看到这个文件。

### 第4步：备份配置文件

```
cp /etc/vsftpd/vsftpd.conf /etc/vsftpd/vsftpd.conf.bak
```

这样即使修改错误，也可以恢复原始配置。

## 四、修改 FTP 配置文件（重点）

打开配置文件：

```
vi /etc/vsftpd/vsftpd.conf
```

按 `i` 进入编辑模式，找到对应参数进行修改。没有的参数可以在配置文件末尾添加。

### 第1步：关闭匿名用户登录

```
anonymous_enable=NO
```

设置为 `NO` 表示禁止匿名登录 FTP。

### 第2步：限制本地用户只能访问自己的家目录

```
chroot_local_user=YES
```

该参数的作用是将本地用户限制在自己的家目录之内，不能通过 FTP 浏览家目录之外的文件。

### 第3步：限制每个 IP 最大连接数为 5

```
max_per_ip=5
```

表示同一个客户端 IP 最多允许同时建立 5 个 FTP 客户端连接。

### 第4步：将 FTP 服务监听端口修改为 2121

```
listen_port=2121
```

默认 FTP 控制连接使用 21 端口，修改后使用 2121 端口。

### 第5步：设置最大客户端连接数为 100

```
max_clients=100
```

表示整个 FTP 服务器最多允许 100 个客户端同时连接。

这里特别注意：

- `max_per_ip=5`：限制每个 IP 的连接数量。
- `max_clients=100`：限制服务器所有客户端的总连接数量。





### 第6步：设置匿名用户根目录为 /ftphome

先创建目录：

```
mkdir -p /ftphome
```

设置基本访问权限：

```
chmod 755 /ftphome
```

然后在配置文件中设置：

```
anon_root=/ftphome
```

特别注意： 前面已经设置了 `anonymous_enable=NO`，匿名用户实际上无法登录，因此这个目录暂时不会被匿名用户使用。但题目要求配置此参数，仍然必须设置。

### 第7步：禁止所有用户进行写操作

```
write_enable=NO
```

这个参数很重要。

配置后，通过 FTP 无法执行上传、删除、重命名、创建目录等修改文件系统的操作，但仍然可以在具备读取权限时下载文件。




## 五、最终配置文件

这是本题最核心的部分。

vsftpd.conf 关键配置

&#x20;复制

```
anonymous_enable=NO
local_enable=YES
chroot_local_user=YES
max_per_ip=5
listen_port=2121
max_clients=100
anon_root=/ftphome
write_enable=NO

listen=YES
listen_ipv6=NO
```

这里额外增加了三个需要解释的参数：

- `local_enable=YES`：允许本地用户通过 FTP 登录，以便验证家目录限制。
- `listen=YES`：让 vsftpd 以独立模式监听 IPv4 地址。
- `listen_ipv6=NO`：关闭独立的 IPv6 监听模式，避免与 `listen=YES` 冲突。

修改方法： 保留原配置文件的其他正常配置，只修改同名参数，缺少的参数再添加，不要把整个文件直接清空。尤其注意，CentOS 7 默认配置可能是 `listen=NO`、`listen_ipv6=YES`，需要修改原来的值。

保存并退出 `vi`：

```
Esc
:wq
```

## 六、处理 SELinux 和防火墙

由于 FTP 端口修改为 2121，在 CentOS 7 中可能还需要处理 SELinux 和防火墙，否则可能出现服务启动失败或客户端无法连接的情况。

### 第1步：检查 SELinux 状态

```
getenforce
```

如果显示 `Enforcing`，需要检查端口策略。

安装管理工具：

```
yum install -y policycoreutils-python
```

查看 FTP 允许使用的端口：

```
semanage port -l | grep ftp_port_t
```

如果没有包含 2121，且 2121 尚未分配给其他 SELinux 端口类型，则执行：

```
semanage port -a -t ftp_port_t -p tcp 2121
```

这样允许 FTP 服务在 SELinux 强制模式下监听 2121 端口。





如果要验证本地用户访问家目录，还可以检查：

```
getsebool ftp_home_dir
```

如果该策略存在并显示 `off`，可以执行：

```
setsebool -P ftp_home_dir on
```

### 第2步：开放防火墙端口

如果 firewalld 正在运行，执行：

```
firewall-cmd --permanent --add-port=2121/tcp
firewall-cmd --reload
```

如果需要通过 FTP 被动模式传输文件，还需要配置并开放相应的数据端口范围。单独开放 2121 只解决控制连接问题。

## 七、启动 FTP 服务

```
systemctl enable --now vsftpd
```

如果已经启动过，执行：

```
systemctl restart vsftpd
```

查看运行状态：

```
systemctl status vsftpd
```

正常情况下显示：

```
Active: active (running)
```

查看 2121 端口是否正在监听：

```
ss -lntp | grep 2121
```

预期可以看到 `vsftpd` 正在监听 TCP 2121 端口。

## 八、验证题目要求

### 1. 验证用户创建、Shell 和禁用状态

```
id test
grep '^test:' /etc/passwd
passwd -S test
chage -l test
```

检查用户存在、Shell 为 `/bin/sh`，密码状态为 `LK`。如果额外设置了账户过期，还应检查账户到期日期。

### 2. 验证 FTP 配置

使用以下命令查看生效配置文件中写入的关键参数：

```
grep -E '^(anonymous_enable|local_enable|chroot_local_user|max_per_ip|max_clients|listen_port|anon_root|write_enable|listen|listen_ipv6)=' /etc/vsftpd/vsftpd.conf
```

对照第五部分，检查各项配置是否正确。

### 3. 验证匿名登录已关闭

如果未安装 FTP 客户端：

```
yum install -y ftp
```

连接 FTP：

```
ftp 127.0.0.1 2121
```

输入用户名：

```
anonymous
```

预期登录失败，出现类似：

```
530 Permission denied.
```

说明匿名访问被禁止。

### 4. 验证禁止写入

由于 `test` 已经被禁用，不能使用它验证正常 FTP 登录。

可以使用系统中其他有权限的测试账号，或者临时创建一个正常账号进行验证。登录后执行：

```
ftp> mkdir newdir
```

预期提示：

```
550 Permission denied.
```

说明 FTP 服务禁止写操作。

需要注意，CentOS 7 的 vsftpd 可能因用户家目录可写而拒绝 `chroot` 登录，出现 `500 OOPS: refusing to run with writable root inside chroot()`。这是独立的家目录安全检查，不能据此判断写操作限制已经生效。




如果遇到该错误，建议将用于 FTP 登录的账号家目录设置为该用户不可写，而不是直接放宽 `allow_writeable_chroot` 安全检查。

## 九、考试速查版

下面这套流程可以直接作为实操考试的操作顺序。

命令汇总

&#x20;复制

```
# 1. 用户管理
useradd test
passwd test
usermod -s /bin/sh test
usermod -L test

# 2. 安装 FTP
rpm -q vsftpd
yum install -y vsftpd

# 3. 备份配置
cp /etc/vsftpd/vsftpd.conf /etc/vsftpd/vsftpd.conf.bak

# 4. 创建目录
mkdir -p /ftphome
chmod 755 /ftphome

# 5. 修改配置文件
vi /etc/vsftpd/vsftpd.conf

# 6. 启动并验证
systemctl enable --now vsftpd
systemctl restart vsftpd
systemctl status vsftpd
ss -lntp | grep 2121
```

其中第 5 步需要按照前面的要求修改参数；SELinux 和防火墙处于启用状态时，也要完成第六部分的配置。

这道题的核心就是 7 个参数：

`anonymous_enable`、`chroot_local_user`、`max_per_ip`、`listen_port`、`max_clients`、`anon_root`、`write_enable`。

另外提醒：FTP 默认不加密用户名、密码及传输内容。这套配置适合完成题目要求，但正式生产环境建议使用 SFTP 或启用 TLS 的 FTPS。