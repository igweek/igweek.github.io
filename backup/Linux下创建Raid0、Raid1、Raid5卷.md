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


## 1. 实验一：创建 RAID 0 (条带化)

**特点：** 追求速度，至少 2 块盘。无冗余，损坏一块则全盘数据丢失。

### 创建步骤：

1. **创建阵列：**
`sudo mdadm --create /dev/md0 --level=0 --raid-devices=2 /dev/sdb /dev/sdc`
2. **格式化并挂载：**
`mkfs.ext4 /dev/md0 && mkdir -p /mnt/raid0 && mount /dev/md0 /mnt/raid0`

###  拆除与清理（为下个实验腾空间）：

1. **卸载：** `sudo umount /mnt/raid0`
2. **停止阵列：** `sudo mdadm --stop /dev/md0`
3. **擦除元数据：** `sudo mdadm --zero-superblock /dev/sdb /dev/sdc`

---

## 2. 实验二：创建 RAID 1 (镜像)

**特点：** 追求安全，至少 2 块盘。数据互为备份，容量减半。

### 创建步骤：

1. **创建阵列：**
`sudo mdadm --create /dev/md1 --level=1 --raid-devices=2 /dev/sdb /dev/sdc`
2. **格式化并挂载：**
`mkfs.xfs /dev/md1 && mkdir -p /mnt/raid1 && mount /dev/md1 /mnt/raid1`

###  拆除与清理：

1. **卸载：** `sudo umount /mnt/raid1`
2. **停止阵列：** `sudo mdadm --stop /dev/md1`
3. **擦除元数据：** `sudo mdadm --zero-superblock /dev/sdb /dev/sdc`

---

## 3. 实验三：创建 RAID 5 (分布式奇偶校验)

**特点：** 平衡性能、安全与容量，至少 3 块盘。允许损坏一块盘。

### 创建步骤：

1. **创建阵列：**
`sudo mdadm --create /dev/md5 --level=5 --raid-devices=3 /dev/sdb /dev/sdc /dev/sdd`
2. **查看同步进度：**
`cat /proc/mdstat`（RAID 5 初始化较慢，建议观察进度）
3. **格式化并挂载：**
`mkfs.ext4 /dev/md5 && mkdir -p /mnt/raid5 && mount /dev/md5 /mnt/raid5`

###  拆除与清理：

1. **卸载：** `sudo umount /mnt/raid5`
2. **停止阵列：** `sudo mdadm --stop /dev/md5`
3. **擦除元数据：** `sudo mdadm --zero-superblock /dev/sdb /dev/sdc /dev/sdd`

---

## 4. 终极步骤：保存配置
如果你决定长期保留某个 RAID 阵列，而不是为了做实验，请执行以下操作以防重启后失效：

1. **扫描并保存：**
`sudo mdadm --detail --scan | sudo tee -a /etc/mdadm.conf`
2. **更新 Initramfs (部分系统需要)：**
`sudo dracut -H -f` (CentOS/RHEL/Fedora) 或 `sudo update-initramfs -u` (Ubuntu)

---

### 实验避坑指南：

* **磁盘忙碌：** 如果 `mdadm --stop` 报错，说明你还在 `/mnt/raid` 目录下，或者有进程正在读写。请先 `cd ~` 退出挂载点。
* **阵列名称：** 系统重启后，`/dev/md0` 可能会自动变成 `/dev/md127`，这是正常现象。如果想固定名称，必须写入 `mdadm.conf`。
* **确认清理干净：** 每次开始新实验前，运行 `lsblk` 确认磁盘后面没有 `raid` 字样。

