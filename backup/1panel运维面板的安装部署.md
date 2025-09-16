## 1.准备一台linux服务器

确保您有一台运行Linux系统的服务器，支持CentOS、Ubuntu、Debian等主流发行版，及麒麟、统信等国产操作系统。支持各种服务器架构：x86_64、aarch64、armv7l、ppc64le、s390x。

## 2.Docker安装及换源
```bash
bash <(curl -sSL https://linuxmirrors.cn/docker.sh)
```

## 3.运行安装脚本
以root用户身份运行一键安装脚本，自动完成1Panel的下载和安装。
```bash
bash -c "$(curl -sSL https://resource.fit2cloud.com/1panel/package/v2/quick_start.sh)"
```

## 4.访问管理面板
安装完成后，通过浏览器访问安装脚本提示的访问地址，开始使用1Panel