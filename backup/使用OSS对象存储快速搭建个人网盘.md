1. 选择实验资源

本实验支持实验资源体验、开通免费试用、个人账户资源三种实验资源方式。

在实验开始前，请您选择其中一种实验资源，单击确认开启实验。

![](https://ucc.alicdn.com/pic/developer-ecology/ymx73xcooyslq_bab251dd5f15411985dfbf31eab8f62c.png)

- 如果您选择的是实验资源体验，资源创建过程需要3～5分钟（视资源不同开通时间有所差异，ACK等资源开通时间较长）。完成实验资源的创建后，在实验室页面左侧导航栏中，单击云产品资源列表，可查看本次实验资源相关信息（例如子用户名称、子用户密码、AK ID、AK Secret、资源中的项目名称等）。
    

说明：实验环境一旦开始创建则进入计时阶段，建议学员先基本了解实验具体的步骤、目的，真正开始做实验时再进行创建。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_f3e5ba68d71542458ce06d30dfa2f0bc.png)

- 如果您选择的是开通免费试用，下方卡片会展示本实验支持的试用规格，可以选择你要试用的云产品资源进行开通。您在实验过程中，可以随时用右下角icon唤起试用卡片。
    

说明：试用云产品开通在您的个人账号下，并占用您的试用权益。如试用超出免费试用额度，可能会产生一定费用。

阿里云支持试用的产品列表、权益及具体规则说明请参考[开发者试用中心](https://free.aliyun.com/)。

![](https://ucc.alicdn.com/pic/developer-ecology/o23ywodss4pji_3eb1c4cf59424b4a904ee718f362d6b7.png)

2. 创建实验资源

本步骤指导您如何创建文件存储OSS。

如果您已创建相关资源，请您选择个人账户资源，并跳过本小节，直接进行实验操作即可。

本步骤仅作为参考使用，您可以根据需求自行选择配置。

### 如果您选择的是开通免费试用，参考以下步骤创建相关资源。

1. 在实验室页面下方，选择对象存储OSS，单击立即试用。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_58bb9951f2e64952a3e40e29150f8cff.png)

2. 在对象存储OSS试用开通页面，在确认并了解相关信息后，根据页面提示申请试用。
    

说明：如果您的对象存储OSS资源抵扣包已使用完毕或无领取资格，请您选择个人账户资源，创建文件存储OSS。

3. 前往[对象存储OSS控制台](https://oss.console.aliyun.com/overview)[](https://fcnext.console.aliyun.com/)。如果您没有开通过OSS服务，系统会提示您开通OSS服务，请按照页面提示开通OSS服务。
    
4. 在左侧导航栏中，单击Bucket列表。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_2c2a4c1af61a436080fbb187cc9b811f.png)

5. 在Bucket列表页面，单击创建Bucket。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_39631d8428a24809adfd92b5c02a6e7b.png)

6. 在创建Bukcet面板，参考如下说明配置OSS，未提及的配置保持默认选项，然后单击确定。
    

参数说明：

|   |   |   |
|---|---|---|
|配置项|示例|说明|
|Bukcet名称|test-xxx|自定义Bucket名称|
|地域|地域：华东2（上海）|实例创建后，无法直接更改地域和可用区，请谨慎选择。|

### 如果您选择的是选择个人账户资源，参考以下步骤创建相关资源。

1. 前往[对象存储OSS控制台](https://oss.console.aliyun.com/overview)。
    
2. 在左侧导航栏中，单击Bucket列表。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_2c2a4c1af61a436080fbb187cc9b811f.png)

3. 在Bucket列表页面，单击创建Bucket。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_39631d8428a24809adfd92b5c02a6e7b.png)

4. 在创建Bukcet面板，参考如下说明配置OSS，未提及的配置保持默认选项，然后单击确定。
    

参数说明：

|          |            |                           |
| -------- | ---------- | ------------------------- |
| 配置项      | 示例         | 说明                        |
| Bukcet名称 | test-xxx   | 自定义Bucket名称               |
| 地域       | 地域：华东2（上海） | 实例创建后，无法直接更改地域和可用区，请谨慎选择。 |
3. 登录对象存储OSS控制台

