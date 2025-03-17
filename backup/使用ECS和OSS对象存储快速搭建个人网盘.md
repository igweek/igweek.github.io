1. 选择实验资源

本实验支持实验资源体验、开通免费试用、个人账户资源三种实验资源方式。

在实验开始前，请您选择其中一种实验资源，单击确认开启实验。

![](https://ucc.alicdn.com/pic/developer-ecology/ymx73xcooyslq_bab251dd5f15411985dfbf31eab8f62c.png)

- 如果您选择的是实验资源体验，资源创建过程需要3～5分钟（视资源不同开通时间有所差异，ACK等资源开通时间较长）。完成实验资源的创建后，在实验室页面左侧导航栏中，单击云产品资源列表，可查看本次实验资源相关信息（例如子用户名称、子用户密码、AK ID、AK Secret、资源中的项目名称等）。
    

说明：实验环境一旦开始创建则进入计时阶段，建议学员先基本了解实验具体的步骤、目的，真正开始做实验时再进行创建。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_f3e5ba68d71542458ce06d30dfa2f0bc.png)

- 如果您选择的是开通免费试用，下方卡片会展示本实验支持的试用规格，可以选择你要试用的云产品资源进行开通。您在实验过程中，可以随时用右下角icon唤起试用卡片。
    

说明：试用云产品开通在您的个人账号下，并占用您的试用权益。如试用超出免费试用额度，可能会产生一定费用。

阿里云支持试用的产品列表、权益及具体规则说明请参考[开发者试用中心](https://free.aliyun.com/)。

![](https://ucc.alicdn.com/pic/developer-ecology/o23ywodss4pji_3eb1c4cf59424b4a904ee718f362d6b7.png)

2. 领取免费试用资源

说明：

- 试用云产品开通在您的个人账号下，并占用您的试用权益。如试用超出免费试用额度，可能会产生一定费用。阿里云支持试用的产品列表、权益及具体规则说明请参考[开发者试用中心](https://free.aliyun.com/)。
    
- 如果您的阿里云账号只能领取部分免费试用产品，请您领取符合免费试用资格的产品，然后进入实验，不满足免费试用资格的产品将会使用个人账户资源进行创建，并会产生一定的费用，请您及时关注账户扣费。
    

1. 在实验开始前，请您选择开通免费试用。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_521214f4df8745e6b1629de96ca768e0.png)

2. 开通对象存储OSS免费试用。
    

2.1 在实验室页面下方，选择对象存储OSS，单击立即试用。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_b6941b6f3a934ac3a98d4543ce7cc9cf.png)

2.2 在对象存储OSS面板，选中服务协议，然后单击立即试用，如弹出新的页面，您可先忽略。

3. 开通云服务器ECS免费试用。
    

3.1 在实验室页面下方，选择云服务器ECS，单击立即试用。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_a1d7d5f384204508b9f789f951d2ea59.png)

3.2 在云服务器ECS面板，其中地域选择华东1（杭州），操作系统选择CentOS 7.9 64位，其他配置保持默认即可，选中协议，单击立即试用，如弹出新的页面，您可先忽略。

3.3 前往[ECS控制台](https://ecs.console.aliyun.com/)，在左侧导航栏，选择实例与镜像 > 实例。

3.4 在顶部菜单栏左上角处，选择和试用实例相同的地域（本教程示例华东1（杭州））。

3.5 设置该实例登录密码。找到您创建的试用实例，在其右侧操作列单击 ![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_458533adb92b4ca8a3f5599337b312bb.png)> 实例属性 > 重置实例密码，按照界面提示设置ECS实例的登录密码。

实例创建完成大约3~5分钟后，才支持重置实例密码，如不可重置请耐心等待后重试。

3.6 单击试用实例的ID，选择安全组页签，单击安全组操作列的配置规则，在入方向添加需要放行的端口。本教程中，在安全组入方向放行80、443、22、3389、5212端口。

4. 领取完免费试用后，返回资源领取界面，单击我已开通，进入实验。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_3d68f2d586e842eea28f5e3a2f6d8be4.png)

3. 创建资源

4. 创建对象存储OSS。
    

说明：

- 如果您选择的免费试用，并且在上一步骤中领取了对象存储OSS的免费试用，请您根据如下操作，创建Bucket。
    
