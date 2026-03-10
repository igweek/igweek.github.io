FreeNAS的推荐配置和最小配置:

|     |             推荐配置              |             最小配置             |
|-----|-------------------------------|------------------------------|
| CPU |            x86_64             |            x86_64            |
| 内存  |              8G               |              1G              |
| 磁盘  | 最小2块磁盘，1块系统盘(20G),1块数据盘(不限大小) | 最小2块磁盘，1块系统盘(8G),1块数据盘(不限大小) |

这里我使用的配置如下，大家可以酌情增减：  

<img width="299" height="373" alt="Image" src="https://github.com/user-attachments/assets/da35fd56-554c-48a5-8614-dc33e11a25a2" />

这里就可以直接开始安装了：

这个就是FreeNAS 的安装界面了，直接回车或者等待，自动进入到安装界面

<img width="720" height="400" alt="Image" src="https://github.com/user-attachments/assets/c5eb78b1-f591-45ec-86b5-1d6005c8c7a7" />

选择第一个 安装/更新 ：

<img width="720" height="400" alt="Image" src="https://github.com/user-attachments/assets/6bbb285a-2f26-4978-a255-82d5ce76a96f" />

这里会提示内存小于8G，我们这里直接忽略即可。

<img width="720" height="400" alt="Image" src="https://github.com/user-attachments/assets/1b90a0d2-d8c3-4e6a-a535-528197f54819" />

这里 空格 选择第一块磁盘(8G)，第二块磁盘待会用于数据盘：

<img width="720" height="400" alt="Image" src="https://github.com/user-attachments/assets/a0962ab6-0488-493c-9700-56467117d537" />

这里会提示将会清除这块磁盘中的所有数据，我们这里忽略即可：

<img width="720" height="400" alt="Image" src="https://github.com/user-attachments/assets/ddb1892f-4845-4eb8-90d6-f27343e6a522" />

然后我们这里设置 root 用户的密码：

<img width="720" height="400" alt="Image" src="https://github.com/user-attachments/assets/2bfb81ed-1ef3-49af-bfae-48aa46ada29e" />

这里再选择以下启动方式，不知道的直接选择BIOS 即可，如果主板支持UEFI，可以选择UEFI，我们这里选择 BIOS即可。

<img width="720" height="400" alt="Image" src="https://github.com/user-attachments/assets/609794d1-b7d1-4b9d-a58d-3ae7c0779439" />

安装完成后，回车离开安装程序，退回到控制界面：

<img width="720" height="400" alt="Image" src="https://github.com/user-attachments/assets/4230571f-c11e-4a41-960d-1556ada3b2c4" />

这里选择第三个 重启系统：

<!-- Failed to upload "1641240-20250104000150654-100538423.png" -->

第一次启动操作系统需要配置一大堆的文件，这里我们不用管，他还自动完成配置的，

然后就会进入到控制界面，如下：

<img width="720" height="400" alt="Image" src="https://github.com/user-attachments/assets/a94a2751-8ad0-46bb-8aac-c7d586b24391" />

我们什么也不用管，直接根据提示的URL，进入到web 控制台即可：

## WEB 配置

这个就是`FreeNAS`的web 控制台了，FreeNAS 还保留了老版的控制台，我们下面再讲：

这里输入用户root，和前面设置的密码即可：

<img width="1600" height="789" alt="Image" src="https://github.com/user-attachments/assets/76a17f08-598d-4ddb-ae84-0fc8fd1caa4c" />

点击这里我提示的图标即可进入到老版的控制台了，这里我就不用了，还是新版的控制台好看：

<img width="1600" height="787" alt="Image" src="https://github.com/user-attachments/assets/43cf980c-fd65-42f9-b2d4-0f834fd3d543" />


### 修改默认语种

首先我们修改以下默认语言：

选择 System -> General -> Lanquage ，选择 Simplified Chinese ，点击SAVE即可：

<img width="1600" height="787" alt="Image" src="https://github.com/user-attachments/assets/788ea012-a437-476e-9d61-17a0a2bbd7a4" />

这里会提议需要重启部分服务，勾选确定，然后点击继续即可：

<img width="598" height="180" alt="Image" src="https://github.com/user-attachments/assets/da0bfb91-3da6-4f85-8530-d88332746382" />

### 创建存储池

存储 -> 存储池 -> 点击ADD添加即可：

<!-- Failed to upload "1641240-20250104000230400-1637610601.png" -->

选择 创建存储池 ，然后点击创建存储池即可:

<img width="1310" height="335" alt="Image" src="https://github.com/user-attachments/assets/42ae7f96-3ad8-46eb-863b-ec1eaff3da9b" />

输入名称， 在可用磁盘内勾选da1，然后点击箭头，将磁盘添加到Data VDevs 中即可，然会点击创建，完成存储池的创建：

<img width="1326" height="619" alt="Image" src="https://github.com/user-attachments/assets/7bfc119a-7160-44af-bc49-a5b00fd3f039" />

这里还是会提示磁盘将会被清除，勾选确定，创建磁盘池即可：

<img width="350" height="156" alt="Image" src="https://github.com/user-attachments/assets/509d8847-9d9c-4d64-be54-2b2e8b626a9b" />

