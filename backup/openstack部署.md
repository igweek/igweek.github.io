![M 192.168.100.10.png](https://pic.myla.eu.org/file/1alvKqWr.png)

📌 环境信息

- **OpenStack 版本**: Yoga
- **操作系统**: Ubuntu 22.04
- **安装源**: `apt install`（默认仓库）
- **统一密码**: openstack（所有服务使用相同密码）
- **网络规划**:
  - **管理网络**: 192.168.100.0/24（用于 OpenStack 组件通信）
  - **数据网络**: 由 Neutron 管理（用于虚拟机实例通信）
- **节点角色**:
  - **控制节点（controller）**: 192.168.100.10
  - **计算节点（compute）**: 192.168.100.20

---

## 🔧 1. 准备工作

### 1.1 控制节点（controller）

```bash
# 设置 root 密码并允许 SSH 登录
sudo passwd root
sudo sed -i /PermitRootLogin/d /etc/ssh/sshd_config
echo "PermitRootLogin yes" | sudo tee -a /etc/ssh/sshd_config
sudo systemctl restart sshd

# 配置静态 IP（管理网络）
sudo nano /etc/netplan/01-netcfg.yaml
```

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    ens33:
      dhcp4: true
      optional: true
    ens34:
      addresses: [192.168.100.10/24]
      dhcp4: false
      optional: true
```

```bash
sudo netplan apply

# 可选：更换国内镜像源
bash <(curl -sSL https://linuxmirrors.cn/main.sh)
```

### 1.2 计算节点（compute）

```bash
# 同上，但 IP 设置为 192.168.100.20
sudo hostnamectl set-hostname compute
```

### 1.3 统一主机名与 hosts 配置

在两台节点的 `/etc/hosts` 中添加：

```bash
192.168.100.10 controller
192.168.100.20 compute
```

### 1.4 安装基础依赖

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y chrony python3-openstackclient
```

---

## ⏰ 2. 配置 NTP 时间同步

### 2.1 控制节点

```bash
sudo nano /etc/chrony/chrony.conf
# 添加：allow 192.168.100.0/24
sudo systemctl restart chronyd
```

### 2.2 计算节点

```bash
sudo nano /etc/chrony/chrony.conf
# 添加：server controller iburst
sudo systemctl restart chronyd
chronyc sources  # 验证同步
```

---

## 🗄️ 3. 配置数据库（MariaDB，仅控制节点）

```bash
sudo apt install -y mariadb-server python3-pymysql

sudo nano /etc/mysql/mariadb.conf.d/99-openstack.cnf
```

```ini
[mysqld]
bind-address = 192.168.100.10
default-storage-engine = innodb
innodb_file_per_table = on
max_connections = 4096
collation-server = utf8_general_ci
character-set-server = utf8
```

```bash
sudo systemctl restart mariadb
sudo mysql_secure_installation  # 设置 root 密码为 openstack
```

---

## 🐇 4. 消息队列（RabbitMQ，仅控制节点）

```bash
sudo apt install -y rabbitmq-server

# 使用固定密码
sudo rabbitmqctl add_user openstack openstack
sudo rabbitmqctl set_permissions openstack ".*" ".*" ".*"
```

---

## 🔥 5. Memcached（仅控制节点）

```bash
sudo apt install -y memcached python3-memcache

sudo nano /etc/memcached.conf
# 修改：-l 192.168.100.10

sudo systemctl restart memcached
```

---

## 👤 6. 身份服务（Keystone，控制节点）

### 6.1 创建数据库

```bash
mysql -u root -p
```

```sql
CREATE DATABASE keystone;
GRANT ALL PRIVILEGES ON keystone.* TO keystone@localhost IDENTIFIED BY openstack;
GRANT ALL PRIVILEGES ON keystone.* TO keystone@% IDENTIFIED BY openstack;
FLUSH PRIVILEGES;
exit
```

### 6.2 安装与配置

```bash
sudo apt install -y keystone

sudo nano /etc/keystone/keystone.conf
```

```ini
[database]
connection = mysql+pymysql://keystone:openstack@controller/keystone

[token]
provider = fernet
```

### 6.3 初始化数据库与密钥

```bash
sudo su -s /bin/sh -c "keystone-manage db_sync" keystone
sudo keystone-manage fernet_setup --keystone-user keystone --keystone-group keystone
sudo keystone-manage credential_setup --keystone-user keystone --keystone-group keystone

# 使用固定密码
sudo keystone-manage bootstrap --bootstrap-password openstack \
  --bootstrap-admin-url http://controller:5000/v3/ \
  --bootstrap-internal-url http://controller:5000/v3/ \
  --bootstrap-public-url http://controller:5000/v3/ \
  --bootstrap-region-id RegionOne
```

### 6.4 配置 Apache 并重启

```bash
echo "ServerName controller" | sudo tee -a /etc/apache2/apache2.conf
sudo systemctl restart apache2
```

### 6.5 持久化环境变量

```bash
sudo tee /etc/profile.d/openstack.sh << EOF
export OS_USER_DOMAIN_NAME=Default
export OS_PROJECT_DOMAIN_NAME=Default
export OS_PROJECT_NAME=admin
export OS_USERNAME=admin
export OS_PASSWORD=openstack
export OS_AUTH_URL=http://controller:5000/v3
export OS_IDENTITY_API_VERSION=3
export OS_IMAGE_API_VERSION=2
EOF
sudo chmod +x /etc/profile.d/openstack.sh
source /etc/profile.d/openstack.sh
```

### 6.6 创建域、项目与用户

```bash
openstack domain create --description "An Example Domain" example
openstack project create --domain default --description "Service Project" service
openstack project create --domain default --description "Demo Project" demo
openstack user create --domain default --password openstack demo
openstack role create user
openstack role add --project demo --user demo user
```

---

## 🖼️ 7. 镜像服务（Glance，控制节点）

### 7.1 创建数据库

```bash
mysql -u root -p
```

```sql
CREATE DATABASE glance;
GRANT ALL PRIVILEGES ON glance.* TO glance@localhost IDENTIFIED BY openstack;
GRANT ALL PRIVILEGES ON glance.* TO glance@% IDENTIFIED BY openstack;
FLUSH PRIVILEGES;
exit
```

### 7.2 创建服务凭证

```bash
openstack user create --domain default --password openstack glance
openstack role add --project service --user glance admin
openstack service create --name glance --description "OpenStack Image" image
openstack endpoint create --region RegionOne image public http://controller:9292
openstack endpoint create --region RegionOne image internal http://controller:9292
openstack endpoint create --region RegionOne image admin http://controller:9292
```

### 7.3 安装与配置

```bash
sudo apt install -y glance

sudo nano /etc/glance/glance-api.conf
```

```ini
[database]
connection = mysql+pymysql://glance:openstack@controller/glance

[keystone_authtoken]
www_authenticate_uri = http://controller:5000
auth_url = http://controller:5000
memcached_servers = controller:11211
auth_type = password
project_domain_name = Default
user_domain_name = Default
project_name = service
username = glance
password = openstack

[paste_deploy]
flavor = keystone

[glance_store]
stores = file,http
default_store = file
filesystem_store_datadir = /var/lib/glance/images/
```

### 7.4 同步数据库并重启

```bash
sudo su -s /bin/sh -c "glance-manage db_sync" glance
sudo systemctl restart glance-api
```

---

## ⚙️ 8. 计算服务（Nova）

### 8.1 控制节点配置

#### 8.1.1 创建数据库

```bash
mysql -u root -p
```

```sql
CREATE DATABASE nova_api;
CREATE DATABASE nova;
CREATE DATABASE nova_cell0;
GRANT ALL PRIVILEGES ON nova_api.* TO nova@localhost IDENTIFIED BY openstack;
GRANT ALL PRIVILEGES ON nova_api.* TO nova@% IDENTIFIED BY openstack;
GRANT ALL PRIVILEGES ON nova.* TO nova@localhost IDENTIFIED BY openstack;
GRANT ALL PRIVILEGES ON nova.* TO nova@% IDENTIFIED BY openstack;
GRANT ALL PRIVILEGES ON nova_cell0.* TO nova@localhost IDENTIFIED BY openstack;
GRANT ALL PRIVILEGES ON nova_cell0.* TO nova@% IDENTIFIED BY openstack;
FLUSH PRIVILEGES;
exit
```

#### 8.1.2 创建服务凭证

```bash
openstack user create --domain default --password openstack nova
openstack role add --project service --user nova admin
openstack user create --domain default --password openstack placement
openstack role add --project service --user placement admin
openstack service create --name nova --description "OpenStack Compute" compute
openstack endpoint create --region RegionOne compute public http://controller:8774/v2.1
openstack endpoint create --region RegionOne compute internal http://controller:8774/v2.1
openstack endpoint create --region RegionOne compute admin http://controller:8774/v2.1
```

#### 8.1.3 安装与配置

```bash
sudo apt install -y nova-api nova-conductor nova-novncproxy nova-scheduler

sudo nano /etc/nova/nova.conf
```

```ini
[DEFAULT]
enabled_apis = osapi_compute,metadata
transport_url = rabbit://openstack:openstack@controller:5672/
my_ip = 192.168.100.10
use_neutron = True
firewall_driver = nova.virt.firewall.NoopFirewallDriver

[api_database]
connection = mysql+pymysql://nova:openstack@controller/nova_api

[database]
connection = mysql+pymysql://nova:openstack@controller/nova

[keystone_authtoken]
www_authenticate_uri = http://controller:5000/
auth_url = http://controller:5000/
memcached_servers = controller:11211
auth_type = password
project_domain_name = Default
user_domain_name = Default
project_name = service
username = nova
password = openstack

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
password = openstack
```

#### 8.1.4 同步数据库并初始化

```bash
sudo su -s /bin/sh -c "nova-manage api_db sync" nova
sudo su -s /bin/sh -c "nova-manage cell_v2 map_cell0" nova
sudo su -s /bin/sh -c "nova-manage cell_v2 create_cell --name=cell1 --verbose" nova
sudo su -s /bin/sh -c "nova-manage db sync" nova
sudo su -s /bin/sh -c "nova-manage cell_v2 list_cells" nova  # 验证
```

#### 8.1.5 重启服务

```bash
sudo systemctl restart nova-api nova-scheduler nova-conductor nova-novncproxy
sudo systemctl enable nova-api nova-scheduler nova-conductor nova-novncproxy
```

### 8.2 计算节点配置

#### 8.2.1 安装与配置

```bash
# 检查虚拟化支持
egrep -c (vmx|svm) /proc/cpuinfo

sudo apt install -y nova-compute

sudo nano /etc/nova/nova.conf
```

```ini
[DEFAULT]
enabled_apis = osapi_compute,metadata
transport_url = rabbit://openstack:openstack@controller:5672/
my_ip = 192.168.100.20
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
password = openstack

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
password = openstack
```

#### 8.2.2 重启服务

```bash
sudo systemctl restart nova-compute
sudo systemctl enable nova-compute

# 在控制节点验证计算节点注册
openstack compute service list --service nova-compute
```

---

## 🌐 9. 网络服务（Neutron）

### 9.1 控制节点配置

#### 9.1.1 创建数据库

```bash
mysql -u root -p
```

```sql
CREATE DATABASE neutron;
GRANT ALL PRIVILEGES ON neutron.* TO neutron@localhost IDENTIFIED BY openstack;
GRANT ALL PRIVILEGES ON neutron.* TO neutron@% IDENTIFIED BY openstack;
FLUSH PRIVILEGES;
exit
```

#### 9.1.2 创建服务凭证

```bash
openstack user create --domain default --password openstack neutron
openstack role add --project service --user neutron admin
openstack service create --name neutron --description "OpenStack Networking" network
openstack endpoint create --region RegionOne network public http://controller:9696
openstack endpoint create --region RegionOne network internal http://controller:9696
openstack endpoint create --region RegionOne network admin http://controller:9696
```

#### 9.1.3 安装与配置

```bash
sudo apt install -y neutron-server neutron-plugin-ml2 neutron-linuxbridge-agent neutron-dhcp-agent neutron-metadata-agent

# 配置 ML2 插件
sudo nano /etc/neutron/plugins/ml2/ml2_conf.ini
```

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

```bash
# 配置 Neutron 服务器
sudo nano /etc/neutron/neutron.conf
```

```ini
[DEFAULT]
core_plugin = ml2
service_plugins =
transport_url = rabbit://openstack:openstack@controller:5672/
auth_strategy = keystone
notify_nova_on_port_status_changes = True
notify_nova_on_port_data_changes = True

[database]
connection = mysql+pymysql://neutron:openstack@controller/neutron

[keystone_authtoken]
www_authenticate_uri = http://controller:5000/
auth_url = http://controller:5000/
memcached_servers = controller:11211
auth_type = password
project_domain_name = Default
user_domain_name = Default
project_name = service
username = neutron
password = openstack

[nova]
auth_url = http://controller:5000/
auth_type = password
project_domain_name = Default
user_domain_name = Default
region_name = RegionOne
project_name = service
username = nova
password = openstack
```

```bash
# 配置 Linux 桥接代理
sudo nano /etc/neutron/plugins/ml2/linuxbridge_agent.ini
```

```ini
[linux_bridge]
physical_interface_mappings = provider:ens34

[vxlan]
enable_vxlan = True
local_ip = 192.168.100.10
l2_population = True

[securitygroup]
enable_security_group = True
firewall_driver = neutron.agent.linux.iptables_firewall.IptablesFirewallDriver
```

```bash
# 配置 DHCP 代理
sudo nano /etc/neutron/dhcp_agent.ini
```

```ini
[DEFAULT]
interface_driver = linuxbridge
dhcp_driver = neutron.agent.linux.dhcp.Dnsmasq
enable_isolated_metadata = True
```

```bash
# 配置元数据代理
sudo nano /etc/neutron/metadata_agent.ini
```

```ini
[DEFAULT]
nova_metadata_host = controller
metadata_proxy_shared_secret = openstack
```

#### 9.1.4 同步数据库并重启

```bash
sudo su -s /bin/sh -c "neutron-db-manage --config-file /etc/neutron/neutron.conf \
  --config-file /etc/neutron/plugins/ml2/ml2_conf.ini upgrade head" neutron

sudo systemctl restart neutron-server neutron-linuxbridge-agent neutron-dhcp-agent neutron-metadata-agent
sudo systemctl enable neutron-server neutron-linuxbridge-agent neutron-dhcp-agent neutron-metadata-agent
```

### 9.2 计算节点配置

#### 9.2.1 安装与配置

```bash
sudo apt install -y neutron-linuxbridge-agent

sudo nano /etc/neutron/plugins/ml2/linuxbridge_agent.ini
```

```ini
[linux_bridge]
physical_interface_mappings = provider:ens34

[vxlan]
enable_vxlan = True
local_ip = 192.168.100.20
l2_population = True

[securitygroup]
enable_security_group = True
firewall_driver = neutron.agent.linux.iptables_firewall.IptablesFirewallDriver
```

```bash
sudo nano /etc/neutron/neutron.conf
```

```ini
[DEFAULT]
transport_url = rabbit://openstack:openstack@controller:5672/
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
password = openstack
```

#### 9.2.2 重启服务

```bash
sudo systemctl restart neutron-linuxbridge-agent
sudo systemctl enable neutron-linuxbridge-agent
```

---

## 🖥️ 10. 仪表板（Horizon，控制节点）

### 10.1 安装与配置

```bash
sudo apt install -y openstack-dashboard

sudo nano /etc/openstack-dashboard/local_settings.py
```

```python
OPENSTACK_HOST = "controller"
OPENSTACK_KEYSTONE_URL = "http://%s:5000/v3" % OPENSTACK_HOST
OPENSTACK_KEYSTONE_MULTIDOMAIN_SUPPORT = True
OPENSTACK_API_VERSIONS = {
    "identity": 3,
    "image": 2,
    "volume": 3,
}
OPENSTACK_KEYSTONE_DEFAULT_DOMAIN = "Default"
OPENSTACK_KEYSTONE_DEFAULT_PROJECT = "admin"
ALLOWED_HOSTS = [*]
OPENSTACK_NEUTRON_NETWORK = {
    enable_router: True,
    enable_quotas: True,
    enable_distributed_router: False,
    enable_ha_router: False,
    enable_lb: False,
    enable_firewall: False,
    enable_vpn: False,
    enable_fip_topology_check: True,
}
SESSION_ENGINE = django.contrib.sessions.backends.cache
CACHES = {
    default: {
        BACKEND: django.core.cache.backends.memcached.MemcachedCache,
        LOCATION: controller:11211,
    }
}
```

### 10.2 重启 Apache

```bash
sudo systemctl restart apache2
```

---

## 🔍 11. 验证部署

### 11.1 检查服务状态

```bash
openstack service list
openstack compute service list
openstack network agent list
```

### 11.2 下载测试镜像

```bash
wget http://download.cirros-cloud.net/0.4.0/cirros-0.4.0-x86_64-disk.img
openstack image create "cirros" --file cirros-0.4.0-x86_64-disk.img --disk-format qcow2 --container-format bare --public
```

### 11.3 访问 Horizon

- 地址: `http://192.168.100.10/horizon`
- 用户名: `admin`
- 密码: `openstack`
- 域: `Default`

---

## 🛡️ 12. 安全与防火墙配置（可选）

### 12.1 开放必要端口

```bash
sudo ufw allow 5000,35357,9292,8774,9696,6080/tcp
sudo ufw enable
```

### 12.2 检查服务依赖状态

```bash
sudo systemctl status mariadb rabbitmq-server memcached chronyd
```

---