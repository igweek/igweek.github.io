1. 将 Kali Linux 系统重启到 GRUB 引导菜单。突出显示您通常从中引导的默认引导菜单，然后按 e 键以编辑此引导菜单项。
![file](https://s2.loli.net/2025/05/07/G6Cp32yOUahxbqI.png)
2. 进入 GRUB 菜单编辑模式后，您将看到以下窗口。向下滚动，直到您点击以关键字 linux 开头的行。
找到上一步指定的相应引导项后，使用导航箭头查找关键字 ro 并将其替换为关键字 rw。接下来，在同一个引导条目上找到关键字 quiet 并将其替换为 init=/bin/bash
![file](https://s2.loli.net/2025/05/07/ITlUmqL4FuAifwY.png)
3. 按F10或者FN+F10
4. 输入`passwd`更改密码
5. 看到提示密码更新成功后代表密码已修改
6. 重启虚拟机并登陆

