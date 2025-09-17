> [!note]
> KVM（Kernel-based Virtual Machine）的迁移：
> 在进行KVM虚拟机迁移前，需确保以下几点：
> - **相同的网络环境**：源主机和目标主机必须能够互相访问。
> - **存储共享或NFS共享**：源主机和目标主机需要能够访问同一个虚拟机存储，或者通过NFS共享虚拟机的磁盘映像。
> - **相同的CPU架构**：源主机和目标主机的硬件架构要兼容。
> - **相同的KVM版本**：最好确保源主机和目标主机运行相同版本的KVM。
> 

---

## 1. 概念解释
在 KVM 中，一个虚拟机的核心就是：
- **配置文件（.xml）**：描述虚拟机的 CPU、内存、网卡等信息。
- **虚拟磁盘镜像（.qcow2 或 .img）**：虚拟机的硬盘文件，存放操作系统和数据。  

因此，迁移 KVM 虚拟机的本质就是 **把配置文件 + 虚拟磁盘文件** 拷贝到另一台主机，再导入配置，启动虚拟机。

---

## 2. 学习意义
为什么要学会迁移虚拟机？
- **运维必备**：当一台宿主机需要维护或扩容时，可以把虚拟机迁移到另一台机器，保证业务不中断。  
- **备份与恢复**：拷贝虚拟机文件到另一台机器，就相当于做了灾备。  

---

## 3. 实例
假设有一台虚拟机叫 **testvm**，它的文件位置如下：  
- 配置文件：`/etc/libvirt/qemu/testvm.xml`  
- 磁盘镜像：`/var/lib/libvirt/images/testvm.qcow2`

我们要把它迁移到另一台主机（IP：192.168.1.100）。  

### 迁移命令：
```bash
# 1. 拷贝配置文件
scp -rp /etc/libvirt/qemu/testvm.xml root@192.168.1.100:/etc/libvirt/qemu/

# 2. 拷贝磁盘镜像
scp -rp /var/lib/libvirt/images/testvm.qcow2 root@192.168.1.100:/var/lib/libvirt/images/
```

---

## 4. 实例解析
- **scp**：Linux 的远程文件拷贝命令（基于 SSH）。  
- **-r**：递归拷贝（确保文件夹及子目录内容也能被复制）。  
- **-p**：保持源文件的权限、时间戳等属性。  
- **源路径**：本机虚拟机的配置文件和磁盘文件路径。  
- **目标路径**：目标主机上的相应目录。  

### 后续步骤：
1. 在目标主机上，导入虚拟机配置：
   ```bash
   virsh define /etc/libvirt/qemu/testvm.xml
   ```
   `define` 的意思是将配置文件加入 libvirt 的管理中。  

2. 启动虚拟机：
   ```bash
   virsh start testvm
   ```

---

> [!IMPORTANT]
> ## 5. 相似问题（练习）
> 请根据上面的示例，尝试完成以下练习 
> 1. 你有一台虚拟机 **web01**，配置文件在 `/etc/libvirt/qemu/web01.xml`，磁盘在 `/var/lib/libvirt/images/web01.img`。请写出迁移到目标主机（IP：192.168.1.200）的 `scp` 命令。  
> 2. 如果虚拟机磁盘文件不在默认目录，而在 `/data/vm/web02.qcow2`，请写出完整的 `scp` 命令把它迁移到目标主机（IP：192.168.1.150）。  
> 3. 完成拷贝后，目标主机如何让这个虚拟机可用？请写出 `virsh` 命令步骤。  
> 4. 如果有一台虚拟机是链接克隆，能否启动成功呢？
---

>[!TIP]
>KVM虚拟机的冷迁移


## KVM虚拟机迁移（冷迁移）

**1. 创建vm1虚拟机**
```bash
virt-install --name=vm1 --vcpus=1 --memory=1024 --disk path=/opt/vm1.qcow2,size=10,format=qcow2 --cdrom=/opt/CentOS7.iso --network network=default,model=virtio --os-variant=centos7.0 --graphics vnc,listen=0.0.0.0 --noautoconsole
```
**2. 放开端口**
```bash
sudo firewall-cmd --add-port=5900-5910/tcp --zone=public --permanent
sudo firewall-cmd --reload
```
**3. VNC连接并完成系统安装**

**4. 虚拟机克隆**

- 完整克隆
```bash
cp /opt/vm1.qcow2 /opt/vm2.qcow2
virsh dumpxml vm1 > /opt/vm2.xml
```
修改vm2.xml内容包括：
<name>：虚拟机名称
删除 <uuid>
删除 <mac address>
修改 <source file> 为新的磁盘路径

```bash
virsh define /opt/vm2.xml
```

- 链接克隆
```bash
qemu-img create -f qcow2 -b /opt/vm1.qcow2 /opt/vm3.qcow2
virsh dumpxml vm1 > /opt/vm3.xml
```
修改vm3.xml内容包括：
<name>：虚拟机名称
删除 <uuid>
删除 <mac address>
修改 <source file> 为新的磁盘路径

```bash
virsh define /opt/vm3.xml
```

**5. 虚拟机迁移**
```bash
cd /opt
scp -rp vm2.qcow2 vm2.xml vm3.qcow2 vm3.xml 192.168.3.129:/opt
```
注意：由于vm3是链接克隆，所以在做迁移的时候需要将模板机（vm1）的磁盘镜像也要迁移，否则vm3无法启动

```bash
scp -rp vm1.qcow2 vm2.qcow2 vm2.xml vm3.qcow2 vm3.xml 192.168.3.129:/opt
```


