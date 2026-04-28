# CentOS 8搭建 OpenStack(yoga版) 的方法和步骤

### **一、OpenStak简介**

#### 1.1、简介

OpenStack既是一个社区，也是一个项目和一个开源软件，提供开放源码软件，建立公共和私有云，它提供了一个部署云的操作平台或工具集，其宗旨在于：帮助组织运行为虚拟计算或存储服务的云，为公有云、私有云，也为大云、小云提供可扩展的、灵活的云计算。  
OpenStackd开源项目由社区维护，包括OpenStack计算（代号为Nova），OpenStack对象存储（代号为Swift），并OpenStack镜像服务（代号Glance）的集合。 OpenStack提供了一个操作平台，或工具包，用于编排云。
  
### **二、前期准备工作**

#### 2.1、准备3台虚拟机（1个控制节点、2个计算节点）

![](https://img2023.cnblogs.com/blog/1422438/202309/1422438-20230908010100666-1008160564.jpg)
    
    
    - 首先安装VMware WorkStations（最新版），
    - 新增虚拟机，
    - 镜像使用CentOS-Stream-8-x86_64-latest-dvd1.iso（下载地址<https://mirrors.tuna.tsinghua.edu.cn/centos/8-stream/isos/x86_64/CentOS-Stream-8-x86_64-latest-dvd1.iso>）
    - 安装完成后克隆两台虚拟机(计算节点)。
    

#### 2.2、虚拟机的性能要求：
    
    
    -  内存大于等于8G
    -  硬盘200G
    -  CPU至少2核，开启vt-x
    -  网卡2块，一张网卡用来连接互联网，另外一张网卡用来内部互联。
    

注意事项：

![](https://img2023.cnblogs.com/blog/1422438/202309/1422438-20230907003430909-61582897.jpg)

![](https://img2023.cnblogs.com/blog/1422438/202309/1422438-20230907003445356-151938428.jpg)

Kdump（kernel dump，内核备份），内存小于2G，则Kdump就不会生效。所以想生效，内存必须大于2G，当安装界面的Kdump不管勾不勾选，都会占用160M内存。  
如果勾选了，系统每次启动时，内核会被读到160M内存中，如果系统崩溃，就可以还原内核。如果不勾选，当内核崩溃时，就无法恢复。  
  


### 三、系统初始化配置

#### 3.1、主机名配置
    
    
    [root@controller ~]# hostnamectl set-hostname controller
    [root@computer1 ~]# hostnamectl set-hostname computer1
    [root@computer2 ~]# hostnamectl set-hostname computer2
    

#### 3.2、网络配置

控制节点：
    
    
    [root@controller ~]# cat /etc/sysconfig/network-scripts/ifcfg-ens160 
    TYPE=Ethernet
    PROXY_METHOD=none
    BROWSER_ONLY=no
    BOOTPROTO=none
    DEFROUTE=yes
    IPV4_FAILURE_FATAL=no
    IPV6INIT=yes
    IPV6_AUTOCONF=yes
    IPV6_DEFROUTE=yes
    IPV6_FAILURE_FATAL=no
    IPV6_ADDR_GEN_MODE=eui64
    NAME=ens160
    DEVICE=ens160
    ONBOOT=yes
    IPADDR=192.168.100.54
    PREFIX=24
    GATEWAY=192.168.100.1
    DNS1=223.5.5.5
    DNS2=23.6.6.6
    

计算节点1：
    
    
    [root@computer1 ~]# cat /etc/sysconfig/network-scripts/ifcfg-ens160 
    TYPE=Ethernet
    PROXY_METHOD=none
    BROWSER_ONLY=no
    BOOTPROTO=none
    DEFROUTE=yes
    IPV4_FAILURE_FATAL=no
    IPV6INIT=yes
    IPV6_AUTOCONF=yes
    IPV6_DEFROUTE=yes
    IPV6_FAILURE_FATAL=no
    IPV6_ADDR_GEN_MODE=eui64
    NAME=ens160
    DEVICE=ens160
    ONBOOT=yes
    IPADDR=192.168.100.55
    PREFIX=24
    GATEWAY=192.168.100.1
    DNS1=223.5.5.5
    DNS2=23.6.6.6
    

计算节点2：
    
    
    [root@computer2 ~]# cat /etc/sysconfig/network-scripts/ifcfg-ens160 
    TYPE=Ethernet
    PROXY_METHOD=none
    BROWSER_ONLY=no
    BOOTPROTO=none
    DEFROUTE=yes
    IPV4_FAILURE_FATAL=no
    IPV6INIT=yes
    IPV6_AUTOCONF=yes
    IPV6_DEFROUTE=yes
    IPV6_FAILURE_FATAL=no
    IPV6_ADDR_GEN_MODE=eui64
    NAME=ens160
    DEVICE=ens160
    ONBOOT=yes
    IPADDR=192.168.100.56
    PREFIX=24
    GATEWAY=192.168.100.1
    DNS1=223.5.5.5
    DNS2=23.6.6.6
    

#重新加载配置文件  
nmcli connection reload   
#重启网卡  
nmcli connection up ens160   
同理在计算节点也使用相同命令，确保配置生效。

#### 3.3、修改网卡UUID
    
    
    #由于使用的虚拟机是通过模板克隆的，需要修改网卡UUID
    
    #查看网卡UUID
    nmcli con show
    
    #获取新的UUID
    uuidgen ens160
    
    #重新加载配置文件
    nmcli connection reload
    
    #重启网卡
    nmcli connection up ens160 
    
    #删除网卡原有的UUID，把新生成的UUID加到网卡配置文件中重启网卡即可
    

#### 3.4、设置免密登录
    
    
    #在controller节点上生成ssh key，将公钥复制给其他节点，实现免密登陆。
    
    ssh-keygen
    
    一路回车
    
    #拷贝公钥到另外2个计算节点
    ssh-copy-id -i /root/.ssh/id_rsa.pub 192.168.100.55
    ssh-copy-id -i /root/.ssh/id_rsa.pub 192.168.100.56
    
    #测试ssh免密链接是否正常（完成3.5后测试）
    ssh computer1
    ssh computer2
    

####  3.5、添加hosts文件主机记录
    
    
    [root@controller ~]# cat /etc/hosts
    127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
    ::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
    192.168.100.54 controller
    192.168.100.55 computer1
    192.168.100.56 computer2
    
    #将以上控制节点的配置拷贝到两个计算节点对应的文件夹里。
    scp /etc/hosts root@192.168.100.55:/etc
    scp /etc/hosts root@192.168.100.56:/etc
    

####  3.6、关闭所有节点防火墙和SeLinux
    
    
    systemctl disable firewalld.service --now
    
    sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config 
    

#### 3.7、配置ntp时间服务器
    
    
    #选择在控制节点上部署NTP时间服务器。
    yum -y install chrony
    
    #配置开机自启
    systemctl enable chronyd --now
    
    #修改配置文件，让控制节点成为NTP服务器。
    cat /etc/chrony.conf
    
    # Use public servers from the pool.ntp.org project.
    # Please consider joining the pool (http://www.pool.ntp.org/join.html).
    # pool 2.centos.pool.ntp.org iburst（注释掉默认的NTP服务器）
    # Record the rate at which the system clock gains/losses time.
    driftfile /var/lib/chrony/drift
    # Allow the system clock to be stepped in the first three updates
    # if its offset is larger than 1 second.
    makestep 1.0 3
    # Enable kernel synchronization of the real-time clock (RTC).
    rtcsync
    # Enable hardware timestamping on all interfaces that support it.
    #hwtimestamp \*
    # Increase the minimum number of selectable sources required to adjust
    # the system clock.
    #minsources 2
    # Allow NTP client access from local network.
    allow 192.168.0.0/16（取消注释，网络地址以及端口号需要包含计算节点）
    # Serve time even if not synchronized to a time source.
    local stratum 10（取消注释）
    # Specify file containing keys for NTP authentication.
    keyfile /etc/chrony.keys
    # Get TAI-UTC offset and leap seconds from the system tz database.
    leapsectz right/UTC
    # Specify directory for log files.
    logdir /var/log/chrony
    # Select which information is logged.
    #log measurements statistics tracking
    
    #修改两个计算节点的chrony配置文件，配置相同。
    vim /etc/chrony.conf
    # Use public servers from the pool.ntp.org project.
    # Please consider joining the pool (http://www.pool.ntp.org/join.html).
    #pool 2.centos.pool.ntp.org iburst（注释掉）
    pool controller iburst（新增一条）
    
    #修改完成后重启服务
    systemctl restart chronyd.service
    
    vim /etc/chrony.conf
    # Use public servers from the pool.ntp.org project.
    # Please consider joining the pool (http://www.pool.ntp.org/join.html).
    #pool 2.centos.pool.ntp.org iburst（注释掉）
    pool controller iburst（新增一条）
    
    #修改完成后重启服务
    systemctl restart chronyd.service
    

#### 3.8、在所有节点上都开启openstack安装源
    
    
    yum -y install centos-release-openstack-yoga
    yum config-manager --set-enabled powertools
    
    yum -y upgrade
    yum -y install python3-openstackclient 
    yum -y install openstack-selinux
    

++++++++++++++++++++++++++++++++++++++++++++关闭3台主机并拍摄快照+++++++++++++++++++++++++++++++++++++++++

### **四、在controller控制节点安装配置相关服务**

####  4.1、安装和配置MariaDB数据库

## 大多数OpenStack服务使用一个SQL数据库来存储信息，数据库通常运行在控制器节点上。

## 本指南使用MariaDB或MySQL，OpenStack服务还支持其他SQL数据库（包括PostgreSQL）。
    
    
    #安装
    [root@controller ~]# yum -y install mariadb mariadb-server python2-PyMySQL 
    			mariadb-server 数据库后台服务
    			python2-PyMySQL 实现OpenStack与数据库相连的模块	
    
    增加openstack.cnf文件
    [root@controller ~]# cat /etc/my.cnf.d/openstack.cnf
    # 声明以下为数据库服务端的配置
    [mysqld]
    # 绑定远程访问地址，只允许从该地址访问数据库
    bind-address = 192.168.100.54
    # 默认存储引擎（Innodb是比较常用的支持事务的存储引擎）
    default-storage-engine = innodb
    # Innodb引擎的独立表空间，使每张表的数据都单独保存
    innodb_file_per_table = on
    # 最大连接数
    max_connections = 4096
    # 排列字符集（字符集的排序规则，每个字符集都对应一个或多个排列字符集）
    collation-server = utf8_general_ci
    # 字符集
    character-set-server = utf8
    
    #设为开机自启
    systemctl enable mariadb.service --now
    
    #初始化mysql
    mysql_secure_installation
    
    #重启数据库服务
    systemctl restart mariadb.service
    
    mysql -uroot -predhat
    #允许root数据库管理员从任何远程位置，来访问MySQL数据库
    GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' IDENTIFIED BY 'redhat';
    GRANT ALL PRIVILEGES ON *.* TO 'root'@'controller' IDENTIFIED BY 'redhat';
    GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'redhat';
    FLUSH PRIVILEGES;
    select host,user,password from mysql.user;
    exit
    systemctl restart mariadb.service
    

mysql_secure_installation初始化说明：  


![](https://img2023.cnblogs.com/blog/1422438/202309/1422438-20230907011016953-1036045723.jpg)

![](https://img2023.cnblogs.com/blog/1422438/202309/1422438-20230907011026599-1468863370.jpg)

#### 4.2、在controller控制节点上安装RabbitMQ消息队列并进行相关配置

## OpenStack使用消息队列来协调操作和状态信息等服务，消息队列服务通常运行在控制器节点上。
    
    
    #安装
    yum -y install rabbitmq-server
    
    #设为开机自启
    systemctl enable rabbitmq-server.service --now 
    systemctl start rabbitmq-server.service
    
    #添加一个名为openstack的用户和密码
    rabbitmqctl add_user openstack redhat
    
    #针对openstack用户配置权限为：write写入权限、read读取权限：
    rabbitmqctl set_permissions openstack ".*" ".*" ".*"
    
    #查看用户权限
    rabbitmqctl list_user_permissions openstack
    Listing permissions for user "openstack" ...
    vhost	configure	write	read
    /	.*	.*	.*
    每一个RabbitMQ服务器定义一个默认的虚拟机“/”，openstack用户对于该虚拟机的所有资源拥有配置、写入、读取的权限
    
    #查看用户
    rabbitmqctl list_users
    
    #重启服务
    systemctl restart rabbitmq-server.service
    
    #查看监听端口
    netstat -tunlp | grep beam
    
    配置：RabbitMQ队列服务的Web访问页面
    ## 查看RrabbitMQ支持的插件
    rabbitmq-plugins list
    
    ## 启动RrabbitMQ的rabbitmq_management插件
    rabbitmq-plugins enable rabbitmq_management
    
    systemctl restart rabbitmq-server.service
    
    netstat -tunlp | grep beam
    
    lsof -i:15672
    

在web界面访问192.168.100.54:15672（账号和密码都是guest）

![](https://img2023.cnblogs.com/blog/1422438/202309/1422438-20230907013154257-2063055261.jpg)

#### 4.3、在controller控制节点上安装Memcached（缓存token）

## Identity service（身份验证服务）的验证机制，使用Memcached来缓存<tokens令牌>。  
## memcached服务通常运行在控制器节点上。  
## 在生产环境的部署中，建议启用防火墙、身份验证和加密来保护<memcached服务>。
    
    
    #安装
    yum -y install memcached python3-memcached
    			memcached 内存缓存服务软件
    			python-memcached 对该服务进行管理的接口软件
    
    #添加memcached监听
    vim /etc/sysconfig/memcached
    
    手动修改以下内容：
    # 服务端口
    PORT="11211"
    # 用户名（默认使用自动创建的memcached用户）
    USER="memcached"
    # 允许的最大连接数
    MAXCONN="1024"
    # 最大缓存大小（MB）
    CACHESIZE="64"
    # 其他选项（）默认对本地访问进行监听（可将要监听的地址加入这里）
    OPTIONS="-l 127.0.0.1"
    
    #设为开启自启
    systemctl enable memcached.service --now
    
    systemctl start memcached.service
    
    # 测试：检测服务运行情况
    netstat -tnlup | grep memcached
    tcp        0      0 127.0.0.1:11211         0.0.0.0:*               LISTEN      921/memcached 
    

####  4.4、在controller控制节点上安装etcd键值对数据库
    
    
    # 安装etcd 分布式键-值对存储系统
    yum -y install etcd
    
    #配置
    vim /etc/etcd/etcd.conf
    分别在[Member]、[Clustering]下手动修改以下内容
    #[Member]
    #ETCD数据目录
    ETCD_DATA_DIR="/var/lib/etcd/default.etcd"
    用于监听其他etcd成员的地址（只能是地址，不能写域名）
    ETCD_LISTEN_PEER_URLS="http://192.168.100.54:2380"
    # 对外提供服务的地址
    ETCD_LISTEN_CLIENT_URLS="http://192.168.100.54:2379"
    # 当前etcd成员的名称（成员必须有唯一名称，建议采用主机名）
    ETCD_NAME="controller"
    #[Clustering]
    # 列出这个成员的伙伴地址，通告给集群中的其他成员
    ETCD_INITIAL_ADVERTISE_PEER_URLS="http://192.168.100.54:2380"
    # 列出这个成员的客户端地址，通告给集群中的其他成员
    ETCD_ADVERTISE_CLIENT_URLS="http://192.168.100.54:2379"
    # 启动初始化集群配置，值为“成员名=该成员服务地址”
    ETCD_INITIAL_CLUSTER="controller=http://192.168.100.54:2380"
    # 初始化etcd集群标识，用于多个etcd集群相互识别
    ETCD_INITIAL_CLUSTER_TOKEN="etcd-cluster-01"
    # 初始化集群状态（新建值为“new”，已存在值为“existing”，如果被设置为existing则etcd将试图加入现有集群）
    ETCD_INITIAL_CLUSTER_STATE="new"
    
    #设置为开机自启
    systemctl enable etcd --now
    systemctl start etcd
    
    # 测试：检测服务运行情况
    netstat -tnlup | grep etcd
    tcp        0      0 192.168.100.54:2379     0.0.0.0:*               LISTEN      1107/etcd           
    tcp        0      0 192.168.100.54:2380     0.0.0.0:*               LISTEN      1107/etcd  

#### 4.5、安装和配置keystone

说明：

<keystone验证服务>提供：所有组件和用户的身份验证服务，它是OpenStack核心的集中化验证服务。  
<keystone验证服务>使用一个包含着<domains域, projects项目, users用户, and roles角色>的组合体。  
domains域 代表一组<projects项目，groups组和users用户>，从而定义了OpenStack验证服务的管理边界。  
projects项目 它是OpenStack中的一个代表<所有权>的基本单位；  
OpenStack中的所有资源对象，必须隶属于一个指定的projects项目；  
一个projects项目，必须隶属于一个指定的domain域。  
users用户 代表着一个API消费者个体，并隶属于一个指定的domain域。  
一个用户可以关联着<role角色>或<project项目>,或者，两者都关联。  
roles角色 一个角色包括一组权利和特权，users用户可以继承这些权利和特权。  
本指南，针对每一个service服务，使用一个名为<service>的项目，该项目包含着一个有效用户。

#配置数据库
    
    
    #在controller控制节点上输入以下命令
    创建：keystone数据库、数据库keystone用户账户、远程访问权限
    mysql -u root -p
    Enter password:
    
    CREATE DATABASE keystone;
    
    show databases;
    GRANT ALL PRIVILEGES ON keystone.* TO 'keystone'@'localhost' IDENTIFIED BY 'redhat';
    GRANT ALL PRIVILEGES ON keystone.* TO 'keystone'@'controller' IDENTIFIED BY 'redhat';
    GRANT ALL PRIVILEGES ON keystone.* TO 'keystone'@'%' IDENTIFIED BY 'redhat';
    
    show grants;
    
    select host,user,password from mysql.user;
    
    FLUSH PRIVILEGES;
    
    exit
    

#安装keystone
    
    
    #安装
    yum -y install openstack-keystone httpd python3-mod_wsgi 
    					openstack-keystone 是Keystone的软件包（安装时会创建“keystone”的Linux用户和用户组）
    					httpd   阿帕奇Web服务
    					mod_wsgi   是使Web服务器支持WSGI的插件
    
    # Keystone是运行在Web服务器上的一个支持Web服务器网关接口（Web Server Gateway Interface，WSGI）的Web应用
    
    #修改配置文件
    vim /etc/keystone/keystone.conf
    
    分别在[database]、[token]下添加如下内容
    [database]
    #connection = \<None\>下面添加
    ## 设置：<MySQL数据库服务器>中的<keystone数据库>的<访问方式>
    connection = mysql+pymysql://keystone:redhat@controller/keystone
    [token]
    #expiration = 3600下面添加
    ## 设置：令牌提供程序为<fernet>，<fernet令牌>增加了<Identity service身份验证服务>可支持的<API操作数量>
    provider = fernet
    # Fernet Token是当前主流推荐的令牌加密格式，是一种轻量级的消息格式。
    
    #填充：keystone数据库
    su -s /bin/sh -c "keystone-manage db_sync" keystone
    					su keystone  切换为keystone用户（因为该用户拥有对keystone数据库的管理权限）
    					-s /bin/sh   su命令的选项，用于指定编译器
    					-c	 		 su命令的选项，用于指定执行某完命令，结束后自动切换为原用户
    
    mysql -uroot -p
    use keystone;
    show tables;
    
    #初始化：Fernet密钥存储库
    # 该命令会自动创建“/etc/keystone/fernet-keys/”目录，并在改目录下生成两个Fernet密钥，用于加密和解密令牌。
    keystone-manage fernet_setup --keystone-user keystone --keystone-group keystone
    
    # 验证如下：
    ls /etc/keystone/fernet-keys/
    0  1
    
    # 该命令会自动创建“/etc/keystone/credential-keys/”目录，并在该目录下生成两个Fernet密钥，用于加密/解密用户凭证
    keystone-manage credential_setup --keystone-user keystone --keystone-group keystone
    
    # 验证如下
    ls /etc/keystone/credential-keys/
    0  1
    
    
    #引导：keystone验证服务
    openstack有一个默认用户为“admin”，但现在还没有对应的登陆信息。使用“keystone-manage bootstrap”命令给“admin”用户初始化登录凭证，以后登录时将出示凭证与此进行对比即可进行认证。
    keystone-manage bootstrap --bootstrap-password redhat \
      --bootstrap-admin-url http://controller:5000/v3/ \
      --bootstrap-internal-url http://controller:5000/v3/ \
      --bootstrap-public-url http://controller:5000/v3/ \
      --bootstrap-region-id RegionOne
    

|  |  |  |  |   
---|---|---|---|---|---  
|  |  |  |  |   
  
![](https://img2023.cnblogs.com/blog/1422438/202310/1422438-20231003203950646-658798632.jpg)

![](https://img2023.cnblogs.com/blog/1422438/202310/1422438-20231003203959086-120296045.jpg)

#### 4.6、配置httpd
    
    
    #配置httpd
    
    vim /etc/httpd/conf/httpd.conf
    ServerName controller
    
    为Apache服务器增加WSGI支持
    ln -s /usr/share/keystone/wsgi-keystone.conf /etc/httpd/conf.d/
    
    systemctl enable httpd.service --now
    systemctl start httpd.service
    
    
    创建初始化环境变量文件
    # 该文件用于存储身份凭证
    vim admin-openrc.sh	
    # 登录openstack云计算平台的用户名
    export OS_USERNAME=admin
    # 登陆密码
    export OS_PASSWORD=redhat
    export OS_PROJECT_NAME=admin
    # 用户属于的域
    export OS_USER_DOMAIN_NAME=Default
    # 项目属于的域
    export OS_PROJECT_DOMAIN_NAME=Default
    # 认证地址
    export OS_AUTH_URL=http://controller:5000/v3
    # keystone版本号
    export OS_IDENTITY_API_VERSION=3
    # 镜像管理应用版本号
    export OS_IMAGE_API_VERSION=2						
    
    # 将身份凭证导入环境变量
    source admin-openrc.sh
    
    
    # 测试：查看现有环境变量
    export -p
    
    #创建：一个domain（域）、projects（项目）、user（用户）、role（角色）
    
    #创建一个新的域
    openstack domain create --description "An Example Domain" example
    
    ## 创建：一个名为service的项目，属于default域，该项目用来包含后续安装的所有service服务的<服务用户帐户>
    openstack project create --domain default --description "Service Project" service
    
    ## 创建：一个名为demo的演示项目
    
    openstack project create --domain default --description "Demo Project" myproject
    
    
    ## 创建：一个名为user的角色，该角色没有任何特权
    openstack user create --domain default --password-prompt myuser
    	User Password:输入密码
    	Repeat User Password: 输入密码
    
    #创建角色：myrole
    openstack role create myrole 
    
    #将角色添加到项目和用户
    openstack role add --project myproject --user myuser myrole 
    
    #重启：keystone服务（也就是：httpd服务）
    systemctl enable httpd.service
    systemctl restart httpd.service
    
    #查看：Openstack的<region区域、domain域、project项目、rloe角色、user用户、service服务>
    openstack region list
    openstack domain list
    openstack project list
    openstack role list
    openstack user list
    openstack service list
    openstack endpoint list
    

#验证操作
    
    
    #取消设置临时和环境变量：OS_AUTH_URLOS_PASSWORD
    unset OS_AUTH_URL OS_PASSWORD
    
    #以用户身份请求身份验证令牌：admin
    openstack --os-auth-url http://controller:5000/v3 \
      --os-project-domain-name Default --os-user-domain-name Default \
      --os-project-name admin --os-username admin token issue
      
    #以用户身份请求身份验证令牌：myuser
    openstack --os-auth-url http://controller:5000/v3 \
      --os-project-domain-name Default --os-user-domain-name Default \
      --os-project-name myproject --os-username myuser token issue
    

#### 4.7、安装和配置glance

#创建数据库和授权
    
    
    #创建glance数据库和授权
    [root@controller ~]# mysql -u root -p
    Enter password: 
    
    CREATE DATABASE glance;
    
    GRANT ALL PRIVILEGES ON glance.* TO 'glance'@'localhost' IDENTIFIED BY 'redhat';
    
    GRANT ALL PRIVILEGES ON glance.* TO 'glance'@'controller' IDENTIFIED BY 'redhat';
    
    GRANT ALL PRIVILEGES ON glance.* TO 'glance'@'%' IDENTIFIED BY 'redhat';
    
    FLUSH PRIVILEGES;
    select host,user,password from mysql.user;
    exit
    
    source admin-openrc.sh
    
    ##创建：glance服务凭据（服务用户帐户、隶属角色、服务访问点等等）
    
    
    ##（1）创建：<glance用户>
    openstack user create --domain default --password-prompt glance
    User Password:
    Repeat User Password:
    
    ##（2）将<glance用户>加入到<admin角色>
    openstack role add --project service --user glance admin
    
    ##（3）创建：<glance服务>，服务类型为<image>
    openstack service create --name glance  --description "OpenStack Image" image
    
    ##（4）创建：<image服务>的<public API 网络>的<endpoint服务访问点>
    openstack endpoint create --region RegionOne image public http://controller:9292
    
    ##（5）创建：<image服务>的<internal API 网络>的<endpoint服务访问点>
    openstack endpoint create --region RegionOne image internal http://controller:9292
    
    ##（6）创建：<image服务>的<admin API 网络>的<endpoint服务访问点>
    openstack endpoint create --region RegionOne image admin http://controller:9292
    
    #登录数据查看
    mysql -u root -p
    Enter password:
    
    use keystone;
    show tables;
    
    select * from endpoint;
    
    exit
    
    ##（7）查看：<endpoint服务访问点>的信息
    openstack endpoint list
    

#安装glance组件
    
    
    #在controller节点上输入以下命令：
    
    #安装
    yum -y install openstack-glance
    
    
    vim /etc/glance/glance-api.conf
    #分别在[database]、[keystone_authtoken]、[paste_deploy]、[glance_store]下添加如下内容
    
    ## 设置：<MySQL数据库服务器>中的<glance数据库>的<访问方式>
    [database]
    connection = mysql+pymysql://glance:redhat@controller/glance
    
    ## 设置：<glance服务>针对<keystone身份验证服务>的<验证访问参数>
    [keystone_authtoken]
    www_authenticate_uri = <http://controller:5000>
    auth_url = http://controller:5000
    memcached_servers = controller:11211
    auth_type = password
    project_domain_name = Default
    user_domain_name = Default
    project_name = service
    username = glance
    password = redhat
    
    [paste_deploy]
    flavor = keystone
    
    ## 设置：<glance服务>中<image镜像存储>的参数
    [glance_store]
    stores = file,http
    default_store = file
    filesystem_store_datadir = /var/lib/glance/images/
    
    #查看设置后的配置文件
    cat /etc/glance/glance-api.conf | grep -vE "(^[ \t]*#|^[ \t]*$)"
    
    #填充：glance数据库
    su -s /bin/sh -c "glance-manage db_sync" glance
    
    #启动：glance镜像服务
    systemctl enable openstack-glance-api.service --now
    
    systemctl start openstack-glance-api.service
    
    netstat -tunlp | grep python
    
    ps -e | grep glance
    

#验证操作
    
    
    source admin-openrc.sh 或 . admin-openrc.sh
    
    #查看镜像列表
    openstack image list
    
    下载源镜像：
    wget http://download.cirros-cloud.net/0.6.0/cirros-0.6.0-x86_64-disk.img
    
    
    [root@controller ~]# ls -l
    总用量 20672
    -rw-r--r--  1 root root      359 9月   6 15:03 admin-openrc.sh
    -rw-------. 1 root root     1590 5月  22 00:30 anaconda-ks.cfg
    -rw-r--r--  1 root root 21149184 9月   7 23:12 cirros-0.6.0-x86_64-disk.img
    -rw-r--r--. 1 root root     5982 5月  22 01:37 sys_opt_centos8.sh
    
    #校验：glance服务
    glance image-create --name "cirros" --file cirros-0.6.0-x86_64-disk.img --disk-format qcow2 --container-format bare --visibility=public
    
    
    #若看到下表，则表示上传成功
    openstack image list
    [root@controller ~]# openstack image list
    +--------------------------------------+--------+--------+
    | ID                                   | Name   | Status |
    +--------------------------------------+--------+--------+
    | 2fd730c6-e9df-468a-bef4-681e3dd13910 | cirros | active |
    +--------------------------------------+--------+--------+
    

####  ![](https://img2023.cnblogs.com/blog/1422438/202310/1422438-20231003205143262-1532899468.jpg)
    
    
    # 3.查看物理文件（在glance-api.conf配置文件中定义了镜像文件的存储位置为/var/lib/glance/images）
    [root@controller ~]#  ll /var/lib/glance/images/
    总用量 20656
    -rw-r----- 1 glance glance 21149184 9月  20 18:19 c5204c4e-3177-436d-b598-9a46f6d161fe
    

#### 4.8、安装和配置placement

Placement的主要组成是它的接口模块（Placement-API），该模块监控系统资源信息。Placement和Nova之间的合作关系大致是这样的：Nova的计算模块（Nova-Compute）将要创建的云主机的硬件需求提交给Placement-API；Placement-API收到需求后从系统资源库中查询到现有资源满足创建云主机的所有计算机的信息，然后将结果返回给Nova的计划模块（Nova-Scheduler）；Nova-Scheduler根据获得的信息选择其中一台计算机并将结果告诉Nova-Compute。  
从OpenStack（Stein版）开始，对系统资源的监控功能才从Nova中独立出来，成为一个独立的组件，该组件名为Placement。

#创建数据库并授权
    
    
    #创建数据库并授权
    mysql -u root -p
    Enter password:
    
    CREATE DATABASE placement;
    
    GRANT ALL PRIVILEGES ON placement.* TO 'placement'@'localhost' IDENTIFIED BY 'redhat';
    
    GRANT ALL PRIVILEGES ON placement.* TO 'placement'@'controller' IDENTIFIED BY 'redhat';
    
    GRANT ALL PRIVILEGES ON placement.* TO 'placement'@'%' IDENTIFIED BY 'redhat';
    
    FLUSH PRIVILEGES;
    select host,user,password from mysql.user;
    exit
    
    source admin-openrc.sh
    
    #创建放置服务用户
    openstack user create --domain default --password-prompt placement
    User Password:
    Repeat User Password:
    
    #将放置用户添加到具有管理员角色的服务项目
    openstack role add --project service --user placement admin
    
    #在服务目录中创建放置 API 条目
    openstack service create --name placement --description "Placement API" placement
    
    #创建放置 API 服务终结点
    openstack endpoint create --region RegionOne placement public http://controller:8778
    
    openstack endpoint create --region RegionOne placement internal http://controller:8778
    
    openstack endpoint create --region RegionOne placement admin http://controller:8778
    
    openstack endpoint list
    

#安装placemen

在OpenStack的Stein版出现之前，对系统资源的监控和云主机资源的选择都是由计算组件Nova独立完成的。从OpenStack（Stein版）开始，对系统资源的监控功能才从Nova中独立出来，成为一个独立的组件，该组件名为Placement。
    
    
    yum -y install openstack-placement-api
    
    
    vim /etc/placement/placement.conf
    分别在[placement_database]、[api]、[keystone_authtoken]下添加如下内容
    
    [placement_database]
    connection = mysql+pymysql://placement:redhat@controller/placement
    
    [api]
    auth_strategy = keystone
    
    [keystone_authtoken]
    auth_url = http://controller:5000/v3
    memcached_servers = controller:11211
    auth_type = password
    project_domain_name = Default
    user_domain_name = Default
    project_name = service
    username = placement
    password = redhat
    
    #填充placement数据库
    su -s /bin/sh -c "placement-manage db sync" placement
    
    systemctl restart httpd
    
    
    
    注意：官方文档没有如下项，需要增加该项；如果不配置以下项，则可能会报错，创建云主机时也可能会报错。
    vim /etc/httpd/conf.d/00-placement-api.conf
    增加以下内容，对目录进行授权： 
    
    <Directory /usr/bin>
       <IfVersion >= 2.4>
          Require all granted
       </IfVersion>
       <IfVersion < 2.4>
          Order allow,deny
          Allow from all
       </IfVersion>
    </Directory>
    

![](https://img2023.cnblogs.com/blog/1422438/202309/1422438-20230908000809074-911541983.jpg)

#验证安装
    
    
    source admin-openrc.sh
    
    #执行状态检查以确保一切正常
    placement-status upgrade check
    
    #安装osc-placement插件
    pip3 install osc-placement
    
    #列出可用的资源类和特征：
    
    openstack --os-placement-api-version 1.2 resource class list --sort-column name
    
    openstack --os-placement-api-version 1.6 trait list --sort-column name
    

!!!注意：在使用`placement-status upgrade check检查状态时出现以下报错是因为：`

在新的版本中，oslo 策略将移除对 JSON 格式的策略文件的支持，为了顺利迁移到 YAML 格式的策略文件，您可以使用`oslopolicy-convert-json-to-yaml`工具将现有的 JSON 格式的文件转换为 YAML 文件。

![](https://img2023.cnblogs.com/blog/1422438/202309/1422438-20230908001221630-1356308947.jpg)

需要进如placement的目录，将policy.json利用`oslopolicy-convert-json-to-yaml`工具转换成policy.yaml
    
    
    cd /etc/placement/
    
    ls
    
    oslopolicy-convert-json-to-yaml --namespace placement --policy-file policy.json --output-file policy.yaml
    
    mv policy.json policy.json.bak
    

再次检测 没有错误

![](https://img2023.cnblogs.com/blog/1422438/202309/1422438-20230908001413664-1840695509.jpg)

++++++++++++++++++++++++++++++++++++++++++++关闭controller控制节点主机并拍摄快照+++++++++++++++++++++++++++++++++++++++++

### 五、安装nova

说明：

<Nova计算服务>提供：compute计算服务，通过控制节点来管理所有的计算节点。

所有的<VMs虚拟机实例>都运行在<计算节点>上。

OpenStack通过<控制节点>上的<nova控制组件>来管理所有的<VMs虚拟机实例>。

OpenStack通过<计算节点>上的<nova计算组件>来运行所有的<VMs虚拟机实例>。

#### 5.1、在controller控制节点上创建数据库并授权
    
    
    #创建数据库并授权
    mysql -u root -p
    Enter password:
    
    CREATE DATABASE nova_api;
    
    CREATE DATABASE nova;
    
    CREATE DATABASE nova_cell0;
    
    GRANT ALL PRIVILEGES ON nova_api.* TO 'nova'@'localhost' IDENTIFIED BY 'redhat';
    
    GRANT ALL PRIVILEGES ON nova_api.* TO 'nova'@'%' IDENTIFIED BY 'redhat';
    
    GRANT ALL PRIVILEGES ON nova_api.* TO 'nova'@'controller' IDENTIFIED BY 'redhat';
    
    GRANT ALL PRIVILEGES ON nova.* TO 'nova'@'localhost' IDENTIFIED BY 'redhat';
    
    GRANT ALL PRIVILEGES ON nova.* TO 'nova'@'%' IDENTIFIED BY 'redhat';
    
    GRANT ALL PRIVILEGES ON nova.* TO 'nova'@'controller' IDENTIFIED BY 'redhat';
    
    GRANT ALL PRIVILEGES ON nova_cell0.* TO 'nova'@'localhost' IDENTIFIED BY 'redhat';
    
    GRANT ALL PRIVILEGES ON nova_cell0.* TO 'nova'@'%' IDENTIFIED BY 'redhat';
    
    GRANT ALL PRIVILEGES ON nova_cell0.* TO 'nova'@'controller' IDENTIFIED BY 'redhat';
    
    FLUSH PRIVILEGES;
    select host,user,password from mysql.user;
    
    exit
    
    source admin-openrc.sh
    
    
    ###创建计算服务凭据
    
    
    #创建用户：nova
    openstack user create --domain default --password-prompt nova
    User Password:
    Repeat User Password:
    
    #将角色添加到用户
    openstack role add --project service --user nova admin
    
    #创建服务实体：nova
    openstack service create --name nova --description "OpenStack Compute" compute
    
    #创建计算 API 服务终结点
    openstack endpoint create --region RegionOne compute public http://controller:8774/v2.1
    
    openstack endpoint create --region RegionOne compute internal http://controller:8774/v2.1
    
    openstack endpoint create --region RegionOne compute admin http://controller:8774/v2.1
    

####  5.2、安装nova控制组件
    
    
    yum -y install openstack-nova-api openstack-nova-conductor openstack-nova-novncproxy openstack-nova-scheduler
    					openstack-nova-api：Nova与外部的接口模块
    					openstack-nova-conductor：Nova传导服务模块，提供数据库访问
    					nova-scheduler：Nova调度服务模块，用以选择某台主机进行云主机创建
    					openstack-nova-novncproxy：Nova的虚拟网络控制台（Virtual Network Console，VNC）代理模块，支持用户提供VNC访问云主机
    
    vim /etc/nova/nova.conf
    分别在[DEFAULT]、[api_database]、[database]、[api]、[keystone_authtoken]、[vnc]、[glance]、[oslo_concurrency]、[placement]下添加如下内容
    
    [DEFAULT]
    ## 在 [DEFAULT] 中，启用<compute API>和<metadata API>
    enabled_apis = osapi_compute,metadata
    
    ## 在 [DEFAULT]中，配置<Identity service>的访问方法
    
    transport_url = rabbit://openstack:redhat@controller:5672/
    my_ip = 192.168.100.54
    use_neutron = true
    firewall_driver = nova.virt.firewall.NoopFirewallDriver
    
    ## 在 [api_database] 和 [database] 中，配置数据库的访问方式
    [api_database]
    connection = mysql+pymysql://nova:redhat@controller/nova_api
    
    [database]
    connection = mysql+pymysql://nova:redhat@controller/nova
    
    [api]
    auth_strategy = keystone
    
    [keystone_authtoken]
    
    ## 在 [keystone_authtoken] 中，配置<Identity service>的访问方法
    
    www_authenticate_uri = http://controller:5000/
    auth_url = http://controller:5000/
    memcached_servers = controller:11211
    auth_type = password
    project_domain_name = Default
    user_domain_name = Default
    project_name = service
    username = nova
    password = redhat
    
    ## 设置：<控制节点本机管理网卡的IP地址>
    
    [vnc]
    enabled = true 
    server_listen = $my_ip
    server_proxyclient_address = $my_ip
    
    ## 在 [glance] 中，配置配置<Image service服务API>的位置
    
    [glance]
    api_servers = http://controller:9292
    
    ## 在 [oslo_concurrency] 中，配置lock锁路径
    
    [oslo_concurrency]
    lock_path = /var/lib/nova/tmp 
    
    [placement]
    region_name = RegionOne
    project_domain_name = Default
    project_name = service
    auth_type = password
    user_domain_name = Default
    auth_url = http://controller:5000/v3
    username = placement
    password = redhat
    
    cat /etc/nova/nova.conf | grep -vE "(^[ \t]*#|^[ \t]*$)"
    
    #把policy.json转换为yaml格式
    cd /etc/nova/
    
    oslopolicy-convert-json-to-yaml --namespace placement --policy-file policy.json --output-file policy.yaml
    
    mv policy.json policy.json.bak
    
    #填充：ova_api数据库： 
    su -s /bin/sh -c "nova-manage api_db sync" nova 
    
    #注册数据库：
    su -s /bin/sh -c "nova-manage cell_v2 map_cell0" nova 
    
    #创建单元格：
    su -s /bin/sh -c "nova-manage cell_v2 create_cell --name=cell1 --verbose" nova 
    
    #填充 nova 数据库
    su -s /bin/sh -c "nova-manage db sync" nova
    
    #验证nova cell0 和 cell1 是否已正确注册
    su -s /bin/sh -c "nova-manage cell_v2 list_cells" nova
    
    #启动：nova计算控制服务
    systemctl enable \
        openstack-nova-api.service \
        openstack-nova-scheduler.service \
        openstack-nova-conductor.service \
        openstack-nova-novncproxy.service
        
    systemctl start \
        openstack-nova-api.service \
        openstack-nova-scheduler.service \
        openstack-nova-conductor.service \
        openstack-nova-novncproxy.service
    

#### 5.2、在计算节点安装配置nova-computer
    
    
    在computer1和computer2计算节点安装
    yum -y install openstack-nova-compute
    
    
    在computer1计算节点修改配置如下：
    vim /etc/nova/nova.conf
    
    分别在[DEFAULT]、[api]、[keystone_authtoken]、[vnc]、[glance]、[oslo_concurrency]、[placement]下添加如下内容
    
    [DEFAULT]
    enabled_apis = osapi_compute,metadata
    transport_url = rabbit://openstack:redhat@controller
    my_ip = 192.168.100.55
    use_neutron = true
    firewall_driver = nova.virt.firewall.NoopFirewallDriver
    compute_driver=libvirt.LibvirtDriver
    
    [api]
    auth_strategy = keystone
    
    [keystone_authtoken]
    www_authenticate_uri = http://controller:5000/
    auth_url = http://controller:5000/
    memcached_servers = controller:11211
    auth_type = password
    project_domain_name = Default
    user_domain_name = Default
    project_name = service
    username = nova
    password = redhat
    
    [vnc]
    enabled = true
    server_listen = 0.0.0.0
    server_proxyclient_address = $my_ip
    novncproxy_base_url = http://controller:6080/vnc_auto.html
    
    [glance]
    api_servers = http://controller:9292
    
    [oslo_concurrency]
    lock_path = /var/lib/nova/tmp
    
    [placement]
    region_name = RegionOne
    project_domain_name = Default
    project_name = service
    auth_type = password
    user_domain_name = Default
    auth_url = http://controller:5000/v3
    username = placement
    password = redhat
    
    
    
    
    将computer1的nova.conf复制到computer2
    scp /etc/nova/nova.conf root@computer2:/etc/nova
    
    在computer2计算节点上执行如下命令：
    vim /etc/nova/nova.conf
    手动修改以下文件内容
    [DEFAULT]
    my_ip = 192.168.100.56
    
    最后分别在computer1和computer2计算节重启服务并设为开机自启
    
    systemctl enable libvirtd.service openstack-nova-compute.service --now
    systemctl start libvirtd.service openstack-nova-compute.service
    

#### 5.3、将计算节点添加到单元数据库（在控制节点执行）
    
    
    #获取管理员凭据以启用仅限管理员的 CLI 命令，然后确认 数据库中有计算主机：
    sh admin-openrc.sh
    
    #在controller控制节点上进行验证
    openstack compute service list --service nova-compute
    
    #发现计算主机：
    su -s /bin/sh -c "nova-manage cell_v2 discover_hosts --verbose" nova
    
    #注意：
    添加新计算节点时，必须在控制器节点上运行以注册这些新计算 节点。或者，可以在中设置适当的间隔
    cat /etc/nova/nova.conf
    
    [scheduler]
    discover_hosts_in_cells_interval = 300
    

++++++++++++++++++++++++++++++++++++++++++++关闭3台主机并拍摄快照+++++++++++++++++++++++++++++++++++++++++

### 六、安装和配置neutron网络服务

#### 6.1、创建数据库并授权（在控制节点安装和配置）
    
    
    #创建数据库并授权
    mysql -u root -p
    Enter password:
    
    CREATE DATABASE neutron;
    GRANT ALL PRIVILEGES ON neutron.* TO 'neutron'@'localhost' IDENTIFIED BY 'redhat';
    
    GRANT ALL PRIVILEGES ON neutron.* TO 'neutron'@'%' IDENTIFIED BY 'redhat';
    
    exit
    
    #创建用户：neutron
    source admin-openrc.sh
    openstack user create --domain default --password-prompt neutron
    User Password:
    Repeat User Password:
    
    #将角色添加到用户：admin neutron
    openstack role add --project service --user neutron admin
    
    #创建服务实体：neutron
    openstack service create --name neutron --description "OpenStack Networking" network
    
    #创建网络服务 API 终结点
    openstack endpoint create --region RegionOne network public http://controller:9696
    
    openstack endpoint create --region RegionOne network internal http://controller:9696
    
    openstack endpoint create --region RegionOne network admin http://controller:9696
    

####  6.2、网络选项 2-自助服务网络（在控制节点安装和配置）
    
    
    #安装
    yum -y install openstack-neutron openstack-neutron-ml2 openstack-neutron-linuxbridge ebtables
    
    vim /etc/neutron/neutron.conf
    分别在[database]、[DEFAULT]、[keystone_authtoken]、[nova]、[oslo_concurrency]下添加如下内容
    
    #配置数据库访问：[database]
    [database]
    connection = mysql+pymysql://neutron:redhat@controller/neutron
    
    #启用模块化第 2 层 （ML2） 插件、路由器服务和重叠的 IP 地址：[DEFAULT]
    [DEFAULT]
    core_plugin = ml2
    service_plugins = router
    allow_overlapping_ips = true
    transport_url = rabbit://openstack:redhat@controller
    auth_strategy = keystone
    notify_nova_on_port_status_changes = true
    notify_nova_on_port_data_changes = true
    
    #配置 身份服务访问
    [keystone_authtoken]
    www_authenticate_uri = http://controller:5000
    auth_url = http://controller:5000
    memcached_servers = controller:11211
    auth_type = password
    project_domain_name = default
    user_domain_name = default
    project_name = service
    username = neutron
    password = redhat
    
    注意：此文件内容内没有如下项，需要跳到文件最末尾进行添加如下项的内容
    [nova]
    auth_url = http://controller:5000
    auth_type = password
    project_domain_name = default
    user_domain_name = default
    region_name = RegionOne
    project_name = service
    username = nova
    password = redhat
    
    #配置锁定路径
    [oslo_concurrency]
    lock_path = /var/lib/neutron/tmp
    

#### 6.3、 配置模块化第 2 层 （ML2） 插件（在控制节点配置）

ML2 插件使用 Linux 桥接机制构建第 2 层（桥接 和交换）实例的虚拟网络基础结构
    
    
    #修改ML2plug-in配置文件
    vim /etc/neutron/plugins/ml2/ml2_conf.ini
    
    分别在[ml2]、[ml2_type_flat]、[ml2_type_vxlan]、[securitygroup]下添加如下内容
    注意：此文件内容内没有如下项，需要跳到文件最末尾进行添加如下项的内容
    
    [ml2]
    type_drivers = flat,vlan,vxlan  #启用平面、VLAN 和 VXLAN 网络
    tenant_network_types = vxlan	#启用 VXLAN 自助服务网络
    mechanism_drivers = linuxbridge,l2population  #启用 Linux 网桥和第 2 层填充 机制
    extension_drivers = port_security #启用端口安全扩展驱动程序
    
    #配置提供程序虚拟 网络作为扁平网络
    [ml2_type_flat]
    flat_networks = provider
    
    #配置 VXLAN 网络标识符 自助服务网络的范围
    [ml2_type_vxlan]
    vni_ranges = 1:1000
    
    #在“启用 ipset 以增加”部分中 安全组规则的效率
    [securitygroup]
    enable_ipset = true
    

#### 6.4、配置 Linux 网桥代理（在控制节点配置）

Linux 网桥代理构建第 2 层（桥接和交换）虚拟 实例的网络基础设施和处理安全组。
    
    
    #修改linuxbridge_agent.ini配置文件如下
    vim /etc/neutron/plugins/ml2/linuxbridge_agent.ini
    
    分别在[linux_bridge]、[vxlan]、[securitygroup]下添加如下内容
    注意：此文件内容内没有如下项，需要跳到文件最末尾进行添加如下项的内容
    
    #将提供程序虚拟网络映射到 提供程序物理网络接口
    [linux_bridge]
    physical_interface_mappings = provider:ens160 #注意：此处的“ens160”的编号160要根据自己的网卡编号修改
    
    #启用 VXLAN覆盖网络部分中，配置 处理覆盖的物理网络接口的 IP 地址 网络，并启用第2层填充
    [vxlan]
    enable_vxlan = true
    local_ip = 192.168.100.54
    l2_population = true
    
    #启用安全组和 配置 Linux 网桥 iptables 防火墙驱动程序
    [securitygroup]
    enable_security_group = true
    firewall_driver = neutron.agent.linux.iptables_firewall.IptablesFirewallDriver
    

####  6.5、安装支持桥接的包（在控制节点和两个计算节点上都安装桥接包）
    
    
    #控制节点：
    [root@controller ~]# yum -y install bridge-utils
    [root@controller ~]# modprobe br_netfilter
    [root@controller ~]# echo br_netfilter > /etc/modules-load.d/br_netfilter.conf
    [root@controller ~]# sysctl -a |grep bridge
    net.bridge.bridge-nf-call-arptables = 1
    net.bridge.bridge-nf-call-ip6tables = 1
    net.bridge.bridge-nf-call-iptables = 1
    net.bridge.bridge-nf-filter-pppoe-tagged = 0
    net.bridge.bridge-nf-filter-vlan-tagged = 0
    net.bridge.bridge-nf-pass-vlan-input-dev = 0
    
    
    计算节点1：
    [root@computer1 ~]# yum -y install bridge-utils
    [root@computer1 ~]# modprobe br_netfilter
    [root@computer1 ~]# echo br_netfilter > /etc/modules-load.d/br_netfilter.conf
    [root@computer1 ~]# sysctl -a |grep bridge
    net.bridge.bridge-nf-call-arptables = 1
    net.bridge.bridge-nf-call-ip6tables = 1
    net.bridge.bridge-nf-call-iptables = 1
    net.bridge.bridge-nf-filter-pppoe-tagged = 0
    net.bridge.bridge-nf-filter-vlan-tagged = 0
    net.bridge.bridge-nf-pass-vlan-input-dev = 0
    
    
    
    计算节点2：
    [root@computer2 ~]# yum -y install bridge-utils
    [root@computer2 ~]# modprobe br_netfilter
    [root@computer2 ~]# echo br_netfilter > /etc/modules-load.d/br_netfilter.conf
    [root@computer2 ~]# sysctl -a |grep bridge
    net.bridge.bridge-nf-call-arptables = 1
    net.bridge.bridge-nf-call-ip6tables = 1
    net.bridge.bridge-nf-call-iptables = 1
    net.bridge.bridge-nf-filter-pppoe-tagged = 0
    net.bridge.bridge-nf-filter-vlan-tagged = 0
    net.bridge.bridge-nf-pass-vlan-input-dev = 0
    

#### 6.6、配置第3层代理（在控制节点配置）

第3层（L3）代理为自助式虚拟网络
    
    
    #配置 Linux 网桥接口驱动程序,添加l3_agent的配置文件如下：
    vim /etc/neutron/l3_agent.ini
    
    #在[DEFAULT]下添加如下内容
    [DEFAULT]
    interface_driver = linuxbridge
    

#### 6.7、 配置 DHCP 代理（在控制节点配置）

DHCP 代理为虚拟网络提供 DHCP 服务
    
    
    vim /etc/neutron/dhcp_agent.ini
    
    #配置 Linux 网桥接口驱动程序， Dnsmasq DHCP 驱动程序，并启用隔离的元数据，以便提供程序上的实例 网络可以通过网络访问元数据
    [DEFAULT]
    interface_driver = linuxbridge
    dhcp_driver = neutron.agent.linux.dhcp.Dnsmasq
    enable_isolated_metadata = true
    

####  6.8、配置元数据代理（在控制节点配置）

元数据代理提供配置信息 例如实例的凭证
    
    
    vim /etc/neutron/metadata_agent.ini
    
    #配置元数据主机和共享秘密：[DEFAULT]
    [DEFAULT]
    nova_metadata_host = controller
    metadata_proxy_shared_secret = redhat
    

####  6.9、将计算服务配置为使用网络服务（在控制节点配置）
    
    
    编辑文件并执行以下操作：/etc/nova/nova.conf
    
    vim /etc/nova/nova.conf
    
    #在配置访问参数部分中，启用 元数据代理，并配置密钥
    [neutron]
    auth_url = http://controller:5000
    auth_type = password
    project_domain_name = default
    user_domain_name = default
    region_name = RegionOne
    project_name = service
    username = neutron
    password = redhat
    service_metadata_proxy = true
    metadata_proxy_shared_secret = redhat
    

####  6.10、创建软链接（在控制节点配置）
    
    
    #网络服务初始化脚本需要一个软链接指向/etc/neutron/plugins/ml2/ml2_conf.ini文件。
    ln -s /etc/neutron/plugins/ml2/ml2_conf.ini /etc/neutron/plugin.ini
    
    #填充数据库
    su -s /bin/sh -c "neutron-db-manage --config-file /etc/neutron/neutron.conf --config-file /etc/neutron/plugins/ml2/ml2_conf.ini upgrade head" neutron
    
    #重新启动计算 API 服务
    systemctl restart openstack-nova-api.service
    
    #启动网络服务并设为开机自启
    systemctl enable neutron-server.service neutron-linuxbridge-agent.service neutron-dhcp-agent.service neutron-metadata-agent.service
    
    systemctl start neutron-server.service neutron-linuxbridge-agent.service neutron-dhcp-agent.service neutron-metadata-agent.service
    
    #对于网络选项 2，还要启用并启动第 3 层服务
    systemctl enable neutron-l3-agent.service --now
    systemctl restart neutron-l3-agent.service
    

####  6.11、安装和配置计算节点
    
    
    #2台计算节点都安装配置
    yum -y install openstack-neutron-linuxbridge ebtables ipset
    
    
    #配置通用组件
    #网络常见组件配置包括 身份验证机制、消息队列和插件
    vim /etc/neutron/neutron.conf
    (computer2同样操作，或者好自己而复制编辑好的配置文件)
    
    #在[DEFAULT]、[keystone_authtoken]、[oslo_concurrency]下添加如下内容
    
    #配置消息队列访问部分
    [DEFAULT]
    transport_url = rabbit://openstack:redhat@controller 
    auth_strategy = keystone
    
    #配置 身份服务访问
    [keystone_authtoken]
    www_authenticate_uri = http://controller:5000
    auth_url = http://controller:5000
    memcached_servers = controller:11211
    auth_type = password
    project_domain_name = default
    user_domain_name = default
    project_name = service
    username = neutron
    password = redhat
    
    [oslo_concurrency]
    lock_path = /var/lib/neutron/tmp
    
    #第一台配置好后使用scp将配置文件发送到第二台计算节点上
    [root@computer1 ~]# scp /etc/neutron/neutron.conf root@computer2:/etc/neutron/
    root@computer2's password: 
    

####  6.12、配置 Linux 网桥代理（2台计算节点都需要配置）

Linux 网桥代理构建第 2 层（桥接和交换）虚拟 实例的网络基础设施和处理安全组
    
    
    #编辑文件并 完成以下操作：/etc/neutron/plugins/ml2/linuxbridge_agent.ini
    vim /etc/neutron/plugins/ml2/linuxbridge_agent.ini
    
    #在[linux_bridge]、[vxlan]、[securitygroup]下添加如下内容
    #注意：此文件内容内没有如下项，需要跳到文件最末尾进行添加如下项的内容
    
    #将提供程序虚拟网络映射到 提供程序物理网络接口
    [linux_bridge]
    #管理网络的网卡名称注意：此处的“ens160”的编号160要根据自己的网卡编号修改
    physical_interface_mappings = provider:ens160 
    
    #在启用 VXLAN 覆盖网络部分中，配置 处理覆盖的物理网络接口的 IP 地址 网络，并启用第 2 层填充
    [vxlan]
    enable_vxlan = true
    #computer1管理IP
    local_ip = 192.168.100.55
    l2_population = true
    
    #启用安全组和 配置 Linux 网桥 iptables 防火墙驱动程序
    [securitygroup]
    enable_security_group = true
    firewall_driver = neutron.agent.linux.iptables_firewall.IptablesFirewallDriver
    
    #将第一台计算节点配置好的文件发送到第二台计算节点上并修改管理IP
    [root@computer1 ~]# scp /etc/neutron/plugins/ml2/linuxbridge_agent.ini root@computer2:/etc/neutron/plugins/ml2/
    root@computer2's password:
    
    vim /etc/neutron/plugins/ml2/linuxbridge_agent.ini
    local_ip = 192.168.100.56 
    

#### 6.13、将计算服务配置为使用网络服务（在2台计算节点配置）
    
    
    #2台计算节点都需要配置
    vim /etc/nova/nova.conf
    
    在[neutron]下添加如下内容
    [neutron]
    auth_url = http://controller:5000
    auth_type = password
    project_domain_name = default
    user_domain_name = default
    region_name = RegionOne
    project_name = service
    username = neutron
    password = redhat
    
    
    
    #重新启动计算服务（2台计算节点都需要执行）
    systemctl restart openstack-nova-compute.service
    
    #启动 Linux 网桥代理并设置为开机自启（2台计算节点都需要执行）
    systemctl enable neutron-linuxbridge-agent.service
    systemctl start neutron-linuxbridge-agent.service
    

####  6.14、在controller控制节点上进行校验
    
    
    source admin-openrc.sh
    
    
    openstack network agent list
    

![](https://img2023.cnblogs.com/blog/1422438/202309/1422438-20230910162151775-1489594254.jpg)

### 七、安装配置horizon
    
    
    在controller控制节点上安装。
    yum -y install openstack-dashboard
    
    #修改配置文件
    vim /etc/openstack-dashboard/local_settings 
    
    #手动修改以下内容
    
    置仪表板以在节点上使用 OpenStack 服务controller
    #原内容为：OPENSTACK_HOST = "127.0.0.1"
    OPENSTACK_HOST = "controller" 	
    
    #允许所有主机访问仪表板
    #原内容为：ALLOWED_HOSTS = ['horizon.example.com', 'localhost']
    ALLOWED_HOSTS = ['*']	
    
    #配置时区
    #原内容为：TIME_ZONE = "UTC"
    TIME_ZONE = "Asia/Shanghai"  #原内容为：TIME_ZONE = "UTC"
    
    #启用身份 API 版本 3
    #原内容OPENSTACK_KEYSTONE_URL = "http://%s/identity/v3" % OPENSTACK_HOST更改为：
    OPENSTACK_KEYSTONE_URL = "http://%s:5000/v3" % OPENSTACK_HOST
    
    #配置会话存储服务：memcached
    增加的内容：
    SESSION_ENGINE = 'django.contrib.sessions.backends.file'
    CACHES = {
    	'default': {
    		'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
    		'LOCATION': 'controller:11211',
    	}
    }
    
    #启用对域的支持：
    OPENSTACK_KEYSTONE_MULTIDOMAIN_SUPPORT = True
    
    #配置为你创建的用户的默认域 通过仪表板：Default
    OPENSTACK_KEYSTONE_DEFAULT_DOMAIN = "Default"
    
    #配置为默认角色 通过仪表板创建的用户：user
    OPENSTACK_KEYSTONE_DEFAULT_ROLE = "user"
    
    #配置 API 版本
    OPENSTACK_API_VERSIONS = {
    "identity": 3,
    "image": 2,
    "volume": 3,
    }
    
    #找到OPENSTACK_API_VERSIONS#HORIZON_CONFIG["help_url"] = "http://openstack.mycompany.org"这一行给注释掉
    
    #在openstack-dashboard.conf配置文件中添加如下内容：
    vim /etc/httpd/conf.d/openstack-dashboard.conf
    WSGIApplicationGroup %{GLOBAL}
    
    #重建apache的dashboard配置文件
    cd /usr/share/openstack-dashboard
    python3 manage.py make_web_conf --apache > /etc/httpd/conf.d/openstack-dashboard.conf
    
    ln -s /etc/openstack-dashboard /usr/share/openstack-dashboard/openstack_dashboard/conf
    
    #修改配置文件
     cat /etc/httpd/conf.d/openstack-dashboard.conf  
     WSGIScriptAlias /dashboard /usr/share/openstack-dashboard/openstack_dashboard/wsgi.py
    	Alias /dashboard/static /usr/share/openstack-dashboard/static
    
    #编辑以下两个文件，找到WEBROOT = ‘/’ 修改为WEBROOT = ‘/dashboard’
    
    vim /usr/share/openstack-dashboard/openstack_dashboard/defaults.py
    vim /usr/share/openstack-dashboard/openstack_dashboard/test/settings.py
    
    编辑 vim /etc/httpd/conf/httpd.conf
    修改 Require all granted
    
    #重新启动 Web 服务器和会话存储服务
    systemctl restart httpd.service memcached.service
    

![](https://img2023.cnblogs.com/blog/1422438/202309/1422438-20230910173103195-25434653.jpg)

###  八、块存储服务（Cinder）安装

#### 8.1、创建数据库并授权（在控制节点执行）
    
    
    登录数据库
    [root@controller ~]# mysql -u root -p
    Enter password: 
    
    创建 cinder 数据库
    MariaDB [(none)]> CREATE DATABASE cinder;
    Query OK, 1 row affected (0.007 sec)
    
    授予cinder数据库访问权限
    MariaDB [(none)]> GRANT ALL PRIVILEGES ON cinder.* TO 'cinder'@'localhost' IDENTIFIED BY 'redhat';
    Query OK, 0 rows affected (0.010 sec)
    
    MariaDB [(none)]> GRANT ALL PRIVILEGES ON cinder.* TO 'cinder'@'%' IDENTIFIED BY 'redhat';
    Query OK, 0 rows affected (0.001 sec)
    
    退出数据库
    MariaDB [(none)]> exit
    Bye
    

####  8.2、创建用户并分配角色（在控制节点执行）
    
    
    创建一个 cinder 用户：
    [root@controller ~]# openstack user create --domain default --password-prompt cinder
    User Password:
    Repeat User Password:
    +---------------------+----------------------------------+
    | Field               | Value                            |
    +---------------------+----------------------------------+
    | domain_id           | default                          |
    | enabled             | True                             |
    | id                  | 11d84b65813742ad9513ca2740d8411e |
    | name                | cinder                           |
    | options             | {}                               |
    | password_expires_at | None                             |
    +---------------------+----------------------------------+
    
    添加 admin 角色到 cinder 用户上
    [root@controller ~]# openstack role add --project service --user cinder admin
    
    创建 cinderv2 和 cinderv3 服务实体
    [root@controller ~]# openstack service create --name cinderv2 --description "OpenStack Block Storage" volumev2
    +-------------+----------------------------------+
    | Field       | Value                            |
    +-------------+----------------------------------+
    | description | OpenStack Block Storage          |
    | enabled     | True                             |
    | id          | 495f9553e188446181776ae60824df30 |
    | name        | cinderv2                         |
    | type        | volumev2                         |
    +-------------+----------------------------------+
    
    [root@controller ~]# openstack service create --name cinderv3    --description "OpenStack Block Storage" volumev3
    +-------------+----------------------------------+
    | Field       | Value                            |
    +-------------+----------------------------------+
    | description | OpenStack Block Storage          |
    | enabled     | True                             |
    | id          | 91b8eb3921d34eb4bc56555fd30b4dbf |
    | name        | cinderv3                         |
    | type        | volumev3                         |
    +-------------+----------------------------------+
    
    创建块设备存储服务的 API 入口点：
    [root@controller ~]# openstack endpoint create --region RegionOne volumev2 public http://controller:8776/v2/%\(project_id\)s
    +--------------+------------------------------------------+
    | Field        | Value                                    |
    +--------------+------------------------------------------+
    | enabled      | True                                     |
    | id           | 7e8fa52d4b2d46049f935cb6ed171db6         |
    | interface    | public                                   |
    | region       | RegionOne                                |
    | region_id    | RegionOne                                |
    | service_id   | 495f9553e188446181776ae60824df30         |
    | service_name | cinderv2                                 |
    | service_type | volumev2                                 |
    | url          | http://controller:8776/v2/%(project_id)s |
    +--------------+------------------------------------------+
    
    [root@controller ~]# openstack endpoint create --region RegionOne volumev2 internal http://controller:8776/v2/%\(project_id\)s
    +--------------+------------------------------------------+
    | Field        | Value                                    |
    +--------------+------------------------------------------+
    | enabled      | True                                     |
    | id           | c154fac7f41440dd9eb11604e44b9cc4         |
    | interface    | internal                                 |
    | region       | RegionOne                                |
    | region_id    | RegionOne                                |
    | service_id   | 495f9553e188446181776ae60824df30         |
    | service_name | cinderv2                                 |
    | service_type | volumev2                                 |
    | url          | http://controller:8776/v2/%(project_id)s |
    +--------------+------------------------------------------+
    
    [root@controller ~]# openstack endpoint create --region RegionOne volumev2 admin http://controller:8776/v2/%\(project_id\)s
    +--------------+------------------------------------------+
    | Field        | Value                                    |
    +--------------+------------------------------------------+
    | enabled      | True                                     |
    | id           | 22edd992f39648fb8ad52de0ba6aed54         |
    | interface    | admin                                    |
    | region       | RegionOne                                |
    | region_id    | RegionOne                                |
    | service_id   | 495f9553e188446181776ae60824df30         |
    | service_name | cinderv2                                 |
    | service_type | volumev2                                 |
    | url          | http://controller:8776/v2/%(project_id)s |
    +--------------+------------------------------------------+
    
    [root@controller ~]# openstack endpoint create --region RegionOne volumev3 public http://controller:8776/v3/%\(project_id\)s
    +--------------+------------------------------------------+
    | Field        | Value                                    |
    +--------------+------------------------------------------+
    | enabled      | True                                     |
    | id           | e9d892791e084ae2acf84b052cb289d3         |
    | interface    | public                                   |
    | region       | RegionOne                                |
    | region_id    | RegionOne                                |
    | service_id   | 91b8eb3921d34eb4bc56555fd30b4dbf         |
    | service_name | cinderv3                                 |
    | service_type | volumev3                                 |
    | url          | http://controller:8776/v3/%(project_id)s |
    +--------------+------------------------------------------+
    
    [root@controller ~]# openstack endpoint create --region RegionOne volumev3 internal http://controller:8776/v3/%\(project_id\)s
    +--------------+------------------------------------------+
    | Field        | Value                                    |
    +--------------+------------------------------------------+
    | enabled      | True                                     |
    | id           | 9c8d761d7dc14347b4855d8761f2a8c7         |
    | interface    | internal                                 |
    | region       | RegionOne                                |
    | region_id    | RegionOne                                |
    | service_id   | 91b8eb3921d34eb4bc56555fd30b4dbf         |
    | service_name | cinderv3                                 |
    | service_type | volumev3                                 |
    | url          | http://controller:8776/v3/%(project_id)s |
    +--------------+------------------------------------------+
    
    [root@controller ~]# openstack endpoint create --region RegionOne volumev3 admin http://controller:8776/v3/%\(project_id\)s
    +--------------+------------------------------------------+
    | Field        | Value                                    |
    +--------------+------------------------------------------+
    | enabled      | True                                     |
    | id           | 0946ebe0a6404d80a6e5677c8e77253d         |
    | interface    | admin                                    |
    | region       | RegionOne                                |
    | region_id    | RegionOne                                |
    | service_id   | 91b8eb3921d34eb4bc56555fd30b4dbf         |
    | service_name | cinderv3                                 |
    | service_type | volumev3                                 |
    | url          | http://controller:8776/v3/%(project_id)s |
    +--------------+------------------------------------------+
    [root@controller ~]# 
    

####  8.3、安装并配置组件（在控制节点执行）

说明：存储节点如果是安装在计算节点或单独的服务器上，拿这一步就需要在计算节点或其他服务器上执行；由于我的存储节点是安装在控制节点上，所以就在控制节点上执行该操作。
    
    
    安装cinder
    yum -y install openstack-cinder
    
    
    安装完成后编辑cinder配置文件并完成 以下操作：
    
    备份配置文件
    cp /etc/cinder/cinder.conf /etc/cinder/cinder.bak 
    
    去除注释和空行生成新文件
    grep -Ev '^$|#' /etc/cinder/cinder.bak > /etc/cinder/cinder.conf
    
    编辑配置
    vim /etc/cinder/cinder.conf
    
    [DEFAULT]
    
    连接消息队列
    transport_url = rabbit://openstack:redhat@controller
    实现与Keystone的交互
    auth_strategy = keystone
    my_ip = 192.168.100.54
    
    实现与数据库“cinder”的连接
    [database]
    connection = mysql+pymysql://cinder:redhat@controller/cinder
    
    实现与Keystone的交互
    [keystone_authtoken]
    www_authenticate_uri = http://controller:5000
    auth_url = http://controller:5000
    memcached_servers = controller:11211
    auth_type = password
    project_domain_name = default
    user_domain_name = default
    project_name = service
    username = cinder
    password = redhat
    
    配置锁路径
    [oslo_concurrency]
    lock_path = /var/lib/cinder/tmp
    
    同步数据库
    [root@controller ~]# su -s /bin/sh -c "cinder-manage db sync" cinder
    /usr/lib/python3.6/site-packages/cinder/db/sqlalchemy/models.py:156: SAWarning: implicitly coercing SELECT object to scalar subquery; please use the .scalar_subquery() method to produce a scalar subquery.
      deferred=False,
    /usr/lib/python3.6/site-packages/cinder/db/sqlalchemy/models.py:165: SAWarning: implicitly coercing SELECT object to scalar subquery; please use the .scalar_subquery() method to produce a scalar subquery.
      deferred=True,
    /usr/lib/python3.6/site-packages/cinder/db/sqlalchemy/models.py:180: SAWarning: implicitly coercing SELECT object to scalar subquery; please use the .scalar_subquery() method to produce a scalar subquery.
      deferred=True,
    2023-10-03 17:17:05.907 73429 INFO cinder.db.migration [-] Applying migration(s)
    2023-10-03 17:17:05.908 73429 INFO alembic.runtime.migration [-] Context impl MySQLImpl.
    2023-10-03 17:17:05.909 73429 INFO alembic.runtime.migration [-] Will assume non-transactional DDL.
    2023-10-03 17:17:05.931 73429 INFO alembic.runtime.migration [-] Running upgrade  -> 921e1a36b076, Initial migration.
    2023-10-03 17:17:06.313 73429 INFO cinder.db.migration [-] Migration(s) applied
    
    同步数据库
    [root@controller ~]# vim /etc/nova/nova.conf
    [cinder]
    os_region_name = RegionOne
    
    重启 Nova 服务
    [root@controller ~]# systemctl restart openstack-nova-api.service
    
    设置 “cinder-api” 和 “cinder-scheduler” 模块开机自启动
    [root@controller ~]# systemctl enable openstack-cinder-api.service openstack-cinder-scheduler.service
    Created symlink /etc/systemd/system/multi-user.target.wants/openstack-cinder-api.service → /usr/lib/systemd/system/openstack-cinder-api.service.
    Created symlink /etc/systemd/system/multi-user.target.wants/openstack-cinder-scheduler.service → /usr/lib/systemd/system/openstack-cinder-scheduler.service.
    
    设置 “cinder-api” 和 “cinder-scheduler” 模块开机自启动
    [root@controller ~]# systemctl start openstack-cinder-api.service openstack-cinder-scheduler.service
    
    查看端口占用情况
    [root@controller ~]# netstat -nutpl | grep 8776
    tcp        0      0 0.0.0.0:8776            0.0.0.0:*               LISTEN      73571/python3       
    
    查看存储服务列表
    [root@controller ~]# openstack volume service list
    +------------------+------------+------+---------+-------+----------------------------+
    | Binary           | Host       | Zone | Status  | State | Updated At                 |
    +------------------+------------+------+---------+-------+----------------------------+
    | cinder-scheduler | controller | nova | enabled | up    | 2023-10-03T11:24:44.000000 |
    +------------------+------------+------+---------+-------+----------------------------+
    [root@controller ~]# 
    

#### 8.4、安装和配置存储节点（在控制节点执行）

说明：存储节点如果是安装在计算节点或单独的服务器上，拿这一步就需要在计算节点或其他服务器上执行；由于我的存储节点是安装在控制节点上，所以就在控制节点上执行该操作。

安装lvm2
    
    
    [root@controller ~]# yum -y install lvm2 device-mapper-persistent-data
    上次元数据过期检查：1:17:21 前，执行于 2023年10月03日 星期二 16时22分05秒。
    软件包 lvm2-8:2.03.14-9.el8.x86_64 已安装。
    软件包 device-mapper-persistent-data-0.9.0-7.el8.x86_64 已安装。
    依赖关系解决。
    无需任何处理。
    完毕！
    

在控制节点添加一块新硬盘（创建新虚拟磁盘）
    
    
    查看当前所有硬盘（块设备）挂载信息
    [root@controller ~]# lsblk
    NAME        MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
    sr0          11:0    1 10.5G  0 rom  
    nvme0n1     259:0    0  100G  0 disk 
    ├─nvme0n1p1 259:1    0    2G  0 part /boot
    └─nvme0n1p2 259:2    0   98G  0 part 
      ├─cs-root 253:0    0   94G  0 lvm  /
      └─cs-swap 253:1    0    4G  0 lvm  [SWAP]
    nvme0n2     259:3    0  100G  0 disk 
    

创建LVM物理卷组
    
    
    将硬盘初始化为物理卷
    [root@controller ~]# pvcreate /dev/nvme0n2
      Physical volume "/dev/nvme0n2" successfully created.
    
    将物理卷归并为卷组
    [root@controller ~]# vgcreate cinder-volumes /dev/nvme0n2
      Volume group "cinder-volumes" successfully created
    
    配配置LVM卷组扫描的设备置LVM卷组扫描的设备
    
    配置LVM卷组扫描的设备
    [root@controller ~]# vim /etc/lvm/lvm.conf 
    devices {
    filter = [ "a/nvme0n2/","r/.*/"]     # 接受“/dev/sdb”磁盘并拒绝其他设备（“a”表示接受 “r”表示拒绝）
    .....
    }
    

安装和配置存储节点
    
    
    yum install openstack-cinder targetcli python-oslo-policy
    
    修改Cinder配置文件
    
    [lvm]
    volume_driver = cinder.volume.drivers.lvm.LVMVolumeDriver
    volume_group = cinder-volumes
    target_protocol = iscsi
    target_helper = lioadm
    
    [DEFAULT]
    enabled_backends = lvm
    glance_api_servers = http://controller:9292
    
    
    启动Cinder服务并设为开机自启
    [root@controller ~]# systemctl enable openstack-cinder-volume.service target.service
    Created symlink /etc/systemd/system/multi-user.target.wants/openstack-cinder-volume.service → /usr/lib/systemd/system/openstack-cinder-volume.service.
    Created symlink /etc/systemd/system/multi-user.target.wants/target.service → /usr/lib/systemd/system/target.service.
    
    [root@controller ~]# systemctl start openstack-cinder-volume.service target.service
    

查看存储服务列表
    
    
    [root@controller ~]# openstack volume service list
    +------------------+----------------+------+---------+-------+----------------------------+
    | Binary           | Host           | Zone | Status  | State | Updated At                 |
    +------------------+----------------+------+---------+-------+----------------------------+
    | cinder-scheduler | controller     | nova | enabled | up    | 2023-10-03T11:55:59.000000 |
    | cinder-volume    | controller@lvm | nova | enabled | up    | 2023-10-03T11:56:00.000000 |
    +------------------+----------------+------+---------+-------+----------------------------+
    

通过 Dashboard 查看卷情况

![](https://img2023.cnblogs.com/blog/1422438/202310/1422438-20231003195859240-926256972.jpg)

#### 8.5、用 Cinder 创建卷（在控制节点执行）

使用命令模式创建卷
    
    
    在控制节点发起命令，创建一个8GB的卷，命名为“volume1”
    [root@controller ~]# openstack volume create --size 8 volume1
    +---------------------+--------------------------------------+
    | Field               | Value                                |
    +---------------------+--------------------------------------+
    | attachments         | []                                   |
    | availability_zone   | nova                                 |
    | bootable            | false                                |
    | consistencygroup_id | None                                 |
    | created_at          | 2023-10-03T12:05:18.552363           |
    | description         | None                                 |
    | encrypted           | False                                |
    | id                  | 95bb6e0d-7a96-44be-8c96-d3f21f4ab467 |
    | migration_status    | None                                 |
    | multiattach         | False                                |
    | name                | volume1                              |
    | properties          |                                      |
    | replication_status  | None                                 |
    | size                | 8                                    |
    | snapshot_id         | None                                 |
    | source_volid        | None                                 |
    | status              | creating                             |
    | type                | __DEFAULT__                          |
    | updated_at          | None                                 |
    | user_id             | cf2b372483d04850a53bd403b1137ffd     |
    +---------------------+--------------------------------------+
    
    查看卷列表
    [root@controller ~]# openstack volume list
    +--------------------------------------+---------+-----------+------+-------------+
    | ID                                   | Name    | Status    | Size | Attached to |
    +--------------------------------------+---------+-----------+------+-------------+
    | 95bb6e0d-7a96-44be-8c96-d3f21f4ab467 | volume1 | available |    8 |             |
    +--------------------------------------+---------+-----------+------+-------------+
    [root@controller ~]# 
    

使用 Dashboard 创建卷

![](https://img2023.cnblogs.com/blog/1422438/202310/1422438-20231003201122683-1815698566.jpg)

![](https://img2023.cnblogs.com/blog/1422438/202310/1422438-20231003201132595-775172063.jpg)

![](https://img2023.cnblogs.com/blog/1422438/202310/1422438-20231003201257919-1085004911.jpg)

同样，在控制节点终端也可以看到

![](https://img2023.cnblogs.com/blog/1422438/202310/1422438-20231003201423805-1877174338.jpg)

