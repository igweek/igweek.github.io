### 实验名称：基于 GlusterFS 的“永不丢失”企业共享云盘存储系统
---

### 1. 实验情景（带入角色）
你是某公司的运维工程师。公司开发部反映：目前教案和代码都存在一台普通的 Ubuntu 服务器上。
* **痛点**：如果这台服务器的硬盘坏了，或者由于断电无法开机，全公司的业务都会停摆。
* **任务**：你需要用两台 Ubuntu 22.04 虚拟机搭建一个 **GlusterFS 复制卷（Replicated Volume）**。
* **目标**：实现数据在两台机器上实时同步。即使你手动“拔掉”其中一台服务器的电源，员工依然能正常访问文件。

---

### 2. 实验环境准备 (VMware 操作)

你需要准备 **3 台** Ubuntu 22.04 虚拟机（内存 2G 即可）。

1.  **节点 1 (Node1)**: IP `192.168.10.101`
2.  **节点 2 (Node2)**: IP `192.168.10.102`
3.  **客户端 (Client)**: IP `192.168.10.103`

**关键步骤（模拟增加物理硬盘）：**
在 VMware 中，分别编辑 Node1 和 Node2 的虚拟机设置：
* 点击“添加” -> “硬盘” -> “SCSI” -> “创建新虚拟磁盘” -> 大小设置 **10GB**。
* **解释**：在分布式存储中，我们通常把系统盘和数据盘分开。这 10GB 就是我们要贡献给集群的“砖块（Brick）”。

---

### 3. 具体操作步骤

#### 第一阶段：磁盘初始化（Node1 和 Node2 都要做）
我们需要把那块 10GB 的新硬盘格式化并挂载。

```bash
# 1. 找到新硬盘（通常是 /dev/sdb）
lsblk

# 2. 格式化为 XFS 文件系统（GlusterFS 推荐）
sudo mkfs.xfs /dev/sdb

# 3. 创建挂载点并挂载
sudo mkdir -p /data/glusterfs
sudo mount /dev/sdb /data/glusterfs

# 4. 配置开机自动挂载（防止重启后失效）
echo '/dev/sdb /data/glusterfs xfs defaults 0 0' | sudo tee -a /etc/fstab
```

#### 第二阶段：安装并启动 GlusterFS（Node1 和 Node2）
```bash
sudo apt update
sudo apt install glusterfs-server -y

# 启动服务并设为开机自启
sudo systemctl start glusterd
sudo systemctl enable glusterd
```

#### 第三阶段：组建集群（仅在 Node1 操作）
我们要让 Node1 和 Node2 互相“认识”。

```bash
# 1. 把 Node2 加入集群
sudo gluster peer probe 192.168.10.102

# 2. 查看集群状态（应显示 Peer Connected）
sudo gluster peer status
```


#### 第四阶段：创建“复制卷”（仅在 Node1 操作）
这是实验的核心：创建一个跨机器的镜像卷。

```bash
# 在两台机器上先创建具体的存储文件夹
# Node1 & Node2 执行:
sudo mkdir -p /data/glusterfs/mybrick

# 在 Node1 执行创建命令:
# replica 2 表示数据保存 2 份（镜像）
sudo gluster volume create share-drive replica 2 \
192.168.10.101:/data/glusterfs/mybrick \
192.168.10.102:/data/glusterfs/mybrick force

# 启动这个逻辑卷
sudo gluster volume start share-drive
```


#### 第五阶段：客户端挂载使用（Client 节点）
模拟员工的电脑连接网盘。

```bash
# 1. 安装客户端工具
sudo apt install glusterfs-client -y

# 2. 创建挂载点
sudo mkdir /mnt/cloud-drive

# 3. 挂载（连接集群中任意一台即可）
sudo mount -t glusterfs 192.168.10.101:/share-drive /mnt/cloud-drive
```

---

### 4. 实验验证与现象解释（理解技术）

#### 验证 1：数据实时同步
* **操作**：在 Client 的 `/mnt/cloud-drive` 下创建一个文件 `test.txt`。
* **观察**：分别去 Node1 和 Node2 的 `/data/glusterfs/mybrick` 目录下看。
* **解释**：GlusterFS 自动将写入请求分发到了两个节点，实现了**数据冗余**。

#### 验证 2：模拟服务器宕机（高可用测试）
* **操作**：**在 VMware 中直接右键 Node1 -> 电源 -> 关机**。
* **观察**：在 Client 上执行 `ls /mnt/cloud-drive`，并尝试新建文件夹。
* **解释**：你会发现 Client 依然能读写文件！因为 GlusterFS 客户端发现 Node1 断开后，会自动透明地切换到 Node2。这就是**集群存储的高可用性**。

#### 验证 3：数据自愈（Healing）
* **操作**：把 Node1 开机。
* **解释**：Node1 启动后，GlusterFS 后台进程会对比两台机器的文件差异，自动把宕机期间缺失的数据补回来。
