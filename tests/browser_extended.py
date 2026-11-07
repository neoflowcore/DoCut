"""Additional direct browser interactions; no external hosting/build."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_recovery import load
import traceback,sys

def run():
 results=[]
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1600,'height':1000},accept_downloads=True)
  errors=load(page)
  def test(name,callback):
   try: callback();assert not errors,errors;results.append((name,'PASS'))
   except Exception as e:results.append((name,'FAIL '+str(e)));traceback.print_exc()
  def reset():
   page.evaluate('''() => {const p=DocutCore.createProject(3,'policy');p.pages[0].elements=[DocutCore.makeBlock('title',80,70,{w:600,h:95,text:'핵심 문제는 개선 필요'}),DocutCore.makeBlock('text',80,220,{w:440,h:160,text:'근거 자료 검토'}),DocutCore.makeBlock('text',680,220,{w:440,h:160,text:'개선 권고안'})];DocutApp.loadProject(p)}''')
  def format_undo():
   reset()
   node=page.locator('#slide .element').nth(1)
   node.dblclick()
   assert page.locator('#richEditorToolbar').is_visible(), 'rich toolbar missing'
   page.evaluate('''()=>{const text=document.querySelector('#slide .element.editing .plain-text').firstChild;const r=document.createRange();r.setStart(text,0);r.setEnd(text,2);const sel=window.getSelection();sel.removeAllRanges();sel.addRange(r)}''')
   page.locator('[data-rich-command="bold"]').click()
   page.locator('#richComplete').click()
   rich=page.evaluate('DocutApp.getProject().pages[0].elements[1].richText')
   assert rich and rich[0]['bold'] and rich[0]['text']=='근거',rich
   page.keyboard.press('Control+z')
   assert not page.evaluate('DocutApp.getProject().pages[0].elements[1].richText')
  test('partial formatting and undo',format_undo)
  def text_undo():
   reset();page.locator('#slide .element').first.dblclick()
   field=page.locator('#slide .element.editing .plain-text')
   field.fill('바뀐 헤드라인')
   page.locator('#richComplete').click()
   assert page.evaluate('DocutApp.getProject().pages[0].elements[0].text')=='바뀐 헤드라인'
   page.keyboard.press('Control+z')
   assert page.evaluate('DocutApp.getProject().pages[0].elements[0].text')=='핵심 문제는 개선 필요'
  test('direct text edit undo',text_undo)
  def csv_ui():
   reset();page.evaluate("DocutApp.addElement('table')")
   assert page.locator('[data-action="import-csv"]').count()==1
   with page.expect_file_chooser() as chooser:
    page.locator('[data-action="import-csv"]').click()
   chooser.value.set_files({'name':'staff.csv','mimeType':'text/csv','buffer':'구분,값\n사내대출,-12\nWAIP,15'.encode('utf-8')})
   page.locator('#csvReviewDialog').wait_for(state='visible')
   before=page.evaluate('DocutApp.getProject().pages[0].elements.at(-1).data.rows[1]')
   assert before!=['사내대출','-12'],before
   page.locator('[data-action="csv-apply"]').click()
   # Synthetic set_content() pages may have no persistent browser storage.
   # V0.22 intentionally defers destructive imports until a safe backup exists;
   # exercise the same explicit JSON rescue step as a real user.
   if page.locator('#csvReviewDialog').is_visible():
    with page.expect_download() as rescued:
     page.locator('#csvReviewDialog [data-action="export-working-copy"]').click()
    assert rescued.value.suggested_filename.endswith('_UNSAVED.docut.json')
    page.locator('[data-action="csv-apply"]').click()
   el=page.evaluate('DocutApp.getProject().pages[0].elements.at(-1)')
   assert el['data']['rows'][1]==['사내대출','-12'],el['data']
   assert el['verified'] is False
   assert el['source']=='staff.csv'
  test('CSV import through local file picker',csv_ui)
  def group_move():
   reset()
   page.evaluate('''()=>{const p=DocutApp.getProject(),els=p.pages[0].elements;els[0].groupId='g1';els[1].groupId='g1';DocutApp.loadProject(p)}''')
   before=page.evaluate('DocutApp.getProject().pages[0].elements.slice(0,2).map(e=>[e.x,e.y])')
   target=page.locator('#slide .element').first
   b=target.bounding_box()
   assert b
   page.mouse.move(b['x']+20,b['y']+20)
   page.mouse.down();page.mouse.move(b['x']+75,b['y']+50,steps=8);page.mouse.up()
   after=page.evaluate('DocutApp.getProject().pages[0].elements.slice(0,2).map(e=>[e.x,e.y])')
   assert after[0][0]!=before[0][0] and after[1][0]!=before[1][0],(before,after)
  test('group moving together',group_move)
  def timeline_drag():
   reset();page.locator('#slide .element').first.click()
   page.locator('[data-action="add-effect"]').click()
   bar=page.locator('[data-timeline-index="0"]').first
   b=bar.bounding_box();assert b
   page.mouse.move(b['x']+12,b['y']+b['height']*.5);page.mouse.down();page.mouse.move(b['x']+78,b['y']+b['height']*.5,steps=4);page.mouse.up()
   el=page.evaluate('DocutApp.getProject().pages[0].elements[0]')
   assert el['effects'][0]['delay']>0,el['effects']
  test('motion bar drag changes delay',timeline_drag)
  def standalone_navigation():
   reset();content=page.evaluate('DocutExporter.exportHTML(DocutApp.getProject())')
   report=browser.new_page(viewport={'width':1280,'height':820});report_errors=[]
   report.on('pageerror',lambda e:report_errors.append(str(e)))
   report.set_content(content,wait_until='load')
   assert report.locator('.report-screen .slide').count()==3
   report.locator('#next').click()
   assert '02 / 03' in report.locator('#counter').inner_text()
   assert report.evaluate('typeof DocutEasing.composeEffects')=='function'
   assert not report_errors,report_errors
   report.close()
  test('standalone HTML navigation and motion module',standalone_navigation)
  def mobile_inspector_esc():
   page.set_viewport_size({'width':390,'height':844})
   page.locator('[data-action="toggle-inspector"]').click()
   assert 'show' in page.locator('.rightbar').get_attribute('class')
   page.keyboard.press('Escape')
   assert 'show' not in page.locator('.rightbar').get_attribute('class')
   page.set_viewport_size({'width':1600,'height':1000})
  test('mobile inspector closes via Escape',mobile_inspector_esc)
  def rich_color():
   reset();page.locator('#slide .element').nth(1).dblclick()
   page.evaluate('''()=>{const t=document.querySelector('#slide .element.editing .plain-text').firstChild;const r=document.createRange();r.setStart(t,0);r.setEnd(t,2);const sel=getSelection();sel.removeAllRanges();sel.addRange(r)}''')
   page.locator('#richColor').fill('#bf1122')
   page.locator('#richComplete').click()
   el=page.evaluate('DocutApp.getProject().pages[0].elements[1]')
   assert el['richText'][0]['color']=='#bf1122',el['richText']
   output=page.evaluate('DocutExporter.exportHTML(DocutApp.getProject())')
   assert 'color:#bf1122' in output
  test('selected font color persists into HTML',rich_color)
  def unbold_title():
   reset();page.locator('#slide .element').first.dblclick()
   page.evaluate('''()=>{const t=document.querySelector('#slide .element.editing .plain-text').firstChild;const r=document.createRange();r.setStart(t,0);r.setEnd(t,2);const sel=getSelection();sel.removeAllRanges();sel.addRange(r)}''')
   page.locator('[data-rich-command="bold"]').click();page.locator('#richComplete').click()
   runs=page.evaluate('DocutApp.getProject().pages[0].elements[0].richText')
   assert runs[0]['normalWeight'] and runs[0]['text']=='핵심',runs
  test('title bold removal persists',unbold_title)
  def master_sync():
   reset();page.evaluate('''()=>{const p=DocutApp.getProject();p.master.footer='인천지사 분회';p.master.pageNumbers=true;DocutApp.loadProject(p)}''')
   assert page.locator('#slide .master-footer').inner_text()=='인천지사 분회'
   assert '1 / 3' in page.locator('#slide .master-page-number').inner_text()
   page.locator('[data-action="preview"]').click()
   assert page.locator('#previewSlide .master-footer').inner_text()=='인천지사 분회'
   page.locator('[data-action="close-preview"]').click()
   assert 'master-footer' in page.evaluate('DocutExporter.exportHTML(DocutApp.getProject())')
  test('master footer editor and preview',master_sync)
  def mobile_drawer():
   page.set_viewport_size({'width':390,'height':844})
   assert page.locator('#mobilePagesToggle').is_visible()
   assert not page.evaluate('document.body.classList.contains("mobile-pages-open")')
   width=page.locator('#stageArea').bounding_box()['width'];assert width>380,width
   page.locator('#mobilePagesToggle').click()
   assert page.evaluate('document.body.classList.contains("mobile-pages-open")')
   assert page.locator('#mobilePagesBackdrop').is_visible()
   page.locator('#mobilePagesBackdrop').click(position={'x':360,'y':300})
   assert not page.evaluate('document.body.classList.contains("mobile-pages-open")')
   page.set_viewport_size({'width':1600,'height':1000})
  test('mobile canvas width and page drawer',mobile_drawer)
  browser.close()
 print('\n'.join(n+': '+v for n,v in results));print('TOTAL',sum(v=='PASS' for _,v in results),'/',len(results))
 if any(v!='PASS' for _,v in results):sys.exit(1)

if __name__=='__main__':run()
