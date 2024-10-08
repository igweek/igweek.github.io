
#### **一、分区表格式**

GPT和MBR都是磁盘分区表格式，用于存储有关磁盘分区的信息。GPT是较新的格式，具有许多优势，包括：

- 支持更大的磁盘容量。MBR最多支持2TB的磁盘，而GPT支持高达18EB的磁盘。

- 支持更多分区。MBR最多支持4个主分区，而GPT支持128个分区。

- 更高的安全性。GPT使用循环冗余校验（CRC）来保护分区表数据，而MBR不使用CRC。

以下是GPT和MBR的详细比较：

| **特性**       | **GPT**               | **MBR**                 |
| -------------- | --------------------- | ----------------------- |
| 支持的磁盘容量 | 18EB                  | 2TB                     |
| 支持的分区数量 | 128                   | 4                       |
| 安全性         | 使用CRC保护分区表数据 | 不使用CRC保护分区表数据 |
| 兼容性         | 仅与UEFI系统兼容      | 与BIOS和UEFI系统兼容    |

#### **二、文件系统格式**

文件系统格式是用于组织和管理磁盘数据的系统。它定义了如何存储文件和文件夹以及如何管理磁盘空间。

常见的**文件系统格式**包括：

- **FAT**（文件分配表）：FAT是一种历史悠久的格式，最初用于软盘。它支持较小的磁盘容量和较少的分区。

- **NTFS**（新技术文件系统）：NTFS是Windows系统的默认文件系统。它支持更大的磁盘容量、更多分区和更高的安全性。

- **exFAT**（扩展文件分配表）：exFAT是专为闪存设备（如U盘和SD卡）设计的格式。它支持更大的文件和更高的性能。

- **HFS+**（Hierarchical File System Plus）：HFS+是Mac系统的默认文件系统。它支持较大的磁盘容量和更高的安全性。

- **EXT**（EXTended File System）：EXT是Linux系统的常见文件系统。它支持较大的磁盘容量和更高的性能。

| **特性**             | **FAT32** | **NTFS**                   |
| -------------------- | --------- | -------------------------- |
| 兼容性               | 更好      | 相对较差                   |
| 支持的最大分区大小   | 2TB       | 18EB                       |
| 单个文件最大支持     | 4GB       | 理论上无限制               |
| 数据读写速度与稳定性 | 一般      | 优                         |
| 其他功能             | 无        | 支持加密、压缩、权限控制等 |

#### **三、共享权限**

FAT32与NTFS文件系统均有共享权限设置，共享权限只影响网络用户

如何开启网络发现：

在 Windows Server 2016 中，需要设置以下三个服务才能启用网络发现：

- **Function Discovery Resource Publication**

- **SSDP Discovery**

- **UPnP Device Host**

这三个服务的作用如下：

- **Function Discovery Resource Publication**：用于发布计算机的功能和资源信息。

- **SSDP Discovery**：用于发现网络上的其他设备和服务。

- **UPnP Device Host**：用于托管 UPnP 设备。

#### **四、卷影副本**

卷影副本是 Windows 操作系统提供的一项备份和恢复功能。它允许在文件被修改或删除之前，创建文件或文件夹的副本，以便在需要时进行数据的还原和恢复。卷影副本主要有以下作用和优势:

**数据备份和恢复**：卷影副本可以创建文件或整个卷的快照，使得管理员可以方便地进行数据备份和恢复操作，而无需停止正在运行的应用程序或服务。

**数据一致性**：通过卷影副本技术，可以确保在进行数据备份时文件的一致性，即使文件正在被访问或修改，也可以保证备份数据的完整性。

**增量备份**：卷影副本支持增量备份，只备份发生变化的数据，而不必每次都对整个卷进行完全备份，减少了备份所需的时间和存储空间。

**应用程序一致性**：卷影副本技术可以与应用程序进行集成，确保在进行数据备份或恢复时，应用程序的数据和状态保持一致，防止数据损坏或丢失。

**具体来说，卷影副本可以用于以下场景:**

- 恢复意外删除或修改的文件。

- 恢复由于病毒或恶意软件攻击而损坏的文件。

- 将数据恢复到某个特定的时间点。

- 为应用程序创建一致性备份。

**卷影副本的工作原理:**

卷影副本通过创建一个卷的快照来实现。快照是一个只读的副本，它包含卷在某个特定时间点的所有数据。

#### 五、共享权限与NTFS权限共存

一个用户mark，同时拥有test.txt文档的NTFS权限（读和写）&共享权限（读取），请思考一下，mark针对test.txt文件拥有什么权限？

 

#### 六、文件夹与文件权限

一个用户mark，拥有对 “book”文件夹的读取权限，在“book”文件夹中有一个文件blue.txt，mark拥有blue.txt的读取和写入权限。针对这种情况，mark到底拥有怎样的权限呢？

 

#### 七、NTFS的权限继承、累加、拒绝优先

- **NTFS权限继承**

是指当你在一个文件夹上设置了权限时，这些权限会被自动应用到该文件夹中的子文件夹和文件上。默认情况下，新创建的子文件夹和文件会继承其父文件夹的权限设置。

权限继承的优点是可以简化权限管理，只需要在父文件夹上设置权限，就能确保子文件夹和文件具有相同的权限。这样可以节省时间，并且减少了出错的可能性。

NTFS权限继承是可以被打破的。尽管权限继承是默认情况下的行为，但在某些情况下，你可能需要手动打破继承，并为特定的子文件夹或文件设置不同的权限。这样做可以更精细地控制文件和文件夹的访问权限。

- **NTFS权限累加**

用户mark，同时隶属于sales组和manager组，sales组拥有test.txt的读取权限，manager组拥有test.txt的写入权限，那么用户mark对test.txt拥有怎样的权限。

- **拒绝优先**

用户mark，同时隶属于sales组和manager组，sales组拥有test.txt的完全控制权限， manager组设有test.txt的拒绝写入权限，那么用户mark对test.txt拥有怎样的权限。

#### 八、复制和移动文件夹

对于已经设定了NTFS权限的文件或者文件夹，如果对其进行复制和移动。那么NTFS权限还保留吗？

#### 九、NTFS文件系统的压缩和加密

**压缩**：

- NTFS支持文件级别的压缩，可以通过文件属性来设置。当你选择压缩文件时，NTFS将使用一种称为Lempel-Ziv压缩算法（一种无损压缩算法）来压缩文件。压缩的文件会在文件资源管理器中显示为蓝色，表示已压缩。

- 虽然压缩可以节省磁盘空间，但也会导致文件读写速度稍微变慢，因为需要在读写时进行压缩和解压缩操作。

**加密**：

- NTFS还支持文件和文件夹级别的加密，这是通过EFS（Encrypting File System）来实现的。你可以通过属性面板中的“高级”按钮来启用文件或文件夹的加密。

- 加密的文件或文件夹会在资源管理器中显示为绿色。这些文件在存储和传输时会以加密形式保存，只有加密了文件的用户才能访问其内容。

- 对于加密的文件，即使是以管理员权限登录的用户也无法直接查看其内容，除非他们是加密文件的拥有者或具有相应的解密密钥。

开始—运行—certmgr.msc可以对密钥进行备份