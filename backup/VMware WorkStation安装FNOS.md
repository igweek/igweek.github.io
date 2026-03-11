##  VMware WorkStation安装FNOS（nas）指南

实验背景：

在当今数字化时代，个人和企业对数据存储和管理的需求日益增长。网络附加存储（NAS）作为一种高效、便捷的存储解决方案，受到了广泛关注。FNOS（飞牛操作系统）作为一种专为NAS设计的操作系统，以其强大的功能和易用性脱颖而出。而VMware WorkStation作为一款功能强大的虚拟化软件，为用户提供了在个人电脑上创建和管理虚拟机的便利。本文将详细介绍如何在VMware WorkStation上安装FNOS，帮助用户搭建一个高效、可靠的NAS环境，满足数据存储和共享的需求。通过本文你能够轻松掌握在VMware WorkStation上安装FNOS的全过程。

## 一、准备工作

+   安装VMware WorkStation：自行搜索安装教程，安装完成后，确保其正常运行。
    
+   下载FNOS镜像：
    

+   访问飞牛私有云官网：fnnas.com

    

## 二、创建虚拟机

打开VMware Workstation，点击“创建新的虚拟机”。

![](https://zblog.hqyman.cn/zb_users/upload/2026/02/03/20260203160051_71226.png)

兼容性可以自行选择

![](https://zblog.hqyman.cn/zb_users/upload/2026/02/03/20260203160051_93951.png)

找到fnos镜像

![](https://zblog.hqyman.cn/zb_users/upload/2026/02/03/20260203160052_23873.png)

操作系统选择linux，版本选择Debin10.x 64或者Debin10.x。

![](https://zblog.hqyman.cn/zb_users/upload/2026/02/03/20260203160052_25373.png)

选择安装位置，以及给虚拟机命名。

![](https://zblog.hqyman.cn/zb_users/upload/2026/02/03/20260203160052_83197.png)

处理按需处理就行。

![](https://zblog.hqyman.cn/zb_users/upload/2026/02/03/20260203160052_24035.png)

内存按需处理，不要太小，建议2g以上。


网络部分选择nat，也可以桥接


I/O选择推荐的就行

![](https://zblog.hqyman.cn/zb_users/upload/2026/02/03/20260203160052_64448.png)

虚拟磁盘也选择推荐的就行

![](https://zblog.hqyman.cn/zb_users/upload/2026/02/03/20260203160053_43913.png)

磁盘选择创建新的磁盘

![](https://zblog.hqyman.cn/zb_users/upload/2026/02/03/20260203160053_82225.png)

磁盘大小建议大家100g起步，当然想体验一下就随机给。因为系统官方推荐是64g左右，加上数据服务差不多100g左右了。

![](https://zblog.hqyman.cn/zb_users/upload/2026/02/03/20260203160053_37087.png)

下一步

![](https://zblog.hqyman.cn/zb_users/upload/2026/02/03/20260203160053_32970.png)

没问题就完成即可

![](https://zblog.hqyman.cn/zb_users/upload/2026/02/03/20260203160053_75589.png)

## 三、飞牛os安装

开启虚拟机

![](https://zblog.hqyman.cn/zb_users/upload/2026/02/03/20260203160053_11708.png)

安装系统

![](https://zblog.hqyman.cn/zb_users/upload/2026/02/03/20260203160053_56185.png)

到达下面那个页面，直接下一步

![](https://zblog.hqyman.cn/zb_users/upload/2026/02/03/20260203160053_55801.png)

飞牛系统的系统分区，最小为8G.

![](https://zblog.hqyman.cn/zb_users/upload/2026/02/03/20260203160053_40963.png)

然后选择确认即可

![](https://zblog.hqyman.cn/zb_users/upload/2026/02/03/20260203160053_27798.png)

然后安装

![](https://zblog.hqyman.cn/zb_users/upload/2026/02/03/20260203160053_17113.png)

安装完成后，就会出现网络配置，DHCP分配即可，保存就行。

![](https://zblog.hqyman.cn/zb_users/upload/2026/02/03/20260203160054_40544.png)

然后确定

![](https://zblog.hqyman.cn/zb_users/upload/2026/02/03/20260203160054_88006.png)

然后点击

![](https://zblog.hqyman.cn/zb_users/upload/2026/02/03/20260203160054_82157.png)

断开连接，选择是

![](https://zblog.hqyman.cn/zb_users/upload/2026/02/03/20260203160054_60279.png)

打开浏览器访问下面地址 ,http://192.168.6.36:5666
刚开始应该是开启NAS之旅，忘记截图，直接跳过无伤大雅，然后自己按照要求注册，进行登录即可
## 至此安装完毕。
