在 CentOS 8 中，创建 RAID 阵列最常用的工具是 `mdadm`（Multiple Devices Admin）。RAID 0、1 和 5 的创建逻辑非常相似，主要的区别在于参数 `-l`（级别）和 `-n`（磁盘数量）。

### 核心参数快速对照表

| RAID 级别 | 最少磁盘数 | 命令参数 | 特点 |
| --- | --- | --- | --- |
| **RAID 0** | 2 | `--level=0` | 读写极快，无冗余。 |
| **RAID 1** | 2 | `--level=1` | 数据镜像，极安全，容量减半。 |
| **RAID 5** | 3 | `--level=5` | 容错一块盘，利用率为 $n-1$。 |

### 前期准备

在开始之前，请确保你已经安装了 `mdadm`：

```bash
sudo dnf install mdadm -y

```

假设你有几块空闲磁盘：`/dev/sdb`, `/dev/sdc`, `/dev/sdd`, `/dev/sde`。

---

### 1. 创建 RAID 0 (条带化)

RAID 0 追求速度，至少需要 **2 块** 磁盘。它没有冗余，一块硬盘损坏则数据全部丢失。

* **创建命令：**
```bash
mdadm --create /dev/md0 --level=0 --raid-devices=2 /dev/sdb /dev/sdc

```



---

### 2. 创建 RAID 1 (镜像)

RAID 1 追求安全性，至少需要 **2 块** 磁盘。它将数据完全备份到另一块盘上。

* **创建命令：**
```bash
mdadm --create /dev/md1 --level=1 --raid-devices=2 /dev/sdb /dev/sdc

```



---

### 3. 创建 RAID 5 (分布式奇偶校验)

RAID 5 平衡了性能、安全和容量，至少需要 **3 块** 磁盘。允许损坏一块磁盘而不丢失数据。

* **创建命令：**
```bash
mdadm --create /dev/md5 --level=5 --raid-devices=3 /dev/sdb /dev/sdc /dev/sdd

```



---

### 4. 创建后的后续操作（通用）

无论你创建了哪种 RAID，都需要执行以下步骤才能使用：

1. **查看同步状态：**
创建完成后，系统会进行初始化同步。可以通过以下命令查看进度：
```bash
cat /proc/mdstat

```


2. **创建文件系统：**
```bash
mkfs.ext4 /dev/md0  # 或者使用 xfs

```


3. **挂载并使用：**
```bash
mkdir /mnt/raid
mount /dev/md0 /mnt/raid

```


4. **保存配置（重要）：**
如果不保存配置，重启后 RAID 阵列可能会失效或名称发生变化。
```bash
mdadm --detail --scan | sudo tee -a /etc/mdadm.conf

```


> **温馨提示：** 在操作前请务必确认磁盘上没有重要数据，因为 `mdadm --create` 会覆盖磁盘原有的分区表。
