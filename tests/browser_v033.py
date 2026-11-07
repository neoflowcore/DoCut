"""DoCut v0.33 professional report pack browser acceptance."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_v032 import ready

ROOT=Path(__file__).resolve().parents[1]

def run():
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  context=browser.new_context(viewport={'width':1660,'height':1040},accept_downloads=True)
  page=context.new_page()
  errors=ready(page)
  assert page.locator('.brand em').inner_text()=='0.33.0'
  assert page.evaluate('DocutProReports.PACKS.length')==20
  assert page.evaluate('DocutEffectCatalog.GALLERY.length')==89
  original=page.evaluate('JSON.stringify(DocutApp.getProject())')
  page.locator('[data-action="template-gallery"]').first.click()
  assert page.locator('#kitCategory').input_value()=='pro'
  assert page.locator('#kitGallery .pro-pack-choice').count()==20
  assert page.locator('#kitPackPageStrip [data-kit-page]').count()==6
  page.locator('#kitCategory').select_option('pro-Earnings')
  assert page.locator('#kitGallery .pro-pack-choice').count()==5
  page.locator('#kitGallery [data-kit-choice="EARN-06"]').click()
  page.locator('#kitPackPageStrip [data-kit-page="3"]').click()
  assert '부문별 성과' in page.locator('#kitPreviewTitle').inner_text()
  assert page.locator('#kitReferenceSource').get_attribute('href').startswith('https://')
  assert page.evaluate('JSON.stringify(DocutApp.getProject())')==original
  page.locator('#kitPackAdd').click()
  assert page.evaluate('DocutApp.getProject().pages.length')==11
  assert page.evaluate('DocutApp.getProject().pages[1].tab')=='핵심 결론'
  assert page.evaluate('DocutApp.getProject().pages[1].elements.every(e=>e.source==="" && !e.verified)')
  assert not page.locator('#kitDialog').is_visible()
  assert page.evaluate('DocutApp.getState().history')>=1
  page.locator('[data-action="undo"]').first.click()
  assert page.evaluate('DocutApp.getProject().pages.length')==5
  page.locator('[data-action="template-gallery"]').first.click()
  page.locator('#kitCategory').select_option('legacy')
  assert page.locator('#kitGallery .pro-pack-choice').count()==0
  assert page.locator('#kitGallery .kit-choice').count()==20
  page.locator('#kitCategory').select_option('pro')
  page.locator('#kitGallery [data-kit-choice="FIN-17"]').click()
  page.locator('#kitPackPageStrip [data-kit-page="5"]').click()
  page.locator('#kitDialog [data-action="kit-insert"]').click()
  assert page.evaluate('DocutApp.getProject().pages.length')==6
  assert page.evaluate('DocutApp.getProject().pages[DocutApp.getState().pageIndex].tab')=='자료·방법·한계'
  page.locator('#pageStrip [data-strip-page]').nth(1).click(button='right')
  assert page.locator('#canvasContextTools').is_visible()
  assert not errors,errors
  print('PASS 20 professional packs, 6-page previews, insert/undo, individual page, original legacy/89 effects/context',flush=True)
  browser.close()

if __name__=='__main__':run()
