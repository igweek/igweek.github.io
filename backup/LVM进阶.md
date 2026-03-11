## 实验背景

你是一家电商公司的系统管理员。由于双 11 活动，原有的数据库存储空间告急，且由于旧硬盘性能不足，需要将数据在线迁移到新资源池中，并实现自动挂载。

---

### 【任务一】资源整合与多级扩容（基础进阶）

**要求：**

1. 将 `/dev/sdb` 和 `/dev/sdc` 两块物理硬盘合并，创建一个名为 `vg_production` 的卷组。
2. 在该卷组中创建一个名为 `lv_database` 的逻辑卷，初始大小为 **1.5GB**。
3. 将其格式化为 **XFS** 并在 `/mnt/db_data` 目录挂载。
4. **进阶挑战：** 假设 1.5GB 依然不够，请利用卷组剩余空间，将其**在线扩容**至 **3GB**（注意：此时超出了单块 2GB 硬盘的极限，验证 LVM 的跨磁盘能力）。

**原理步骤：**

* **PV 初始化：** `pvcreate` 标记两块盘。
* **VG 构建：** `vgcreate` 将两块物理卷合二为一。
* **LV 切分：** `lvcreate` 划分空间。
* **格式化与挂载：** `mkfs.xfs` 与 `mount`。
* **跨盘拉伸：** `lvextend` 配合 `-r` 参数。

---

### 【任务二】热数据迁移：物理卷替换（中级挑战）

**场景：** 系统报警显示物理硬盘 `/dev/sdb` 出现大量坏道，必须立即将其下线，但 `/mnt/db_data` 上的业务**不能停机**。
**要求：**

1. 将第三块新硬盘 `/dev/sdd` 加入到 `vg_production` 卷组中。
2. 使用 LVM 迁移指令，将存储在旧盘 `/dev/sdb` 上的数据**在线转移**到新盘 `/dev/sdd` 上。
3. 迁移完成后，安全地将旧盘 `/dev/sdb` 从卷组中移除。

**原理步骤：**

* **新盘入池：** `pvcreate` 然后 `vgextend`。
* **数据平移：** 使用 **`pvmove`** 命令。这是 LVM 的高级功能，它会在后台逐个 PE（物理块）搬迁数据，上层文件系统毫无感知。
* **退役旧盘：** `vgreduce` 将旧盘踢出卷组，最后 `pvremove` 清除标签。

---

### 【任务三】空间回收与极限调度（高级挑战）

**场景：** 此时你发现另一个业务卷 `lv_backup`（假设你创建了它）占用了太多 VG 空间，而 `vg_production` 已经没有多余的物理磁盘了。
**要求：**

1. 在不添加新硬盘的情况下，如何通过“拆东墙补西墙”的方式为 `lv_database` 腾出空间？
2. **警示：** 由于你使用的是 **XFS** 格式，请说明为什么这个任务在不格式化的前提下**无法完成**？如果换成 **EXT4** 格式，该如何操作？

**原理步骤：**

* **XFS 的局限性：** 老师在课堂上强调过，XFS 只支持长胖（Grow），不支持变瘦（Shrink）。
* **EXT4 的操作逻辑：** 若是 EXT4，需先 `umount` 挂载点，执行 `e2fsck` 检查，然后 `resize2fs` 缩小文件系统，最后才能 `lvreduce` 缩小逻辑卷。

---

### 【任务四】持久化与自动化

**要求：** 确保服务器重启后，你的 `lv_database` 依然能自动挂载到 `/mnt/db_data`。
**操作建议：**

* 修改 `/etc/fstab` 文件。
* **关键点：** 建议使用逻辑卷的设备路径（如 `/dev/mapper/vg_production-lv_database`）或 UUID 进行配置。

---

## 解答

## 【任务一】资源整合与多级扩容

本任务展示了 LVM 如何打破物理硬盘的边界，将多块小硬盘合并成一个大的虚拟存储池。

### 1. 初始化物理卷 (PV)

将原始硬盘标记为 LVM 可识别的状态。

```bash
pvcreate /dev/sdb /dev/sdc

```

* **解释**：`pvcreate` 会在磁盘头部写入 LVM 标签。此时这两块盘就变成了 LVM 的“建筑材料”。