本步骤指导您如何登录对象存储OSS控制台，并查看OSS Bucket。

1. 在RAM用户登录框中单击下一步，并复制粘贴页面左上角的子用户密码到用户密码输入框，单击登录。
    
2. 复制下方地址，在无影云安全浏览器中打开新页签，粘贴并访问对象存储OSS控制台。
    

```
https://oss.console.aliyun.com/
```

3. 在左侧导航栏中，单击Bucket列表。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_2c2a4c1af61a436080fbb187cc9b811f.png)

4. 在Bucket列表页面，您可以找到实验室分配的Bucket。
    

说明：你可在云产品资源列表中查看云起实验室分配的对象存储OSS资源。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_c5097d6679be43c88d16518fcc249af9.png)

5. 在您的本机浏览器中打开新页签，复制下方地址到地址栏中，下载我们将要上传到OSS中的测试文件。
    

说明：请您在本机浏览器中下载测试文件。

```
https://labfileapp.oss-cn-hangzhou.aliyuncs.com/%E6%97%A5%E5%BF%97%E6%9C%8D%E5%8A%A1/testlog.csv
```

4. 登录对象存储OSS控制台

本步骤指导您如何登录对象存储OSS控制台，并查看OSS Bucket。

1. 前往[对象存储OSS控制台](https://oss.console.aliyun.com/overview)。
    
2. 在左侧导航栏中，单击Bucket列表。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_2c2a4c1af61a436080fbb187cc9b811f.png)

3. 在Bucket列表页面，您可以找到您创建的Bucket。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_c5097d6679be43c88d16518fcc249af9.png)

4. 在您的本机浏览器中打开新页签，复制下方地址到地址栏中，下载我们将要上传到OSS中的测试文件。
    

说明：请您在本机浏览器中下载测试文件。

```
https://labfileapp.oss-cn-hangzhou.aliyuncs.com/%E6%97%A5%E5%BF%97%E6%9C%8D%E5%8A%A1/testlog.csv
```

5. 利用图形化工具使用对象存储OSS

6. 在您的本机浏览器中，访问地址[https://help.aliyun.com/document_detail/209974.html](https://help.aliyun.com/document_detail/209974.html)，根据您电脑的操作系统，下载对应的ossbrowser安装包。
    

说明：在使用公共资源进行实验时，虚拟桌面环境不支持安装ossbrowser，请您使用本地电脑进行安装ossbrowser。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_5f41692dcea64683938758dfa9e0df29.png)

2. 解压ossbrowser安装包，双击打开oss-browser.exe。
    

说明：本实验以Windows系统为例，其他操作系统请参考[安装并登录ossbrowser](https://help.aliyun.com/document_detail/209974.html)官网文档。

![](https://ucc.alicdn.com/pic/developer-ecology/am22xgmbpd4os_800def19a433407181c1c36dce66c89a.png)

3. 在AK登录对话框中，填写AccessKeyId和AccessKeySecret，其他配置保持默认，单击登入。
    

说明：请您在云产品资源列表中查看实验室分配的AccessKeyId和AccessKeySecret。本实验以通过AK登录ossbrowser方式为例，通过授权码方式登录ossbrowser请参考[安装并登录ossbrowser](https://help.aliyun.com/document_detail/209974.html)官网文档。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_eaaec8ef5dc549ecb1e9770d7ca43a59.png)

4. 在OSS Browser中，找到对应OSS的Bucket，单击Bucket名称。
    

说明：

- 你可在云产品资源列表中查看实验室分配的Bucket名称。
    
- 在使用公共资源进行实验时，实验室分配的子账号不支持创建和删除Bucket权限。若要体验创建和删除Bucket步骤，请使用您个人资源进行实验，并注意可能会产生费用问题。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_8aeee48699f04d0094d0fb821e9348ee.png)

5. 根据云产品资源列表中的Object路径，在OSS Browser中，进入到对应的目录下。
    

说明：在使用公共资源进行实验时，实验室分配给您的Bucket权限仅限于Bucket中的Object路径下的权限，请您进入对应的Object路径再进行后续下操作。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_11a336eba09c4a6f97a08a21c5f23d11.png)

6. 创建目录。
    

6.1 在Bucket中，单击创建目录。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_a8f8227a1a3647f8a9f22264deecf6a0.png)

