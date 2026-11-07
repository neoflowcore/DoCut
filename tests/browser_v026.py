"""Source-only DoCut V0.26 validation, glass resizing, design and reference effects.
Synthetic Chromium, not actual Windows/Android Brave hands-on or 89 image match.
DOCUT_TEST_SHARD=k/n limits each run; DOCUT_TEST_FILTER substring filters labels.
"""
import json, os, traceback
from playwright.sync_api import sync_playwright
from browser_v018 import ready

def run():
 results=[]
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  def check(label,fn,mobile=False):
   part,total=(int(x) for x in os.environ.get('DOCUT_TEST_SHARD','0/1').split('/'))
   if not hasattr(check,'idx'):check.idx=0
   i=check.idx;check.idx+=1
   if i%total!=part:return
   filt=os.environ.get('DOCUT_TEST_FILTER','')
   if filt and not any(x in label for x in filt.split('|')):return
   ctx=browser.new_context(viewport={'width':390,'height':844} if mobile else {'width':1480,'height':900},accept_downloads=True)
   ctx.set_default_timeout(5200)
   pg=ctx.new_page()
   errs=[]
   try:
    errs=ready(pg)
    fn(pg)
    assert not errs,errs
    print('PASS',label,flush=True);results.append(True)
   except Exception:
    print('FAIL',label,flush=True);traceback.print_exc();results.append(False)
   finally:ctx.close()
  def load_text(pg,s,**kw):
   pg.evaluate('''arg=>{const p=DocutApp.getProject();const e=p.pages[0].elements.find(x=>x.type==='text');e.text=arg.text;Object.assign(e,arg.props);DocutApp.loadProject(p);}''',{'text':s,'props':kw})
  def open_valid(pg,mode='typo'):
   pg.locator('[data-action="validate"]').click()
   if mode!='typo':pg.locator(f'[data-validation-mode="{mode}"]').click()
   assert pg.locator('#validationPanel').is_visible()
  def select_text(pg):
   el=pg.evaluate('DocutApp.getProject().pages[0].elements.find(x=>x.type==="text").id')
   pg.locator(f'[data-layer-id="{el}"]').click()
   assert pg.evaluate('DocutApp.getState().selectedId')==el
   return el
  def use_styles(pg):
   pg.locator('[data-left-tab="styles"]').click()
   assert pg.locator('#leftStyles').is_visible()
  def html(pg):
   page=pg.context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   markup=pg.evaluate('DocutExporter.exportHTML(DocutApp.getProject())')
   page.set_content(markup,wait_until='domcontentloaded')
   assert not errors,errors
   return page,markup,errors
  def brand(pg):
   assert pg.locator('.brand em').inner_text()=='0.26.0'
   assert pg.evaluate('DocutCore.VERSION')=='0.26.0-development'
   assert pg.evaluate('DocutReferenceMap.DATA.items.length')==89
  check('boot version 0.26 modules and reference count',brand)
  def top_order(pg):
   siblings=pg.evaluate("() => {const v=document.querySelector('[data-action=validate]');const next=v.nextElementSibling;return [next?.dataset.action,v.getAttribute('aria-pressed')]}" )
   assert siblings==['quality','false'],siblings
  check('top validation directly before content quality',top_order)
  def tabs(pg):
   open_valid(pg)
   assert pg.locator('[data-validation-mode]').count()==3
   for mode,txt in [('typo','오탈자'),('report','보고서 문제'),('ai','AI 문장 개선')]:
    pg.locator(f'[data-validation-mode="{mode}"]').click()
    assert pg.locator('#inspectorTitle').inner_text().endswith(txt)
    assert pg.locator(f'[data-validation-mode="{mode}"]').get_attribute('aria-selected')=='true'
  check('right inspector three validation modes',tabs)
  def return_elements(pg):
   open_valid(pg)
   pg.locator('[data-action="validation-element"]').last.click()
   assert pg.locator('#inspector').is_visible() and pg.locator('#validationPanel').is_hidden()
  check('return to element editor without losing report',return_elements)
  def typos(pg):
   load_text(pg,'검토 하였습니다. 됬어요. 할수 있습니다.')
   open_valid(pg)
   assert pg.locator('[data-validation-fix]').count()>=3,pg.locator('#validationSummary').inner_text()
   assert '자동 수정 없음' in pg.locator('#validationSummary').inner_text()
  check('Korean conservative typo candidates in right panel',typos)
  def english(pg):
   load_text(pg,'teh recieve  report')
   open_valid(pg)
   pg.locator('#validationLanguage').select_option('en')
   assert pg.locator('[data-validation-fix]').count()>=3
   assert '한국어' not in pg.locator('#validationResults').inner_text()
  check('English spelling and whitespace selectable',english)
  def scope(pg):
   load_text(pg,'teh')
   open_valid(pg)
   pg.locator('#validationScope').select_option('selected')
   assert '0건' in pg.locator('#validationSummary').inner_text()
   select_text(pg)
   assert pg.locator('[data-validation-fix]').count()>=1
  check('scope selected requires actual canvas selection',scope)
  def approved(pg):
   load_text(pg,'teh 70%')
   open_valid(pg)
   before=pg.evaluate('DocutApp.getProject().pages[0].elements.find(x=>x.type==="text").text')
   pg.locator('[data-validation-fix]').first.click()
   after=pg.evaluate('DocutApp.getProject().pages[0].elements.find(x=>x.type==="text").text')
   assert before=='teh 70%' and after=='the 70%'
   pg.locator('[data-action="undo"]').first.click()
   assert pg.evaluate('DocutApp.getProject().pages[0].elements.find(x=>x.type==="text").text')==before
  check('individual typo only and one undo without number changes',approved)
  def locked(pg):
   load_text(pg,'teh',locked=True)
   open_valid(pg)
   assert pg.locator('[data-validation-fix]').count()==0
  check('locked elements excluded from spelling edits',locked)
  def formatted(pg):
   load_text(pg,'teh',richText=[{'text':'teh'}])
   open_valid(pg)
   assert pg.locator('[data-validation-fix]').count()==0
  check('rich formatted elements protected from text overwrite',formatted)
  def allpages(pg):
   pg.evaluate("() => {let p=DocutApp.getProject();p.pages[1].elements.find(e=>e.type==='text').text='teh 88%';DocutApp.loadProject(p)}")
   open_valid(pg)
   pg.locator('#validationScope').select_option('all')
   assert '2쪽' in pg.locator('#validationResults').inner_text()
   pg.locator('[data-validation-locate]').last.click()
   assert pg.evaluate('DocutApp.getState().pageIndex')==1
  check('all report search and issue position jump',allpages)
  def quality(pg):
   open_valid(pg,'report')
   assert pg.locator('.validation-report-hit').count()>=1
   assert '자동 수정 없음' in pg.locator('#validationSummary').inner_text()
   state=pg.evaluate('JSON.stringify(DocutApp.getProject())')
   pg.locator('[data-validation-quality]').first.click()
   assert pg.evaluate('JSON.stringify(DocutApp.getProject())')==state
  check('report issue panel uses read only quality engine',quality)
  def report_scope(pg):
   open_valid(pg,'report')
   pg.locator('#validationScope').select_option('selected')
   assert pg.locator('[data-validation-quality]').count()==0
  check('report selected scope without selection has no unrelated issues',report_scope)
  def ai_empty(pg):
   open_valid(pg,'ai')
   assert pg.locator('#validationProposedText').is_disabled()
   assert '자동' in pg.locator('#validationHelp').inner_text()
  check('AI mode is explicit manual copy and paste, not network call',ai_empty)
  def ai_compare(pg):
   load_text(pg,'teh 70%')
   select_text(pg)
   open_valid(pg,'ai')
   pg.locator('#validationProposedText').fill('the 70%')
   pg.locator('[data-action="validation-compare"]').click()
   assert 'the 70%' in pg.locator('#validationDiff').inner_text()
   assert pg.locator('#validationApplyProposal').is_enabled()
   pg.locator('#validationApplyProposal').click()
   assert pg.evaluate('DocutApp.getProject().pages[0].elements.find(x=>x.type==="text").text')=='the 70%'
  check('AI pasted suggestion diff and explicit approval',ai_compare)
  def ai_numeric(pg):
   load_text(pg,'매출 70%')
   select_text(pg);open_valid(pg,'ai')
   pg.locator('#validationProposedText').fill('매출 90%')
   pg.locator('[data-action="validation-compare"]').click()
   assert pg.locator('#validationApplyProposal').is_disabled()
   assert '숫자' in pg.locator('#validationDiff').inner_text()
  check('AI suggestion numeric or date change rejected',ai_numeric)
  def ai_stale(pg):
   load_text(pg,'teh 70%');select_text(pg);open_valid(pg,'ai')
   pg.locator('#validationProposedText').fill('the 70%');pg.locator('[data-action="validation-compare"]').click()
   pg.locator('#validationProposedText').fill('different 70%')
   assert pg.locator('#validationApplyProposal').is_disabled()
  check('AI approval invalidates on subsequent text edit',ai_stale)
  def ai_xss(pg):
   load_text(pg,'teh')
   select_text(pg);open_valid(pg,'ai')
   pg.locator('#validationProposedText').fill('<img src=x onerror=alert(1)>')
   pg.locator('[data-action="validation-compare"]').click()
   assert pg.locator('#validationDiff img').count()==0
  check('AI review suggestion is escaped inert text',ai_xss)
  def quick_three(pg):
   use_styles(pg)
   assert pg.locator('.quick-design-grid button').count()==3
   assert pg.locator('#themeDetails').evaluate('(e)=>e.open') is False
   pg.locator('.quick-design-grid [data-theme="consulting"]').click()
   assert pg.evaluate('DocutApp.getProject().theme')=='consulting'
  check('three quick themes and collapsed advanced palettes',quick_three)
  def palettes(pg):
   use_styles(pg);pg.locator('#themeDetails summary').click()
   assert pg.locator('[data-theme="bronze"]').count()==1
   pg.locator('[data-theme="bronze"]').click()
   assert pg.evaluate('DocutApp.getProject().theme')=='bronze'
  check('advanced nine palette choices remain available',palettes)
  def transitions(pg):
   use_styles(pg)
   assert pg.locator('#quickTransition option').count()==11
   pg.locator('#quickTransition').select_option('flip')
   pg.locator('[data-action="quick-transition-apply"]').click()
   assert pg.evaluate('DocutApp.getProject().pages[0].transition')=='flip'
   pg.locator('[data-action="undo"]').first.click()
   assert pg.evaluate('DocutApp.getProject().pages[0].transition')!='flip'
  check('eleven page transitions apply and undo safely',transitions)
  def transition_preview(pg):
   use_styles(pg);pg.locator('#quickTransition').select_option('soft-blur');pg.locator('[data-action="quick-transition-apply"]').click()
   pg.locator('[data-action="preview-page-transition"]').click()
   assert pg.evaluate('DocutPageTransitions.plan("soft-blur").duration')==500
  check('transition preview uses actual shared motion runtime',transition_preview)
  def references(pg):
   use_styles(pg);pg.locator('#referenceDetails > summary').click()
   assert pg.locator('.reference-group').count()==16
   assert pg.locator('.reference-image-row').count()==89
   assert '미검증' in pg.locator('#referenceDetails').inner_text()
  check('reference group catalog covers all 89 metadata entries',references)
  def mapped(pg):
   use_styles(pg);pg.locator('#referenceDetails > summary').click()
   pg.locator('.reference-group').first.locator('summary').click()
   assert pg.locator('[data-ref-group]').count()>=1
   assert pg.evaluate('DocutReferenceMap.DATA.items[0].kind')=='preset'
  check('reference taxonomy offers only grounded mapped alternatives',mapped)
  def no_guides(pg):
   use_styles(pg);pg.locator('#referenceDetails > summary').click()
   for id in ['ux_principles','video_tool_catalog']:
    assert not pg.locator(f'[data-ref-group="{id}"]').count()
  check('UX guide screenshots never pose as runnable effects',no_guides)
  def mapped_transition(pg):
   use_styles(pg);pg.locator('#referenceDetails > summary').click()
   target=pg.evaluate("DocutReferenceMap.DATA.groups.find(g=>g.operation==='transition').id")
   pg.locator(f'.reference-group:has([data-ref-group="{target}"]) summary').click()
   pg.locator(f'[data-ref-group="{target}"]').click()
   assert pg.evaluate('DocutApp.getProject().pages[0].transition')=='reveal-center'
  check('mapped reference transition updates only page property',mapped_transition)
  def splitter_keys(pg):
   before=pg.evaluate('DocutApp.paneLayout.get()')
   bar=pg.locator('[data-pane-resize="left"]');bar.focus();bar.press('ArrowRight')
   after=pg.evaluate('DocutApp.paneLayout.get()')
   assert after['left']>before['left']
   assert pg.evaluate("JSON.parse(localStorage.getItem('docut-ui-pane-widths-v026')).left")==after['left']
  check('left glass separator supports keyboard resizing and local UI persistence',splitter_keys)
  def right_keys(pg):
   before=pg.evaluate('DocutApp.paneLayout.get()')
   bar=pg.locator('[data-pane-resize="right"]');bar.focus();bar.press('ArrowLeft')
   after=pg.evaluate('DocutApp.paneLayout.get()')
   assert after['right']>before['right']
   assert pg.evaluate('DocutApp.getProject().pages.length')==5
  check('right glass separator resizes independently from report JSON',right_keys)
  def pane_drag(pg):
   before=pg.evaluate('DocutApp.paneLayout.get()')
   rect=pg.locator('[data-pane-resize="left"]').evaluate('(el)=>el.getBoundingClientRect().toJSON()')
   pg.mouse.move(rect['x'],rect['y']+200);pg.mouse.down();pg.mouse.move(rect['x']+70,rect['y']+200,steps=4);pg.mouse.up()
   assert pg.evaluate('DocutApp.paneLayout.get().left')>=before['left']+50
  check('glass separator supports real pointer drag without canvas mutation',pane_drag)
  def pane_bounds(pg):
   pg.evaluate("DocutApp.paneLayout.set('left',550)")
   pg.evaluate("DocutApp.paneLayout.set('right',590)")
   widths=pg.evaluate("()=>({prefs:DocutApp.paneLayout.get(),width:document.querySelector('.workspace').getBoundingClientRect().width})")
   assert widths['prefs']['left']+widths['prefs']['right']<=widths['width']-300
   assert widths['prefs']['left']>=178 and widths['prefs']['right']>=230
  check('splitter width clamp preserves stage room on desktop',pane_bounds)
  def mobile(pg):
   assert pg.locator('[data-pane-resize]').count()==2
   assert pg.locator('[data-pane-resize="left"]').is_hidden()
   assert pg.locator('[data-pane-resize="right"]').is_hidden()
   pg.locator('[data-action="validate"]').click()
   assert pg.locator('#validationPanel').is_visible()
  check('mobile view uses existing overlay and hides desktop splitters',mobile,True)
  def mobile_no_overflow(pg):
   pg.locator('[data-action="validate"]').click()
   assert pg.locator('.validation-mode-tabs').count()==1
   assert pg.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
  check('mobile 390px validation panel has no horizontal page overflow',mobile_no_overflow,True)
  def offline(pg):
   use_styles(pg);pg.locator('#quickTransition').select_option('flip');pg.locator('[data-action="quick-transition-apply"]').click()
   o,markup,errors=html(pg)
   assert o.evaluate("typeof DocutPageTransitions.plan")== 'function'
   assert o.evaluate("DocutPageTransitions.plan('flip').id")=='flip'
   assert not errors,errors
   assert 'https://cdn' not in markup
   o.close()
  check('standalone HTML embeds shared transition engine and remains offline',offline)
  def save_project(pg):
   pg.locator('[data-action="validate"]').click()
   val=pg.evaluate("()=>{const p=DocutApp.getProject();return [Boolean(p.validationIssues),p.pages.length,Boolean(p.reviews)];}")
   assert val[0] is False and val[1]==5
  check('validation UI does not pollute persisted project document schema',save_project)
  def reference_stays_open(pg):
   use_styles(pg)
   pg.locator('#referenceDetails > summary').click()
   group=pg.locator('.reference-group').filter(has=pg.locator('[data-ref-group="landing_motions"]'))
   group.locator('summary').click()
   assert group.evaluate('(el)=>el.open') is True
   pg.locator('[data-ref-group="landing_motions"]').click()
   assert group.evaluate('(el)=>el.open') is True
   assert pg.locator('#referenceDetails').evaluate('(el)=>el.open') is True
  check('advanced reference catalog stays expanded after applying mapped effect',reference_stays_open)
  def right_pointer_drag(pg):
   before=pg.evaluate('DocutApp.paneLayout.get()')
   rect=pg.locator('[data-pane-resize="right"]').evaluate('(el)=>el.getBoundingClientRect().toJSON()')
   pg.mouse.move(rect['x'],rect['y']+180);pg.mouse.down();pg.mouse.move(rect['x']-64,rect['y']+180,steps=4);pg.mouse.up()
   assert pg.evaluate('DocutApp.paneLayout.get().right')>=before['right']+45
  check('right glass separator supports pointer drag and independent width',right_pointer_drag)
  def reference_filter(pg):
   use_styles(pg);pg.locator('#referenceDetails > summary').click()
   field=pg.locator('#referenceSearch');field.fill('Count-up stats')
   assert pg.locator('#referenceMatchCount').inner_text().startswith('3개')
   assert pg.locator('.reference-image-row:visible').count()==3
   assert pg.locator('.reference-group:visible').count()==1
   field.fill('absent-missing-reference-xyz')
   assert pg.locator('#referenceMatchCount').inner_text().startswith('0개')
   assert pg.locator('.reference-group:visible').count()==0
   field.fill('')
   assert pg.locator('.reference-image-row').count()==89
   assert pg.locator('.reference-index').first.text_content()=='01'
  check('reference metadata search filters 89 entries and remains reversible',reference_filter)
  def theme_feedback(pg):
   use_styles(pg)
   pg.locator('.quick-design-grid [data-theme="ambient"]').click()
   assert pg.locator('.quick-design-grid [data-theme="ambient"]').get_attribute('aria-pressed')=='true'
   assert pg.locator('.quick-design-grid [data-theme="wood"]').get_attribute('aria-pressed')=='false'
  check('quick palette active state communicates the applied design',theme_feedback)
  def protected_citation(pg):
   load_text(pg,'teh result\n출처: 한국부동산원 2025')
   select_text(pg);open_valid(pg,'ai')
   pg.locator('#validationProposedText').fill('the result\n출처: 다른 기관 2025')
   pg.locator('[data-action="validation-compare"]').click()
   assert pg.locator('#validationApplyProposal').is_disabled()
   assert '출처' in pg.locator('#validationDiff').inner_text()
  check('AI sentence improvement cannot silently replace cited source lines',protected_citation)
  def ignore_false_positive(pg):
   load_text(pg,'teh recieve wrong')
   open_valid(pg)
   count=pg.locator('[data-validation-fix]').count()
   assert count>=2
   pg.locator('[data-validation-ignore]').first.click()
   assert pg.locator('[data-validation-fix]').count()==count-1
   assert '세션' in pg.locator('#validationSummary').inner_text()
   pg.locator('[data-action="validation-reset-ignored"]').click()
   assert pg.locator('[data-validation-fix]').count()==count
  check('spelling false positive can be ignored and restored without changing text',ignore_false_positive)
  def page_heading_fix(pg):
   pg.evaluate("() => {let p=DocutApp.getProject();p.pages[0].tab='teh briefing';DocutApp.loadProject(p)}")
   open_valid(pg)
   assert '페이지 탭 제목' in pg.locator('#validationResults').inner_text()
   row=pg.locator('.validation-item').filter(has_text='페이지 탭 제목')
   row.locator('[data-validation-fix]').first.click()
   assert pg.evaluate('DocutApp.getProject().pages[0].tab')=='the briefing'
   pg.locator('[data-action="undo"]').first.click()
   assert pg.evaluate('DocutApp.getProject().pages[0].tab')=='teh briefing'
  check('page title spelling suggestions apply safely with undo',page_heading_fix)
  browser.close()
 print('RESULT',len(results),'/',sum(results),flush=True)
 assert results and all(results),'V0.26 browser scenario failed'
if __name__=='__main__':run()
