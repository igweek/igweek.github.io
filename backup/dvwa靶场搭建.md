##  DVWA安装

DVWA是PHP/MYSQL的源码环境，我们可以将DVWA安装在PHPStudy中，PHPStudy是一个PHP调试环境集成包，集成了我们所需的环境。DVWA和PHPStudy官方下载地址：

PHPStudy：[小皮面板(phpstudy) - 让天下没有难配的服务器环境！ (xp.cn)](https://www.xp.cn/)

DVWA：[GitHub - digininja/DVWA: Damn Vulnerable Web Application (DVWA)](https://github.com/digininja/DVWA)

### 2.1 配置PHPStudy

从官网下载好之后直接安装，注意安装路径不能用空格和中文。

打开后启动Apache和MySQL，启动后打开浏览器登录localhost检查是否成功

![image.png](https://pic.myla.eu.org/file/1741063248475_image.png)

如果出现下面这个界面就说明启动成功了：

![image.png](https://pic.myla.eu.org/file/1741063248283_image.png)

**启动MySQL时，有些人会出现启动后马上停止的情况，有可能是你本地的mysql数据库占用了3306端口，导致phpstudy的mysql启动失败。**

**解决方法之一：在phpstudy中点击设置，检测3306端口，检测到被占用时可以自动帮你关掉占用的程序；或者自己手动打开电脑的服务，找到mysql，停止或暂停程序。**

### 2.2 搭建DVWA

1. 从官网下载好压缩包后，**解压到phpstudy目录下的www文件夹中**，如下图所示。解压时如果杀毒软件提示有病毒并且自动把病毒清理了的话，先把杀毒软件关掉再解压。

![image.png](https://pic.myla.eu.org/file/1741063256416_image.png)

1. 在/dvwa-master/config目录下，有一个`config.inc.php.dist`文件，复制这个文件，然后在这个文件夹中粘贴，并将文件名重命名为`config.inc.php`

![image.png](https://pic.myla.eu.org/file/1741063265669_image.png)

1. 打开`config.inc.php`文件，将数据库用户名和密码均修改为`root`，可以将公钥及私钥分别设置为`6LdJJlUUAAAAAH1Q6cTpZRQ2Ah8VpyzhnffD0mBb`和`6LdJJlUUAAAAAM2a3HrgzLczqdYp4g05EqDs-W4K`
    
  ![image.png](https://pic.myla.eu.org/file/1741063267620_image.png)
    
4. 找到phpstudy目录下的`php.ini`配置文件，注意是phpstudy目录下的，不是dvwa目录下的，可以在根目录中直接搜索查找
    
![image.png](https://pic.myla.eu.org/file/1741063279380_image.png)
    

![image.png](https://pic.myla.eu.org/file/1741063288361_image.png)

然后打开这个文件，设置`allow_url_fopen=On` `allow_url_include=On`

![image.png](https://pic.myla.eu.org/file/1741063302741_image.png)

1. 至此，所有配置已经完成。在浏览器中打开http://localhost/Dvwa-master 或者 [http://127.0.0.1/DVWA-master](http://127.0.0.1/DVWA-master) 进入DVWA，输入账号密码，默认为admin/password，登录后点击下方的创建数据库即可。

![image.png](https://pic.myla.eu.org/file/1741063302245_image.png)
![image.png](https://pic.myla.eu.org/file/1741063304715_image.png)

## 3. 靶场使用示例

在DVWA Security 中将安全等级设置为low，以sql注入为例，在左边选择sql注入(`SQL Injection`)。

我们按正常的查询，输入`1`提交进行查询，同时打开F12，选择网络，查看该条请求的信息，找到请求url和请求头中的cookie。
![image.png](https://pic.myla.eu.org/file/1741063322184_image.png)

我们可以进行一个简单的sql注入，目标是查询出当前使用的数据库以及当前的数据库用户。

1. 在浏览器中进行注入
    
    在User ID处输入`1' union select database(),user()#` 点击提交查询，我们就查到了当前使用的数据库为`dvwa`及当前的数据库用户为`root@localhost`。
    

![image.png](https://pic.myla.eu.org/file/1741063325262_image.png)

1. 使用postman工具进行注入
    
    选择GET请求，将url复制进去，然后将参数id的值改为`1' union select database(),user()#`，然后在header中添加一个cookie参数，将刚才的cookie的值复制进去。
    
![image.png](https://pic.myla.eu.org/file/1741063334917_image.png)
    

​ 点击Send发送请求，在预览中就可以看到注入结果了。

![image.png](https://pic.myla.eu.org/file/1741063338425_image.png)
