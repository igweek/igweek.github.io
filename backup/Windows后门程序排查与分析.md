>[!note]
1、登录虚拟机（Win7 x64），分析系统网络连接和进程情况，描述异常网络连接和异常后门进程以及异常进程文件的绝对路径。
2、确认操作机是否存在“shift 后门”，若存在该后门，请描述如何清除该后门，如何验证后门是否清除成功？

# 1.分析系统网络连接和进程情况
## 第1步：查看网络连接
按 Win + R，输入 cmd，执行：`netsata -ano`
![BI3B9YCGxZu46zqCxHVFdXAP35bNYJL1.webp](https://cdn.nodeimage.com/i/BI3B9YCGxZu46zqCxHVFdXAP35bNYJL1.webp)

## 重点看：
- 外部地址：连接到哪个 IP 和端口。
- 状态：ESTABLISHED 表示连接已建立。
- PID：对应的进程编号。

## 第2步：通过 PID 找到异常进程
**假如，有一个PID为360的是异常进程。**
![mMysieNAVaPp452clZHp52iQ7CuDpAtC.webp](https://cdn.nodeimage.com/i/mMysieNAVaPp452clZHp52iQ7CuDpAtC.webp)
![KVWufn4cy2bHLDs895tFCbxdqjpuuzfR.webp](https://cdn.nodeimage.com/i/KVWufn4cy2bHLDs895tFCbxdqjpuuzfR.webp)

# 2.shift 后门
先理解 Shift 后门
Windows 7 中有一个系统文件：
C:\Windows\System32\sethc.exe
它是 Windows 的“粘滞键”程序。正常情况下，在登录界面连续按 5 次 Shift，会出现粘滞键提示。
攻击者可能通过替换 sethc.exe 或修改注册表，让连续按 Shift 时打开命令提示符，从而形成后门。
## 第1步：检查是否存在 Shift 后门

1. 在 Windows 7 中锁定计算机。
2. 在锁屏登录界面连续按 5 次 Shift。
3. 观察结果。
### 正常情况
![xwVzZfbcN2zLXcjgnR2dNZn4p2xB5rHs.webp](https://cdn.nodeimage.com/i/xwVzZfbcN2zLXcjgnR2dNZn4p2xB5rHs.webp)
### 异常情况
![KVXHbzm5ZPgnFhsCktpK0lgyg6ga8vKX.webp](https://cdn.nodeimage.com/i/KVXHbzm5ZPgnFhsCktpK0lgyg6ga8vKX.webp)



### 第3步：清除 Shift 后门

建议先记录检查结果，必要时保存日志和注册表备份，然后再修复。

方法一：恢复被篡改的系统文件

管理员 CMD 执行：

```
sfc /scanfile=C:\Windows\System32\sethc.exe
```

该命令会尝试修复 `sethc.exe`。

如果单文件修复失败，再执行：

```
sfc /scannow
```

方法二：清除注册表劫持

只有在确认 `sethc.exe` 的 `Debugger` 项是恶意设置时，才执行：

```
reg delete "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\sethc.exe" /v Debugger /f
```

注意：文件替换和注册表劫持是两种不同方式，必须针对实际发现的问题进行修复。

### 第4步：验证是否清除成功

1. 重新启动 Windows 7。
2. 在登录界面连续按 5 次 Shift。
3. 确认不会弹出 CMD。
4. 再运行 `sfc /verifyfile` 检查文件完整性。
5. 再运行 `reg query` 确认不存在异常 `Debugger` 配置。

只有相关检查都正常，才能较充分地说明这种 Shift 后门已被清除。

