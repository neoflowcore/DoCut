"""DoCut V0.22 source-only AI proposal reviews; synthetic localStorage/headless Chromium.
No live GitHub push, deployment, native Brave or real Office artifacts.
"""
import os, traceback
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
            filt=os.environ.get('DOCUT_TEST_FILTER','')
            if filt and not any(w in name for w in filt.split('|')):return
            ctx=browser.new_context(viewport={'width':390,'height':844} if mobile else {'width':1480,'height':900},accept_downloads=True)
            ctx.set_default_timeout(9500)
            page=ctx.new_page();errors=ready(page)
            try:
                fn(page)
                assert not errors,errors
                results.append((name,True));print('PASS',name,flush=True)
            except Exception:
                traceback.print_exc();results.append((name,False));print('FAIL',name,flush=True)
            finally:ctx.close()
        def open_ai(page):
            page.locator('#exportToggle').click()
            page.locator('button[data-action="ai-bridge"]').click()
            page.locator('#aiDialog').wait_for(state='visible')
        def candidate(page,code):
            return page.evaluate('''(code)=>{
              const p=DocutApp.getProject();
              const e=p.pages[0].elements[0];
              if(code==='text'){e.text='New proposal without numeric values';}
              if(code==='numeric'){e.text='숫자 주장: 73%';}
              if(code==='double'){e.text='새 수치 88%';e.source='AI asserted official 2026';}
              if(code==='evidence'){e.source='AI asserted source';}
              if(code==='locked'){e.locked=true;}
              if(code==='markup'){e.text='<svg onload=alert(1)>AI UI test';}
              if(code==='unselected'){p.pages[0].elements[0].text='Change A';p.pages[2].elements[0].text='Change C';}
              return JSON.stringify(p);
            }''',code)
        def load_proposal(page,text):
            open_ai(page)
            page.locator('#aiResponse').fill(text)
            page.locator('button[data-action="ai-analyze"]').click()
            assert 'JSON 분석 실패' not in page.locator('#aiDiffSummary').inner_text()
        def startup(page):
            assert page.locator('.brand em').inner_text()=='0.26.0'
            assert page.evaluate('DocutCore.VERSION')=='0.26.0-development'
            assert page.evaluate('typeof DocutProposal.reviewElements')=='function'
            assert page.locator('#aiRiskConfirm').count()==1
        check('V0.22 loaded with proposal safety capabilities',startup)
        def plain(page):
            before=page.evaluate('JSON.stringify(DocutApp.getProject())')
            load_proposal(page,candidate(page,'text'))
            assert page.locator('input[data-ai-page="0"]').count()==1
            assert not page.locator('input[data-ai-page="0"]').is_checked()
            assert page.locator('#aiApply').is_disabled()
            assert page.locator('.ai-element-diff').count()>=1
            assert before==page.evaluate('JSON.stringify(DocutApp.getProject())')
        check('AI review starts unselected, read only, with element details',plain)
        def open_detail(page):
            load_proposal(page,candidate(page,'text'))
            page.locator('.ai-element-diff summary').first.click()
            assert 'New proposal' in page.locator('.ai-element-diff').first.inner_text()
            assert page.locator('.ai-before-after').count()>=1
        check('before and after text is disclosed in the element detail',open_detail)
        def risk(page):
            p=page.evaluate('DocutApp.getProject()');p['pages'][0]['elements'][0]['text']='2025 기준: 70%'
            page.evaluate('DocutApp.loadProject',p)
            nextp=page.evaluate('DocutApp.getProject()');nextp['pages'][0]['elements'][0]['text']='2025 기준: 80%'
            load_proposal(page,__import__('json').dumps(nextp,ensure_ascii=False))
            page.locator('input[data-ai-page="0"]').check()
            assert page.locator('#aiRiskControls').is_visible()
            assert page.locator('#aiNumericRisk').is_visible()
            assert page.locator('#aiApply').is_disabled()
            page.locator('#aiRiskConfirm').check()
            assert page.locator('#aiApply').is_enabled()
            page.locator('#aiApply').click()
            assert '80%' in page.evaluate('DocutApp.getProject().pages[0].elements[0].text')
            page.locator('button[data-action="undo"]').first.click()
            assert '70%' in page.evaluate('DocutApp.getProject().pages[0].elements[0].text')
        check('numeric-risk consent gates changes and Undo reverses the full page',risk)
        def evidence(page):
            p=page.evaluate('DocutApp.getProject()');p['pages'][0]['elements'][0]['source']='Human record'
            p['pages'][0]['elements'][0]['verified']=True
            page.evaluate('DocutApp.loadProject',p)
            b=page.evaluate('DocutApp.getProject()');b['pages'][0]['elements'][0]['source']='AI verified source'
            load_proposal(page,__import__('json').dumps(b,ensure_ascii=False))
            page.locator('input[data-ai-page="0"]').check()
            assert page.locator('#aiEvidenceRisk').is_visible()
            assert page.locator('#aiApply').is_disabled()
            page.locator('#aiEvidenceApprove').check()
            assert page.locator('#aiApply').is_enabled()
            page.locator('#aiApply').click()
            after=page.evaluate('DocutApp.getProject().pages[0].elements[0]')
            assert after['source']=='AI verified source'
            assert after['verified'] is False
        check('explicit provenance consent and verification invalidation',evidence)
        def locked(page):
            p=page.evaluate('DocutApp.getProject()');p['pages'][0]['elements'][0]['locked']=True
            page.evaluate('DocutApp.loadProject',p)
            b=page.evaluate('DocutApp.getProject()');b['pages'][0]['elements'][0]['text']='Injected overwrite';b['pages'][0]['elements'][0]['locked']=False
            load_proposal(page,__import__('json').dumps(b,ensure_ascii=False))
            assert '잠금 요소' in page.locator('#aiDiffList').inner_text()
            assert page.locator('input[data-ai-page="0"]').is_disabled()
            assert page.locator('#aiApply').is_disabled()
            assert page.evaluate('DocutApp.getProject().pages[0].elements[0].locked') is True
        check('locked element proposals are visible but impossible to approve',locked)
        def page_delete(page):
            p=page.evaluate('DocutApp.getProject()');p['pages'][0]['elements'][0]['locked']=True
            page.evaluate('DocutApp.loadProject',p)
            b=page.evaluate('DocutApp.getProject()');b['pages'].pop(0)
            load_proposal(page,__import__('json').dumps(b,ensure_ascii=False))
            assert '잠긴 요소가 있는 페이지는 삭제 불가' in page.locator('#aiDiffList').inner_text()
            assert page.locator('input[data-ai-page="0"]').is_disabled()
        check('page deletion blocked when an original element is locked',page_delete)
        def risk_two(page):
            p=page.evaluate('DocutApp.getProject()');p['pages'][0]['elements'][0]['text']='KPI is 5';p['pages'][0]['elements'][0]['source']='Official source'
            page.evaluate('DocutApp.loadProject',p)
            b=page.evaluate('DocutApp.getProject()');b['pages'][0]['elements'][0]['text']='KPI is 6';b['pages'][0]['elements'][0]['source']='AI source'
            load_proposal(page,__import__('json').dumps(b,ensure_ascii=False))
            page.locator('input[data-ai-page="0"]').check()
            page.locator('#aiRiskConfirm').check()
            assert page.locator('#aiApply').is_disabled()
            page.locator('#aiEvidenceApprove').check()
            assert page.locator('#aiApply').is_enabled()
        check('both numeric and evidence approvals required independently',risk_two)
        def stale(page):
            load_proposal(page,candidate(page,'text'))
            page.locator('input[data-ai-page="0"]').check()
            assert page.locator('#aiApply').is_enabled()
            page.locator('#aiResponse').fill(page.locator('#aiResponse').input_value()+' ')
            assert page.locator('#aiApply').is_disabled()
            assert '다시 분석' in page.locator('#aiDiffSummary').inner_text()
        check('edits to AI payload invalidate all approvals',stale)
        def export(page):
            load_proposal(page,candidate(page,'text'))
            with page.expect_download() as info:
                page.locator('#aiDiffList~.ai-select-actions button[data-action="ai-export-review"]').click()
            assert info.value.suggested_filename.endswith('_AI_DIFF_REVIEW.txt')
            assert info.value.failure() is None
            assert page.locator('#aiDialog').is_visible()
        check('explicit AI review TXT download leaves project intact',export)
        def markup(page):
            load_proposal(page,candidate(page,'markup'))
            assert page.locator('#aiDialog svg[onload]').count()==0
            assert '&lt;svg' in page.locator('#aiDiffList').inner_html()
        check('untrusted AI element changes cannot inject executable SVG',markup)
        def unselected(page):
            b=candidate(page,'unselected')
            load_proposal(page,b)
            page.locator('input[data-ai-page="0"]').check()
            page.locator('#aiApply').click()
            after=page.evaluate('DocutApp.getProject()')
            assert after['pages'][0]['elements'][0]['text']=='Change A'
            assert after['pages'][2]['elements'][0]['text']!='Change C'
        check('only explicitly selected pages are applied',unselected)
        def mobile(page):
            load_proposal(page,candidate(page,'text'))
            page.locator('.ai-element-diff summary').first.click()
            dialog=page.locator('#aiDialog').bounding_box()
            assert dialog and dialog['width']<=390 and dialog['height']<=844,dialog
            assert page.locator('.ai-detail-item').first.is_visible()
            assert page.locator('#aiApply').is_disabled()
        check('390px mobile AI review remains visible and non-approving',mobile,mobile=True)
        def element_only(page):
            before=page.evaluate('DocutApp.getProject()')
            proposed=page.evaluate('DocutApp.getProject()')
            proposed['pages'][0]['elements'][0]['text']='Just this title'
            proposed['pages'][0]['elements'][1]['text']='Do not change second block'
            load_proposal(page,__import__('json').dumps(proposed,ensure_ascii=False))
            page.locator('.ai-element-diff summary').first.click()
            target=before['pages'][0]['elements'][0]['id']
            page.locator(f'[data-ai-element="{target}"]').check()
            assert page.locator('input[data-ai-page="0"]').is_checked() is False
            assert page.locator('#aiApply').is_enabled()
            page.locator('#aiApply').click()
            out=page.evaluate('DocutApp.getProject()')
            assert out['pages'][0]['elements'][0]['text']=='Just this title'
            assert out['pages'][0]['elements'][1]['text']==before['pages'][0]['elements'][1]['text']
            page.locator('button[data-action="undo"]').first.click()
            assert page.evaluate('DocutApp.getProject().pages[0].elements[0].text')==before['pages'][0]['elements'][0]['text']
        check('only one AI-selected element changes, Undo restores original',element_only)

        def element_risk(page):
            p=page.evaluate('DocutApp.getProject()');p['pages'][0]['elements'][0]['text']='Measure 10%'
            page.evaluate('DocutApp.loadProject',p)
            proposed=page.evaluate('DocutApp.getProject()')
            proposed['pages'][0]['elements'][0]['text']='Measure 20%'
            proposed['pages'][0]['elements'][1]['text']='Text changed without numbers'
            load_proposal(page,__import__('json').dumps(proposed,ensure_ascii=False))
            page.locator('.ai-element-diff summary').first.click()
            chosen=proposed['pages'][0]['elements'][1]['id']
            page.locator(f'[data-ai-element="{chosen}"]').check()
            assert page.locator('#aiNumericRisk').is_hidden()
            assert page.locator('#aiApply').is_enabled()
            page.locator('#aiApply').click()
            assert page.evaluate('DocutApp.getProject().pages[0].elements[0].text')=='Measure 10%'
        check('unselected numeric proposal does not block unrelated safe element',element_risk)

        def element_numeric_ack(page):
            p=page.evaluate('DocutApp.getProject()');p['pages'][0]['elements'][0]['text']='Total 30%'
            page.evaluate('DocutApp.loadProject',p)
            proposed=page.evaluate('DocutApp.getProject()');proposed['pages'][0]['elements'][0]['text']='Total 45%'
            load_proposal(page,__import__('json').dumps(proposed,ensure_ascii=False))
            page.locator('.ai-element-diff summary').first.click()
            page.locator(f'[data-ai-element="{proposed["pages"][0]["elements"][0]["id"]}"]').check()
            assert page.locator('#aiApply').is_disabled()
            page.locator('#aiRiskConfirm').check()
            assert page.locator('#aiApply').is_enabled()
        check('individual numeric change requires a specific consent',element_numeric_ack)

        def evidence_only_element(page):
            p=page.evaluate('DocutApp.getProject()');p['pages'][0]['elements'][0]['source']='Original human source'
            page.evaluate('DocutApp.loadProject',p)
            proposed=page.evaluate('DocutApp.getProject()');proposed['pages'][0]['elements'][0]['source']='Approved new human source'
            load_proposal(page,__import__('json').dumps(proposed,ensure_ascii=False))
            page.locator('.ai-element-diff summary').first.click()
            ident=proposed['pages'][0]['elements'][0]['id']
            page.locator(f'[data-ai-element="{ident}"]').check()
            assert page.locator('#aiEvidenceRisk').is_visible()
            assert page.locator('#aiApply').is_disabled()
            page.locator('#aiEvidenceApprove').check();page.locator('#aiApply').click()
            assert page.evaluate('DocutApp.getProject().pages[0].elements[0].source')=='Approved new human source'
        check('evidence-only granular selection is subject to independent confirmation',evidence_only_element)

        def page_beats_elements(page):
            proposed=page.evaluate('DocutApp.getProject()')
            proposed['pages'][0]['elements'][0]['text']='First';proposed['pages'][0]['elements'][1]['text']='Second'
            load_proposal(page,__import__('json').dumps(proposed,ensure_ascii=False))
            page.locator('.ai-element-diff summary').first.click()
            checkbox=page.locator('[data-ai-element]').first
            checkbox.check();assert checkbox.is_checked()
            page.locator('[data-ai-page="0"]').check()
            assert checkbox.is_disabled() and not checkbox.is_checked()
            page.locator('[data-ai-page="0"]').uncheck()
            assert checkbox.is_enabled() and not checkbox.is_checked()
        check('whole page toggle clears and disables overlapping approvals',page_beats_elements)

        def granular_add(page):
            before=page.evaluate('DocutApp.getProject()')
            proposed=page.evaluate('''() => {const p=DocutApp.getProject();p.pages[0].elements.push(DocutCore.makeBlock('text',40,420,{text:'Inserted by AI'}));return p;}''')
            new_id=proposed['pages'][0]['elements'][-1]['id']
            load_proposal(page,__import__('json').dumps(proposed,ensure_ascii=False))
            page.locator('.ai-element-diff summary').first.click()
            page.locator(f'[data-ai-element="{new_id}"]').check()
            page.locator('#aiApply').click()
            current=page.evaluate('DocutApp.getProject()')
            assert len(current['pages'][0]['elements'])==len(before['pages'][0]['elements'])+1
            assert current['pages'][0]['elements'][-1]['text']=='Inserted by AI'
        check('new AI element can be inserted without replacing the page',granular_add)

        def granular_delete(page):
            before=page.evaluate('DocutApp.getProject()');proposed=page.evaluate('DocutApp.getProject()')
            gone=before['pages'][0]['elements'][1]['id']
            proposed['pages'][0]['elements'].pop(1)
            load_proposal(page,__import__('json').dumps(proposed,ensure_ascii=False))
            page.locator('.ai-element-diff summary').first.click()
            page.locator(f'[data-ai-element="{gone}"]').check()
            page.locator('#aiApply').click()
            assert page.evaluate('(id)=>DocutApp.getProject().pages[0].elements.some(e=>e.id===id)',gone) is False
        check('individual deletion leaves other page elements unchanged',granular_delete)

        def partial_review_export(page):
            proposed=page.evaluate('DocutApp.getProject()');proposed['pages'][0]['elements'][1]['text']='Partial review note'
            load_proposal(page,__import__('json').dumps(proposed,ensure_ascii=False))
            page.locator('.ai-element-diff summary').first.click()
            chosen=proposed['pages'][0]['elements'][1]['id'];page.locator(f'[data-ai-element="{chosen}"]').check()
            with page.expect_download() as event:
                page.locator('[data-action="ai-export-review"]').click()
            artifact=event.value
            content=open(artifact.path(),encoding='utf-8').read()
            assert chosen in content and 'Selected element IDs:' in content
            assert 'Partial review note' in content
            assert '"schema":3' not in content
        check('granular decision TXT records selected ID without project JSON',partial_review_export)

        def mobile_granular(page):
            proposed=page.evaluate('DocutApp.getProject()');proposed['pages'][0]['elements'][1]['text']='Mobile granular changes'
            load_proposal(page,__import__('json').dumps(proposed,ensure_ascii=False))
            page.locator('.ai-element-diff summary').first.click()
            box=page.locator('#aiDialog').bounding_box()
            assert box['width']<=390 and box['height']<=844
            assert page.locator('.ai-element-choice').first.is_visible()
            assert page.locator('#aiApply').is_disabled()
        check('390px granular controls remain reachable without automatic approval',mobile_granular,mobile=True)
        def granular_settings(page):
            old=page.evaluate('DocutApp.getProject()')
            proposed=page.evaluate('DocutApp.getProject()')
            proposed['title']='Selective setting change';proposed['theme']='ambient';proposed['master']['footer']='New footer from AI'
            load_proposal(page,__import__('json').dumps(proposed,ensure_ascii=False))
            assert page.locator('[data-ai-setting]').count()==3
            assert page.locator('#aiApply').is_disabled()
            page.locator('[data-ai-setting="title"]').check()
            assert page.locator('#aiApply').is_enabled()
            page.locator('#aiApply').click()
            updated=page.evaluate('DocutApp.getProject()')
            assert updated['title']=='Selective setting change'
            assert updated['theme']==old['theme']
            assert updated['master']['footer']==old['master']['footer']
        check('shared AI document settings can be separately approved',granular_settings)

        def title_numeric_setting(page):
            proposed=page.evaluate('DocutApp.getProject()')
            proposed['title']='Achieved 98% in 2026'
            proposed['master']['footer']='Verified forecast 90%'
            load_proposal(page,__import__('json').dumps(proposed,ensure_ascii=False))
            assert page.locator('[data-ai-setting="title"]').count()==1
            page.locator('[data-ai-setting="title"]').check()
            assert page.locator('#aiNumericRisk').is_visible()
            assert page.locator('#aiApply').is_disabled()
            page.locator('#aiRiskConfirm').check()
            assert page.locator('#aiApply').is_enabled()
            page.locator('[data-ai-setting="master"]').check()
            assert not page.locator('#aiRiskConfirm').is_checked(), 'Expanding the approval scope must reset acknowledgment'
            assert page.locator('#aiApply').is_disabled()
            page.locator('#aiRiskConfirm').check()
            page.locator('#aiApply').click()
            updated=page.evaluate('DocutApp.getProject()')
            assert updated['title']=='Achieved 98% in 2026'
            assert updated['master']['footer']=='Verified forecast 90%'
        check('shared title and master footer numeric claims are gated by scope-bound consent',title_numeric_setting)

        def new_numeric_claim(page):
            original=page.evaluate('DocutApp.getProject()')
            original['pages'][0]['elements'][1]['text']='No quantitative claim'
            page.evaluate('DocutApp.loadProject',original)
            proposed=page.evaluate('DocutApp.getProject()')
            proposed['pages'][0]['elements'][1]['text']='New claim of 42 percent'
            load_proposal(page,__import__('json').dumps(proposed,ensure_ascii=False))
            page.locator('.ai-element-diff summary').first.click()
            page.locator(f'[data-ai-element="{proposed["pages"][0]["elements"][1]["id"]}"]').check()
            assert page.locator('#aiNumericRisk').is_visible()
            assert page.locator('#aiApply').is_disabled()
            page.locator('#aiRiskConfirm').check()
            assert page.locator('#aiApply').is_enabled()
        check('new number in previously nonnumeric text requires review acknowledgment',new_numeric_claim)

        def inserted_citation(page):
            proposed=page.evaluate("() => {const p=DocutApp.getProject();p.pages[0].elements.push(DocutCore.makeBlock('text',40,420,{text:'Cited AI note',source:'AI invented source'}));return p;}")
            new_id=proposed['pages'][0]['elements'][-1]['id']
            load_proposal(page,__import__('json').dumps(proposed,ensure_ascii=False))
            page.locator('.ai-element-diff summary').first.click()
            page.locator(f'[data-ai-element="{new_id}"]').check()
            assert page.locator('#aiEvidenceRisk').is_visible()
            assert page.locator('#aiApply').is_disabled()
            assert 'AI invented source' in page.locator('#aiDiffList').inner_text()
            page.locator('#aiEvidenceApprove').check()
            assert page.locator('#aiApply').is_enabled()
        check('new cited AI element needs separate provenance approval',inserted_citation)

        def setting_review_txt(page):
            proposed=page.evaluate('DocutApp.getProject()')
            proposed['title']='AI page title';proposed['theme']='ambient'
            load_proposal(page,__import__('json').dumps(proposed,ensure_ascii=False))
            page.locator('[data-ai-setting="title"]').check()
            with page.expect_download() as event:page.locator('[data-action="ai-export-review"]').click()
            text=open(event.value.path(),encoding='utf-8').read()
            assert 'Setting title [selected]' in text
            assert 'Setting theme [not selected]' in text
            assert 'AI page title' in text
        check('AI review TXT includes exact setting choices and before-after',setting_review_txt)

        def scoped_consent(page):
            current=page.evaluate('DocutApp.getProject()')
            current['pages'][0]['elements'][0]['text']='Old 10%'
            current['pages'][0]['elements'][1]['text']='Old 20%'
            page.evaluate('DocutApp.loadProject',current)
            proposed=page.evaluate('DocutApp.getProject()')
            proposed['pages'][0]['elements'][0]['text']='New 11%'
            proposed['pages'][0]['elements'][1]['text']='New 22%'
            load_proposal(page,__import__('json').dumps(proposed,ensure_ascii=False))
            page.locator('.ai-element-diff summary').first.click()
            page.locator(f'[data-ai-element="{proposed["pages"][0]["elements"][0]["id"]}"]').check()
            page.locator('#aiRiskConfirm').check()
            assert page.locator('#aiApply').is_enabled()
            page.locator(f'[data-ai-element="{proposed["pages"][0]["elements"][1]["id"]}"]').check()
            assert not page.locator('#aiRiskConfirm').is_checked(), 'Expanded selection reused an obsolete risk acknowledgment'
            assert page.locator('#aiApply').is_disabled()
            page.locator('#aiRiskConfirm').check()
            assert page.locator('#aiApply').is_enabled()
            page.locator('[data-ai-element]').first.uncheck()
            assert not page.locator('#aiRiskConfirm').is_checked(), 'Narrowed selection must also refresh the scope acknowledgment'
            assert page.locator('#aiApply').is_disabled()
        check('risk consent is bound to exact selected elements and resets on scope changes',scoped_consent)

        def all_changes_visible(page):
            proposed=page.evaluate('''()=>{
              const p=DocutApp.getProject();
              for(let i=0;i<55;i++)p.pages[0].elements.push(DocutCore.makeBlock('text',10,10,{text:'Review new element'}));
              return p;
            }''')
            last=proposed['pages'][0]['elements'][-1]['id']
            load_proposal(page,__import__('json').dumps(proposed,ensure_ascii=False))
            page.locator('.ai-element-diff summary').first.click()
            group=page.locator('.ai-element-diff').first
            assert group.locator('li.ai-detail-item:visible').count()==22
            assert page.locator('input[data-ai-page="0"]').is_disabled()
            while group.locator('[data-ai-more]').count():
                group.locator('[data-ai-more]').click()
            assert group.locator('li.ai-detail-item:visible').count()==55
            assert page.locator('input[data-ai-page="0"]').is_enabled()
            page.locator(f'[data-ai-element="{last}"]').check()
            assert page.locator('#aiApply').is_enabled(), page.locator('#aiRiskStatus').inner_text()
            page.locator('#aiApply').click()
            assert page.evaluate('(id)=>DocutApp.getProject().pages[0].elements.some(e=>e.id===id)',last)
        check('all changed elements remain selectable beyond the first 22 and full-page approval is gated',all_changes_visible)

        def full_details_are_inert(page):
            proposed=page.evaluate('DocutApp.getProject()')
            proposed['pages'][0]['elements'][0]['text']='<svg onload=alert(1)>full text </svg>'
            proposed['pages'][0]['elements'][0]['source']='AI citation that must not execute'
            load_proposal(page,__import__('json').dumps(proposed,ensure_ascii=False))
            page.locator('.ai-element-diff summary').first.click()
            button=page.locator('.ai-full-toggle').first
            button.click()
            details=page.locator('.ai-full-text').first
            assert details.is_visible()
            assert '<svg onload=alert(1)>' in details.inner_text()
            assert 'AI citation that must not execute' in details.inner_text()
            assert details.locator('svg').count()==0
            assert button.get_attribute('aria-expanded')=='true'
            button.click()
            assert details.is_hidden()
        check('full untruncated body and source details render as inert text only',full_details_are_inert)

        def metadata_diff(page):
            proposed=page.evaluate('DocutApp.getProject()')
            proposed['pages'][0]['headline']='Target 90%'
            proposed['pages'][0]['transition']='slide'
            load_proposal(page,__import__('json').dumps(proposed,ensure_ascii=False))
            assert page.locator('.ai-meta-diff').first.is_visible()
            assert 'headline' in page.locator('.ai-meta-diff').first.inner_text()
            assert 'transition' in page.locator('.ai-meta-diff').first.inner_text()
            page.locator('input[data-ai-page="0"]').check()
            assert page.locator('#aiApply').is_disabled()
            assert page.locator('#aiNumericRisk').is_visible()
            page.locator('#aiRiskConfirm').check()
            page.locator('#aiApply').click()
            assert page.evaluate('DocutApp.getProject().pages[0].headline')=='Target 90%'
            assert page.evaluate('DocutApp.getProject().pages[0].transition')=='slide'
        check('page-level titles, numeric headlines and transitions show before-after and require consent',metadata_diff)

        def ai_backup_failure(page):
            baseline=page.evaluate('JSON.stringify(DocutApp.getProject())')
            load_proposal(page,candidate(page,'text'))
            page.locator('input[data-ai-page="0"]').check()
            assert page.locator('#aiApply').is_enabled()
            page.evaluate("DocutPersistence.makeBackup=()=>({status:'failed',error:'simulated full storage'})")
            page.locator('#aiApply').click()
            assert page.locator('#aiDialog').is_visible()
            assert page.evaluate('JSON.stringify(DocutApp.getProject())')==baseline
            assert '백업을 보존하지 못했습니다' in page.locator('#toast').inner_text()
            with page.expect_download() as downloaded:
                page.locator('#aiDialog [data-action="export-working-copy"]').click()
            assert downloaded.value.suggested_filename.endswith('_UNSAVED.docut.json')
            page.locator('#aiApply').click()
            assert page.evaluate('DocutApp.getProject().pages[0].elements[0].text')=='New proposal without numeric values'
        check('AI proposal cannot replace a document when the pre-apply backup fails',ai_backup_failure)

        def rewrite_backup_failure(page):
            current=page.evaluate('DocutApp.getProject()')
            current['pages'][0]['elements'][1]['text']='Risk keyword'
            page.evaluate('DocutApp.loadProject',current)
            page.locator('[data-action="search"]').first.click()
            page.locator('#rewriteQuery').fill('Risk')
            page.locator('#rewriteReplacement').fill('Improvement')
            page.locator('[data-action="rewrite-preview"]').click()
            page.locator('input[data-rewrite-id]').first.check()
            page.evaluate("DocutPersistence.makeBackup=()=>({status:'failed',error:'simulated quota'})")
            page.locator('[data-action="rewrite-apply"]').click()
            assert page.evaluate('DocutApp.getProject().pages[0].elements[1].text')=='Risk keyword'
            assert page.locator('#searchDialog').is_visible()
            with page.expect_download() as downloaded:
                page.locator('#searchDialog [data-action="export-working-copy"]').click()
            assert downloaded.value.suggested_filename.endswith('_UNSAVED.docut.json')
            page.locator('[data-action="rewrite-apply"]').click()
            assert page.evaluate('DocutApp.getProject().pages[0].elements[1].text')=='Improvement keyword'
        check('text bulk rewrite is deferred if its pre-change backup fails',rewrite_backup_failure)

        def csv_backup_failure(page):
            page.evaluate('DocutApp.addElement("stat")')
            page.locator('[data-stat-kind]').select_option('forest')
            with page.expect_file_chooser() as chooser:page.locator('[data-action="import-csv"]').click()
            chooser.value.set_files({'name':'sample.csv','mimeType':'text/csv','buffer':'항목,추정치,하한,상한\n정책 A,1.1,0.9,1.5'.encode('utf-8')})
            # File.text() -> Promise -> modal: await UI readiness rather than racing file read.
            page.locator('#csvReviewDialog').wait_for(state='visible')
            page.evaluate("DocutPersistence.makeBackup=()=>({status:'failed',error:'simulated quota'})")
            page.locator('[data-action="csv-apply"]').click()
            assert page.evaluate('DocutApp.getProject().pages[0].elements.at(-1).data.rows.length')==0
            assert page.locator('#csvReviewDialog').is_visible()
            with page.expect_download() as downloaded:
                page.locator('#csvReviewDialog [data-action="export-working-copy"]').click()
            assert downloaded.value.suggested_filename.endswith('_UNSAVED.docut.json')
            page.locator('[data-action="csv-apply"]').click()
            assert page.evaluate('DocutApp.getProject().pages[0].elements.at(-1).data.rows.length')==1
        check('CSV import is deferred if its pre-change backup fails',csv_backup_failure)

        def native_import_backup_failure(page):
            import_data=page.evaluate('JSON.stringify(DocutCore.createProject(2))')
            with page.expect_file_chooser() as chooser:page.locator('[data-action="import"]').first.click()
            chooser.value.set_files({'name':'source.json','mimeType':'application/json','buffer':import_data.encode('utf-8')})
            # File.text() -> Promise -> modal: await UI readiness rather than racing file read.
            page.locator('#importModeDialog').wait_for(state='visible')
            before=page.evaluate('DocutApp.getProject().pages.length')
            page.evaluate("DocutPersistence.makeBackup=()=>({status:'failed',error:'simulated quota'})")
            page.locator('#importModeDialog [data-action="import-replace"]').click()
            assert page.evaluate('DocutApp.getProject().pages.length')==before
            assert page.locator('#importModeDialog').is_visible()
            with page.expect_download() as downloaded:
                page.locator('#importModeDialog [data-action="export-working-copy"]').click()
            assert downloaded.value.suggested_filename.endswith('_UNSAVED.docut.json')
            page.locator('#importModeDialog [data-action="import-replace"]').click()
            assert page.evaluate('DocutApp.getProject().pages.length')==2
        check('whole report replacement preserves current pages when backup fails',native_import_backup_failure)
        browser.close()
    passed=sum(x for _,x in results)
    print('V0.22 Chromium:',passed,'/',len(results),'PASS',flush=True)
    if passed!=len(results):raise SystemExit(1)

if __name__=='__main__':run()
