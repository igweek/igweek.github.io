>[!note]
① 登录虚拟机（Win7\_x64），提取2021.09.12 05:15:00—2021.09.12 05:20:00时间段的远程桌面登录日志，将过滤的日志存储为evtx格式日志，记录详细提取过程，并描述该时间段内的用户认证成功日志记录条目数。
② 分析系统安全日志文件，请描述：
1）哪位用户在该机器上新建了用户share？
2）哪个IP通过新用户share成功地远程登录过本系统？


## 一、题目要求

① 登录虚拟机（Win7_x64），提取 2021.09.12 05:15:00—2021.09.12 05:20:00 时间段的远程桌面登录日志，将过滤的日志存储为 evtx 格式日志，记录详细提取过程，并描述该时间段内的用户认证成功日志记录条目数。
② 分析系统安全日志文件


## 二、实验思路

整道题分两段：先做动作，再查日志。先在目标机上新建 share 用户、给它远程登录权限、开启远程桌面，然后从另一台机器用 share 远程登录一次，这样安全日志里就会留下记录；再打开事件查看器，**用事件 ID 4720（创建用户帐户）和 4624（登录成功）把两条关键记录翻出来。**


## 三、详细解题步骤

### 步骤 1：新建用户 share

在目标机上打开“计算机管理”→“本地用户和组”→“用户”，新建用户 share。

