## Windows系统用户安全防护
>1.用户密码必须符合复杂度要求。用户密码长度最小为5。用户密码最短使用期限为15天。用户密码最长使用期限为30天。强制用户密码历史为5个。用户锁定阈值为3次锁定时间为30分钟。
2.禁用来宾账户。重命名系统管理员名称为@Dm1n。新建test用户并设置其只能在周一至周五的9:00-17:00可以登录。设置取得文件或其他对象的所有权只指派给Administrators用户组。
### 1、密码策略
`Gmeek-html<img src="/img/windowsxtyhaqfh/1.jfif">`
`Gmeek-html<img src="/img/windowsxtyhaqfh/2.jfif">`
`Gmeek-html<img src="/img/windowsxtyhaqfh/3.jfif">`

### 2、用户设置
**右键---我的电脑---管理**
`Gmeek-html<img src="/img/windowsxtyhaqfh/4.jfif">`
`Gmeek-html<img src="/img/windowsxtyhaqfh/5.jfif">`

**禁用guest用户**
右键guest---属性---勾选账户已禁用
`Gmeek-html<img src="/img/windowsxtyhaqfh/6.png">`

**重命名administrator**
运行---gpedit.msc
`Gmeek-html<img src="/img/windowsxtyhaqfh/7.png">`

>[!note]
如果重命名后，后续操作有问题了，请尽量对虚拟机进行重启
原因是“用户名”映射到“安全标识符（SID）重命名后映射关系出现问题

**新建test用户**
`Gmeek-html<img src="/img/windowsxtyhaqfh/8.jfif">`
`Gmeek-html<img src="/img/windowsxtyhaqfh/9.jfif">`

**设置其只能在周一至周五的9:00-17:00可以登录**
打开 命令提示符（管理员权限），执行：
```shell
net user test /time:M-F,09:00-17:00
```
>解释：
M-F 代表 Monday–Friday；
时间段 09:00-17:00 为允许登录时段；
其余时间系统会在登录阶段拒绝该用户。

验证结果：
```shell
net user test
```
`Gmeek-html<img src="/img/windowsxtyhaqfh/10.png">`
**设置取得文件或其他对象的所有权只指派给Administrators用户组**
运行---gpedit.msc
`Gmeek-html<img src="/img/windowsxtyhaqfh/11.png">`

