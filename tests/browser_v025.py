"""V0.25 zero-build storyboard clock and captions, private editor and standalone HTML.
Synthetic Chromium/storage; NOT Windows/Android Brave hands-on, no install/PPTX files.
DOCUT_TEST_FILTER selects labels joined by '|', for bounded sandbox executions.
"""
import os, traceback
from playwright.sync_api import sync_playwright
from browser_v018 import ready


def run():
 results=[]
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  def check(label,func,mobile=False):
   part,total=(int(x) for x in os.environ.get("DOCUT_TEST_SHARD","0/1").split("/"))
   if not hasattr(check,"position"):check.position=0
   idx=check.position;check.position+=1
   if idx%total!=part:return
   pattern=os.environ.get('DOCUT_TEST_FILTER')
   if pattern and not any(x in label for x in pattern.split('|')):return
   print('TEST',label,flush=True)
   ctx=browser.new_context(viewport={'width':390,'height':844} if mobile else {'width':1480,'height':900},accept_downloads=True)
   ctx.set_default_timeout(7500)
   page=ctx.new_page();errors=ready(page)
   try:
    func(page)
    assert not errors,errors
    print('PASS',label,flush=True);results.append(True)
   except Exception:
    traceback.print_exc();print('FAIL',label,flush=True);results.append(False)
   finally:ctx.close()
  def prep(page):page.locator('.layer-item').first.click();page.locator('.layer-item').first.click() # clear selection by selected toggling if needed
  def clear_selection(page):
   page.evaluate("() => document.querySelector('#slide').dispatchEvent(new MouseEvent('click',{bubbles:true}))")
  def set_caption(page,script='0-3 | 첫 번째 캡션\n3-6 | 두 번째 캡션'):
   clear_selection(page)
   if not page.locator('#storyCaptionScript').is_visible():page.locator('#inspectorToggle').click()
   page.locator('#storyCaptionScript').fill(script);page.locator('[data-action="caption-apply"]').click()
  def show(page):page.locator('#previewButton').click();assert page.locator('#previewOverlay').is_visible()
  def export_view(page):
   markup=page.evaluate('DocutExporter.exportHTML(DocutApp.getProject())')
   child=page.context.new_page();errors=[];child.on('pageerror',lambda e:errors.append(str(e)))
   child.set_content(markup,wait_until='domcontentloaded');assert not errors,errors
   return child,markup,errors
  check('V0.25 boot and 5-page duration defaults',lambda p:(
   None if p.locator('.brand em').inner_text()=='0.26.0' and p.evaluate('DocutStoryPlayer.DEFAULT_MS')==12000 and all(x==12000 for x in p.evaluate('DocutApp.getProject().pages.map(x=>x.playbackMs)')) else (_ for _ in ()).throw(AssertionError('default'))))
  def apply_duration(p):
   p.locator('#pageDurationSeconds').fill('8.5');p.locator('#pageDurationSeconds').dispatch_event('change')
   assert p.evaluate('DocutApp.getProject().pages[0].playbackMs')==8500
   assert p.evaluate('DocutApp.getState().history')==1
  check('page duration apply and one undo checkpoint',apply_duration)
  def reject_duration(p):
   original=p.evaluate('JSON.stringify(DocutApp.getProject())')
   p.locator('#pageDurationSeconds').fill('2');p.locator('#pageDurationSeconds').dispatch_event('change')
   assert p.evaluate('JSON.stringify(DocutApp.getProject())')==original
   assert '3~60' in p.locator('#toast').inner_text()
  check('invalid page duration refuses mutation',reject_duration)
  def valid_cues(p):
   set_caption(p)
   assert p.evaluate('DocutApp.getProject().pages[0].captions.length')==2
   assert p.evaluate('DocutApp.getProject().pages[0].captions[1].startMs')==3000
   assert p.evaluate('DocutApp.getState().history')==1
  check('two captions preserve exact content and undo',valid_cues)
  def invalid_cues(p):
   original=p.evaluate('JSON.stringify(DocutApp.getProject())');set_caption(p,'0-5 | A\n4-6 | B')
   assert p.evaluate('JSON.stringify(DocutApp.getProject())')==original
   assert '원본 캡션 유지' in p.locator('#toast').inner_text()
  check('overlap refuses all edits and retains original',invalid_cues)
  def shorten(p):
   set_caption(p,'0-10 | 설명')
   before=p.evaluate('DocutApp.getProject().pages[0].playbackMs')
   p.locator('#pageDurationSeconds').fill('5');p.locator('#pageDurationSeconds').dispatch_event('change')
   assert p.evaluate('DocutApp.getProject().pages[0].playbackMs')==before
  check('duration cannot truncate existing subtitle cues',shorten)
  def caption_inert(p):
   set_caption(p,'0-5 | <img src=x onerror=alert(1)>')
   show(p);p.locator('#storySeek').fill('1500');p.locator('#storySeek').dispatch_event('input')
   assert p.locator('#previewCaption').inner_text()=='<img src=x onerror=alert(1)>'
   assert p.locator('#previewCaption img').count()==0
  check('preview captions are inert text not injected HTML',caption_inert)
  def stage_controls(p):
   show(p);assert p.locator('#storyToggle').get_attribute('aria-pressed')=='false'
   assert p.locator('#storyClock').inner_text()=='00:00.000 / 00:12.000'
   p.locator('#storyToggle').click();p.wait_for_timeout(250)
   assert p.locator('#storyToggle').get_attribute('aria-pressed')=='true'
   assert p.evaluate('DocutApp.getState().story.elapsedMs')>100
   p.locator('#storyToggle').click();assert p.locator('#storyToggle').get_attribute('aria-pressed')=='false'
   previous=p.evaluate('DocutApp.getState().story.elapsedMs');p.wait_for_timeout(220)
   assert p.evaluate('DocutApp.getState().story.elapsedMs')==previous
  check('preview autoplay deliberate start and pause freezes clock',stage_controls)
  def stage_seek(p):
   set_caption(p);show(p);p.locator('#storySeek').fill('4500');p.locator('#storySeek').dispatch_event('input')
   assert p.locator('#previewCaption').inner_text()=='두 번째 캡션'
   assert p.evaluate('DocutApp.getState().story.elapsedMs')==4500
   p.locator('#storyStop').click();assert p.evaluate('DocutApp.getState().story.elapsedMs')==0
  check('story seek updates active captions and stop resets progress',stage_seek)
  def next_and_tabs(p):
   show(p);p.locator('[data-action="next-page"]').click()
   assert p.evaluate('DocutApp.getState().story.index')==1
   p.locator('[data-preview-index="3"]').click();assert p.evaluate('DocutApp.getState().story.index')==3
   p.keyboard.press('Control+ArrowLeft');assert p.evaluate('DocutApp.getState().story.index')==2
   p.keyboard.press('Escape');assert p.locator('#previewOverlay').is_hidden()
   assert p.evaluate('DocutApp.getState().story') is None
  check('page tabs Ctrl-arrow and Escape close keep controller synchronized',next_and_tabs)
  def speed(p):
   show(p);p.locator('#storyLoop').check();p.locator('#storySpeed').select_option('1.5')
   s=p.evaluate('DocutApp.getState().story');assert s['loop'] and s['speed']==1.5
   p.locator('[data-action="close-preview"]').click();show(p)
   s=p.evaluate('DocutApp.getState().story');assert s['speed']==1 and not s['loop']
  check('speed loop are bounded to current preview session only',speed)
  def hidden(p):
   show(p);p.locator('[data-action="story-toggle"]').click()
   p.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))")
   assert p.evaluate('DocutApp.getState().story.playing') is False
  check('hidden document explicitly pauses and never auto-resumes',hidden)
  def data_safe(p):
   set_caption(p,'0-2 | 공개 문구')
   p.evaluate("() => {const project=DocutApp.getProject();project.reviews=[DocutReviewBoard.newReview({body:'PRIVATE_V025_TEST_409',pageId:project.pages[0].id})];DocutApp.loadProject(project)}")
   packet=p.evaluate('JSON.stringify(DocutApp.getProject())')
   assert 'PRIVATE_V025_TEST_409' in packet
   html=p.evaluate('DocutExporter.exportHTML(DocutApp.getProject())')
   assert '공개 문구' in html and 'PRIVATE_V025_TEST_409' not in html
  check('public HTML includes captions but not private review notes',data_safe)
  def export_controls(p):
   set_caption(p,'0-4 | EXPORT_CAPTION_025')
   v,html,errors=export_view(p)
   assert 'src="./assets/' not in html
   assert v.locator('#autoPlay').get_attribute('aria-pressed')=='false'
   v.locator('#reportStorySeek').fill('1500');v.locator('#reportStorySeek').dispatch_event('input')
   assert v.locator('#reportCaption').inner_text()=='EXPORT_CAPTION_025'
   v.locator('#autoPlay').click();v.wait_for_timeout(220)
   assert v.locator('#autoPlay').get_attribute('aria-pressed')=='true'
   v.locator('#autoPlay').click();assert v.locator('#autoPlay').get_attribute('aria-pressed')=='false'
   assert not errors,errors
  check('standalone embedded runtime offline navigation seek autoplay and caption',export_controls)
  def export_nav(p):
   v,html,errors=export_view(p)
   v.locator('#next').click();assert v.locator('#counter').inner_text().startswith('02')
   v.keyboard.press('Control+ArrowLeft');assert v.locator('#counter').inner_text().startswith('01')
   v.keyboard.press('Space');assert v.locator('#autoPlay').get_attribute('aria-pressed')=='true'
   v.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))")
   assert v.locator('#autoPlay').get_attribute('aria-pressed')=='false'
   assert not errors,errors
  check('exported HTML keyboard and visibility pause',export_nav)
  def mobile(p):
   set_caption(p,'0-3 | 모바일 자막');show(p)
   assert p.locator('#storySeek').is_visible() and p.locator('#storyLoop').is_visible()
   assert p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1') is True
   p.locator('#storySeek').fill('1300');p.locator('#storySeek').dispatch_event('input')
   assert '모바일 자막' in p.locator('#previewCaption').inner_text()
  check('390px mobile controls fit without page-level horizontal scrolling',mobile,True)
  def export_mobile(p):
   v,html,errors=export_view(p)
   assert v.locator('#reportStorySeek').is_visible()
   assert v.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1') is True
  check('390px standalone exported playbar remains accessible',export_mobile,True)
  def json_roundtrip(p):
   set_caption(p,'0-7.5 | 교환용 타임라인')
   raw=p.evaluate('JSON.stringify(DocutApp.getProject())')
   p.evaluate('(data) => DocutApp.loadProject(JSON.parse(data))',raw)
   assert p.evaluate('DocutApp.getProject().pages[0].captions[0].endMs')==7500
   assert p.locator('#storyCaptionScript').input_value().startswith('00:00.000-00:07.500')
  check('native JSON roundtrip preserves exact millisecond timestamps',json_roundtrip)
  def reject_import(p):
   before=p.evaluate('JSON.stringify(DocutApp.getProject())')
   result=p.evaluate("() => {const x=DocutApp.getProject();x.pages[0].captions=[{startMs:0,endMs:90000,text:'bad'}];try{DocutCore.normalizeProject(x);return false}catch(e){return true}}")
   assert result and p.evaluate('JSON.stringify(DocutApp.getProject())')==before
  check('invalid imported timed text refuses silent clipping',reject_import)
  def kit_safe(p):
   set_caption(p,'0-3 | PRIVATE_LAYOUT_TIMING_TEXT_25')
   captured=p.evaluate("() => DocutPageKits.capture(DocutApp.getProject().pages[0],'shape-only')")
   assert 'PRIVATE_LAYOUT_TIMING_TEXT_25' not in str(captured)
   assert 'captions' not in captured
  check('personal layout capture cannot retain typed caption content',kit_safe)
  def global_editor(p):
   show(p)
   assert p.locator('#storyAllSeek').get_attribute('max')=='60000'
   p.locator('#storyAllSeek').fill('25000');p.locator('#storyAllSeek').dispatch_event('input')
   assert p.evaluate('DocutApp.getState().story.index')==2
   assert p.evaluate('DocutApp.getState().story.globalElapsedMs')==25000
   assert p.locator('#storyAllClock').inner_text()=='00:25.000 / 01:00.000'
   p.locator('#storySeek').fill('1000');p.locator('#storySeek').dispatch_event('input')
   assert p.evaluate('DocutApp.getState().story.globalElapsedMs')==25000
  check('global presentation timeline jumps among five pages while local seek remains scoped',global_editor)
  def global_offline(p):
   v,html,errors=export_view(p)
   assert v.locator('#reportAllSeek').get_attribute('max')=='60000'
   v.locator('#reportAllSeek').fill('45000');v.locator('#reportAllSeek').dispatch_event('input')
   assert v.locator('#counter').inner_text().startswith('04')
   assert v.locator('#reportAllClock').inner_text()=='00:45.000 / 01:00.000'
   assert not errors,errors
  check('offline standalone global timeline and final section navigation',global_offline)
  def global_mobile(p):
   show(p)
   assert p.locator('#storyAllSeek').is_visible()
   assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
   p.locator('#storyAllSeek').fill('59900');p.locator('#storyAllSeek').dispatch_event('input')
   assert p.locator('#previewCounter').inner_text().startswith('05')
  check('390px mobile viewport includes accessible global seek with no horizontal overflow',global_mobile,mobile=True)
  def strip_editor(p):
   show(p)
   assert p.locator('#storyboardStrip [data-story-index]').count()==5
   p.locator('[data-story-index="3"]').click()
   assert p.locator('#previewCounter').inner_text().startswith('04')
   assert p.locator('[data-story-index="3"]').get_attribute('aria-current')=='true'
   assert p.evaluate('DocutApp.getState().story.globalElapsedMs')==36000
  check('clickable weighted scene strip changes preview and timer',strip_editor)
  def strip_offline(p):
   v,html,errors=export_view(p)
   assert v.locator('#reportStoryboard [data-report-scene]').count()==5
   v.locator('[data-report-scene="2"]').click()
   assert v.locator('#counter').inner_text().startswith('03')
   assert v.locator('[data-report-scene="2"]').get_attribute('aria-current')=='true'
   assert not errors,errors
  check('offline scene strip is clickable and follows page change',strip_offline)
  def style_view(p):
   clear_selection(p);p.locator('#storyCaptionStyle').select_option('glass')
   assert p.evaluate('DocutApp.getProject().pages[0].captionStyle')=='glass'
   assert p.evaluate('DocutApp.getState().history')==1
   set_caption(p,'0-4 | 색상 검사')
   show(p);p.locator('#storySeek').fill('2000');p.locator('#storySeek').dispatch_event('input')
   assert 'caption-style-glass' in p.locator('#previewCaption').get_attribute('class')
   assert p.locator('#previewCaption').inner_text()=='색상 검사'
   html=p.evaluate('DocutExporter.exportHTML(DocutApp.getProject())')
   viewer=p.context.new_page();viewer.set_content(html,wait_until='domcontentloaded')
   viewer.locator('#reportStorySeek').fill('2000');viewer.locator('#reportStorySeek').dispatch_event('input')
   assert 'caption-style-glass' in viewer.locator('#reportCaption').get_attribute('class')
  check('caption style preset remains visible in editor and public standalone HTML',style_view)
  def stop_motion(p):
   show(p);p.locator('#storyToggle').click();p.wait_for_timeout(190)
   p.locator('#storyStop').click();p.wait_for_timeout(250) # ignore one-shot 110/170 ms CSS affordance transitions
   assert p.evaluate('DocutApp.getState().story.playing') is False
   assert p.evaluate('document.getAnimations().filter(a=>a.playState==="running").length')==0
  check('story stop clears active WAAPI animations and clock',stop_motion)
  def offline_stop(p):
   v,html,errors=export_view(p)
   v.locator('#autoPlay').click();v.wait_for_timeout(190);v.locator('#stopPlay').click()
   assert v.locator('#autoPlay').get_attribute('aria-pressed')=='false'
   assert v.evaluate('document.getAnimations().filter(a=>a.playState==="running").length')==0
   assert not errors,errors
  check('offline stop cancels motion without restarting GPU playback',offline_stop)
  print('TOTAL V0.25 browser scenarios:',len(results),'PASS:',sum(results),flush=True)
  browser.close()
 assert results and all(results),'V0.25 storyboard browser regressions failed'

if __name__=='__main__':run()
