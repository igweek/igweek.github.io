<html>
<body>
<hr>
<h3>KVM 虚拟机 virsh 日常管理命令速查表</h3>

功能 | 命令示例 | 说明
-- | -- | --
查看列表 | virsh list --all | 显示所有虚拟机及状态
开机 | virsh start vm1 | 启动虚拟机
关机 | virsh shutdown vm1 | 正常关机（ACPI 信号）
拔电源关机 | virsh destroy vm1 | 强制关闭（相当于断电）
重启 | virsh reboot vm1 | 重启虚拟机
导出配置 | virsh dumpxml vm1 > vm1.xml | 导出虚拟机 XML 配置文件
删除虚拟机 | virsh undefine vm1 | 删除虚拟机定义（不删磁盘）
导入配置 | virsh define vm1.xml | 通过 XML 导入虚拟机配置
修改配置 | virsh edit vm1 | 编辑虚拟机配置（vim 编辑）
挂起 | virsh suspend vm1 | 暂停虚拟机
恢复 | virsh resume vm1 | 恢复挂起的虚拟机
开机自启 | virsh autostart vm1 | 设置开机自启
控制台登录 | virsh console vm1 | 进入虚拟机控制台


<hr>
</body>
</html>


---

# 实验案例：CentOS8 下使用 virsh 管理 KVM 虚拟机

## 一、实验环境

* 宿主机：CentOS 8
* 已安装软件包：`qemu-kvm`、`libvirt`、`virt-install`、`virt-manager`
* 已启动 libvirt 服务：

  ```bash
  systemctl enable --now libvirtd
  ```

---

## 二、实验目标

通过 virsh 命令对虚拟机进行日常管理，包括虚拟机的创建、启动、关机、配置修改、导出导入、控制台操作等。

---

## 三、实验步骤

### 1. 创建一台虚拟机（准备实验对象）

```bash
virt-install \
  --name=centos8 \
  --vcpus=2 \
  --memory=2048 \
  --disk path=/var/lib/libvirt/images/centos8.img,size=20 \
  --cdrom=/iso/CentOS-8.4.2105-x86_64-dvd1.iso \
  --network network=default \
  --os-variant=centos8.0 \
  --graphics none
```

> 安装完成后有一台名为 **centos8** 的虚拟机。

---

### 2. 查看虚拟机列表

```bash
virsh list --all
```

结果示例：

```
 Id   Name       State
--------------------------------
 -    centos8    shut off
```

---

### 3. 启动与关机

```bash
# 启动虚拟机
virsh start centos8

# 正常关机
virsh shutdown centos8

# 强制关机（拔电源）
virsh destroy centos8
```

---

### 4. 重启虚拟机

```bash
virsh reboot centos8
```

---

### 5. 导出与导入配置

```bash
# 导出 XML 配置
virsh dumpxml centos8 > centos8.xml

# 删除虚拟机定义（不删除磁盘）
virsh undefine centos8

# 重新导入虚拟机配置
virsh define centos8.xml
```

---

### 6. 修改配置

```bash
virsh edit centos8
```

> 会打开 vim，可以修改内存大小、CPU 数量、磁盘、网络等配置。

---

### 7. 挂起与恢复

```bash
# 挂起虚拟机
virsh suspend centos8

# 恢复运行
virsh resume centos8
```

---

### 8. 设置开机自启

```bash
virsh autostart centos8
virsh autostart --disable centos8
```

---

### 9. 控制台登录

```bash
virsh console centos8
```

> 如果虚拟机启用了 `ttyS0` 串口控制台，可以直接进入登录界面；退出方式：`Ctrl + ]`

---

## 四、实验总结

通过本实验，你已经掌握了：

* 查看虚拟机状态 (`list`)
* 虚拟机的启动/关机/重启/强制关机 (`start/shutdown/reboot/destroy`)
* 配置管理 (`dumpxml/undefine/define/edit`)
* 运行控制 (`suspend/resume/console`)
* 系统自动化管理 (`autostart`)

---

