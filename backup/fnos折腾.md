## 引导盘
用rufus写盘工具（不要用ventoy）
## BIOS设置：
- 开启UEFI引导
- 关闭安全启动（Secure Boot）

## 笔记本盒盖不休眠
**Step 1：开启飞牛系统SSH功能**
1，登录飞牛系统，点击系统设置。
2，找到SSH功能，默认端口是22（可根据需要调整）。
**Step 2：通过命令行连接飞牛NAS**
```shell
ssh 用户名@IP地址
sudo vim /etc/systemd/logind.conf
```
- 找到类似#HandleLidSwitch=suspend的配置。删除注释，将suspend改为ignore。
- 找到类似#LidSwitchIgnoreInhibited=yes的配置。同样删除#号，取消注释。
最后重启系统并验证
```shell
sudo reboot
```
