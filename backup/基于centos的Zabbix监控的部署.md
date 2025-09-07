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


![截屏2025-09-07 20.19.36.png](https://pic.myla.eu.org/file/1757248275951_截屏2025-09-07 20.19.36.png)


---



## 2. 学习意义  
- **Zabbix** 能帮助管理员实时监控系统性能、服务器状态、网络设备等，并触发告警，便于问题的快速定位。  
- 通过部署 Zabbix，可以及时发现服务器硬件、应用服务、网络状态等问题。  
- 监控系统的部署技能是运维人员的基本能力之一。

---

## 3. 实例（以 CentOS 8 + MySQL + Zabbix 为例）

### 步骤 1：更新系统  
```bash
dnf update -y
```

### 步骤 2：安装 MySQL（使用 MySQL 作为数据库）  
```bash
dnf install -y @mysql
systemctl enable --now mysqld
```

### 步骤 3：初始化 MySQL 数据库并配置  
```bash
mysql_secure_installation
```
创建 Zabbix 数据库和用户：  
```sql
CREATE DATABASE zabbix CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
CREATE USER 'zabbix'@'localhost' IDENTIFIED BY 'zabbixpass';
GRANT ALL PRIVILEGES ON zabbix.* TO 'zabbix'@'localhost';
FLUSH PRIVILEGES;
```

### 步骤 4：安装 Zabbix Server、Web 前端和 Agent  
```bash
dnf install -y zabbix-server-mysql zabbix-web-mysql zabbix-apache-conf zabbix-sql-scripts zabbix-agent
```

### 步骤 5：导入 Zabbix 数据库结构  
```bash
zcat /usr/share/doc/zabbix-sql-scripts/mysql/server.sql.gz | mysql -uzabbix -pzabbixpass zabbix
```

### 步骤 6：配置 Zabbix Server  
编辑 `/etc/zabbix/zabbix_server.conf`，并更新以下字段：  
```ini
DBHost=localhost
DBName=zabbix
DBUser=zabbix
DBPassword=zabbixpass
```

### 步骤 7：配置 PHP 时区  
```bash
vi /etc/php-fpm.d/zabbix.conf
```
找到并修改：  
```ini
php_value[date.timezone] = Asia/Shanghai
```

### 步骤 8：启动并设置自启  
```bash
systemctl enable --now zabbix-server zabbix-agent httpd php-fpm
```

### 步骤 9：防火墙配置  
```bash
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-port=10050/tcp
firewall-cmd --permanent --add-port=10051/tcp
firewall-cmd --reload
```

### 步骤 10：Web 界面访问  
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

