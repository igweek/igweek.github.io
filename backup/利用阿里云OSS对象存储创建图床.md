# 为什么要搭建图床？

经常在博客写文章或者搭建自己的网站时，肯定需要往里面加图片对吧。有人可能会想，我直接把图片保存在电脑上不就行了？其实这样也不是不可以，但问题来了，如果你想把你的文章转载到别的地方，那些在本地的图片别人是看不到的，你得一个个去复制粘贴，真是够呛！

这时候，如果用阿里云OSS或者腾讯云COS来搭建一个图床，问题就迎刃而解了。用这些服务，处理图片简直高效到不行。说到国内用得多的，腾讯云和阿里云绝对是排前面的，速度快，就是要花点钱。至于GitHub的gitee，那是免费的，但是最近被封了，很多小伙伴都都已经深受其好，而且速度超慢。

之前一直在薅mdnice的免费图床羊毛，这两天发现网站上的图片无法显示了，桑心，只能自己动手来搭建图床，找了一圈，Typora+PicGo+阿里云OSS/腾讯云COS的组合较多，接下来跟着我这个手残党一起来一步一步搭建图床吧，我选择的是阿里云作为例子，这里并不是对腾讯云有什么偏见哦，腾讯云也非常棒，大家自己选择。

# 阿里云OSS搭建图床

## 1\. 注册登录阿里云

打开阿里云官方网站[https://www.aliyun.com/product/oss](https://www.aliyun.com/product/oss?source=5176.11533457&amp;userCode=)，点击右上角的登录/注册

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_6f5b82e75b0a43abaa75f2c25cb299cf.png?x-oss-process=image/resize,w_1400/format,webp)  

直接打开手机支付宝的扫一扫，扫描页面上的二维码，然后授权登录即可。

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_deca5c11a9374fa1a9118d17709430e9.png?x-oss-process=image/resize,w_1400/format,webp)  

## 2\. 开通OSS服务

如果你还没有开通对象存储服务OSS，那么点击立即开通，现在新人可以免费试用三个月，存储包 20 GB。

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_14bca71d894449a98b4e05af54078e21.png?x-oss-process=image/resize,w_1400/format,webp)  

再点击立即开通

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_56eb9167cf9f415982856d91c555c0d7.png?x-oss-process=image/resize,w_1400/format,webp)  

勾选服务协议后，点击立即开通

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_d4423e2061224cc2aa43b6879a2b7806.png?x-oss-process=image/resize,w_1400/format,webp)  

## 3\. 创建OSS Bucket

开通成功后，点击管理控制台

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_bb7592ebfb974c60a9006366dd619c40.png?x-oss-process=image/resize,w_1400/format,webp)  

进入控制台之后，点击红框的立即创建或者创建Bucket，都可以创建Bucket

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_b8b5f3c7843c478eb813eba14ebe2f7a.png?x-oss-process=image/resize,w_1400/format,webp)  

接下来填一些必填的信息：

* Bucket 名称：必须全局唯一，和你在游戏中取的名字一样，不能和别人的重名，一旦创建不可更改。
* 地域：选择“有地域属性”，然后选择一个离自己位置近的地域。

存储类型：选择“标准存储”即可。
* 存储冗余类型：推荐选择“本地冗余存储”，“同城冗余存储”更贵，如果网站有较高的并发流量可以选择这个。
* 读写权限：一定要选择“公共读”，否则平台无法通过公网访问 Bucket 中的内容。
* 其他选择默认，无需修改。

![image.png](https://pic.myla.eu.org/file/1742180158815_image.png)

![image.png](https://pic.myla.eu.org/file/1742180259045_image.png)

![image.png](https://pic.myla.eu.org/file/1742180343041_image.png)

创建成功，点击进入Bucket

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_59bf3518420e40818662773f6e102e6d.png?x-oss-process=image/resize,w_1400/format,webp)  

## 4\. 记下Bucket信息

点击概览

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_637a83f97311474db7bef31f8f494b05.png?x-oss-process=image/resize,w_1400/format,webp)  

进入概览页面，这里可以看到bucket的整体信息。

用文本软件记下红框画起来的几个信息，等会儿配置PicGo要用：

* Bucket名称：aitechshare-com
* Endpoint（地域节点）：xxxx
* Bucket域名（外网地址）：xxxx

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_066a54e29e344bf1ab39bd4b5a344412.png?x-oss-process=image/resize,w_1400/format,webp)  

## 5\. 创建AccessKey

在页面右上角，鼠标放在头像处，在弹出的框里选择AccessKey管理

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_e0d92f9657e84b7d8e49d792bd802084.png?x-oss-process=image/resize,w_1400/format,webp)  

在弹出的选项框里，选择继续使用AccessKey。

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_db2b4a34b8fd45b19b6450b642185ba9.png?x-oss-process=image/resize,w_1400/format,webp)  

点击创建AccessKey，在弹出的安全验证窗口中，选择一个方式来通过安全验证。

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_d759cdaeb99b4606ad7a955e87620fdd.png?x-oss-process=image/resize,w_1400/format,webp)  

