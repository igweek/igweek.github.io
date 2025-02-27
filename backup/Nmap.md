[![](https://s2.loli.net/2025/02/25/fUtKCSPVeBqRkx5.jpg)](https://s2.loli.net/2025/02/25/fUtKCSPVeBqRkx5.jpg)

#### 一、Nmap的定义
Nmap（Network Mapper）是一款开源的网络扫描和安全审计工具，广泛用于网络管理和安全评估。它能够发现网络上的设备、开放的端口、运行的服务及其版本信息，帮助用户识别潜在的安全风险。

#### 二、Nmap的作用
1. **网络发现**：识别网络中活跃的设备和主机，了解网络拓扑结构。
2. **端口扫描**：检测目标主机上开放的端口，了解哪些服务在运行。
3. **服务版本探测**：识别运行在开放端口上的服务及其版本，帮助评估安全性。
4. **操作系统探测**：推测目标主机的操作系统类型，帮助进行针对性的安全评估。
5. **安全审计**：评估网络安全性，识别潜在的安全漏洞和风险。
6. **网络性能监测**：监测网络性能，识别网络瓶颈和故障。

#### 三、Nmap的安装

1. **在Linux上安装**
   - **使用包管理器安装**
     - **Ubuntu/Debian**:
       ```bash
       sudo apt-get update
       sudo apt-get install nmap
       ```
     - **CentOS/RHEL**:
       ```bash
       sudo yum install nmap
       ```
   - **从源代码安装**
     - 下载源代码：
       ```bash
       wget https://nmap.org/dist/nmap-<version>.tar.bz2
       ```
     - 解压并编译：
       ```bash
       tar -xjf nmap-<version>.tar.bz2
       cd nmap-<version>
       ./configure
       make
       sudo make install
       ```

2. **在Windows上安装**
   - 访问[Nmap官网](https://nmap.org/download.html)下载Windows安装包。
   - 双击安装包，按照安装向导完成安装。

3. **在macOS上安装**
   - 使用Homebrew：
     ```bash
     brew install nmap
     ```

#### 四、Nmap的基本扫描

![image.png](https://pic.myla.eu.org/file/1740468767112_image.png)

1. **基本命令格式**
   - Nmap的基本命令格式为：
     ```bash
     nmap [选项] [目标]
     ```

2. **常用扫描命令**
   - **扫描单个IP地址**：
   
```bash
nmap 192.168.1.1
```

- 该命令将扫描指定IP地址的开放端口。

   - **扫描整个子网**：
   
```bash
nmap 192.168.1.0/24
```

- 该命令将扫描192.168.1.0到192.168.1.255范围内的所有IP地址。

   - **扫描多个IP地址**：
   
```bash
nmap 192.168.1.1,192.168.1.2
```
- 该命令将同时扫描多个指定的IP地址。

3. **扫描特定端口**
   - **扫描特定端口（如80和443）**：
     ```bash
     nmap -p 80,443 192.168.1.1
     ```
     - 该命令将仅扫描指定IP地址的80和443端口。

4. **服务版本探测**
   - **识别服务版本**：
     ```bash
     nmap -sV 192.168.1.1
     ```
     - 该命令将探测目标IP地址上运行的服务及其版本信息。

5. **操作系统探测**
   - **识别目标操作系统**：
     ```bash
     nmap -O 192.168.1.1
     ```
     - 该命令将尝试识别目标IP地址的操作系统类型。

6. **输出结果到文件**
   - **将扫描结果保存为文本文件**：
     ```bash
     nmap -oN output.txt 192.168.1.1
     ```
     - 该命令将扫描结果保存到名为output.txt的文件中。


| 参数          | 描述                                      | 示例命令                          |
|---------------|-------------------------------------------|-----------------------------------|
| `-sS`        | TCP SYN 扫描（半开放扫描）                  | `nmap -sS 192.168.1.1`            |
| `-sT`        | TCP 连接扫描（全开放扫描）                  | `nmap -sT 192.168.1.1`            |
| `-sU`        | UDP 扫描                                   | `nmap -sU 192.168.1.1`            |
| `-sP`        | Ping 扫描（主机发现）                      | `nmap -sP 192.168.1.0/24`         |
| `-sA`        | TCP ACK 扫描                               | `nmap -sA 192.168.1.1`            |
| `-sW`        | TCP Window 扫描                            | `nmap -sW 192.168.1.1`            |
| `-sM`        | TCP Maimon 扫描                            | `nmap -sM 192.168.1.1`            |
| `-O`         | 操作系统检测                               | `nmap -O 192.168.1.1`             |
| `-sV`        | 服务版本检测                              | `nmap -sV 192.168.1.1`            |
| `-p`         | 指定端口（如 `-p 22` 或 `-p 1-1000`）     | `nmap -p 22,80 192.168.1.1`       |
| `-Pn`        | 不进行主机发现，直接扫描指定的主机        | `nmap -Pn 192.168.1.1`            |
| `-T`         | 设置扫描速度（0-5，0为最慢，5为最快）     | `nmap -T4 192.168.1.1`            |
| `-v`         | 增加详细输出                              | `nmap -v 192.168.1.1`             |
| `-oN`        | 将输出保存为普通文本文件                  | `nmap -oN output.txt 192.168.1.1`|
| `-oG`        | 将输出保存为 grepable 格式                 | `nmap -oG output.gnmap 192.168.1.1`|
| `-oX`        | 将输出保存为 XML 格式                     | `nmap -oX output.xml 192.168.1.1`|
| `--script`   | 使用 Nmap 脚本引擎（NSE）执行脚本         | `nmap --script=http-enum 192.168.1.1` |
| `-iL`        | 从文件中读取目标主机列表                  | `nmap -iL targets.txt`            |
| `-R`         | 反向 DNS 查找                             | `nmap -R 192.168.1.1`             |
| `--traceroute` | 路由追踪                                 | `nmap --traceroute 192.168.1.1`   |


#### 五、利用Nmap进行扫描的步骤

1. **确定扫描目标**
   - 确定需要扫描的IP地址或子网。例如，选择192.168.1.0/24作为目标。

2. **选择扫描类型**
   - 根据需求选择合适的扫描选项：
     - 如果只需快速了解网络设备，可以使用基本扫描命令。
     - 如果需要详细信息，可以选择服务版本探测和操作系统探测。

3. **执行扫描**
    
    - 在终端中输入相应的Nmap命令。例如：
    
	```shell
nmap -sV -O 192.168.1.0/24
	```
        
        
2. **分析结果**
    
    - 查看Nmap输出，分析开放端口、运行服务及其版本信息。输出示例：
```shell
PORT STATE SERVICE VERSION 
22/tcp open ssh OpenSSH 7.6 (protocol 2.0) 
80/tcp open http Apache httpd 2.4.29
```
        
        
3. **采取措施**


