# 概念

**iSCSI Initiator**
发起端，是客户端角色。负责通过网络向存储设备发起连接请求，并访问远程磁盘。在 Windows 中，指系统自带的 iSCSI 客户端功能。

---

**IP SAN（Internet Protocol Storage Area Network）**
基于 IP 网络构建的存储区域网络。通过以太网传输存储数据，使远程磁盘可以像本地硬盘一样被使用。

---

**Windows iSCSI Initiator**
Windows 操作系统自带的工具（服务），用于：

* 发现 iSCSI 存储设备
* 建立连接
* 挂载远程磁盘

---

**iSCSI（Internet Small Computer System Interface）**
一种存储传输协议。作用是将磁盘数据封装在 TCP/IP 网络中传输，使远程存储可以被当作本地块设备使用。

---

**iSCSI Target**
目标端，是服务器角色。负责提供存储资源（磁盘或虚拟磁盘），等待客户端连接。在你的实验中，FreeNAS 充当 Target。

---

**关系总结**
Initiator（客户端）通过 iSCSI 协议连接 Target（服务器），在 IP 网络上实现远程磁盘访问，这个整体体系称为 IP SAN。


# 实验名称

基于 FreeNAS 的 iSCSI 存储连接实验（Windows Initiator）

---

# 实验目标

1. 在 FreeNAS 上完成 iSCSI 存储配置
2. 在 Windows 中配置 iSCSI Initiator
3. 成功连接 IP SAN（192.168.1.100）
4. 将远程磁盘挂载为本地磁盘并完成读写

---

# 实验环境

* FreeNAS 服务器：192.168.1.100
* Windows 客户端：192.168.1.10
* 网络：同一局域网

---

# 实验拓扑

```
Windows客户端（Initiator）
        │
        │
      局域网
        │
        │
FreeNAS服务器（iSCSI Target）
```

---

# 实验内容与步骤

---

## 第一部分：FreeNAS 端配置 iSCSI

（界面基于 FreeNAS-11.2-U4.1）

---

### 1. 创建 ZVOL

路径：
Storage → Pools → 选择存储池（如 tank）→ Add Zvol

设置：

* Name：iscsi_disk
* Size：10GB

---

### 2. 启动 iSCSI 服务

路径：
Services → iSCSI

操作：

* 将 iSCSI 开关设置为 ON
* 勾选开机自启（Start Automatically）

---

### 3. 配置 iSCSI

路径：
Sharing → Block (iSCSI)

---

### （1）创建 Portal Groups

* 点击 Portals → Add Portal

设置：

* IP Address：0.0.0.0 或 192.168.1.100
* Port：3260

---

### （2）创建 Initiators Groups

* 点击 Initiators → Add Initiator

设置：

* Initiators：ALL
* Authorized Networks：ALL

---

### （3）创建 Targets

* 点击 Targets → Add Target

设置：

* Target Name：

  ```
  iqn.2026-iscsi.lab:target1
  ```
* 关联刚刚创建的 Portal Group 和 Initiator Group

---

### （4）创建 Extents

* 点击 Extents → Add Extent

设置：

* Extent Type：Device
* Device：选择 iscsi_disk（ZVOL）

---

### （5）关联 Target 与 Extent

* 点击 Associated Targets → Add

设置：

* Target：选择 target1
* Extent：选择 iscsi_disk

说明：
该步骤为关键步骤，未完成将无法使用存储

---

## 第二部分：Windows 配置 iSCSI Initiator

---

### 1. 打开 iSCSI Initiator

操作：
Win + R → 输入：

```
iscsicpl
```

首次打开选择“是”启动服务

---

### 2. 添加目标门户

在“Discovery（发现）”选项卡中：

* 点击 Discover Portal
* 输入：

  ```
  192.168.1.100
  ```

---

### 3. 连接 Target

切换到“Targets（目标）”选项卡：

* 选择：

  ```
  iqn.2026-iscsi.lab:target1
  ```
* 点击 Connect

勾选：

* Automatically restore this connection

---

## 第三部分：磁盘初始化与使用

---

### 1. 打开磁盘管理

Win + X → 磁盘管理

---

### 2. 初始化磁盘

* 选择 GPT

---

### 3. 创建分区

操作：

* 右键未分配空间
* 新建简单卷
* 分配盘符（如 E:）
* 格式化为 NTFS

---

### 4. 验证结果

在“此电脑”中应出现新磁盘

---

### 5. 写入测试

创建文件：iscsi_test.txt

写入内容：
iSCSI实验成功

---

# 实验原理说明

iSCSI 是一种基于 IP 网络的存储协议，可以将远程存储设备映射为本地磁盘。

在本实验中：

* FreeNAS 提供存储资源（ZVOL）
* iSCSI 负责通过网络传输数据
* Windows 将远程磁盘识别为本地硬盘

---




