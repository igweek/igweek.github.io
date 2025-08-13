进入[云服务器ECS控制台](https://ecs.console.aliyun.com/home)，点击实例，选择领用ECS所在的地域，本实验为北京。

1. 在实例ID/名称下，找到领用的ECS实例，并点击实例ID进入实例详情。
    

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_d2ba685e754645e5bb92e25951f12f5f.png)

2. 重置实例密码。
    

3.1 在实例详情页面，单击重置实例密码。

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_609ba4a79db94b60a3dee46f4de4486c.png)

3.2 选择离线重置密码，输入新密码，并确认密码，点击确认保存密码。

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_8839c76b5ab14553917947f177965ae6.png)

3.3 选择重启，点击确认立即重启。

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_6bd97504564c459788ced737cb7c9ffe.png)

3.4 稍等一会，会看到实例显示运行中，此时密码已更改完成。

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_0324c2ad557b4c4db41ce9a8ee3110b8.png)

3. 添加安全组规则。
    

4.1 选择安全组，在所属安全组中，单击管理规则。

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_a66eb25ed92a47c4a7667d3325f205c7.png)

4.2 在如下页面中，选择入方向，单击手动添加。

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_44e1004cce8749b2a2cade23272809d8.png)

4.3 按照如下图所示添加配置规则，并单击保存。

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_2cf740c60fed4e658df9015a76e556ec.png)

### 3.2 未领用资源，直接创建ECS资源

1. 点击[ECS购买链接](https://ecs-buy.aliyun.com/ecs?spm=5176.8789780.J_4267641240.2.329e45b5Wx3QKQ#/custom/prepay/cn-shenzhen?fromDomain=true)，进入购买页面。
    
2. 在如下界面中，选择配置：
    

- 付费类型：您可按照需求选择包年包月或按量付费，此处选择按量付费。
    
- 地域：本实验选择北京。
    
- 网络及可用区：选择默认专有网络，默认交换机。
    

（如您之前创建过专有网络和交换机，可选择已有专有网络和交换机，您实际选择的地域和交换机中的可用区会影响您实例资源的选择，本示例中选择北京，因此可选择下方的2vCPU，8GiB，u1，您可参照本示例进行实验。若您选择其它地域其它可用区，可能没有此资源，不同地域的文件系统与云服务器ECS不能直接连通，本实验需保证ECS和NAS创建的地域一致，本实验示例地域都为北京。）

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_264e6f2d2823421a902f7ab1d3e0dff2.png)

- 在实例中，筛选2vCPU，8GiB，u1，如下所示选择规格：
    

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_28c8d02ae9eb46f69006c193ab587af7.png)

- 在镜像中，选择公共镜像，选择CentOS，选择CentOS 7.9 64位：
    

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_4b0460791e54446cb4634a2bb105733e.png)

- 在系统盘中，配置默认即可：
    

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_b69fe06f2ed04d22a7222471210be489.png)

- 公网IP：选择分配公网IPv4地址；
    
- 带宽计费模式：选择按使用流量；
    
- 带宽峰值：选择1；
    
- 安全组：选择新建安全组；
    
- 安全组类型：普通安全组；
    
- 开通IPv4端口：选择SSH（22），HTTP（80），RDP（3389）。
    

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_9ef46eeafd974d69a689e96f2b9286c6.png)

- 登录凭证选择自定义密码，请输入登录密码，以及确认密码：
    

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_4c36a0844eac4296b4a577e97403191e.png)

3. 勾选服务条款，点击确认下单，即可创建ECS。

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_8d63dd8ee5ab4b519846d747a612b08f.png)

3. 安装OwnCloud

OwnCloud是一款开源的云存储软件，基于PHP的自建网盘。基本上是私人使用，没有用户注册功能，但是有用户添加功能，你可以无限制地添加用户，OwnCloud支持多个平台（windows，MAC，Android，IOS，Linux）。

1. 返回[ECS控制台](https://ecs.console.aliyun.com/#/server/region/cn-beijing)，在实例界面中，找到创建的实例，点击远程连接。
    

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_cc855180bd794285b4c581daab899db2.png)