- 如果您选择的免费试用，但是您的阿里云主账号没有资格领取对象存储OSS的免费试用，请您根据如下操作，创建Bucket，并且会产生一定的费用，详情请参考[计费概述](https://help.aliyun.com/document_detail/59636.html)。
    
- 如果您选择的个人资源，请您根据如下操作，创建Bucket，并且会产生一定的费用，详情请参考[计费概述](https://help.aliyun.com/document_detail/59636.html)。
    

1.1 前往[对象存储OSS控制台](https://oss.console.aliyun.com/home)，在左侧导航栏中，单击Bucket列表。

1.2 在Bucket列表页面，单击创建Bucket。

1.3 在创建Bucket面板，参考如下说明配置Bucket，未提及的配置保持默认选项，然后单击确定。

|   |   |   |
|---|---|---|
|配置项|示例|说明|
|Bucket名称|自定义Bucket名称|自定义Bucket名称。|
|地域|华东1（杭州）|选择与云服务器ECS相同的地域|

2. 创建云服务器ECS。
    

说明：

- 如果您选择的免费试用，并且在上一步骤中领取了云服务器ECS的免费试用，后台会自动为您创建一台云服务器ECS实例，请您跳过本步骤，直接进行下一小节操作。
    
- 如果您选择的免费试用，但是您的阿里云主账号没有资格领取云服务器ECS的免费试用，请您根据如下操作，创建云服务器ECS，并且会产生一定的费用，详情请参考[计费概述](https://help.aliyun.com/document_detail/25398.html)。
    
- 如果您选择的个人资源，请您根据如下操作，创建云服务器ECS，并且会产生一定的费用，详情请参考[计费概述](https://help.aliyun.com/document_detail/25398.html)。
    

2.1 前往[云服务器ECS控制台](https://ecs.console.aliyun.com/home)，在概览页面的我的资源区域，单击创建实例。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_b2fbfdcb2960403081fdb8984c5d83cb.png)

2.2 在云服务器购买页面，参考如下说明配置参数，未提及的配置保持默认或按需修改，然后选中右侧的《云服务器ECS服务条款》，单击确认下单。

说明：本试用教程以下列的配置信息为例，实际操作时，建议根据您的实际业务体量和需求选择。

参数说明：

|   |   |   |
|---|---|---|
|配置项|示例|说明|
|地域|地域：华东1（杭州）|实例创建后，无法直接更改地域和可用区，请谨慎选择。|
|网络及可用区|选择合适的专有网络和交换机，如果您要创建专有网络和交换机，请单击下方的前往控制台创建。|推荐您使用专有网络，专有网络之间逻辑上彻底隔离，安全性更高，且支持弹性公网IP（EIP）、弹性网卡、IPv6等功能。<br><br>可用区是指在同一地域内，电力和网络互相独立的物理区域。同一可用区内实例之间的网络延时更小，其用户访问速度更快。|
|实例|规格族：共享标准型 s6<br><br>实例规格：ecs.s6-c1m1.small|您可以前往[ECS实例可购买地域](https://ecs-buy.aliyun.com/instanceTypes/#/instanceTypeByRegion)，查看实例在各地域的可购情况。|
|镜像|公共镜像 CentOS 7.9 64位。|实例启动后，系统盘将完整复制镜像的操作系统和应用数据。|
|公网IP|选中分配公网IPv4地址|选中后，自动分配一个公网IPv4地址。|
|带宽计费模式|按使用流量|按使用流量模式只需为所消耗的公网流量付费。详情请参见[公网带宽计费](https://help.aliyun.com/document_detail/25411.htm#publicIP-china)。|
|带宽峰值|5 Mbps|无。|
|安全组|选择合适的安全组或新建安全组。|选择您的安全组，需要开通80、443、22、3389、5212端口。如果您需要创建安全组，请单击下方的新建安全组。|
|登录凭证|自定义密码|本教程中选择自定义密码，并手动设置一个密码，用于远程连接并登录ECS实例。|
|登录密码|Ecs123456|当登录凭证选择自定义密码时，需要设置此选项并确认密码，在后续连接ECS实例时，您需要输入用户名root和此处设置的密码。|

2.3 在创建成功对话框中，单击管理控制台。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_9797bc69d3c2464fa04b1c67664db235.png)

2.4 在实例页面，等待状态变为运行中后，即可使用该云服务器ECS，然后单击实例ID。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_945c1cae5a444ede99205c1a0be2c049.png)

2.5 在实例详情页面，单击安全组。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_7cdba5a80d974e30b168a70e0f388e4a.png)

2.6 在安全组页面， 单击安全组操作列的配置规则。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_646dfe5d48e8440291da660520a478f2.png)

2.7 在访问规则页面，在入方向添加需要放行的端口。本教程中，在安全组入方向放行80、443、22、3389、5212端口。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_b2daa9baf1d5414f908a6fc73ce76f7e.png)

4. 安装Cloudreve

5. 在实验室页面右侧功能栏中，单击![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_0c0454613fd447d0bc17b6af4308bec6.png) 图标，切换至Web Terminal，即可自动连接到实验室提供的ECS服务器。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_7fe06541ffc74bc99c3a904c3818cdbf.png)

2. 执行如下命令，下载cloudreve安装包。
    

```
wget https://labfileapp.oss-cn-hangzhou.aliyuncs.com/cloudreve_3.3.1_linux_amd64.tar.gz
```

3. 下载完毕后，执行如下命令，解压cloudreve安装包。
    

```
tar -zxvf cloudreve_3.3.1_linux_amd64.tar.gz
```

4. 执行如下命令，给cloudreve授予权限。
    

```
chmod +x ./cloudreve
```

5. 执行如下命令，运行cloudreve。
    

```
./cloudreve
```

返回结果如下所示，您可以看到管理员账号和密码。

![](https://img.alicdn.com/imgextra/i4/O1CN01wqFYX01zJtxH10PND_!!6000000006694-2-tps-572-364.png)

6. 打开浏览器，访问http://<ECS公网地址>:5212，依次输入管理员账号和密码，单击登录。
    

说明：您可在实验室页面左侧的云产品资源列表中查看ECS公网地址。访问时，请您去掉链接中的<>。

![](https://img.alicdn.com/imgextra/i1/O1CN01yaeSXB1UPAQBdHIjY_!!6000000002509-2-tps-1905-611.png)

登录成功界面如下。

![](https://img.alicdn.com/imgextra/i3/O1CN016bmn1e1UirRvIK0GH_!!6000000002552-2-tps-1920-877.png)

7. 在终端中按下Ctrl+C键，停止cloudreve运行。

8. 安装Cloudreve

9. 在实验室页面左侧，单击![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_2601a00fbe7b4f779ca73bb07914040a.png) 图标，切换至Web Terminal。
    

输入ECS登录的用户名和密码进行登录。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_c0b76cd8a69c4f1cbe6ed53b40ee21aa.png)

2. 执行如下命令，下载cloudreve安装包。
    

```
wget https://labfileapp.oss-cn-hangzhou.aliyuncs.com/cloudreve_3.3.1_linux_amd64.tar.gz
```

3. 下载完毕后，执行如下命令，解压cloudreve安装包。
    

```
tar -zxvf cloudreve_3.3.1_linux_amd64.tar.gz
```

4. 执行如下命令，给cloudreve授予权限。
    

```
chmod +x ./cloudreve
```

5. 执行如下命令，运行cloudreve。
    

```
./cloudreve
```

返回结果如下所示，您可以看到管理员账号和密码。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_1541fe12d3b54e71905183f7a3859536.png)

6. 在您的本机浏览器中，打开新页签，访问http://<ECS公网地址>:5212，依次输入管理员账号和密码，单击登录。
    

说明：

- 前往[云服务器ECS控制台](https://ecs.console.aliyun.com/server/region/cn-hangzhou)，在实例页面，在页面顶部切换到资源所在地域，找到您的云服务器ECS，并查看ECS公网地址。
    
- 在进行访问时，请您去掉链接中的<>。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_1748b9d8cee74c33803209e050bd660d.png)

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_38f19338d4bd41adaa150f56f0582113.png)

登录成功界面如下。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_e81adf5373cc4589a5338ca3d022bd6b.png)

7. 在终端中按下Ctrl+C键，停止cloudreve运行。

8. 安装ossfs

ossfs能让您在Linux系统中，将对象存储OSS的存储空间（Bucket）挂载到本地文件系统中，您能够像操作本地文件一样操作OSS的对象（Object），实现数据的共享。

1. 执行如下命令，下载ossfs安装包。

```
wget https://gosspublic.alicdn.com/ossfs/ossfs_1.80.6_centos8.0_x86_64.rpm
```

2. 下载完毕后，执行如下命令，安装ossfs。

2.1 先更换yum源（Centos8 yum 官方源下线）

```
#1.先删除系统内过期的.repo文件
rm -f /etc/yum.repos.d/*

#2.下载新的 CentOS-Base.repo 到 /etc/yum.repos.d/
wget -O /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-vault-8.5.2111.repo

#3.运行 yum makecache 生成缓存
yum clean all && yum makecache
```

2.2 安装ossfs

```
yum install -y ./ossfs_1.80.6_centos8.0_x86_64.rpm
```

返回结果如下所示，表示ossfs安装成功。

![](https://img.alicdn.com/imgextra/i1/O1CN01gXd5B323Mt03z1wmZ_!!6000000007242-2-tps-997-347.png)

3. 执行如下命令，配置账号访问信息，将Bucket名称以及具有此Bucket访问权限的AccessKey ID和AccessKey Secret信息存放在/etc/passwd-ossfs文件中。

说明：您需要将命令中的BucketName、yourAccessKeyId和yourAccessKeySecret替换成实验室提供的Bucket名称、AccessKey ID和AccessKey Secret。

```
echo BucketName:yourAccessKeyId:yourAccessKeySecret > /etc/passwd-ossfs
```

参数说明：

- BucketName：阿里云OSS控制台中创建的bucket名称，可在云产品资源列表中查看。
    
- yourAccessKeyId：具有此Bucket访问权限的AccessKey ID，可在云产品资源列表中查看。
    
- yourAccessKeySecret：具有此Bucket访问权限的AccessKey Secret，可在云产品资源列表中查看。
    

图a：OSSbucket名称

![](https://ucc.alicdn.com/pic/developer-ecology/b684a38d313a45a2b98bca6d6ad61990.png)

图b：AccessKey ID信息

![](https://img.alicdn.com/imgextra/i4/O1CN01hYQI9M1qnMtWAclNV_!!6000000005540-2-tps-497-283.png)

4. 执行如下命令，给passwd-ossfs文件授予权限。

```
chmod 640 /etc/passwd-ossfs
```

7. 安装ossfs

ossfs能让您在Linux系统中，将对象存储OSS的存储空间（Bucket）挂载到本地文件系统中，您能够像操作本地文件一样操作OSS的对象（Object），实现数据的共享。

1. 执行如下命令，下载ossfs安装包。
    

```
wget https://gosspublic.alicdn.com/ossfs/ossfs_1.80.7_centos7.0_x86_64.rpm
```

2. 执行如下命令，安装ossfs
    

```
yum install -y ./ossfs_1.80.7_centos7.0_x86_64.rpm
```

返回结果如下所示，表示ossfs安装成功。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_dc0bc768eab74d4ea49d050bcccdcad7.png)

3. 执行如下命令，配置账号访问信息，将Bucket名称以及具有此Bucket访问权限的AccessKey ID和AccessKey Secret信息存放在/etc/passwd-ossfs文件中。

说明：您需要将命令中的BucketName、yourAccessKeyId和yourAccessKeySecret替换成您创建的Bucket名称、主账号的AccessKey ID和主账号的AccessKey Secret。

```
echo BucketName:yourAccessKeyId:yourAccessKeySecret > /etc/passwd-ossfs
```

参数说明：

- BucketName：您在对象存储OSS控制台中创建的bucket名称，可在对象存储OSS控制台>Bucket列表中查看。
    
- yourAccessKeyId：具有此Bucket访问权限的AccessKey ID，可在[安全信息管理](https://usercenter.console.aliyun.com/manage/ak#/manage/ak)页面查看您主账号的AccessKey ID和AccessKey Secret。
    
- yourAccessKeySecret：具有此Bucket访问权限的AccessKey Secret，可在[安全信息管理](https://usercenter.console.aliyun.com/manage/ak#/manage/ak)页面查看您主账号的AccessKey ID和AccessKey Secret。
    

图a：OSSbucket名称

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_e49f24ac85ca495d993a6f38f28546b8.png)

图b：AccessKey ID信息

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_53a72444b1054b6aa484c27d4b4df52b.png)

4. 执行如下命令，给passwd-ossfs文件授予权限。

```
chmod 640 /etc/passwd-ossfs
```

8. 挂载OSS

9. 在终端中，执行如下命令，创建一个名为oss文件夹。
    

```
mkdir oss
```

2. 执行如下命令，将Bucket挂载到指定目录oss，您需要将命令中的BucketName、mountfolder和Endpoint替换成实验室提供的bucket名称、创建的oss文件夹和OSS的内网Endpoint。
    

```
ossfs BucketName mountfolder -o url=Endpoint
```

例如：ossfs adc-oss-labsxxxx oss -o url=oss-cn-shanghai-internal.aliyuncs.com

参数说明：

- BucketName：阿里云OSS控制台中创建的bucket名称，可在云产品资源列表中查看。
    
- mountfolder：上一步创建的挂载文件夹（本实验为oss）。
    
- Endpoint：OSS的ECS的经典网络访问（内网）的Endpoint，可在云产品资源列表中查看。。
    

![](https://ucc.alicdn.com/pic/developer-ecology/0ea2b0b25a6941f581d561140ea6e9a6.png)

3. 查看是否挂载成功。
    

```
df -h
```

返回结果如下，表示挂载成功。

![](https://img.alicdn.com/imgextra/i4/O1CN01NsOmSP1IIxfDqVJjx_!!6000000000871-2-tps-465-158.png)

4. 执行如下命令，在/etc/init.d/目录下建立文件ossfs，设置开机自动启动脚本进行OSS挂载。
    

```
vim /etc/init.d/ossfs
```

进入Vim编辑器后，按下i键进入编辑模式，添加以下内容，添加完成后按下Esc键退出编辑模式，最后输入:wq后按下Enter键，保存并退出Vim编辑器。

注意：您需要将脚本中的BucketName、mountfolder和Endpoint替换成实验室提供的bucket名称、创建的oss文件夹和OSS的内网Endpoint。

```
#! /bin/bash
#
# ossfs      Automount Aliyun OSS Bucket in the specified direcotry.
#
# chkconfig: 2345 90 10
# description: Activates/Deactivates ossfs configured to start at boot time.

ossfs BucketName mountfolder -o url=Endpoint -oallow_other
```

添加后的文件内容如下所示。

![](https://img.alicdn.com/imgextra/i4/O1CN01RpjuAV1M2Fg3wp90l_!!6000000001376-2-tps-758-202.png)

5. 执行如下命令，为新建立的ossfs脚本赋予可执行权限。

```
chmod a+x /etc/init.d/ossfs
```

6. 执行如下命令，把ossfs启动脚本作为其他服务，开机自动启动。

```
chkconfig ossfs on
```

9. 挂载OSS

10. 在终端中，执行如下命令，创建一个名为oss文件夹。
    

```
mkdir oss
```

2. 执行如下命令，将Bucket挂载到指定目录oss，您需要将命令中的BucketName、mountfolder和Endpoint替换您创建的bucket名称、创建的oss文件夹和OSS的内网Endpoint。
    

```
ossfs BucketName mountfolder -o url=Endpoint
```

例如：ossfs adc-oss-labsxxxx oss -o url=oss-cn-hangzhou-internal.aliyuncs.com

参数说明：

- BucketName：您在对象存储OSS控制台中创建的bucket名称，可在对象存储OSS控制台>Bucket列表中查看。
    
- mountfolder：上一步创建的挂载文件夹（本实验为oss）。
    
- Endpoint：OSS的内网Endpoint，详情请参考[访问域名和数据中心](https://help.aliyun.com/document_detail/31837.html)。如果您的OSS地域为杭州，其中内网Endpoint为oss-cn-hangzhou-internal.aliyuncs.com。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_6348901bc3f44738a7dae10efe5770da.png)

3. 查看是否挂载成功。
    

```
df -h
```

返回结果如下，表示挂载成功。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_c30e58380cc5453ead7e1641cec01395.png)

4. 执行如下命令，在/etc/init.d/目录下建立文件ossfs，设置开机自动启动脚本进行OSS挂载。
    

```
vim /etc/init.d/ossfs
```

进入Vim编辑器后，按下i键进入编辑模式，添加以下内容，添加完成后按下Esc键退出编辑模式，最后输入:wq后按下Enter键，保存并退出Vim编辑器。

注意：您需要将脚本中的BucketName、mountfolder和Endpoint替换成您创建的bucket名称、创建的oss文件夹和OSS的内网Endpoint。

```
#! /bin/bash
#
# ossfs      Automount Aliyun OSS Bucket in the specified direcotry.
#
# chkconfig: 2345 90 10
# description: Activates/Deactivates ossfs configured to start at boot time.

ossfs BucketName mountfolder -o url=Endpoint -oallow_other
```

添加后的文件内容如下所示。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_df11acf27b2249dfb355b301f222455a.png)

5. 执行如下命令，为新建立的ossfs脚本赋予可执行权限。

```
chmod a+x /etc/init.d/ossfs
```

6. 执行如下命令，把ossfs启动脚本作为其他服务，开机自动启动。

```
chkconfig ossfs on
```

10. 配置个人网盘

11. 执行如下命令，运行cloudreve。
    

```
./cloudreve
```

2. 打开浏览器，访问http://<ECS公网地址>:5212，依次输入管理员账号和密码，单击登录。
    

说明：您可在云产品资源列表中查看ECS公网地址。在进行访问时，请您去掉链接中的<>。

3. 在cloudreve主界面右上角，单击管理面板。
    

![](https://img.alicdn.com/imgextra/i4/O1CN019w3yDp1cMQyvphfLl_!!6000000003586-2-tps-393-362.png)

4. 在确定站点URL设置对话框中，单击更改。
    

![](https://img.alicdn.com/imgextra/i1/O1CN01zUlrub1McQxzcqsWr_!!6000000001455-2-tps-651-283.png)

5. 在左侧导航栏中，单击存储策略。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_541e428002414ea6a82d2b5240228970.png)

6. 在存储策略页面，单击添加存储策略。
    

![](https://img.alicdn.com/imgextra/i1/O1CN01MfmgYY1vQ4pgKRoay_!!6000000006166-2-tps-1900-508.png)

7. 在选择存储方式对话框中，选择本机存储。
    

![](https://img.alicdn.com/imgextra/i1/O1CN01CI1BFd1cwcGxnPwzu_!!6000000003665-2-tps-587-443.png)

8. 在添加本机存储策略的上传路径页面中，将存储目录修改为oss/Object路径/{uid}/{path}，单击下一步。
    

说明：Object路径可在云产品资源列表中查看。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_fd494fed553c4aacb92e66fc23a2aa5c.png)

![](https://ucc.alicdn.com/pic/developer-ecology/e6714867172a4f189358e901f1d28f61.png)

9. 在添加本机存储策略的直链设置页面中，单击下一步。
    

![](https://img.alicdn.com/imgextra/i2/O1CN01vBC15S1tnJhHmghgV_!!6000000005946-2-tps-1634-414.png)

10. 在添加本机存储策略的上传限制页面中，单击下一步。
    

![](https://img.alicdn.com/imgextra/i1/O1CN01nZfXuz1JPf4ZG016s_!!6000000001021-2-tps-1205-509.png)

11. 在添加本机存储策略的完成页面中，输入存储策略名OSS，单击完成。
    

![](https://img.alicdn.com/imgextra/i4/O1CN01c35olA1abt7BPKFsQ_!!6000000003349-2-tps-1593-353.png)

12. 在左侧导航栏中，单击用户组。
    

![](https://img.alicdn.com/imgextra/i3/O1CN013GtZxC1tVueHbjAS4_!!6000000005908-2-tps-264-496.png)

13. 在用户组页面中，单击管理员操作中的编辑图标。
    

![](https://img.alicdn.com/imgextra/i4/O1CN01896EID1tLpvxFPDzd_!!6000000005886-2-tps-1666-348.png)

14. 在编辑管理员页面的存储策略中，选择oss，然后单击保存。
    

![](https://img.alicdn.com/imgextra/i1/O1CN01X8Mvyk1ZHRpBWawGT_!!6000000003169-2-tps-895-505.png)

![](https://img.alicdn.com/imgextra/i4/O1CN01tZaYpw1g8TNFds3LL_!!6000000004097-2-tps-639-483.png)

15. 在用户组的右上角，单击返回主页。
    

![](https://img.alicdn.com/imgextra/i1/O1CN019xObN81UAVkOOT9k8_!!6000000002477-2-tps-1922-533.png)

16. 在个人网盘页面，拖拽任意文件到网页中，待文件上传完毕，关闭上传队列。
    

![](https://img.alicdn.com/imgextra/i4/O1CN01ciYN6x1EA1TGGnCEY_!!6000000000310-2-tps-925-567.png)

17. 在实验室页面右侧的功能栏中，单击![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_5bb01d33dfe8468f878747ead0e23912.png) 图标，切换至远程桌面。
    
18. 双击打开远程桌面的Chromium网页浏览器。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_0ff080886856459cbb9bae2ced1c626b.png)

19. 在RAM用户登录框中单击下一步，并复制粘贴页面左上角的子用户密码到用户密码输入框，单击登录。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_1f5724d2229d4db88af9675eeabf8683.png)

20. 复制下方地址，在Chromium网页浏览器打开新页签，粘贴并访问OSS管理控制台。
    

```
https://oss.console.aliyun.com/
```

21. 在左侧导航栏中，单击Bucket列表。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_4eea5c9816d84d9288a5ecf9cfb0cf95.png)

22. 在Bucket页面，找到实验室提供的Bucket，单击Bucket名称。
    

说明：您可以在云产品资源列表中查看到实验室提供的Bucket名称。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_454d77c46ff14b3e89a169e3caf7b88b.png)

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_28285b6b89aa4fdf8ee9a5aaa00ac274.png)

23. 在文件列表页面，根据云产品资源列表中的Object路径，单击对应的文件夹名称，进入Object路径。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_839af36c33f24b0ca32493a213ec7d06.png)

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_a8d40e59745f40178f9ee968ce7f2a8a.png)

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_1e0a6b8adfe140459b6801700f8aa992.png)

24. 在文件列表页面，单击文件名为1的文件夹。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_74db6c9bbd23486588ddc46e37171ae2.png)

25. 在1文件夹中，您可以看到在个人网盘上传的文件。
    

![](https://img.alicdn.com/imgextra/i3/O1CN01SoMcpw1TjUNXghAif_!!6000000002418-2-tps-1079-412.png)

11. 配置个人网盘

12. 执行如下命令，运行cloudreve。
    

```
./cloudreve
```

2. 在您的本机浏览器中，打开新页签，访问http://<ECS公网地址>:5212，依次输入管理员账号和密码，单击登录。
    

说明：

- 前往[云服务器ECS控制台](https://ecs.console.aliyun.com/server/region/cn-hangzhou)，在实例页面，在页面顶部切换到资源所在地域，找到您的云服务器ECS，并查看ECS公网地址。
    
- 在进行访问时，请您去掉链接中的<>。
    

1. 在cloudreve主界面右上角，单击管理面板。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_21c5872105f0472aa9da124173f497b9.png)

4. 在确定站点URL设置对话框中，单击更改。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_332df4be930e41ed96cb074663ea0a74.png)

5. 在左侧导航栏中，单击存储策略。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_7d8eb4cc6ede401691916313981fb09c.png)

6. 在存储策略页面，单击添加存储策略。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_e1ebf7f3ba8045c28d367ab7922c9819.png)

7. 在选择存储方式对话框中，选择本机存储。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_68ff7d7c25c0439789f30068c21631f7.png)

8. 在添加本机存储策略的上传路径页面中，将存储目录修改为oss/{uid}/{path}，单击下一步。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_21cc9df4ca62425789e0b34fc4dffe43.png)

9. 在添加本机存储策略的直链设置页面中，单击下一步。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_a29198c42bed4a199f9749d5632757ab.png)

10. 在添加本机存储策略的上传限制页面中，单击下一步。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_7e66447103ae4bdfa15cceaf6db79a72.png)

11. 在添加本机存储策略的完成页面中，输入存储策略名OSS，单击完成。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_4fcc5d24220d4491b79f1cf5ff89b28b.png)

12. 在左侧导航栏中，单击用户组。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_0d8e47aa4da1481fb2bdb7ca70b72c6f.png)

13. 在用户组页面中，单击管理员操作中的编辑图标。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_0beca63b8b754ee683fbbd74ac8cd63c.png)

14. 在编辑管理员页面的存储策略中，选择oss，然后单击保存。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_5e8a7c55034146368e5a6de678764ccd.png)

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_ec00cb43ba4245118fa554a841f14fa2.png)

15. 在用户组的右上角，单击返回主页。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_a0b716eb2a0a4307863d4298492be383.png)

16. 在个人网盘页面，拖拽任意文件到网页中，待文件上传完毕，关闭上传队列。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_f8a6db0de0fc49119a2b7fa99249268a.png)

17. 切换至对象存储OSS页签。在文件列表页面，单击文件名为1的文件夹。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_74db6c9bbd23486588ddc46e37171ae2.png)

18. 在1文件夹中，您可以看到在个人网盘上传的文件。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_e809b7a5d90141b0b4643a53251001eb.png)