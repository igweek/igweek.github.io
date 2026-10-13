>[!note]
1、登录虚拟机（Win7 x64），分析系统网络连接和进程情况，描述异常网络连接和异常后门进程以及异常进程文件的绝对路径。
2、确认操作机是否存在“shift 后门”，若存在该后门，请描述如何清除该后门，如何验证后门是否清除成功？

## 第一问：查异常网络连接和进程
`Gmeek-html<video src="/img/video/2.mp4" controls allowfullscreen="true" width="100%" height="460px"></video>`

## 第二问：排查 Shift 后门
1.  锁屏状态下，连续按5次 Shift。
2.  如果弹出 CMD，说明可能存在后门。
3.  按 `Win + R`，输入 `regedit`。
4.  检查 `Image File Execution Options\sethc.exe` 项下的 `Debugger` 值。
5.  如果确认是恶意劫持配置，备份后删除，并重新验证。