如下所示，在通过Workbench远程连接中，点击立即登录。

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_c1c882725349480789f863feb6fb418d.png)

在如下所示中，输入之前ECS设置的密码，点击确定。

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_2178c0ae7dcb46e3b1f3e6d62b532984.png)

2. 进入命令行界面，执行以下命令，添加一个新的软件源：
    

```
cd /etc/yum.repos.d/
wget --no-check-certificate https://download.opensuse.org/repositories/isv:ownCloud:server:10/CentOS_7/isv:ownCloud:server:10.repo
```

3. 执行以下命令进入root目录：
    

```
cd /root/
```

4. 执行以下命令安装OwnCloud-files：
    

```
yum -y install https://labfileapp.oss-cn-hangzhou.aliyuncs.com/owncloud-complete-files-10.5.0-3.1.noarch.rpm
```

5. 执行以下命令查看安装是否成功：
    

```
ll /var/www/html
```

安装成功打印如下：

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_820a8eb6b8614979aa44936fa16f3396.png)

4. 安装Apache服务

5. 执行以下命令安装Apache服务：
    

```
yum install httpd -y
```

2. 执行以下命令启动Apache服务：
    

```
systemctl start httpd.service
```

3. 打开浏览器输入创建的ECS的弹性公网IP，如果出现如下图内容表示Apache安装成功：
    

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_c55c38622ec54f0cbf1117e1bc7df033.png)

4. 添加OwnCloud配置
    

4.1 执行以下命令打开Apache配置文件：

```
vim /etc/httpd/conf/httpd.conf
```

4.2 按i键进入文件编辑模式，添加以下内容：
```php
# owncloud config
Alias /owncloud "/var/www/html/owncloud/"
<Directory /var/www/html/owncloud/>
    Options +FollowSymlinks
    AllowOverride All
    <IfModule mod_dav.c>
        Dav off
    </IfModule>
    SetEnv HOME /var/www/html/owncloud
    SetEnv HTTP_HOME /var/www/html/owncloud
</Directory>
```

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_1b9e9fda31ed43d2909a4bc20c37efdb.png)

4.3 按esc键退出编辑模式，然后输入:wq保存并退出配置文件。
由于OwnCloud是基于PHP开发的云存储软件，需要PHP运行环境，请根据以下步骤完成OwnCloud工作环境的配置。

1. 执行以下命令手动更新rpm源。
    

```
rpm -Uvh https://labfileapp.oss-cn-hangzhou.aliyuncs.com/epel-release-latest-7.noarch.rpm 
rpm -Uvh https://labfileapp.oss-cn-hangzhou.aliyuncs.com/webtatic-release.rpm
```

2. 执行以下命令安装PHP 7.2版本。
    

说明：OwnCloud只支持PHP 5.6+。

```
yum -y install php72w
yum -y install php72w-cli php72w-common php72w-devel php72w-mysql php72w-xml php72w-odbc php72w-gd php72w-intl php72w-mbstring
```

3. 执行以下命令检测PHP是否安装成功。
    

```
php -v
```

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_96fc6b95748a4eb38b7d2fe7d1904f2b.png)

4. 将PHP配置到Apache中。
    

4.1 执行以下命令，找到php.ini文件目录。

```
find / -name php.ini
```

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_8bd3091fb00a403c8204f0a78b960fd5.png)

4.2 执行以下命令打开httpd.conf文件。

```
vi /etc/httpd/conf/httpd.conf
```

4.3按i键进入文件编辑模式，然后在文件最后添加以下内容。

```
PHPIniDir /etc/php.ini
```

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_b43bccba5d4947b495ad522f58667be9.png)

4.4 按esc键退出编辑模式，然后输入:wq保存并退出配置文件。

4.5 执行以下命令，重启Apache服务。

```
systemctl restart httpd.service
```

完成上述配置后，您就可以登录OwnCloud创建个人网盘了。

1. 在本机浏览器中，输入：ECS弹性IP/owncloud，例如1.1.1.1/owncloud。
    
