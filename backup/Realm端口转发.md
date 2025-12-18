![image.png](https://pic.myla.eu.org/file/A1AZiPoP.png)
> Realm是一款由rust语言编写的开源高性能端口转发软件，支持多组端点转发，支持tcp&udp和域名解析
网络部署中常会遇到需要平衡速度与IP信誉的情况。比如我手头有两台VPS，一台位于新加坡，延迟表现优异但IP欺诈较高；另一台则是美西直连服务器，虽然延迟较高但IP纯净度极好。我尝试将新加坡节点作为流量中转站，通过它将客户端的访问请求转发到美国服务器完成最终落地。具体操作是，在美西机器上部署节点服务并记录好IP地址及端口信息，接着在新加坡服务器安装Realm并配置好转发规则，这样客户端连接新加坡节点时就能利用低延迟优势，同时通过美西干净IP完成对外访问。这种中转架构在需要兼顾速度与IP可信度的场景中非常实用。


## 安装

```shell
bash <(curl -L https://raw.githubusercontent.com/zhouh047/realm-oneclick-install/main/realm.sh) -i
```

## 配置
编辑配置文件
```shell
nano /usr/local/etc/realm/config.toml
```

```bash
[log]
level = "warn"
output = "realm.log"

[network]
no_tcp = false
use_udp = true

[[endpoints]] #一对端点，监听本机5000端口的流量并将其转发到1.1.1.1的443端口
listen = "0.0.0.0:5000"
remote = "1.1.1.1:443"

[[endpoints]] #可添加多对端点，可自动解析域名
listen = "0.0.0.0:10000"
remote = "www.google.com:443"

[[endpoints]] #若本地有ipv6地址同样可以转发到别的ipv6地址
listen = "0.0.0.0:10000"
remote = "2001:4860:4860::8888:443"
```

## 设置自启动并运行
```bash
systemctl enable realm && systemctl start realm
```
> 至此完成转发配置