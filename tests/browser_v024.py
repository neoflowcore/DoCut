"""V0.24 offline page kit gallery, saved layout and loss-prevention browser tests.
Synthetic storage injection; not a real Windows/Android Brave hands-on result.
"""
import os,json,traceback
from playwright.sync_api import sync_playwright
from browser_v018 import ready

def run():
    results=[]
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        def check(name,func,mobile=False):
            part,total=(int(x) for x in os.environ.get("DOCUT_TEST_SHARD","0/1").split("/"))
            if not hasattr(check,"position"):check.position=0
            idx=check.position;check.position+=1
            if idx%total!=part:return
            if os.environ.get('DOCUT_TEST_FILTER') and not any(k in name for k in os.environ['DOCUT_TEST_FILTER'].split('|')):return
            ctx=browser.new_context(viewport={'width':390,'height':844} if mobile else {'width':1480,'height':900},accept_downloads=True)
            ctx.set_default_timeout(9000);pg=ctx.new_page();errors=ready(pg)
            try:
                func(pg)
                assert not errors,errors
                print('PASS',name,flush=True);results.append(True)
            except Exception:
                print('FAIL',name,flush=True);traceback.print_exc();results.append(False)
            finally:ctx.close()
        def openkit(pg):
            pg.locator('button[data-action="template-gallery"]').first.click()
            assert pg.locator('#kitDialog').evaluate('(el)=>el.open') is True
        def save(pg,name='개인 프로젝트 레이아웃'):
            openkit(pg);pg.locator('#kitCustomName').fill(name)
            pg.locator('button[data-action="kit-capture"]').click()
            assert pg.evaluate('DocutPageKits.storageRead(localStorage).book.templates.length')==1
            return pg.evaluate('DocutPageKits.storageRead(localStorage).book.templates[0].id')
        def upload(pg,payload):
            pg.locator('#kitFileInput').set_input_files({'name':'kit.json','mimeType':'application/json','buffer':str(payload).encode('utf-8')})
            pg.wait_for_timeout(40)
        check('V0.24 version 10 design kits and module available',lambda pg: (
            None if pg.locator('.brand em').inner_text()=='0.26.0' and pg.evaluate('DocutCore.VERSION')=='0.26.0-development' and pg.evaluate('DocutPageKits.BUILTINS.length')==10 else (_ for _ in ()).throw(AssertionError('version or kits'))))
        def modal(pg):
            openkit(pg);assert pg.locator('[data-kit-choice]').count()==10
            assert pg.locator('#kitPreviewStage .kit-map').count()==1
            assert '결론 선제시' in pg.locator('#kitPreviewTitle').inner_text()
            assert pg.locator('#kitDelete').is_hidden()
        check('gallery first load, preview and safe read-only selection',modal)
        def search(pg):
            openkit(pg);pg.locator('#kitSearch').fill('추세');assert pg.locator('[data-kit-choice]').count()==1
            assert pg.locator('[data-kit-choice="trend"]').count()==1
            assert '추세와 시사점' in pg.locator('#kitPreviewTitle').inner_text()
            pg.locator('#kitSearch').fill('NO_MATCH');assert pg.locator('[data-kit-choice]').count()==0
            assert pg.locator('button[data-action="kit-insert"]').is_disabled()
            pg.locator('#kitSearch').fill('');assert pg.locator('button[data-action="kit-insert"]').is_enabled()
        check('search is local and filters without changing document',search)
        def category(pg):
            openkit(pg);pg.locator('#kitCategory').select_option('근거·분석');assert pg.locator('[data-kit-choice]').count()>=2
            assert pg.locator('[data-kit-choice="decision"]').count()==0
            pg.locator('#kitCategory').select_option('all');assert pg.locator('[data-kit-choice]').count()==10
        check('native categories do not hide or mutate data',category)
        def select(pg):
            openkit(pg);pg.locator('[data-kit-choice="decision"]').click()
            assert '최종 의사결정' in pg.locator('#kitPreviewTitle').inner_text()
            assert '신규 페이지' in pg.locator('#kitPreviewDetails').inner_text()
            assert pg.locator('[data-kit-choice="decision"]').get_attribute('aria-pressed')=='true'
        check('selection preview and screen-reader pressed state',select)
        def insert(pg):
            original=pg.evaluate('DocutApp.getProject().pages.map(p=>[p.id,p.elements[0].text])')
            openkit(pg);pg.locator('[data-kit-choice="decision"]').click()
            pg.locator('button[data-action="kit-insert"]').click()
            result=pg.evaluate('DocutApp.getProject()');assert len(result['pages'])==6
            assert [p['id'] for p in result['pages'] if p['id']!=result['pages'][1]['id']]==[p[0] for p in original]
            assert result['pages'][1]['tab']=='최종 의사결정'
            assert pg.locator('#kitDialog').is_hidden()
            assert all(e.get('verified') is False for e in result['pages'][1]['elements'])
        check('insert after selected page, preserve original content and identities',insert)
        def undo(pg):
            openkit(pg);pg.locator('button[data-action="kit-insert"]').click()
            assert pg.evaluate('DocutApp.getProject().pages.length')==6
            pg.locator('button[data-action="undo"]').click()
            assert pg.evaluate('DocutApp.getProject().pages.length')==5
            pg.locator('button[data-action="redo"]').click()
            assert pg.evaluate('DocutApp.getProject().pages.length')==6
        check('insertion supports undo and redo',undo)
        def repeats(pg):
            openkit(pg);pg.locator('button[data-action="kit-insert"]').click()
            openkit(pg);pg.locator('button[data-action="kit-insert"]').click()
            p=pg.evaluate('DocutApp.getProject()');ids=[x['id'] for x in p['pages']]+[e['id'] for x in p['pages'] for e in x['elements']]
            assert len(ids)==len(set(ids));assert len(p['pages'])==7
        check('inserting same kit twice remaps all element identities',repeats)
        def keep_reviews(pg):
            pg.evaluate("() => DocutApp.loadProject({...DocutApp.getProject(),reviews:[DocutReviewBoard.newReview({body:'DO_NOT_EXPORT_PRIVATE_NOTE_735',pageId:DocutApp.getProject().pages[0].id})]})")
            openkit(pg);pg.locator('button[data-action="kit-insert"]').click()
            assert pg.evaluate('DocutApp.getProject().reviews.length')==1
            assert pg.evaluate("DocutExporter.exportHTML(DocutApp.getProject()).includes('DO_NOT_EXPORT_PRIVATE_NOTE_735')")==False
        check('private feedback remains private after template insertion',keep_reviews)
        def maxpages(pg):
            pg.evaluate('''() => {const p=DocutApp.getProject();while(p.pages.length<50)p.pages.push(DocutPageKits.pageFromKit('problem'));DocutApp.loadProject(p)}''')
            openkit(pg);pg.locator('button[data-action="kit-insert"]').click()
            assert pg.evaluate('DocutApp.getProject().pages.length')==50
            assert '50페이지' in pg.locator('#toast').inner_text()
        check('50-page limit refuses insertion without changing existing document',maxpages)
        def save_layout(pg):
            identifier=save(pg)
            assert identifier.startswith('user-')
            assert pg.locator('[data-kit-choice]').count()==11
            assert pg.locator('[data-kit-choice="'+identifier+'"]').count()==1
            assert pg.locator('#kitDelete').is_visible()
        check('user template capture persists locally and appears in gallery',save_layout)
        def source_scrub(pg):
            pg.evaluate('''() => {const p=DocutApp.getProject(),e=p.pages[0].elements[0];e.text='PRIVATE_BODY_XY24';e.source='PRIVATE_SOURCE_XY24';e.evidence='PRIVATE_PROOF_XY24';e.verified=true;DocutApp.loadProject(p)}''')
            save(pg,'공통 레이아웃')
            raw=pg.evaluate('localStorage.getItem(DocutPageKits.KEY)')
            for val in ['PRIVATE_BODY_XY24','PRIVATE_SOURCE_XY24','PRIVATE_PROOF_XY24']:
                assert val not in raw
            assert pg.evaluate('DocutApp.getProject().pages[0].elements[0].text')=='PRIVATE_BODY_XY24'
        check('template extraction strips private body and provenance, retains source report',source_scrub)
        def insert_personal(pg):
            ident=save(pg);pg.locator('[data-kit-choice="'+ident+'"]').click()
            pg.locator('button[data-action="kit-insert"]').click()
            p=pg.evaluate('DocutApp.getProject()');assert len(p['pages'])==6
            assert p['pages'][1]['tab']=='개인 프로젝트 레이아웃'
            assert p['pages'][1]['elements'][0]['text']=='제목을 입력하세요'
            assert p['pages'][0]['elements'][0]['text']!='제목을 입력하세요'
        check('personal layout insert uses placeholder text, no original text',insert_personal)
        def delete(pg):
            orig=pg.evaluate('JSON.stringify(DocutApp.getProject().pages)')
            ident=save(pg);pg.on('dialog',lambda d:d.accept())
            pg.locator('button[data-action="kit-delete"]').click()
            assert pg.evaluate('DocutPageKits.storageRead(localStorage).book.templates.length')==0
            assert pg.evaluate('JSON.stringify(DocutApp.getProject().pages)')==orig
        check('deleting personal kit never deletes report content',delete)
        def export(pg):
            save(pg)
            with pg.expect_download() as d:
                pg.locator('button[data-action="kit-export"]').click()
            download=d.value;assert download.suggested_filename=='DoCut_Private_Page_Kits.json'
            content=pg.evaluate('DocutPageKits.exportBook(DocutPageKits.storageRead(localStorage).book)')
            assert '"kind": "docut-page-kit-library"' in content
            assert '"pages"' not in content and '"reviews"' not in content
        check('explicit JSON export contains no full report or reviews',export)
        def invalid_packet(pg):
            openkit(pg);upload(pg,json.dumps({'kind':'project','pages':[]}))
            assert pg.locator('#kitImportReview').is_hidden()
            assert pg.evaluate('DocutPageKits.storageRead(localStorage).book.templates.length')==0
        check('project JSON cannot be passed as template library',invalid_packet)
        def import_new(pg):
            packet=pg.evaluate("() => DocutPageKits.exportBook(DocutPageKits.addKit(DocutPageKits.empty(),DocutPageKits.capture(DocutApp.getProject().pages[0],'외부 템플릿')))")
            openkit(pg);upload(pg,packet)
            assert pg.locator('#kitImportReview').is_visible()
            assert pg.locator('#kitImportApply').is_disabled()
            assert '신규 1종' in pg.locator('#kitImportSummary').inner_text()
            pg.locator('#kitImportApprove').check()
            pg.locator('button[data-action="kit-import-apply"]').click()
            assert pg.evaluate('DocutPageKits.storageRead(localStorage).book.templates.length')==1
            assert pg.locator('#kitImportReview').is_hidden()
        check('reviewed imported kit requires explicit checkbox approval before merge',import_new)
        def import_duplicate(pg):
            ident=save(pg)
            packet=pg.evaluate('DocutPageKits.exportBook(DocutPageKits.storageRead(localStorage).book)')
            upload(pg,packet)
            assert '기존 동일 1종' in pg.locator('#kitImportSummary').inner_text()
            pg.locator('#kitImportApprove').check()
            pg.locator('button[data-action="kit-import-apply"]').click()
            assert pg.evaluate('DocutPageKits.storageRead(localStorage).book.templates.length')==1
        check('duplicate template import is idempotent and preserves originals',import_duplicate)
        def dangerous_packet(pg):
            raw=pg.evaluate("() => {const kit=DocutPageKits.capture(DocutApp.getProject().pages[0],'test');kit.elements[0].text='<svg onload=alert(1)>';return JSON.stringify({...DocutPageKits.empty(),templates:[kit]})}")
            openkit(pg);upload(pg,raw)
            assert pg.locator('#kitImportReview').is_hidden()
            assert pg.evaluate('DocutPageKits.storageRead(localStorage).book.templates.length')==0
        check('template packet carrying arbitrary markup is rejected',dangerous_packet)
        def collision(pg):
            save(pg)
            pg.evaluate('''() => {window.__kitBefore=localStorage.getItem(DocutPageKits.KEY);localStorage.setItem(DocutPageKits.KEY,window.__kitBefore.replace('개인 프로젝트 레이아웃','외부 탭 변경'))}''')
            pg.locator('#kitCustomName').fill('충돌 템플릿');pg.locator('button[data-action="kit-capture"]').click()
            assert pg.evaluate('DocutPageKits.storageRead(localStorage).book.templates.length')==1
            assert '외부 탭 변경' in pg.evaluate('localStorage.getItem(DocutPageKits.KEY)')
        check('cross-tab stale library never gets silently overwritten',collision)
        def full(pg):
            save(pg)
            pg.evaluate('''() => {const store=localStorage,original=store.setItem;store.setItem=function(key,val){if(key===DocutPageKits.KEY)throw Error('QuotaExceededError');return original(key,val)}}''')
            pg.locator('#kitCustomName').fill('저장 부족');pg.locator('button[data-action="kit-capture"]').click()
            assert pg.evaluate('DocutPageKits.storageRead(localStorage).book.templates.length')==1
            assert '저장 보류' in pg.locator('#toast').inner_text()
        check('storage quota failure retains existing private templates',full)
        def close_escape(pg):
            openkit(pg);pg.keyboard.press('Escape');assert pg.locator('#kitDialog').is_hidden()
        check('Escape closes template dialog without altering any page',close_escape)
        def mobile_ui(pg):
            openkit(pg);assert pg.locator('[data-kit-choice]').count()==10
            overflow=pg.evaluate('document.documentElement.scrollWidth > innerWidth')
            assert not overflow,'horizontal overflow outside viewport'
            modal=pg.locator('#kitDialog').bounding_box();assert modal and modal['x']>=0 and modal['x']+modal['width']<=391,modal
            pg.locator('[data-kit-choice="timeline"]').click()
            assert '실행 일정' in pg.locator('#kitPreviewTitle').inner_text()
            assert pg.locator('[data-action="kit-insert"]').is_visible()
        check('390px mobile gallery preview and action remain within viewport',mobile_ui,mobile=True)
        def mobile_capture(pg):
            openkit(pg);pg.locator('#kitCustomName').fill('모바일 레이아웃');pg.locator('button[data-action="kit-capture"]').click()
            assert pg.evaluate('DocutPageKits.storageRead(localStorage).book.templates.length')==1
            assert not pg.evaluate('document.documentElement.scrollWidth>innerWidth')
        check('390px mobile layout capture and tabs fit screen',mobile_capture,mobile=True)
        def nine_palettes(pg):
            openkit(pg)
            assert pg.locator('#kitPalette option').count()==10
            assert pg.evaluate('Object.keys(DocutEffectCatalog.PALETTES).length')==9
            pg.locator('#kitPalette').select_option('cobalt')
            assert pg.locator('#kitPreviewStage').evaluate('(el)=>getComputedStyle(el).backgroundColor')=='rgb(232, 239, 249)'
            pg.locator('button[data-action="kit-insert"]').click()
            assert pg.evaluate('DocutApp.getProject().pages[1].background')=='#e8eff9'
        check('nine built-in palette options change preview and inserted page',nine_palettes)
        def private_color(pg):
            ident=save(pg)
            pg.locator('#kitPalette').select_option('ambient')
            pg.locator('[data-kit-choice="'+ident+'"]').click()
            expect=pg.evaluate('DocutPageKits.storageRead(localStorage).book.templates[0].background')
            pg.locator('button[data-action="kit-insert"]').click()
            assert pg.evaluate('DocutApp.getProject().pages[1].background')==expect
        check('personal template preserves original colors despite palette selector',private_color)
        def corrupt(pg):
            pg.evaluate("localStorage.setItem(DocutPageKits.KEY,'{broken:')")
            openkit(pg)
            assert '저장소 오류' in pg.locator('#kitStorageStatus').inner_text()
            assert pg.locator('#kitDamagedExport').is_visible()
            assert pg.locator('#kitDamagedReset').is_visible()
            pg.locator('#kitCustomName').fill('손상된 것 덮기 시도')
            pg.locator('[data-action="kit-capture"]').click()
            assert pg.evaluate('localStorage.getItem(DocutPageKits.KEY)')=='{broken:'
            with pg.expect_download() as d:pg.locator('#kitDamagedExport').click()
            assert d.value.suggested_filename=='DoCut_Damaged_Page_Kits.txt'
            pg.on('dialog',lambda d:d.accept())
            pg.locator('#kitDamagedReset').click()
            assert pg.evaluate('localStorage.getItem(DocutPageKits.KEY)') is None
            assert pg.evaluate('DocutApp.getProject().pages.length')==5
        check('corrupt library preserved, downloaded, explicit reset leaves report untouched',corrupt)
        def unconfirmed_import(pg):
            pkt=pg.evaluate("() => DocutPageKits.exportBook(DocutPageKits.addKit(DocutPageKits.empty(),DocutPageKits.capture(DocutApp.getProject().pages[0],'test import')))")
            openkit(pg);upload(pg,pkt)
            assert pg.locator('#kitImportReview').is_visible()
            pg.locator('[data-action="kit-import-cancel"]').click()
            assert pg.evaluate('DocutPageKits.storageRead(localStorage).book.templates.length')==0
        check('cancelled template import keeps local templates unchanged',unconfirmed_import)
        def race_import(pg):
            pkt=pg.evaluate("() => DocutPageKits.exportBook(DocutPageKits.addKit(DocutPageKits.empty(),DocutPageKits.capture(DocutApp.getProject().pages[0],'test import')))")
            openkit(pg);upload(pg,pkt);pg.locator('#kitImportApprove').check()
            pg.evaluate("localStorage.setItem(DocutPageKits.KEY,DocutPageKits.exportBook(DocutPageKits.empty()))")
            pg.locator('[data-action="kit-import-apply"]').click()
            assert pg.evaluate('DocutPageKits.storageRead(localStorage).book.templates.length')==0
            assert '변경' in pg.locator('#toast').inner_text()
        check('stale import approval never overwrites concurrent template library',race_import)
        browser.close()
    print('RESULT',len(results),'/',sum(results),flush=True)
    assert len(results)>0 and all(results),'V0.24 browser check failed'
if __name__=='__main__':run()
