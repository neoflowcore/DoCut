"""Create a no-install offline DoCut editor HTML; never builds a ZIP or executable.

Run: python tools/bundle_studio_v032.py /mnt/data/DoCut_Studio_v032_Offline.html
The result includes every source script and local CSS in index.html order.
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
ENTRY = ROOT / 'index.html'
SHEET = ROOT / 'assets' / 'styles.css'
CSS = re.compile(r'<link\s+rel="stylesheet"\s+href="\./assets/styles\.css"\s*/>')
SCRIPT = re.compile(r'<script\s+src="\./(assets/[^"<>]+\.js)"\s+defer></script>')


def bundle(destination):
    html = ENTRY.read_text(encoding='utf-8')
    html, styles = CSS.subn(lambda _: '<style>\n' + SHEET.read_text(encoding='utf-8') + '\n</style>', html)
    if styles != 1:
        raise ValueError(f'Expected one editor stylesheet, found {styles}')
    scripts = []

    def inline(match):
        relative = match.group(1)
        path = ROOT / relative
        if not path.is_file() or not path.resolve().is_relative_to((ROOT / 'assets').resolve()):
            raise ValueError('Script path is not an existing local asset: ' + relative)
        contents = path.read_text(encoding='utf-8')
        # The HTML parser stops on </script> even inside JavaScript strings. Encode
        # the slash in JS source; JavaScript string literals still yield </script>.
        contents = re.sub(r'</script', lambda _: r'<\/script', contents, flags=re.IGNORECASE)
        scripts.append(relative)
        return '<script>\n/* Bundled from ' + relative + ' */\n' + contents + '\n</script>'

    html = SCRIPT.sub(inline, html)
    if len(scripts) < 35 or 'assets/effect_icons.js' not in scripts or not scripts[-1].endswith('app.js'):
        raise ValueError('Incomplete JS bundle: ' + repr(scripts))
    if re.search(r'<script\s+src=|<link[^>]+href="\./assets/', html):
        raise ValueError('Remaining external source dependencies in editor')
    destination = Path(destination).resolve()
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text('<!-- Self-contained DoCut Studio v0.35.0. Project data remains local. -->\n' + html, encoding='utf-8')
    print(f'Wrote {destination} ({destination.stat().st_size:,} bytes; {len(scripts)} embedded JS files)')


if __name__ == '__main__':
    bundle(sys.argv[1] if len(sys.argv) > 1 else '/mnt/data/DoCut_Studio_v032_Offline.html')
