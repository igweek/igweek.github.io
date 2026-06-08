## 一、什么是FRP

FRP 是一款轻量、高性能的**内网穿透工具**，全称 Fast Reverse Proxy。

简单来说：家里/公司内网的电脑、服务器没有公网IP，外网无法直接访问。借助一台有公网IP的云服务器做中转，就能让外网正常访问内网设备，这就是内网穿透。

FRP 分为两部分：

- **frps**：服务端，部署在有公网IP的阿里云ECS上
- **frpc**：客户端，部署在需要被访问的内网设备上

## 二、环境准备

1. 阿里云ECS服务器（本文以 Ubuntu 22.04 为例）
2. 内网一台测试设备（Windows / Linux 均可）
3. 提前在阿里云控制台**安全组**放行后续用到的端口

## 三、服务端 frps 安装配置（阿里云ECS）

### 1. 下载FRP安装包

FRP 支持多系统架构，先根据系统下载对应版本，这里以 Linux 64位为例：

```bash
# 下载安装包
wget https://github.com/fatedier/frp/releases/download/v0.59.0/frp_0.59.0_linux_amd64.tar.gz

# 解压
tar -zxvf frp_0.59.0_linux_amd64.tar.gz

# 进入解压目录
cd frp_0.59.0_linux_amd64
```

### 2. 编写服务端配置文件

编辑 `frps.ini` 配置文件：

```bash
vim frps.ini
```

写入以下基础配置：

```ini
[common]
# FRP 服务监听端口，客户端连接此端口
bind_port = 7000
# 连接认证密钥，客户端必须一致才能连接
token = 123456
# 日志级别
log_level = info
```

保存退出。

### 3. 临时启动服务端

```bash
./frps -c frps.ini
```

看到日志正常输出，代表服务端启动成功。

### 4. 设置开机自启（可选，推荐）

创建系统服务，实现后台运行、开机自启：

```bash
vim /etc/systemd/system/frps.service
```

写入内容：

```ini
[Unit]
Description=frp server
After=network.target

[Service]
Type=simple
ExecStart=/root/frp_0.59.0_linux_amd64/frps -c /root/frp_0.59.0_linux_amd64/frps.ini
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

执行命令生效：

```bash
# 重载服务
systemctl daemon-reload
# 开机自启
systemctl enable frps
# 启动服务
systemctl start frps
# 查看状态
systemctl status frps
```

### 5. 放行端口

1. ECS 防火墙放行 7000 端口

```bash
ufw allow 7000/tcp
```

2. **阿里云控制台安全组**，添加入站规则，放行 `7000` 以及后续穿透使用的端口。

## 四、客户端 frpc 安装配置（内网设备）

### 1. 下载对应版本

内网设备根据系统选择安装包，操作和服务端一致，解压后找到 `frpc` 程序。

### 2. 编写客户端配置文件

新建 `frpc.ini`：

```ini
[common]
# 填写阿里云ECS公网IP
server_addr = 你的ECS公网IP
# 和服务端 bind_port 保持一致
server_port = 7000
# 和服务端 token 保持一致
token = 123456

# 示例：TCP穿透 映射内网SSH服务
[ssh]
type = tcp
# 外网访问端口
remote_port = 6000
# 内网设备IP和端口
local_ip = 127.0.0.1
local_port = 22
```

### 3. 启动客户端

- Linux 内网设备：

```bash
./frpc -c frpc.ini
```

- Windows 内网设备：直接双击 `frpc.exe` 运行即可。

启动后客户端日志提示连接成功，就代表穿透搭建完成。

## 五、测试访问

在外网任意设备执行以下命令，即可连接内网主机的 SSH 服务：

```bash
ssh 用户名@ECS公网IP -p 6000
```

能够正常登录，说明 FRP 内网穿透部署成功。