FreeNAS的推荐配置和最小配置:

|     |             推荐配置              |             最小配置             |
|-----|-------------------------------|------------------------------|
| CPU |            x86_64             |            x86_64            |
| 内存  |              8G               |              1G              |
| 磁盘  | 最小2块磁盘，1块系统盘(20G),1块数据盘(不限大小) | 最小2块磁盘，1块系统盘(8G),1块数据盘(不限大小) |

这里我使用的配置如下，大家可以酌情增减：  

![](https://pic.myla.eu.org/file/rojsKrqu.webp)

这里就可以直接开始安装了：

这个就是FreeNAS 的安装界面了，直接回车或者等待，自动进入到安装界面

![](https://pic.myla.eu.org/file/cMcdOFTi.webp)

选择第一个 安装/更新 ：

![](https://pic.myla.eu.org/file/lrcCLGwr.webp)

这里会提示内存小于8G，我们这里直接忽略即可。

![](https://pic.myla.eu.org/file/wqoAZAVq.webp)

这里 空格 选择第一块磁盘(8G)，第二块磁盘待会用于数据盘：

![](https://pic.myla.eu.org/file/Ut4xnnPX.webp)

这里会提示将会清除这块磁盘中的所有数据，我们这里忽略即可：

![](https://pic.myla.eu.org/file/rLUwXWRF.webp)

然后我们这里设置 root 用户的密码：

![](https://pic.myla.eu.org/file/qyF3bg32.webp)

这里再选择以下启动方式，不知道的直接选择BIOS 即可，如果主板支持UEFI，可以选择UEFI，我们这里选择 BIOS即可。

![](https://pic.myla.eu.org/file/1oFPWqAs.webp)

安装完成后，回车离开安装程序，退回到控制界面：

![](https://pic.myla.eu.org/file/QoeO75Hw.webp)

这里选择第三个 重启系统：

![](https://pic.myla.eu.org/file/VbwxMfKS.webp)

第一次启动操作系统需要配置一大堆的文件，这里我们不用管，他还自动完成配置的，

然后就会进入到控制界面，如下：

![](https://pic.myla.eu.org/file/E29L4mwU.webp)

我们什么也不用管，直接根据提示的URL，进入到web 控制台即可：

## WEB 配置

这个就是`FreeNAS`的web 控制台了，FreeNAS 还保留了老版的控制台，我们下面再讲：

这里输入用户root，和前面设置的密码即可：

![](https://pic.myla.eu.org/file/6uYkvqos.webp)

点击这里我提示的图标即可进入到老版的控制台了，这里我就不用了，还是新版的控制台好看：

![](https://pic.myla.eu.org/file/GCdiieLO.webp)


### 修改默认语种

首先我们修改以下默认语言：

选择 System -> General -> Lanquage ，选择 Simplified Chinese ，点击SAVE即可：

![](https://pic.myla.eu.org/file/cN05RSco.webp)

这里会提议需要重启部分服务，勾选确定，然后点击继续即可：

![](https://pic.myla.eu.org/file/UvyLiJHn.webp)

### 创建存储池

存储 -> 存储池 -> 点击ADD添加即可：

![](https://pic.myla.eu.org/file/5r0gv47N.webp)

选择 创建存储池 ，然后点击创建存储池即可:

![](https://pic.myla.eu.org/file/dKNj4WEH.webp)

输入名称， 在可用磁盘内勾选da1，然后点击箭头，将磁盘添加到Data VDevs 中即可，然会点击创建，完成存储池的创建：

![](https://pic.myla.eu.org/file/ukw5OmdO.webp)

这里还是会提示磁盘将会被清除，勾选确定，创建磁盘池即可：

![](https://pic.myla.eu.org/file/BsD9lZv0.webp)

那么这样弄完之后，在存储池中就会出现`MyPool`了，这里的概念其实我已经有点懵了，不过在创建完成后，系统会将磁盘格式化好后，安装名称和关系关在至`/mnt` 目录下，我们只需要知道这点即可，如果不知道的，可以进入命令行查询：

![](https://pic.myla.eu.org/file/REJGlWaS.webp)

配置共享：

### 配置共享

在配置共享之前，我们这里需要添加一个用于平日使用的账户，总不可能使用root账户来访问共享把，这样就太危险了：

进入 账户 -> 用户 -> 点击 ADD 添加用户：

![](https://pic.myla.eu.org/file/1UYrmAdI.webp)

这里我创建一个名叫black 的账户，需要注意以下 用户目录的设置，我这里将 用户home目录设置在了 `/mnt/MyPool` 目录下，最后点击保存即可

注：这里主要是为了 后面FTP 的配置使用，如果没有FTP的需求可以配置用户home目录。同时这里我们也需要将black 用户的命令行设置为 nologin,以禁止black 可以登入系统。

![](https://pic.myla.eu.org/file/pTKuYwql.webp)

![](https://pic.myla.eu.org/file/pIaiW50f.webp)

注意，这里创建好用户的权限如下：

![](https://pic.myla.eu.org/file/W6sb3k9S.webp)

然会我们配置 存储池 的权限，由于这里需要使用black 用户作为平时的方位用户，所有这里需要将存储池的权限配置位black用户可读写：

![](https://pic.myla.eu.org/file/mrkYXhf2.webp)

这里将用户和组更改位black 即可

![](https://pic.myla.eu.org/file/RwfTyBek.webp)

#### 开启 NFS 共享

这里我们进入 共享 -> Unix(NFS) 共享类别，点击 ADD,添加NFS共享

![](https://pic.myla.eu.org/file/7m4wZZmQ.webp)

这里我们设置根路径位 `/mnt/MyPool/`，然后我们点击 高级模式，我们这里需要再做一些修改：

![](https://pic.myla.eu.org/file/BL0Mfhip.webp)

我们这里需要配置 maproot ，这个是用于将root用户映射位指定用户，否则会有权限问题：

![](https://pic.myla.eu.org/file/IGvuG4Kr.webp)

然后点击启动服务即可，这样NFS功能就能正常使用了：

![](https://pic.myla.eu.org/file/KtOIWGDV.webp)

#### 开启 SMB 共享

这里我们同样的进入到SMB 共享控制界面，点击 ADD

![](https://pic.myla.eu.org/file/YrCZi22w.webp)

这里添加路径位 /mnt/MyPool 即可

![](https://pic.myla.eu.org/file/hkz9n7vt.webp)

点击启动服务，即可完成配置：

![](https://pic.myla.eu.org/file/E3NKLW8J.webp)

#### 开启 FTP 共享

点击 开启FTP，勾选自动开启，然后点击 图标，进入配置界面：

![](https://pic.myla.eu.org/file/94nV1LPv.webp)

这里我们勾选，允许本地用户登入，然后点击保存即可完成：

![](https://pic.myla.eu.org/file/e1jPE5Au.webp)

### 测试 共享是否可用

首先是测试 SMB 共享：

\[win\] + R -> 输入 \\\[ip\]\\

这里会弹出输入网络凭据，这里输入 black 密码 即可：

![](https://pic.myla.eu.org/file/ymv93cZI.webp)

这里SMB 共享已经正常了：

![](https://pic.myla.eu.org/file/BROwfVQm.webp)
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
