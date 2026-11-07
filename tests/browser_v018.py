"""Manual-only V0.18 local checkpoint and guarded-import regression.
The browser sandbox blocks navigation. LocalStorage and cross-tab storage events
are emulated synchronously; native multi-tab Brave behavior remains unverified.
No build, installers, artifacts or GitHub Actions.
"""
import os, re, sys, traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_recovery import ROOT, JS

MEMORY_STORAGE = r'''(entries) => {
  window.__docutTestStore = new Map(entries || []);
  window.__docutTestQuota = false;
  window.__docutTestBackupQuota = false;
  Object.defineProperty(window, 'localStorage', {configurable:true, value: {
    getItem(key) {return window.__docutTestStore.has(key)?window.__docutTestStore.get(key):null;},
    setItem(key,value) {if(window.__docutTestBackupQuota && key==='docut-studio-backups')throw new DOMException('Backup full','QuotaExceededError');if(window.__docutTestQuota && key==='docut-studio-v18-checkpoint')throw new DOMException('Storage full','QuotaExceededError');window.__docutTestStore.set(key,String(value));},
    removeItem(key) {window.__docutTestStore.delete(key);},
    clear() {window.__docutTestStore.clear();}
  }});
}'''

def ready(page,records=None):
    failures=[]
    page.on('pageerror',lambda e:failures.append(str(e)))
    markup=(ROOT/'index.html').read_text(encoding='utf-8')
    markup=re.sub(r'<script src="[^"]+" defer></script>','',markup)
    markup=re.sub(r'<link[^>]+href="\./assets/styles.css"[^>]*>','',markup)
    page.set_content(markup,wait_until='domcontentloaded')
    page.evaluate(MEMORY_STORAGE,records or [])
    page.add_style_tag(content=(ROOT/'assets/styles.css').read_text(encoding='utf-8'))
    for name in JS:
        page.add_script_tag(content=(ROOT/'assets'/f'{name}.js').read_text(encoding='utf-8'))
    assert page.evaluate('Boolean(window.DocutApp && window.DocutPersistence)'),failures
    assert not failures,failures
    return failures

def contents(page):
    return page.evaluate('Array.from(window.__docutTestStore.entries())')

def sync(source,target):
    snapshot=contents(source)
    target.evaluate('''(pairs) => {
       const previous=localStorage.getItem(DocutPersistence.KEY);
       window.__docutTestStore=new Map(pairs);
       const changed=localStorage.getItem(DocutPersistence.KEY);
       if(previous!==changed)dispatchEvent(new StorageEvent('storage',{key:DocutPersistence.KEY,oldValue:previous,newValue:changed}));
    }''',snapshot)

