## Windows系统用户权限管理

>在系统中添加用户test1；添加组group1、group2；在c盘根目录下新建文件夹test，test文件夹中，新建学号.txt文件，并写入任意内容。要求：group1对test文件具有读写权限；group2对test文件拒绝读写权限；test1属于group1组，test1属于group2组；验证test1对test文件夹中txt文件的读写权限。

**结论：拒绝优先**

**创建test1用户**
`Gmeek-html<img src="/img/windowsxtyhqxgl/1.png">`
`Gmeek-html<img src="/img/windowsxtyhqxgl/2.png">`
`Gmeek-html<img src="/img/windowsxtyhqxgl/3.png">`


**创建组别**
`Gmeek-html<img src="/img/windowsxtyhqxgl/4.png">`
`Gmeek-html<img src="/img/windowsxtyhqxgl/5.png">`
`Gmeek-html<img src="/img/windowsxtyhqxgl/6.png">`

**创建文件**
在C盘新建文件夹test，test文件夹中，新建任意txt文件，并写入任意内容

**指定权限**
右键--test文件夹--属性
`Gmeek-html<img src="/img/windowsxtyhqxgl/7.png">`
`Gmeek-html<img src="/img/windowsxtyhqxgl/8.png">`
**group1赋予读取写入权限**
`Gmeek-html<img src="/img/windowsxtyhqxgl/9.png">`
**group2赋予拒绝读取写入权限**
`Gmeek-html<img src="/img/windowsxtyhqxgl/10.png">`

**验证**
注销--使用test1用户登录--验证权限

**结论**
拒绝优先