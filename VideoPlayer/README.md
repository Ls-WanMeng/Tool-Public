
# 静态API-播放器

一个基于Web的轻量级视频/图片播放器，支持URL参数加载、蓝奏云链接解析和手势控制。  


* 在线演示地址:  
   [Gitub本站托管](https://ls-wanmeng.github.io/Tool/VideoPlayer/Home.html)  
   [国内流畅](https://videoplayer-wm.netlify.app/)  

## ✨ 功能特性

- **多格式支持**：播放视频或显示图片
- **URL参数加载**：通过URL参数直接加载媒体资源
- **蓝奏云解析**：自动解析蓝奏云分享链接获取直链
- **手势控制**：支持触摸屏手势操作（快进、音量调节等）
- **响应式设计**：适配移动设备和桌面浏览器
- **自定义标题**：可通过URL参数设置浏览器标题
- **URL工具**：内置URL编码/解码工具

## 🚀 快速使用

### 基本用法

1. **直接加载视频/图片**：

"https://your-domain.com/?type=video&wmurl=" (https://your-domain.com/?type=video&wmurl=)视频直链[需URL编码]

或

"https://your-domain.com/?type=img&wmurl=" (https://your-domain.com/?type=img&wmurl=)图片直链[需URL编码]


2. **加载蓝奏云资源**：

"https://your-domain.com/?type=video&lanzouwmurl=" (https://your-domain.com/?type=video&lanzouwmurl=)蓝奏云分享链接


3. **自定义标题**（可选）：

&name=自定义标题[需URL编码]


### URL参数说明

| 参数 | 必选 | 说明 |
|------|------|------|
| `type` | 是 | `video` 或 `img`，指定媒体类型 |
| `wmurl` | 可选 | 直接媒体URL（需URL编码） |
| `lanzouwmurl` | 可选 | 蓝奏云分享链接 |
| `name` | 可选 | 自定义浏览器标题（需URL编码） |

## 💡 手势控制

- **左右滑动**：快进/快退
- **上下滑动**：调节音量（左侧区域降低，右侧区域升高）
- **双击**：播放/暂停
- **长按**：2倍速播放

## 🛠️ 开发与部署

### 本地开发

1. 克隆仓库：

bash

git clone "https://github.com/your-repo/static-api-player.git" (https://github.com/your-repo/static-api-player.git)


2. 启动本地服务器：

bash

使用Python内置服务器

python -m http.server 8000


### 部署到服务器

将 `index.html` 上传到静态网站托管服务：
- GitHub Pages
- Netlify
- Vercel
- 传统Web服务器

## 📝 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

## 📧 联系作者

- 主页: [挽梦遗酒的主页](https://wmyjnetlify.app/)
- GitHub: [@Ls-WanMeng](https://github.com/Ls-WanMeng)

<p align="center">
<sub>由 <a href="https://github.com/Ls-WanMeng">挽梦遗酒</a> 创建与维护</sub>
</p>
- **上下滑动**：调节音量（左侧区域降低，右侧区域升高）
- **双击**：播放/暂停
- **长按**：2倍速播放

## 🛠️ 开发与部署

### 本地开发

1. 克隆仓库：

bash

git clone "https://github.com/your-repo/static-api-player.git" (https://github.com/your-repo/static-api-player.git)


2. 启动本地服务器：

bash

使用Python内置服务器

python -m http.server 8000


### 部署到服务器

将 `index.html` 上传到静态网站托管服务：
- GitHub Pages
- Netlify
- Vercel
- 传统Web服务器

## 📝 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

## 📧 联系作者

- 主页: [挽梦遗酒的主页](https://wmyj.netlify.app/)
- GitHub: [@Ls-WanMeng](https://github.com/Ls-WanMeng)

<p align="center">
<sub>由 <a href="https://github.com/Ls-WanMeng">挽梦遗酒</a> 创建与维护</sub>
</p>


3. **自定义标题**（可选）：

&name=自定义标题[需URL编码]


### URL参数说明

| 参数 | 必选 | 说明 |
|------|------|------|
| `type` | 是 | `video` 或 `img`，指定媒体类型 |
| `wmurl` | 可选 | 直接媒体URL（需URL编码） |
| `lanzouwmurl` | 可选 | 蓝奏云分享链接 |
| `name` | 可选 | 自定义浏览器标题（需URL编码） |

## 💡 手势控制

- **左右滑动**：快进/快退
- **上下滑动**：调节音量（左侧区域降低，右侧区域升高）
- **双击**：播放/暂停
- **长按**：2倍速播放

## 🛠️ 开发与部署

### 本地开发

1. 克隆仓库：

bash

git clone "https://github.com/your-repo/static-api-player.git" (https://github.com/your-repo/static-api-player.git)


2. 启动本地服务器：

bash

使用Python内置服务器

python -m http.server 8000


### 部署到服务器

将 `index.html` 上传到静态网站托管服务：
- GitHub Pages
- Netlify
- Vercel
- 传统Web服务器

## 📝 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

## 📧 联系作者

- 主页: [挽梦遗酒的主页](https://wmyj.netlify.app/)
- GitHub: [@Ls-WanMeng](https://github.com/Ls-WanMeng)

<p align="center">
<sub>由 <a href="https://github.com/Ls-WanMeng">挽梦遗酒</a> 创建与维护</sub>
</p>
