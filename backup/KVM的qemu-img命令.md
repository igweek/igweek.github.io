> [!note]
> ### **qemu-img 是什么？**
> `qemu-img` 是 QEMU（Quick Emulator）项目中的一个**命令行磁盘镜像管理工具**，专门用于创建、转换、修改和检查虚拟机磁盘镜像文件。它不涉及虚拟机运行或仿真，只专注于磁盘镜像的操作。
> ### **主要功能**
> 1. **创建镜像**  
>    - 生成各种格式的虚拟磁盘文件（如 `raw`、`qcow2`、`vmdk` 等）。
> 
> 2. **格式转换**  
>    - 在不同虚拟化平台格式间转换（例如 VMware → KVM）。
> 
> 3. **快照管理**  
>    - 创建、查看、应用或删除磁盘快照（仅限支持快照的格式如 `qcow2`）。
> 
> 4. **镜像调整**  
>    - 动态扩容或缩容磁盘大小


### 1. **`create` - 创建新镜像**
**语法**：  
`qemu-img create [-f fmt] [-o options] filename [size]`

**示例**：  
```bash
# 创建 20GB 的 raw 格式镜像（默认格式）
qemu-img create disk.img 20G

# 创建动态分配的 qcow2 镜像（推荐）
qemu-img create -f qcow2 ubuntu.qcow2 30G

# 创建加密镜像（需设置密码）
qemu-img create -f qcow2 -o encryption=on secret.qcow2 10G
```

---

### 2. **`convert` - 转换镜像格式**
**语法**：  
`qemu-img convert [-f fmt] [-O output_fmt] [-o options] input_file output_file`

**示例**：  
```bash
# 将 raw 转换为 qcow2
qemu-img convert -f raw -O qcow2 disk.img disk.qcow2

# 将 VMware 的 vmdk 转换为 qcow2
qemu-img convert -f vmdk -O qcow2 vmware.vmdk qemu.qcow2

# 转换时压缩镜像（减少空间占用）
qemu-img convert -O qcow2 -c compressed.img source.img
```

---

### 3. **`info` - 查看镜像信息**
**语法**：  
`qemu-img info [-f fmt] filename`

**示例**：  
```bash
# 查看镜像详细信息
qemu-img info ubuntu.qcow2

# 输出示例：
# image: ubuntu.qcow2
# file format: qcow2
# virtual size: 30 GiB (32212254720 bytes)
# disk size: 2.5 GiB
# encrypted: no
# cluster_size: 65536
```

---

### 4. **`check` - 检查镜像完整性**
**语法**：  
`qemu-img check [-f fmt] filename`

**示例**：  
```bash
# 检查镜像是否有错误
qemu-img check ubuntu.qcow2

# 尝试修复错误（如果支持）
qemu-img check -r leaks ubuntu.qcow2
```

---

### 5. **`snapshot` - 快照管理**
**语法**：  
- `qemu-img snapshot -l filename`（列出快照）  
- `qemu-img snapshot -c snapshot_name filename`（创建快照）  
- `qemu-img snapshot -a snapshot_name filename`（恢复快照）  
- `qemu-img snapshot -d snapshot_name filename`（删除快照）  

**示例**：  
```bash
# 列出所有快照
qemu-img snapshot -l ubuntu.qcow2

# 创建名为 "clean_install" 的快照
qemu-img snapshot -c clean_install ubuntu.qcow2

# 恢复到该快照
qemu-img snapshot -a clean_install ubuntu.qcow2

# 删除快照
qemu-img snapshot -d clean_install ubuntu.qcow2
```

---

### 6. **`resize` - 调整镜像大小**
**语法**：  
`qemu-img resize [-f fmt] filename [+|-]size`

**示例**：  
```bash
# 扩容：增加 10GB
qemu-img resize ubuntu.qcow2 +10G

# 缩容：减少 5GB（需谨慎！）
qemu-img resize ubuntu.qcow2 25G

# 直接设置为指定大小
qemu-img resize ubuntu.qcow2 40G
```

---


### 常用格式说明：
- `raw`：原始格式，性能最好，但占用空间大
- `qcow2`：QEMU 原生格式，支持压缩、快照、加密
- `vmdk`：VMware 兼容格式
- `vdi`：VirtualBox 兼容格式
- `qcow`：旧版 QEMU 格式（不推荐）

---

### 查看帮助：
```bash
# 查看所有命令说明
qemu-img --help

# 查看具体命令帮助
qemu-img command --help
```

这些命令足够满足单机环境下虚拟机磁盘镜像的管理需求！