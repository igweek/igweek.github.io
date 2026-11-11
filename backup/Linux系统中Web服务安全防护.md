> Centos7下创建 test 普通用户，然后给其设置一个密码，并修改该登录 shell 为 /bin/sh；最后将该用户禁用，修改 /etc/httpd/conf/httpd.conf 配置文件，设置网站根目录为 /www（目录自行创建），禁止目录列出，设置 404 错误页面为 /missing.html，设置 Apache 在错误页面时不回显任何版本信息。

## 一、题目要求与对应操作

| 题目要求            | 对应操作                                        |
| --------------- | ------------------------------------------- |
| 创建 test 普通用户    | `useradd test`                              |
| 设置用户密码          | `passwd test`                               |
| 修改登录 Shell      | `usermod -s /bin/sh test`                   |
| 禁用 test 用户      | `usermod -L test`                           |
| 安装 Apache       | `yum install -y httpd`                      |
| 网站根目录设置为 /www   | `DocumentRoot "/www"`                       |
| 禁止目录列出          | `Options -Indexes`                          |
| 设置 404 错误页面     | `ErrorDocument 404 /missing.html`           |
| 不显示 Apache 版本信息 | `ServerTokens Prod` 和 `ServerSignature Off` |

## 二、创建并管理 test 用户

首先进入 root 用户环境：

```
su - root
```

### 第1步：创建普通用户 test

```
useradd test
```


### 第2步：设置用户密码

```
passwd test
```

根据系统提示，输入两次新密码。

注意：Linux 输入密码时，屏幕不会显示字符，这是正常现象。

### 第3步：修改登录 Shell 为 /bin/sh

```
usermod -s /bin/sh test
```


重点检查最后一个字段是不是 `/bin/sh`。

### 第4步：禁用 test 用户

```
usermod -L test
```

该命令锁定用户的密码认证。


注意： `usermod -L` 只是锁定密码，不一定能阻止 SSH 密钥等其他认证方式。如果题目要求彻底禁止该账号登录，还可以执行：

```
usermod -e 1 test
```

此操作会将账户有效期设置为过去的日期，使账户过期。对于这道题，通常使用 `usermod -L test` 即可完成禁用用户的考核要求，并且不会改变之前设定的 `/bin/sh`。

## 三、安装 Apache 服务器

### 第1步：检查是否已经安装

```
rpm -q httpd
```

如果显示类似：

```
httpd-2.4.6-xx.el7.x86_64
```

说明已经安装，可以直接进入第四部分。

如果显示：

```
package httpd is not installed
```

说明需要安装。

### 第2步：安装 Apache

```
yum install -y httpd
```

### 第3步：启动服务

```
systemctl start httpd
```

设置开机启动：

```
systemctl enable httpd
```

查看运行状态：

```
systemctl status httpd
```

看到 `active (running)` 就表示 Apache 已启动。

CentOS 7 已于 2024 年 6 月 30 日结束维护，旧版本镜像可能出现 YUM 软件源失效的问题。

请更新系统yum源



## 四、创建网站根目录 /www

### 第1步：创建目录

```
mkdir -p /www
```

### 第2步：创建首页文件

```
echo "Welcome to Apache!" > /www/index.html
```

### 第3步：创建 404 错误页面

```
echo "404 - Page Not Found!" > /www/missing.html
```

注意：题目要求 404 错误页面为 `/missing.html`，这里指的是网站访问路径，对应的实际文件是 `/www/missing.html`。

### 第4步：设置目录权限

```
chmod 755 /www
chmod 644 /www/*.html
```

## 五、修改 Apache 配置文件

### 第1步：备份配置文件

```
cp /etc/httpd/conf/httpd.conf /etc/httpd/conf/httpd.conf.bak
```

### 第2步：打开配置文件

```
vi /etc/httpd/conf/httpd.conf
```

### 第3步：修改网站根目录

在 `vi` 中输入：

```
/DocumentRoot
```

按回车，找到原来的配置：

```
DocumentRoot "/var/www/html"
```

按 `i` 进入编辑模式，修改为：

```
DocumentRoot "/www"
```

### 第4步：禁止目录列出

在配置文件中添加下面这段配置，建议放在 `DocumentRoot "/www"` 后面：

```
<Directory "/www">
    Options -Indexes
    AllowOverride None
    Require all granted
</Directory>
```

其中：

- `Options -Indexes`：禁止目录列出。
- `AllowOverride None`：不允许 `.htaccess` 覆盖该目录配置。
- `Require all granted`：允许客户端访问该网站目录。

保留原来 `/var/www/html` 的 `<Directory>` 配置块也可以，不必删除。这里新增的是针对 `/www` 的规则。

