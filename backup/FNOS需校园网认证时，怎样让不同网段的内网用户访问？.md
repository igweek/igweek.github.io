> 我们校园网需要认证，认证后所有校园内网用户可以互访。我在校园内搭建了飞牛os，网卡分配的地址是172.17.170.170，用飞牛系统的docker应用浏览器进行了校园网认证，并通过飞牛的docker的浏览器可以上网了。但是校园网内的其他ip比如172.17.78.199并不能访问飞牛。只有和飞牛os同一网段的其他用户可以访问，比如172.17.170.169。如何解决校园网认证，让飞牛网卡分配的ip地址与其他内网用户互联？

## 问题分析
核心原因是认证可能仅限于容器网络，未完全绑定到主机，导致主机在校园网的内网互访权限受限。校园网认证（通常为网页门户认证）往往基于MAC地址或IP绑定，如果容器使用默认的bridge网络模式，认证效果可能无法扩展到主机级别，从而影响跨子网的内网互联。

## 解决办法
使用host网络模式运行fnos里的chromium浏览器容器。
因为默认bridge模式下，容器有独立网络栈，认证可能只绑定容器的虚拟IP/MAC，无法让主机受益。切换到host模式，容器直接共享主机的网络（包括IP和MAC），这样认证就相当于在主机上操作，认证成功后主机即可获得完整的上网和内网互访权限。

**1.删除旧容器**
**2.修改yuml配置文件**
```yaml
services:
  chromium:
    image: registry.cn-guangzhou.aliyuncs.com/fnapp/trim-chromium:latest
    container_name: chromium
    security_opt:
      - seccomp:unconfined
    network_mode: "host"
    environment:
      - TZ=Etc/UTC
      - SUBFOLDER=/chromium/
      - LC_ALL=zh_CN.UTF-8
      - CUSTOM_USER=admin
      - PASSWORD=admin
    volumes:
      - /var/apps/docker-chromium/shares/chromium/config:/config
    shm_size: "1gb"
    restart: unless-stopped
```
**3.启动容器**
**4.账号密码**
默认admin admin
**5.验证**
验证发现，fnos可以ping通www.baidu.com,但是仍然ping不通内网172.17.78.100这些其他的网段的内网ip
```shell
root@ys501:~# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host noprefixroute
       valid_lft forever preferred_lft forever
2: enp12s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether d8:bb:c1:83:bd:ee brd ff:ff:ff:ff:ff:ff
    inet 172.17.170.170/24 brd 172.17.170.255 scope global noprefixroute enp12s0
       valid_lft forever preferred_lft forever
    inet6 fe80::230e:526a:615f:3203/64 scope link noprefixroute
       valid_lft forever preferred_lft forever
3: br-8fbf28b3bef5: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default
    link/ether f6:69:06:61:30:ba brd ff:ff:ff:ff:ff:ff
    inet 172.18.0.1/16 brd 172.18.255.255 scope global br-8fbf28b3bef5
       valid_lft forever preferred_lft forever
    inet6 fe80::f469:6ff:fe61:30ba/64 scope link
       valid_lft forever preferred_lft forever
4: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default
    link/ether 26:5a:fd:5e:3e:22 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
       valid_lft forever preferred_lft forever
root@ys501:~# ping www.baidu.com
PING www.baidu.com (180.101.51.73) 56(84) bytes of data.
64 bytes from 180.101.51.73 (180.101.51.73): icmp_seq=1 ttl=52 time=7.24 ms
64 bytes from 180.101.51.73 (180.101.51.73): icmp_seq=2 ttl=52 time=7.19 ms
64 bytes from 180.101.51.73 (180.101.51.73): icmp_seq=3 ttl=52 time=7.09 ms
64 bytes from 180.101.51.73 (180.101.51.73): icmp_seq=4 ttl=52 time=7.15 ms
64 bytes from 180.101.51.73 (180.101.51.73): icmp_seq=5 ttl=52 time=7.13 ms
64 bytes from 180.101.51.73 (180.101.51.73): icmp_seq=6 ttl=52 time=7.28 ms
64 bytes from 180.101.51.73 (180.101.51.73): icmp_seq=7 ttl=52 time=7.24 ms
64 bytes from 180.101.51.73 (180.101.51.73): icmp_seq=8 ttl=52 time=7.26 ms
^C64 bytes from 180.101.51.73: icmp_seq=9 ttl=52 time=7.14 ms

--- www.baidu.com ping statistics ---
9 packets transmitted, 9 received, 0% packet loss, time 8739ms
rtt min/avg/max/mdev = 7.091/7.191/7.283/0.062 ms
root@ys501:~# ping 172.17.78.199
PING 172.17.78.199 (172.17.78.199) 56(84) bytes of data.
From 172.17.0.1 icmp_seq=1 Destination Host Unreachable
From 172.17.0.1 icmp_seq=2 Destination Host Unreachable
From 172.17.0.1 icmp_seq=3 Destination Host Unreachable
From 172.17.0.1 icmp_seq=4 Destination Host Unreachable
From 172.17.0.1 icmp_seq=5 Destination Host Unreachable
From 172.17.0.1 icmp_seq=6 Destination Host Unreachable
From 172.17.0.1 icmp_seq=7 Destination Host Unreachable
From 172.17.0.1 icmp_seq=8 Destination Host Unreachable
From 172.17.0.1 icmp_seq=9 Destination Host Unreachable
From 172.17.0.1 icmp_seq=10 Destination Host Unreachable
From 172.17.0.1 icmp_seq=11 Destination Host Unreachable
From 172.17.0.1 icmp_seq=12 Destination Host Unreachable
^C
--- 172.17.78.199 ping statistics ---
15 packets transmitted, 0 received, +12 errors, 100% packet loss, time 14337ms
```
**问题分析**
因为主机网卡是 172.17.170.170/24，而 Docker 默认网段正好也是 172.17.0.0/16，子网冲突了。
Linux 路由表优先匹配最长前缀，所以去 172.17.78.x 的包傻乎乎地走了本地的 docker0 接口，结果就出不去了。

**解决方法**
修改docker默认网桥ip
```bash
ip link set docker0 down 2>/dev/null || true
ip route del 172.17.0.0/16 2>/dev/null || true

mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<EOF
{
  "bip": "10.99.0.1/24",
  "default-address-pools": [{ "base": "10.99.0.0/16", "size": 24 }]
}
EOF

systemctl restart docker
```
