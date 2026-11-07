"""V0.20 offline import review and opt-in document text rewriting.
This uses a synthetic localStorage test double, not a real Windows/Android Brave session.
Only inert local markup is parsed; no network, build, or artifact generation.
"""
import os,traceback
from playwright.sync_api import sync_playwright
from browser_v018 import ready

HTML='<html><head><style>.page{position:relative;width:1280px;height:720px}.title{position:absolute;left:80px;top:60px}</style></head><body><section class="page"><h1 class="title">Imported summary</h1><p>Content with <b>bold</b> text</p><script>window.__unsafe_import=1</script><img src="https://invalid.example/tracker.png" alt="Remote cover"></section></body></html>'

def run():
    results=[]
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        def check(name,fn,mobile=False):
            part,total=(int(x) for x in os.environ.get("DOCUT_TEST_SHARD","0/1").split("/"))
            if not hasattr(check,"position"):check.position=0
            idx=check.position;check.position+=1
            if idx%total!=part:return
            if os.environ.get('DOCUT_TEST_FILTER') and not any(s in name for s in os.environ['DOCUT_TEST_FILTER'].split('|')):return
            ctx=browser.new_context(viewport={'width':390,'height':844} if mobile else {'width':1500,'height':900},accept_downloads=True)
            ctx.set_default_timeout(10000)
            page=ctx.new_page()
            failures=ready(page)
            try:
                fn(page)
                assert not failures, failures
                results.append((name,True));print('PASS',name,flush=True)
            except Exception:
                traceback.print_exc();results.append((name,False));print('FAIL',name,flush=True)
            finally:ctx.close()

        def import_file(page,name='report.html',text=HTML):
            page.locator('#importInput').set_input_files({'name':name,'mimeType':'text/html' if name.endswith('.html') else 'application/json','buffer':text.encode()})
            page.locator('#importModeDialog').wait_for(state='visible')
        def load_with_risk(page):
            import_file(page)
            assert page.evaluate('window.__unsafe_import') is None
            assert page.locator('#importPreviewCanvas .import-map').count()==1
            assert page.locator('#importModeAcknowledgeLabel').is_visible()

        def startup(page):
            assert page.locator('.brand em').inner_text()=='0.26.0'
            assert page.evaluate('DocutCore.VERSION')=='0.26.0-development'
            assert page.evaluate('Boolean(DocutImportReview && DocutTextRewrite)')
        check('V0.20 version and new modules loaded',startup)

        def import_preview(page):
            before=page.evaluate('JSON.stringify(DocutApp.getProject())')
            load_with_risk(page)
            assert '1 / 1' in page.locator('#importPreviewSummary').inner_text()
            assert '출처' in page.locator('#importModeSummary').inner_text()
            assert page.locator('#importModeWarnings').inner_text()
            assert page.locator('#importModeDialog [data-action=import-append]').is_disabled()
            assert page.locator('#importModeDialog [data-action=import-replace]').is_disabled()
            assert before==page.evaluate('JSON.stringify(DocutApp.getProject())')
            assert '<script' not in page.locator('#importPreviewCanvas').inner_html()
            assert 'Imported summary' in page.locator('#importPreviewCanvas').inner_text()
            page.locator('#importModeDialog [data-action=close-import-mode]').last.click()
            assert before==page.evaluate('JSON.stringify(DocutApp.getProject())')
        check('inert HTML visual and diff summary cannot mutate current project',import_preview)

        def approve(page):
            load_with_risk(page)
            page.locator('#importModeAcknowledge').check()
            assert page.locator('#importModeDialog [data-action=import-append]').is_enabled()
            page.locator('#importModeDialog [data-action=import-append]').click()
            assert page.evaluate('DocutApp.getProject().pages.length')==6
            assert 'Imported summary' in page.evaluate('DocutApp.getProject().pages.at(-1).tab')
            assert page.evaluate('window.__unsafe_import') is None
            page.locator('[data-action=undo]').first.click()
            assert page.evaluate('DocutApp.getProject().pages.length')==5
        check('explicit checkbox gates HTML append and Undo restores document',approve)

        def review_file(page):
            load_with_risk(page)
            with page.expect_download() as info:
                page.locator('#importModeDialog [data-action=import-review-report]').click()
            artifact=info.value
            assert artifact.suggested_filename=='DoCut_Import_Review.txt'
            assert artifact.failure() is None
            assert page.evaluate('window.__unsafe_import') is None
        check('import review evidence TXT download contains no executable source',review_file)

        def native_file(page):
            candidate=page.evaluate('JSON.stringify(DocutCore.createProject(2))')
            import_file(page,'safe.docut.json',candidate)
            assert page.locator('#importModeAcknowledgeLabel').is_hidden()
            assert page.locator('#importModeDialog [data-action=import-replace]').is_enabled()
            assert page.locator('#importPreviewPage option').count()==2
            page.locator('#importPreviewPage').select_option('1')
            assert '2 / 2' in page.locator('#importPreviewSummary').inner_text()
        check('native JSON is reviewed without approximation acknowledgement',native_file)

        def stale(page):
            load_with_risk(page)
            page.locator('#importModeAcknowledge').check()
            page.evaluate('DocutApp.addElement("text")')
            page.locator('#importModeDialog [data-action=import-replace]').click()
            assert page.evaluate('DocutApp.getProject().pages.length')==5
            assert page.locator('#importModeDialog').is_hidden()
        check('review cannot replace document changed after file read',stale)

        def text_plan(page):
            el=page.evaluate('DocutApp.getProject().pages[0].elements[0]')
            page.evaluate('''(id)=>{let p=DocutApp.getProject();p.pages[0].elements.find(e=>e.id===id).text='Risk Risk';p.pages[0].elements.find(e=>e.id===id).source='Risk origin';p.pages[0].elements.find(e=>e.id===id).verified=true;DocutApp.loadProject(p);}''',el['id'])
            page.locator('[data-action=search]').first.click()
            page.locator('#rewriteQuery').fill('Risk')
            page.locator('#rewriteReplacement').fill('Opportunity')
            page.locator('[data-action=rewrite-preview]').click()
            assert '2회' in page.locator('#rewriteSummary').inner_text()
            assert page.locator('#rewriteResults [data-rewrite-id]').count()==1
            assert page.locator('#rewriteApply').is_disabled()
            assert page.evaluate('DocutApp.getProject().pages[0].elements[0].text')=='Risk Risk'
            page.locator('#rewriteResults [data-rewrite-id]').check()
            page.locator('#rewriteApply').click()
            after=page.evaluate('DocutApp.getProject().pages[0].elements[0]')
            assert after['text']=='Opportunity Opportunity'
            assert after['source']=='Risk origin'
            assert after['verified'] is False
            page.locator('#searchDialog [data-action=close-search]').last.click()
            page.locator('[data-action=undo]').first.click()
            assert page.evaluate('DocutApp.getProject().pages[0].elements[0].text')=='Risk Risk'
        check('explicit element-level approved replace preserves source and Undo',text_plan)

        def skip_lock(page):
            p=page.evaluate('DocutApp.getProject()');p['pages'][0]['elements'][0]['locked']=True;p['pages'][0]['elements'][0]['text']='Locked phrase';page.evaluate('DocutApp.loadProject',p)
            page.locator('[data-action=search]').first.click()
            page.locator('#rewriteQuery').fill('Locked');page.locator('#rewriteReplacement').fill('Open')
            page.locator('[data-action=rewrite-preview]').click()
            assert '잠금 1회' in page.locator('#rewriteSummary').inner_text()
            assert page.locator('#rewriteApply').is_disabled()
        check('locked element remains unavailable in replace plan',skip_lock)

        def format_guard(page):
            p=page.evaluate('DocutApp.getProject()');e=p['pages'][0]['elements'][0];e['text']='Formatted';e['richText']=[{'text':'Formatted','bold':True}];page.evaluate('DocutApp.loadProject',p)
            page.locator('[data-action=search]').first.click()
            page.locator('#rewriteQuery').fill('Formatted');page.locator('#rewriteReplacement').fill('Changed')
            page.locator('[data-action=rewrite-preview]').click();assert '서식 보호 1회' in page.locator('#rewriteSummary').inner_text()
            page.locator('#rewriteFormatted').check();page.locator('[data-action=rewrite-preview]').click()
            assert '부분 글자 서식' in page.locator('#rewriteResults').inner_text()
            page.locator('#rewriteResults [data-rewrite-id]').check()
            with page.expect_download() as backup:
                page.locator('#searchDialog [data-action="export-working-copy"]').click()
            assert backup.value.suggested_filename.endswith('_UNSAVED.docut.json')
            page.locator('#rewriteApply').click()
            after=page.evaluate('DocutApp.getProject().pages[0].elements[0]')
            assert after['text']=='Changed' and not after['richText']
        check('formatted text requires opt-in and explains formatting reset',format_guard)

        def stale_rewrite(page):
            p=page.evaluate('DocutApp.getProject()');p['pages'][0]['elements'][0]['text']='Old';page.evaluate('DocutApp.loadProject',p)
            page.locator('[data-action=search]').first.click()
            page.locator('#rewriteQuery').fill('Old');page.locator('#rewriteReplacement').fill('New')
            page.locator('[data-action=rewrite-preview]').click();page.locator('#rewriteResults [data-rewrite-id]').check()
            page.evaluate('DocutApp.addElement("text")')
            page.locator('#rewriteApply').click()
            assert page.evaluate('DocutApp.getProject().pages[0].elements[0].text')=='Old'
        check('stale rewrite proposal cannot overwrite newer edit',stale_rewrite)

        def notouch_stat(page):
            p=page.evaluate('DocutApp.getProject()');e=p['pages'][0]['elements'][0];e['text']='Revenue';e['source']='Revenue dataset';page.evaluate('DocutApp.loadProject',p)
            page.locator('[data-action=search]').first.click();page.locator('#rewriteQuery').fill('Revenue dataset');page.locator('#rewriteReplacement').fill('Wrong source')
            page.locator('[data-action=rewrite-preview]').click();assert page.locator('#rewriteResults [data-rewrite-id]').count()==0
        check('replace never searches or changes evidence source',notouch_stat)

        def parser_hidden(page):
            html='''<html><head><style>.hidden { display:none }</style></head><body><section class="page"><h1>Visible summary</h1><div class="hidden"><p>Secret hidden content</p></div><p>Public explanation</p><p style="visibility:hidden">Hidden by style</p><table><tr><td rowspan="2">A</td><td>B</td></tr><tr><td>C</td></tr></table><script>window.__testDanger=123</script></section></body></html>'''
            import_file(page,'hidden.html',html)
            warnings=page.locator('#importModeWarnings').inner_text()
            assert 'hidden/aria-hidden' in warnings
            assert 'rowspan/colspan' in warnings
            canvas=page.locator('#importPreviewCanvas').inner_text()
            assert 'Visible summary' in canvas and 'Secret hidden content' not in canvas
            assert page.evaluate('window.__testDanger') is None
        check('hidden ancestors, table merged-cell loss, and script text are excluded',parser_hidden)

        def plain_text_excludes_scripts(page):
            text='''<html><body><section class="page"><p>Confirmed information<script>document.body.textContent='ATTACK'</script> remains text</p></section></body></html>'''
            loaded=page.evaluate('(html)=>DocutExporter.decodeHTML(html)',text)
            combined=' '.join(x['text'] for x in loaded['project']['pages'][0]['elements'])
            assert 'ATTACK' not in combined
            assert 'Confirmed information' in combined
            assert page.evaluate('document.body.textContent.includes("ATTACK")') is False
        check('external script source cannot leak into imported editable text',plain_text_excludes_scripts)

        def select_all(page):
            p=page.evaluate('DocutApp.getProject()');p['pages'][0]['elements'][0]['text']='A';p['pages'][0]['elements'][1]['text']='A';page.evaluate('DocutApp.loadProject',p)
            page.locator('[data-action=search]').first.click();page.locator('#rewriteQuery').fill('A');page.locator('#rewriteReplacement').fill('B')
            page.locator('[data-action=rewrite-preview]').click();assert page.locator('#rewriteResults [data-rewrite-id]').count()>=2
            page.locator('[data-action=rewrite-select-all]').click();assert page.locator('#rewriteApply').is_enabled()
            page.locator('[data-action=rewrite-select-none]').click();assert page.locator('#rewriteApply').is_disabled()
        check('select-all and deselect controls do not auto-apply',select_all)

        def mobile(page):
            load_with_risk(page)
            assert page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth+2')
            assert page.locator('#importPreviewCanvas .import-map').count()==1
        check('390px mobile import report dialog has no viewport overflow',mobile,mobile=True)

        browser.close()
    print('V0.20:',sum(x[1] for x in results),'/',len(results),flush=True)
    if not all(x[1] for x in results):raise SystemExit(1)

if __name__=='__main__':run()
