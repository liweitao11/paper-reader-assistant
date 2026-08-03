"""
paper-reader-assistant · 一键启动器（无控制台窗口）

功能：
  1. 检查 Python 版本
  2. 检测 Zotero 数据库（默认位置或自定义位置）
  3. 启动本地 HTTP 服务
  4. 自动打开浏览器
  （本地 Ollama 由 paper_reader.py 在需要时自动启动，无需手动开启）

用法：双击本文件即可。也可以命令行运行：python 启动.pyw
"""

import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


def _notify(title: str, message: str) -> None:
    """无窗口环境下用弹窗提示。"""
    try:
        import tkinter as tk
        from tkinter import messagebox

        root = tk.Tk()
        root.withdraw()
        root.attributes("-topmost", True)
        messagebox.showinfo(title, message, parent=root)
        root.destroy()
    except Exception:
        print(f"[{title}] {message}", file=sys.stderr)


def _check_python() -> bool:
    if sys.version_info < (3, 10):
        _notify("Python 版本过低", f"当前 Python：{sys.version.split()[0]}\n需要 3.10 或更高版本。")
        return False
    return True


def _check_zotero() -> bool:
    try:
        from paper_reader import zotero_database
        db = zotero_database()
        if db.exists():
            return True
        _notify(
            "未找到 Zotero 数据库",
            f"没有在以下位置找到 zotero.sqlite：\n{db}\n\n"
            "可以继续使用“读取本地文档”功能；\n"
            "如需 Zotero 列表，请确认 Zotero 已安装并运行过。",
        )
        return False
    except Exception:
        return True  # 检测失败不阻塞启动


def main() -> None:
    os.chdir(BASE_DIR)
    if not _check_python():
        input("按回车退出...")
        return
    _check_zotero()

    try:
        import paper_reader
        paper_reader.main()
    except Exception as exc:
        _notify("启动失败", f"paper-reader-assistant启动失败：\n{exc}")
        input("按回车退出...")


if __name__ == "__main__":
    main()
