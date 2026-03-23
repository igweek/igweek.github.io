## 1. 集群管理命令 (Peer)
用于管理服务器节点之间的“信任关系”。

* **发现/添加节点**：
    `gluster peer probe <HOSTNAME_OR_IP>`  
    *（把对方拉进集群朋友圈）*
* **移除节点**：
    `gluster peer detach <HOSTNAME_OR_IP>`
* **查看集群状态**：
    `gluster peer status`  
    *（查看目前有几台机器在线，状态是否为 Connected）*
* **查看所有节点列表**：
    `gluster pool list`

---

## 2. 卷管理基础命令 (Volume)
这是最常用的部分，用于创建和开关存储卷。

* **创建卷**：
    `gluster volume create <VOLNAME> [replica <COUNT>] [transport tcp] <BRICK_PATH>... [force]`  
    *（这是核心命令，决定了是分布式、复制还是纠删码卷）*
* **启动卷**：
    `gluster volume start <VOLNAME>`
* **停止卷**：
    `gluster volume stop <VOLNAME>`
* **删除卷**：
    `gluster volume delete <VOLNAME>`
* **查看所有卷列表**：
    `gluster volume list`
* **查看卷详细信息**：
    `gluster volume info [VOLNAME]`  
    *（可以看到卷类型、共有几个 Brick、各 Brick 的在线状态）*
* **查看卷运行状态**：
    `gluster volume status [VOLNAME]`  
    *（查看具体的进程 PID、端口号和磁盘消耗）*

---

## 3. 卷配置与优化命令 (Set/Reset)
用于调整卷的参数，比如设置缓存大小、权限等。

* **设置参数**：
    `gluster volume set <VOLNAME> <OPTION> <VALUE>`  
    *（例如开启自愈：`gluster volume set gv0 cluster.self-heal-daemon on`）*
* **重置参数**：
    `gluster volume reset <VOLNAME>`

---

## 4. 维护与修复命令 (Heal)
主要用于**复制卷**或**纠删码卷**在宕机后的数据恢复。

* **手动触发自愈**：
    `gluster volume heal <VOLNAME> full`
* **查看待修复文件列表**：
    `gluster volume heal <VOLNAME> info`  
    *（如果显示 0，说明数据已经完全同步）*
* **查看自愈成功统计**：
    `gluster volume heal <VOLNAME> statistics`

---

## 5. 扩容与动态调整命令 (Brick)
在不停止业务的情况下，动态增加或替换硬盘。

* **添加 Brick (扩容)**：
    `gluster volume add-brick <VOLNAME> <NEW_BRICK_PATH>...`
* **移除 Brick (缩容)**：
    `gluster volume remove-brick <VOLNAME> <BRICK_PATH>... start/status/commit`
* **重新平衡数据**：
    `gluster volume rebalance <VOLNAME> start`  
    *（扩容后必须执行，让老数据均匀分布到新硬盘上）*

---

## 💡 快捷记忆表

| 想要做什么 | 命令前缀 | 常用后缀 |
| :--- | :--- | :--- |
| **管服务器** | `gluster peer ...` | `probe`, `status`, `detach` |
| **管存储卷** | `gluster volume ...` | `create`, `start`, `info`, `status` |
| **修数据** | `gluster volume heal ...` | `info`, `full` |
| **调参数** | `gluster volume set ...` | `performance.cache-size`, `auth.allow` |