6.2 在创建目录对话框中，输入目录名，例如test，单击确定。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_bf631924d619410690cd618ca21c4bad.png)

7. 上传文件。
    

7.1 在Bucket中，单击您刚刚创建的目录名，本实验以test为例。![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_d79b818f59a04f88a3b249d45b244db4.png)

7.2 在test目录中，单击文件

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_7a631b522159440cbe46163e426ca987.png)

7.3 在您的电脑中，找到测试数据test.log文件，并选择该文件，然后单击上传文件

说明：文件路径以本地存储路径为准。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_21b8a1feddb948ff9f4cb51aaf150f94.png)

返回如下结果，表示您已成功上传testlog.csv文件文件。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_299306c0c7c7452ab7fc3d8f85440378.png)

8. 查看文件。
    

8.1 在test目录中，单击testlog.csv文件名称。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_33fc2b128fba4c93b4c10889e8ae016a.png)

8.2 在预览对话框中，单击尝试作为文本文件打开。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_5d1cb14a4aff4d20a978ac4d642a3355.png)

返回如下结果，您可以预览testlog.csv文件的内容。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_44f0ba0c38c84565a82fb3192eeb1be5.png)

9. 下载文件。
    

9.1 在test目录中，单击testlog.csv文件右侧操作列下的下载。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_a0e51bfa8bad4b71afb34c1e9d6c8f5d.png)

9.2 选择您需要下载到的文件夹中，然后单击选择文件夹。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_935059d583794272b25c0c70ec021460.png)

返回如下结果，表示您已下载完成。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_5375087bfa6842209d39774532290166.png)

10. 分享文件。
    

10.1 在test目录中，单击testlog.csv文件右侧操作列下的获取地址。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_caca30e3f7a2440d9741c9a07951ce5d.png)

10.2 在获取地址对话框中，单击生成。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_4fdf27c4b736489d9df9de2f64d924a6.png)

10.3 在获取地址对话框中，您可以通过复制、发送邮件和二维码三种方式分享testlog.csv给第三方预览或下载。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_ea6c2bbcbd4a4b9f93e96907ec9fa2e6.png)

11. 删除文件。
    

11.1 在test目录中，单击testlog.csv文件右侧操作列下的删除。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_f1167dfbf34547c2a0f3d326ea6bcc7b.png)

11.2 在删除目录和文件对话框中，单击确定。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_378acdae742542019a9aae4266fb6b26.png)

返回如下结果，表示您已成功删除testlog.csv文件。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_02436f41d5e8447a891885ebec30d96e.png)

6. 利用图形化工具使用对象存储OSS