2. 自定义输入管理员账号和密码，然后单击存储&数据库，选择SQLite，最后单击安装完成。
    

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_ffbefefea2cd451cbe39a6276ecc91f3.png)

3. 输入已创建的用户名和密码，登录Owncloud。
    

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_0edaf36484fc4b75b06d470663d90521.png)

登录成功界面如下：

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_685bca1ca9a4453e86307447b0697d84.png)

7. 创建并挂载NAS服务

本步骤将指导您创建并挂载NAS服务。

若您未领用NAS免费资源，或者是使用个人账号资源，创建NAS会产生费用，请您注意个人资源的费用使用情况，费用详情请参看[计费概述](https://help.aliyun.com/zh/nas/product-overview/overview-1?spm=a2c4g.11174283.0.0.294b1dd7fGOb1F)。

1. 进入nas控制台：[https://nasnext.console.aliyun.com/overview](https://nasnext.console.aliyun.com/overview)
    
2. 选择地域，此处选择北京，点击文件系统列表，点击创建文件系统。
    

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_2124c7d8fd94433f995f5cda9b99beab.png)

3. 弹出如下所示框，点击创建通用型NAS。
    

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_8626e5dc10ee44e782c01b7bb3a6dede.png)

4. 本例子中选择北京，存储规格选择容量型（不同可用区有不同的规格，本例子选了可用区H，您可按需选择有容量型的可用区），协议类型选择NFS。
    

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_7a0c88a88ccc4309b86c26b2578274a3.png)

其它配置可保持默认。

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_7eda07ff31b940e8a475fd667489053e.png)

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_db8564d1d5af4458abb902b09bbbe1ae.png)

此处选择ecs创建的默认专有网络和默认虚拟交换机。勾选服务协议，并点击立即购买。

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_2296a35dc154428b847353b84e7e9d14.png)

5. 创建成功后，如下所示：
    

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_e4fb227356b64dde8bed39c37b9a6311.png)

6. 在文件系统列表中，如下所示，找到刚才创建的文件系统，并在右侧操作列下点击管理。
    

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_53e17930818b4532a271fd6d8f667fc4.png)

7. 在如下所示界面中，选择挂载使用。
    

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_04a2ab06a1b04b68a2128a254ac02ef9.png)

8. 如下图所示，点击通过命令行挂载到ECS。
    

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_2ac8d03083ab4f40978dbb170908f6cb.png)

9. 切换至命令行终端页面，执行以下命令配置Linux ECS实例。
    

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_dad11af40eb540b1b12e2400a96438af.png)

9.1 执行以下命令，在ECS实例上安装NFS客户端。

```
sudo yum install nfs-utils
```

9.2 执行以下命令，提高同时发起的NFS请求数量。

```
sudo echo "options sunrpc tcp_slot_table_entries=128" >>  /etc/modprobe.d/sunrpc.conf 
sudo echo "options sunrpc tcp_max_slot_table_entries=128" >>  /etc/modprobe.d/sunrpc.conf
```

10. 复制挂载NFS文件系统的命令，并且您需要将命令中/mnt改为/var/www/html/owncloud/data/admin/files。
    

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_4487d8fb4b064d9b95dbfa3e8ecbcd0a.png)

11. 切换至命令行终端页面，执行上一步骤修改后的挂载命令。
    
12. 执行以下命令，如果结果中存在NFS文件系统的挂载地址，则说明挂载成功：
    

```
df -h | grep aliyun
```

![](https://ucc.alicdn.com/pic/developer-ecology/bu5w4c5dg2xgs_b231bcca4fa54271bbcba9ec6e9cd21c.png)

注意：NAS挂载成功后，OwnCloud网盘中的默认目录和文件不可读写，请在网盘中新建目录上传。

13. 您现在可以在OwnCloud网盘中，新建文件夹并上传文件，并且可以在/var/www/html/owncloud/data/admin/files目录下查找到您上传的文件。
    

```
cd /var/www/html/owncloud/data/admin/files
```