### 第5步：设置 404 错误页面

在配置文件末尾添加：

```
ErrorDocument 404 /missing.html
```

当用户访问不存在的页面时，就会显示刚才创建的 `/www/missing.html` 文件内容。

### 第6步：隐藏 Apache 版本信息

继续在配置文件末尾添加：

```
ServerTokens Prod
ServerSignature Off
```

作用如下：

| 配置项                   | 作用                        |
| --------------------- | ------------------------- |
| `ServerTokens Prod`   | HTTP 响应头只显示 Apache，不显示版本号 |
| `ServerSignature Off` | 错误页面不显示 Apache 的服务器签名信息   |

这两个指令需要配合使用，才能满足题目的要求。


### 第7步：检查最终配置

你修改后的关键配置应包含以下内容：

httpd.conf 关键配置



```
DocumentRoot "/www"

<Directory "/www">
    Options -Indexes
    AllowOverride None
    Require all granted
</Directory>

ErrorDocument 404 /missing.html

ServerTokens Prod
ServerSignature Off
```

注意： 这是需要修改或添加的关键部分，不是让你把原来的 `httpd.conf` 全部删除。原有的模块加载、监听端口等配置都应保留。如果已有相同指令，修改原指令即可，避免重复配置。

修改完成后，按 `Esc`，输入：

```
:wq
```

保存并退出。

## 六、处理 SELinux 权限（CentOS 7 容易漏掉）

CentOS 7 默认可能启用 SELinux。由于你将网站根目录从 `/var/www/html` 改成了 `/www`，即使普通文件权限正确，Apache 也可能因为 SELinux 拒绝访问。

先查看 SELinux 状态：

```
getenforce
```

如果显示 `Enforcing`，继续执行：

```
yum install -y policycoreutils-python
```

然后设置 `/www` 的安全上下文：

```
semanage fcontext -a -t httpd_sys_content_t '/www(/.*)?'
```

应用安全上下文：

```
restorecon -Rv /www
```

这种方式比直接关闭 SELinux 更规范，也是 Red Hat 官方文档推荐的处理思路。

如果显示 `Disabled`，可以跳过这一部分。

## 七、检查配置并重启 Apache

### 第1步：检查语法

```
httpd -t
```

正常结果：

```
Syntax OK
```

如果显示错误，需要根据提示检查配置文件的拼写和语法。

### 第2步：重启服务

```
systemctl restart httpd
```

### 第3步：确认服务运行

```
systemctl is-active httpd
```

正常结果：

```
active
```

如果需要从其他计算机访问，再开放 HTTP 端口：

```
firewall-cmd --permanent --add-service=http
firewall-cmd --reload
```

前提是系统正在使用 firewalld。

## 八、逐项验证考试要求

1\. 验证网站根目录

```
curl http://127.0.0.1/
```

应当返回：

```
Welcome to Apache!
```

2\. 验证禁止目录列出

创建一个没有首页的目录：

```
mkdir -p /www/testdir
echo "hello" > /www/testdir/a.txt
```

测试：

```
curl -I http://127.0.0.1/testdir/
```

预期返回：

```
HTTP/1.1 403 Forbidden
```

说明客户端无法浏览该目录下的文件列表。

3\. 验证 404 错误页面

```
curl -i http://127.0.0.1/abc.html
```

预期 HTTP 状态码为 `404 Not Found`，响应正文包含：

```
404 - Page Not Found!
```

4\. 验证 Apache 版本隐藏

```
curl -I http://127.0.0.1/
```

响应头应当包含：

```
Server: Apache
```

而不是：

```
Server: Apache/2.4.6 (CentOS)
```

这说明服务器版本信息已经隐藏。

## 九、考试时的最简命令流程

如果是技能考核或实训考试，不需要每一步都写解释，可以直接按照下面的顺序操作。

CentOS 7 实操命令汇总


```shell
# 1. 创建用户
su - root
useradd test
passwd test
usermod -s /bin/sh test
usermod -L test

# 2. 检查与安装 Apache
rpm -q httpd
yum install -y httpd

# 3. 创建网站目录及页面
mkdir -p /www
echo "Welcome to Apache!" > /www/index.html
echo "404 - Page Not Found!" > /www/missing.html
chmod 755 /www
chmod 644 /www/*.html

# 4. 备份并修改配置文件
cp /etc/httpd/conf/httpd.conf /etc/httpd/conf/httpd.conf.bak
vi /etc/httpd/conf/httpd.conf

# 5. 检查配置并启动服务
httpd -t
systemctl enable --now httpd
systemctl restart httpd

# 6. 验证
curl -I http://127.0.0.1/
curl -i http://127.0.0.1/abc.html
```

