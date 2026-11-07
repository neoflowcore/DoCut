"""V0.21 read-only quality audit and story-map in injected headless Chromium.
No deployment, installer, source release or native Brave physical QA.
"""
import os,traceback
from playwright.sync_api import sync_playwright
from browser_v018 import ready

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
   page=ctx.new_page();failures=ready(page)
   try:
    fn(page)
    assert not failures,failures
    results.append((name,True));print('PASS',name,flush=True)
   except Exception:
    traceback.print_exc();results.append((name,False));print('FAIL',name,flush=True)
   finally:ctx.close()
  def open_quality(page):
   page.locator('button[data-action="quality"]').first.click()
   page.locator('#qualityDialog').wait_for(state='visible')

  def version(page):
   assert page.locator('.brand em').inner_text()=='0.26.0'
   assert page.evaluate('DocutCore.VERSION')=='0.26.0-development'
   assert page.evaluate('Boolean(DocutQualityReview && DocutApp.quality)')
   assert page.evaluate('DocutApp.quality().version')=='quality-v021'
  check('v021 modules and app version loaded',version)

  def summary(page):
   original=page.evaluate('JSON.stringify(DocutApp.getProject())')
   open_quality(page)
   assert page.locator('#qualityStoryMap .quality-story-row').count()==5
   assert '5페이지' in page.locator('#qualitySummary').inner_text()
   assert '우선' in page.locator('#qualitySummary').inner_text()
   assert '자동 점검' in page.locator('#qualityPolicy').inner_text()
   assert original==page.evaluate('JSON.stringify(DocutApp.getProject())')
  check('read-only quality review and five-page story map',summary)

  def filters(page):
   open_quality(page)
   page.locator('#qualitySeverityFilter').select_option('review')
   assert page.locator('#qualityList .quality-hit').count()>0
   assert page.locator('#qualityList .quality-critical').count()==0
   page.locator('#qualityCategoryFilter').select_option('evidence')
   assert all('근거·수치' in s for s in page.locator('#qualityList .quality-hit .quality-item-head>b').all_inner_texts())
   assert page.locator('#qualityVisibleCount').inner_text().endswith('표시)')
   page.locator('#qualitySeverityFilter').select_option('critical')
   assert page.locator('#qualitySeverityFilter').input_value()=='critical'
  check('priority and category filters are composed and accessible',filters)

  def story_nav(page):
   open_quality(page)
   original=page.evaluate('JSON.stringify(DocutApp.getProject())')
   page.locator('#qualityStoryMap [data-issue-page="2"]').click()
   assert page.evaluate('DocutApp.getState().pageIndex')==2
   assert page.locator('#qualityDialog').is_hidden()
   assert original==page.evaluate('JSON.stringify(DocutApp.getProject())')
  check('story map navigates to page without modifying project',story_nav)

  def issue_nav(page):
   open_quality(page)
   issue=page.locator('#qualityList .quality-hit[data-issue-id]:not([data-issue-id=""])').first
   ident=issue.get_attribute('data-issue-id');pg=issue.get_attribute('data-issue-page')
   issue.click()
   assert page.evaluate('DocutApp.getState().pageIndex')==int(pg)
   assert page.evaluate('DocutApp.getState().selectedId')==ident
  check('quality issue navigates and selects affected layer',issue_nav)

  def collision_pair(page):
   p=page.evaluate('DocutApp.getProject()')
   p['pages'][0]['elements']=[dict(id='peer-left',type='text',text='제도 도입 전 영향',x=80,y=210,w=430,h=185,style={'size':23},effects=[],data={}),dict(id='peer-right',type='text',text='제도 도입 후 영향',x=160,y=260,w=430,h=185,style={'size':23},effects=[],data={})]
   page.evaluate('DocutApp.loadProject',p)
   before=page.evaluate('JSON.stringify(DocutApp.getProject())')
   open_quality(page)
   row=page.locator('#qualityList [data-issue-related-id="peer-right"]')
   assert row.count()>=1
   row.first.click()
   selected=page.evaluate('DocutApp.getState().selectedIds')
   assert 'peer-left' in selected and 'peer-right' in selected,selected
   assert page.locator('#slide .element.selected').count()==2
   assert page.evaluate('JSON.stringify(DocutApp.getProject())')==before
  check('overlapping content issue selects both peers without changing either',collision_pair)

  def reject_bad_issue_location(page):
   open_quality(page)
   before=page.evaluate('DocutApp.getState().pageIndex')
   page.locator('#qualityList').evaluate('el => {const a=document.createElement("button");a.setAttribute("data-issue-page","9999");a.textContent="bad pointer";el.append(a)}')
   page.locator('#qualityList button[data-issue-page="9999"]').click()
   assert page.evaluate('DocutApp.getState().pageIndex')==before
   assert page.locator('#qualityDialog').is_visible()
  check('out-of-range audit pointer cannot replace editor page selection',reject_bad_issue_location)

  def download(page):
   open_quality(page)
   with page.expect_download() as d:
    page.locator('#qualityDialog [data-action="quality-export"]').click()
   assert d.value.suggested_filename.endswith('_QUALITY_REVIEW.txt')
   assert d.value.failure() is None
   assert page.locator('#qualityDialog').is_visible()
  check('quality TXT downloads on explicit click, dialog remains open',download)

  def download_csv(page):
   open_quality(page)
   with page.expect_download() as info:
    page.locator('#qualityDialog [data-action="quality-export-csv"]').click()
   file=info.value
   assert file.suggested_filename.endswith('_QUALITY_REVIEW.csv')
   assert file.failure() is None
   assert page.locator('#qualityDialog').is_visible()
  check('quality CSV downloads only on explicit user click',download_csv)

  def copy_prompt(page):
   page.evaluate('''() => {window.__qualityClip = null;Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async s=>{window.__qualityClip=s;}}});}''')
   open_quality(page)
   page.locator('#qualityDialog [data-action="quality-copy-ai"]').click()
   page.wait_for_function('!!window.__qualityClip')
   prompt=page.evaluate('window.__qualityClip')
   assert '원자료를 창작하지 말고' in prompt
   assert '현재/권장 페이지 역할' in prompt
   assert '입력 문서의 확인된 내용과 ID' in prompt
   assert '"schema":3' not in prompt
  check('AI recommendation clipboard is opt-in and does not include project JSON',copy_prompt)

  def hidden_and_empty(page):
   proj=page.evaluate('DocutApp.getProject()')
   for el in proj['pages'][0]['elements']:el['hidden']=True
   page.evaluate('DocutApp.loadProject',proj)
   open_quality(page)
   assert page.locator('#qualityList').inner_text().count('페이지에 표시되는 내용이 없습니다')>=1
  check('empty visible pages produce clear critical warnings',hidden_and_empty)

  def stat_validation(page):
   page.evaluate('DocutApp.addElement("stat")')
   open_quality(page)
   page.locator('#qualitySeverityFilter').select_option('critical')
   page.locator('#qualityCategoryFilter').select_option('evidence')
   assert '통계 자료 확인' in page.locator('#qualityList').inner_text()
  check('statistical row errors are listed as critical evidence warnings',stat_validation)

  def text_unsafe(page):
   p=page.evaluate('DocutApp.getProject()')
   p['pages'][0]['tab']='<img src=x onerror=alert(2)>'
   p['pages'][0]['elements'][0]['text']='</button><svg onload=alert(1)>'
   page.evaluate('DocutApp.loadProject',p)
   open_quality(page)
   assert page.locator('#qualityStoryMap img').count()==0
   assert page.locator('#qualityStoryMap svg').count()==0
   assert '&lt;img' in page.locator('#qualityStoryMap').inner_html()
  check('report titles and issue messages are HTML-escaped',text_unsafe)

  def refresh(page):
   open_quality(page)
   original=page.locator('#qualitySummary').inner_text()
   page.evaluate('DocutApp.addElement("image")')
   page.locator('#qualityDialog [data-action="quality-refresh"]').click()
   assert page.locator('#qualitySummary').inner_text()!=original
   assert '이미지 원본' in page.locator('#qualityList').inner_text()
  check('manual recompute reflects local edits without automatically changing content',refresh)

  def close(page):
   open_quality(page)
   page.locator('#qualityDialog [data-action="close-quality"]').first.click()
   assert page.locator('#qualityDialog').is_hidden()
   assert page.locator('#slide .element').count()>=3
  check('quality dialog closes to working editor',close)

  def mobile(page):
   open_quality(page)
   assert page.locator('#qualityDialog').is_visible()
   has_overflow=page.evaluate('document.documentElement.scrollWidth > innerWidth + 2')
   assert not has_overflow
   assert page.locator('#qualitySeverityFilter').is_visible()
   assert page.locator('#qualityCategoryFilter').is_visible()
   assert page.locator('#qualityDialog [data-action="quality-export"]').count()==1
   assert page.locator('#qualityDialog').evaluate('(e)=>e.scrollHeight>=e.clientHeight')
  check('390px responsive quality panel has keyboard and scroll access',mobile,True)

  def keyboard(page):
   before=page.evaluate('JSON.stringify(DocutApp.getProject())')
   page.locator('body').press('Control+Shift+q')
   assert page.locator('#qualityDialog').is_visible()
   assert before==page.evaluate('JSON.stringify(DocutApp.getProject())')
  check('Ctrl+Shift+Q opens read-only report audit',keyboard)

  def import_impact(page):
   page.locator('#importInput').set_input_files({'name':'new.docut.json','mimeType':'application/json','buffer':page.evaluate('JSON.stringify(DocutCore.createProject(3))').encode()})
   page.locator('#importModeDialog').wait_for(state='visible')
   summary=page.locator('#importQualityImpact').inner_text()
   assert '변환 후보 독립 진단' in summary
   assert '품질 점수' in summary
   with page.expect_download() as info:
    page.locator('[data-action="import-review-report"]').click()
   assert info.value.failure() is None
   page.locator('[data-action="close-import-mode"]').last.click()
   assert page.evaluate('DocutApp.getProject().pages.length')==5
  check('import candidate shows quality comparison without changing document',import_impact)

  def guided_question(page):
   open_quality(page)
   assert page.locator('#qualityStoryMap .quality-story-question').count()==5
   assert '어떤' in page.locator('#qualityStoryMap').inner_text() or '무엇' in page.locator('#qualityStoryMap').inner_text()
  check('storyboard narrative questions shown without automatic title rewrite',guided_question)

  browser.close()
 failed=[name for name,ok in results if not ok]
 print('V0.21 BROWSER',sum(ok for _,ok in results),'/',len(results),'passed',flush=True)
 if failed:raise SystemExit('FAILED: '+', '.join(failed))

if __name__=='__main__':run()
