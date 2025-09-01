## 文件与目录操作

‌创建目录‌：在/home/user下新建名为projects的目录
mkdir /home/user/projects

‌递归创建目录‌：创建嵌套目录/data/app/logs（确保父目录不存在时自动创建）
mkdir -p /data/app/logs

‌复制文件‌：将file1.txt复制到/backup目录下并重命名为file1_bak.txt
cp file1.txt /backup/file1_bak.txt

‌递归复制目录‌：复制/var/www目录及其所有内容到/backup
cp -r /var/www /backup

‌移动文件‌：将当前目录下所有.log文件移动到/var/logs目录
mv *.log /var/logs

‌重命名文件‌：将old_name.txt重命名为new_name.txt
mv old_name.txt new_name.txt

‌删除文件‌：删除当前目录下所有.tmp临时文件（非递归）
rm *.tmp

‌强制删除目录‌：递归强制删除/cache目录及其所有内容
rm -rf /cache

‌创建空文件‌：在/tmp下创建名为lockfile的空文件
touch /tmp/lockfile

‌创建硬链接‌：为/data/file.txt创建硬链接/backup/file_link.txt
ln /data/file.txt /backup/file_link.txt

## 文本处理

‌查看文件开头‌：查看/var/log/syslog的前10行内容
head -n 10 /var/log/syslog

‌查看文件末尾‌：实时监控/var/log/apache/access.log的新增内容
tail -f /var/log/apache/access.log

‌关键词搜索‌：在config.conf中搜索包含"error"的行（忽略大小写）
grep -i "error" config.conf

