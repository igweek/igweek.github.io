### 1. 实验名称：电商大促——TB 级图片素材库的横向扩展实战

### 2. 实验情景
你是“某宝”电商平台的运维专家。
* **痛点**：由于商品图片（非结构化数据）增长极快，单台服务器的 10TB 硬盘已经满了，且单块硬盘的 I/O 读写速度成为了前端网页加载缓慢的瓶颈。
* **任务**：使用 3 台 Ubuntu 22.04 虚拟机，通过 GlusterFS 搭建一个 **分布式卷（Distributed Volume）**。
* **目标**：
    1.  实现**容量叠加**：3 个 10GB 的磁盘要变成一个逻辑上的 30GB 大磁盘。
    2.  实现**负载均衡**：通过哈希算法将成千上万张图片均匀分布在 3 台机器上，提升并发处理能力。

---

### 3. 实验拓扑与资源准备 (VMware)

| 虚拟机名称 | 角色 | 存储盘 (VMware 新增) | 挂载目标 |
| :--- | :--- | :--- | :--- |
| **Img-Store-01** | 存储节点 A | 10GB (/dev/sdb) | `/bricks/img_disk` |
| **Img-Store-02** | 存储节点 B | 10GB (/dev/sdb) | `/bricks/img_disk` |
| **Img-Store-03** | 存储节点 C | 10GB (/dev/sdb) | `/bricks/img_disk` |
| **Nginx-Web** | 图片处理前端 | 无 | `/var/www/images` |



---

### 4. 详细操作步骤

#### 第一阶段：物理层准备（三台存储节点同时操作）
1.  **新增磁盘**：在 VMware 设置里给每台机器加一块 10GB 硬盘。
2.  **分区与格式化**：
    ```bash
    sudo mkfs.xfs /dev/sdb
    sudo mkdir -p /bricks/img_disk
    sudo mount /dev/sdb /bricks/img_disk
    # 写入 fstab 确保开机挂载
    echo '/dev/sdb /bricks/img_disk xfs defaults 0 0' | sudo tee -a /etc/fstab
    ```
3.  **安装 GlusterFS**：
    ```bash
    sudo apt update && sudo apt install glusterfs-server -y
    sudo systemctl enable --now glusterd
    ```

#### 第二阶段：构建逻辑存储池（在 Store-01 操作）
1.  **添加节点**：
    ```bash
    sudo gluster peer probe 192.168.10.12
    sudo gluster peer probe 192.168.10.13
    ```
2.  **创建分布式卷**：
    **注意：** 默认不写 `replica` 关键字就是分布式卷。它不消耗额外空间做备份，只追求空间最大化。
    ```bash
    sudo gluster volume create img-vol \
    192.168.10.11:/bricks/img_disk/brick \
    192.168.10.12:/bricks/img_disk/brick \
    192.168.10.13:/bricks/img_disk/brick force
    
    sudo gluster volume start img-vol
    ```

#### 第三阶段：前端业务接入（Nginx-Web 节点）
1.  **挂载存储**：
    ```bash
    sudo apt install glusterfs-fuse -y
    sudo mkdir -p /var/www/images
    sudo mount -t glusterfs 192.168.10.11:/img-vol /var/www/images
    ```
2.  **验证容量**：
    执行 `df -h`。你会惊喜地发现 `/var/www/images` 的容量是 **30GB**。
    *解释：这就是分布式卷的魅力，$10GB + 10GB + 10GB = 30GB$。*

---

### 5. 实验验证与深度解释（理解核心技术）

#### 验证 A：文件分布规律
* **操作**：在客户端 `/var/www/images` 下创建 6 个文件：`img1.jpg` 到 `img6.jpg`。
* **观察**：分别登录 3 台存储节点的本地目录 `/bricks/img_disk/brick` 查看。
* **现象**：你会发现这 6 个文件并没有同步，而是分别散落在不同的机器上（例如 Node1 有 2 个，Node2 有 2 个，Node3 有 2 个）。
* **解释**：GlusterFS 使用了 **Elastic Hash Algorithm（弹性哈希算法）**。它根据文件名计算哈希值，决定把文件扔到哪台机器。这样可以并发读写，速度极快。

#### 验证 B：风险模拟（生产事故）
* **操作**：在 VMware 中直接关掉 **Img-Store-03**。
* **观察**：在客户端执行 `ls /var/www/images`。
* **现象**：你会发现原本 6 个图片，现在只能看到 4 个了。剩下的 2 个由于在关机的 Node3 上，暂时“消失”了。
* **解释**：这是**分布式卷**的唯一缺点——**没有冗余**。一台挂掉，该节点负责的数据就不可用。

---