def run():
    results=[]
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        def check(label,fn,mobile=False):
            part,total=(int(x) for x in os.environ.get("DOCUT_TEST_SHARD","0/1").split("/"))
            if not hasattr(check,"position"):check.position=0
            idx=check.position;check.position+=1
            if idx%total!=part:return
            if os.environ.get('DOCUT_TEST_FILTER') and not any(part in label for part in os.environ['DOCUT_TEST_FILTER'].split('|')):return
            print('TEST',label,flush=True)
            ctx=browser.new_context(viewport={'width':390,'height':844} if mobile else {'width':1450,'height':850},accept_downloads=True)
            ctx.set_default_timeout(8000)
            try:
                fn(ctx)
                results.append((label,'PASS'))
                print('DONE',label,'PASS',flush=True)
            except Exception as e:
                traceback.print_exc()
                results.append((label,'FAIL '+str(e)))
            finally:ctx.close()

        def startup(ctx):
            pg=ctx.new_page();ready(pg)
            assert pg.locator('.brand em').inner_text()=='0.26.0'
            obj=pg.evaluate('DocutPersistence.inspect(localStorage,DocutCore.normalizeProject)')
            assert obj['status']=='current',obj
            assert pg.locator('#saveRiskBanner').is_hidden()
            fresh=ctx.new_page();ready(fresh,contents(pg))
            after=fresh.evaluate('DocutPersistence.inspect(localStorage,DocutCore.normalizeProject).token.sequence')
            assert obj['token']['sequence']==after,(obj,after)
        check('first checkpoint and reopening unchanged revision',startup)

        def concurrent(ctx):
            one=ctx.new_page();ready(one)
            two=ctx.new_page();ready(two,contents(one))
            initial=two.evaluate('DocutApp.getProject().pages[0].elements.length')
            one.evaluate('DocutApp.addElement("text")')
            sync(one,two)
            assert two.locator('#saveRiskBanner').is_visible()
            assert two.evaluate('DocutApp.getState().saveProblem.type')=='conflict'
            two.evaluate('DocutApp.addElement("bar")')
            assert two.evaluate('DocutApp.getProject().pages[0].elements.length')==initial+1
            assert not any(x['type']=='bar' for x in two.evaluate('DocutPersistence.inspect(localStorage,DocutCore.normalizeProject).project.pages[0].elements'))
            two.locator('[data-action="open-storage-issue"]').click()
            with two.expect_download() as download:
                two.locator('#storageIssueDialog [data-action="export-working-copy"]').click()
            assert download.value.suggested_filename.endswith('_UNSAVED.docut.json')
            two.locator('[data-action="load-external-saved"]').click()
            assert two.evaluate('DocutApp.getState().saveProblem') is None
            assert not two.locator('#storageIssueDialog').evaluate('(e)=>e.open')
            assert two.evaluate('DocutApp.getProject().pages[0].elements.length')==initial+1
            assert two.evaluate('DocutPersistence.readBackups(localStorage).length')>=1
        check('stale tab blocked, local copy exported and external restored',concurrent)

        def explicit_override(ctx):
            one=ctx.new_page();ready(one)
            two=ctx.new_page();ready(two,contents(one))
            one.evaluate('DocutApp.addElement("note")')
            sync(one,two)
            two.evaluate('DocutApp.addElement("image")')
            two.on('dialog',lambda d:d.accept())
            two.locator('[data-action="open-storage-issue"]').click()
            two.locator('[data-action="overwrite-external-saved"]').click()
            latest=two.evaluate('DocutPersistence.inspect(localStorage,DocutCore.normalizeProject).project.pages[0].elements')
            assert any(x['type']=='image' for x in latest)
            assert not any(x['type']=='note' for x in latest)
            old=two.evaluate('DocutPersistence.readBackups(localStorage)')
            assert any(any(x['type']=='note' for x in b['project']['pages'][0]['elements']) for b in old)
        check('explicit overwrite preserves previous tab project in recovery list',explicit_override)

        def corrupt(ctx):
            first=ctx.new_page();ready(first)
            data=dict(contents(first));data['docut-studio-v18-checkpoint']='{corrupt-test'
            pg=ctx.new_page();ready(pg,list(data.items()))
            assert pg.locator('#saveRiskBanner').is_visible()
            assert pg.evaluate('DocutApp.getState().saveProblem.type')=='corrupt'
            assert pg.evaluate('localStorage.getItem(DocutPersistence.KEY)')=='{corrupt-test'
            pg.evaluate('DocutApp.addElement("quote")')
            assert pg.evaluate('localStorage.getItem(DocutPersistence.KEY)')=='{corrupt-test'
            pg.locator('[data-action="open-storage-issue"]').click()
            with pg.expect_download() as download:
                pg.locator('[data-action="download-damaged"]').click()
            assert download.value.suggested_filename=='DoCut_Damaged_Local_Checkpoint.txt'
            pg.on('dialog',lambda d:d.accept())
            pg.locator('[data-action="reset-damaged"]').click()
            assert pg.evaluate('DocutPersistence.inspect(localStorage,DocutCore.normalizeProject).status')=='current'
            assert pg.locator('#saveRiskBanner').is_hidden()
        check('damaged checkpoint preserved until user downloads it',corrupt)

        def legacy(ctx):
            start=ctx.new_page();ready(start)
            old=start.evaluate('''() => {const p=DocutCore.createProject(2);p.title='Legacy document';return JSON.stringify(p)}''')
            pg=ctx.new_page();ready(pg,[['docut-studio-v13',old]])
            assert pg.evaluate('DocutApp.getProject().title')=='Legacy document'
            assert pg.evaluate('localStorage.getItem(DocutPersistence.LEGACY)')==old
            assert pg.evaluate('DocutPersistence.inspect(localStorage,DocutCore.normalizeProject).status')=='current'
        check('legacy storage upgraded without deleting source checkpoint',legacy)

        def quota(ctx):
            pg=ctx.new_page();ready(pg)
            previous=pg.evaluate('localStorage.getItem(DocutPersistence.KEY)')
            pg.evaluate('window.__docutTestQuota=true')
            pg.evaluate('DocutApp.addElement("card")')
            assert pg.evaluate('DocutApp.getState().saveProblem.type')=='failed'
            assert pg.locator('#saveRiskBanner').is_visible()
            assert pg.evaluate('localStorage.getItem(DocutPersistence.KEY)')==previous
            with pg.expect_download() as download:
                pg.locator('#saveRiskBanner [data-action="export-working-copy"]').click()
            assert download.value.suggested_filename.endswith('_UNSAVED.docut.json')
        check('quota failure leaves old saved checkpoint intact',quota)

        def import_guard(ctx):
            pg=ctx.new_page();ready(pg)
            candidate=pg.evaluate('JSON.stringify(DocutCore.createProject(2))')
            with pg.expect_file_chooser() as chooser:
                pg.locator('[data-action="import"]').first.click()
            chooser.value.set_files({'name':'replacement.json','mimeType':'application/json','buffer':candidate.encode()})
            pg.locator('#importModeDialog').wait_for(state='visible')
            before=pg.evaluate('DocutApp.getProject().pages[0].elements.length')
            pg.evaluate('DocutApp.addElement("text")')
            pg.locator('#importModeDialog [data-action="import-replace"]').click()
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.length')==before+1
            assert pg.evaluate('DocutApp.getProject().pages.length')==5
            assert pg.locator('#importModeDialog').is_hidden()
        check('stale file review cannot replace newer edit',import_guard)

        def mobile(ctx):
            first=ctx.new_page();ready(first)
            data=dict(contents(first));data['docut-studio-v18-checkpoint']='invalid-data'
            pg=ctx.new_page();ready(pg,list(data.items()))
            assert pg.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth+2')
            assert pg.locator('#saveRiskBanner [data-action="export-working-copy"]').is_visible()
            assert pg.locator('#saveRiskBanner [data-action="open-storage-issue"]').is_visible()
        check('narrow viewport can still reach recovery controls',mobile,mobile=True)
        def backups(ctx):
            pg=ctx.new_page();ready(pg)
            pg.evaluate('DocutApp.addElement("text")')
            pg.evaluate('DocutApp.addElement("bar")')
            original=pg.evaluate('DocutApp.getProject().pages[0].elements.length')
            pg.locator('[data-action="recovery"]').click()
            assert pg.locator('[data-restore-index]').count()>=1
            pg.locator('[data-restore-index="0"]').click()
            assert pg.locator('#backupCompareDialog').evaluate('(e)=>e.open')
            assert '2' in pg.locator('#backupCompareSummary').inner_text()
            pg.locator('[data-action="close-backup-compare"]').first.click()
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.length')==original
            pg.locator('[data-restore-index="0"]').click()
            pg.evaluate('DocutApp.addElement("note")')
            pg.locator('[data-action="apply-backup"]').click()
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.length')==original+1
            pg.locator('[data-action="close-backup-compare"]').first.click()
            pg.locator('[data-restore-index="0"]').click()
            with pg.expect_download() as download:
                pg.locator('[data-action="download-backup"]').click()
            assert download.value.suggested_filename.endswith('_RECOVERY.docut.json')
            pg.locator('[data-action="apply-backup"]').click()
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.length')<original
            assert pg.locator('#backupCompareDialog').is_hidden()
        check('backup restore requires preview, protects edits and exports JSON',backups)

        def live_text(ctx):
            pg=ctx.new_page();ready(pg)
            pg.locator('#slide .element[data-type="title"]').first.dblclick()
            field=pg.locator('#slide [contenteditable="true"]').first
            ident=pg.evaluate('DocutApp.getState().editingId')
            original=pg.evaluate('''id=>DocutApp.getProject().pages[0].elements.find(e=>e.id===id).text''',ident)
            field.fill('Crash-safe typing')
            assert pg.evaluate('''id=>DocutApp.getProject().pages[0].elements.find(e=>e.id===id).text''',ident)=='Crash-safe typing'
            assert pg.evaluate('''id=>DocutPersistence.inspect(localStorage,DocutCore.normalizeProject).project.pages[0].elements.find(e=>e.id===id).text''',ident)=='Crash-safe typing'
            fresh=ctx.new_page();ready(fresh,contents(pg))
            assert fresh.evaluate('''id=>DocutApp.getProject().pages[0].elements.find(e=>e.id===id).text''',ident)=='Crash-safe typing'
            assert pg.evaluate('DocutApp.getState().history')==1
            field.fill('Another phrase')
            assert pg.evaluate('DocutApp.getState().history')==1
            field.press('Escape')
            assert pg.evaluate('''id=>DocutApp.getProject().pages[0].elements.find(e=>e.id===id).text''',ident)==original
            assert pg.evaluate('DocutApp.getState().history')==0
        check('live rich-text draft persists before blur with one undo boundary',live_text)

        def text_limits(ctx):
            pg=ctx.new_page();ready(pg)
            pg.locator('#slide .element[data-type="title"]').first.dblclick()
            field=pg.locator('#slide [contenteditable="true"]').first
            previous=pg.evaluate('''() => DocutApp.getProject().pages[0].elements.find(e=>e.id===DocutApp.getState().editingId).text''')
            field.fill('A'*12001)
            assert pg.evaluate('''() => DocutApp.getProject().pages[0].elements.find(e=>e.id===DocutApp.getState().editingId).text''')==previous
            field.fill('Valid text')
            assert pg.evaluate('''() => DocutApp.getProject().pages[0].elements.find(e=>e.id===DocutApp.getState().editingId).text''')=='Valid text'
            field.evaluate('''node=>{node.innerHTML='<strong>'+('z'.repeat(2500))+'</strong>';node.dispatchEvent(new Event('input',{bubbles:true}));}''')
            block=pg.evaluate('''() => DocutApp.getProject().pages[0].elements.find(e=>e.id===DocutApp.getState().editingId)''')
            assert block['text']=='z'*2500
            assert len(block['richText'])==3
            assert ''.join(run['text'] for run in block['richText'])==block['text']
        check('long text never truncates; long rich runs split losslessly',text_limits)

        def composition(ctx):
            pg=ctx.new_page();ready(pg)
            pg.locator('#slide .element[data-type="title"]').first.dblclick()
            field=pg.locator('#slide [contenteditable="true"]').first
            ident=pg.evaluate('DocutApp.getState().editingId')
            before=pg.evaluate('''id=>DocutApp.getProject().pages[0].elements.find(e=>e.id===id).text''',ident)
            field.evaluate('''node=>{node.textContent='composition-pending';node.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertCompositionText',data:'test',isComposing:true}));}''')
            assert pg.evaluate('''id=>DocutApp.getProject().pages[0].elements.find(e=>e.id===id).text''',ident)==before
            field.evaluate('''node=>node.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true,data:'complete'}))''')
            assert pg.evaluate('''id=>DocutApp.getProject().pages[0].elements.find(e=>e.id===id).text''',ident)=='composition-pending'
        check('composition is saved after commitment without changing active DOM',composition)

        def damaged_backup_index(ctx):
            pg=ctx.new_page();ready(pg)
            pg.evaluate("localStorage.setItem(DocutPersistence.BACKUPS, '{damaged-index-1')")
            pg.locator('[data-action="recovery"]').click()
            assert pg.locator('#backupIndexWarning').is_visible()
            pg.locator('[data-action="create-backup"]').click()
            assert pg.evaluate('localStorage.getItem(DocutPersistence.BACKUPS)')=='{damaged-index-1'
            with pg.expect_download() as first:
                pg.locator('[data-action="download-damaged-backups"]').click()
            assert first.value.suggested_filename=='DoCut_Damaged_Backup_Index.txt'
            pg.evaluate("localStorage.setItem(DocutPersistence.BACKUPS, '{damaged-index-2')")
            pg.on('dialog',lambda d:d.accept())
            pg.locator('[data-action="reset-damaged-backups"]').click()
            assert pg.evaluate('localStorage.getItem(DocutPersistence.BACKUPS)')=='{damaged-index-2'
            with pg.expect_download():pg.locator('[data-action="download-damaged-backups"]').click()
            pg.locator('[data-action="reset-damaged-backups"]').click()
            assert pg.evaluate('DocutPersistence.inspectBackups(localStorage).status')=='ok'
        check('damaged backup list survives until newest raw content is exported',damaged_backup_index)

        def damaged_checkpoint_replaced(ctx):
            start=ctx.new_page();ready(start)
            fixture=dict(contents(start));fixture['docut-studio-v18-checkpoint']='{bad-before-download'
            pg=ctx.new_page();ready(pg,list(fixture.items()))
            pg.locator('[data-action="open-storage-issue"]').click()
            with pg.expect_download():pg.locator('[data-action="download-damaged"]').click()
            pg.evaluate("localStorage.setItem(DocutPersistence.KEY,'{bad-after-download')")
            pg.on('dialog',lambda d:d.accept())
            pg.locator('[data-action="reset-damaged"]').click()
            assert pg.evaluate('localStorage.getItem(DocutPersistence.KEY)')=='{bad-after-download'
            with pg.expect_download():pg.locator('[data-action="download-damaged"]').click()
            pg.locator('[data-action="reset-damaged"]').click()
            assert pg.evaluate('DocutPersistence.inspect(localStorage,DocutCore.normalizeProject).status')=='current'
        check('replacement of damaged checkpoint after export cannot be discarded',damaged_checkpoint_replaced)

        def export_fingerprint(ctx):
            one=ctx.new_page();ready(one)
            two=ctx.new_page();ready(two,contents(one))
            one.evaluate('DocutApp.addElement("text")')
            sync(one,two)
            two.evaluate('window.__docutTestBackupQuota=true')
            two.evaluate('DocutApp.addElement("note")')
            two.locator('[data-action="open-storage-issue"]').click()
            with two.expect_download() as rescue:
                two.locator('#storageIssueDialog [data-action="export-working-copy"]').click()
            assert rescue.value.suggested_filename.endswith('_UNSAVED.docut.json')
            two.evaluate('DocutApp.addElement("quote")')
            count=two.evaluate('DocutApp.getProject().pages[0].elements.length')
            two.locator('[data-action="load-external-saved"]').click()
            assert two.evaluate('DocutApp.getProject().pages[0].elements.length')==count
            assert two.evaluate('DocutApp.getState().saveProblem.type')=='conflict'
            with two.expect_download():two.locator('#storageIssueDialog [data-action="export-working-copy"]').click()
            two.locator('[data-action="load-external-saved"]').click()
            assert two.evaluate('DocutApp.getState().saveProblem') is None
        check('older exported JSON cannot authorize loss of subsequent unsaved edits',export_fingerprint)

        def restore_storage_failure(ctx):
            pg=ctx.new_page();ready(pg)
            pg.evaluate('DocutApp.addElement("note")')
            before=pg.evaluate('JSON.stringify(DocutApp.getProject())')
            stored=pg.evaluate('localStorage.getItem(DocutPersistence.KEY)')
            pg.locator('[data-action="recovery"]').click()
            pg.locator('[data-restore-index="0"]').click()
            pg.evaluate('window.__docutTestQuota=true')
            pg.locator('[data-action="apply-backup"]').click()
            assert pg.evaluate('JSON.stringify(DocutApp.getProject())')==before
            assert pg.evaluate('localStorage.getItem(DocutPersistence.KEY)')==stored
            assert pg.evaluate('DocutApp.getState().saveProblem.type')=='failed'
            assert pg.locator('#backupCompareDialog').is_visible()
            pg.evaluate('window.__docutTestQuota=false')
            pg.locator('[data-action="apply-backup"]').click()
            assert pg.locator('#backupCompareDialog').is_hidden()
            assert pg.evaluate('DocutApp.getState().saveProblem') is None
        check('approved restore never claims success when storage write fails',restore_storage_failure)

        browser.close()
    for label,result in results:print(f'{label}: {result}')
    passed=sum(result=='PASS' for _,result in results)
    print('TOTAL',passed,'/',len(results))
    if passed<len(results):sys.exit(1)

if __name__=='__main__':run()
