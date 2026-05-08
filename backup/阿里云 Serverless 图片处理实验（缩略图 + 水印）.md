**实验目标**

1. 掌握 OSS 文件上传和函数计算触发机制。
2. 掌握 Python 图像处理库 Pillow 基本操作。
3. 实现自动生成缩略图并加水印到 OSS。
4. 理解 Serverless 事件驱动处理流程。

---

## **实验背景**

企业网站或电商平台经常需要对上传图片自动处理：生成缩略图、加水印、压缩或格式转换。利用 Serverless 架构，可以实现自动化处理，无需手动或长期运行服务器。

---

## **实验准备**

1. 阿里云账号，拥有 OSS 和函数计算权限。
2. 准备 Python 3.10 运行环境。
3. 安装 Pillow 库（函数计算控制台可在依赖配置中填写 `Pillow`）。
4. 准备测试图片若干（如 JPG 或 PNG）。

---

## **实验步骤**

### **步骤 1：创建 OSS Bucket**

1. 登录阿里云控制台 → OSS → 创建 Bucket，例如：`image-bucket`
2. 创建两个文件夹：

   * `original/`：存放原始图片
   * `processed/`：存放处理后的图片
3. 设置 Bucket 访问权限为私有。

---

### **步骤 2：上传测试图片**

1. 上传几张图片到 `original/` 文件夹，用于触发函数计算。

---

### **步骤 3：创建函数计算服务**

1. 控制台 → 函数计算 → 创建服务，例如：`ImageProcessingService`
2. 创建函数，例如：`GenerateThumbnailWatermark`
3. 运行环境：Python 3.10
4. 配置函数内存：128MB，超时：30秒即可

---

### **步骤 4：添加 OSS 触发器**

1. 选择触发类型：OSS 文件触发
2. Bucket：`image-bucket`
3. 文件夹：`original/`
4. 事件类型：`ObjectCreated`

---

### **步骤 5：部署函数代码**

```python
# -*- coding: utf-8 -*-
import oss2
from PIL import Image, ImageDraw, ImageFont
import io
import os

# OSS 配置（通过环境变量设置）
OSS_ENDPOINT = os.environ.get('OSS_ENDPOINT')
OSS_ACCESS_KEY_ID = os.environ.get('OSS_ACCESS_KEY_ID')
OSS_ACCESS_KEY_SECRET = os.environ.get('OSS_ACCESS_KEY_SECRET')
OSS_BUCKET_NAME = os.environ.get('OSS_BUCKET_NAME', 'image-bucket')

ORIGINAL_FOLDER = 'original/'
PROCESSED_FOLDER = 'processed/'

auth = oss2.Auth(OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET)
bucket = oss2.Bucket(auth, OSS_ENDPOINT, OSS_BUCKET_NAME)

def handler(event, context):
    if 'events' not in event:
        return {"statusCode":400, "body":"非 OSS 触发事件"}

    # 遍历上传的图片
    for record in event['events']:
        key = record['oss']['object']['key']
        try:
            # 下载图片
            obj = bucket.get_object(key)
            image_data = obj.read()
            img = Image.open(io.BytesIO(image_data))

            # ======= 生成缩略图 =======
            img.thumbnail((200, 200))

            # ======= 添加水印 =======
            draw = ImageDraw.Draw(img)
            text = "Serverless"
            font = ImageFont.load_default()
            draw.text((10, 10), text, fill=(255,0,0), font=font)

            # 保存到内存
            out_buffer = io.BytesIO()
            img_format = img.format if img.format else 'JPEG'
            img.save(out_buffer, format=img_format)
            out_buffer.seek(0)

            # 写回 OSS processed 文件夹
            filename = key.split('/')[-1]
            processed_key = f"{PROCESSED_FOLDER}thumb_{filename}"
            bucket.put_object(processed_key, out_buffer)
        except Exception as e:
            print(f"处理 {key} 失败: {e}")
            continue

    return {"statusCode":200, "body":"处理完成"}
```

---

### **步骤 6：测试函数**

1. 上传一张新图片到 `original/` 文件夹。
2. 函数计算触发后，在 `processed/` 文件夹检查生成的文件。

   * 文件名示例：`thumb_example.jpg`
   * 图片已生成缩略图并带水印。

---

### **步骤 7：扩展实验**

1. 批量上传多张图片，观察函数批量处理效果。
2. 修改函数，实现：

   * 图像格式转换（PNG → JPG）
   * 压缩图片大小
   * 水印位置或内容自定义

---



