"""V0.14 browser interaction tests; manually invoked only, no CI or install artifacts."""
from playwright.sync_api import sync_playwright
from browser_recovery import load
import os
import traceback


def run():
    tests=[]
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        def test(name,fn,viewport=None):
            if os.environ.get('DOCUT_TEST_FILTER') and os.environ['DOCUT_TEST_FILTER'] not in name:return
            print('TEST',name,flush=True)
            pg=browser.new_page(viewport=viewport or {'width':1600,'height':960},accept_downloads=True)
            pg.set_default_timeout(5000)
            try:
                errors=load(pg)
                fn(pg)
                assert not errors, errors
                tests.append((name,True,''))
            except Exception as exc:
                tests.append((name,False,str(exc)))
                traceback.print_exc()
            finally:
                pg.close()

        def custom_start(pg):
            pg.locator('#slide .element').first.click()
            pg.locator('[data-action="add-effect"]').click()
            details=pg.locator('details[data-pose-section="0:start"]')
            details.locator('summary').click()
            pg.locator('[data-pose-effect="0"][data-pose-side="start"][data-pose-key="x"]').fill('120')
            pg.locator('[data-pose-effect="0"][data-pose-side="start"][data-pose-key="x"]').press('Tab')
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.find(e=>e.id===DocutApp.getState().selectedId).effects[0].start.x')==120
            assert pg.locator('details[data-pose-section="0:start"]').get_attribute('open') is not None
            pg.locator('[data-pose-reset="0:start"]').click()
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.find(e=>e.id===DocutApp.getState().selectedId).effects[0].start') is None
        test('start pose and reset',custom_start)

        def custom_end(pg):
            pg.locator('#slide .element').first.click()
            pg.locator('[data-action="add-effect"]').click()
            pg.locator('details[data-pose-section="0:end"] summary').click()
            pg.locator('[data-pose-effect="0"][data-pose-side="end"][data-pose-key="scale"]').fill('1.75')
            pg.locator('[data-pose-effect="0"][data-pose-side="end"][data-pose-key="scale"]').press('Tab')
            end=pg.evaluate('DocutApp.getProject().pages[0].elements.find(e=>e.id===DocutApp.getState().selectedId).effects[0].end.scale')
            assert end==1.75,end
            pg.locator('[data-action="undo"]').first.click()
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.find(e=>e.id===DocutApp.getState().selectedId).effects[0].end') is None
        test('end pose and undo',custom_end)

        def mid_key(pg):
            pg.locator('#slide .element').first.click()
            pg.locator('[data-action="add-effect"]').click()
            pg.locator('[data-add-key="0"]').click()
            pg.locator('details[data-pose-section="0:key:0"] summary').click()
            input=pg.locator('[data-key-pose="0:0"][data-pose-key="rotate"]')
            input.fill('25');input.press('Tab')
            out=pg.evaluate('DocutApp.getProject().pages[0].elements.find(e=>e.id===DocutApp.getState().selectedId).effects[0].keyframes[0].rotate')
            assert out==25,out
            pg.locator('#timelineScrub').fill('350')
            assert pg.locator('#timelineTimeCurrent').inner_text()!='0.00s'
        test('mid keyframe pose and scrub',mid_key)

        def table_edit(pg):
            pg.locator('[data-left-tab="insert"]').click()
            pg.locator('[data-insert="table"]').click()
            assert pg.locator('[data-table-value]').count()>=2
            pg.locator('[data-table-op="add-row"]').click()
            before=pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).data.rows.length')
            target=pg.locator('[data-table-value="1:1"]')
            target.fill('123');target.press('Tab')
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).data.rows[1][1]')=='123'
            pg.locator('[data-table-select="1:1"]').click()
            pg.locator('[data-table-style="bold"]').check()
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).data.cells[1][1].bold') is True
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).data.verified') is None or pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).verified') is False
            assert before>=3
        test('table row cell value and styling',table_edit)

        def paste_cells(pg):
            pg.locator('[data-left-tab="insert"]').click();pg.locator('[data-insert="table"]').click()
            field=pg.locator('[data-table-value="0:0"]')
            field.focus()
            pg.evaluate('''() => {const node=document.querySelector('[data-table-value="0:0"]');const dt=new DataTransfer();dt.setData('text/plain','Header\\tValue\\nRisk\\t-20');node.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:dt}));}''')
            cells=pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).data.rows')
            assert cells[0][0]=='Header' and cells[1][1]=='-20',cells
        test('spreadsheet multi-cell paste',paste_cells)

        def imported_image_and_inline(pg):
            png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/6VwAAAAASUVORK5CYII='
            markup=f'''<html><body><section class="page"><h1>Title <strong style="color:red">Bold</strong></h1><img style="left:50px;top:120px;width:260px;height:160px" alt="Chart image" src="{png}"><img alt="remote" src="https://example.invalid/t.png"></section></body></html>'''
            result=pg.evaluate('(s)=>DocutCSSImport.importHTML(s)',markup)
            els=result['project']['pages'][0]['elements']
            assert any(e['type']=='image' and e.get('data',{}).get('src','').startswith('data:image') for e in els),els
            assert all(not e.get('data',{}).get('src','').startswith('https:') for e in els)
            assert any(e.get('richText') for e in els if e['type']=='title'),els
            assert result['stats']['embeddedImages']==1,result['stats']
            assert any('image omitted' in x for x in result['warnings'])
        test('static embedded and remote HTML images',imported_image_and_inline)

        def snap_group(pg):
            js='''() => {const p=DocutCore.createProject(1);p.pages[0].elements=[
              DocutCore.makeBlock('text',100,110,{w:100,h:75,groupId:'g1',text:'MOVE A',effects:[]}),
              DocutCore.makeBlock('text',230,110,{w:100,h:75,groupId:'g1',text:'MOVE B',effects:[]}),
              DocutCore.makeBlock('text',520,110,{w:140,h:80,text:'ANCHOR',effects:[]})];DocutApp.loadProject(p);
            }'''
            pg.evaluate(js)
            first=pg.locator('#slide .element').first
            box=first.bounding_box();assert box
            scale=pg.evaluate('DocutApp.getState().scale')
            x=box['x']+box['width']*.5;y=box['y']+box['height']*.5
            pg.mouse.move(x,y);pg.mouse.down()
            pg.mouse.move(x+290*scale,y,steps=6);pg.mouse.up()
            positions=pg.evaluate('DocutApp.getProject().pages[0].elements.map(e=>e.x)')
            assert positions[1]-positions[0]==130,positions
            assert positions[0]>100,positions
            pg.keyboard.press('Control+z')
            assert pg.evaluate('DocutApp.getProject().pages[0].elements[0].x')==100
        test('group drag and single undo',snap_group)

        def local_image(pg):
            from io import BytesIO
            from PIL import Image
            buf=BytesIO();Image.new('RGB',(42,24),(170,80,40)).save(buf,format='PNG')
            pg.locator('[data-left-tab="insert"]').click()
            pg.locator('[data-insert="image"]').click()
            pg.locator('#imageInput').set_input_files({'name':'sample.png','mimeType':'image/png','buffer':buf.getvalue()})
            pg.wait_for_function('DocutApp.getProject().pages[0].elements.at(-1).data.src.startsWith("data:image/png;base64,")')
            saved=pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1)')
            assert saved['data']['alt']=='sample.png'
            assert saved['source']=='sample.png'
            assert pg.locator('#slide .element').last.locator('img').count()==1
        test('local image file chooser',local_image)

        def copy_multiple(pg):
            items=pg.locator('#slide .element')
            items.nth(0).click();items.nth(1).click(modifiers=['Control'])
            assert len(pg.evaluate('DocutApp.getState().selectedIds'))==2
            pg.keyboard.press('Control+c');pg.keyboard.press('Control+v')
            p=pg.evaluate('DocutApp.getProject()')
            assert len(p['pages'][0]['elements'])==7,len(p['pages'][0]['elements'])
        test('multi-select copy paste',copy_multiple)

        def pointer_click_history(pg):
            pg.locator('#slide .element').first.click()
            before=pg.evaluate('DocutApp.getState().history')
            el=pg.locator('#slide .element').first
            el.click(force=True)
            after=pg.evaluate('DocutApp.getState().history')
            assert before==after,(before,after)
        test('click does not create undo checkpoint',pointer_click_history)

        def mobile(pg):
            pg.locator('[data-action="toggle-inspector"]').click()
            assert pg.locator('.rightbar').is_visible()
            pg.locator('[data-action="close-inspector"]').click()
            assert not pg.locator('.rightbar').is_visible()
            assert pg.evaluate('document.documentElement.scrollWidth<=document.documentElement.clientWidth+2')
        test('mobile drawer and width',mobile,{'width':390,'height':844})
        def damaged_backups(pg):
            title=pg.evaluate('DocutApp.getProject().title')
            # Chromium file:// pages may disallow native localStorage. Inject a small
            # deterministic in-memory substitute to exercise the recovery UI.
            pg.evaluate("""() => {const mem=new Map(); Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)}});}""")
            pg.evaluate("localStorage.setItem('docut-studio-backups','{corrupt json')")
            pg.locator('[data-action="recovery"]').click()
            assert '복원할 저장 기록이 없습니다' in pg.locator('#recoveryList').inner_text()
            # A damaged index must remain untouched, even after requesting a new backup.
            pg.locator('[data-action="create-backup"]').click()
            assert pg.locator('[data-restore-index]').count()==0
            assert pg.evaluate("localStorage.getItem('docut-studio-backups')")=='{corrupt json'
            with pg.expect_download() as damaged:
                pg.locator('[data-action="download-damaged-backups"]').click()
            assert damaged.value.suggested_filename=='DoCut_Damaged_Backup_Index.txt'
            pg.on('dialog',lambda dialog:dialog.accept())
            pg.locator('[data-action="reset-damaged-backups"]').click()
            assert pg.locator('[data-restore-index]').count()==1
            pg.locator('[data-action="close-recovery"]').first.click()
            pg.evaluate("localStorage.setItem('docut-studio-backups',JSON.stringify([{date:'2026',label:'Invalid',project:{pages:[]}}]))")
            pg.locator('[data-action="recovery"]').click()
            pg.locator('[data-restore-index="0"]').click()
            assert pg.evaluate('DocutApp.getProject().title')==title
            assert pg.locator('#recoveryDialog').is_visible()
        test('corrupted local backups fail safely without replacing document',damaged_backups)

        browser.close()
    print('\n'.join(f'{n}: {"PASS" if status else "FAIL"} {info}' for n,status,info in tests))
    print('TOTAL',sum(status for _,status,_ in tests),'/',len(tests))
    if not all(status for _,status,_ in tests):raise SystemExit(1)

if __name__=='__main__':run()
