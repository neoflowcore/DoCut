"""Targeted Chromium smoke test for v0.27. No installers, no remote CI."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_v018 import ready
ROOT=Path(__file__).resolve().parents[1]
PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/eoYAAAAASUVORK5CYII='

def run():
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  ctx=browser.new_context(viewport={'width':1540,'height':960},accept_downloads=True)
  pg=ctx.new_page();errs=ready(pg)
  assert pg.evaluate('[DocutPageKits.BUILTINS.length,DocutEffectCatalog.KINDS.length,DocutReferenceMap.DATA.items.length]')==[20,32,89]
  pg.locator('[data-left-tab="styles"]').click()
  assert pg.locator('[data-action="template-gallery"]',has_text='프리미엄').count()==1
  pg.locator('[data-action="template-gallery"]').first.click()
  assert pg.locator('#kitDialog').is_visible()
  assert pg.locator('#kitGallery [data-kit-choice]').count()==20
  pg.locator('[data-kit-choice="boardroom-noir"]').click()
  assert '이사회' in pg.locator('#kitPreviewTitle').inner_text()
  assert pg.locator('#kitGallery [data-kit-choice="boardroom-noir"] .kit-preview-block').count()>=4
  pg.screenshot(path='/mnt/data/docut_v027_gallery.png',full_page=False)
  pg.locator('#kitDialog [data-action="kit-close"]').first.click()
  pg.locator('[data-action="open-effect-library"]').click()
  assert pg.locator('#referenceDetails').evaluate('(e)=>e.open')
  assert pg.locator('.reference-image-row').count()==89
  pg.locator('[data-action="brand-settings"]').click()
  assert pg.locator('[data-adv="master.logoPosition"]').is_visible()
  pg.locator('[data-adv="master.logoPosition"]').select_option('bottom-right')
  pg.locator('[data-adv="master.logoShape"]').select_option('circle')
  pg.locator('[data-adv="master.fontFamily"]').select_option('SUIT')
  pg.locator('[data-action="apply-global-font"]').click()
  data=pg.evaluate('''() => {const p=DocutApp.getProject();return [p.master.logoPosition,p.master.fontFamily,p.pages.every(pg=>pg.elements.filter(e=>!e.locked&&!['shape','image','divider'].includes(e.type)).every(e=>e.style.font==='SUIT'))]}''')
  assert data==['bottom-right','SUIT',True],data
  # Demonstrate on existing card without changing its evidence or text.
  cid=pg.evaluate('DocutApp.getProject().pages[0].elements.find(e=>e.type==="card").id')
  pg.locator('[data-left-tab="structure"]').click()
  pg.locator(f'[data-layer-id="{cid}"]').click()
  assert pg.locator('[data-path="style.backgroundOpacity"]').is_visible()
  pg.locator('[data-path="style.backgroundOpacity"]').fill('0.35')
  assert pg.evaluate('DocutApp.getProject().pages[0].elements.find(e=>e.id==="'+cid+'").style.backgroundOpacity')==.35
  pg.locator('[data-visual-preset="cursor-spotlight"]').click()
  assert pg.evaluate('DocutApp.getProject().pages[0].elements.find(e=>e.id==="'+cid+'").effects.map(e=>e.kind)')==['fade-up','ambient-aura','cursor-glow']
  assert pg.locator(f'#slide .element[data-id="{cid}"]').evaluate('(e)=>e.classList.contains("docut-fx-cursor-glow")')
  pg.screenshot(path='/mnt/data/docut_v027_editor.png',full_page=False)
  # Public HTML has its own autonomous inline runtime and no network requirements.
  markup=pg.evaluate('''png=>{const p=DocutApp.getProject();p.master.logo=png;p.master.logoPosition='bottom-right';return DocutExporter.exportHTML(p)}''',PNG)
  public=ctx.new_page();public_errors=[];public.on('pageerror',lambda e:public_errors.append(str(e)))
  public.set_content(markup,wait_until='domcontentloaded')
  assert public.evaluate('typeof DocutInteractionFX.install')=='function'
  assert public.locator('.master-logo').count()==5
  assert public.locator('.docut-fx-cursor-glow').count()>=1
  box=public.locator('.docut-fx-cursor-glow').first
  assert 'rgba(' in box.get_attribute('style')
  box.scroll_into_view_if_needed()
  r=box.bounding_box()
  public.mouse.move(r['x']+r['width']*.35,r['y']+r['height']*.45)
  assert box.evaluate('(e)=>e.style.getPropertyValue("--docut-pointer-x")')
  assert not errs and not public_errors,(errs,public_errors)
  print('PASS DoCut v0.27: 20 templates, 89 refs, brand controls, global font, alpha, combined motion, standalone pointer runtime')
  ctx.close();browser.close()
if __name__=='__main__':run()
