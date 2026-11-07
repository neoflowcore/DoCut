"""V0.15 AI selective-apply / provenance browser tests. Manual only, never CI."""
from playwright.sync_api import sync_playwright
from browser_recovery import load
import traceback
import os


def run():
    results = []
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        def check(name, fn, viewport=None):
            part,total=(int(x) for x in os.environ.get("DOCUT_TEST_SHARD","0/1").split("/"))
            if not hasattr(check,"position"):check.position=0
            idx=check.position;check.position+=1
            if idx%total!=part:return
            print('TEST',name,flush=True)
            page=browser.new_page(viewport=viewport or {'width':1500,'height':900},accept_downloads=False)
            page.set_default_timeout(6000)
            try:
                errors=load(page)
                fn(page)
                assert not errors,errors
                results.append((name,'PASS'))
            except Exception as e:
                results.append((name,'FAIL '+str(e)))
                traceback.print_exc()
            finally:page.close()

        def provenance_fields(pg):
            pg.locator('#slide .element').first.click()
            pg.locator('[data-adv="element.source"]').fill('2026 official source')
            pg.locator('[data-adv="element.source"]').press('Tab')
            pg.locator('[data-adv="element.asOfDate"]').fill('2026-10-31')
            pg.locator('[data-adv="element.asOfDate"]').press('Tab')
            pg.locator('[data-adv="element.unit"]').fill('%')
            pg.locator('[data-adv="element.unit"]').press('Tab')
            pg.locator('[data-adv="element.evidence"]').fill('LTV=loan / price × 100')
            pg.locator('[data-adv="element.evidence"]').press('Tab')
            pg.locator('[data-adv="element.verified"]').check()
            data=pg.evaluate('DocutApp.getProject().pages[0].elements[0]')
            assert data['source']=='2026 official source',data
            assert data['asOfDate']=='2026-10-31'
            assert data['unit']=='%'
            assert 'LTV' in data['evidence']
            assert data['verified'] is True
            pg.locator('[data-adv="element.unit"]').fill('basis points')
            pg.locator('[data-adv="element.unit"]').press('Tab')
            assert pg.evaluate('DocutApp.getProject().pages[0].elements[0].verified') is False
            pg.locator('[data-action="undo"]').first.click()
            assert pg.evaluate('DocutApp.getProject().pages[0].elements[0].verified') is True
        check('source/date/unit/evidence editor, invalidation and undo',provenance_fields)

        def selective_ai(pg):
            pg.evaluate('''() => {
              const current=DocutApp.getProject();
              current.pages[0].elements[0].source='Record 2026';
              current.pages[0].elements[0].asOfDate='2026-09-30';
              current.pages[0].elements[0].unit='persons';
              current.pages[0].elements[0].evidence='Official denominator';
              current.pages[0].elements[0].verified=true;
              DocutApp.loadProject(current);
            }''')
            proposal=pg.evaluate('''() => {
              const p=DocutApp.getProject();
              p.title='Proposed changed title';
              p.pages[0].elements[0].text='New page 1';
              p.pages[0].elements[0].source='';
              p.pages[0].elements[0].asOfDate='';
              p.pages[0].elements[0].unit='';
              p.pages[0].elements[0].evidence='';
              p.pages[1].elements[0].text='Changed page 2';
              return JSON.stringify(p);
            }''')
            pg.locator('#exportToggle').click()
            pg.locator('[data-action="ai-bridge"]').click()
            pg.locator('#aiResponse').fill(proposal)
            pg.locator('[data-action="ai-analyze"]').click()
            assert pg.locator('input[data-ai-page]:not([disabled])').count()==2
            assert pg.locator('#aiApply').is_disabled()
            pg.locator('input[data-ai-page="0"]').check()
            assert pg.locator('#aiApply').is_disabled()
            assert pg.locator('#aiNumericRisk').is_visible()
            pg.locator('#aiRiskConfirm').check()
            assert pg.locator('#aiApply').is_enabled()
            pg.locator('[data-action="ai-apply"]').click()
            if pg.locator('#aiDialog').is_visible():
                with pg.expect_download() as backup:
                    pg.locator('#aiDialog [data-action="export-working-copy"]').click()
                assert backup.value.suggested_filename.endswith('_UNSAVED.docut.json')
                pg.locator('[data-action="ai-apply"]').click()
            current=pg.evaluate('DocutApp.getProject()')
            assert current['title']!='Proposed changed title'
            assert current['pages'][0]['elements'][0]['text']=='New page 1'
            assert current['pages'][0]['elements'][0]['asOfDate']=='2026-09-30'
            assert current['pages'][0]['elements'][0]['source']=='Record 2026'
            assert current['pages'][0]['elements'][0]['verified'] is False
            assert current['pages'][1]['elements'][0]['text']!='Changed page 2'
            pg.locator('[data-action="undo"]').first.click()
            assert pg.evaluate('DocutApp.getProject().pages[0].elements[0].verified') is True
            assert pg.evaluate('DocutApp.getProject().pages[0].elements[0].text')!='New page 1'
        check('AI page selection, protected provenance, unselected pages, one-step undo',selective_ai)

        def ai_response_stale(pg):
            pg.locator('#exportToggle').click()
            pg.locator('[data-action="ai-bridge"]').click()
            raw=pg.evaluate('JSON.stringify(DocutApp.getProject())')
            pg.locator('#aiResponse').fill(raw)
            pg.locator('[data-action="ai-analyze"]').click()
            pg.locator('#aiResponse').fill(raw+' ')
            assert pg.locator('#aiApply').is_disabled()
            assert '다시 분석' in pg.locator('#aiDiffSummary').inner_text()
        check('edits to AI response invalidate approval',ai_response_stale)

        def mobile_ai(pg):
            pg.locator('#exportToggle').click()
            pg.locator('[data-action="ai-bridge"]').click()
            raw=pg.evaluate('''() => {
              const p=DocutApp.getProject();p.pages[0].elements[0].text='Mobile edit';return JSON.stringify(p);
            }''')
            pg.locator('#aiResponse').fill(raw)
            pg.locator('[data-action="ai-analyze"]').click()
            dialog=pg.locator('#aiDialog')
            box=dialog.bounding_box()
            assert box and box['width']<=410 and box['height']<=700,box
            assert pg.locator('input[data-ai-page="0"]').is_visible()
            assert pg.locator('#aiApply').is_disabled()
        check('mobile AI review is reachable and non-approving by default',mobile_ai,{'width':390,'height':720})

        def external_provenance(pg):
            source='<html><body><section class="page"><h1>Evidence</h1><p data-source="Annual report 2026" data-as-of-date="2026-10-01" data-unit="KRW" data-evidence="Net ÷ total">3.5</p></section></body></html>'
            data=pg.evaluate('(raw)=>DocutCSSImport.importHTML(raw)',source)
            el=next(b for b in data['project']['pages'][0]['elements'] if b['text']=='3.5')
            assert el['source']=='Annual report 2026'
            assert el['asOfDate']=='2026-10-01'
            assert el['unit']=='KRW'
            assert el['evidence']=='Net ÷ total'
            assert el['verified'] is False
            bulk='<html><body><section class="page">'+''.join(f'<p>Content {i}</p>' for i in range(103))+'</section></body></html>'
            result=pg.evaluate('(raw)=>DocutCSSImport.importHTML(raw)',bulk)
            assert any('100 content nodes' in x for x in result['warnings']),result['warnings']
            assert len(result['project']['pages'][0]['elements'])==100
            overlong='<html><body><section class="page"><p>'+('A'*12100)+'</p></section></body></html>'
            cut=pg.evaluate('(raw)=>DocutCSSImport.importHTML(raw)',overlong)
            assert any('12000 characters' in x for x in cut['warnings']),cut['warnings']
            assert cut['project']['pages'][0]['elements'][0]['text']==('A'*12000)
        check('external static HTML provenance and truncation warnings',external_provenance)

        def native_large_html(pg):
            outcome=pg.evaluate('''() => {
              const p=DocutCore.createProject(1),el=DocutCore.makeBlock('image',50,90);
              el.data={src:'data:image/png;base64,'+'A'.repeat(2800000),alt:'large local image'};
              p.pages[0].elements.push(el);
              const exported=DocutExporter.exportHTML(p);
              const recovered=DocutExporter.decodeHTML(exported);
              return {bytes:exported.length,mode:recovered.mode,sourceLength:recovered.project.pages[0].elements.at(-1).data.src.length};
            }''')
            assert outcome['bytes']>5_000_000,outcome
            assert outcome['mode']=='native',outcome
            assert outcome['sourceLength']>2_800_000,outcome
        check('native HTML over 5MB round-trips without silent source truncation',native_large_html)

        def preview_import(pg):
            original=pg.evaluate('JSON.stringify(DocutApp.getProject().pages)')
            html='<html><body><section class="page"><h1>Imported summary</h1><p>Important data</p><script>window.__unsafe_import=1</script></section></body></html>'
            f={'name':'local_report.html','mimeType':'text/html','buffer':html.encode('utf-8')}
            pg.locator('#importInput').set_input_files(f)
            pg.locator('#importModeDialog').wait_for(state='visible')
            assert '페이지' in pg.locator('#importModeSummary').inner_text()
            assert 'Scripts' in pg.locator('#importModeWarnings').inner_text()
            assert pg.evaluate('window.__unsafe_import') is None
            assert original==pg.evaluate('JSON.stringify(DocutApp.getProject().pages)')
            pg.locator('[data-action="close-import-mode"]').last.click()
            assert original==pg.evaluate('JSON.stringify(DocutApp.getProject().pages)')
            pg.locator('#importInput').set_input_files(f)
            pg.locator('#importModeDialog').wait_for(state='visible')
            assert pg.locator('[data-action="import-append"]').is_disabled()
            pg.locator('#importModeAcknowledge').check()
            pg.locator('[data-action="import-append"]').click()
            if pg.locator('#importModeDialog').is_visible():
                with pg.expect_download() as backup:
                    pg.locator('#importModeDialog [data-action="export-working-copy"]').click()
                assert backup.value.suggested_filename.endswith('_UNSAVED.docut.json')
                pg.locator('[data-action="import-append"]').click()
            assert pg.evaluate('DocutApp.getProject().pages.length')==6
            assert 'Imported summary' in pg.evaluate('DocutApp.getProject().pages[5].tab')
            pg.locator('[data-action="undo"]').first.click()
            assert pg.evaluate('JSON.stringify(DocutApp.getProject().pages)')==original
        check('local HTML import previews loss warnings; cancel leaves file intact; append undoes',preview_import)

        def report_source_panel(pg):
            report=pg.evaluate('''() => {
              const p=DocutCore.createProject(2,'policy');
              p.pages[0].elements[0].text='Published LTV ratio';
              p.pages[0].elements[0].source='Official report, page 7';
              p.pages[0].elements[0].asOfDate='2026-10-31';
              p.pages[0].elements[0].unit='%';
              p.pages[0].elements[0].evidence='Numerator / denominator';
              p.pages[1].elements[0].text='Separate sourced evidence';
              p.pages[1].elements[0].source='<img src=x onerror=window.__sourceXSS=1>';
              return DocutExporter.exportHTML(p);
            }''')
            viewer=browser.new_page()
            viewer_errors=[]
            viewer.on('pageerror',lambda e:viewer_errors.append(str(e)))
            assert 'id="docut-sources"' in report
            viewer.set_content(report, wait_until='load')
            assert viewer.locator('#sources').is_visible()
            viewer.locator('#sources').click()
            assert viewer.locator('#sourcePanel').is_visible()
            assert 'Official report, page 7' in viewer.locator('#sourceRows').inner_text()
            assert '2026-10-31' in viewer.locator('#sourceRows').inner_text()
            assert 'Numerator / denominator' in viewer.locator('#sourceRows').inner_text()
            viewer.locator('#next').click()
            assert 'Separate sourced evidence' in viewer.locator('#sourceRows').inner_text()
            assert 'Official report, page 7' not in viewer.locator('#sourceRows').inner_text()
            assert viewer.locator('#sourceRows img').count()==0
            assert viewer.evaluate('window.__sourceXSS') is None
            viewer.keyboard.press('Escape')
            assert viewer.locator('#sourcePanel').is_hidden()
            assert viewer.locator('#sources').get_attribute('aria-expanded')=='false'
            assert not viewer_errors,viewer_errors
            viewer.close()
        check('standalone report sources, per-page provenance, keyboard close, XSS inert',report_source_panel)

        def no_sources_report(pg):
            html=pg.evaluate('''() => {const p=DocutCore.createProject(1);p.pages.forEach(pg=>pg.elements.forEach(e=>{e.source='';e.asOfDate='';e.unit='';e.evidence=''}));return DocutExporter.exportHTML(p)}''')
            viewer=browser.new_page()
            viewer_errors=[]
            viewer.on('pageerror',lambda e:viewer_errors.append(str(e)))
            assert 'id="sources"' not in html
            assert 'id="docut-sources"' not in html
            viewer.set_content(html,wait_until='load')
            assert viewer.locator('#next').is_visible()
            assert not viewer_errors,viewer_errors
            viewer.close()
        check('standalone report hides source UI when no provenance',no_sources_report)

        def markdown_ai_numeric_review(pg):
            pg.evaluate('''() => {
              const current=DocutApp.getProject();current.pages[0].elements[0].text='Current loan ratio 70%';
              DocutApp.loadProject(current);
            }''')
            proposal=pg.evaluate('''() => {
              const p=DocutApp.getProject();p.pages[0].elements[0].text='Proposed loan ratio 60%';
              return 'AI analysis\\n```json\\n'+JSON.stringify({project:p})+'\\n```\\nPlease review';
            }''')
            pg.locator('#exportToggle').click()
            pg.locator('[data-action="ai-bridge"]').click()
            pg.locator('#aiResponse').fill(proposal)
            pg.locator('[data-action="ai-analyze"]').click()
            assert 'Markdown JSON (project wrapper)' in pg.locator('#aiDiffSummary').inner_text()
            assert '코드 블록 밖 설명' in pg.locator('#aiDiffSummary').inner_text()
            label=pg.locator('.ai-number-alert').first.inner_text()
            assert '70%' in label and '60%' in label,label
            assert pg.locator('#aiApply').is_disabled()
        check('Markdown AI JSON wrapper and visible numeric-difference warnings',markdown_ai_numeric_review)

        def mobile_report_sources(pg):
            exported=pg.evaluate('''() => {
              const p=DocutCore.createProject(1);p.pages[0].elements[0].source='Mobile reference';
              return DocutExporter.exportHTML(p);
            }''')
            viewer=browser.new_page()
            viewer.set_viewport_size({'width':390,'height':720})
            viewer_errors=[]
            viewer.on('pageerror',lambda e:viewer_errors.append(str(e)))
            viewer.set_content(exported,wait_until='load')
            viewer.locator('#sources').click()
            panel=viewer.locator('#sourcePanel').bounding_box()
            assert panel and panel['x']>=0 and panel['x']+panel['width']<=391,panel
            assert 'Mobile reference' in viewer.locator('#sourceRows').inner_text()
            viewer.locator('#sourceClose').click()
            assert viewer.locator('#sourcePanel').is_hidden()
            assert not viewer_errors,viewer_errors
            viewer.close()
        check('390px standalone report source panel works without offscreen overflow',mobile_report_sources,{'width':390,'height':720})

        def csv_preview_cancel_apply_undo(pg):
            pg.evaluate('''() => {
              const p=DocutCore.createProject(1);p.pages[0].elements=[DocutCore.makeBlock('table',100,160,{data:{rows:[['Year','Value'],['2025','90']]},source:'Old source',verified:true})];
              DocutApp.loadProject(p);
            }''')
            pg.locator('#slide .element[data-type="table"]').click()
            original=pg.evaluate('JSON.stringify(DocutApp.getProject().pages[0].elements[0])')
            file={'name':'budget_2026.csv','mimeType':'text/csv','buffer':b'Year,Value\n2025,100\n2026,130'}
            pg.locator('#csvInput').set_input_files(file)
            pg.locator('#csvReviewDialog').wait_for(state='visible')
            assert '3행' in pg.locator('#csvReviewSummary').inner_text()
            assert '130' in pg.locator('#csvReviewPreview').inner_text()
            assert pg.evaluate('JSON.stringify(DocutApp.getProject().pages[0].elements[0])')==original
            pg.locator('[data-action="csv-cancel"]').last.click()
            assert pg.evaluate('JSON.stringify(DocutApp.getProject().pages[0].elements[0])')==original
            pg.locator('#csvInput').set_input_files(file)
            pg.locator('#csvReviewDialog').wait_for(state='visible')
            pg.locator('[data-action="csv-apply"]').click()
            if pg.locator('#csvReviewDialog').is_visible():
                with pg.expect_download() as backup:
                    pg.locator('#csvReviewDialog [data-action="export-working-copy"]').click()
                assert backup.value.suggested_filename.endswith('_UNSAVED.docut.json')
                pg.locator('[data-action="csv-apply"]').click()
            current=pg.evaluate('DocutApp.getProject().pages[0].elements[0]')
            assert current['data']['rows'][-1]==['2026','130']
            assert current['source']=='budget_2026.csv'
            assert current['verified'] is False
            pg.locator('[data-action="undo"]').first.click()
            assert pg.evaluate('JSON.stringify(DocutApp.getProject().pages[0].elements[0])')==original
        check('CSV preview, cancel without changes, explicit apply and undo',csv_preview_cancel_apply_undo)

        def csv_invalid_retains_source(pg):
            pg.evaluate('''() => {
              const p=DocutCore.createProject(1);p.pages[0].elements=[DocutCore.makeBlock('bar',80,170,{source:'Prior evidence',verified:true})];
              DocutApp.loadProject(p);
            }''')
            pg.locator('#slide .element[data-type="bar"]').click()
            old=pg.evaluate('JSON.stringify(DocutApp.getProject().pages[0].elements[0])')
            invalid='\n'.join(f'Category{i},{i}' for i in range(14))
            pg.locator('#csvInput').set_input_files({'name':'too_many.csv','mimeType':'text/csv','buffer':invalid.encode('utf-8')})
            assert pg.locator('#csvReviewDialog').is_hidden()
            assert pg.evaluate('JSON.stringify(DocutApp.getProject().pages[0].elements[0])')==old
        check('CSV oversize series rejected with no mutation or preview approval',csv_invalid_retains_source)

        def guarded_manual_series(pg):
            pg.evaluate('''() => {
                const project=DocutCore.createProject(1);
                project.pages[0].elements=[DocutCore.makeBlock('bar',80,140,{source:'Original 2026',verified:true,data:{labels:['A','B'],values:[10,-3]}})];
                DocutApp.loadProject(project);
            }''')
            pg.locator('#slide .element[data-type="bar"]').click()
            original=pg.evaluate('JSON.stringify(DocutApp.getProject().pages[0].elements[0])')
            field=pg.locator('[data-path="chart.series"]')
            field.fill('One: 12\nBad value\nTwo: 30')
            field.press('Tab')
            assert pg.evaluate('JSON.stringify(DocutApp.getProject().pages[0].elements[0])')==original
            assert '입력값 보존' in pg.locator('#toast').inner_text()
            field=pg.locator('[data-path="chart.series"]')
            field.fill('One: 12\nTwo: -30')
            field.press('Tab')
            updated=pg.evaluate('DocutApp.getProject().pages[0].elements[0]')
            assert updated['data']['values']==[12,-30],updated
            assert updated['verified'] is False
            assert updated['source']=='Original 2026'
            pg.locator('[data-action="undo"]').first.click()
            assert pg.evaluate('JSON.stringify(DocutApp.getProject().pages[0].elements[0])')==original
        check('manual chart series rejects invalid lines without losing source or Undo',guarded_manual_series)

        def reject_oversized_table_cell(pg):
            pg.evaluate('''() => {const p=DocutCore.createProject(1);p.pages[0].elements=[DocutCore.makeBlock('table',100,150,{source:'Source 2026',verified:true,data:{rows:[['Name','Value'],['A','15']]}})];DocutApp.loadProject(p)}''')
            pg.locator('#slide .element[data-type="table"]').click()
            original=pg.evaluate('JSON.stringify(DocutApp.getProject().pages[0].elements[0])')
            field=pg.locator('input[data-table-value="1:1"]')
            field.fill('X'*401)
            field.press('Tab')
            assert pg.evaluate('JSON.stringify(DocutApp.getProject().pages[0].elements[0])')==original
            assert '400글자' in pg.locator('#toast').inner_text()
            clipboard='A\t'+'Y'*401+'\nC\tD'
            field=pg.locator('input[data-table-value="0:0"]')
            field.evaluate('''(el,body) => {const data=new DataTransfer();data.setData('text/plain',body);el.dispatchEvent(new ClipboardEvent('paste',{clipboardData:data,bubbles:true,cancelable:true}));}''',clipboard)
            assert pg.evaluate('JSON.stringify(DocutApp.getProject().pages[0].elements[0])')==original
            assert '붙여넣기 취소' in pg.locator('#toast').inner_text()
        check('table direct input and multi-cell paste never clip oversized cell text',reject_oversized_table_cell)

        browser.close()
    for name,status in results:print(name,status)
    assert all(status=='PASS' for _,status in results),results
    print(f'V0.15 browser tests: {len(results)}/{len(results)} PASS')

if __name__=='__main__':run()