### 2. 构建卷组 (VG)

将两块盘合二为一。

```bash
vgcreate vg_production /dev/sdb /dev/sdc

```

* **解释**：`vg_production` 就像一个蓄水池，现在它的总容量是 `/dev/sdb` + `/dev/sdc` 的总和。

### 3. 创建逻辑卷 (LV) 并格式化挂载

```bash
# 创建 1.5GB 的逻辑卷
lvcreate -L 1.5G -n lv_database vg_production

# 格式化为 XFS
mkfs.xfs /dev/vg_production/lv_database

# 创建挂载点并挂载
mkdir -p /mnt/db_data
mount /dev/vg_production/lv_database /mnt/db_data

```

### 4. 进阶：在线扩容至 3GB

由于单块盘通常只有 2GB（假设），1.5GB 扩容到 3GB 必然会跨越到第二块物理硬盘 `/dev/sdc` 上。

```bash
lvextend -L 3G /dev/vg_production/lv_database -r

```

* **解释**：`-r` 参数非常关键，它代表 `resizefs`。它会在 LV 拉伸后，自动触发文件系统（XFS）的在线扩容，无需手动执行 `xfs_growfs`。此时数据库业务无需停机。

---

## 【任务二】热数据迁移：物理卷替换

这是 LVM 最强大的功能之一：在业务运行过程中更换底层“烂掉”的硬件。

### 1. 新盘入池

```bash
pvcreate /dev/sdd
vgextend vg_production /dev/sdd

```

* **解释**：先准备好“备胎” `/dev/sdd`，并将其加入现有的卷组。

### 2. 在线迁移数据 (pvmove)

```bash
pvmove /dev/sdb /dev/sdd

```

* **解释**：这是核心命令。LVM 会将 `/dev/sdb` 上所有已分配的 PE（数据块）逐个复制到 `/dev/sdd`。**期间文件系统依然挂载，业务读写正常进行。** 复制完成后，`/dev/sdb` 会变为空盘。

### 3. 退役旧盘

```bash
vgreduce vg_production /dev/sdb
pvremove /dev/sdb

```

* **解释**：`vgreduce` 将旧盘踢出资源池，`pvremove` 抹除 LVM 标签。现在你可以物理拔掉这块坏盘了。

---

## 【任务三】空间回收与极限调度

### 1. XFS 的局限性

**结论：在 XFS 格式下，无法实现在线缩小。**

* **解释**：XFS 设计之初就为了高性能和大规模数据，它的设计哲学是“只长不缩”。如果你强行缩小 LV，文件系统会因为找不到末尾的数据元数据而直接崩溃。

### 2. 若使用 EXT4 的操作逻辑（“拆东墙补西墙”）

如果 `lv_backup` 是 EXT4 格式，流程如下（**严禁在线操作，必须卸载**）：

1. **卸载**：`umount /mnt/backup`
2. **自检**：`e2fsck -f /dev/vg_production/lv_backup`（缩小前必须保证文件系统健康）
3. **缩小文件系统**：`resize2fs /dev/vg_production/lv_backup 500M`（先让“衣服”变小）
4. **缩小逻辑卷**：`lvreduce -L 500M /dev/vg_production/lv_backup`（再让“身体”变小）
5. **重新挂载**：`mount ...`
6. **结果**：释放出的空闲空间会自动回到 VG 池中，随后你可以按任务一的方法给 `lv_database` 扩容。

---

## 【任务四】持久化与自动化

为了防止重启后挂载丢失，需要修改 `/etc/fstab`。

### 1. 获取 UUID（推荐做法）

```bash
blkid /dev/vg_production/lv_database

```

### 2. 修改配置文件

在 `/etc/fstab` 末尾添加一行：

```text
/dev/mapper/vg_production-lv_database  /mnt/db_data  xfs  defaults  0 0

```

* **解释**：使用 `/dev/mapper/...` 路径比直接用 `/dev/sdb1` 稳定得多，因为即使物理盘顺序变了（比如从 sdb 变成 sdc），LVM 的逻辑路径永远不变。

### 3. 验证

```bash
mount -a

```

* **解释**：执行此命令若无报错，说明配置正确，下次开机将自动挂载。