## Windows
### 直接扩大 ECS 原有数据盘
1. 阿里云管理控制台，点击右侧的云盘，进入磁盘列表页面。
2. 点击数据盘右侧的更多，在弹出的列表中，点击磁盘扩容
   ![image.png](https://img.cccb.rr.nu/path/202503171541527.png)
3. 在弹出的对话框中，设置扩容后容量为100G 。完成后，点击 确定扩容 。
   ![image.png](https://img.cccb.rr.nu/path/202503171542873.png)
   ![image.png](https://img.cccb.rr.nu/path/202503171543546.png)
   弹出扩容成功，点击返回云盘列表。
   ![image.png](https://img.cccb.rr.nu/path/202503171544104.png)
4. 重启实例后，扩容才会生效
   ![image.png](https://img.cccb.rr.nu/path/202503171545574.png)
   ![image.png](https://img.cccb.rr.nu/path/202503171545027.png)
5. 扩容生效之后的磁盘，需要用户手动格式化扩展的存储空间。
   ![image.png](https://img.cccb.rr.nu/path/202503171546582.png)
   ![image.png](https://img.cccb.rr.nu/path/202503171546192.png)
   ![image.png](https://img.cccb.rr.nu/path/202503171546815.png)
   ![image.png](https://img.cccb.rr.nu/path/202503171546468.png)
   ![image.png](https://img.cccb.rr.nu/path/202503171546082.png)
   ![image.png](https://img.cccb.rr.nu/path/202503171546799.png)
   ![image.png](https://img.cccb.rr.nu/path/202503171547474.png)
6. 扩容成功
### 为 ECS 新增加一块数据盘
除了直接对已有磁盘进行磁盘扩容处理外，用户还可以通过新购一块云盘的方式，实现扩容云服务器ECS 的存储空间。
1. 通过如下步骤，新购一块数据盘。

1） 返回阿里云ECS 管理控制台，并在左侧栏中，点击云盘 。

2） 在右侧磁盘列表主页面中，选择实验提供的 地域 。此时，用户可以查看到当前有两块 使用中  的磁盘：20G 数据盘和 40G 系统盘。记录现有磁盘所在  可用区 ，例如：华东 1 可用区 E。

3） 点击右上角的创建云盘  。

![image.png](https://img.cccb.rr.nu/path/202503171548149.png)
跳转到云盘购买页面，地域与实验提供的磁盘所在可用区一致。

2. 购买磁盘
进入ECS 的云盘页面，用户可以查看到一块新增 待挂载 20G 的高效云盘。点击新购云盘右侧的更多和挂载
![image.png](https://img.cccb.rr.nu/path/202503171550341.png)
注意：若目标实例中无任何实例，请检查新购云盘是否与ECS在相同可用区。只有在同一可用区的云盘，才能挂载到ECS实例上。
![image.png](https://img.cccb.rr.nu/path/202503171551024.png)
![image.png](https://img.cccb.rr.nu/path/202503171551704.png)
3. 新挂载到ECS实例的数据盘无法直接使用，需要进行格式化。
   ![image.png](https://img.cccb.rr.nu/path/202503171552037.png)
![image.png](https://img.cccb.rr.nu/path/202503171552442.png)
![image.png](https://img.cccb.rr.nu/path/202503171553901.png)



## Linux (以Ubuntu为例)

Sir，下面提供一个较为详细的挂载步骤说明，帮助您将独立数据盘挂载到Ubuntu操作系统的ECS服务器上。

### 1. 确认数据盘设备名称

- **操作**：使用以下命令查看所有磁盘及分区信息：
    
    ```bash
    lsblk
    ```
    ![image.png](https://img.cccb.rr.nu/path/202503171621784.png)

### 2. 对新磁盘进行分区（如果还未分区）

- 
    
    ```bash
    sudo fdisk /dev/vdb
    ```
    
    在 fdisk 交互界面中：
    - 输入 `n` 创建新分区
    - 根据提示选择分区类型和大小（通常选择默认即可）
    - 输入 `w` 保存退出


### 3. 格式化分区

- **操作**：假设新创建的分区为 `/dev/vdb1`，执行：
    
    ```bash
    sudo mkfs.ext4 /dev/vdb1
    ```
    

### 4. 挂载数据盘

- **操作**：
    1. 创建挂载点目录，例如：
        
        ```bash
        sudo mkdir /mnt/data_disk
        ```
        
    2. 挂载分区到该目录：
        
        ```bash
        sudo mount /dev/vdb1 /mnt/data_disk
        ```
        


### 5. 设置开机自动挂载（可选，但推荐）

- **操作**：编辑 `/etc/fstab` 文件：
    
    ```bash
    sudo nano /etc/fstab
    ```
    
    添加以下一行：
    
    ```plaintext
    /dev/vdb1   /mnt/data_disk   ext4   defaults   0   0
    ```
    
    保存退出后，可用 `sudo mount -a` 测试配置。
- `/etc/fstab` 文件定义系统启动时自动挂载的文件系统。确保填写正确的设备名称、挂载点和文件系统类型。

### 注意事项

- **设备名称变化**：在云环境中，设备名称有时可能因重启或实例变化而不同，建议使用UUID或LABEL挂载，可以通过命令 `blkid` 获取UUID信息，然后在 `/etc/fstab` 中使用类似格式：
    
    ```plaintext
    UUID=xxxx-xxxx   /mnt/data_disk   ext4   defaults   0   0
    ```