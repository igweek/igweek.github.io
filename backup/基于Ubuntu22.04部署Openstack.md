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

   1. `connection = mysql+pymysql://keystone:KEYSTONE_DBPASS@controller/keystone`

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

输入demo用户密码（用于界面登陆、测试）

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

输入密码`GLANCE_PASS`

3. 安装Glance：

   1. `sudo apt install -y glance`
4. 配置Glance：

   1. `sudo nano /etc/glance/glance-api.conf`

找到`[database]`部分，添加以下内容（替换`GLANCE_DBPASS`为实际密码）：

```ini
[database]
connection = mysql+pymysql://glance:GLANCE_DBPASS@controller/glance
```

- 说明：这里的`glance:GLANCE_DBPASS`对应之前创建的数据库用户和密码，`controller`是数据库所在的控制节点主机名，`glance`是数据库名。

### 2. 配置认证信息（对接 Keystone）

在同一文件中，找到并配置以下部分：

#### （1）`[keystone_authtoken]`部分

```ini
[keystone_authtoken]
www_authenticate_uri = http://controller:5000
auth_url = http://controller:5000
memcached_servers = controller:11211
auth_type = password
project_domain_name = Default
user_domain_name = Default
project_name = service
username = glance
password = GLANCE_PASS
```

#### （2）`[paste_deploy]`部分

```ini
[paste_deploy]
flavor = keystone
```

### 3. 配置镜像存储位置

找到`[glance_store]`部分，配置本地文件存储（默认推荐方式）：

```ini
[glance_store]
stores = file,http
default_store = file
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

输入密码`NOVA_PASS`

# 为nova用户添加admin角色
openstack role add --project service --user nova admin

# 添加PLACEMENT用户
openstack user create --domain default --password PLACEMENT_PASS placement
openstack role add --project service --user placement admin

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
enabled_apis = osapi_compute,metadata
transport_url = rabbit://openstack:RABBIT_PASS@controller:5672/
my_ip = 192.168.100.10
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
password = NOVA_PASS

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
password = PLACEMENT_PASS

[neutron]
url = http://controller:9696
auth_url = http://controller:5000
auth_type = password
project_domain_name = Default
user_domain_name = Default
region_name = RegionOne
project_name = service
username = neutron
password = NEUTRON_PASS
service_metadata_proxy = True
metadata_proxy_shared_secret = METADATA_SECRET
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
my_ip = 192.168.100.20  # 计算节点IP
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

[neutron]
service_metadata_proxy = True
metadata_proxy_shared_secret = METADATA_SECRET
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
输入密码`NEUTRON_PASS`
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
local_ip = 192.168.100.10  # 控制节点管理IP
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
local_ip = 192.168.100.20  # 计算节点管理IP
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