7. 在您的本机浏览器中，访问地址[https://help.aliyun.com/document_detail/209974.html](https://help.aliyun.com/document_detail/209974.html)，根据您电脑的操作系统，下载对应的ossbrowser安装包。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_5f41692dcea64683938758dfa9e0df29.png)

2. 解压ossbrowser安装包，双击打开oss-browser.exe。
    

说明：本实验以Windows系统为例，其他操作系统请参考[安装并登录ossbrowser](https://help.aliyun.com/document_detail/209974.html)官网文档。

![](https://ucc.alicdn.com/pic/developer-ecology/am22xgmbpd4os_800def19a433407181c1c36dce66c89a.png)

3. 在AK登录对话框中，填写AccessKeyId和AccessKeySecret，其他配置保持默认，单击登入。
    

说明：如您使用个人资源或者免费试用资源进行实验，并且没有AccessKeyId和AccessKeySecret，请您先按照下方[如何创建子账号及AK]指引，创建对应的AccessKeyId和AccessKeySecret。本实验以通过AK登录ossbrowser方式为例，通过授权码方式登录ossbrowser请参考[安装并登录ossbrowser](https://help.aliyun.com/document_detail/209974.html)官网文档。。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_eaaec8ef5dc549ecb1e9770d7ca43a59.png)

[如何创建子账号及AK] -- 选择个人资源实验时参考

1. 创建用户。
    

打开[RAM访问控制](https://ram.console.aliyun.com/overview)，在左侧导航栏中选择身份管理>用户，单击创建用户，勾选OpenAPI调用访问

![](https://ucc.alicdn.com/pic/developer-ecology/o23ywodss4pji_ae2fbb55084e45e5b6744069cf4d9be6.png)

2. 创建完成后，可以看到用户的AccessKey ID和AccessKey Secret，请将AccessKey ID和AccessKey Secret记录下来，后续将无法查看。
    

注意：如后期不使用此AK，请即时在访问控制中停用，避免造成资源损失。

![](https://ucc.alicdn.com/pic/developer-ecology/o23ywodss4pji_e718a27877014d999a67096f15a1557e.png)

3. 为子账号添加授权。在用户页面，选择刚刚创建的子账号，单击添加权限。在新增权限面板，资源范围选择账号级别，权限策略选择AliyunOSSFullAccess，单击确认新增授权。
    

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_a25d45b0c4c44dad8267ecef5ef2eff3.png)

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_0b36a5ff179441439766377109e9ff98.png)

4. 找到对应OSS的Bucket，单击Bucket名称。
    

说明：若要体验创建和删除Bucket步骤，请使用您个人资源进行实验，参考创建阿里云账号的AccessKeyId登录ossbrowser，并注意可能会产生费用问题。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_8aeee48699f04d0094d0fb821e9348ee.png)

5. 创建目录。
    

5.1 在Bucket中，单击创建目录。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_a8f8227a1a3647f8a9f22264deecf6a0.png)

5.2 在创建目录对话框中，输入目录名，例如test，单击确定。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_bf631924d619410690cd618ca21c4bad.png)

6. 上传文件。
    

6.1 在Bucket中，单击您刚刚创建的目录名，本实验以test为例。![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_d79b818f59a04f88a3b249d45b244db4.png)

6.2 在test目录中，单击文件

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_7a631b522159440cbe46163e426ca987.png)

6.3 在您的电脑中，找到测试数据test.log文件，并选择该文件，然后单击上传文件

说明：文件路径以本地存储路径为准。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_21b8a1feddb948ff9f4cb51aaf150f94.png)

返回如下结果，表示您已成功上传testlog.csv文件文件。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_299306c0c7c7452ab7fc3d8f85440378.png)

7. 查看文件。
    

7.1 在test目录中，单击testlog.csv文件名称。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_33fc2b128fba4c93b4c10889e8ae016a.png)

7.2 在预览对话框中，单击尝试作为文本文件打开。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_5d1cb14a4aff4d20a978ac4d642a3355.png)

返回如下结果，您可以预览testlog.csv文件的内容。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_44f0ba0c38c84565a82fb3192eeb1be5.png)

8. 下载文件。
    

8.1 在test目录中，单击testlog.csv文件右侧操作列下的下载。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_a0e51bfa8bad4b71afb34c1e9d6c8f5d.png)

8.2 选择您需要下载到的文件夹中，然后单击选择文件夹。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_935059d583794272b25c0c70ec021460.png)

返回如下结果，表示您已下载完成。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_5375087bfa6842209d39774532290166.png)

9. 分享文件。
    

9.1 在test目录中，单击testlog.csv文件右侧操作列下的获取地址。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_caca30e3f7a2440d9741c9a07951ce5d.png)

9.2 在获取地址对话框中，单击生成。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_4fdf27c4b736489d9df9de2f64d924a6.png)

9.3 在获取地址对话框中，您可以通过复制、发送邮件和二维码三种方式分享testlog.csv给第三方预览或下载。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_ea6c2bbcbd4a4b9f93e96907ec9fa2e6.png)

10. 删除文件。
    

10.1 在test目录中，单击testlog.csv文件右侧操作列下的删除。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_f1167dfbf34547c2a0f3d326ea6bcc7b.png)

10.2 在删除目录和文件对话框中，单击确定。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_378acdae742542019a9aae4266fb6b26.png)

返回如下结果，表示您已成功删除testlog.csv文件。

![](https://ucc.alicdn.com/pic/developer-ecology/y4dn6eatoa22k_02436f41d5e8447a891885ebec30d96e.png)