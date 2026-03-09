
# 常用 LVM 命令总结

| 类型 | 命令 |
|---|---|
| 查看磁盘 | lsblk |
| 创建PV | pvcreate |
| 查看PV | pvs |
| 创建VG | vgcreate |
| 查看VG | vgs |
| 创建LV | lvcreate |
| 查看LV | lvs |
| 扩展LV | lvextend |
| 缩小LV | lvreduce |
| 扩展文件系统 | resize2fs |
| 删除LV | lvremove |

---



实验一：创建 LVM 并挂载使用

实验目标  
系统新增两块磁盘 `/dev/sdb`、`/dev/sdc`，将它们创建为 LVM 存储，并创建逻辑卷挂载到 `/data` 目录。

---

步骤 1：查看当前磁盘

```bash
lsblk
```

命令解释  

- `lsblk`：列出系统中所有块设备（block device），包括硬盘、分区、LVM 等。
- 用于确认新增加的磁盘，例如 `/dev/sdb`、`/dev/sdc` 是否存在。

---

步骤 2：创建物理卷 PV

```bash
pvcreate /dev/sdb /dev/sdc
```

命令解释  

- `pvcreate`：将普通磁盘初始化为 **LVM 物理卷（Physical Volume）**。
- `/dev/sdb /dev/sdc`：指定要初始化的磁盘设备。
- 初始化后，这些磁盘可以加入 LVM 卷组。

查看 PV

```bash
pvs
```

命令解释  

- `pvs`：显示系统中的所有物理卷信息。
- 可以看到 PV 的大小、所属卷组等信息。

---

步骤 3：创建卷组 VG

```bash
vgcreate vg_data /dev/sdb /dev/sdc
```

命令解释  

- `vgcreate`：创建 **卷组（Volume Group）**。
- `vg_data`：卷组名称。
- `/dev/sdb /dev/sdc`：加入卷组的物理卷。

查看卷组

```bash
vgs
```

命令解释  

- `vgs`：查看卷组信息。
- 会显示卷组大小、剩余空间等。

---

步骤 4：创建逻辑卷 LV

```bash
lvcreate -L 5G -n lv_data vg_data
```

命令解释  

- `lvcreate`：创建逻辑卷（Logical Volume）。
- `-L 5G`：指定逻辑卷大小为 5GB。
- `-n lv_data`：指定逻辑卷名称为 `lv_data`。
- `vg_data`：逻辑卷所在的卷组。

查看逻辑卷

```bash
lvs
```

命令解释  

- `lvs`：查看系统中所有逻辑卷信息。

---

步骤 5：格式化逻辑卷

```bash
mkfs.ext4 /dev/vg_data/lv_data
```

命令解释  

- `mkfs.ext4`：创建 ext4 文件系统。
- `/dev/vg_data/lv_data`：LVM 逻辑卷设备路径。

这一步相当于给磁盘创建文件系统，才能存储数据。

---

步骤 6：创建挂载目录

```bash
mkdir /data
```

命令解释  

- `mkdir`：创建目录。
- `/data`：用于挂载逻辑卷。

---

步骤 7：挂载逻辑卷

```bash
mount /dev/vg_data/lv_data /data
```

命令解释  

- `mount`：将设备挂载到目录。
- `/dev/vg_data/lv_data`：逻辑卷设备。
- `/data`：挂载点目录。

---

步骤 8：查看挂载情况

```bash
df -h
```

命令解释  

- `df`：查看文件系统磁盘使用情况。
- `-h`：以人类可读格式显示（MB、GB）。

---

步骤 9：设置开机自动挂载

编辑配置文件

```bash
vi /etc/fstab
```

命令解释  

- `/etc/fstab`：系统启动时自动挂载文件系统的配置文件。

添加一行

```
/dev/vg_data/lv_data   /data   ext4   defaults   0 0
```

参数解释  

- `/dev/vg_data/lv_data`：设备路径
- `/data`：挂载点
- `ext4`：文件系统类型
- `defaults`：默认挂载参数
- `0 0`：dump 和 fsck 设置

测试配置

```bash
mount -a
```

命令解释  

- `mount -a`：根据 `/etc/fstab` 挂载所有未挂载的设备，用于测试配置是否正确。

---

实验二：扩展 LVM 容量

实验目标  
将逻辑卷 `lv_data` 从 **5G 扩展到 8G**。

---

步骤 1：扩展逻辑卷

```bash
lvextend -L +3G /dev/vg_data/lv_data
```

命令解释  

- `lvextend`：扩展逻辑卷容量。
- `-L +3G`：在原有基础上增加 3GB。
- `/dev/vg_data/lv_data`：要扩展的逻辑卷。

---

步骤 2：扩展文件系统

```bash
resize2fs /dev/vg_data/lv_data
```

命令解释  

- `resize2fs`：调整 ext2/ext3/ext4 文件系统大小。
- 逻辑卷扩大后，必须扩展文件系统，否则系统无法使用新增空间。

---

步骤 3：查看结果

```bash
df -h
```

用于确认容量已经变为 8G。

---

实验三：缩小 LVM 容量

实验目标  
将逻辑卷从 **8G 缩小到 6G**。

注意  
缩小 LVM 必须先缩小文件系统，否则会导致数据损坏。

---

步骤 1：卸载分区

```bash
umount /data
```

命令解释  

- `umount`：卸载挂载的文件系统。
- 缩小文件系统前必须卸载。

---

步骤 2：检查文件系统

```bash
e2fsck -f /dev/vg_data/lv_data
```

命令解释  

- `e2fsck`：检查 ext 文件系统。
- `-f`：强制检查。
- 用于确保文件系统没有错误。

---

步骤 3：缩小文件系统

```bash
resize2fs /dev/vg_data/lv_data 6G
```

命令解释  

- 将文件系统缩小到 6GB。

---

步骤 4：缩小逻辑卷

```bash
lvreduce -L 6G /dev/vg_data/lv_data
```

命令解释  

- `lvreduce`：缩小逻辑卷。
- `-L 6G`：目标大小为 6GB。

---

步骤 5：重新挂载

```bash
mount /dev/vg_data/lv_data /data
```

---

步骤 6：验证结果

```bash
df -h
```

查看容量是否为 6GB。

---

实验四：删除 LVM

实验目标  
删除之前创建的 LVM 结构。

删除顺序必须为  

逻辑卷 → 卷组 → 物理卷

---

步骤 1：卸载分区

```bash
umount /data
```

---

步骤 2：删除逻辑卷

```bash
lvremove /dev/vg_data/lv_data
```

命令解释  

- `lvremove`：删除逻辑卷。
- 删除后逻辑卷中的数据会全部丢失。

---

步骤 3：删除卷组

```bash
vgremove vg_data
```

命令解释  

- `vgremove`：删除卷组。

---

步骤 4：删除物理卷

```bash
pvremove /dev/sdb /dev/sdc
```

命令解释  

- `pvremove`：清除磁盘上的 LVM 元数据，使其恢复为普通磁盘。

---

步骤 5：验证

```bash
pvs
vgs
lvs
```

命令解释  

- `pvs`：查看物理卷
- `vgs`：查看卷组
- `lvs`：查看逻辑卷

如果没有任何输出，说明删除成功。

---

