"""Chromium validation of the bundled single-file editor markup.

The sandbox forbids file:// navigation, so use set_content to evaluate the exact
built bytes with no CSS/JS resource downloads. This does not test OS opening.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

FILE = Path('/mnt/data/DoCut_Studio_v027_Offline.html')


def main():
    assert FILE.exists()
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        context = browser.new_context(viewport={'width': 1540, 'height': 960}, accept_downloads=True)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda err: errors.append(str(err)))
        failed = []
        page.on('requestfailed', lambda req: failed.append(req.url))
        page.evaluate('''() => { const s=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>s.get(k)||null,setItem:(k,v)=>s.set(k,String(v)),removeItem:k=>s.delete(k),clear:()=>s.clear()}}); }''')
        page.set_content(FILE.read_text(encoding='utf-8'), wait_until='domcontentloaded')
        page.wait_for_function('Boolean(window.DocutApp?.getProject && window.DocutBranding && window.DocutInteractionFX)', timeout=20000)
        result = page.evaluate('''() => ({
          kits: DocutPageKits.BUILTINS.length,
          kinds: DocutEffectCatalog.KINDS.length,
          refs: DocutReferenceMap.DATA.items.length,
          pages: DocutApp.getProject().pages.length,
          title: document.title,
          logoPositions: Object.keys(DocutBranding.POSITIONS).length,
          fonts: DocutBranding.FONTS.length,
          storage: typeof localStorage !== 'undefined'
        })''')
        assert [result['kits'], result['kinds'], result['refs'], result['logoPositions'], result['fonts']] == [20, 32, 89, 8, 10], result
        assert result['pages'] >= 1, result
        page.locator('[data-action="template-gallery"]').first.click()
        assert page.locator('#kitDialog').is_visible()
        assert page.locator('#kitGallery [data-kit-choice]').count() == 20
        page.locator('[data-kit-choice="capital-blueprint"]').click()
        assert page.locator('#kitGallery [data-kit-choice="capital-blueprint"] .kit-preview-block').count() >= 4
        page.locator('#kitDialog [data-action="kit-close"]').first.click()
        page.locator('[data-left-tab="styles"]').click()
        page.locator('[data-action="brand-settings"]').click()
        page.locator('[data-adv="master.logoPosition"]').select_option('top-right')
        page.locator('[data-adv="master.fontFamily"]').select_option('Georgia')
        page.locator('[data-action="apply-global-font"]').click()
        assert page.evaluate('DocutApp.getProject().master.logoPosition') == 'top-right'
        assert page.evaluate('DocutApp.getProject().master.fontFamily') == 'Georgia'
        assert not errors, errors
        assert not failed, failed
        page.screenshot(path='/mnt/data/docut_v027_standalone.png')
        print('PASS bundled HTML script/style in Chromium (set_content):',result, 'errors:',errors, 'failed:',failed)
        browser.close()


if __name__ == '__main__':
    main()
