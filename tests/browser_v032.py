"""V0.32 source-only Chromium acceptance: page context, auto-fit, 89 motion glyphs, scene exit.

No GitHub Actions, installer builds, ZIP or production deployment. Native Brave/Android
remains a separate manual test; exported report is opened in an isolated page.
"""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright
from browser_v018 import MEMORY_STORAGE

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'index.html').read_text(encoding='utf-8')
SCRIPTS = re.findall(r'<script src="\./(assets/[^"]+\.js)" defer></script>', HTML)


def ready(page):
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    markup = re.sub(r'<script src="[^"]+" defer></script>', '', HTML)
    markup = re.sub(r'<link[^>]+href="\./assets/styles.css"[^>]*>', '', markup)
    page.set_content(markup, wait_until='domcontentloaded')
    page.evaluate(MEMORY_STORAGE, [])
    page.add_style_tag(content=(ROOT / 'assets/styles.css').read_text(encoding='utf-8'))
    for name in SCRIPTS:
        page.add_script_tag(content=(ROOT / name).read_text(encoding='utf-8'))
    assert page.evaluate('Boolean(window.DocutApp && window.DocutEffectIcons)')
    assert not errors, errors
    return errors


def run():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        ctx = browser.new_context(viewport={'width': 1600, 'height': 1040})
        page = ctx.new_page()
        errors = ready(page)
        assert page.locator('.brand em').inner_text() == '0.32.0'
        assert page.evaluate('DocutEffectCatalog.GALLERY.length') == 89
        assert page.evaluate('new Set(DocutEffectCatalog.GALLERY.map(DocutEffectIcons.icon)).size') == 89
        assert page.evaluate('new Set(DocutEffectCatalog.GALLERY.map(e=>e.id)).size') == 89
        assert page.evaluate('DocutApp.getProject().pages.length') == 5

        # A page or page strip right-click opens page metadata, not browser or element tools.
        page.locator('#pageStrip [data-strip-page]').nth(2).click(button='right')
        assert page.locator('#canvasContextTools').is_visible()
        assert '페이지 3' in page.locator('#canvasContextTools').inner_text()
        assert page.locator('[data-context-page-action]').count() >= 10
        page.locator('[data-context-page-action="rename"]').click()
        page.locator('#contextPageTitle').fill('사용자 페이지')
        page.locator('[data-context-page-action="save-rename"]').click()
        assert page.evaluate('DocutApp.getProject().pages[2].tab') == '사용자 페이지'
        page.locator('#pageList [data-page-index="1"]').first.click(button='right')
        assert '페이지 2' in page.locator('#canvasContextTools').inner_text()
        page.locator('#stageArea').evaluate('node=>node.dispatchEvent(new MouseEvent("contextmenu", {bubbles:true,cancelable:true,button:2,clientX:500,clientY:300}))')
        assert '페이지 1' in page.locator('#canvasContextTools').inner_text()
        page.locator('#canvasContextTools [data-context-action="close"]').first.click()
        page.locator('#slide .element').first.click(button='right')
        assert '선택 객체 도구' in page.locator('#canvasContextTools').inner_text()
        page.locator('#canvasContextTools [data-context-action="close"]').first.click()
        print('PASS context menu page strip, sidebar, blank canvas and element', flush=True)

        # The previously rejected four vertical columns must auto-adapt to one page.
        page.locator('#pageStrip [data-strip-page]').first.click(button='right')
        page.locator('[data-context-page-action="layout"]').click()
        page.locator('#boxCount').select_option('4')
        page.locator('#boxDirection').select_option('column')
        page.locator('#boxMedia').check()
        # Changing count/direction immediately regenerates the proportional structure.
        page.locator('#boxAutoApply').click()
        assert not page.locator('#boxLayoutDialog').is_visible(), page.locator('#boxLayoutStatus').inner_text()
        assert page.evaluate('DocutApp.getProject().pages.length') == 6
        assert page.evaluate('DocutApp.getProject().pages[1].elements.length') == 13
        assert page.evaluate('DocutApp.getProject().pages[1].elements.every(e=>e.x>=0&&e.y>=0&&e.x+e.w<=1281&&e.y+e.h<=721)')
        assert page.evaluate('DocutApp.getProject().pages[1].layoutTree.children.some(n=>n.direction==="column"&&n.children.some(v=>v.direction==="row"))')
        # Current-page auto-fit preserves every original object ID and textual content.
        page.locator('#pageStrip [data-strip-page]').first.click(button='right')
        page.locator('[data-context-page-action="layout"]').click()
        page.locator('#boxApplyMode').select_option('current')
        page.locator('#boxCount').select_option('4')
        page.locator('#boxDirection').select_option('column')
        # Changing count/direction immediately regenerates the proportional structure.
        before = page.evaluate('DocutApp.getProject().pages[1].elements.map(e=>[e.id,e.text,e.source,e.asOfDate,e.unit,e.evidence])')
        page.locator('#boxAutoApply').click()
        assert not page.locator('#boxLayoutDialog').is_visible()
        after = page.evaluate('DocutApp.getProject().pages[1].elements.map(e=>[e.id,e.text,e.source,e.asOfDate,e.unit,e.evidence])')
        assert before == after, (before, after)
        print('PASS proportional auto-layout, 4 vertical regions and content preservation', flush=True)

        # Visual gallery has exactly 89 distinct, locally generated icon drawings.
        saved = page.evaluate('JSON.stringify(DocutApp.getProject())')
        page.locator('[data-action="effects-studio"]').first.click()
        assert page.locator('#fxStudioList [data-fx-pick]').count() == 89
        assert page.locator('#fxStudioList svg.fx-glyph-svg').count() == 89
        assert page.evaluate('JSON.stringify(DocutApp.getProject())') == saved
        page.locator('[data-fx-category="charts"]').click()
        assert page.locator('#fxStudioList [data-fx-pick]').count() >= 9
        page.locator('[data-fx-category="numbers"]').click()
        assert page.locator('#fxStudioList [data-fx-pick]').count() >= 3
        page.locator('[data-fx-category="exit"]').click()
        assert page.locator('#fxStudioList [data-fx-pick]').count() >= 5
        page.locator('[data-fx-mode="transition"]').click()
        assert page.locator('#fxStudioList [data-fx-pick]').count() == 11
        page.locator('[data-fx-pick="scene-slide-up"]').click()
        page.locator('#fxStudioApply').click()
        assert page.evaluate('DocutApp.getProject().pages[0].transition') == 'slide-up'
        page.locator('#effectStudioDialog [data-fx-action="close"]').click()
        print('PASS 89 distinct visual effects, category controls and page transitions', flush=True)

        # Configure an actual selected card to exit on forward scene navigation.
        page.locator('#pageStrip [data-strip-page]').nth(0).click()
        card_id = page.evaluate('DocutApp.getProject().pages[0].elements.find(e=>e.type==="card"&&!e.locked).id')
        original = page.evaluate('(id)=>{const x=DocutApp.getProject().pages[0].elements.find(e=>e.id===id);return [x.text,x.source,x.unit,x.effects.length]}',card_id)
        page.locator('[data-left-tab="structure"]').click()
        page.locator(f'[data-layer-id="{card_id}"]').click()
        page.locator('[data-action="effects-studio"]').first.click()
        page.locator('[data-fx-pick="next-left"]').click()
        assert page.locator('#fxStudioApply').is_enabled()
        page.locator('#fxStudioApply').click()
        exits = page.evaluate('(id)=>DocutApp.getProject().pages[0].elements.find(e=>e.id===id).exitOnNext',card_id)
        assert exits and exits[0]['end']['x'] == -150
        assert page.evaluate('(id)=>{const x=DocutApp.getProject().pages[0].elements.find(e=>e.id===id);return [x.text,x.source,x.unit,x.effects.length]}',card_id) == original
        page.locator('#effectStudioDialog [data-fx-action="close"]').click()
        standalone_html = page.evaluate('DocutExporter.exportHTML(DocutApp.getProject())')
        standalone = ctx.new_page()
        public_errors = []
        standalone.on('pageerror', lambda e: public_errors.append(str(e)))
        standalone.set_content(standalone_html, wait_until='domcontentloaded')
        assert standalone.locator('.slide.active').get_attribute('data-docut-page') == '1'
        standalone.locator('#next').click()
        assert standalone.locator('.slide.active').get_attribute('data-docut-page') == '1'
        standalone.wait_for_timeout(1100)
        assert standalone.locator('.slide.active').get_attribute('data-docut-page') == '2'
        assert not public_errors and not errors, (public_errors,errors)
        standalone.close()
        print('PASS next-scene exit survives standalone HTML and works before page switch', flush=True)
        ctx.close()
        browser.close()


if __name__ == '__main__':
    run()
