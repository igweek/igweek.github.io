LVM 全称 **Logical Volume Manager（逻辑卷管理器）**，主要用于 Linux 系统的磁盘和分区管理。

它的作用是：在物理硬盘和文件系统之间，加了一层“抽象层”，让磁盘管理更灵活。

---

### 基本概念

1. **PV（Physical Volume，物理卷）**

   * 就是硬盘分区或者整块硬盘，经过 `pvcreate` 初始化后变成 PV。

2. **VG（Volume Group，卷组）**

   * 把多个 PV 组合成一个大的存储池。
   * 可以理解为“存储池子”，容量是所有 PV 加起来。

3. **LV（Logical Volume，逻辑卷）**

   * 从 VG 中划分出来的逻辑卷，相当于传统的分区。
   * 可以在其上创建文件系统（ext4/xfs 等），挂载使用。

4. **PE（Physical Extent，物理区域）**

   * VG 里的最小分配单元，通常是 4MB 或 16MB。

---

### LVM 的好处

* **动态调整容量**：LV 可以随时扩容/缩小，不像传统分区需要重新分区。
* **跨磁盘管理**：多个硬盘可以组成一个 VG，逻辑卷可以跨越多块物理磁盘。
* **快照功能**：可以对 LV 创建快照，方便备份和恢复。
* **简化管理**：更容易对大容量和多块硬盘进行统一管理。

---

### 举个例子

假设你有两块 500GB 的硬盘：

1. 把它们初始化成 PV。
2. 再把这两个 PV 合并成一个 VG，总共 1TB。
3. 在 VG 里创建一个 700GB 的 LV 给数据库，一个 300GB 的 LV 给文件存储。
   如果以后硬盘不够了，再加一块 1TB 硬盘到 VG 里，就能无缝扩容。

![image.png](https://pic.myla.eu.org/file/1756786531067_image.png)
这是一个 **LVM 结构示意图**：

* **PV (Physical Volume)**：底层两块硬盘（各 500GB）。
* **VG (Volume Group)**：把两个 PV 组成一个总容量 1TB 的存储池。
* **LV (Logical Volume)**：从 VG 中划分出两个逻辑卷，一个给数据库（700GB），一个做文件存储（300GB）。

---

# 🔬 LVM 实验：从零创建 LVM 并挂载使用

## 实验目标

* 学会创建 PV（物理卷）、VG（卷组）、LV（逻辑卷）
* 掌握 LV 的格式化、挂载和扩容方法
* 熟悉 LVM 动态存储管理

---

## 实验环境

* Linux 系统（建议 CentOS 7+/Rocky/Ubuntu 20.04+）
* 两块空硬盘（比如 `/dev/sdb` 和 `/dev/sdc`），每块 1GB+ 即可（虚拟机里添加也行）
* root 权限

---

## 实验步骤

### 1️⃣ 查看新硬盘

```bash
lsblk
```

你会看到类似：

```
sda   40G  (系统盘)
sdb    2G
sdc    2G
```

---

### 2️⃣ 创建 PV（物理卷）

```bash
pvcreate /dev/sdb /dev/sdc
```

验证：

```bash
pvs
```

输出：

```
PV         VG   Fmt  Attr PSize   PFree
/dev/sdb        lvm2 ---  2.00g  2.00g
/dev/sdc        lvm2 ---  2.00g  2.00g
```

---

### 3️⃣ 创建 VG（卷组）

```bash
vgcreate myvg /dev/sdb /dev/sdc
```

查看：

```bash
vgs
```

结果：

```
VG    #PV #LV #SN Attr   VSize  VFree
myvg   2   0   0 wz--n-  3.99g  3.99g
```

---

### 4️⃣ 创建 LV（逻辑卷）

比如创建一个 3G 的逻辑卷：

```bash
lvcreate -L 3G -n mylv myvg
```

查看：

```bash
lvs
```

输出：

```
LV   VG   Attr       LSize Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
mylv myvg -wi-a----- 3.00g
```

---

### 5️⃣ 格式化并挂载

```bash
mkfs.ext4 /dev/myvg/mylv
mkdir /mnt/mylvm
mount /dev/myvg/mylv /mnt/mylvm
df -h /mnt/mylvm
```

能看到一个 3GB 的新分区。

---

### 6️⃣ 动态扩容（体验 LVM 的强大）

比如再扩容 1GB：

```bash
lvextend -L +1G /dev/myvg/mylv
resize2fs /dev/myvg/mylv
```

再看：

```bash
df -h /mnt/mylvm
```

容量已经变大了！

---

### 7️⃣ 卸载与删除（清理实验环境）

```bash
umount /mnt/mylvm
lvremove /dev/myvg/mylv
vgremove myvg
pvremove /dev/sdb /dev/sdc
```

---

## ✅ 实验总结

* **PV → VG → LV** 就是 LVM 的基本结构。
* LVM 可以动态扩容，非常灵活。
* 如果再加快照（`lvcreate -s`），还能做数据备份。

---


