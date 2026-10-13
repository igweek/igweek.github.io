> [!note]
创建 test 普通用户，然后给其设置一个密码，并修改该登录 shell 为 /bin/sh；最后将该用户禁用，修改 /etc/httpd/conf/httpd.conf 配置文件，设置网站根目录为 /www（目录自行创建），禁止目录列出，设置 404 错误页面为 /missing.html，设置 Apache 在错误页面时不回显任何版本信息。


在 CentOS 7 系统中，以下是完成用户管理与 Apache（httpd）配置的完整操作步骤及验证方法。

---

## 一、用户管理配置

### 1. 创建 test 普通用户

```bash
useradd test

```

* **验证：** 执行 `id test`，返回用户 UID、GID 及所属组信息即表示创建成功。

### 2. 设置用户密码

```bash
passwd test

```

按提示连续输入两次密码（也可通过 `echo "你的密码" | passwd --stdin test` 非交互式设置）。

* **验证：** 终端提示 `passwd: all authentication tokens updated successfully.` 即表示密码设置成功。

### 3. 修改默认登录 Shell 为 `/bin/sh`

```bash
usermod -s /bin/sh test

```

* **验证：** 执行 `grep "^test:" /etc/passwd`，末尾字段显示 `/bin/sh` 即生效：
```text
test:x:1001:1001::/home/test:/bin/sh

```



### 4. 禁用（锁定）test 用户

```bash
usermod -L test

```

*(注：也可以使用 `passwd -l test` 锁定)*

* **验证：** 执行 `passwd -S test`，输出结果中状态字段显示为 `LK`（Locked）或包含 `Password locked`；或者查看 `/etc/shadow`，对应密码密文前出现感叹号 `!`。

---

## 二、Apache 网站与目录配置

### 1. 创建网站根目录及 404 自定义页面

```bash
mkdir -p /www
echo "<h1>Welcome to /www</h1>" > /www/index.html
echo "<h1>404 - Page Not Found</h1>" > /www/missing.html
chmod -R 755 /www

```

* **SELinux 权限放行（重要）：** CentOS 7 默认启用 SELinux，若网站根目录设在默认路径 `/var/www` 之外，需更新安全上下文，否则访问会报 403 Forbidden：
```bash
semanage fcontext -a -t httpd_sys_content_t "/www(/.*)?" 2>/dev/null || true
restorecon -Rv /www

```


* **验证：** 执行 `ls -Zd /www`，上下文显示包含 `httpd_sys_content_t` 即表示权限配置正确。

---

### 2. 修改 `/etc/httpd/conf/httpd.conf`

使用编辑器打开主配置文件：

```bash
vi /etc/httpd/conf/httpd.conf

```

#### ① 修改网站根目录 `DocumentRoot`

找到 `DocumentRoot "/var/www/html"`，将其修改为：

```apache
DocumentRoot "/www"

```

#### ② 修改根目录授权并禁止目录列出（禁用 Indexes）

找到 `<Directory "/var/www/html">` 代码块，将路径改为 `/www`，并将 `Options Indexes FollowSymLinks` 中的 `Indexes` 移除或改为 `-Indexes`：

```apache
<Directory "/www">
    Options -Indexes +FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>

```

#### ③ 配置 404 错误页面重定向

在文件中加入（或取消注释并修改）`ErrorDocument` 指令：

```apache
ErrorDocument 404 /missing.html

```

#### ④ 隐藏错误页面版本信息与 Server Banner

在文件末尾添加以下两行，关闭错误页面的版本签名，并将 HTTP 响应头中的版本标识降至最低：

```apache
ServerSignature Off
ServerTokens Prod

```

---

### 3. 测试语法并重启服务

```bash
httpd -t
systemctl restart httpd

```

* **验证：** `httpd -t` 输出 `Syntax OK` 即表示配置文件语法无误；`systemctl status httpd` 显示 `active (running)` 即表示服务已成功启动。

---

### 4. 最终功能验证

* **验证根目录访问：**
```bash
curl http://127.0.0.1/

```


*返回 `Welcome to /www` 即成功。*
* **验证 404 页面及无版本回显：**
```bash
curl -i http://127.0.0.1/notfound.html

```


*返回状态码 `404 Not Found`，响应内容为 `/missing.html` 的自定义内容，且页面与响应头中均不携带 Apache 具体版本号（仅显示 `Server: Apache`，页面底部无服务器版本签名）。*

