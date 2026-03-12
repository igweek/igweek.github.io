在 **Windows 11** 中，临时文件确实可能会占用很多空间（有时候几十 GB）。这些文件通常存放在几个固定目录，可以安全清理。

---

**一、最主要的临时文件目录**

1️⃣ 用户临时文件目录

路径：

```
C:\Users\你的用户名\AppData\Local\Temp
```

最快打开方法：

1. 按 **Win + R**
2. 输入：

```
%temp%
```

3. 回车

打开后可以 **Ctrl + A 全选 → Delete 删除**。
如果有文件提示“正在使用”，**跳过即可**。

---

2️⃣ 系统临时文件目录

路径：

```
C:\Windows\Temp
```

打开方法：

1. 打开资源管理器
2. 在地址栏输入：

```
C:\Windows\Temp
```

同样可以删除里面的文件。

---

**二、Windows 更新缓存（经常很大）**

路径：

```
C:\Windows\SoftwareDistribution\Download
```

这里是 **Windows 更新下载的缓存**，有时候会占用很多空间。

可以删除里面的所有文件。

---

**三、推荐更简单的方法（系统自带）**

在 **Windows 设置**里清理：

1. 打开
   **设置 → 系统 → 存储**

2. 点击
   **临时文件**

3. 勾选例如：

* 临时文件
* Windows 更新清理
* 缩略图
* DirectX 缓存
* 回收站

4. 点击 **删除文件**

---

**四、一个隐藏的大垃圾目录**

浏览器缓存：

```
C:\Users\用户名\AppData\Local\Microsoft\Edge\User Data\Default\Cache
```

如果你用的是 **Microsoft Edge** 或 **Google Chrome**，缓存也可能很大。

---

**五、最快清理命令（推荐）**

打开 **管理员 PowerShell**，运行：

```
cleanmgr
```

这是 Windows 的 **磁盘清理工具**。

---

✅ **一般最常见的大文件来源：**

* `%temp%`
* `C:\Windows\Temp`
* `SoftwareDistribution`
* 浏览器缓存
* Windows 更新残留

---

