"""Build a zero-dependency single HTML file for DoCut Studio v0.27.

The editor source is self-contained: CSS and JS are embedded in the source
load order, with closing script tokens escaped for safe inlining. No binaries,
ZIPs, CI artifacts, CDN or source maps are generated.
"""
from __future__ import annotations
import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STYLE_LINK = '<link rel="stylesheet" href="./assets/styles.css" />'
SCRIPT_TAG = re.compile(r'<script src="\./assets/([^"/]+\.js)" defer></script>')


def build(target: Path) -> int:
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    assert STYLE_LINK in html, 'Missing stylesheet marker'
    css = (ROOT / 'assets/styles.css').read_text(encoding='utf-8')
    # Avoid closing <style> in userland CSS from ending the inline block.
    css = re.sub(r'</style', lambda _: r'<\/style', css, flags=re.I)
    html = html.replace(STYLE_LINK, '<style>\n' + css + '\n</style>', 1)
    seen: list[str] = []

    def inline_script(match: re.Match[str]) -> str:
        name = match.group(1)
        src = ROOT / 'assets' / name
        if not src.is_file():
            raise FileNotFoundError(src)
        content = src.read_text(encoding='utf-8')
        # Browsers' HTML parser would otherwise terminate script markup inside
        # template literals used to assemble exported HTML report pages.
        content = re.sub(r'</script', lambda _: r'<\/script', content, flags=re.I)
        seen.append(name)
        return f'<script data-inline-module="{name}">\n{content}\n</script>'

    html, count = SCRIPT_TAG.subn(inline_script, html)
    assert count >= 25, f'Expected >=25 bundled JS modules, got {count}'
    assert '<script src="./assets/' not in html, 'Unbundled source reference'
    assert STYLE_LINK not in html, 'Unbundled stylesheet reference'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(html, encoding='utf-8')
    print(f'Built {target} ({target.stat().st_size:,} bytes, {count} script modules, 1 stylesheet)')
    return count


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, default=Path('/mnt/data/DoCut_Studio_v027_Offline.html'))
    args = parser.parse_args()
    build(args.output)