把图中的资料下载成csv，或者复制下来保存好，这个类似于你的密码，一定不要泄露。

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_253f2c82eec34e56bf966f6cacafc21a.png?x-oss-process=image/resize,w_1400/format,webp)  

## 6\. 创建子账户用来配置PicGo

重要！上面生成的AccessKey是主账户的，它也可以用来配置picgo，但是如果我们只是需要使用OSS，强烈建议使用子账号来访问这个Bucket，这样可以规避主账户AccessKey或者密码泄露导致的问题。步骤如下：

点击创建 AccessKey，再点击开始使用子用户 AccessKey

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_a2929d2eb2304b86b7827c7b1a69bf8d.png?x-oss-process=image/resize,w_1400/format,webp)  

点击创建用户

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_526b506d6dbf49b5996a787f30d72802.png?x-oss-process=image/resize,w_1400/format,webp)  

填写好登录名称，显示名称，勾选控制台访问，OpenAPI调用访问，其他选择默认就好，点击确认，在弹出的安全验证中选择一种方式完成验证。

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_414e8ff71e11495a911f59011250db1a.png?x-oss-process=image/resize,w_1400/format,webp)  

将红框中的AccessKey Id和AccessKey secret复制出来保存好，配置PicGo时要用到。

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_afb84c03c3cf4ae4ae0c46e4f3c6e833.png?x-oss-process=image/resize,w_1400/format,webp)  

## 7\. 配置子账户OSS权限

勾选中用户，点击添加权限，再点击下面两项权限，加到已选择框中。

选择这两项：

* AliyunOSSFullAccess——管理对象存储服务（OSS）权限
* AliyunOSSReadOnlyAccess——只读访问对象存储服务（OSS）的权限

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_b2c2cf098c96403ea00cf148244c03f4.png?x-oss-process=image/resize,w_1400/format,webp)  

点击确定，授权成功了，这时阿里云相关的配置就弄好了。 之前让保存的信息要记好哦，后面还会用到。

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_934b3b8e3ede4777842e593e7cd7179c.png?x-oss-process=image/resize,w_1400/format,webp)  

如果后面不需要使用该账号，点击用户后面的删除选项即可。

# 配置PicGo

## 1\. 安装PicGo

PicGo是一款功能非常强大的图床工具，支持SM.MS、腾讯COS、GitHub图床、七牛云图床、Imgur图床、阿里云OSS、gitee等多种图床平台。

下载地址：[https://github.com/Molunerfinn/PicGo/releases](https://github.com/Molunerfinn/PicGo/releases)

下载正式版或者测试版都可以，正式版会稳定一些，测试版有一些尝鲜功能，用国内可下载链接进行下载会快一些，我这里选择的是[PicGo-Setup-2.4.0-beta.6-x64.exe](https://picgo-release.molunerfinn.com/2.4.0-beta.6/PicGo-Setup-2.4.0-beta.6-x64.exe)这个测试版。

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_3d1758ece9c6425e80a7c3b669623333.png?x-oss-process=image/resize,w_1400/format,webp)  

安装好了之后，打开界面是这样的。

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_7a992c939ad841e2b550bc64543fd737.png?x-oss-process=image/resize,w_1400/format,webp)  

## 2\. PicGo配置阿里云OSS

点击图床设置，阿里云OSS，点击画笔修改。

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_9c3900e013b94c60abe834f1e90a8a79.png?x-oss-process=image/resize,w_1400/format,webp)  

填上前面记录好的值即可

* AccessKey ID（账号）：xxxxxxxxxx
* AccessKey Secret（密钥）：xxxxxxxxxx
* 设定Bucket：刚刚在阿里云OSS中创建的Bucket名称
* 设定存储区域：地域节点中的第一个字段

**划重点！这里一定要注意，设定存储区域里要填的是之前记下来的地域节点里面的第一个字段，比如你的地域节点值是oss-cn-shanghai.aliyuncs.com，那么这里只需要填oss-cn-shanghai，切记，否则配置失败无法上传图片。**

* 设定存储路径：自定义，以/结尾（相当于文件夹），例如 img/

填完了记得拉到下面点击确认保存。

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_f0e82cf957b64d0f96b94676598c2770.png?x-oss-process=image/resize,w_1400/format,webp)  

点击设为默认图床

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_a5b469cdd87248dc8e00fd0745e3fe8a.png?x-oss-process=image/resize,w_1400/format,webp)  

## 3\. PicGo其他配置

你可以根据喜好来设置文件以时间戳格式命名 和 上传后自动复制URL：

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_88bb213d44fc4d1aaa12659e4fe9aa5f.png?x-oss-process=image/resize,w_1400/format,webp)  

上传图片，测试成功！

![image.png](https://ucc.alicdn.com/pic/developer-ecology/ouo2h6jyesw2w_a037e2a8eddf43b88ca6d40f4264a48d.png?x-oss-process=image/resize,w_1400/format,webp)  

到这里PicGo就配置完成了