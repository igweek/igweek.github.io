### KVM软件安装

### 1、 环境准备

关闭SELinux，将 /etc/sysconfig/selinux 中的 SELinux=enforcing 修改为 SELinux=disabled

`vi /etc/sysconfig/selinux`

查看CPU是否⽀持VT技术

`cat /proc/cpuinfo | grep -E 'vmx|svm'`

如果输出结果包含 svm 或 vmx 字样，则表示 CPU 支持虚拟化技术。

### 2、清理环境：卸载KVM （可选）

`yum remove `rpm -qa | egrep 'qemu|virt|KVM'` -y`

`rm -rf /var/lib/libvirt  /etc/libvirt/`

### 3、更改软件源

```bash
bash <(curl -sSL https://linuxmirrors.cn/main.sh)
```

### 4、安装软件

`yum install qemu-kvm libvirt virt-manager libguestfs-tools virt-install.noarch -y`
>kvm相关安装包及其作用:

- `qemu-kvm` 主要的KVM程序包
- `virt-manager` GUI虚拟机管理工具
- `libvirt` C语言工具包，提供libvirt服务
- `virt-install` 基于libvirt服务的虚拟机创建命令

验证 KVM 模块

`lsmod | grep kvm`

### 5、开启kvm服务，并且设置其开机自动启动

`systemctl start libvirtd`

`systemctl enable libvirtd`

### 6、查看状态操作结果，如Active: active (running)，说明运行情况良好

`systemctl status libvirtd`

`systemctl is-enabled libvirtd`