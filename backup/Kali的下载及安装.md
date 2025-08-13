### 项目一：云安全防护基础平台——Kali Linux 安装与配置

#### 一、Kali Linux 安装步骤
1. **下载 Kali Linux 镜像**
   - 访问 [Kali Linux 官网](https://www.kali.org/get-kali/) 下载适合系统架构的 ISO 镜像文件。
   - 校内地址 172.17.15.200/iso
   - 选择合适版本（如：64-bit）并下载。

2. **创建虚拟机（推荐使用 VMware 或 VirtualBox）**
   - 在虚拟机中创建一个新的虚拟机，选择 Linux -> Debian（64-bit）。
   - 分配适当的内存（如：2GB以上），硬盘大小可设置为 20GB 或更大。
   
3. **安装 Kali Linux 系统**
   - 启动虚拟机并加载 Kali Linux 镜像。
   - 进入 Kali Linux 安装界面，选择 **Graphical Install**。
   - 配置语言、时区和键盘布局。
   - 配置网络，选择合适的网络接口。
   - 创建用户和密码。
   - 设置分区，通常选择 **使用整个磁盘**。
   - 安装过程中，系统会提示安装 GRUB 引导程序，选择 **是**。
   - 完成后，重启虚拟机并移除安装镜像，启动 Kali Linux。

![image.png](https://pic.myla.eu.org/file/1740455995938_image.png)
![image.png](https://pic.myla.eu.org/file/1740456041882_image.png)
![image.png](https://pic.myla.eu.org/file/1740456157394_image.png)
![image.png](https://pic.myla.eu.org/file/1740456232402_image.png)
![image.png](https://pic.myla.eu.org/file/1740456326589_image.png)

#### 二、Kali Linux 国内软件源配置
1. **备份原有源列表文件**
   ```bash
   sudo cp /etc/apt/sources.list /etc/apt/sources.list.bak
   ```

2. **编辑源列表**
   ```bash
   sudo nano /etc/apt/sources.list
   ```
   
3. **更换为国内源**
   ```bash
   deb http://mirrors.aliyun.com/kali/ kali-rolling main non-free contrib
   deb-src http://mirrors.aliyun.com/kali/ kali-rolling main non-free contrib
   ```

4. **更新软件包索引**
   ```bash
   sudo apt update
   ```

5. **升级系统**
   ```bash
   sudo apt upgrade -y
   ```
   
![](https://pic.myla.eu.org/file/1740455995938_image.png)

#### 三、安装 TOR 和 VPN

##### 1. TOR（The Onion Router）概念
TOR 是一个用于匿名网络通信的工具，它通过多层加密技术，使得数据传输在多个中继节点之间传递，达到隐藏用户身份和位置的效果。TOR 常用于保障网络隐私，绕过审查，避免追踪。

1. **安装 TOR**
   ```bash
   sudo apt install tor -y
   ```

2. **启动 TOR 服务**
   ```bash
   sudo systemctl start tor
   ```

3. **检查 TOR 是否正常工作**
   ```bash
   sudo systemctl status tor
   ```

4. **配置浏览器使用 TOR**
   打开 Firefox 浏览器，安装 TOR Browser，通过它访问 TOR 网络。

##### 2. VPN（Virtual Private Network）概念
VPN 是一种通过公共网络（如互联网）建立加密隧道连接的技术，确保用户的网络流量在传输过程中是安全的。它可以隐藏用户的真实 IP 地址，保护通信内容不被窃听或篡改。

1. **安装 OpenVPN**
   ```bash
   sudo apt install openvpn -y
   ```

2. **配置 VPN**
   将 VPN 服务商提供的 `.ovpn` 配置文件复制到 `/etc/openvpn/` 目录。

3. **连接 VPN 服务**
   ```bash
   sudo openvpn --config /etc/openvpn/your-vpn-config-file.ovpn
   ```

4. **自动启动 VPN 服务**
   ```bash
   sudo systemctl enable openvpn@your-vpn-config-file
   ```

5. **检查 VPN 状态**
   ```bash
   sudo systemctl status openvpn@your-vpn-config-file
   ```

#### 四、设置中文界面和中文输入法

1. **打开终端**：点击屏幕左上角的“Kali”菜单，选择“终端”以打开终端窗口。

2. **安装中文语言包**：在终端中输入以下命令以安装中文语言支持包：

   ```bash
   sudo apt-get update
   sudo apt-get install locales
   ```


3. **配置语言环境**：安装完成后，运行以下命令配置语言环境：

   ```bash
   sudo dpkg-reconfigure locales
   ```


   在弹出的界面中，使用上下箭头键选择 `zh_CN.UTF-8`，然后按空格键选中，接着按 `Tab` 键选择 `<OK>`，最后按回车键确认。

4. **设置默认语言**：继续运行以下命令，设置系统默认语言为中文：

   ```bash
   sudo update-locale LANG=zh_CN.UTF-8
   ```


5. **安装中文字体**：为了确保中文显示正常，您需要安装中文字体。可以使用以下命令安装常用的中文字体：

   ```bash
   sudo apt-get install fonts-wqy-microhei fonts-wqy-zenhei
   ```


6. **重启系统**：完成上述步骤后，重启系统使设置生效：

   ```bash
   sudo reboot
   ```


重启后，Kali Linux 的系统界面、终端以及应用程序等应该都会显示为简体中文。

如果您需要输入中文，可以安装中文输入法。

例如，安装 Fcitx 输入法框架：


```bash
sudo apt-get install fcitx fcitx-googlepinyin
```


安装完成后，您可以通过系统设置中的“区域和语言”部分进行配置。

在配置工具中，您还可以设置切换输入法的快捷键。

通常，默认的快捷键是 `Ctrl+空格` 或 `Super+空格`（Super 键即 Windows 键），但您可以根据自己的习惯进行修改。

#### 五、系统清理
在Kali Linux中，可以使用以下命令进行系统清理：

1. **更新软件包列表**：
   ```bash
   sudo apt update
   ```

2. **升级已安装的软件包**：
   ```bash
   sudo apt upgrade
   ```

3. **清理不再需要的依赖包**：
   ```bash
   sudo apt autoremove
   ```

4. **清理本地存储的已下载软件包**：
   ```bash
   sudo apt clean
   ```

