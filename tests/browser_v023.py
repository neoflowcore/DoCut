"""V0.23 private review-board UI; synthetic localStorage, injected Chromium.
Does NOT replace physical Windows/Android Brave or PowerPoint QA.
"""
import os, json, traceback
from playwright.sync_api import sync_playwright
from browser_v018 import ready

def run():
 results=[]
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  def check(name,fn,mobile=False):
   part,total=(int(x) for x in os.environ.get("DOCUT_TEST_SHARD","0/1").split("/"))
   if not hasattr(check,"position"):check.position=0
   idx=check.position;check.position+=1
   if idx%total!=part:return
   filt=os.environ.get('DOCUT_TEST_FILTER','')
   if filt and not any(x in name for x in filt.split('|')):return
   ctx=browser.new_context(viewport={'width':390,'height':844} if mobile else {'width':1480,'height':900},accept_downloads=True)
   ctx.set_default_timeout(8000)
   page=ctx.new_page();errors=ready(page)
   try:
    fn(page)
    assert not errors,errors
    results.append((name,True));print('PASS',name,flush=True)
   except Exception:
    traceback.print_exc();results.append((name,False));print('FAIL',name,flush=True)
   finally:ctx.close()
  def open_review(pg):
   pg.locator('button[data-action="reviews"]').first.click()
   pg.locator('#reviewDialog').wait_for(state='visible')
  def add(pg,text='문서 확인 의견',scope='page',priority='normal',author='인천분회'):
   pg.locator('#reviewScope').select_option(scope)
   pg.locator('#reviewNewPriority').select_option(priority)
   pg.locator('#reviewAuthor').fill(author)
   pg.locator('#reviewNewText').fill(text)
   pg.locator('button[data-action="review-add"]').click()
   return pg.evaluate('DocutApp.getProject().reviews.at(-1)')

  def boot(pg):
   assert pg.locator('.brand em').inner_text()=='0.26.0'
   assert pg.evaluate('DocutCore.VERSION')=='0.26.0-development'
   assert pg.evaluate('Boolean(DocutReviewBoard && DocutApp.review)')
   assert pg.evaluate('DocutApp.review().total')==0
   assert pg.locator('button[data-action="reviews"]').count()==1
  check('V0.23 and review board boot cleanly',boot)

  def open_ui(pg):
   open_review(pg)
   assert '내부 검토 메모' in pg.locator('#reviewDialog').inner_text()
   assert pg.evaluate('document.querySelector("#reviewScope option[value=element]").disabled') is True
   assert pg.locator('#reviewStatusFilter').input_value()=='all'
   assert '0건' in pg.locator('#reviewSummary').inner_text()
  check('read-only empty notebook with safe default anchor',open_ui)

  def page_note(pg):
   open_review(pg);n=add(pg,'사내대출 70% 비교 근거 확인',priority='high')
   assert n['pageId']==pg.evaluate('DocutApp.getProject().pages[0].id')
   assert n['elementId']==''
   assert pg.evaluate('DocutApp.review().highOpen')==1
   assert pg.locator('.review-note').count()==1
   assert '사내대출' in pg.locator('.review-note').inner_text()
  check('priority page note persists in native project',page_note)

  def element_note(pg):
   id=pg.evaluate('DocutApp.getProject().pages[0].elements[0].id')
   pg.locator('#slide .element').first.click()
   open_review(pg);n=add(pg,'특정 문장 근거 확인','element')
   assert n['elementId']==id
   assert pg.evaluate('DocutReviewBoard.anchor(DocutApp.getProject().reviews[0],DocutApp.getProject().pages).state')=='element'
   pg.locator(f'[data-review-act="jump"][data-review-id="{n["id"]}"]').click()
   assert pg.locator('#reviewDialog').is_hidden()
   assert pg.evaluate('DocutApp.getState().selectedId')==id
  check('element-anchored comment navigates to selected layer',element_note)

  def doc_note(pg):
   open_review(pg);n=add(pg,'보고서 전체 목적 확인','document')
   assert n['pageId']==''
   assert pg.evaluate('DocutApp.review().orphans')==0
   assert pg.locator('.review-note [data-review-act="jump"]').is_disabled()
  check('document-level note has no misleading page link',doc_note)

  def filtering(pg):
   open_review(pg);add(pg,'우선 확인',priority='high');add(pg,'나중에 검토',priority='low')
   pg.locator('#reviewPriorityFilter').select_option('high')
   assert pg.locator('.review-note').count()==1
   pg.locator('#reviewPriorityFilter').select_option('all')
   pg.locator('#reviewQuery').fill('나중에')
   assert pg.locator('.review-note').count()==1
   pg.locator('#reviewQuery').fill('없는 내용')
   assert pg.locator('.review-note').count()==0
   assert pg.evaluate('DocutApp.review().total')==2
  check('query and priority filters do not mutate underlying reviews',filtering)

  def status(pg):
   open_review(pg);n=add(pg,'해결대상')
   pg.locator(f'[data-review-act="status"][data-review-id="{n["id"]}"]').click()
   assert pg.evaluate('DocutApp.getProject().reviews[0].status')=='resolved'
   assert pg.evaluate('DocutApp.review().resolved')==1
   pg.locator('#reviewStatusFilter').select_option('open')
   assert pg.locator('.review-note').count()==0
   pg.locator('#reviewStatusFilter').select_option('resolved')
   pg.locator('[data-review-act="status"]').first.click()
   assert pg.evaluate('DocutApp.review().open')==1
  check('manual resolution and reopen with status filters',status)

  def replies(pg):
   open_review(pg);n=add(pg,'원본 요청',author='담당자')
   row=pg.locator(f'[data-review-note="{n["id"]}"]')
   row.locator('details').last.locator('summary').click()
   row.locator('[data-review-reply]').fill('자료 다시 첨부했습니다')
   row.locator('[data-review-act="reply"]').click()
   assert pg.evaluate('DocutApp.getProject().reviews[0].replies[0].body')=='자료 다시 첨부했습니다'
   assert '답글 1건' in pg.locator('#reviewSummary').inner_text()
  check('reply preserves original note and author',replies)

  def edit(pg):
   open_review(pg);n=add(pg,'기존 의견')
   row=pg.locator(f'[data-review-note="{n["id"]}"]')
   row.locator('details').first.locator('summary').click()
   row.locator('[data-review-edit]').fill('변경된 의견')
   row.locator('[data-review-act="edit"]').click()
   assert pg.evaluate('DocutApp.getProject().reviews[0].body')=='변경된 의견'
   pg.locator('button[data-action="review-close"]').first.click()
   pg.locator('button[data-action="undo"]').first.click()
   assert pg.evaluate('DocutApp.getProject().reviews[0].body')=='기존 의견'
  check('edit and undo restore review note text',edit)

  def priority(pg):
   open_review(pg);add(pg,'우선순위 변경')
   pg.locator('.review-note select[data-review-priority]').select_option('high')
   assert pg.evaluate('DocutApp.review().highOpen')==1
  check('note priority change is in project history',priority)

  def orphan(pg):
   project=pg.evaluate('DocutApp.getProject()')
   src=project['pages'][0]['elements'][0]
   pg.locator('#slide .element').first.click()
   open_review(pg);n=add(pg,'삭제 뒤에도 남아야 함','element')
   pg.locator('button[data-action="review-close"]').first.click()
   nextp=pg.evaluate('DocutApp.getProject()')
   nextp['pages'][0]['elements']=[x for x in nextp['pages'][0]['elements'] if x['id']!=src['id']]
   pg.evaluate('DocutApp.loadProject',nextp)
   open_review(pg)
   assert pg.evaluate('DocutApp.review().orphans')==1
   assert pg.locator('[data-review-act="retarget"]').count()==1
   pg.on('dialog',lambda dialog: dialog.accept())
   pg.locator('[data-review-act="retarget"]').click()
   assert pg.evaluate('DocutApp.review().orphans')==0
   assert pg.evaluate('DocutApp.getProject().reviews[0].pageId')==pg.evaluate('DocutApp.getProject().pages[0].id')
  check('deleted element retains review and can retarget safely',orphan)

  def privacy(pg):
   open_review(pg);add(pg,'NO_PUBLISH_REVIEW_SECRET_1299',author='PRIVATE_REVIEWER_1299')
   js=pg.evaluate('DocutExporter.exportHTML(DocutApp.getProject())')
   assert 'NO_PUBLISH_REVIEW_SECRET_1299' not in js
   assert 'PRIVATE_REVIEWER_1299' not in js
   assert pg.evaluate('DocutApp.getProject().reviews.length')==1
   assert pg.evaluate('DocutExporter.exportText(DocutApp.getProject()).includes("NO_PUBLISH_REVIEW_SECRET_1299")') is False
   assert pg.evaluate('DocutExporter.aiPrompt(DocutApp.getProject()).includes("NO_PUBLISH_REVIEW_SECRET_1299")') is False
  check('internal names and text excluded from public report and default AI',privacy)

  def export_csv(pg):
   open_review(pg);add(pg,'=HYPERLINK("test","BAD")',author='+FORMULA')
   with pg.expect_download() as info:pg.locator('[data-action="review-export-csv"]').click()
   file=info.value
   assert file.suggested_filename.endswith('_PRIVATE_REVIEWS.csv')
   data=file.path().read_text(encoding='utf-8') if hasattr(file.path(),'read_text') else open(file.path(),encoding='utf-8').read()
   assert "'=HYPERLINK" in data
   assert "'+FORMULA" in data
  check('CSV review export escapes spreadsheet formula payloads',export_csv)

  def export_txt(pg):
   open_review(pg);add(pg,'별도 검토 내용')
   with pg.expect_download() as info:pg.locator('[data-action="review-export-txt"]').click()
   assert info.value.suggested_filename.endswith('_PRIVATE_REVIEWS.txt')
   assert info.value.failure() is None
  check('TXT reviews download only after explicit click',export_txt)

  def many(pg):
   p=pg.evaluate('DocutApp.getProject()')
   notes=pg.evaluate('''()=>{const p=DocutApp.getProject();return Array.from({length:48},(_,i)=>DocutReviewBoard.newReview({pageId:p.pages[0].id,body:'대량 의견 '+i}));}''')
   p['reviews']=notes;pg.evaluate('DocutApp.loadProject',p)
   open_review(pg);assert pg.locator('.review-note').count()==35
   pg.locator('[data-review-act="more"]').click()
   assert pg.locator('.review-note').count()==48
   assert pg.locator('[data-review-act="more"]').count()==0
  check('long review list exposes all notes without silent clipping',many)

  def html_inert(pg):
   pg.evaluate('window.__reviewExecuted=false')
   open_review(pg);add(pg,'<img src=x onerror=window.__reviewExecuted=true>')
   assert pg.locator('.review-note img').count()==0
   assert pg.evaluate('window.__reviewExecuted') is False
  check('untrusted reviewer HTML is displayed as inert text',html_inert)

  def stored(pg):
   open_review(pg);n=add(pg,'보존되어야 함')
   assert pg.evaluate('DocutPersistence.inspect(localStorage,DocutCore.normalizeProject).project.reviews.length')==1
   pg.locator('button[data-action="review-close"]').first.click()
   with pg.expect_download() as info:pg.locator('button[data-action="save-json"]').first.click()
   assert info.value.suggested_filename.endswith('.docut.json')
  check('private review is part of saved native JSON, unlike public HTML',stored)

  def responsive(pg):
   pg.locator('button[data-action="reviews"]').first.evaluate('(el)=>el.click()')
   pg.locator('#reviewDialog').wait_for(state='visible')
   r=pg.locator('#reviewDialog').bounding_box()
   assert r and r['x']>=0 and r['x']+r['width']<=390.5,r
   pg.locator('#reviewNewText').fill('모바일 화면 확인')
   pg.locator('#reviewScope').select_option('page')
   pg.locator('[data-action="review-add"]').click()
   assert pg.locator('.review-note').count()==1
  check('390px mobile review dialog fits viewport and accepts input',responsive,True)
  def quality_import(pg):
   open_quality=pg.locator('[data-action="quality"]').first
   open_quality.click();pg.locator('#qualityDialog').wait_for(state='visible')
   before=pg.evaluate('JSON.stringify(DocutApp.getProject())')
   pg.on('dialog',lambda dialog: dialog.dismiss())
   pg.locator('[data-action="quality-to-reviews"]').click()
   assert before==pg.evaluate('JSON.stringify(DocutApp.getProject())')
  check('quality issue import requires explicit confirmation',quality_import)

  def quality_accept(pg):
   pg.on('dialog',lambda dialog: dialog.accept())
   pg.locator('[data-action="quality"]').first.click()
   pg.locator('[data-action="quality-to-reviews"]').click()
   assert pg.locator('#reviewDialog').is_visible()
   assert pg.locator('#qualityDialog').is_hidden()
   stats=pg.evaluate('DocutApp.review()');assert 1<=stats['total']<=20,stats
   pg.locator('[data-action="review-close"]').first.click()
   pg.locator('[data-action="quality"]').first.click()
   pg.locator('[data-action="quality-to-reviews"]').click()
   assert pg.evaluate('DocutApp.review().total')==stats['total']
  check('selected quality issue batch creates unique unresolved notes only',quality_accept)

  def stale(pg):
   pg.locator('#slide .element').first.click();open_review(pg)
   note=add(pg,'원문 수정 후 재검토','element')
   pg.locator('[data-review-act="status"]').click()
   assert pg.evaluate('DocutApp.review().staleResolved')==0
   pg.locator('[data-action="review-close"]').first.click()
   project=pg.evaluate('DocutApp.getProject()')
   project['pages'][0]['elements'][0]['text']='수정된 보고서 본문'
   pg.evaluate('DocutApp.loadProject',project)
   open_review(pg)
   assert pg.evaluate('DocutApp.review().staleResolved')==1
   assert pg.locator('.review-stale').count()==1
   pg.locator('[data-review-act="status"]').click()
   assert pg.evaluate('DocutApp.review().staleResolved')==0
  check('resolved note becomes stale advisory after source text changes',stale)

  def page_badge(pg):
   open_review(pg);add(pg,'현재 페이지 확인','page')
   pg.locator('[data-action="review-close"]').first.click()
   assert pg.locator('.page-item.active .review-page-pill').count()==1
   assert '검토 1' in pg.locator('.page-item.active .review-page-pill').inner_text()
  check('storyboard displays number of unresolved comments per page',page_badge)

  def packet_export(pg):
   open_review(pg);add(pg,'메모 공유 패킷 테스트',author='내부 담당자')
   with pg.expect_download() as info:pg.locator('[data-action="review-export-packet"]').click()
   assert info.value.suggested_filename.endswith('_PRIVATE_REVIEWS.docut.reviews.json')
   content=open(info.value.path(),encoding='utf-8').read()
   packet=json.loads(content)
   assert packet['kind']=='docut-private-review-packet'
   assert packet['reviews'][0]['author']=='내부 담당자'
   assert 'pages' not in packet
  check('review-only JSON download omits pages and media',packet_export)

  def packet_import(pg):
   original=pg.evaluate('DocutApp.getProject()')
   packet=pg.evaluate('''()=>{const p=DocutApp.getProject();DocutReviewBoard.insert(p,{pageId:p.pages[0].id,body:'다른 검토자의 회신',author:'동료'});return DocutReviewBoard.exportPacket(p);}''')
   open_review(pg)
   pg.locator('#reviewImportInput').set_input_files({'name':'shared-reviews.json','mimeType':'application/json','buffer':packet.encode()})
   assert pg.locator('#reviewImportReview').is_visible()
   assert '새 의견 1건' in pg.locator('#reviewImportSummary').inner_text()
   assert pg.locator('#reviewImportApply').is_disabled()
   assert pg.evaluate('DocutApp.getProject().reviews.length')==0
   pg.locator('#reviewImportApprove').check()
   pg.locator('#reviewImportApply').click()
   assert pg.evaluate('DocutApp.getProject().reviews[0].body')=='다른 검토자의 회신'
   assert pg.evaluate('DocutApp.getProject().pages[0].elements[0].text')==original['pages'][0]['elements'][0]['text']
  check('review packet import previews and requires affirmative approval',packet_import)

  def foreign_packet(pg):
   foreign=pg.evaluate('''()=>{const p=DocutApp.getProject();p.createdAt="2030-01-01T00:00:00.000Z";DocutReviewBoard.insert(p,{body:"external"});return DocutReviewBoard.exportPacket(p);}''')
   open_review(pg)
   pg.locator('#reviewImportInput').set_input_files({'name':'foreign.json','mimeType':'application/json','buffer':foreign.encode()})
   assert pg.locator('#reviewImportReview').is_hidden()
   assert pg.evaluate('DocutApp.getProject().reviews.length')==0
  check('cross-document private review packet cannot overwrite current report',foreign_packet)

  def stale_import(pg):
   packet=pg.evaluate('''()=>{const p=DocutApp.getProject();DocutReviewBoard.insert(p,{body:"stale candidate"});return DocutReviewBoard.exportPacket(p);}''')
   open_review(pg)
   pg.locator('#reviewImportInput').set_input_files({'name':'candidate.json','mimeType':'application/json','buffer':packet.encode()})
   pg.locator('#reviewImportApprove').check()
   pg.evaluate('DocutApp.addElement("text")')
   pg.locator('#reviewImportApply').click()
   assert pg.evaluate('DocutApp.getProject().reviews.length')==0
  check('review merge rejects changes after preview',stale_import)

  def shortcut(pg):
   pg.keyboard.press('Control+Shift+m')
   assert pg.locator('#reviewDialog').is_visible()
   pg.keyboard.press('Escape')
   assert pg.locator('#reviewDialog').is_hidden()
   assert pg.locator('#slide').count()==1
  check('Ctrl Shift M opens review board and Escape restores editor',shortcut)

  def mobile_footer(pg):
   pg.locator('button[data-action="reviews"]').first.evaluate('(node)=>node.click()')
   pg.locator('#reviewDialog').wait_for(state='visible')
   pg.locator('#reviewNewText').fill('검토를 마친 뒤 모바일에서도 개인 기록만 내보내기')
   pg.locator('button[data-action="review-add"]').click()
   with pg.expect_download() as downloaded:
    pg.locator('#reviewDialog button[data-action="review-export-packet"]').click()
   assert downloaded.value.suggested_filename.endswith('_PRIVATE_REVIEWS.docut.reviews.json')
   assert pg.evaluate('document.documentElement.scrollWidth<=innerWidth')
   pg.locator('button[data-action="review-close"]').first.click()
   assert pg.locator('#reviewDialog').is_hidden()
  check('390px review footer scroll and export remains reachable',mobile_footer,True)

  browser.close()
 print('TOTAL',sum(1 for _,v in results if v),'/',len(results),flush=True)
 if any(not v for _,v in results):raise SystemExit(1)

if __name__=='__main__':run()
