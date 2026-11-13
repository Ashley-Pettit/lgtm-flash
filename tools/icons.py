"""Draw the gauge icon and export favicon.svg, favicon.ico and PNG icons."""
import math, pathlib, io
from playwright.sync_api import sync_playwright
from PIL import Image
root = pathlib.Path(__file__).resolve().parent.parent
CX, CY, RO, RI = 50, 66, 42, 19
SEGS = ['#3BA54A', '#FFD100', '#F07D00', '#D2232A']
def pt(r, d):
    a = math.radians(d); return CX + r * math.cos(a), CY - r * math.sin(a)
def gauge(doom=68):
    out = []
    for i, c in enumerate(SEGS):
        a1, a2 = 180 - 45 * i, 180 - 45 * (i + 1)
        (x1, y1), (x2, y2), (x3, y3), (x4, y4) = pt(RO, a1), pt(RO, a2), pt(RI, a2), pt(RI, a1)
        out.append(f'<path d="M{x1:.2f} {y1:.2f}A{RO} {RO} 0 0 1 {x2:.2f} {y2:.2f}L{x3:.2f} {y3:.2f}A{RI} {RI} 0 0 0 {x4:.2f} {y4:.2f}Z" fill="{c}" stroke="#000" stroke-width="3.2" stroke-linejoin="round"/>')
    deg = doom / 100 * 180 - 90
    out.append(f'<g transform="rotate({deg:.1f} {CX} {CY})"><polygon points="{CX-6},{CY} {CX},{CY-37} {CX+6},{CY}" fill="#fff"/></g>')
    out.append(f'<circle cx="{CX}" cy="{CY}" r="9" fill="#fff"/><circle cx="{CX}" cy="{CY}" r="3.4" fill="#000"/>')
    return ''.join(out)
def svg(rounded=True):
    bg = '<rect width="100" height="100" rx="22" fill="#000"/>' if rounded else '<rect width="100" height="100" fill="#000"/>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">{bg}{gauge()}</svg>'
(root / 'favicon.svg').write_text(svg(True))
def render(markup, size):
    html = f'<html><body style="margin:0;background:transparent">{markup.replace("<svg ", f"<svg width=\"{size}\" height=\"{size}\" ")}</body></html>'
    pg = b.new_page(viewport={'width': size, 'height': size})
    pg.set_content(html); png = pg.screenshot(omit_background=True); pg.close()
    return Image.open(io.BytesIO(png)).convert('RGBA')
with sync_playwright() as p:
    chrome = pathlib.Path('/usr/bin/google-chrome')
    b = p.chromium.launch(executable_path=str(chrome)) if chrome.exists() else p.chromium.launch()
    render(svg(True), 32).save(root / 'favicon-32.png')
    render(svg(False), 180).save(root / 'apple-touch-icon.png')
    render(svg(False), 192).save(root / 'icon-192.png')
    render(svg(False), 512).save(root / 'icon-512.png')
    big = render(svg(True), 256)
    big.save(root / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
    b.close()
print('icons done')
