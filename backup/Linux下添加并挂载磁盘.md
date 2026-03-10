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
