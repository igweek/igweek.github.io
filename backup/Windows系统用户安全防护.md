## Windows系统用户安全防护
>1.用户密码必须符合复杂度要求。用户密码长度最小为5。用户密码最短使用期限为15天。用户密码最长使用期限为30天。强制用户密码历史为5个。用户锁定阈值为3次锁定时间为30分钟。
2.禁用来宾账户。重命名系统管理员名称为@Dm1n。新建test用户并设置其只能在周一至周五的9:00-17:00可以登录。设置取得文件或其他对象的所有权只指派给Administrators用户组。
### 1、密码策略
[![](https://s2.loli.net/2024/12/02/YSlPzvICRTJgdyw.jpg)](https://s2.loli.net/2024/12/02/YSlPzvICRTJgdyw.jpg)
[![](https://s2.loli.net/2024/12/02/Y5lLgROXVpP2ua8.jpg)](https://s2.loli.net/2024/12/02/Y5lLgROXVpP2ua8.jpg)
[![](https://s2.loli.net/2024/12/02/oysmBOJ76t5Eqgl.jpg)](https://s2.loli.net/2024/12/02/oysmBOJ76t5Eqgl.jpg)
### 2、用户设置
**右键---我的电脑---管理**
[![](https://s2.loli.net/2024/12/02/CiyTvrUBSzhlZu1.jpg)](https://s2.loli.net/2024/12/02/CiyTvrUBSzhlZu1.jpg)
[![](https://s2.loli.net/2024/12/02/wiEjyD17rL6oNUd.jpg)](https://s2.loli.net/2024/12/02/wiEjyD17rL6oNUd.jpg)

**禁用guest用户**
右键guest---属性---勾选账户已禁用
![image.png](https://pic.myla.eu.org/file/1760927575390_image.png)

**重命名administrator**
运行---gpedit.msc
![image.png](https://pic.myla.eu.org/file/1760928079266_image.png)

**新建test用户**
[![](https://s2.loli.net/2024/12/02/waUZBepJqmWisjR.jpg)](https://s2.loli.net/2024/12/02/waUZBepJqmWisjR.jpg)
[![](https://s2.loli.net/2024/12/02/GAekuIQ4DYFRMCp.jpg)](https://s2.loli.net/2024/12/02/GAekuIQ4DYFRMCp.jpg)

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
![image.png](https://pic.myla.eu.org/file/1760928306991_image.png)

**设置取得文件或其他对象的所有权只指派给Administrators用户组**
运行---gpedit.msc
![image.png](https://pic.myla.eu.org/file/1760928409395_image.png)

