![image.png](https://pic.myla.eu.org/file/1747622262076_image.png)

# 简单实用的Shell脚本示例及解释

## 1. 欢迎脚本

```bash
#!/bin/bash
# 简单的欢迎脚本

echo "请输入你的名字:"
read name
echo "你好, $name! 欢迎使用Shell脚本!"
```

### 命令解释：
- `#!/bin/bash` - 指定使用bash shell执行此脚本
- `#` - 注释符号，后面的内容不会执行
- `echo` - 打印文本到屏幕
- `read name` - 读取用户输入并存储到变量`name`中
- `$name` - 使用变量`name`的值

## 2. 计算器脚本

```bash
#!/bin/bash
# 简单的加法计算器

echo "请输入第一个数字:"
read num1
echo "请输入第二个数字:"
read num2

sum=$((num1 + num2))
echo "两数之和是: $sum"
```

### 命令解释：
- `read num1` - 读取用户输入的第一个数字
- `$(( ))` - 算术运算的语法
- `sum=$((num1 + num2))` - 计算两个数字的和并赋值给变量sum

## 3. 文件检查脚本

```bash
#!/bin/bash
# 检查文件是否存在

echo "请输入要检查的文件路径:"
read filepath

if [ -f "$filepath" ]; then
    echo "文件 $filepath 存在!"
else
    echo "文件 $filepath 不存在!"
fi
```

### 命令解释：
- `if [ -f "$filepath" ]` - 检查文件是否存在
  - `-f` - 检查是否是普通文件
- `then` - if条件成立时执行的代码开始
- `else` - if条件不成立时执行的代码开始
- `fi` - if语句结束

## 4. 当前目录文件列表

```bash
#!/bin/bash
# 显示当前目录下的文件

echo "当前目录下的文件和文件夹:"
ls
```

### 命令解释：
- `ls` - 列出当前目录下的文件和文件夹

## 5. 系统时间显示

```bash
#!/bin/bash
# 显示当前日期和时间

current_date=$(date +"%Y-%m-%d")
current_time=$(date +"%H:%M:%S")

echo "今天是: $current_date"
echo "现在时间是: $current_time"
```

### 命令解释：
- `date +"%Y-%m-%d"` - 以年-月-日格式显示日期
- `date +"%H:%M:%S"` - 以时:分:秒格式显示时间
- `$( )` - 执行括号内的命令并将结果赋值给变量

## 6. 简单的循环示例

```bash
#!/bin/bash
# 打印数字1到5

for i in 1 2 3 4 5
do
    echo "数字: $i"
done
```

### 命令解释：
- `for i in 1 2 3 4 5` - 循环5次，i的值依次为1到5
- `do` - 循环体开始
- `done` - 循环结束

## 如何使用这些脚本

1. 将代码保存为`.sh`文件，例如`welcome.sh`
2. 给脚本执行权限：
   ```bash
   chmod +x welcome.sh
   ```
3. 运行脚本：
   ```bash
   ./welcome.sh
   ```


# shell脚本进阶

## 1. 系统信息检查脚本

```bash
#!/bin/bash
# 这是一个显示系统信息的脚本

echo "===== 系统信息 ====="
echo "当前用户: $(whoami)"
echo "主机名: $(hostname)"
echo "===== 系统时间 ====="
date
echo "===== 系统运行时间 ====="
uptime
echo "===== 磁盘使用情况 ====="
df -h
echo "===== 内存使用情况 ====="
free -m
```

### 命令解释：
- `#!/bin/bash`：指定使用bash shell执行此脚本
- `# 这是一个...`：注释行，解释脚本用途
- `echo`：打印后面的文本到屏幕
- `$(command)`：执行括号内的命令并返回结果
- `whoami`：显示当前登录用户名
- `hostname`：显示系统主机名
- `date`：显示当前日期和时间
- `uptime`：显示系统运行时间和平均负载
- `df -h`：以易读格式(GB,MB)显示磁盘空间使用情况
- `free -m`：以MB为单位显示内存使用情况

## 2. 文件备份脚本

```bash
#!/bin/bash
# 文件备份脚本

backup_dir="/backup"
source_dir="/home/user/documents"
timestamp=$(date +%Y%m%d_%H%M%S)
backup_file="backup_$timestamp.tar.gz"

if [ ! -d "$backup_dir" ]; then
    mkdir -p "$backup_dir"
fi

tar -czf "$backup_dir/$backup_file" "$source_dir"

if [ $? -eq 0 ]; then
    echo "备份成功完成: $backup_file"
else
    echo "备份失败!" >&2
    exit 1
fi
```

### 命令解释：
- `backup_dir="/backup"`：定义变量，设置备份目录路径
- `timestamp=$(date +%Y%m%d_%H%M%S)`：获取当前时间戳，格式为年月日_时分秒
- `if [ ! -d "$backup_dir" ]; then`：检查目录是否存在
- `mkdir -p`：创建目录，-p参数确保父目录不存在时一并创建
- `tar -czf`：创建压缩归档文件
  - `-c`：创建新归档
  - `-z`：使用gzip压缩
  - `-f`：指定文件名
- `$?`：上一条命令的退出状态
- `-eq 0`：检查是否等于0(成功)
- `>&2`：将输出重定向到标准错误
- `exit 1`：以错误状态退出脚本

## 3. 日志文件分析脚本

```bash
#!/bin/bash
# 分析日志文件中的错误

log_file="/var/log/syslog"
error_keywords=("error" "failed" "warning")
output_file="error_report.txt"

if [ ! -f "$log_file" ]; then
    echo "错误: 日志文件 $log_file 不存在!" >&2
    exit 1
fi

> "$output_file"  # 清空输出文件

for keyword in "${error_keywords[@]}"; do
    echo "===== $keyword =====" >> "$output_file"
    grep -i "$keyword" "$log_file" | tail -n 10 >> "$output_file"
    echo "" >> "$output_file"
done

echo "错误报告已生成: $output_file"
```

### 命令解释：
- `error_keywords=("error" "failed" "warning")`：定义数组变量
- `"${error_keywords[@]}"`：展开数组所有元素
- `> "$output_file"`：清空文件内容(重定向空输出到文件)
- `grep -i`：搜索文本，-i忽略大小写
- `|`：管道，将前一个命令的输出作为后一个命令的输入
- `tail -n 10`：显示最后10行
- `>>`：追加输出到文件

## 4. 用户账户管理脚本

```bash
#!/bin/bash
# 批量添加用户

user_list=("user1" "user2" "user3")
default_password="ChangeMe123"

if [ $(id -u) -ne 0 ]; then
    echo "该脚本需要root权限!" >&2
    exit 1
fi

for user in "${user_list[@]}"; do
    if id "$user" &>/dev/null; then
        echo "用户 $user 已存在，跳过..."
    else
        useradd -m -s /bin/bash "$user"
        echo "$user:$default_password" | chpasswd
        passwd -e "$user"  # 强制用户首次登录修改密码
        echo "已创建用户: $user"
    fi
done
```

### 命令解释：
- `id -u`：显示当前用户ID(0表示root)
- `-ne 0`：不等于0
- `id "$user" &>/dev/null`：检查用户是否存在，丢弃所有输出
- `useradd`：添加用户
  - `-m`：创建用户主目录
  - `-s`：指定默认shell
- `chpasswd`：批量修改密码
- `passwd -e`：使密码立即过期，强制用户首次登录修改
- `&>/dev/null`：将标准输出和错误都重定向到/dev/null(丢弃)

## 5.系统监控脚本
```shell
#!/bin/bash
# 获取系统信息
cpu=$(top -bn1 | grep load | awk '{printf "%.2f", $(NF-2)}')
mem=$(free -m | awk '/Mem/{print $3"MB"}')
disk=$(df -h | awk '/\/$/{print $5}')

# 发送警报
if (( $(echo "$cpu > 80" | bc -l) )); then
    echo "High CPU usage: $cpu%" | mail -s "Alert" admin@example.com
fi

# 输出报告
echo "CPU: $cpu | Memory: $mem | Disk: $disk"
```
### 解释
- top -bn1：非交互式获取系统状态
- awk：文本处理工具
- bc -l：浮点数比较
- mail：发送邮件通知