![Pdf7cLVt4am30oZE9uXXPAQudmbFgsf2.webp](https://cdn.nodeimage.com/i/Pdf7cLVt4am30oZE9uXXPAQudmbFgsf2.webp)

### 步骤 2：把 share 加入 Remote Desktop Users 组

只有 Remote Desktop Users 组的成员（以及管理员）才有远程登录的权限。打开“本地用户和组”→“组”→“Remote Desktop Users”属性，成员列表里已经有 share，说明 share 获得了远程登录的权限。
![EJy9EDNdlHTQZw2tUN6wClseiq6Y9IWy.webp](https://cdn.nodeimage.com/i/EJy9EDNdlHTQZw2tUN6wClseiq6Y9IWy.webp)

### 步骤 3：开启远程桌面

控制面板→系统→远程设置，在“远程桌面”一栏选中“允许运行任意版本远程桌面的计算机连接（较不安全）”。Windows 7 默认是不开远程桌面的，这一步不开，后面连不上。另外“允许远程协助连接这台计算机”也是勾选的。
![zGfWReV9wOpRWXZC7fExRWLIqBFLLTZ8.webp](https://cdn.nodeimage.com/i/zGfWReV9wOpRWXZC7fExRWLIqBFLLTZ8.webp)

### 步骤 4：确认目标机的 IP 地址

在目标机上打开命令提示符，执行 ipconfig，可以看到以太网适配器“本地连接”的 IPv4 地址是 192.168.200.134，这就是后面远程桌面连接要填的地址。
![5Ye8R7JZZACgIGb55EvXEddM9pYoBRnM.webp](https://cdn.nodeimage.com/i/5Ye8R7JZZACgIGb55EvXEddM9pYoBRnM.webp)

### 步骤 5：从另一台机器用 share 远程登录

在另一台机器上按 Win+R，输入 mstsc 打开远程桌面连接，计算机一栏填 192.168.200.134，点“连接”；在弹出的 Windows 安全性窗口输入凭据，用户名填 share，输入密码后点“确定”。
![NhuUMBS2gW57GVcpeBqqxdQFzDYCLLXD.webp](https://cdn.nodeimage.com/i/NhuUMBS2gW57GVcpeBqqxdQFzDYCLLXD.webp)

连接建立后，窗口标题显示“192.168.200.134 - 远程桌面连接”，先出现“请等待 zhy-PC\zhy 响应”的提示，随后进入远程桌面。这一步做完，目标机的安全日志里就有了 share 的登录成功记录。
![SX9e4EQUYKfz2okibere7OeeD2BeqxdD.webp](https://cdn.nodeimage.com/i/SX9e4EQUYKfz2okibere7OeeD2BeqxdD.webp)

### 步骤 6：打开事件查看器，查看安全日志

在目标机上按 Win+R，输入 eventvwr.msc 打开事件查看器，左侧展开“Windows 日志”，点“安全”。未筛选时安全日志共有 167 条事件，里面有 4624（登录成功）、4634（注销）、4672（特殊登录）、4648（使用显式凭据登录）等。
![tvxYAgo3gYLUDu9wqRSI9HCr4pQV4YHM.webp](https://cdn.nodeimage.com/i/tvxYAgo3gYLUDu9wqRSI9HCr4pQV4YHM.webp)

### 步骤 7：筛选出登录成功日志（事件 ID 4624）

在右侧“操作”栏点“筛选当前日志”，在“事件 ID”一栏填 4624。时间范围按题目要求选“自定义范围”，填入 2021.09.12 05:15:00 至 2021.09.12 05:20:00，点“确定”。筛选后列表顶部的“事件数”就是该时间段内的用户认证成功日志条数，把这个数字记下来，就是第 ① 问要描述的结果。
![S3noZSYM4xxPtQH2rZSAkmC7pktXPa1D.webp](https://cdn.nodeimage.com/i/S3noZSYM4xxPtQH2rZSAkmC7pktXPa1D.webp)

### 步骤 8：把筛选结果另存为 evtx 文件

保持筛选状态，在右侧“操作”栏点“将筛选的日志另存为”，在保存对话框里把文件名填为 yuanchengdenglu，保存类型保持默认的“事件文件(*.evtx)”，位置选桌面，点“保存”。
![fSmIvmOwSNy8AbUP0oUamPZCACEDwxsr.webp](https://cdn.nodeimage.com/i/fSmIvmOwSNy8AbUP0oUamPZCACEDwxsr.webp)

### 步骤 9：查“谁新建了 share”——筛选事件 ID 4720

4720 是“已创建用户帐户”的事件。在安全日志里筛选事件 ID 4720，可以看到两条记录，其中一条的记录时间是 2026/10/28 9:46:09，点开详情：

“主体”一栏：安全 ID zhy-PC\zhy，帐户名 zhy，帐户域 zhy-PC——这就是创建帐户的操作者；

“新帐户”一栏：安全 ID zhy-PC\share，帐户名 share，帐户域 zhy-PC——这就是被创建的新帐户。

所以第 ②（1）问的答案是：用户 zhy 在这台机器上新建了用户 share。

![wv1qZ3pE3FkgpWVcPu0XVhYZPvIxuVTY.webp](https://cdn.nodeimage.com/i/wv1qZ3pE3FkgpWVcPu0XVhYZPvIxuVTY.webp)

### 步骤 10：查“哪个 IP 用 share 远程登录成功”——看 4624 的详情

回到步骤 7 筛选出的 4624 记录里，找到帐户名为 share 的那条，点开详情：

“新登录”一栏：安全 ID zhy-PC\share，帐户名 share，帐户域 zhy-PC，登录 ID 0x198623；

“进程信息”一栏：进程名 C:\Windows\System32\winlogon.exe，说明这是一次交互式登录；

“网络信息”一栏：工作站名 WIN-F7K106AQOKE，源网络地址 192.168.200.1，源端口 59070。

这条 4624 就是远程登录成功的记录，源网络地址就是发起远程连接的那台机器的 IP。

所以第 ②（2）问的答案是：IP 地址 192.168.200.1 通过新用户 share 成功地远程登录过本系统。

![s3qw5sRCeEB9s5LZtb8MEYEZGgg3b12m.webp](https://cdn.nodeimage.com/i/s3qw5sRCeEB9s5LZtb8MEYEZGgg3b12m.webp)

## 四、常用事件 ID 速查

4624：帐户登录成功（远程桌面登录成功一般看这一条，详情里“登录类型”为 10 表示远程交互式登录）；

4634：帐户注销；

4648：使用显式凭据登录；

4672：特殊登录（管理员权限登录）；

4720：已创建用户帐户。
