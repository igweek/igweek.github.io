> [!note]
> KVM虚拟机本质上由两部分组成：
> - 虚拟机配置文件
> - 虚拟磁盘

*   **配置文件**：通常位于 `/etc/libvirt/qemu/` 目录下，是一个 XML 文件（例如 `ubuntu-server.xml`）。它定义了虚拟机的所有硬件规格，如 CPU 数量、内存大小、网络设置、磁盘路径、启动顺序等。如下图
![11.png](https://pic.myla.eu.org/file/1757594473172_11.png)
*   **磁盘文件**：通常位于 `/var/lib/libvirt/images/` 或其他指定目录下（例如 `ubuntu-server.qcow2`）。它是虚拟机的硬盘，里面安装了操作系统和所有数据。如下图
![22.png](https://pic.myla.eu.org/file/1757594478620_22.png)


---

# KVM 虚拟机克隆详解：完整克隆与链接克隆

在日常 KVM 虚拟化管理中，虚拟机克隆是一项非常实用的功能。通过克隆，运维人员可以快速复制一台现有虚拟机的配置和磁盘文件，从而节省部署时间、提高环境搭建效率。本文将详细介绍 **KVM 虚拟机的完整克隆和链接克隆** 两种方式，并提供自动化脚本示例。

---

## 一、虚拟机克隆的两种方式
在 KVM 环境中，常见的克隆方式有两种：

1. **完整克隆（Full Clone）**  
   - 会复制原虚拟机的所有磁盘数据，生成一个全新的独立虚拟机。  
   - 优点：互不影响，稳定可靠。  
   - 缺点：磁盘文件较大，克隆耗时。  

2. **链接克隆（Linked Clone）**  
   - 新虚拟机磁盘文件基于原虚拟机磁盘（母盘），只记录增量部分。  
   - 优点：磁盘占用小，创建速度快。  
   - 缺点：依赖母盘，若母盘损坏，克隆机无法使用。  

---

## 二、完整克隆方法

### 1. 自动模式（virt-clone 工具）
`virt-clone` 是 libvirt 提供的专用克隆工具，操作简单：  
```bash
virt-clone --auto-clone -o web01 -n web02
```
- `-o web01`：指定原始虚拟机名称  
- `-n web02`：指定新虚拟机名称  
- `--auto-clone`：自动生成新磁盘文件  

### 2. 手动模式（复制配置 + 修改）
1. 转换磁盘文件：  
   ```bash
   qemu-img convert -f qcow2 -O qcow2 -c web01.qcow2 web03.qcow2
   ```
2. 导出配置文件并修改：  
   ```bash
   virsh dumpxml web01 > web02.xml
   vim web02.xml
   ```
   修改内容包括：  
   - `<name>`：虚拟机名称  
   - 删除 `<uuid>`  
   - 删除 `<mac address>`  
   - 修改 `<source file>` 为新的磁盘路径  
![33.png](https://pic.myla.eu.org/file/1757594474987_33.png)
3. 定义并启动新虚拟机：  
   ```bash
   virsh define web02.xml
   virsh start web02
   ```

---

## 三、链接克隆方法

### 1. 步骤解析
a. **生成新的虚拟机磁盘文件**  
```bash
qemu-img create -f qcow2 -b web03.qcow2 web04.qcow2
```
参数说明：  
- `-f qcow2`：磁盘格式  
- `-b`：基于哪个母盘  

b. **生成新的配置文件**  
```bash
virsh dumpxml web01 > web03.xml
vim web03.xml
```
修改点与完整克隆相同：虚拟机名称、UUID、MAC 地址、磁盘路径。  

c. **导入虚拟机并测试**  
```bash
virsh define web03.xml
virsh start web03
```

---

### 2. 全自动链接克隆脚本
为了简化操作，可以写一个脚本来一键完成：  

```bash
#!/bin/bash
old_vm=$1
new_vm=$2

# a：生成虚拟机磁盘文件
old_disk=$(virsh dumpxml $old_vm | grep "<source file" | awk -F"'" '{print $2}')
disk_tmp=$(dirname $old_disk)
qemu-img create -f qcow2 -b $old_disk ${disk_tmp}/${new_vm}.qcow2

# b：生成虚拟机的配置文件
virsh dumpxml $old_vm > /tmp/${new_vm}.xml

# 修改虚拟机的名字
sed -ri "s#(<name>)(.*)(</name>)#\1${new_vm}\3#g" /tmp/${new_vm}.xml
# 删除虚拟机uuid
sed -i '/<uuid>/d' /tmp/${new_vm}.xml
# 删除mac地址
sed -i '/<mac address/d' /tmp/${new_vm}.xml
# 修改磁盘路径
sed -ri "s#(<source file=')(.*)('/>)#\1${disk_tmp}/${new_vm}.qcow2\3#g" /tmp/${new_vm}.xml

# c：导入虚拟机并进行启动测试
virsh define /tmp/${new_vm}.xml
virsh start ${new_vm}
```

执行方式：  
```bash
bash link_clone.sh web01 web05
```
即可基于 `web01` 快速生成一个新虚拟机 `web05`。  

---

## 四、完整克隆与链接克隆对比
| 特性            | 完整克隆             | 链接克隆            |
|-----------------|--------------------|-------------------|
| 磁盘占用        | 较大（复制全盘）     | 较小（仅增量部分）   |
| 创建速度        | 较慢                | 较快               |
| 依赖性          | 独立运行             | 依赖母盘            |
| 适用场景        | 生产环境、长期使用     | 测试环境、临时环境    |

---

## 五、总结
- 如果你需要一个完全独立的虚拟机，**完整克隆** 更适合。  
- 如果是测试或临时环境，**链接克隆** 能极大节省空间和时间。  
- 结合 `virt-clone` 和脚本工具，可以快速、批量地生成虚拟机，大大提升运维效率。  

---