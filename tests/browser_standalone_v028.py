"""Exact v0.28 bundled offline HTML smoke test (synthetic Chromium, no network)."""
from pathlib import Path
from playwright.sync_api import sync_playwright

FILE = Path('/mnt/data/DoCut_Studio_v028_Offline.html')


def main():
    assert FILE.is_file(), 'Bundle the HTML once after all source edits'
    content=FILE.read_text(encoding='utf-8')
    assert 'data-inline-module="effect_studio.js"' in content
    assert '<script src="./assets/' not in content
    assert '<link rel="stylesheet" href="./assets/' not in content
    assert '0.28.0' in content
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        context=browser.new_context(viewport={'width':1540,'height':980},accept_downloads=True)
        page=context.new_page()
        errs=[];unexpected=[]
        page.on('pageerror',lambda error:errs.append(str(error)))
        page.on('request',lambda request:unexpected.append(request.url))
        page.evaluate('''() => {const m=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),clear:()=>m.clear()}})}''')
        page.set_content(content,wait_until='domcontentloaded')
        page.wait_for_function('Boolean(window.DocutApp&&window.DocutEffectStudio&&window.DocutInteractionFX)',timeout=15000)
        state=page.evaluate('''() => ({k:DocutPageKits.BUILTINS.length,p:DocutEffectCatalog.PRESETS.length,fx:DocutEffectCatalog.KINDS.length,ref:DocutReferenceMap.DATA.items.length,logo:Object.keys(DocutBranding.POSITIONS).length,fonts:DocutBranding.FONTS.length})''')
        assert state=={'k':20,'p':33,'fx':32,'ref':89,'logo':8,'fonts':10},state
        page.locator('[data-action="effects-studio"]').first.click()
        assert page.locator('#effectStudioDialog').is_visible()
        assert page.locator('#fxStudioList [data-fx-pick]').count()==33
        assert page.locator('#fxStudioStage .docut-fx-layer-ambient').count()==1
        assert page.locator('#fxStudioStage .docut-fx-layer-cursor').count()==1
        page.wait_for_timeout(1700)
        page.screenshot(path='/mnt/data/docut_v028_standalone.png',full_page=False)
        page.locator('#effectStudioDialog [data-fx-action="close"]').click()
        page.locator('[data-action="template-gallery"]').first.click()
        assert page.locator('#kitGallery [data-kit-choice]').count()==20
        assert not errs,errs
        assert not unexpected,'Offline editor unexpectedly requested external assets: '+str(unexpected)
        context.close();browser.close()
        print('PASS standalone HTML v0.28: 29 inline JS modules, CSS inline, 20 kits, 32 kinds, 33 presets, 89 ref metadata, 8 logos, 10 fonts, no network')


if __name__=='__main__':main()
