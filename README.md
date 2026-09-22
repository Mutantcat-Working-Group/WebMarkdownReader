<div align="center">
<img src="https://s2.loli.net/2025/10/24/6ce9HX4o5kvEJFT.png" style="width:100px;" width="100"/>
<h2>Mutantcat Web Markdown Reader</h2>
</div>

### 一、产品概述

- 一个纯前端的 Markdown 网页预览器，样式遵循 GitHub 预览风格，适合嵌进网页（iframe）或直接访问。
- 支持三种内容来源：URL 指定网络 Markdown、base64 指定内容、选择本地文件打开。
- 自适应宽高填满所在容器，iframe 引入时可以直接用容器控制宽高。
- 无后端、无上传，文件与文件信息完全在用户端处理，Pages、Vercel 等静态托管即可跑。

核心价值：一段 URL 参数把任意 Markdown 渲染成 GitHub 风格的页面，隐私不出浏览器。

### 二、功能说明

- GitHub 风格预览：标题、代码块、表格、列表等全量 Markdown 语法渲染。
- 三种输入：`?url=` 拉取网络文件、`?base64=` 直接解码内容、本地文件选择器。
- iframe 友好：宽高自适应容器，隐藏自身多余界面，方便嵌入第三方站点。
- 零依赖部署：纯静态文件，克隆下来丢任何静态服务器即可用。

### 三、安装与下载

在线使用（官方公益地址）：

- https://markdownreader.mutantcat.org
- https://markdownreader.jqshengtian.top
- https://mutantcat-working-group.github.io/WebMarkdownReader

也从 [Releases](https://github.com/Mutantcat-Working-Group/WebMarkdownReader/releases) 下载 `webmarkdownreader-1.0.20260920.tar.gz` 自行部署，另附 `checksums.txt` 供校验。版本号使用纯日期递增（如 `1.0.20260920`），推送同族标签（`v` 前缀可选）后，GitHub Actions 会自动打包并发布 Release。

### 四、快速上手

1. 直接访问任一官方地址，粘贴或选择 Markdown 文件即可预览。
2. 通过 URL 指定远程文件（注意文件服务的跨域策略）：

```text
https://markdownreader.mutantcat.org/?url=https://raw.githubusercontent.com/Mutantcat-Working-Group/WebMarkdownReader/refs/heads/main/README.md
```

3. 通过 base64 指定内容：`地址?base64=<Markdown 原始文本的 base64>`。
4. 嵌入自己的站点时直接用 iframe 引用上述地址即可。
5. 想换样式或用法，Fork 一份自己部署。

### 五、其他说明

- 如遇 bug 可及时提交 issue，纯文字描述现象也可以。
- 欢迎 Fork 自己的版本实现不同样式、性能、用法，欢迎 Star 或贡献本项目。

本项目基于 Apache-2.0 协议开源。
