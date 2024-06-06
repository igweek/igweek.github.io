## 一、什么是DHCP服务器

DHCP（Dynamic Host Configuration Protocol）服务器是一种网络服务，用于自动分配IP地址给网络上的设备。DHCP服务器负责管理IP地址池，并在设备加入网络时分配IP地址、子网掩码、网关地址等网络配置信息。这种自动配置的方式简化了网络管理。

## 二、工作原理

1. **客户端发现（DHCP Discover）：** 当一个设备连接到网络时（例如，一台电脑启动或移动到新的网络），它会发送一个DHCP发现消息到网络上的广播地址（255.255.255.255），以寻找可用的DHCP服务器。
2. **服务器提供（DHCP Offer）：** DHCP服务器接收到发现消息后，会回应一个DHCP提供消息，其中包含IP地址等网络配置信息。如果有多个DHCP服务器存在，客户端会接收到多个提供消息，但通常会选择第一个到达的提供消息。
3. **客户端请求（DHCP Request）：** 客户端收到一个或多个DHCP提供消息后，选择其中一个提供消息，并向该DHCP服务器发送一个请求消息，请求分配网络配置信息。
4. **服务器确认（DHCP Acknowledge）：** DHCP服务器收到客户端的请求消息后，确认该请求，并发送一个DHCP确认消息，其中包含了所分配的IP地址等网络配置信息。
5. **网络配置生效：** 客户端收到DHCP确认消息后，配置所分配的IP地址等网络配置信息，并将其应用于网络连接。此时，设备就可以正常地与网络通信了。

## 三、租约更新过程

DHCP租约更新是指客户端续租其已经分配的IP地址及其他网络配置信息的过程。租约的更新是为了确保网络上的设备能够继续使用其分配的IP地址，同时也是为了网络资源的有效利用和管理。以下是DHCP租约更新的一般过程：

1. **租约到期检查：** 客户端在分配的IP地址使用期限即将到期时，会开始尝试更新租约。在租约到期之前，客户端通常会尝试向DHCP服务器发送请求以更新租约。
2. **请求更新（DHCP Request）：** 客户端发送一个DHCP请求消息到DHCP服务器，请求续租其当前使用的IP地址及其他网络配置信息。
3. **服务器确认更新（DHCP Acknowledge）：** DHCP服务器收到客户端的更新请求后，会确认该请求，并发送一个DHCP确认消息，其中包含了更新后的网络配置信息。如果DHCP服务器接受了客户端的续租请求，那么它会分配相同的IP地址给客户端，并更新租约的过期时间。
4. **网络配置更新：** 客户端收到DHCP确认消息后，会更新其网络配置，包括IP地址、子网掩码、网关地址等。这样，客户端就可以继续在网络上正常通信，并且不会中断其网络连接。

通过定期的租约更新，DHCP可以确保网络上的设备持续地使用其分配的IP地址，并且有效地管理IP地址的分配和释放，从而提高网络的可用性和资源利用效率。

## 四、DHCP服务配置

**安装DHCP服务器角色**

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515214028.png)

**DHCP控制台**

DHCP服务器安装成功后，开始菜单—管理工具—DHCP服务器，进入DHCP控制台。

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515214105.png)

**创建作用域**

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515214206.png)

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515214229.png)

**配置作用域选项**

配置作用域选项，DHCP服务器可以给客户机分配网关及DNS等相应的网络配置信息。

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515214250.png)

**如何保留特定地址**

如果用户想保留特定的IP地址给指定的客户机，以便客户机在每次启动时都获得相同的IP地址，就需要将该IP地址与客户机的MAC地址绑定。

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515214314.png)

可以用客户机进行测试

`ipconfig /release` 释放现有IP

`ipconfig /renew` 重新获取IP

**配置DHCP类别选项**

通过策略为特定的客户端计算机分配不同的IP地址与选项时，可以通过DHCP客户端所发送的**供应商类别、用户类**来区分客户端计算机。
EX：通过用户类标识符来识别客户端计算机——假设客户端client1的用户类标识符为“IT”。当client1向DHCP服务器租用IP地址时，会将此标识符“IT”传递给服务器，我们希望服务器根据此标识符来分配客户端的IP地址范围为192.168.10.150/24-192.168.10.180/24，并且将客户端的DNS服务器的IP地址设置为192.168.10.1。

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515214342.png)

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515214404.png)

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515214420.png)

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515214444.png)

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515214502.png)

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515214520.png)

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515214558.png)

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515214615.png)

## 五、DHCP中继代理

1、在网络中存在多个子网时，DHCP消息通常无法跨越子网传输，因为DHCP是基于UDP广播的。这就意味着DHCP服务器必须与DHCP客户端在同一个子网上才能收到客户端的广播消息。为了解决这个问题，可以使用DHCP中继代理。

2、DHCP中继代理的工作原理如下：

- 当一个DHCP客户端发送一个DHCP发现消息时，如果它位于一个子网上，而DHCP服务器位于另一个子网上，该消息会被网络上的DHCP中继代理接收。
- DHCP中继代理会将接收到的DHCP发现消息转发给配置的DHCP服务器。
- DHCP服务器收到DHCP发现消息后，会相应地回应一个DHCP提供消息，将其发送给DHCP中继代理。
- DHCP中继代理再将DHCP提供消息转发给原始的DHCP客户端。

3、跨网络DHCP服务器的使用

**符合RFC 1542规范的路由器** 

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515214635.png)

**如果路由器不符合RFC 1542规范**

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515214652.png)

## 六、无线中继配置

实验环境拓扑图

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515214714.png)

1、在GW1上安装路由和远程访问

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515214737.png)

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515214823.png)

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515214841.png)

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515214925.png)

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515214946.png)

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515214959.png)

2、在GW1上设置中继代理

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515215014.png)

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515215030.png)

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515215043.png)

![](https://jsd.cdn.zzko.cn/gh/soslane/picgo@main/path/20240515215100.png)

## 七、超级作用域

用于组织和管理 DHCP 服务器上的配置。超级作用域实际上是一个 DHCP 服务器上的逻辑集合，包含了多个作用域（Scope）。作用域是一组 IP 地址范围及其相关的配置参数，如子网掩码、默认网关、DNS 服务器等。在一个 DHCP 服务器上，可以创建多个作用域，以便为不同的网络或子网提供不同的 IP 配置。
超级作用域的主要作用是方便管理和组织作用域。通过将作用域组织成超级作用域，管理员可以更轻松地管理大量的 DHCP 配置。
![image](https://jsd.cdn.zzko.cn/gh/soslane/picx-images-hosting@master/332248893-40cd1dd7-ffe9-418f-a45f-4073bcb2c627.2ruyqqcs1e.webp)
