![image.png](https://pic.myla.eu.org/file/XccFyQC8.png)

## 换源 [​](#换源)

PVE 9.0 基于 Debian 13，除了换 Debian 的软件源以外，还需要编辑企业源、Ceph 源、无订阅源以及 CT 模板源。

### Debian 软件源 [​](#debian-软件源)

提示

Debian 13 软件源变更为 `DEB822` 格式 `/etc/apt/sources.list.d/debian.sources` ，不再是传统格式 `/etc/apt/sources.list`

与常规的 Debian 13 一样，将 `/etc/apt/sources.list.d/debian.sources` 中默认源全部删除，将其替换为清华源

/etc/apt/sources.list.d/debian.sources



```markdown
Types: deb
URIs: https://mirrors.tuna.tsinghua.edu.cn/debian
Suites: trixie trixie-updates trixie-backports
Components: main contrib non-free non-free-firmware
Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg

# 默认注释了源码镜像以提高 apt update 速度，如有需要可自行取消注释

# Types: deb-src

# URIs: https://mirrors.tuna.tsinghua.edu.cn/debian

# Suites: trixie trixie-updates trixie-backports

# Components: main contrib non-free non-free-firmware

# Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg

# 以下安全更新软件源包含了官方源与镜像站配置，如有需要可自行修改注释切换

Types: deb
URIs: https://security.debian.org/debian-security
Suites: trixie-security
Components: main contrib non-free non-free-firmware
Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg

# Types: deb-src

# URIs: https://security.debian.org/debian-security

# Suites: trixie-security

# Components: main contrib non-free non-free-firmware

# Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg
```

### 企业源 [​](#企业源)

将 PVE 的企业源 `/etc/apt/sources.list.d/pve-enterprise.sources` 注释掉（也可以直接删除）

/etc/apt/sources.list.d/pve-enterprise.sources



```markdown
# Types: deb

# URIs: https://enterprise.proxmox.com/debian/pve

# Suites: trixie

# Components: pve-enterprise

# Signed-By: /usr/share/keyrings/proxmox-archive-keyring.gpg
```

### Ceph 源 [​](#ceph-源)

将 PVE 的 Ceph 源 `/etc/apt/sources.list.d/ceph.sources` 也替换成清华源

/etc/apt/sources.list.d/ceph.sources



```bash
Types: deb
URIs: https://mirrors.tuna.tsinghua.edu.cn/proxmox/debian/ceph-squid
Suites: trixie
Components: no-subscription
Signed-By: /usr/share/keyrings/proxmox-archive-keyring.gpg
```

### 无订阅源 [​](#无订阅源)

在 `/etc/apt/sources.list.d` 目录下创建 `pve-no-subscription.sources` 文件，填上以下内容

/etc/apt/sources.list.d/pve-no-subscription.sources



```bash
Types: deb
URIs: https://mirrors.tuna.tsinghua.edu.cn/proxmox/debian/pve
Suites: trixie
Components: pve-no-subscription
Signed-By: /usr/share/keyrings/proxmox-archive-keyring.gpg
```

### CT 模板源 [​](#ct-模板源)

如果你需要用到 PVE 中的 LXC 容器，那么还需要替换一下 CT 模板源，否则下载模板会非常的慢

将 `/usr/share/perl5/PVE/APLInfo.pm` 文件中默认的源地址 `http://download.proxmox.com` 替换为

```bash
https://mirrors.tuna.tsinghua.edu.cn/proxmox
```

可以使用如下命令修改，重启后生效



```bash
cp /usr/share/perl5/PVE/APLInfo.pm /usr/share/perl5/PVE/APLInfo.pm_back
sed -i 's|http://download.proxmox.com|https://mirrors.tuna.tsinghua.edu.cn/proxmox|g' /usr/share/perl5/PVE/APLInfo.pm
```

### 删除订阅弹窗 [​](#删除订阅弹窗)

尽管我们使用的 PVE 是免费版，但如果你没有订阅，每次访问网页时，都会有一个“无有效订阅”的弹窗

![订阅弹窗](https://s3.zhichao.org/images/pve-installation-subscription-pop-up.webp)

订阅弹窗

弹窗代码在 `/usr/share/javascript/proxmox-widget-toolkit/proxmoxlib.js` 中，通过 `void({...})` 可以让弹窗部分代码不执行，实现删除弹窗的效果。

因此，直接执行以下命令即可实现删除订阅弹窗



```bash
sed -Ezi.bak "s/(Ext.Msg.show\(\{\s+title: gettext\('No valid sub)/void\(\{ \/\/\1/g" /usr/share/javascript/proxmox-widget-toolkit/proxmoxlib.js && systemctl restart pveproxy.service
```

## 硬盘 [​](#硬盘)

### 合并 local 与 local-lvm [​](#合并-local-与-local-lvm)

提示

1.  只建议**系统盘比较小的**这么操作，**系统盘大的**的建议保持默认！
2.  由于我的傲腾系统盘太小，PVE 安装程序跳过了创建 `local-lvm`，因此以下内容未进行实操验证，**仅供参考**

![跳过创建 local-lvm](https://s3.zhichao.org/images/pve-installation-local-lvm.webp)

跳过创建 local-lvm

PVE 安装过程中会自动创建 `local` 和 `local-lvm`，如果你的系统盘不够大，可能会出现一个用满了，另一个却比较空的情况，提前将两者合并就可以避免出现这种尴尬的情况。

1.  删除 `local-lvm` 分区



```bash
lvremove /dev/pve/data
```

2.  扩容 local



```bash
lvextend -l +100%FREE /dev/pve/root
```

3.  扩展文件系统



```bash
resize2fs /dev/pve/root
```

4.  在 Web UI 上删除 local-lvm，然后编辑 local 勾选所有内容

### 删除 Swap 分配给主分区 [​](#删除-swap-分配给主分区)

提示

只建议**系统盘特别小的**这么操作，**系统盘大的**的建议保持默认！

PVE 安装后默认会根据硬盘大小分配 Swap，但我的系统盘是 16G 的傲腾，本身就已经寸土寸金了，再加上 G4560 配上 16G 内存也基本够用了。如果把默认分配的 1G Swap 删除，重新分配给系统分区的话，更加宽裕一些。

1.  关闭 Swap



```bash
swapoff /dev/mapper/pve-swap
```

2.  编辑 `/etc/fstab`，注释掉 Swap 挂载行



```markdown
# /dev/pve/swap none swap sw 0 0
```

3.  删除 swap 的 LVM 卷



```bash
lvremove /dev/pve/swap
```

4.  扩展 `pve-root` 卷到全部剩余空间



```bash
lvextend -l +100%FREE /dev/mapper/pve-root
```

5.  扩展文件系统



```bash
resize2fs /dev/mapper/pve-root
```

### 添加硬盘 [​](#添加硬盘)

如果想给 PVE 添加硬盘，首先需要将硬盘挂载到 PVE 上，然后再在 Web UI 中添加**存储**。其中挂载到 PVE 的步骤与常规 Debian 挂载硬盘相同，不了解的可以参考[《Linux 挂载磁盘的两种方式》](https://zhichao.org/posts/a1207e)

完成挂载后，来到 `数据中心 -> 存储 -> 添加 -> 目录` 填写上 ID 和挂载的目录，内容勾选所有选项，最后点击添加即可

![添加硬盘](https://s3.zhichao.org/images/pve-installation-add-drive.webp)

添加硬盘

## 网络 [​](#网络)

### DHCP [​](#dhcp)

如果你的网络环境经常变动，则可以将静态 IP 修改为 DHCP，通过 DHCP 分配 IP，方便网络变动后连接 PVE 设备

安装 `isc-dhcp-client`



```bash
apt install isc-dhcp-client
```

编辑 `/etc/network/interfaces`，将 `static` 修改为 `dhcp`，然后将地址和网关删除

/etc/network/interfaces


```diff
auto lo
iface lo inet loopback

iface enp4s0 inet manual

auto vmbr0
iface vmbr0 inet dhcp
iface vmbr0 inet static
        address 10.0.0.10/24
        gateway 10.0.0.1
        bridge-ports enp4s0
        bridge-stp off
        bridge-fd 0

source /etc/network/interfaces.d/*
```

### SLAAC [​](#slaac)

之前一直想给 PVE 添加 IPv6 地址，但通过下面这行代码获取的 IPv6 会同时启用 SLAAC 和 DHCPv6，总会遇到一些奇奇怪怪的**问题**。



```bash
iface vmbr0 inet6 auto
```

后面发现可以直接在 `/etc/network/interfaces` 中添加下面这行代码，来启用 SLAAC 获取 IPv6 地址，目前使用下来还没遇到过问题。



```bash
post-up echo "2" > /proc/sys/net/ipv6/conf/vmbr0/accept_ra
```

完整配置如下：

/etc/network/interfaces



```diff
auto lo
iface lo inet loopback

iface enp3s0 inet manual

auto vmbr0
iface vmbr0 inet dhcp
        bridge-ports enp3s0
        bridge-stp off
        bridge-fd 0
        post-up echo "2" > /proc/sys/net/ipv6/conf/vmbr0/accept_ra

source /etc/network/interfaces.d/*
```

接着重启一下网络，过一小会应该就能获取到 IPv6 了



```bash
systemctl restart networking
```

### 网卡灯不亮（无网络） [​](#网卡灯不亮-无网络)

常见于移除/更换了 PCI-E 设备，比如显卡、 M.2 硬盘，我是在装完系统后**拔下显卡**后出现的问题，主要原因是拔下显卡后，网卡的编号发生了改变，而 PVE 的网络配置却不会跟着改变。

查看 `/etc/network/interfaces` 可以看到，网卡为 `enp4s0`，而通过 `ip a` 查看，此时的网卡已经变为了 `enp3s0`，只需要将两处 `enp4s0` 修改为 `enp3s0`

/etc/network/interfaces



```diff
auto lo
iface lo inet loopback

iface enp4s0 inet manual
iface enp3s0 inet manual

auto vmbr0
iface vmbr0 inet dhcp
        bridge-ports enp4s0
        bridge-ports enp3s0
        bridge-stp off
        bridge-fd 0

source /etc/network/interfaces.d/*
```

然后重启一下网络，就可以恢复了



```bash
systemctl restart networking
```

如果你经常新增/减少 PCI-E 设备，可以考虑将网卡命名修改回传统名称，详见下方[修改网卡名](#修改网卡名)

### 修改网卡名 [​](#修改网卡名)

要想将网卡修改回 `eth0` 这样的传统名称，只需要编辑启动参数，在 `/etc/default/grub` 配置中加上 `net.ifnames=0 biosdevname=0`

/etc/default/grub



```diff
# If you change this file, run 'update-grub' afterwards to update
# /boot/grub/grub.cfg.
# For full documentation of the options in this file, see:
#   info -f grub -n 'Simple configuration'

GRUB_DEFAULT=0
GRUB_TIMEOUT=5
GRUB_DISTRIBUTOR=`lsb_release -i -s 2> /dev/null || echo Debian`
GRUB_CMDLINE_LINUX_DEFAULT="quiet"
GRUB_CMDLINE_LINUX_DEFAULT="quiet net.ifnames=0 biosdevname=0"
GRUB_CMDLINE_LINUX=""
```

然后更新 grub 后重启，网卡名就会变成传统的 `eth0`、`eth1`



```bash
update-grub
```

**重启前**，别忘了把 `/etc/network/interfaces` 中的网卡名也修改成 `eth0`，否则会断网

/etc/network/interfaces



```diff
auto lo
iface lo inet loopback

iface enp4s0 inet manual
iface eth0 inet manual

auto vmbr0
iface vmbr0 inet dhcp
        bridge-ports enp4s0
        bridge-ports eth0
        bridge-stp off
        bridge-fd 0

source /etc/network/interfaces.d/*
```

## 网络唤醒 WOL [​](#网络唤醒-wol)

提示

需要在 BIOS 中开启 PCI-E 唤醒

默认情况下，PVE 的网络唤醒是禁用的，需要手动打开才可以网络唤醒。

### 开启 WOL [​](#开启-wol)

1.  安装 ethtool 工具



```bash
apt install ethtool
```

2.  查看网卡名称 `ip a`
3.  查看网卡信息



```bash
ethtool eth0
```

4.  观察 `Supports Wake-on` 与 `Wake-on`

提示

`supports wake-on` 判断该网卡是否支持 WOL 唤醒，若值为 pumbg 则表示支持 WOL

`Wake-on` 值为 d 则表示 WOL 禁用状态，g 则为开启，PVE 默认为 d


```bash
Settings for eth0:
        Supported ports: [ TP    MII ]
        Supported link modes:   10baseT/Half 10baseT/Full
                                100baseT/Half 100baseT/Full
                                1000baseT/Full
        Supported pause frame use: Symmetric Receive-only
        Supports auto-negotiation: Yes
        Supported FEC modes: Not reported
        Advertised link modes:  10baseT/Half 10baseT/Full
                                100baseT/Half 100baseT/Full
                                1000baseT/Full
        Advertised pause frame use: Symmetric Receive-only
        Advertised auto-negotiation: Yes
        Advertised FEC modes: Not reported
        Link partner advertised link modes:  10baseT/Half 10baseT/Full
                                             100baseT/Half 100baseT/Full
                                             1000baseT/Half 1000baseT/Full
        Link partner advertised pause frame use: Symmetric Receive-only
        Link partner advertised auto-negotiation: Yes
        Link partner advertised FEC modes: Not reported
        Speed: 1000Mb/s
        Duplex: Full
        Auto-negotiation: on
        master-slave cfg: preferred slave
        master-slave status: slave
        Port: Twisted Pair
        PHYAD: 0
        Transceiver: external
        MDI-X: Unknown
        Supports Wake-on: pumbg
        Wake-on: d
        Current message level: 0x0000003f (63)
                               drv probe link timer ifdown ifup
        Link detected: yes
```

5.  开启 WOL 网络唤醒



```bash
ethtool -s eth0 wol g
```

### 开机运行 [​](#开机运行)

由于每次开机时，`Wake-on` 的值都会重置为 d，因此需要在开机时自动运行开启 WOL 的命令

1.  编辑 `/etc/rc.local` 文件



```bash
#!/bin/bash
ethtool -s eth0 wol g

exit 0
```

2.  赋予运行权限



```bash
chmod +x /etc/rc.local
```

3.  重启并按上一步骤查看 `Wake-on` 是否自动在开机时自动修改为 g 即可