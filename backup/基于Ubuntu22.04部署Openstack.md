> [!note]
![截屏2025-09-23 22.42.05_副本.png](https://pic.myla.eu.org/file/nSZwLa2t.png)
> *   **操作系统**: Ubuntu 22.04 LTS
---

# 方法一：官方部署
### 一、环境准备

1. **虚拟机配置要求**（每台）：

   - 至少4GB内存（推荐8GB以上）
   - 至少2个CPU核心
   - 至少40GB磁盘空间
   - 至少2块网卡（一块管理网络，一块数据网络）
2. **网络规划**：

   - 管理网络：用于OpenStack各组件通信（例如192.168.100.0/24）
   - 数据网络：用于虚拟机实例通信（例如192.168.200.0/24）
3. **修改主机名和hosts文件**：在第一台节点（控制节点）：

   1. `sudo hostnamectl set-hostname controller`

   在第二台节点（计算节点）：

   1. `sudo hostnamectl set-hostname compute`

   编辑`/etc/hosts`文件，添加：

   1. `192.168.100.10 controller`
   2. `192.168.100.20 compute`
4. **安装依赖包**：

   1. `sudo apt update && sudo apt upgrade -y`
   2. `sudo apt install -y chrony python3-openstackclient`

### 二、配置NTP时间同步

1. 在控制节点配置chrony：

   1. `sudo nano /etc/chrony/chrony.conf`

   添加：

   1. `allow 192.168.100.0/24`

   重启服务：

   1. `sudo systemctl restart chronyd`
2. 在计算节点配置chrony同步到控制节点：

   1. `sudo nano /etc/chrony/chrony.conf`

   添加：

   1. `server controller iburst`

   重启服务并验证：

   1. `sudo systemctl restart chronyd`
   2. `chronyc sources`

### 三、配置数据库（仅控制节点）

1. 安装MariaDB：

   1. `sudo apt install -y mariadb-server python3-pymysql`
2. 配置MySQL：

   1. `sudo nano /etc/mysql/mariadb.conf.d/99-openstack.cnf`

   添加以下内容：

   1. `[mysqld]`
   2. `bind-address = 192.168.100.10`
   3. `default-storage-engine = innodb`
   4. `innodb_file_per_table = on`
   5. `max_connections = 4096`
   6. `collation-server = utf8_general_ci`
   7. `character-set-server = utf8`
3. 重启服务并设置root密码：

   1. `sudo systemctl restart mariadb`
   2. `sudo mysql_secure_installation`

### 四、安装消息队列（仅控制节点）

1. 安装RabbitMQ：

   1. `sudo apt install -y rabbitmq-server`
2. 创建OpenStack用户：

   1. `sudo rabbitmqctl add_user openstack RABBIT_PASS`
   2. `sudo rabbitmqctl set_permissions openstack ".*" ".*" ".*"`

### 五、安装Memcached（仅控制节点）

1. `sudo apt install -y memcached python3-memcache`
2. `sudo nano /etc/memcached.conf`

修改监听地址为控制节点管理IP：

1. `-l 192.168.100.10`

重启服务：

1. `sudo systemctl restart memcached`

### 六、安装OpenStack组件

#### 1. 身份服务(Keystone) - 控制节点

1. 创建数据库：

   1. `mysql -u root -p`
   2. `CREATE DATABASE keystone;`
   3. `GRANT ALL PRIVILEGES ON keystone.* TO 'keystone'@'localhost' IDENTIFIED BY 'KEYSTONE_DBPASS';`
   4. `GRANT ALL PRIVILEGES ON keystone.* TO 'keystone'@'%' IDENTIFIED BY 'KEYSTONE_DBPASS';`
   5. `FLUSH PRIVILEGES;`
   6. `exit`
2. 安装Keystone：

   1. `sudo apt install -y keystone`

   如果出现安装问题

```bash
sudo apt update --fix-missing
sudo apt install -f
```

3. 配置Keystone：

   1. `sudo nano /etc/keystone/keystone.conf`

   在`[database]`部分：

   1. `connection = mysql+pymysql://keystone:KEYSTONE_DBPASS[@controller](https://github.com/controller "@controller")/keystone`

   在`[token]`部分：

   1. `provider = fernet`
4. 同步数据库并初始化Fernet密钥：

   1. `sudo su -s /bin/sh -c "keystone-manage db_sync" keystone`
   2. `sudo keystone-manage fernet_setup --keystone-user keystone --keystone-group keystone`
   3. `sudo keystone-manage credential_setup --keystone-user keystone --keystone-group keystone`
5. 部署Keystone：

   1. `sudo keystone-manage bootstrap --bootstrap-password ADMIN_PASS \`
   2. `--bootstrap-admin-url http://controller:5000/v3/ \`
   3. `--bootstrap-internal-url http://controller:5000/v3/ \`
   4. `--bootstrap-public-url http://controller:5000/v3/ \`
   5. `--bootstrap-region-id RegionOne`
6. 配置Apache：

   1. `sudo nano /etc/apache2/apache2.conf`

   添加：

   1. `ServerName controller`

   重启Apache：

   1. `sudo systemctl restart apache2`
7. 配置环境变量：

   1. `export OS_USER_DOMAIN_NAME=Default`
   2. `export OS_PROJECT_DOMAIN_NAME=Default`
   3. `export OS_PROJECT_NAME=admin`
   4. `export OS_USERNAME=admin`
   5. `export OS_PASSWORD=ADMIN_PASS`
   6. `export OS_AUTH_URL=http://controller:5000/v3`
   7. `export OS_IDENTITY_API_VERSION=3`
   8. `export OS_IMAGE_API_VERSION=2`
8. 创建域、项目、用户和角色：

   1. `openstack domain create --description "An Example Domain" example`
   2. `openstack project create --domain default --description "Service Project" service`
   3. `openstack project create --domain default --description "Demo Project" demo`
   4. `openstack user create --domain default --password-prompt demo`
   5. `openstack role create user`
   6. `openstack role add --project demo --user demo user`

#### 2. 镜像服务(Glance) - 控制节点

1. 创建数据库：

   1. `mysql -u root -p`
   2. `CREATE DATABASE glance;`
   3. `GRANT ALL PRIVILEGES ON glance.* TO 'glance'@'localhost' IDENTIFIED BY 'GLANCE_DBPASS';`
   4. `GRANT ALL PRIVILEGES ON glance.* TO 'glance'@'%' IDENTIFIED BY 'GLANCE_DBPASS';`
   5. `FLUSH PRIVILEGES;`
   6. `exit`
2. 创建服务凭证：

   1. `openstack user create --domain default --password-prompt glance`
   2. `openstack role add --project service --user glance admin`
   3. `openstack service create --name glance --description "OpenStack Image" image`
   4. `openstack endpoint create --region RegionOne image public http://controller:9292`
   5. `openstack endpoint create --region RegionOne image internal http://controller:9292`
   6. `openstack endpoint create --region RegionOne image admin http://controller:9292`
3. 安装Glance：

   1. `sudo apt install -y glance`
4. 配置Glance：

   1. `sudo nano /etc/glance/glance-api.conf`

找到`[database]`部分，添加以下内容（替换`GLANCE_DBPASS`为实际密码）：

```ini
[database]
# 数据库连接字符串
connection = mysql+pymysql://glance:GLANCE_DBPASS@controller/glance
```

- 说明：这里的`glance:GLANCE_DBPASS`对应之前创建的数据库用户和密码，`controller`是数据库所在的控制节点主机名，`glance`是数据库名。

### 2. 配置认证信息（对接 Keystone）

在同一文件中，找到并配置以下部分：

#### （1）`[keystone_authtoken]`部分

```ini
[keystone_authtoken]
# Keystone认证服务地址
www_authenticate_uri = http://controller:5000
auth_url = http://controller:5000
memcached_servers = controller:11211
# 认证类型
auth_type = password
# 服务项目和用户信息（对应之前创建的服务凭证）
project_domain_name = Default
user_domain_name = Default
project_name = service
username = glance
password = GLANCE_PASS  # 替换为创建glance用户时设置的密码
```

#### （2）`[paste_deploy]`部分

```ini
[paste_deploy]
# 启用Keystone认证模式
flavor = keystone
```

### 3. 配置镜像存储位置

找到`[glance_store]`部分，配置本地文件存储（默认推荐方式）：

```ini
[glance_store]
# 支持的存储类型
stores = file,http
# 默认存储类型
default_store = file
# 本地存储路径（确保glance用户有读写权限）
filesystem_store_datadir = /var/lib/glance/images/
```

配置完成后，按`Ctrl+O`保存，`Ctrl+X`退出编辑器。
然后同步数据库：

1.  `sudo su -s /bin/sh -c "glance-manage db_sync" glance`
5. 重启服务：

   1. `sudo systemctl restart glance-api`

### **3. 计算服务 (Nova) 部署**

#### **3.1 控制节点配置**

##### **3.1.1 创建数据库和服务凭证**

# 1. 创建Nova数据库
mysql -u root -p
CREATE DATABASE nova_api;
CREATE DATABASE nova;
CREATE DATABASE nova_cell0;

GRANT ALL PRIVILEGES ON nova_api.* TO 'nova'@'localhost' IDENTIFIED BY 'NOVA_DBPASS';
GRANT ALL PRIVILEGES ON nova_api.* TO 'nova'@'%' IDENTIFIED BY 'NOVA_DBPASS';
GRANT ALL PRIVILEGES ON nova.* TO 'nova'@'localhost' IDENTIFIED BY 'NOVA_DBPASS';
GRANT ALL PRIVILEGES ON nova.* TO 'nova'@'%' IDENTIFIED BY 'NOVA_DBPASS';
GRANT ALL PRIVILEGES ON nova_cell0.* TO 'nova'@'localhost' IDENTIFIED BY 'NOVA_DBPASS';
GRANT ALL PRIVILEGES ON nova_cell0.* TO 'nova'@'%' IDENTIFIED BY 'NOVA_DBPASS';
FLUSH PRIVILEGES;
exit

# 2. 创建Nova服务凭证（需先加载admin环境变量）
source /etc/kolla/admin-openrc.sh

# 创建nova用户
openstack user create --domain default --password-prompt nova

# 为nova用户添加admin角色
openstack role add --project service --user nova admin

# 创建nova服务
openstack service create --name nova --description "OpenStack Compute" compute

# 创建API端点
openstack endpoint create --region RegionOne compute public http://controller:8774/v2.1
openstack endpoint create --region RegionOne compute internal http://controller:8774/v2.1
openstack endpoint create --region RegionOne compute admin http://controller:8774/v2.1
##### **3.1.2 安装 Nova 控制组件**


```bash
sudo apt install -y nova-api nova-conductor nova-novncproxy nova-scheduler
```
##### **3.1.3 配置 Nova**


```bash
sudo nano /etc/nova/nova.conf
```
关键配置项：


```ini
[DEFAULT]
# 启用计算API和元数据API
enabled_apis = osapi_compute,metadata
# 配置RabbitMQ消息队列
transport_url = rabbit://openstack:RABBIT_PASS@controller:5672/
# 配置控制节点主机名
my_ip = 192.168.3.131  # 控制节点IP
use_neutron = True
firewall_driver = nova.virt.firewall.NoopFirewallDriver

[api_database]
connection = mysql+pymysql://nova:NOVA_DBPASS@controller/nova_api

[database]
connection = mysql+pymysql://nova:NOVA_DBPASS@controller/nova

[keystone_authtoken]
www_authenticate_uri = http://controller:5000/
auth_url = http://controller:5000/
memcached_servers = controller:11211
auth_type = password
project_domain_name = Default
user_domain_name = Default
project_name = service
username = nova
password = NOVA_PASS  # nova用户的密码

[vnc]
enabled = True
server_listen = $my_ip
server_proxyclient_address = $my_ip

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
password = PLACEMENT_PASS  # placement用户的密码（需提前创建）
```
##### **3.1.4 同步数据库并初始化 cell**


```bash
# 同步API数据库
sudo su -s /bin/sh -c "nova-manage api_db sync" nova

# 注册cell0数据库
sudo su -s /bin/sh -c "nova-manage cell_v2 map_cell0" nova

# 创建cell1单元格
sudo su -s /bin/sh -c "nova-manage cell_v2 create_cell --name=cell1 --verbose" nova

# 同步计算数据库
sudo su -s /bin/sh -c "nova-manage db sync" nova

# 验证cell0和cell1是否注册成功
sudo su -s /bin/sh -c "nova-manage cell_v2 list_cells" nova
```
##### **3.1.5 重启 Nova 服务**


```bash
sudo systemctl restart nova-api nova-scheduler nova-conductor nova-novncproxy
sudo systemctl enable nova-api nova-scheduler nova-conductor nova-novncproxy
```
#### **3.2 计算节点配置**

##### **3.2.1 安装 Nova 计算组件**


```bash
# 检查CPU是否支持虚拟化（输出非空则支持）
egrep -c '(vmx|svm)' /proc/cpuinfo

# 安装计算组件
sudo apt install -y nova-compute
```
##### **3.2.2 配置 Nova 连接控制节点**


```bash
sudo nano /etc/nova/nova.conf
```
关键配置：


```ini
[DEFAULT]
enabled_apis = osapi_compute,metadata
transport_url = rabbit://openstack:RABBIT_PASS@controller:5672/
my_ip = 192.168.3.132  # 计算节点IP
use_neutron = True
firewall_driver = nova.virt.firewall.NoopFirewallDriver

[keystone_authtoken]
www_authenticate_uri = http://controller:5000/
auth_url = http://controller:5000/
memcached_servers = controller:11211
auth_type = password
project_domain_name = Default
user_domain_name = Default
project_name = service
username = nova
password = NOVA_PASS

[vnc]
enabled = True
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
password = PLACEMENT_PASS
```
##### **3.2.3 重启计算服务**


```bash
# 对于KVM虚拟化
sudo systemctl restart nova-compute
sudo systemctl enable nova-compute

# 检查计算节点是否注册到控制节点
# 在控制节点执行：
source /etc/kolla/admin-openrc.sh
openstack compute service list --service nova-compute
```
### **4. 网络服务 (Neutron) 部署**

#### **4.1 控制节点配置**

##### **4.1.1 创建数据库和服务凭证**


```bash
# 1. 创建Neutron数据库
mysql -u root -p
CREATE DATABASE neutron;
GRANT ALL PRIVILEGES ON neutron.* TO 'neutron'@'localhost' IDENTIFIED BY 'NEUTRON_DBPASS';
GRANT ALL PRIVILEGES ON neutron.* TO 'neutron'@'%' IDENTIFIED BY 'NEUTRON_DBPASS';
FLUSH PRIVILEGES;
exit

# 2. 创建服务凭证
source /etc/kolla/admin-openrc.sh

openstack user create --domain default --password-prompt neutron
openstack role add --project service --user neutron admin
openstack service create --name neutron --description "OpenStack Networking" network

# 创建API端点
openstack endpoint create --region RegionOne network public http://controller:9696
openstack endpoint create --region RegionOne network internal http://controller:9696
openstack endpoint create --region RegionOne network admin http://controller:9696
```
##### **4.1.2 安装 Neutron 控制组件**


```bash
sudo apt install -y neutron-server neutron-plugin-ml2 neutron-linuxbridge-agent neutron-dhcp-agent neutron-metadata-agent
```
##### **4.1.3 配置 ML2 插件（核心网络插件）**


```bash
sudo nano /etc/neutron/plugins/ml2/ml2_conf.ini
```
配置：


```ini
[ml2]
type_drivers = flat,vlan,vxlan
tenant_network_types = vxlan
mechanism_drivers = linuxbridge,l2population
extension_drivers = port_security

[ml2_type_flat]
flat_networks = provider

[ml2_type_vxlan]
vni_ranges = 1:1000

[securitygroup]
enable_ipset = True
```
##### **4.1.4 配置 Neutron 服务器**


```bash
sudo nano /etc/neutron/neutron.conf
```
配置：


```ini
[DEFAULT]
core_plugin = ml2
service_plugins =
transport_url = rabbit://openstack:RABBIT_PASS@controller:5672/
auth_strategy = keystone
notify_nova_on_port_status_changes = True
notify_nova_on_port_data_changes = True

[database]
connection = mysql+pymysql://neutron:NEUTRON_DBPASS@controller/neutron

[keystone_authtoken]
www_authenticate_uri = http://controller:5000/
auth_url = http://controller:5000/
memcached_servers = controller:11211
auth_type = password
project_domain_name = Default
user_domain_name = Default
project_name = service
username = neutron
password = NEUTRON_PASS

[nova]
auth_url = http://controller:5000/
auth_type = password
project_domain_name = Default
user_domain_name = Default
region_name = RegionOne
project_name = service
username = nova
password = NOVA_PASS
```
##### **4.1.5 配置 Linux 桥接代理**


```bash
sudo nano /etc/neutron/plugins/ml2/linuxbridge_agent.ini
```
配置：


```ini
[linux_bridge]
physical_interface_mappings = provider:ens34  # 物理网卡替换为实际外部网络接口

[vxlan]
enable_vxlan = True
local_ip = 192.168.3.131  # 控制节点管理IP
l2_population = True

[securitygroup]
enable_security_group = True
firewall_driver = neutron.agent.linux.iptables_firewall.IptablesFirewallDriver
```
##### **4.1.6 配置 DHCP 和元数据代理**


```bash
# DHCP代理配置
sudo nano /etc/neutron/dhcp_agent.ini
[DEFAULT]
interface_driver = linuxbridge
dhcp_driver = neutron.agent.linux.dhcp.Dnsmasq
enable_isolated_metadata = True

# 元数据代理配置
sudo nano /etc/neutron/metadata_agent.ini
[DEFAULT]
nova_metadata_host = controller
metadata_proxy_shared_secret = METADATA_SECRET  # 自定义密钥，需与Nova配置一致
```
##### **4.1.7 同步 Neutron 数据库**


```bash
sudo su -s /bin/sh -c "neutron-db-manage --config-file /etc/neutron/neutron.conf \
  --config-file /etc/neutron/plugins/ml2/ml2_conf.ini upgrade head" neutron
```
##### **4.1.8 重启服务**


```bash
sudo systemctl restart neutron-server neutron-linuxbridge-agent neutron-dhcp-agent neutron-metadata-agent
sudo systemctl enable neutron-server neutron-linuxbridge-agent neutron-dhcp-agent neutron-metadata-agent
```
#### **4.2 计算节点配置**

##### **4.2.1 安装 Neutron 组件**


```bash
sudo apt install -y neutron-linuxbridge-agent
```
##### **4.2.2 配置 Linux 桥接代理**


```bash
sudo nano /etc/neutron/plugins/ml2/linuxbridge_agent.ini
```
配置：


```ini
[linux_bridge]
physical_interface_mappings = provider:ens34  # 计算节点外部网络接口

[vxlan]
enable_vxlan = True
local_ip = 192.168.3.132  # 计算节点管理IP
l2_population = True

[securitygroup]
enable_security_group = True
firewall_driver = neutron.agent.linux.iptables_firewall.IptablesFirewallDriver
```
##### **4.2.3 配置 Neutron 通用参数**


```bash
sudo nano /etc/neutron/neutron.conf
```
配置：


```ini
[DEFAULT]
transport_url = rabbit://openstack:RABBIT_PASS@controller:5672/
auth_strategy = keystone

[keystone_authtoken]
www_authenticate_uri = http://controller:5000/
auth_url = http://controller:5000/
memcached_servers = controller:11211
auth_type = password
project_domain_name = Default
user_domain_name = Default
project_name = service
username = neutron
password = NEUTRON_PASS
```
##### **4.2.4 重启服务**


```bash
sudo systemctl restart neutron-linuxbridge-agent
sudo systemctl enable neutron-linuxbridge-agent
```
### **5. 仪表板 (Horizon) 部署（控制节点）**

#### **5.1 安装 Horizon**


```bash
sudo apt install -y openstack-dashboard
```
#### **5.2 配置 Horizon**


```bash
sudo nano /etc/openstack-dashboard/local_settings.py
```
关键配置：

python

运行

```python
# 配置Keystone认证地址
OPENSTACK_HOST = "controller"
OPENSTACK_KEYSTONE_URL = "http://%s:5000/v3" % OPENSTACK_HOST

# 配置默认域和项目
OPENSTACK_KEYSTONE_MULTIDOMAIN_SUPPORT = True
OPENSTACK_API_VERSIONS = {
    "identity": 3,
    "image": 2,
    "volume": 3,
}
OPENSTACK_KEYSTONE_DEFAULT_DOMAIN = "Default"
OPENSTACK_KEYSTONE_DEFAULT_PROJECT = "admin"

# 配置允许的主机
ALLOWED_HOSTS = ['*']  # 生产环境需指定具体IP

# 启用自助服务网络
OPENSTACK_NEUTRON_NETWORK = {
    'enable_router': True,
    'enable_quotas': True,
    'enable_distributed_router': False,
    'enable_ha_router': False,
    'enable_lb': False,
    'enable_firewall': False,
    'enable_vpn': False,
    'enable_fip_topology_check': True,
}

# 配置会话存储
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
        'LOCATION': 'controller:11211',
    }
}
```
#### **5.3 重启 Apache 服务**


```bash
sudo systemctl restart apache2
```
#### **5.4 访问 Horizon 仪表板**

通过浏览器访问：`http://控制节点IP/horizon`

使用`admin`用户和对应密码登录（从`/etc/kolla/passwords.yml`获取）。

### 验证部署

所有服务部署完成后，在控制节点执行：


```bash
source /etc/kolla/admin-openrc.sh
openstack service list  # 查看所有服务状态
openstack compute service list  # 查看计算服务
openstack network agent list  # 查看网络代理
```
若所有服务状态为`up`，则部署成功。

### 七、验证安装

1. 下载一个测试镜像：

   1. `wget http://download.cirros-cloud.net/0.4.0/cirros-0.4.0-x86_64-disk.img`
   2. `openstack image create "cirros" --file cirros-0.4.0-x86_64-disk.img --disk-format qcow2 --container-format bare --public`
2. 创建网络、子网和路由
3. 启动一个实例进行测试








# 方法二：All in one
## 一.环境准备

本文以VMWare中创建的虚拟机为例


|  硬件  | 规格 |           备注           |
| :----: | :---: | :-----------------------: |
| 网卡1 |      | 已分配内网IP,以ens33为例 |
| 网卡2 |      | 不需要分配IP,以ens37为例 |
| 系统盘 | 60G+ |  用于安装系统及挂载存储  |
| 数据盘 | 100G+ | 初始不需要分区,后续操作用 |

## 二.开启ROOT远程登录

1. 使用现有账号登录设置root密码：

```bash
sudo passwd root
```

1. 修改sshd配置开启远程登录：

```bash
sed -i '/PermitRootLogin/d' /etc/ssh/sshd_config
echo "PermitRootLogin yes" >> /etc/ssh/sshd_config
systemctl restart sshd
```

## 三.常用工具


| 工具名称 |                用途                |
| :-------: | :--------------------------------: |
|  gparted  |       带图形化界面的分区工具       |
|   fdisk   |         命令行分区管理工具         |
| net-tools | 网络工具(使用ifconfig需要安装此包) |

## 四.安装OpenStack

<dl> 注：本次安装基于OpenStack官方文档，并且对遇到的安装问题进行补充。 <dd><a href="https://docs.openstack.org/kolla-ansible/latest/user/quickstart.html" rel="nofollow">点击此处查看官方文档</a></dd></dl>

### 1.基础工具安装

```bash
# 安装python工具等
apt install git python3-dev libffi-dev gcc libssl-dev -y
```

### 2.安装并创建虚拟环境

虚拟环境路径可自定义，本文以"/opt/openstack/venv"为例。

```bash
# 安装虚拟环境包
apt install python3-venv -y
# 创建虚拟环境
python3 -m venv /opt/openstack/venv
```

### 3.进入虚拟环境

```bash
source /opt/openstack/venv/bin/activate
```

注：后续操作都在虚拟环境下进行，如果要退出虚拟环境请使用一下命令``

```bash
deactivate
```

### 4.升级pip并配置国内源

本地安装建议使用清华源，比阿里的源速度快N倍。

```bash
# pip3临时使用清华源更新pip
pip3 install -U pip -i https://pypi.tuna.tsinghua.edu.cn/simple
# pip设置清华源
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

### 5.安装ansible

```bash
pip install 'ansible>=4,<6'
```

### 6.安装对应openstack版本的kolla-ansible

```bash
pip install git+https://opendev.org/openstack/kolla-ansible@stable/zed
```

### 7.创建配置文件目录并附加权限

```bash
sudo mkdir -p /etc/kolla
sudo chown $USER:$USER /etc/kolla
```

### 8.复制配置文件

```bash
# 复制配置文件到配置文件目录
cp -r /opt/openstack/venv/share/kolla-ansible/etc_examples/kolla/* /etc/kolla
```

### 9.复制依赖文件到当前目录

```bash
cp /opt/openstack/venv/share/kolla-ansible/ansible/inventory/all-in-one .
```

### 10.安装ansible依赖

```bash
kolla-ansible install-deps
```

### 11.生成密码到/etc/kolla/passwords.yml文件中

注：要配置的密码有很多，可以手动编辑文件进行配置，也可以执行下面命令自动生成。

```bash
 kolla-genpwd
```

### 12.修改/etc/kolla/passwords.yml中登录密码

找到文件中key控制台登录密码的key：keystone_admin_password
或者直接使用命令替换

```bash
sed -i 's/^keystone_admin_password.*/keystone_admin_password: 自定义密码/' /etc/kolla/passwords.yml
```

### 13.修改/etc/kolla/globals.yml文件,配置并开启服务

```yaml
# 基础配置:
kolla_base_distro:          系统配置，修改为ubuntu即可
openstack_release:          openstack版本，本文使用的zed
kolla_internal_vip_address: 用来访问web控制台,
							如果enable_haproxy为no则配置一个单独的IP,
							否则使用network_interface网卡分配的IP
network_interface:          内部网卡名称，本文是ens33
neutron_external_interface: 外部网卡名称，本文是ens37
# 服务组件配置:
enable_haproxy: "no" #高可用，如果为yes则kolla_internal_vip_address可以使用独立IP
enable_cinder: "yes" #块存储
enable_cinder_backup: "no"
enable_cinder_backend_lvm: "yes" #使用逻辑存储
enable_neutron_provider_networks: "yes" # 启用外部网络
nova_compute_virt_type: "qemu" # 虚拟化类型(物理机用kvm,VMWare使用qemu)
nova_console: "spice"
```

### 14.cinder存储配置

```bash
# a.查看存储节点的盘:
ansible -i all-in-one "storage*" -a "lsblk"
# b.格式化并且创建分区组
mkfs.ext4   /dev/sdb
pvcreate    /dev/sdb
vgcreate  cinder-volumes  /dev/sdb
```

### 15.预配置

```bash
# 基础环境安装，比如docker等
kolla-ansible -i ./all-in-one bootstrap-servers
```

### 16.环境检测

```bash
kolla-ansible -i ./all-in-one prechecks
```

注意：如果检测在CheckingdockerSDK报错找不到docker模块的话，修改all-in-one文件内容如下。

```bash
[deployment]
localhost       ansible_connection=local  ansible_python_interpreter="{{ ansible_playbook_python }}"
```

### 17.开始部署

```bash
kolla-ansible -i ./all-in-one deploy
```

### 18.安装客户端

```bash
pip install python-openstackclient -c https://releases.openstack.org/constraints/upper/master
```

### 19.生成clouds.yaml文件

```bash
kolla-ansible post-deploy
```

### 20.访问web管理页面

[http://kolla_internal_vip_address配置的ip/](http://xn--kolla_internal_vip_addressip-ti92e887ie1zg/)
用户名：admin
密码：/etc/kolla/passwords.yml中keystone_admin_password的密码

## 附

### 一.修改web管理页面端口

#### 1.修改horizon端口并重启服务

```bash
cd /etc/kolla/horizon

vim horizon.conf
# 修改内容如下
Listen ip:80 => Listen ip:想要使用的端口
<VirtualHost ip:80> => <VirtualHost ip:想要使用的端口>
# 修改完后保存horizon.conf文件

vim local_settings
# 搜索80
/80
# 会看到如下节点
'http': {
        'name': 'HTTP',
        'ip_protocol': 'tcp',
        'from_port': '80',
        'to_port': '80',
    },
# 修改from_port和to_port为想要使用的端口
'http': {
        'name': 'HTTP',
        'ip_protocol': 'tcp',
        'from_port': '想要使用的端口',
        'to_port': '想要使用的端口',
    },
# 修改完保存local_settings文件

# docker重启horizon服务
docker stop  horizon
docker start horizon
```

#### 2.修改haproxy代理的horizon端口并重启服务

```bash
cd /etc/kolla/haproxy/services.d/

vim horizon.cfg
# 修改horizon_front和horizon_back中的80为想要使用的端口

# docker重启haproxy服务
docker stop  haproxy
docker start haproxy