‌递归搜索文本‌：在/etc目录下所有.conf文件中查找"timeout"关键词
grep -r "timeout" /etc/*.conf

‌统计行数‌：统计data.csv的总行数
wc -l data.csv

‌文本替换‌：将document.txt中所有"old"替换为"new"（原地修改）
sed -i 's/old/new/g' document.txt

‌删除空行‌：删除notes.txt中的所有空行并保存为新文件clean_notes.txt
sed '/^$/d' notes.txt > clean_notes.txt

‌列格式化输出‌：用:分隔符显示/etc/passwd的第1列和第3列
awk -F':' '{print $1,$3}' /etc/passwd

‌合并文件‌：将file1.txt和file2.txt合并为combined.txt
cat file1.txt file2.txt > combined.txt

‌排序去重‌：对usernames.txt排序并去重后输出到sorted_users.txt
sort -u usernames.txt > sorted_users.txt

## 权限管理

‌修改文件权限‌：设置script.sh为所有者可读写执行，组和其他人只读
chmod 755 script.sh
或
chmod u=rwx,go=r script.sh

‌修改所有者‌：将/data/reports目录的所有者改为admin用户
chown admin /data/reports

‌递归修改权限‌：将/var/www/html下所有文件设为644，目录设为755
find /var/www/html -type f -exec chmod 644 {} \;
find /var/www/html -type d -exec chmod 755 {} \;

‌设置SUID‌：为/usr/bin/backup_tool设置SUID权限
chmod u+s /usr/bin/backup_tool

## 系统信息查看

‌查看磁盘空间‌：以人类可读格式显示所有挂载点的磁盘使用情况
df -h

‌查看目录大小‌：统计/home目录占用的磁盘空间（人类可读）
du -sh /home

‌查看内存使用‌：显示内存和交换空间使用情况（MB单位）
free -m

‌查看进程‌：列出所有包含"nginx"关键字的进程
ps aux | grep nginx

‌实时监控进程‌：动态显示CPU占用最高的进程
top（进入后按P键排序）

‌查看系统负载‌：显示过去1/5/15分钟的系统负载
uptime

## 进程管理

‌终止进程‌：强制终止PID为2248的进程
kill -9 2248

‌批量结束进程‌：终止所有名为"chromium"的进程
pkill chromium

‌后台运行程序‌：将python app.py放入后台运行
python app.py &

‌查看后台任务‌：列出所有后台任务
jobs

‌切换后台任务‌：将后台任务%2切换到前台
fg %2

## 压缩与归档

‌压缩目录‌：将/data/docs目录打包为docs.tar.gz（使用gzip压缩）
tar -czvf docs.tar.gz /data/docs

‌解压文件‌：解压backup.tar.bz2到当前目录
tar -xjvf backup.tar.bz2

‌创建zip压缩包‌：将file1.log和file2.log压缩为logs.zip
zip logs.zip file1.log file2.log

‌解压zip文件‌：解压archive.zip到/tmp/extracted目录
unzip archive.zip -d /tmp/extracted

## 查找与定位

‌按文件名查找‌：在/etc目录下查找所有.conf后缀的文件
find /etc -name "*.conf"

‌按大小查找‌：查找/var目录下大于100MB的文件
find /var -size +100M

‌按时间查找‌：查找/home目录下7天内修改过的文件
find /home -mtime -7

‌定位二进制路径‌：查找ls命令的完整路径
which ls

‌搜索命令文档‌：在man手册中搜索与"partition"相关的命令
man -k partition 或 apropos partition

## 用户与组管理

‌创建用户‌：新建用户testuser并自动创建家目录
useradd -m testuser

‌设置密码‌：为用户testuser设置登录密码
passwd testuser

‌删除用户‌：删除用户olduser并移除其家目录
userdel -r olduser

‌创建用户组‌：创建名为developers的新组
groupadd developers

‌用户加入组‌：将用户john添加到sudo组
usermod -aG sudo john

‌查看用户组‌：显示当前用户所属的所有组
groups

## 软件包管理（Debian/Ubuntu）

‌更新源列表‌：刷新APT软件包索引
sudo apt update

‌安装软件‌：安装nginx服务器
sudo apt install nginx

‌卸载软件‌：卸载apache2保留配置文件
sudo apt remove apache2

‌彻底卸载‌：完全卸载mysql-server（包括配置文件）
sudo apt purge mysql-server

‌搜索软件包‌：在仓库中搜索包含"pdf"关键字的软件包
apt search pdf

软件包管理（CentOS/RHEL）
‌安装软件‌：用YUM安装vim编辑器
sudo yum install vim

‌卸载软件‌：移除httpd服务
sudo yum remove httpd

‌查询文件来源‌：查找/usr/bin/gcc属于哪个软件包
yum provides /usr/bin/gcc

## 计划任务

‌添加定时任务‌：每天凌晨3点执行/backup/backup.sh
crontab -e 添加：
0 3 * * * /backup/backup.sh

‌列出定时任务‌：显示当前用户的cron任务
crontab -l

## 文件系统操作

‌挂载磁盘‌：将/dev/sdb1挂载到/mnt/data
mount /dev/sdb1 /mnt/data

‌卸载磁盘‌：卸载/mnt/data挂载点
umount /mnt/data

‌检查磁盘错误‌：检查/dev/sda1的文件系统错误
fsck /dev/sda1

## 网络配置（单机相关）

‌查看主机名‌：显示当前系统主机名
hostname

‌修改主机名‌：临时将主机名改为server01（重启失效）
hostname server01

‌查看IP地址‌：显示所有网卡的IP地址信息
ip addr show 或 ifconfig

环境变量
‌查看环境变量‌：显示PATH变量的内容
echo $PATH

‌临时设置变量‌：设置临时环境变量APP_ENV=production
export APP_ENV=production

‌持久化变量‌：将JAVA_HOME=/opt/jdk添加到用户环境变量
echo 'export JAVA_HOME=/opt/jdk' >> ~/.bashrc

杂项操作
‌清空文件内容‌：清空/var/log/app.log文件（不删除文件）
> /var/log/app.log 或 truncate -s 0 /var/log/app.log

‌比较文件差异‌：对比file_v1.txt和file_v2.txt的不同
diff file_v1.txt file_v2.txt

‌生成随机密码‌：生成16字符的随机密码（含大小写字母和数字）
tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 16

‌计算文件哈希‌：计算installer.iso的SHA256校验值
sha256sum installer.iso

‌查看命令历史‌：显示最近30条命令历史
history 30

‌重定向错误输出‌：运行test.sh并将错误信息保存到error.log
bash test.sh 2> error.log

‌创建符号链接‌：为/opt/app/bin创建桌面快捷方式~/Desktop/app_link
ln -s /opt/app/bin ~/Desktop/app_link

‌改变文件时间戳‌：将file.txt的修改时间设为当前时间
touch file.txt

‌按列分割文件‌：用cut提取passwd文件的第1列（用户名）
cut -d: -f1 /etc/passwd

‌合并两文件列‌：将names.txt和ids.txt按列合并为name_id.txt
paste names.txt ids.txt > name_id.txt

‌转换文件编码‌：将GBK编码的data.txt转为UTF-8
iconv -f GBK -t UTF-8 data.txt > data_utf8.txt

## 高级文本处理

‌统计词频‌：统计document.txt中每个单词出现的频率
tr '[:space:]' '[\n*]' < document.txt | grep -v "^$" | sort | uniq -c | sort -nr

‌提取XML内容‌：从config.xml中提取所有<title>标签的内容
grep -oP '<title>\K[^<]+' config.xml

‌批量重命名‌：将当前目录所有.jpg文件后缀改为.jpeg
rename 's/\.jpg$/.jpeg/' *.jpg

‌文本去重‌：对log.txt按行去重（保留顺序）
awk '!seen[$0]++' log.txt

‌数值计算‌：计算numbers.txt中所有数字的总和
awk '{sum+=$1} END{print sum}' numbers.txt

## 系统管理

‌关机命令‌：立即关闭系统
shutdown now

‌重启命令‌：10分钟后重启系统
shutdown -r +10

‌查看内核版本‌：显示当前Linux内核版本
uname -r

‌查看发行版信息‌：显示系统发行版详细信息
cat /etc/os-release

‌查看登录用户‌：显示当前登录系统的用户
who

‌查看命令帮助‌：查看grep命令的简明手册
grep --help

‌查看完整手册‌：阅读tar命令的完整手册页
man tar

## 文件传输（单机内）

‌本地复制到远程目录‌：用scp将本地的data.bin复制到远程服务器（题目要求单机，此处调整为单机内操作）
改为：将/local/file复制到同一台机器的/remote_dir
cp /local/file /remote_dir/
资源限制
‌限制CPU时间‌：运行stress命令并限制最多使用50% CPU
cpulimit -l 50 -i stress --cpu 1
信号控制
‌发送信号‌：向PID为1234的进程发送SIGHUP信号（重新加载配置）
kill -HUP 1234
归档备份
‌差异备份‌：备份/home中修改过的文件到home_diff.tar
tar -cvf home_diff.tar -N "$(date -d '1 day ago' '+%F')" /home
设备管理
‌查看USB设备‌：列出所有连接的USB设备信息
lsusb

‌查看块设备‌：列出所有磁盘分区信息
lsblk

内核模块
‌查看加载模块‌：显示已加载的内核模块
lsmod

‌加载模块‌：加载nvidia内核模块
modprobe nvidia

