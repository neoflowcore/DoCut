"""Smoke test the exact bundled offline editor that will be deployed to Vercel."""
from pathlib import Path
from playwright.sync_api import sync_playwright
BUNDLE=Path('/mnt/data/DoCut_Studio_v033_Offline.html')
OUT=Path('/mnt/data/DoCut_v033_Professional_Gallery.png')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1600,'height':1000})
 errors=[];page.on('pageerror',lambda x:errors.append(str(x)))
 page.set_content(BUNDLE.read_text(encoding='utf-8'),wait_until='domcontentloaded')
 page.wait_for_function('Boolean(window.DocutApp&&window.DocutProReports)',timeout=20000)
 assert page.locator('.brand em').inner_text()=='0.33.0'
 page.locator('[data-action="template-gallery"]').first.click()
 assert page.locator('#kitGallery .pro-pack-choice').count()==20
 page.locator('#kitGallery [data-kit-choice="FIN-17"]').click()
 assert page.locator('#kitPackPageStrip .kit-pack-page').count()==6
 page.locator('#kitPackPageStrip [data-kit-page="2"]').click()
 assert page.locator('#kitPreviewCanvas .kit-map-block').count()>=4
 page.screenshot(path=str(OUT),full_page=True)
 assert not errors,errors
 print('PASS exact bundled editor v0.33 / 20 global report packs / six-page preview / zero page errors')
 browser.close()
