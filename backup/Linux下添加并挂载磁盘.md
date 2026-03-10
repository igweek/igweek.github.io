## NVME磁盘
### 1. 识别新磁盘

首先，我们需要确认系统已经识别到了新的 NVMe 硬件。

```bash
lsblk
```

或者使用更详细的命令：

```bash
fdisk -l

```

* **提示**：查找名为 `/dev/nvme0n1` 或类似名称的设备，且没有分区信息（没有 `nvme0n1p1` 这种后缀）。

---

### 2. 创建分区

我们将使用 `fdisk` 或 `gdisk` 进行分区。如果磁盘大于 2TB，建议使用 `gdisk`。这里以常用的 `fdisk` 为例：

```bash
# 替换为你的实际磁盘名称
sudo fdisk /dev/nvme0n1

```

在交互界面中依次输入：

1. **n**：创建新分区。
2. **p**：选择主分区（Primary）。
3. **1**：分区号为 1。
4. **回车**：选择起始扇区（默认即可）。
5. **回车**：选择结束扇区（使用全部空间）。
6. **w**：保存更改并退出。

---

### 3. 创建文件系统（格式化）

CentOS 8 默认推荐使用 **XFS** 文件系统，当然你也可以选择 **EXT4**。

* **格式化为 XFS（推荐）：**
```bash
sudo mkfs.xfs /dev/nvme0n1p1

```


* **格式化为 EXT4：**
```bash
sudo mkfs.ext4 /dev/nvme0n1p1

```



---

### 4. 挂载分区

我们需要创建一个目录作为挂载点，并将磁盘挂载上去。

```bash
# 创建挂载点（例如叫 data）
sudo mkdir -p /mnt/data

# 手动挂载测试
sudo mount /dev/nvme0n1p1 /mnt/data

# 检查是否成功
df -hT | grep nvme

```

---

### 5. 配置开机自动挂载

为了防止重启后挂载失效，必须将其写入 `/etc/fstab`。**推荐使用 UUID 挂载**，因为设备名称（如 `nvme0n1`）在某些情况下可能会变。

1. **获取分区的 UUID：**
```bash
blkid /dev/nvme0n1p1

```


复制输出中的 `UUID="xxxx-xxxx-xxxx"` 部分。
2. **编辑 fstab 文件：**
```bash
sudo vi /etc/fstab

```


3. **在文件末尾添加一行：**
```text
UUID=你的UUID  /mnt/data  xfs  defaults  0 0

```


4. **验证配置是否正确：**
```bash
sudo umount /mnt/data
sudo mount -a

```


*如果没有报错，说明配置成功。*

---


## HDD及SSD磁盘

### 1. 识别新磁盘

使用 `lsblk` 命令查看系统识别到的磁盘列表。

```bash
lsblk

```

* **识别点**：你会看到类似 `sdb` 或 `sdc` 的设备，且 `TYPE` 为 `disk`。通常 `sda` 是你的系统盘，请务必确认操作对象，避免误删数据。

---

### 2. 分区 (fdisk 或 gdisk)

如果磁盘容量 **小于 2TB**，使用 `fdisk`；如果 **大于 2TB**，必须使用 `gdisk`（支持 GPT 分区表）。

**以 fdisk 为例：**

```bash
sudo fdisk /dev/sdb  # 假设新磁盘是 sdb

```

在交互界面依次输入：

* `n` (new)：新建分区。
* `p` (primary)：主分区。
* `1`：分区编号。
* `回车`：起始扇区默认。
* `回车`：结束扇区默认（占用全部空间）。
* `w` (write)：写入分区表并退出。

---

### 3. 创建文件系统 (格式化)

CentOS 8 推荐使用 **XFS**，它在大文件处理和性能上表现优异。

```bash
# 格式化为 XFS
sudo mkfs.xfs /dev/sdb1

# 或者格式化为 EXT4
# sudo mkfs.ext4 /dev/sdb1

```

---

### 4. 挂载磁盘

```bash
# 创建挂载点
sudo mkdir -p /data

# 临时挂载
sudo mount /dev/sdb1 /data

```

---

### 5. 设置永久挂载 (防止重启失效)

普通磁盘同样建议使用 **UUID** 挂载，因为如果主板调换了 SATA 线接口，`sdb` 可能会变成 `sdc`，但 UUID 永远不变。

1. **查询 UUID：**
```bash
blkid /dev/sdb1

```


2. **修改 /etc/fstab：**
```bash
sudo vi /etc/fstab

```


在文件末尾添加一行：
```text
UUID=你的UUID值  /data  xfs  defaults  0 0

```


3. **测试挂载：**
```bash
sudo mount -a

```


（无报错则表示下次重启会自动挂载）。

---

### 普通磁盘 vs NVMe 磁盘的主要区别

| 特性 | 普通磁盘 (SATA/SAS) | NVMe 磁盘 |
| --- | --- | --- |
| **设备名** | `/dev/sdX` (如 `sdb`) | `/dev/nvmeXnY` (如 `nvme0n1`) |
| **分区名** | `/dev/sdb1` | `/dev/nvme0n1p1` (多了一个 **p**) |
| **接口物理速度** | 最高约 600MB/s (SATA3) | 3500MB/s - 7000MB/s+ (PCIe) |
| **热插拔** | 常用在服务器热插拔支架 | 较少在运行中直接拔插 |

---

