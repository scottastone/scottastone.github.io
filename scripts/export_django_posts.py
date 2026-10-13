"""Export blog posts from the old Django site's SQLite database to Markdown files.

Usage (on the old server, or with a copy of the DB):
    docker compose cp web:/data/db.sqlite3 ./old.sqlite3
    python3 scripts/export_django_posts.py ./old.sqlite3

Writes one file per post into src/content/writing/. Unpublished posts get draft: true.
"""

import json
import sqlite3
import sys
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "src" / "content" / "writing"


def main(db_path: str) -> None:
    con = sqlite3.connect(db_path)
    rows = con.execute(
        "SELECT title, slug, body, published_at, is_published FROM myapp_post ORDER BY published_at"
    ).fetchall()
    OUT.mkdir(parents=True, exist_ok=True)
    for title, slug, body, published_at, is_published in rows:
        front = [
            "---",
            f"title: {json.dumps(title)}",
            f"date: {str(published_at)[:10]}",
            f"draft: {'false' if is_published else 'true'}",
            "---",
            "",
        ]
        path = OUT / f"{slug}.md"
        path.write_text("\n".join(front) + body.replace("\r\n", "\n").rstrip() + "\n", encoding="utf-8")
        print(f"wrote {path.relative_to(OUT.parent.parent.parent)}")
    print(f"{len(rows)} post(s) exported")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
