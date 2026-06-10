在采用受限内核的 LXC 服务器环境中，如果希望运行接近“原生”体验的容器，可以使用 Euserv 提供的 Podman in LXC Limited 解决方案。
该方案能够突破部分 LXC 小型 VPS 的容器运行限制，使其支持 Docker，并可正常安装和运行 1Panel 等基于 Docker 的服务器管理面板。部署完成后，Docker 命令的使用方式与原生 Docker 基本一致，无需额外改变日常操作习惯。
需要特别注意的是：在 1Panel 环境中，应将 Docker 的管理方式设置为 systemd，否则可能出现 Docker 服务无法正常启动或运行的问题。
借助这一方案，Euserv 免费服务器也可以顺利运行 Docker 和 1Panel。

```shell
apt update && apt install -y sudo curl && curl -L -o install.sh https://raw.githubusercontent.com/neko-ski/podman-in-lxc-limited/main/install.sh && chmod +x install.sh && sudo ./install.sh && rm -f install.sh
```

国内加速版
```shell
apt update && apt install -y sudo curl && curl -L -o install.sh https://cdn.jsdelivr.net/gh/neko-ski/podman-in-lxc-limited@main/install.sh && chmod +x install.sh && sudo ./install.sh && rm -f install.sh
```