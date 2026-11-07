"""DoCut V0.28 focused Chromium acceptance: live light layers, previews, fonts, export.

No remote browser/network, installers, ZIP archives, GitHub Actions or CI builds.
A Chromium PASS is not the same as a manual Windows/Brave PASS.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_v018 import ready

ROOT = Path(__file__).resolve().parents[1]
PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/eoYAAAAASUVORK5CYII='


def run():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        ctx = browser.new_context(viewport={'width': 1620, 'height': 1020}, accept_downloads=True)
        page = ctx.new_page()
        errors = ready(page)
        assert page.evaluate('typeof DocutEffectStudio') == 'object'
        assert page.evaluate('[DocutPageKits.BUILTINS.length,DocutEffectCatalog.KINDS.length,DocutEffectCatalog.PRESETS.length,DocutReferenceMap.DATA.items.length]') == [20, 32, 33, 89]

        # No project mutation is allowed while browsing effects.
        before = page.evaluate('JSON.stringify(DocutApp.getProject().pages[0].elements.map(e=>e.effects))')
        page.locator('[data-action="effects-studio"]').first.click()
        dlg = page.locator('#effectStudioDialog')
        assert dlg.is_visible()
        assert page.locator('#fxStudioList [data-fx-pick]').count() == 33
        assert page.locator('#fxStudioApply').is_disabled()
        sample = page.locator('#fxStudioStage .element')
        assert sample.count() == 1
        assert sample.locator('.docut-fx-layer-cursor').count() == 1
        assert sample.locator('.docut-fx-layer-ambient').count() == 1
        assert sample.locator('.docut-fx-layer-edge').count() == 0
        assert 'undefined' not in sample.get_attribute('style')
        pos = sample.bounding_box()
        page.mouse.move(pos['x'] + pos['width'] * .34, pos['y'] + pos['height'] * .55)
        assert sample.evaluate('(e)=>parseFloat(e.style.getPropertyValue("--docut-pointer-x"))') > 20
        assert page.evaluate('JSON.stringify(DocutApp.getProject().pages[0].elements.map(e=>e.effects))') == before
        page.wait_for_timeout(1700)
        page.screenshot(path='/mnt/data/docut_v028_effect_studio.png', full_page=False)

        page.locator('#fxStudioSearch').fill('시네마')
        assert page.locator('#fxStudioList [data-fx-pick]').count() == 1
        page.locator('#fxStudioSearch').fill('')
        page.locator('[data-fx-mode="kind"]').click()
        assert page.locator('#fxStudioList [data-fx-pick]').count() == 32
        page.locator('#fxStudioCategory').select_option('interaction')
        assert page.locator('#fxStudioList [data-fx-pick]').count() == 4
        page.locator('[data-fx-pick="cursor-tilt"]').click()
        assert sample.count() == 1
        assert 'docut-fx-cursor-tilt' in sample.get_attribute('class')
        dlg.locator('[data-fx-action="close"]').click()
        assert not dlg.is_visible()
        assert not errors, errors

        # Choose a report card (rather than applying effects to a demo sample).
        card_id = page.evaluate('DocutApp.getProject().pages[0].elements.find(e=>e.type==="card"&& !e.locked).id')
        page.locator('[data-left-tab="structure"]').click()
        page.locator(f'[data-layer-id="{card_id}"]').click()
        initial_text = page.evaluate('''id=>{const el=DocutApp.getProject().pages[0].elements.find(e=>e.id===id);return [el.text,el.source,el.asOfDate,el.unit,el.evidence]}''', card_id)
        page.locator('[data-action="effects-studio"]').first.click()
        assert page.locator('#fxStudioApply').is_enabled()
        page.locator('#fxStudioList [data-fx-pick="cursor-spotlight"]').click()
        page.locator('#fxStudioApply').click()
        stack = page.evaluate('''id=>DocutApp.getProject().pages[0].elements.find(e=>e.id===id).effects.map(e=>e.kind)''',card_id)
        assert stack == ['fade-up','ambient-aura','cursor-glow'], stack
        assert page.evaluate('''id=>{const el=DocutApp.getProject().pages[0].elements.find(e=>e.id===id);return [el.text,el.source,el.asOfDate,el.unit,el.evidence]}''', card_id) == initial_text
        page.locator('#effectStudioDialog [data-fx-action="close"]').click()
        card = page.locator(f'#slide .element[data-id="{card_id}"]')
        assert card.locator('.docut-fx-layer-cursor').count() == 1
        assert card.locator('.docut-fx-layer-ambient').count() == 1
        assert card.locator('.docut-fx-layer-edge').count() == 0
        assert card.locator('.element-inner').count() == 1

        # Every card owns independent light variables; changes must survive re-render/export.
        assert page.locator('[data-path="style.fxGlowStrength"]').count() == 1
        assert page.locator('[data-path="style.fxGlowRadius"]').count() == 1
        assert page.locator('[data-path="style.fxTiltStrength"]').count() == 1
        assert page.locator('[data-path="style.fxEdgeSpeed"]').count() == 1
        page.locator('[data-path="style.fxGlowStrength"]').fill('0.4')
        page.locator('[data-path="style.fxGlowStrength"]').press('Tab')
        page.locator('[data-path="style.fxGlowRadius"]').fill('340')
        page.locator('[data-path="style.fxGlowRadius"]').press('Tab')
        page.locator('[data-path="style.fxLightColor"]').fill('#d18844')
        assert card.evaluate('(e)=>e.style.getPropertyValue("--docut-light-radius")') == '340px'
        assert card.evaluate('(e)=>e.style.getPropertyValue("--docut-light-rgb")') == '209,136,68'
        assert card.evaluate('(e)=>e.style.getPropertyValue("--docut-light-alpha")') == '0.300'
        # An alpha edit must not fade text/labels or interactive layers.
        page.locator('[data-path="style.backgroundOpacity"]').evaluate('''e=>{e.value='0.25';e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));}''')
        vals=card.evaluate('''e=>{const c=getComputedStyle(e);return [c.backgroundColor,c.opacity,getComputedStyle(e.querySelector('.element-inner')).opacity]}''')
        assert vals[0].endswith('0.25)'), vals
        assert vals[1] == '1' and vals[2] == '1', vals
        assert page.evaluate('''() => DocutBranding.backgroundAlpha('#6699cc88',.5)''').startswith('rgba(102,153,204,0.266'), 'Hex-alpha composition failed'
        assert page.evaluate('''() => DocutBranding.backgroundAlpha('rgba(40,50,60,0.4)',.25)''') == 'rgba(40,50,60,0.1)'
        assert page.evaluate('''() => DocutBranding.backgroundAlpha('rgb(40, 50, 60)',0)''') == 'rgba(40,50,60,0)'

        # Entire document, including locked objects only after explicit opt-in.
        page.locator('[data-left-tab="styles"]').click()
        page.locator('[data-action="brand-settings"]').click()
        page.locator('[data-adv="master.logoPosition"]').select_option('top-right')
        page.locator('[data-adv="master.logoShape"]').select_option('circle')
        page.locator('[data-adv="master.fontFamily"]').select_option('SUIT')
        assert page.locator('#applyFontToLocked').count() == 1
        page.locator('#applyFontToLocked').check()
        page.locator('[data-action="apply-global-font"]').click()
        actual = page.evaluate('''() => {const p=DocutApp.getProject();return [p.master.logoPosition,p.master.fontFamily,p.pages.flatMap(pg=>pg.elements).filter(e=>!['shape','image','divider'].includes(e.type)).every(e=>e.style.font==='SUIT')]}''')
        assert actual == ['top-right', 'SUIT', True], actual

        # Export must contain the same three-layer CSS semantics, not only editor styles.
        doc=page.evaluate('''png=>{const p=DocutApp.getProject();p.master.logo=png;return DocutExporter.exportHTML(p)}''',PNG)
        public = ctx.new_page()
        public_errors=[]
        public.on('pageerror',lambda e:public_errors.append(str(e)))
        public.set_content(doc,wait_until='domcontentloaded')
        assert public.locator('.master-logo').count() == 5
        exported=public.locator(f'.element[data-id="{card_id}"]').first
        assert exported.locator('.docut-fx-layer-ambient').count() == 1
        assert exported.locator('.docut-fx-layer-cursor').count() == 1
        assert exported.locator('.element-inner').count() == 1
        assert exported.evaluate('(e)=>e.style.getPropertyValue("--docut-light-radius")') == '340px'
        assert exported.evaluate('(e)=>e.style.getPropertyValue("--docut-light-rgb")') == '209,136,68'
        assert public.evaluate('typeof DocutInteractionFX.install') == 'function'
        assert exported.evaluate('(e)=>getComputedStyle(e).backgroundColor').endswith('0.25)')
        exported.scroll_into_view_if_needed()
        public.wait_for_timeout(850)
        r=exported.bounding_box()
        public.mouse.move(r['x']+r['width']*.35,r['y']+r['height']*.45)
        assert exported.evaluate('(e)=>e.style.getPropertyValue("--docut-pointer-x")')
        assert not public_errors and not errors, (public_errors, errors)
        public.close()
        page.screenshot(path='/mnt/data/docut_v028_editor.png', full_page=False)
        # Reduced-motion media preference is respected in the actual browser,
        # including edge sweep and cursor tilt effects (not just source CSS text).
        reduced=ctx.new_page()
        reduced.emulate_media(reduced_motion='reduce')
        reduced_errors=ready(reduced)
        reduced.locator('[data-action="effects-studio"]').first.click()
        reduced.locator('[data-fx-pick="cinematic-light"]').click()
        edge=reduced.locator('#fxStudioStage .docut-fx-layer-edge')
        assert edge.count()==1
        assert edge.evaluate('(e)=>getComputedStyle(e).animationName')=='none'
        reduced.locator('[data-fx-pick="kinetic-card"]').click()
        tilt=reduced.locator('#fxStudioStage .element.docut-fx-cursor-tilt .element-inner')
        assert tilt.count()==1
        assert tilt.evaluate('(e)=>getComputedStyle(e).transform')=='none'
        assert not reduced_errors,reduced_errors
        reduced.close()
        print('PASS DoCut V0.28: 20 kits, 89 references, 32 effects, 33 presets, isolated 2–3 light layers, interactive sandbox, font lock, alpha and public HTML parity')
        ctx.close();browser.close()


if __name__=='__main__':
    run()
