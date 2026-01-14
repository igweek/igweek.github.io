> [!note]
Ghost 是目前最优雅的博客平台之一，而 1Panel 则是新一代的国产服务器面板神器。将两者结合，可以极快地搭建一个现代化博客。
但在使用 Ghost 时，最让人头疼的往往是**邮件配置**。无论是用户注册（事务性邮件）还是发送 Newsletter（订阅邮件），如果配置不当，邮件很容易被拦截或进入垃圾箱。


## 前置准备

1. 一台安装了 **1Panel** 的 Linux 服务器。
2. 一个域名（本文以 `abc.com` 为例）。
3. 一个 **Mailgun** 账号（用于发送邮件，建议注册 Pay As You Go 方案）。

---

## 第一步：配置 Mailgun（获取两把“钥匙”）

在安装 Ghost 之前，我们必须先搞定邮件服务。Ghost 的邮件系统分为两部分，我们需要从 Mailgun 获取两组不同的凭证：

1. **SMTP 凭证**：用于发送注册链接、密码重置等（事务性邮件）。
2. **API Key**：用于批量发送订阅文章（Newsletter）。

### 1. 添加域名

登录 Mailgun 后台，点击 **Sending** -> **Domains** -> **Add New Domain**。

* **建议使用二级域名**：为了保护主域名的信誉度，推荐使用 `mg.abc.com` 或 `mail.abc.com`。

### 2. 配置 DNS 验证

Mailgun 会提供几个 DNS 记录（TXT, MX, CNAME）。你需要去你的域名解析商（如 Cloudflare、阿里云）添加这些记录。

* **注意**：等待 DNS 生效，直到 Mailgun 后台显示域名状态为绿色 **Active**。

### 3. 获取 SMTP 账号密码 (用于事务性邮件)

在 Domain Settings 中找到 **SMTP Credentials**。

* 点击 **Reset Password** 或 **New SMTP User**。
* 记录下 **Login** (例如 `postmaster@mg.abc.com`)。
* 记录下 **Password** (生成的一长串字符，**只显示一次，务必保存好**)。

### 4. 获取 API Key (用于 Newsletter)

在 Mailgun 右上角点击头像 -> **API Security** -> **Create new API key**。

* 保存好这个 `key-xxxxxxxx` 开头的密钥。

---

## 第二步：在 1Panel 中安装 Ghost

1. 打开 1Panel 面板，进入 **应用商店**。
2. 搜索 **Ghost** 并点击安装。
3. 在安装界面的设置中，我们建议**不要**直接填写简单的参数，而是通过**编辑 Docker Compose** 或者在安装后修改环境变量来确保配置精确。
4. 你可以先用默认参数安装，安装完成后，**立即停止容器**。

---

## 第三步：深度配置 Ghost (核心步骤)

这是最关键的一步。我们需要通过修改 Docker 的环境变量，将 Ghost 与 Mailgun 完美连接。

1. 在 1Panel 中进入 **容器** 列表，找到 Ghost 容器。
2. 点击 **编辑**，或者直接修改其关联的 `docker-compose.yml` 文件。
3. 在 `environment` 区域，填入以下配置：

```yaml
environment:
  # 基础设置
  url: https://abc.com  # 你的博客主域名(不带端口)
  
  # 数据库设置 (保持 1Panel 默认即可，通常不需要动)
  database__client: mysql
  database__connection__host: mysql
  # ...其他数据库参数保持原样...

  # --- Mailgun SMTP 配置 (解决注册收不到邮件) ---
  mail__transport: SMTP
  mail__options__service: Mailgun
  mail__options__host: smtp.mailgun.org
  mail__options__port: 587
  mail__options__secure: 'false'  # 587端口通常填false(使用STARTTLS)
  mail__options__auth__user: postmaster@mg.abc.com  # 第一步获取的 SMTP Login
  mail__options__auth__pass: 你的SMTP密码           # 第一步获取的 SMTP Password
  
  # --- 强制发件人地址 (避免 553 错误) ---
  # 这里的发件人必须与 mail__options__auth__user 保持一致，或者是该域名的别名
  mail__from: 'My Blog Team <postmaster@mg.abc.com>'

```

4. **保存并重建容器**。

---

## 第四步：配置反向代理 (让域名可访问)

如果你使用的是 1Panel 的 OpenResty (Nginx) 管理网站：

1. 进入 **网站** -> **创建网站** -> **反向代理**。
2. **主域名**：填写 `abc.com`。
3. **代理地址**：`127.0.0.1:2368` (Ghost 默认端口)。
4. **HTTPS**：勾选并申请/配置证书。

*如果你像我一样使用 **Cloudflare Tunnel**，则直接在 Cloudflare Zero Trust 后台将 `abc.com` 指向服务器的 `localhost:2368` 即可，无需在 1Panel 创建网站。*

---

## 第五步：在 Ghost 后台配置 Newsletter

容器重启成功后，你的博客应该可以正常访问，且注册功能（事务性邮件）已经可以使用了。现在我们要配置批量发送功能。

1. 登录 Ghost 后台 `https://abc.com/ghost`。
2. 点击左下角 **Settings (齿轮)** -> **Newsletters**。
3. 展开 **Mailgun** 设置区域。
4. 填写以下信息：
* **Mailgun Region**: 选择你注册时的区域 (US 或 EU)。
* **Mailgun Domain**: `mg.abc.com` (你第一步添加的域名)。
* **Mailgun Private API Key**: 填入第一步获取的 API Key。


5. **保存**。

---

## 第六步：最终验证

为了确保万无一失，我们需要进行两次测试：

1. **测试事务性邮件**：
* 打开浏览器的“无痕模式”，访问博客主页。
* 点击 **Subscribe** 或 **Sign in**。
* 输入一个你自己的真实邮箱。
* **结果**：如果能收到登录链接（Magic Link），说明 **SMTP 配置成功**。


2. **测试 Newsletter**：
* 在后台新建一篇 Post。
* 点击发布，选择 **Email only** (仅发送邮件) 进行测试，或者使用 "Preview" 中的 "Send test email"。
* **结果**：如果测试邮件能送达，说明 **Mailgun API 配置成功**。



---

## 常见问题排查 (Troubleshooting)

* **错误：553 Mail from must equal authorized user**
* **原因**：Ghost 尝试用 `noreply@abc.com` 发信，但 Mailgun 对应的账号是 `postmaster@mg.abc.com`。
* **解决**：
1. 检查 `docker-compose` 里是否配置了 `mail__from`。
2. 进入 Ghost 后台 -> Settings -> Members -> **Support email address**，强制改为 `postmaster@mg.abc.com`。




* **错误：Connection Timed Out**
* **原因**：服务器防火墙拦截了 587 端口。
* **解决**：在 1Panel 的防火墙设置或云服务商的安全组中，放行 TCP 587 端口出站流量。



---

### 结语

通过 1Panel + Docker + Ghost + Mailgun 的组合，我们构建了一个既有高性能（Docker），又有高易用性（1Panel），且邮件送达率极高（Mailgun）的专业博客平台。

虽然配置过程稍显繁琐，但一旦设置完成，你就拥有了一个完全属于自己的、数据可控的、且能与读者保持紧密联系的数字花园。Happy Blogging!

---
