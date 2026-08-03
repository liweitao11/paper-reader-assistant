# paper-reader-assistant

> Zotero 文献 → 论文精读（AI辅助） → Obsidian 结构化笔记。本地运行，支持云端和本地 AI 模型，论文阅读、分析与记录一体化。
> 旨在使论文阅读高效化、生成的报告规范化，通过人工阅读+AI辅助的共同协作模式而并非一味的让AI阅读。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows-lightgrey.svg)](https://www.microsoft.com/windows/)

## 项目简介

paper-reader-assistant 是一个面向科研阅读场景的本地PaperFlow。它把“文献管理、AI 精读、笔记沉淀”串成一条工作流：

1. 从 Zotero 只读读取文献库，或直接打开本地 PDF / DOCX / Markdown / TXT；
2. 用云端 AI（OpenAI / DeepSeek / 豆包 / 自定义接口）或本地 Ollama 模型分析论文；
3. 把分析结果整理成 Obsidian 原生格式的结构化 Markdown 笔记。

整个工具以本机运行为主：不依赖 Flask，不需要构建工具，论文正文在本地模式下不出本机；云端模式下只会把提取出的论文文字发送给你选择的 AI 服务商。

## 功能特性

- 直读 Zotero SQLite：无需 Better BibTeX，只读访问，不修改数据库
- 多模型 AI 分析：OpenAI / DeepSeek / 豆包（火山方舟）/ 自定义 OpenAI 兼容接口
- 本地 AI（Ollama）：支持 Qwen2.5 / Llama 3.x / DeepSeek-R1，涉密论文可在完全离线环境使用
- Obsidian 原生格式：YAML frontmatter + 原生 callout，无需额外主题
- AI 只填空不覆盖：不覆盖人工填写的内容，尊重你的阅读笔记
- API Key 加密保存：Windows DPAPI 用户级加密，默认不保存
- 中英双语界面：界面、使用说明、AI 输出语言可独立切换
- 交互式使用手册：12 章 HTML 文档，中英双语
- 可移植使用：Ollama 运行时与模型目录分离，模型文件由用户自行选择存放
- 本地优先：Zotero 读取可离线完成，本地模型分析可完全离线

## 工作原理

```text
双击启动器
  -> Python 在本机启动只监听 127.0.0.1 的小型服务（端口 8774）
  -> 浏览器打开本地界面
  -> 选择 Zotero 文献或本地文档
  -> 手动填写或调用 AI 分析
  -> 生成 Obsidian Markdown 笔记
  -> 点击“一键清空”继续下一篇
```

浏览器负责交互，Python 负责读取 Zotero、提取 PDF 正文、调用模型和写入 Markdown。页面右上角红色 × 或正常关闭页面都会停止 Python 后台及其管理的 Ollama 进程，模型文件与已生成笔记不会被删除。

## 使用前准备

### 必须

| 项目 | 说明 | 下载 |
| --- | --- | --- |
| Windows 10/11 | 当前版本主要面向 Windows 桌面环境 | - |
| Python 3.10+ | 程序依赖 Python 标准库运行，安装时请勾选 Add Python to PATH | [Python 官网](https://www.python.org/downloads/) |

### 可选（按需安装）

| 工具 | 作用 | 下载 |
| --- | --- | --- |
| Zotero | 管理文献库，提供论文条目与 PDF 路径 | [Zotero 官网](https://www.zotero.org/download/) |
| Obsidian | 存放结构化阅读笔记，支持双链与本地 Markdown | [Obsidian 官网](https://obsidian.md/download) |
| Ollama | 本地大模型运行器，论文正文不出本机 | [Ollama 下载](https://ollama.com/download/windows) |

## 截图

<!-- 发布后在此处加入 2-3 张截图，例如主界面、AI 分析面板、Obsidian 输出 -->

## 下载与安装

### 方式一：下载 Release 压缩包（推荐）

<!-- 发布 Release 后，把下载链接替换到下一行 -->
> 最新版：`<你的 GitHub Releases 下载链接>`（发布包：`paper-reader-assistant-v1.0.zip`）

下载后解压，双击 `PaperReader.cmd` 即可启动。首次使用可选择 Ollama 模型目录；`runtime/` 目录可放置 Windows 版 `ollama.exe`，也可直接安装 Ollama。

### 方式二：Git 克隆

```bash
git clone https://github.com/<你的用户名>/paper-reader-assistant.git
cd paper-reader-assistant
python paper_reader.py
```

（可选）安装 PDF 提取依赖：

```bash
pip install pypdf
```

启动成功后浏览器会自动打开 `http://127.0.0.1:8774`。

## 快速开始

1. 双击 `PaperReader.cmd`，等待浏览器打开本地界面；
2. 点击右下角 AI 球，选择云端 AI 并填写 API Key，或选择本地 Ollama 模型；
3. 点击“选择 Obsidian 目录”，指定笔记保存位置；
4. 从右侧 Zotero 栏选择论文，或点击“读取本地文档”打开 PDF / DOCX / Markdown / TXT；
5. 填写研究方向与标签，点击 AI 分析；人工核对后点击“生成 Obsidian 笔记”；
6. 处理下一篇前点击“一键清空”。

## AI 模型配置

### 云端模型

| 提供商 | 默认模型 | API Key 获取 |
| --- | --- | --- |
| OpenAI | chat-latest | https://platform.openai.com/api-keys |
| DeepSeek | deepseek-v4-flash | https://platform.deepseek.com/ |
| 豆包 / 火山方舟 | doubao-seed-2-0-lite | https://console.volcengine.com/ark |
| 自定义 | - | 任意 OpenAI Chat Completions 兼容接口 |

API Key 默认只保存在当前会话；勾选保存后使用 Windows DPAPI 加密写入 `config.json`，取消勾选并再次分析会删除已保存的 Key。

### 本地模型（Ollama）

| 规模 | 典型下载量 | 最低建议内存 | 用途 |
| --- | --- | --- | --- |
| 1.5B-3B | 约 1-2 GB | 8 GB | 快速提取与简单摘要 |
| 7B-8B | 约 4.7-5 GB | 16 GB | 入门论文阅读 |
| 14B | 约 9 GB | 24 GB | 科研分析（推荐） |
| 32B | 约 20 GB | 48 GB | 更强推理 |

程序会在 `127.0.0.1:11436` 启动独立 Ollama 服务，不影响系统默认的 11434 服务；模型目录由用户选择，模型文件不会随程序删除。

## 输出格式

生成的 Obsidian 笔记包含：

- YAML frontmatter：title、author、journal、year、tags、date
- 8 章节结构：基本信息、研究问题、方法框架、创新点、实验结果、论文不足、研究启发、一句话总结
- Obsidian 原生 callout：`> [!abstract]`、`> [!tip]`、`> [!warning]` 等
- 星级评价表格：创新性、工程价值、相关性

文件名格式为 `YYYY-MM-DD_论文标题.md`；同名文件自动追加 `_2`、`_3`，不会覆盖已有笔记。

## 配置与隐私

- `config.json` 在首次运行后自动生成，记录输出目录、模型目录、本地模型与（可选）加密后的 API Key；该文件不会随源码发布
- Zotero 数据库：只读访问，不修改、不写回
- 云端 AI：只上传提取出的论文文字与本次分析请求，不直接上传整个 Zotero 数据库
- 本地 AI（Ollama）：论文正文不出本机
- API Key：默认不保存；主动保存时使用当前 Windows 用户级 DPAPI 加密
- 程序不维护 AI 聊天历史，提取的正文只存在于请求期间的内存中；只有点击“生成 Obsidian 笔记”后才写入文件

## 注意事项

- 扫描版 PDF 没有文字层，需要先用 OCR 工具生成文字层
- ChatGPT Plus / Pro 订阅不等于 OpenAI API 额度，云端 API 通常单独计费
- 共享电脑、公共电脑或高保密项目建议不保存 API Key，并使用本地模型
- 页面打不开时，请确认 8774 端口未被占用，并关闭旧的助手进程
- 双击 `PaperReader.cmd` 后默认使用 `pythonw.exe` 后台运行，不出现黑窗口是正常现象
- 完整交互式手册见项目内 `使用说明.html`（中英双语）

## 相关工具简介

- Python：跨平台编程语言，本项目的运行基础。下载：https://www.python.org/downloads/
- Zotero：开源文献管理工具，可管理论文条目、PDF 与引用。下载：https://www.zotero.org/download/
- Obsidian：本地优先的 Markdown 知识库，支持双链、标签与插件。下载：https://obsidian.md/download
- Ollama：本地大语言模型运行器，下载：https://ollama.com/download/windows

## 项目结构

```text
paper-reader-assistant/
├── paper_reader.py          # Python 后端（HTTP 服务 + AI + Zotero + PDF）
├── launcher.py              # 控制台启动器（PaperReader.cmd 调用）
├── 启动.pyw                 # 无窗口启动器（双击即用）
├── templates/
│   ├── index.html           # 前端单页应用
│   ├── darkmode.css         # 暗色模式样式
│   └── streaming.js         # AI 流式输出 + 草稿自动保存
├── 使用说明.html             # 交互式使用手册（中英双语）
├── 使用前必读.txt            # 快速上手说明
├── runtime/                 # 可选：放置 ollama.exe
├── PaperReader.cmd          # Windows 启动脚本
├── requirements.txt         # Python 依赖（pypdf 可选）
├── .gitignore
├── LICENSE
└── README.md
```

## 常见问题

<details>
<summary>双击 CMD 没反应？</summary>

确认使用 `PaperReader.cmd`，并已安装 Python 3.10+ 且加入 PATH。安全软件可能阻止脚本或本地端口，可尝试在命令行运行 `python paper_reader.py`。
</details>

<details>
<summary>Zotero 列表为空？</summary>

确认 Zotero 数据目录存在 `zotero.sqlite` 且 Zotero 运行过，点击“刷新”。找不到数据库时仍可使用“读取本地文档”。
</details>

<details>
<summary>AI JSON 解析失败？</summary>

小模型可能无法严格遵循 JSON 格式，尝试 Qwen2.5 7B/14B 或更强大的云端模型。
</details>

<details>
<summary>扫描 PDF 没有正文？</summary>

扫描件需要 OCR。先用 Zotero、Adobe、OCRmyPDF 等工具生成文字层。
</details>

<details>
<summary>本地模型下载失败？</summary>

检查磁盘空间、网络连接，确认已选择模型目录。
</details>

## 技术栈

- 后端：Python 3.10+ 标准库（无需 Flask / Django）
- 前端：原生 HTML / CSS / JavaScript（无构建工具）
- AI：OpenAI Chat Completions 兼容协议
- 本地 AI：Ollama
- 加密：Windows DPAPI
- 数据库：Zotero SQLite（只读）

## 贡献

欢迎提交 Issue 和 Pull Request。

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m "Add amazing feature"`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 许可证

[MIT License](LICENSE)，可自由使用、修改和分发。

## 致谢

- Zotero：文献管理
- Obsidian：知识管理
- Ollama：本地大模型运行
- Qwen2.5、Llama 3.x、DeepSeek-R1：本地模型生态
