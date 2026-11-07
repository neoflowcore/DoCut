"""Manual local Chromium regression for DoCut source; no CI or build artifacts."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re, sys, traceback
ROOT=Path(__file__).resolve().parents[1]
JS=['core','story_player','core_enhanced','branding','page_kits','review_board','effect_catalog','interaction_fx','page_transitions','reference_map','stat_charts','easing','visual_motion','css_import','data_io','rich_text','media_layout','layer_ops','import_review','text_rewrite','quality_review','validation_center','pane_layout','export','effect_studio','pptx','proposal','persistence','app']

def load(page):
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    html=(ROOT/'index.html').read_text(encoding='utf-8')
    html=re.sub(r'<script src="[^"]+" defer></script>','',html)
    html=re.sub(r'<link[^>]+href="\./assets/styles.css"[^>]*>','',html)
    page.set_content(html,wait_until='domcontentloaded')
    page.add_style_tag(content=(ROOT/'assets/styles.css').read_text(encoding='utf-8'))
    for name in JS:
        page.add_script_tag(content=(ROOT/'assets'/f'{name}.js').read_text(encoding='utf-8'))
    assert page.evaluate('Boolean(window.DocutApp && window.DocutCore && window.DocutExporter && window.DocutPPTX)'),errors
    assert page.locator('#slide .element').count()>=3
    return errors

def run():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        page=browser.new_page(viewport={'width':1600,'height':960},accept_downloads=True)
        errors=load(page)
        results=[]
        def test(name,func):
            try:func();assert not errors,errors;results.append((name,'PASS'))
            except Exception as e:results.append((name,'FAIL '+repr(e)));traceback.print_exc()
        def basics():
            assert page.locator('#pageCount').inner_text()=='5'
            assert page.locator('#slide .element').count()==5
            assert len(page.evaluate('DocutApp.getProject().pages'))==5
            assert page.locator('#inspector .inspect-section').count()>0
        test('startup',basics)
        def insert():
            page.locator('[data-left-tab="insert"]').click()
            page.locator('[data-insert="bullet"]').click()
            assert page.evaluate('DocutApp.getProject().pages[0].elements.at(-1).type')=='bullet'
            page.locator('[data-insert="table"]').click()
            assert page.evaluate('DocutApp.getProject().pages[0].elements.at(-1).type')=='table'
        test('insert types',insert)
        def group():
            page.locator('[data-left-tab="structure"]').click()
            items=page.locator('.layer-item')
            items.nth(0).click();items.nth(1).click(modifiers=['Control'])
            page.locator('[data-action="group"]').click()
            groups=page.evaluate('DocutApp.getProject().pages[0].elements.filter(x=>x.groupId).map(x=>x.groupId)')
            assert len(groups)>=2 and len(set(groups))==1,groups
            page.locator('[data-action="ungroup"]').click()
        test('group and ungroup',group)
        def layers():
            ident=page.locator('.layer-item').first.get_attribute('data-layer-id')
            page.locator('[data-lock-id]').first.click()
            assert page.evaluate('(id)=>DocutApp.getProject().pages[0].elements.find(e=>e.id===id).locked',ident)
            page.locator('[data-hide-id]').first.click()
            assert page.evaluate('(id)=>DocutApp.getProject().pages[0].elements.find(e=>e.id===id).hidden',ident)
            page.locator('[data-lock-id]').first.click();page.locator('[data-hide-id]').first.click()
        test('layer lock and hide',layers)
        def page_order():
            initial=page.evaluate('DocutApp.getProject().pages.map(p=>p.id)')
            page.locator('[data-page-index="0"]').drag_to(page.locator('[data-page-index="1"]'))
            order=page.evaluate('DocutApp.getProject().pages.map(p=>p.id)')
            assert order[1]==initial[0]
        test('page reorder',page_order)
        def layouts():
            page.locator('[data-left-tab="insert"]').click()
            old=page.evaluate('DocutApp.getProject().pages[1].elements.length')
            page.locator('[data-layout="two"]').click()
            assert page.evaluate('DocutApp.getProject().pages[1].layout')=='two'
            assert page.evaluate('DocutApp.getProject().pages[1].elements.length')==old
        test('layout preserve',layouts)
        def motion():
            page.locator('.element').first.click()
            page.locator('[data-motion-preset="focus"]').click()
            effects=page.evaluate('DocutApp.getProject().pages[1].elements.find(e=>e.id===DocutApp.getState().selectedId).effects')
            assert len(effects)==2
            page.locator('[data-add-key="0"]').click()
            effects=page.evaluate('DocutApp.getProject().pages[1].elements.find(e=>e.id===DocutApp.getState().selectedId).effects')
            assert len(effects[0]['keyframes'])==1
            page.locator('#timelineScrub').fill('1200')
            assert '1.20' in page.locator('#timelineTimeCurrent').inner_text()
        test('motion and scrub',motion)
        def beziers():
            handle=page.locator('[data-bezier-handle="0"]')
            before=page.evaluate('DocutApp.getProject().pages[1].elements.find(e=>e.id===DocutApp.getState().selectedId).effects[0].easing')
            handle.focus();page.keyboard.press('ArrowRight')
            after=page.evaluate('DocutApp.getProject().pages[1].elements.find(e=>e.id===DocutApp.getState().selectedId).effects[0].easing')
            assert before!=after,(before,after)
        test('bezier control',beziers)
        def search():
            page.locator('[data-action="search"]').click()
            page.locator('#searchInput').fill('핵심')
            assert page.locator('[data-search-page]').count()>=1
            page.locator('[data-action="close-search"]').first.click()
        test('search',search)
        def import_css():
            sample='<html><head><title>Sample</title><style>:root{--accent:#aa5500}.hero{position:absolute;left:80px;top:40px;width:520px;color:var(--accent)}</style></head><body><section class="page"><h1 class="hero">Case title</h1><p>Findings</p></section></body></html>'
            result=page.evaluate('(markup)=>DocutCSSImport.importHTML(markup)',sample)
            assert result['stats']['cssRules']>=1,result
            assert result['project']['pages'][0]['elements'][0]['x']==80,result
            assert result['project']['pages'][0]['elements'][0]['style']['color']=='#aa5500',result
        test('css import',import_css)
        def append_project():
            before=len(page.evaluate('DocutApp.getProject().pages'))
            data=page.evaluate('JSON.stringify(DocutCore.createProject(3))')
            result=page.evaluate('(raw)=>DocutCore.appendProject(DocutApp.getProject(),JSON.parse(raw))',data)
            assert len(result['pages'])==before+3
            ids=[x['id'] for p in result['pages'] for x in p['elements']]
            assert len(ids)==len(set(ids))
        test('append ids',append_project)
        def standalone_export():
            output=page.evaluate('DocutExporter.exportHTML(DocutApp.getProject())')
            assert 'docut-project' in output and 'application/json' in output
            imported=page.evaluate('(html)=>DocutExporter.decodeHTML(html)',output)
            assert imported['mode']=='native' and len(imported['project']['pages'])==5
        test('html roundtrip',standalone_export)
        def pptx():
            result=page.evaluate('(()=>{const b=DocutPPTX.createPPTX(DocutApp.getProject());return [b.length,b[0],b[1]]})()')
            assert result[0]>5000 and result[1:]==[80,75]
        test('pptx in-memory',pptx)
        def small_screen():
            page.set_viewport_size({'width':390,'height':844});page.locator('[data-action="toggle-inspector"]').click();assert page.locator('.rightbar').is_visible()
            assert page.evaluate('document.documentElement.scrollWidth<=document.documentElement.clientWidth+2')
        test('mobile overflow',small_screen)
        browser.close()
        print('\n'.join(f'{n}: {v}' for n,v in results))
        good=sum(r=='PASS' for _,r in results);print('TOTAL',good,'/',len(results))
        if good<len(results):sys.exit(1)

if __name__=='__main__':run()
