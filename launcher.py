"""
paper-reader-assistant · 命令行启动器（控制台版）

由 PaperReader.cmd 调用。运行后：
  1. 检查 Python 版本
  2. 检测 Zotero 数据库
  3. 启动本地 HTTP 服务
  4. 自动打开浏览器

出错时打印详细信息并等待按键，方便排查。
"""

import os
import sys
import traceback
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


def _check_python() -> bool:
    if sys.version_info < (3, 10):
        print(f"[错误] Python 版本过低：{sys.version.split()[0]}，需要 3.10 或更高。")
        return False
    print(f"[OK] Python {sys.version.split()[0]}")
    return True


def _check_zotero() -> None:
    try:
        from paper_reader import zotero_database
        db = zotero_database()
        if db.exists():
            print(f"[OK] Zotero 数据库：{db}")
        else:
            print(f"[提示] 未找到 Zotero 数据库：{db}")
            print("       可继续使用『读取本地文档』功能；")
            print("       如需 Zotero 列表，请确认 Zotero 已安装并运行过。")
    except Exception:
        pass


def main() -> None:
    os.chdir(BASE_DIR)
    if not _check_python():
        input("按回车键退出...")
        return
    _check_zotero()
    try:
        import paper_reader
        paper_reader.main()
    except Exception:
        print("[错误] 启动失败，详细原因：")
        traceback.print_exc()
        input("按回车键退出...")


if __name__ == "__main__":
    main()
