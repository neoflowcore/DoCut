"""V0.19 media crop and multi-layer editing browser regression.
No navigation to loopback or file://, no installers or source release artifacts.
Browser storage in this test is an in-memory test double (not native Brave).
"""
from io import BytesIO
import os, traceback
from PIL import Image
from playwright.sync_api import sync_playwright
from browser_v018 import ready


def screenshot_png(width=320,height=160):
    img=Image.new('RGB',(width,height))
    for y in range(height):
        for x in range(width):
            img.putpixel((x,y),(int(250*x/width),int(230*y/height),100))
    buf=BytesIO();img.save(buf,format='PNG');return buf.getvalue()


def run():
 results=[]
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  def check(name,cb,mobile=False):
   part,total=(int(x) for x in os.environ.get("DOCUT_TEST_SHARD","0/1").split("/"))
   if not hasattr(check,"position"):check.position=0
   idx=check.position;check.position+=1
   if idx%total!=part:return
   if os.environ.get('DOCUT_TEST_FILTER') and not any(t in name for t in os.environ['DOCUT_TEST_FILTER'].split('|')):return
   ctx=browser.new_context(viewport={'width':390,'height':844} if mobile else {'width':1500,'height':900},accept_downloads=True)
   ctx.set_default_timeout(9000)
   page=ctx.new_page()
   failures=ready(page)
   try:
    cb(page)
    assert not failures,failures
    print('PASS',name,flush=True);results.append((name,True))
   except Exception:
    traceback.print_exc();print('FAIL',name,flush=True);results.append((name,False))
   finally:ctx.close()

  def fresh(page):
   assert page.locator('.brand em').inner_text()=='0.26.0'
   assert page.evaluate('DocutCore.VERSION')=='0.26.0-development'
   assert page.evaluate('!!window.DocutMediaLayout && !!window.DocutLayerOps')
   assert page.evaluate('DocutApp.getProject().pages[0].elements.length')==5
  check('V0.19 asset load and schema version',fresh)

  def upload_and_frama(page):
   page.evaluate('DocutApp.addElement("image")')
   page.locator('#imageInput').set_input_files({'name':'portrait.png','mimeType':'image/png','buffer':screenshot_png()})
   page.wait_for_function('DocutApp.getProject().pages[0].elements.at(-1).data.width===320')
   assert page.evaluate('DocutApp.getProject().pages[0].elements.at(-1).data.height')==160
   page.locator('[data-adv="style.imageFit"]').select_option('cover')
   page.locator('[data-path="style.focusX"]').fill('0')
   page.locator('[data-path="style.focusX"]').press('Tab')
   page.locator('[data-path="style.focusY"]').fill('100')
   page.locator('[data-path="style.focusY"]').press('Tab')
   page.locator('[data-path="style.cropZoom"]').fill('1.5')
   page.locator('[data-path="style.cropZoom"]').press('Tab')
   page.locator('[data-adv="data.alt"]').fill('도표 & 이미지')
   page.locator('[data-adv="data.alt"]').press('Tab')
   state=page.evaluate('DocutApp.getProject().pages[0].elements.at(-1)')
   assert state['style']['focusX']==0 and state['style']['focusY']==100,state
   assert state['style']['cropZoom']==1.5
   assert state['data']['alt']=='도표 & 이미지'
   img=page.locator('#slide .element[data-type=image] img').last
   assert img.count()==1
   assert img.get_attribute('alt')=='도표 & 이미지'
   assert img.evaluate('(i)=>getComputedStyle(i).objectFit')=='fill'
   assert img.evaluate('(i)=>parseFloat(i.style.width)')>100
   exported=page.evaluate('DocutExporter.exportHTML(DocutApp.getProject())')
   assert 'docut-image-frame' in exported
   assert '도표 &amp; 이미지' in exported
   restored=page.evaluate('''() => {const p=DocutExporter.decodeHTML(DocutExporter.exportHTML(DocutApp.getProject())).project;return p.pages[0].elements.at(-1);}''')
   assert restored['style']['cropZoom']==1.5 and restored['data']['width']==320
  check('image upload, focal point, zoom, alt and offline HTML roundtrip',upload_and_frama)

  def preserve_image_source(page):
   page.evaluate('DocutApp.addElement("image")')
   source=page.locator('[data-adv="element.source"]');assert source.count()==1
   source.fill('기존 공인된 원본 · 2026 연감');source.press('Tab')
   page.locator('#imageInput').set_input_files({'name':'replacement.png','mimeType':'image/png','buffer':screenshot_png(200,100)})
   page.wait_for_function('DocutApp.getProject().pages[0].elements.at(-1).data.width===200')
   block=page.evaluate('DocutApp.getProject().pages[0].elements.at(-1)')
   assert block['source']=='기존 공인된 원본 · 2026 연감'
   assert 'replacement.png' in block.get('notes','')
   assert block['verified'] is False
   assert block['data']['alt']=='replacement.png'
  check('replacing image preserves existing evidence source and logs local filename',preserve_image_source)

  def contain_and_undo(page):
   page.evaluate('DocutApp.addElement("image")')
   page.locator('#imageInput').set_input_files({'name':'banner.png','mimeType':'image/png','buffer':screenshot_png()})
   page.wait_for_function('DocutApp.getProject().pages[0].elements.at(-1).data.width===320')
   page.locator('[data-adv="style.imageFit"]').select_option('contain')
   page.locator('[data-path="style.focusY"]').fill('100')
   page.locator('[data-path="style.focusY"]').press('Tab')
   img=page.locator('#slide .element[data-type=image] img').last
   assert img.evaluate('(i)=>parseFloat(i.style.height)')<100
   before=page.evaluate('DocutApp.getProject().pages[0].elements.at(-1).style.focusX')
   page.locator('[data-path="style.focusX"]').fill('4')
   page.locator('[data-path="style.focusX"]').press('Tab')
   page.locator('[data-action="undo"]').first.click()
   after=page.evaluate('DocutApp.getProject().pages[0].elements.at(-1).style.focusX')
   assert after==before,(before,after)
  check('image contain geometry and one-step undo',contain_and_undo)

  def focal_drag(page):
   page.evaluate('DocutApp.addElement("image")')
   page.locator('#imageInput').set_input_files({'name':'crop.png','mimeType':'image/png','buffer':screenshot_png(480,160)})
   page.wait_for_function('DocutApp.getProject().pages[0].elements.at(-1).data.width===480')
   page.locator('[data-action="toggle-image-crop"]').click()
   assert page.locator('#slide .element.crop-editing').count()==1
   before=page.evaluate('DocutApp.getProject().pages[0].elements.at(-1).style.focusX ?? 50')
   element=page.locator('#slide .element.crop-editing');r=element.bounding_box();assert r
   scale=page.evaluate('DocutApp.getState().scale')
   x,y=r['x']+r['width']/2,r['y']+r['height']/2
   page.mouse.move(x,y);page.mouse.down();page.mouse.move(x+40*scale,y,steps=7);page.mouse.up()
   after=page.evaluate('DocutApp.getProject().pages[0].elements.at(-1).style.focusX')
   assert after<before,(before,after)
   assert page.locator('#slide .element.crop-editing').count()==1
   page.locator('[data-action="toggle-image-crop"]').click()
   assert page.locator('#slide .element.crop-editing').count()==0
  check('drag image content adjusts original-safe focal point, not element position',focal_drag)

  def aspect_ratio(page):
   page.evaluate('DocutApp.addElement("image")')
   page.locator('[data-path="style.aspectLock"]').check()
   before=page.evaluate('DocutApp.getProject().pages[0].elements.at(-1)')
   page.locator('[data-path="element.w"]').fill('600')
   page.locator('[data-path="element.w"]').press('Tab')
   after=page.evaluate('DocutApp.getProject().pages[0].elements.at(-1)')
   assert round(after['w']/after['h'],2)==round(before['w']/before['h'],2),(before,after)
   assert after['style']['aspectLock'] is True
  check('numeric aspect-ratio lock and canvas bounds',aspect_ratio)

  def selected_batch(page):
   page.evaluate('DocutApp.addElement("shape")')
   page.evaluate('DocutApp.addElement("shape")')
   ids=page.evaluate('DocutApp.getProject().pages[0].elements.slice(-2).map(x=>x.id)')
   page.locator(f'[data-layer-id="{ids[0]}"]').click()
   page.locator(f'[data-layer-id="{ids[1]}"]').click(modifiers=['Control'])
   assert len(page.evaluate('DocutApp.getState().selectedIds'))==2
   count=page.evaluate('DocutApp.getProject().pages[0].elements.length')
   page.keyboard.press('Control+d')
   assert page.evaluate('DocutApp.getProject().pages[0].elements.length')==count+2
   page.keyboard.press('Control+z')
   assert page.evaluate('DocutApp.getProject().pages[0].elements.length')==count
   page.locator(f'[data-layer-id="{ids[0]}"]').click()
   page.locator(f'[data-layer-id="{ids[1]}"]').click(modifiers=['Control'])
   page.keyboard.press('ArrowRight')
   moved=page.evaluate('(ids)=>DocutApp.getProject().pages[0].elements.filter(el=>ids.includes(el.id)).map(el=>el.x)',ids)
   assert moved and len(moved)==2
   page.locator('#inspector [data-action="batch-lock"]').click()
   locked=page.evaluate('(ids)=>DocutApp.getProject().pages[0].elements.filter(el=>ids.includes(el.id)).map(el=>el.locked)',ids)
   assert locked==[True,True]
   page.keyboard.press('Delete')
   assert page.evaluate('DocutApp.getProject().pages[0].elements.length')==count
   page.locator('#inspector [data-action="batch-unlock"]').click()
   page.keyboard.press('Delete')
   assert page.evaluate('DocutApp.getProject().pages[0].elements.length')==count-2
  check('multi-select duplicate undo, nudge, lock and guarded removal',selected_batch)

  def duplicate_page(page):
   page.evaluate('DocutApp.addElement("shape")')
   page.evaluate('DocutApp.addElement("shape")')
   ids=page.evaluate('DocutApp.getProject().pages[0].elements.slice(-2).map(x=>x.id)')
   page.locator(f'[data-layer-id="{ids[0]}"]').click()
   page.locator(f'[data-layer-id="{ids[1]}"]').click(modifiers=['Control'])
   page.locator('[data-action="group"]').first.click()
   group=page.evaluate('DocutApp.getProject().pages[0].elements.at(-2).groupId')
   page.evaluate('document.querySelectorAll("#slide .element").forEach(n=>n.blur())')
   page.evaluate('document.querySelector("#slide").click()')
   page.locator('[data-action="duplicate-page"]').first.click()
   doc=page.evaluate('DocutApp.getProject()')
   orig=doc['pages'][0];copy=doc['pages'][1]
   assert len(orig['elements'])==len(copy['elements'])
   assert orig['id']!=copy['id']
   assert group!=copy['elements'][-2]['groupId']
   assert copy['elements'][-2]['groupId']==copy['elements'][-1]['groupId']
  check('page cloning separates group IDs and preserves content',duplicate_page)

  def folder_naming(page):
   page.evaluate('DocutApp.addElement("shape")')
   page.evaluate('DocutApp.addElement("shape")')
   ids=page.evaluate('DocutApp.getProject().pages[0].elements.slice(-2).map(x=>x.id)')
   page.locator(f'[data-layer-id="{ids[0]}"]').click()
   page.locator(f'[data-layer-id="{ids[1]}"]').click(modifiers=['Control'])
   page.locator('[data-action="group"]').first.click()
   state=page.evaluate('(ids)=>DocutApp.getProject().pages[0].elements.filter(e=>ids.includes(e.id)).map(e=>({id:e.id,group:e.groupId,label:e.groupLabel}))',ids)
   assert len(state)==2 and state[0]['group']==state[1]['group'] and state[0]['group']
   assert page.locator('.layer-folder-header').count()==1
   before=page.evaluate('DocutApp.getProject().pages[0].elements.length')
   page.locator('[data-collapse-group]').first.click()
   assert page.locator('.layer-folder .layer-child').count()==0
   assert page.evaluate('DocutApp.getProject().pages[0].elements.length')==before
   page.locator('[data-collapse-group]').first.click()
   assert page.locator('.layer-folder .layer-child').count()==2
   page.locator('[data-select-group]').first.click()
   field=page.locator('[data-path="group.name"]');assert field.count()==1
   field.fill('근거·비교 레이어');field.press('Tab')
   renamed=page.evaluate('(ids)=>DocutApp.getProject().pages[0].elements.filter(e=>ids.includes(e.id)).map(e=>e.groupLabel)',ids)
   assert renamed==['근거·비교 레이어']*2,renamed
   assert '근거·비교 레이어' in page.locator('.folder-select').inner_text()
   exported=page.evaluate('''() => {const p=DocutExporter.decodeHTML(DocutExporter.exportHTML(DocutApp.getProject())).project;return p.pages[0].elements.slice(-2).map(e=>[e.groupId,e.groupLabel]);}''')
   assert len(exported)==2 and exported[0][0]==exported[1][0] and exported[0][1]=='근거·비교 레이어',exported
   page.locator('[data-action="undo"]').first.click()
   undone=page.evaluate('(ids)=>DocutApp.getProject().pages[0].elements.filter(e=>ids.includes(e.id)).map(e=>e.groupLabel)',ids)
   assert undone!=renamed
   page.locator('[data-action="redo"]').first.click()
   assert page.evaluate('(ids)=>DocutApp.getProject().pages[0].elements.filter(e=>ids.includes(e.id)).every(e=>e.groupLabel==="근거·비교 레이어")',ids)
   page.locator(f'[data-lock-id="{ids[0]}"]').click()
   page.locator(f'[data-layer-id="{ids[1]}"]').click()
   page.locator('[data-path="group.name"]').fill('잠금 중 잘못된 변경')
   page.locator('[data-path="group.name"]').press('Tab')
   assert page.evaluate('(ids)=>DocutApp.getProject().pages[0].elements.filter(e=>ids.includes(e.id)).every(e=>e.groupLabel==="근거·비교 레이어")',ids)
   page.locator('[data-action="ungroup"]').first.click()
   assert page.locator('.layer-folder-header').count()==1
   assert page.evaluate('(ids)=>DocutApp.getProject().pages[0].elements.filter(e=>ids.includes(e.id)).every(e=>Boolean(e.groupId))',ids)
   page.locator(f'[data-lock-id="{ids[0]}"]').click()
   page.locator('[data-action="ungroup"]').first.click()
   assert page.locator('.layer-folder-header').count()==0
   assert page.evaluate('(ids)=>DocutApp.getProject().pages[0].elements.filter(e=>ids.includes(e.id)).every(e=>!e.groupId)',ids)
  check('group folders collapse rename undo redo and ungroup without data loss',folder_naming)

  def keyboard_crop(page):
   page.evaluate('DocutApp.addElement("image")')
   page.locator('#imageInput').set_input_files({'name':'focus.png','mimeType':'image/png','buffer':screenshot_png(360,120)})
   page.wait_for_function('DocutApp.getProject().pages[0].elements.at(-1).data.width===360')
   page.locator('[data-action="toggle-image-crop"]').click()
   before=page.evaluate('DocutApp.getProject().pages[0].elements.at(-1).style.focusX ?? 50')
   page.keyboard.press('ArrowRight')
   middle=page.evaluate('DocutApp.getProject().pages[0].elements.at(-1).style.focusX')
   assert middle==before+1,(middle,before)
   page.keyboard.press('Shift+ArrowRight')
   assert page.evaluate('DocutApp.getProject().pages[0].elements.at(-1).style.focusX')==before+11
   page.locator('[data-action="reset-image-focus"]').click()
   values=page.evaluate('DocutApp.getProject().pages[0].elements.at(-1).style')
   assert values['focusX']==50 and values['focusY']==50 and values['cropZoom']==1
   page.locator('[data-action="undo"]').first.click()
   assert page.evaluate('DocutApp.getProject().pages[0].elements.at(-1).style.focusX')==before+11
  check('keyboard focal nudge shift step reset and undo',keyboard_crop)

  def selected_align(page):
   page.evaluate('DocutApp.addElement("shape")')
   page.evaluate('DocutApp.addElement("shape")')
   ids=page.evaluate('DocutApp.getProject().pages[0].elements.slice(-2).map(e=>e.id)')
   page.locator(f'[data-layer-id="{ids[0]}"]').click()
   page.locator(f'[data-layer-id="{ids[1]}"]').click(modifiers=['Control'])
   old=page.evaluate('(ids)=>DocutApp.getProject().pages[0].elements.filter(e=>ids.includes(e.id)).map(e=>({x:e.x,y:e.y,w:e.w}))',ids)
   page.locator('#inspector [data-action="align-hcenter"]').click()
   next=page.evaluate('(ids)=>DocutApp.getProject().pages[0].elements.filter(e=>ids.includes(e.id)).map(e=>({x:e.x,y:e.y,w:e.w}))',ids)
   assert round(next[1]['x']-next[0]['x'])==round(old[1]['x']-old[0]['x'])
   left=min(e['x'] for e in next);right=max(e['x']+e['w'] for e in next)
   assert abs((left+right)/2-640)<=1,(left,right)
   page.locator('[data-action="undo"]').first.click()
   undid=page.evaluate('(ids)=>DocutApp.getProject().pages[0].elements.filter(e=>ids.includes(e.id)).map(e=>e.x)',ids)
   assert undid==[e['x'] for e in old],(undid,old)
   assert page.locator('[data-action="distribute-h"]').count()>0
  check('multi-select canvas alignment is rigid, reversible and exposes safe distribute',selected_align)

  def mobile(page):
   page.evaluate('DocutApp.addElement("image")')
   page.locator('#imageInput').set_input_files({'name':'small.png','mimeType':'image/png','buffer':screenshot_png()})
   page.wait_for_function('DocutApp.getProject().pages[0].elements.at(-1).data.width===320')
   page.locator('#inspectorToggle').click()
   page.locator('[data-path="style.aspectLock"]').check()
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   assert page.locator('#slide .element[data-type=image] img').count()>=1
  check('390px mobile image inspector and no page-level overflow',mobile,mobile=True)

  browser.close()
 print('Summary:',sum(ok for _,ok in results),'/',len(results),flush=True)
 if not all(ok for _,ok in results):raise SystemExit(1)

if __name__=='__main__':run()
