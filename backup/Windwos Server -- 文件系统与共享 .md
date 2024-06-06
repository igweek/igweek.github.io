<html>
<body>
<!--StartFragment--><h2><strong>管理文件系统与共享资源</strong></h2>
<h3><strong>一、分区表格式</strong></h3>
<p>GPT和MBR都是磁盘分区表格式，用于存储有关磁盘分区的信息。GPT是较新的格式，具有许多优势，包括：</p>
<ul>
<li>支持更大的磁盘容量。MBR最多支持2TB的磁盘，而GPT支持高达18EB的磁盘。</li>
<li>支持更多分区。MBR最多支持4个主分区，而GPT支持128个分区。</li>
<li>更高的安全性。GPT使用循环冗余校验（CRC）来保护分区表数据，而MBR不使用CRC。</li>
</ul>
<p>以下是GPT和MBR的详细比较：</p>

特性 | GPT | MBR
-- | -- | --
支持的磁盘容量 | 18EB | 2TB
支持的分区数量 | 128 | 4
安全性 | 使用CRC保护分区表数据 | 不使用CRC保护分区表数据
兼容性 | 仅与UEFI系统兼容 | 与BIOS和UEFI系统兼容


<h3><strong>三、共享权限</strong></h3>
<p>FAT32与NTFS文件系统均有共享权限设置，共享权限只影响网络用户</p>
<p>如何开启网络发现：</p>
<p>在 Windows Server 2016 中，需要设置以下三个服务才能启用网络发现：</p>
<ul>
<li><strong>Function Discovery Resource Publication</strong></li>
<li><strong>SSDP Discovery</strong></li>
<li><strong>UPnP Device Host</strong></li>
</ul>
<p>这三个服务的作用如下：</p>
<ul>
<li><strong>Function Discovery Resource Publication</strong>：用于发布计算机的功能和资源信息。</li>
<li><strong>SSDP Discovery</strong>：用于发现网络上的其他设备和服务。</li>
<li><strong>UPnP Device Host</strong>：用于托管 UPnP 设备。</li>
</ul>
<h3><strong>四、卷影副本</strong></h3>
<p>卷影副本是 Windows 操作系统提供的一项备份和恢复功能。它允许在文件被修改或删除之前，创建文件或文件夹的副本，以便在需要时进行数据的还原和恢复。卷影副本主要有以下作用和优势:</p>
<p><strong>数据备份和恢复</strong>：卷影副本可以创建文件或整个卷的快照，使得管理员可以方便地进行数据备份和恢复操作，而无需停止正在运行的应用程序或服务。</p>
<p><strong>数据一致性</strong>：通过卷影副本技术，可以确保在进行数据备份时文件的一致性，即使文件正在被访问或修改，也可以保证备份数据的完整性。</p>
<p><strong>增量备份</strong>：卷影副本支持增量备份，只备份发生变化的数据，而不必每次都对整个卷进行完全备份，减少了备份所需的时间和存储空间。</p>
<p><strong>应用程序一致性</strong>：卷影副本技术可以与应用程序进行集成，确保在进行数据备份或恢复时，应用程序的数据和状态保持一致，防止数据损坏或丢失。</p>
<p><strong>具体来说，卷影副本可以用于以下场景:</strong></p>
<ul>
<li>恢复意外删除或修改的文件。</li>
<li>恢复由于病毒或恶意软件攻击而损坏的文件。</li>
<li>将数据恢复到某个特定的时间点。</li>
<li>为应用程序创建一致性备份。</li>
</ul>
<p><strong>卷影副本的工作原理:</strong></p>
<p>卷影副本通过创建一个卷的快照来实现。快照是一个只读的副本，它包含卷在某个特定时间点的所有数据。</p>
<h3>五、共享权限与NTFS权限共存</h3>
<p>一个用户mark，同时拥有test.txt文档的NTFS权限（读和写）&amp;共享权限（读取），请思考一下，mark针对test.txt文件拥有什么权限？</p>
<h3>六、文件夹与文件权限</h3>
<p>一个用户mark，拥有对 “book”文件夹的读取权限，在“book”文件夹中有一个文件blue.txt，mark拥有blue.txt的读取和写入权限。针对这种情况，mark到底拥有怎样的权限呢？</p>
<h3>七、NTFS的权限继承、累加、拒绝优先</h3>
<ul>
<li><strong>NTFS权限继承</strong></li>
</ul>
<p>是指当你在一个文件夹上设置了权限时，这些权限会被自动应用到该文件夹中的子文件夹和文件上。默认情况下，新创建的子文件夹和文件会继承其父文件夹的权限设置。</p>
<p>权限继承的优点是可以简化权限管理，只需要在父文件夹上设置权限，就能确保子文件夹和文件具有相同的权限。这样可以节省时间，并且减少了出错的可能性。</p>
<p>NTFS权限继承是可以被打破的。尽管权限继承是默认情况下的行为，但在某些情况下，你可能需要手动打破继承，并为特定的子文件夹或文件设置不同的权限。这样做可以更精细地控制文件和文件夹的访问权限。</p>
<ul>
<li><strong>NTFS权限累加</strong></li>
</ul>
<p>用户mark，同时隶属于sales组和manager组，sales组拥有test.txt的读取权限，manager组拥有test.txt的写入权限，那么用户mark对test.txt拥有怎样的权限。</p>
<ul>
<li><strong>拒绝优先</strong></li>
</ul>
<p>用户mark，同时隶属于sales组和manager组，sales组拥有test.txt的完全控制权限， manager组设有test.txt的拒绝写入权限，那么用户mark对test.txt拥有怎样的权限。</p>
<h3>八、复制和移动文件夹</h3>
<p>对于已经设定了NTFS权限的文件或者文件夹，如果对其进行复制和移动。那么NTFS权限还保留吗？</p>
<h3>九、NTFS文件系统的压缩和加密</h3>
<p><strong>压缩</strong>：</p>
<ul>
<li>NTFS支持文件级别的压缩，可以通过文件属性来设置。当你选择压缩文件时，NTFS将使用一种称为Lempel-Ziv压缩算法（一种无损压缩算法）来压缩文件。压缩的文件会在文件资源管理器中显示为蓝色，表示已压缩。</li>
<li>虽然压缩可以节省磁盘空间，但也会导致文件读写速度稍微变慢，因为需要在读写时进行压缩和解压缩操作。</li>
</ul>
<p><strong>加密</strong>：</p>
<ul>
<li>NTFS还支持文件和文件夹级别的加密，这是通过EFS（Encrypting File System）来实现的。你可以通过属性面板中的“高级”按钮来启用文件或文件夹的加密。</li>
<li>加密的文件或文件夹会在资源管理器中显示为绿色。这些文件在存储和传输时会以加密形式保存，只有加密了文件的用户才能访问其内容。</li>
<li>对于加密的文件，即使是以管理员权限登录的用户也无法直接查看其内容，除非他们是加密文件的拥有者或具有相应的解密密钥。</li>
</ul>
<p>开始—运行—certmgr.msc可以对密钥进行备份</p>
<!-- notionvc: 535b1f62-6566-43f2-9677-b3dc19f9b4a1 --><!--EndFragment-->
</body>
</html>