那么这样弄完之后，在存储池中就会出现`MyPool`了，这里的概念其实我已经有点懵了，不过在创建完成后，系统会将磁盘格式化好后，安装名称和关系关在至`/mnt` 目录下，我们只需要知道这点即可，如果不知道的，可以进入命令行查询：

<img width="1312" height="238" alt="Image" src="https://github.com/user-attachments/assets/da402001-6135-42a5-8bdb-775b98942901" />

配置共享：

### 配置共享

在配置共享之前，我们这里需要添加一个用于平日使用的账户，总不可能使用root账户来访问共享把，这样就太危险了：

进入 账户 -> 用户 -> 点击 ADD 添加用户：

<!-- Failed to upload "1641240-20250104000254697-2002394650.png" -->

这里我创建一个名叫black 的账户，需要注意以下 用户目录的设置，我这里将 用户home目录设置在了 `/mnt/MyPool` 目录下，最后点击保存即可

注：这里主要是为了 后面FTP 的配置使用，如果没有FTP的需求可以配置用户home目录。同时这里我们也需要将black 用户的命令行设置为 nologin,以禁止black 可以登入系统。

<img width="957" height="554" alt="Image" src="https://github.com/user-attachments/assets/03929636-76bb-47b2-92d7-25c01f884487" />

<img width="958" height="436" alt="Image" src="https://github.com/user-attachments/assets/490b8ac6-2917-4245-8d57-69683996fe21" />

注意，这里创建好用户的权限如下：

<img width="954" height="615" alt="Image" src="https://github.com/user-attachments/assets/5269affe-1a8e-456a-abf0-e86dd29e1d20" />

然会我们配置 存储池 的权限，由于这里需要使用black 用户作为平时的方位用户，所有这里需要将存储池的权限配置位black用户可读写：

<img width="1600" height="789" alt="Image" src="https://github.com/user-attachments/assets/3952b493-a778-4818-a42f-b898cf6858ed" />

这里将用户和组更改位black 即可

<img width="958" height="678" alt="Image" src="https://github.com/user-attachments/assets/ea86a067-2bcf-4762-ab30-cf6010466e4c" />

#### 开启 NFS 共享

这里我们进入 共享 -> Unix(NFS) 共享类别，点击 ADD,添加NFS共享

<img width="1600" height="788" alt="Image" src="https://github.com/user-attachments/assets/636a301e-3419-4abc-a377-c1ee8800079c" />

这里我们设置根路径位 `/mnt/MyPool/`，然后我们点击 高级模式，我们这里需要再做一些修改：

<img width="962" height="366" alt="Image" src="https://github.com/user-attachments/assets/ce7402b0-db43-4692-a367-b5a537cf5bf3" />

我们这里需要配置 maproot ，这个是用于将root用户映射位指定用户，否则会有权限问题：

<img width="1288" height="97" alt="Image" src="https://github.com/user-attachments/assets/5ba01486-2f8a-4f93-ba55-68cdd3e46dd3" />

然后点击启动服务即可，这样NFS功能就能正常使用了：

<!-- Failed to upload "1641240-20250104000522187-1015258251.png" -->

#### 开启 SMB 共享

这里我们同样的进入到SMB 共享控制界面，点击 ADD

<img width="1600" height="788" alt="Image" src="https://github.com/user-attachments/assets/cb168ba3-daa6-432e-a23f-53aad024ea3d" />

这里添加路径位 /mnt/MyPool 即可

<img width="961" height="410" alt="Image" src="https://github.com/user-attachments/assets/5cfb4fb0-af35-4a43-8ea3-b749ba075f0b" />

点击启动服务，即可完成配置：

<img width="232" height="156" alt="Image" src="https://github.com/user-attachments/assets/1034ab3f-dd8b-4429-9ef0-fa7abe446b55" />

#### 开启 FTP 共享

点击 开启FTP，勾选自动开启，然后点击 图标，进入配置界面：

<img width="1600" height="787" alt="Image" src="https://github.com/user-attachments/assets/eb47af26-3a9e-40da-88f4-8987ea941ecb" />

这里我们勾选，允许本地用户登入，然后点击保存即可完成：

<img width="958" height="675" alt="Image" src="https://github.com/user-attachments/assets/a08ecaf3-d4e5-4d9d-833d-13dbd28f93fa" />

### 测试 共享是否可用

首先是测试 SMB 共享：

\[win\] + R -> 输入 \\\[ip\]\\

这里会弹出输入网络凭据，这里输入 black 密码 即可：

<img width="456" height="356" alt="Image" src="https://github.com/user-attachments/assets/93a0c00d-bdd2-4179-8a0e-d52fb406d8a9" />

这里SMB 共享已经正常了：

<img width="1128" height="652" alt="Image" src="https://github.com/user-attachments/assets/d52960c8-c02a-4972-b79b-6eed7d1cd919" />

测试 NFS 共享：

```bash
mount -t nfs 10.30.76.190:/mnt/MyPool /mnt
 cd /mnt
 ls
```

> test.txt

这里NFS也正常了

测试FTP：

```bash
lftp -u black,123456 10.30.76.190
dir
```

> lftp black@10.30.76.190:~> dir  
> \-rwxrwx--- 1 black black 0 Oct 24 01:27 test.txt  
> lftp black@10.30.76.190:/>

同样的，FTP也是正常的了
