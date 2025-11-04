>利用电子取证技术恢复虚拟磁盘（c:\files\test.vhd）唯一分区中的机密文件，并获取机密文件内容。

## MBR结构

**MBR（Master Boot Record，主引导记录） 是硬盘最前端的一个特殊扇区（第 0 扇区，512 字节），它在计算机启动和硬盘分区管理中起核心作用。可以把它理解为 硬盘的“启动导航员”。**

![image.png](https://pic.myla.eu.org/file/1762221072370_image.png)


![image.png](https://pic.myla.eu.org/file/1762139120755_image.png)

### 是否活动分区
活动分区（80）非活动分区（00） 即系统盘还是非系统盘
### 分区类型：
![image.png](https://pic.myla.eu.org/file/fYcm1LMD.png)
### 起始扇区号
### 分区总扇区数
由于题目中只有一个分区，所以
```txt
分区总扇区数=硬盘总扇区数-分区起始扇区
```

### 详细操作视频
**MBR修复**
https://pic.geek.nyc.mn/mbr.mp4
https://pic.geek.nyc.mn/mbr1.mp4