## 一、利用图形化界面安装

1、打开图形化界面

利用命令virt-manager

或者点击Applications——SystemTools——Virtual Machine Manager

![QQå¾ç20240401112307.png](https://pic.myla.eu.org/file/1757594132220_QQå¾ç20240401112307.png)

2、开始安装

![1.png](https://pic.myla.eu.org/file/1757594133368_1.png)

![2.png](https://pic.myla.eu.org/file/1757594132537_2.png)

![3.png](https://pic.myla.eu.org/file/1757594133977_3.png)

![4.png](https://pic.myla.eu.org/file/1757594133710_4.png)

![5.png](https://pic.myla.eu.org/file/1757594130770_5.png)

![6.png](https://pic.myla.eu.org/file/1757594131809_6.png)

## 二、利用命令安装虚拟机

1、利用qemu-img创建虚拟机的虚拟磁盘

```bash
qemu-img create -f qcow2 /var/lib/libvirt/images/vm2.qcow2 1G
```

2、查看所创建的虚拟磁盘的信息

```bash
qemu-img info /var/lib/libvirt/images/vm2.qcow2
```

3、利用virt-install命令创建虚拟机

```bash
virt-install --name=vm2 --disk path=/var/lib/libvirt/images/vm2.qcow2 --vcpus=1 --ram=512 --cdrom=/vm/iso/Core-11.1.iso --network network=default --os-type=linux
```

4、利用virsh命令查看虚拟机

```bash
virsh list —all
```

5、virt-install参数说明

> [!note]
**`virt-install`** 是一个用于创建新虚拟机的命令行工具，它有许多参数可以配置虚拟机的各种设置。以下是一些常用的 **`virt-install`** 命令参数及其详细说明：

> - **`n`** 或 **`-name`**: 指定虚拟机的名称。
> - **`r`** 或 **`-ram`**: 以 MB 为单位指定虚拟机的内存大小。
> - **`-vcpus`**: 配置虚拟 CPU 的数量，可以指定最大 vCPU 数量、套接字数、核心数和线程数。
> - **`-disk`**: 指定存储选项，如磁盘路径、大小（GB）、格式等。
> - **`-network`**: 配置网络接口，可以指定桥接或网络名称、模型、MAC 地址等。
> - **`-graphics`**: 配置图形显示，如 VNC 或 Spice，以及相关的端口、密码等。
> - **`-os-type`**: 指定操作系统类型，如 linux、unix 或 windows。
> - **`-os-variant`**: 指定操作系统的变体，如 fedora、rhel 等。
> - **`-location`**: 指定安装源的 URL，支持 FTP、HTTP 和 NFS。
> - **`-cdrom`**: 使用光盘作为安装介质。
> - **`-pxe`**: 使用 PXE 从网络引导安装。
> - **`-import`**: 导入现有磁盘映像而不进行安装。
> - **`-autostart`**: 设置虚拟机随宿主机启动时自动启动。

> [!tip]
这些参数可以组合使用，以满足特定的虚拟机配置需求。例如，创建一个名为 “myvm”、内存为 2048MB、单个 vCPU、并使用本地/path/to/install.iso文件作为安装介质的虚拟机的命令可能如下：

```bash
virt-install --name myvm --ram 2048 --vcpus 1 --disk path=/var/lib/libvirt/images/myvm.img,size=10 --cdrom /path/to/install.iso --os-type linux --os-variant ubuntu20.04
```