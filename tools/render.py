"""Render the share image (og.png) from tools/og.html. Icons come from tools/icons.py."""
import pathlib, sys
from playwright.sync_api import sync_playwright
root = pathlib.Path(__file__).resolve().parent.parent
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome") if pathlib.Path("/usr/bin/google-chrome").exists() else p.chromium.launch()
    for src, out, w, h in [("tools/og.html", "og.png", 1200, 630)]:
        pg = b.new_page(viewport={"width": w, "height": h})
        pg.goto((root / src).as_uri()); pg.wait_for_timeout(600)
        pg.screenshot(path=str(root / out)); pg.close()
    b.close()
print("done")
