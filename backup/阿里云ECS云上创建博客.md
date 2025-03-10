
| 配置项    | 示例                                         |
| ------ | ------------------------------------------ |
| 地域及可用区 | 地域：华东1（杭州）<br><br>可用区：随机分配                 |
| 实例规格   | 规格族：共享标准型 s6<br><br>实例规格：ecs.s6-c1m1.small |
| 镜像     | 类型：公共镜像<br><br>版本：CentOS 7.7 64位           |
3. 安装并配置Apache服务

Apache是Web服务器软件。本步骤将指导您如何在ECS实例上安装并配置Apache服务。

1. 在实验室页面右侧，单击单击![](https://ucc.alicdn.com/pic/developer-ecology/1257d03a12f749dbad0d7179166f972e.png) 图标，切换至Web Terminal。
    

输入ECS服务器登录用户名和密码，登录ECS。

![](https://ucc.alicdn.com/pic/developer-ecology/o23ywodss4pji_289717ec88294bd9baf0f8abae6ff707.png)

2. 安装Apache。
    

2.1 执行如下命令，安装Apache服务及其扩展包。（本实验基于CentOS操作系统，如您是其他操作系统，请参考以下链接进行安装。[https://help.aliyun.com/document_detail/461494.html](https://help.aliyun.com/document_detail/461494.html)）

```shell
yum -y install httpd mod_ssl mod_perl mod_auth_mysql
```

2.2 执行如下命令，查看Apache是否安装成功。

```shell
httpd -v
```

返回结果如下所示，表示您已成功安装Apache。

![](https://ucc.alicdn.com/pic/developer-ecology/d65f51fb8c194c07857bac6058962c62.png)

3. 执行如下命令，启动Apache服务。
    

```shell
systemctl start httpd.service
```

4. 在您的本机浏览器的地址栏中，访问http://ECS公网地址。
    

说明 ：您需要将ECS公网地址替换为您的ECS公网地址，您可在[云服务器ECS控制台](https://ecs.console.aliyun.com/home)的实例页面中查看到到ECS公网地址。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_d9e8064c9d3a4145a91d6c4d8781dd0d.png)

若返回页面如下图所示，说明Apache服务启动成功。

![](https://ucc.alicdn.com/pic/developer-ecology/061df6b1bc5d4aca9675412962817203.png)

4. 安装MariaDB数据库

由于使用WordPress搭建云上博客，需要使用MySQL数据库存储数据。本步骤将指导您如何在ECS实例上安装MySQL的开源替代品MariaDB（MariaDB兼容MySQL），并创建博客数据库。

1. 在实验室右侧的功能栏中，单击![](https://ucc.alicdn.com/pic/developer-ecology/79afc6361a6c44d1a21b9cc4aab8ab50.png) 图标，切换至Web Terminal。
    
2. 执行如下命令，安装MariaDB Server。
    

```shell
yum install -y mariadb-server
```

返回如下命令，表示您已安装完成MariaDB Server。

![](https://ucc.alicdn.com/pic/developer-ecology/0e3cfb258c7948639bbe0bb1870285f2.png)

3. 执行如下命令，启动MariaDB Server。
    

```shell
systemctl start mariadb
```

4. 执行如下命令，查看MariaDB Server运行状态。
    

```shell
systemctl status mariadb
```

返回结果如下，您可以看到active (running)时，表示MariaDB Server启动成功。

![](https://ucc.alicdn.com/pic/developer-ecology/970289f7e8554567901f67f81a0b8eba.png)

5. 执行如下命令，设置数据库root用户的初始密码。
    

```shell
mysqladmin -u root -p password
```

返回如下结果，由于您是第一次设置数据库密码，因此在出现Enter Password提示符的时，直接回车即可。

![](https://ucc.alicdn.com/pic/developer-ecology/7c6c16681b6a4f4aae4bf4ff82f81124.png)

返回如下结果，输入新密码为123456789，回车后再次输入123456789即可。（输入的密码不会显示出来，这是正常的，没有出错）

![](https://ucc.alicdn.com/pic/developer-ecology/409c81b5502342b6980f577ec4680984.png)

6. 执行如下命令，连接数据库。
    

```shell
mysql -uroot -p
```

返回如下结果，出现Enter password提示符的时，输入root用户的密码123456789，即可登录数据库。（输入的密码是不会显示的，这是正常的，没有出错哦）

![](https://ucc.alicdn.com/pic/developer-ecology/bd4c9d10dd664c94b15a2d1a89a2d217.png)

7. 执行如下命令，创建WordPress数据库。
    

```shell
create database wordpress;
```

8. 执行如下命令，查看数据库。
    

```shell
show databases;
```

返回结果如下，您可以看到您创建的WordPress数据库。

![](https://ucc.alicdn.com/pic/developer-ecology/d9467569fade4896be1c91b5e44cc367.png)

9. 执行如下命令，退出数据库。
    

```shell
exit;
```

5. 安装PHP

PHP是一种广泛使用的通用开源脚本语言，适合于Web网站开发，它可以嵌入HTML中。本步骤将指导您如何在ECS实例上安装并配置PHP服务。

1. 执行如下命令，安装PHP。
    

```shell
yum -y install php php-mysql gd php-gd gd-devel php-xml php-common php-mbstring php-ldap php-pear php-xmlrpc php-imap
```

返回如下结果，表示您已安装完成PHP。

![](https://ucc.alicdn.com/pic/developer-ecology/67c7015b1d884250b0771dbf1e7c3e43.png)

2. 执行如下命令，创建PHP测试页面。
    

```shell
echo "<?php phpinfo(); ?>" > /var/www/html/phpinfo.php
```

3. 执行如下命令，重启Apache服务。
    

```shell
systemctl restart httpd
```

4. 在浏览器的地址栏中，访问http://<ECS公网地址>/phpinfo.php。
    

说明 ：您需要将<ECS公网地址>替换为ECS公网地址。

返回如下页面，表示PHP语言环境安装成功。

![](https://ucc.alicdn.com/pic/developer-ecology/05fc7bd1b741497584623b29f0dfe6fe.png)

6. 安装和配置WordPress

本步骤将指导您如何在ECS上安装和配置WordPress。

1. 在实验室页面右侧，单击![](https://ucc.alicdn.com/pic/developer-ecology/348504cd13634d7d96e1bfeb0605fed7.png) 图标，切换至Web Terminal。
    
2. 执行如下命令，安装WordPress。
    

```shell
yum -y install wordpress
```

返回如下结果，表示您已安装完成WordPress。

![](https://ucc.alicdn.com/pic/developer-ecology/436daa8a91694b5f9f18763ec125c5c7.png)

3. 修改WordPress配置文件。
    

3.1 执行如下命令，修改wp-config.php指向路径为绝对路径。

```shell
# 进入/usr/share/wordpress目录。
cd /usr/share/wordpress
# 修改路径。
ln -snf /etc/wordpress/wp-config.php wp-config.php
# 查看修改后的目录结构。
ll
```

3.2 执行如下命令，移动wordpress文件到Apache根目录。

```shell
# 在Apache的根目录/var/www/html下，创建一个wp-blog文件夹。
mkdir /var/www/html/wp-blog
mv * /var/www/html/wp-blog/
```

3.3 执行以下命令，修改wp-config.php配置文件。

```shell
sed -i 's/database_name_here/wordpress/' /var/www/html/wp-blog/wp-config.php
sed -i 's/username_here/root/' /var/www/html/wp-blog/wp-config.php
sed -i 's/password_here/123456789/' /var/www/html/wp-blog/wp-config.php
```

3.4 执行以下命令，查看配置文件信息是否修改成功。

```shell
cat -n /var/www/html/wp-blog/wp-config.php
```

返回如下结果，您可以看到配置文件相关信息已修改成功。

![](https://ucc.alicdn.com/pic/developer-ecology/d5fdb0354e7d4b828b3f6d8648d51d7f.png)

3.5 执行如下命令，重启Apache服务。

```shell
systemctl restart httpd
```


7. 测试WordPress

完成以上所有步骤后，您就可以测试基于ECS所搭建的云上博客了。

1. 在浏览器地址栏中，访问http://<ECS公网地址>/wp-blog/wp-admin/install.php。
    

说明：您需要将<ECS公网地址>替换为ECS公网地址。例如：http://192.168.0.1/wp-blog/wp-admin/install.php

如您选择了公共资源进行实验，也可以在实验室页面右侧，单击![](https://ucc.alicdn.com/pic/developer-ecology/89c469ba710d40198bcf1f3f54830f98.png) 图标，切换至远程桌面，使用远程桌面的Chromium网页浏览器访问地址。

2. 在WordPress配置页面，配置相关信息，然后单击Install WordPress。
    

参数说明：

- Site Title：站点名称。本示例为Hello ABC。
    
- Username：管理员用户名。本示例为admin。
    
- Password：访问密码。本示例为Cm%c4(MKI3gQwGk8ap。
    
- Your Email：邮箱地址，建议使用真实有效的邮箱地址。若没有，可以填写虚拟邮箱地址，但将无法接收信息。本示例为admin@admin.com。
    

![](https://ucc.alicdn.com/pic/developer-ecology/8a4906c97903460e94e276867a281346.png)

3. 在Success！页面，单击Log In。
    

![](https://ucc.alicdn.com/pic/developer-ecology/9b47419bd5354154a1be4759b013530b.png)

4. 在登录页面，输入您的用户名和密码，单击Log In。
    

![](https://ucc.alicdn.com/pic/developer-ecology/15db8dba6d1840c79732ac4a2fb3a5cd.png)

返回如下页面，表示您已成功登录博客首页，你即可进行博客发布等操作。

![](https://ucc.alicdn.com/pic/developer-ecology/d71376dbbf7a418487c54e65aeda769e.png)