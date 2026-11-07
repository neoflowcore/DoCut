"""DoCut V0.16 focused UI interactions. Manual local Chromium only, no installers or CI."""
from playwright.sync_api import sync_playwright
from browser_recovery import load
import traceback
import os


def run():
    results=[]
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        def check(label, callback, mobile=False, reduced=False):
            part,total=(int(x) for x in os.environ.get("DOCUT_TEST_SHARD","0/1").split("/"))
            if not hasattr(check,"position"):check.position=0
            idx=check.position;check.position+=1
            if idx%total!=part:return
            page=browser.new_page(viewport={'width':390,'height':760} if mobile else {'width':1600,'height':950}, reduced_motion='reduce' if reduced else 'no-preference', accept_downloads=False)
            page.set_default_timeout(6500)
            try:
                errors=load(page)
                callback(page)
                assert not errors,errors
                results.append((label,'PASS'))
            except Exception as e:
                traceback.print_exc()
                results.append((label,'FAIL '+str(e)))
            finally:
                page.close()

        def catalog(pg):
            assert pg.evaluate('DocutCore.VERSION')=='0.26.0-development'
            assert pg.locator('#themeList [data-theme]').count()==9
            pg.locator('[data-left-tab="insert"]').click()
            assert pg.locator('#layoutList [data-layout]').count()==12
            assert pg.evaluate('DocutEffectCatalog.PRESETS.length')==29
        check('9 theme swatches, 12 layout templates and 29 recipes',catalog)

        def page_transition(pg):
            selector=pg.locator('#inspector [data-path="page.transition"]')
            assert selector.is_visible()
            selector.select_option('wipe')
            assert pg.evaluate('DocutApp.getProject().pages[0].transition')=='wipe'
            result=pg.evaluate('DocutExporter.exportHTML(DocutApp.getProject())')
            assert 'data-docut-transition="wipe"' in result
            assert '<script>' in result and 'DocutVisualMotion' in result
            pg.locator('[data-action="undo"]').first.click()
            assert pg.evaluate('DocutApp.getProject().pages[0].transition')=='fade'
        check('per-page wipe transition native roundtrip and Undo',page_transition)

        def text_preset(pg):
            pg.locator('#slide .element[data-type="title"]').first.click()
            assert pg.locator('[data-visual-preset="typing"]').count()==1
            pg.locator('[data-visual-preset="typing"]').click()
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.find(e=>e.type==="title").effects[0].kind')=='typewriter'
            pg.locator('[data-action="undo"]').first.click()
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.find(e=>e.type==="title").effects[0]?.kind')!='typewriter'
        check('typography preset applied only to selected title with Undo',text_preset)

        def effect_order(pg):
            pg.locator('#slide .element[data-type="title"]').first.click()
            pg.locator('[data-visual-preset="executive"]').click()
            before=pg.evaluate('DocutApp.getProject().pages[0].elements.find(e=>e.type==="title").effects.map(e=>e.kind)')
            assert len(before)==2,before
            pg.locator('[data-move-effect="0:1"]').click()
            after=pg.evaluate('DocutApp.getProject().pages[0].elements.find(e=>e.type==="title").effects.map(e=>e.kind)')
            assert after==before[::-1]
            pg.locator('[data-action="undo"]').first.click()
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.find(e=>e.type==="title").effects.map(e=>e.kind)')==before
        check('three-stack reorder and one-step undo',effect_order)

        def all_motion(pg):
            p=pg.evaluate('DocutApp.getProject()')
            pg.locator('[data-action="auto-motion-page"]').click()
            after=pg.evaluate('DocutApp.getProject()')
            assert len(after['pages'][0]['elements'])==len(p['pages'][0]['elements'])
            assert all(len(e['effects'])>0 and len(e['effects'])<=3 for e in after['pages'][0]['elements'])
            assert after['pages'][0]['elements'][0]['id']==p['pages'][0]['elements'][0]['id']
            pg.locator('[data-action="undo"]').first.click()
            assert pg.evaluate('DocutApp.getProject().pages[0].elements[0].effects')==p['pages'][0]['elements'][0]['effects']
        check('whole-page type-specific motion recipe preserves contents and is undoable',all_motion)

        def chart_preset(pg):
            pg.evaluate('DocutApp.selectPage(1)')
            pg.locator('#slide .element[data-type="bar"]').first.click()
            assert pg.locator('[data-visual-preset="bars"]').count()==1
            pg.locator('[data-visual-preset="bars"]').click()
            kinds=pg.evaluate('DocutApp.getProject().pages[1].elements.find(e=>e.type==="bar").effects.map(f=>f.kind)')
            assert kinds==['fade','chart-rise'],kinds
            pg.locator('[data-adv="data.palette"]').select_option('cobalt')
            data=pg.evaluate('DocutApp.getProject().pages[1].elements.find(e=>e.type==="bar").data.palette')
            assert data=='cobalt'
            pg.locator('[data-action="preview"]').first.click()
            assert pg.locator('#previewSlide .chart-svg').count()>=1
            assert pg.evaluate('document.querySelector("#previewSlide .chart-svg")?.querySelectorAll("rect").length')>0
            pg.locator('[data-action="close-preview"]').click()
        check('animated bar chart / extended chart palette / preview',chart_preset)

        def threed_pose(pg):
            pg.locator('#slide .element[data-type="title"]').first.click()
            pg.locator('[data-visual-preset="paper-turn"]').click()
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.find(e=>e.type==="title").effects[0].kind')=='flip-y'
            pg.locator('[data-pose-section="0:start"] summary').click()
            control=pg.locator('[data-pose-effect="0"][data-pose-side="start"][data-pose-key="rotateY"]')
            control.fill('-60');control.press('Tab')
            p=pg.evaluate('DocutApp.getProject().pages[0].elements.find(e=>e.type==="title").effects[0]')
            assert p['start']['rotateY']==-60,p
        check('editable 2.5D Y-axis start pose in Inspector',threed_pose)

        def new_layout(pg):
            pg.locator('[data-left-tab="insert"]').click()
            before=pg.evaluate('DocutApp.getProject().pages[0].elements.map(e=>({id:e.id,text:e.text}))')
            pg.locator('[data-layout="quadrant"]').click()
            after=pg.evaluate('DocutApp.getProject().pages[0]')
            assert after['layout']=='quadrant'
            assert [(e['id'],e['text']) for e in after['elements']]==[(e['id'],e['text']) for e in before]
        check('4-quadrant layout keeps titles and all data',new_layout)

        def import_nested(pg):
            markup='''<html><body><section class="page" style="width:1280px;height:720px">
                <div style="position:absolute;left:100px;top:60px;width:400px;height:300px">
                 <p style="position:absolute;left:40px;top:20px;width:240px;height:80px">Nested figure</p></div>
                 <div title="Background media" style="position:absolute;left:530px;top:90px;width:240px;height:160px;background-image:url(data:image/png;base64,iVBORw0KGgo=)"></div>
                </section></body></html>'''
            result=pg.evaluate('(markup)=>DocutCSSImport.importHTML(markup)',markup)
            els=result['project']['pages'][0]['elements'];text=next(e for e in els if e['text']=='Nested figure')
            assert text['x']==140 and text['y']==80,text
            assert any(e['type']=='image' and e['data']['src'].startswith('data:image/png') for e in els),els
        check('nested CSS absolute position and local background image import',import_nested)

        def runtime(pg):
            pg.locator('#slide .element[data-type="title"]').first.click()
            pg.locator('[data-visual-preset="word-cascade"]').click()
            pg.locator('[data-action="preview"]').first.click()
            count=pg.locator('#previewSlide .docut-word').count()
            assert count>=2,count
            pg.locator('[data-action="close-preview"]').click()
            assert pg.locator('#previewOverlay').is_hidden()
        check('word-by-word caption playback and clean preview close',runtime)

        def reduced_motion(pg):
            pg.locator('#slide .element[data-type="title"]').first.click()
            pg.locator('[data-visual-preset="typing"]').click()
            pg.locator('[data-action="preview"]').first.click()
            count=pg.evaluate('document.querySelectorAll("#previewSlide .element")[0].getAnimations().length')
            assert count==0,count
            pg.locator('[data-action="close-preview"]').click()
        check('reduced-motion browser preference disables WAAPI animations',reduced_motion,reduced=True)

        def standalone_playback(pg):
            html=pg.evaluate('''() => {const p=DocutApp.getProject();p.pages[0].elements[0].effects=[DocutCore.makeEffect('word-rise',900,0)];p.pages[1].transition='zoom';p.pages[1].elements[0].effects=[DocutCore.makeEffect('typewriter',850,0)];return DocutExporter.exportHTML(p);}''')
            pg.goto('about:blank')
            pg.set_content(html,wait_until='domcontentloaded')
            assert pg.evaluate('typeof DocutVisualMotion.play')=='function'
            assert pg.locator('.slide.active .docut-word').count()>=2
            pg.locator('#next').click()
            assert pg.locator('.slide.active').get_attribute('data-docut-page')=='2'
            assert pg.locator('.slide.active').get_attribute('data-docut-transition')=='zoom'
            assert pg.evaluate('document.querySelector(".slide.active .plain-text")?.getAnimations().length')>=1
            pg.locator('#prev').click()
            assert pg.locator('.slide.active').get_attribute('data-docut-page')=='1'
        check('standalone HTML physically runs visual font motion and page transitions offline',standalone_playback)

        def scrub_numeric(pg):
            pg.evaluate('''() => {const p=DocutApp.getProject();const k=DocutCore.makeBlock('kpi',430,310,{text:'₩1,200.00',effects:[DocutCore.makeEffect('counter-up',1000,0)]});p.pages[0].elements.push(k);DocutApp.loadProject(p);}''')
            pg.locator('#timelineScrub').fill('500')
            value=pg.locator('#slide .element[data-type="kpi"] .kpi-value').last.inner_text()
            assert value.startswith('₩') and value!='₩1,200.00' and value!='₩0.00',value
            pg.locator('[data-action="timeline-start"]').click()
            assert pg.locator('#slide .element[data-type="kpi"] .kpi-value').last.inner_text()=='₩0.00'
        check('KPI counter-up timed scrub preserves units and precision',scrub_numeric)

        def mobile_catalog(pg):
            pg.locator('[data-action="toggle-pages"]').first.click()
            pg.locator('[data-left-tab="styles"]').click()
            assert pg.locator('[data-theme="bronze"]').count()==1
            assert pg.locator('[data-theme="cobalt"]').count()==1
            pg.locator('#themeDetails summary').click()
            pg.locator('[data-theme="bronze"]').click()
            assert pg.evaluate('DocutApp.getProject().theme')=='bronze'
        check('mobile palette menu maintains 16:9 report project',mobile_catalog,mobile=True)
        browser.close()
    for name,state in results:print(f'{state}: {name}')
    total=sum(state=='PASS' for _,state in results)
    print(f'V0.16 browser: {total}/{len(results)}')
    if total!=len(results):raise AssertionError(f'{len(results)-total} v016 browser checks failed')


if __name__=='__main__':run()
