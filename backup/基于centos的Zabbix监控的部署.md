## 1. 概念解释  
**Zabbix** 是一套强大的监控系统，具有如下特点：  
- **Zabbix Server**：负责数据收集与处理。  
- **MySQL**：数据库用于存储监控数据、配置等。  
- **Web 前端**：基于 PHP 和 Apache（或 Nginx）提供可视化管理界面。  
- **Zabbix Agent**：安装在被监控的主机上，负责采集数据并上报给 Zabbix Server。

### 关键组件：
- **Zabbix Server**：主服务器，用于管理监控项和触发器。  
- **MySQL**：Zabbix 数据库，用于存储所有监控数据。  
- **Zabbix Agent**：安装在客户端（被监控的机器）上，用于采集机器的监控数据（如 CPU、内存、磁盘等）。  


![123333.png](https://pic.myla.eu.org/file/1757254194161_123333.png)

---



## 2. 学习意义  
- **Zabbix** 能帮助管理员实时监控系统性能、服务器状态、网络设备等，并触发告警，便于问题的快速定位。  
- 通过部署 Zabbix，可以及时发现服务器硬件、应用服务、网络状态等问题。  
- 监控系统的部署技能是运维人员的基本能力之一。

---

## 3. 实例（以 CentOS 8 + MySQL + Zabbix 为例）

### 步骤 1：更换软件源
```bash
bash <(curl -sSL https://linuxmirrors.cn/main.sh)
```

### 步骤 2：检查php版本
```bash
php -v
php-fpm -v  
#如果php版本低于8.2，请升级php版本，在进行后续操作
```

### 步骤 3：php版本升级
```bash
wget https://rpms.remirepo.net/enterprise/remi-release-8.rpm
sudo rpm -ivh remi-release-8.rpm --nodeps --force
ls /etc/yum.repos.d/ | grep remi
#若输出包含 remi.repo、remi-modular.repo 等文件，说明安装成功。
sudo dnf clean all
sudo dnf makecache
```
### 步骤4：继续安装php8
```bash
# 重置 PHP 模块配置
sudo dnf module reset php -y

# 启用 Remi 仓库的 PHP 8.2 模块
sudo dnf module enable php:remi-8.2 -y

# 安装 PHP 8.2 及扩展（添加 --allowerasing 解决可能的依赖冲突）
sudo dnf install -y \
  php \
  php-cli \
  php-fpm \
  php-mysqlnd \
  php-mbstring \
  php-gd \
  php-xml \
  php-zip \
  php-bcmath \
  php-opcache \
  --allowerasing
```
### 步骤5：验证php版本
```bash
# 查看 PHP 版本
php -v

# 查看 PHP-FPM 版本
php-fpm -v
```

### 步骤6：继续安装zabbix监控
```bash
rpm -Uvh https://repo.zabbix.com/zabbix/7.0/centos/8/x86_64/zabbix-release-latest-7.0.el8.noarch.rpm
dnf clean all
dnf install -y zabbix-server-mysql zabbix-web-mysql zabbix-apache-conf zabbix-sql-scripts zabbix-agent
```

### 步骤7：创建数据库
```bash
dnf install mysql-server -y
systemctl start mysqld
systemctl enable mysqld
```
输入mysql
![12.PNG](https://pic.myla.eu.org/file/1757379681861_12.PNG)

```bash
zcat /usr/share/zabbix-sql-scripts/mysql/server.sql.gz | mysql --default-character-set=utf8mb4 -uzabbix -p zabbix
```

输入mysql
```sql
set global log_bin_trust_function_creators = 0;
quit;
```


### 步骤 8：配置 Zabbix Server  
编辑 `/etc/zabbix/zabbix_server.conf`，并更新以下字段：  
```ini
DBHost=localhost
DBName=zabbix
DBUser=zabbix
DBPassword=password
```

### 步骤 9：配置 PHP 时区  
```bash
vi /etc/php-fpm.d/zabbix.conf
```
找到并修改：  
```ini
php_value[date.timezone] = Asia/Shanghai
```

### 步骤 10：启动并设置自启  
```bash
systemctl enable --now zabbix-server zabbix-agent httpd php-fpm
```

### 步骤 11：防火墙配置  
```bash
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-port=10050/tcp
firewall-cmd --permanent --add-port=10051/tcp
firewall-cmd --reload
```

### 步骤 12：Web 界面访问  
访问 `http://<服务器IP>/zabbix`，按照安装向导配置数据库连接，默认登录用户为 `Admin`，密码为 `zabbix`。

---

## 4. 实例解析  
- **安装 MySQL**
- **数据库和用户创建**：Zabbix 需要一个数据库来存储监控数据，`utf8mb4` 是官方推荐的字符集，能够完全支持多字节字符。  
- **Zabbix Server 配置**：必须填写正确的数据库连接信息，否则 Zabbix Server 无法正常启动。  
- **PHP 时区设置**：Zabbix Web 端需要配置正确的时区，以确保时间显示正确。  
- **防火墙配置**：需要确保 HTTP、Zabbix Agent 和 Server 的通信端口开放，才能正常进行数据传输。  

---

## 5. 客户端（Zabbix Agent）部署  
如果你想让其他服务器或设备被 Zabbix 监控，需要在它们上面安装 **Zabbix Agent**。这里是客户端部署的步骤：  

### 步骤 1：安装 Zabbix Agent  
在被监控的服务器上，执行以下命令来安装 Zabbix Agent：  
```bash
dnf install -y zabbix-agent
```

### 步骤 2：配置 Zabbix Agent  
编辑 `/etc/zabbix/zabbix_agentd.conf`，并更新以下字段：  
```ini
Server=<Zabbix Server IP>
Hostname=<Client Hostname>
```
`Server`：填写 Zabbix Server 的 IP 地址。  
`Hostname`：填写当前被监控机器的主机名，Zabbix Server 会根据此识别监控的对象。

### 步骤 3：启动并设置自启  
```bash
systemctl enable --now zabbix-agent
```

### 步骤 4：在 Zabbix Server 上添加该客户端  
登录 Zabbix Web 界面，点击“配置”->“主机”->“创建主机”，然后填写主机名称、IP 地址，选择监控模板，保存即可。

---

## 6. 相似问题

1. 在 CentOS 7 上使用 MySQL 作为数据库安装 Zabbix，如何解决 PHP 版本不符合要求的问题（请列出需要安装的 PHP 版本和相关源）？
2. 你已经在 Zabbix Server 上成功配置数据库，现在需要添加一个新的被监控客户端，请描述如何在客户端机器上安装并配置 Zabbix Agent。
3. 在 Web 安装过程中出现 “Cannot connect to database” 错误时，按顺序检查哪些配置项来解决问题？

---

