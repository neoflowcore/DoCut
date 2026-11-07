"""Manual-only V0.17 statistical-report UI regression; no GitHub Actions or release files."""
from playwright.sync_api import sync_playwright
from browser_recovery import load
import traceback
import os

SAMPLES = {
    'cohort': '2025-01 | 0 | 100\n2025-01 | 1 | 80',
    'multiples': 'A | 1월 | 12\nA | 2월 | 15\nB | 1월 | 14\nB | 2월 | 18',
    'control': '01 | 10\n02 | 11\n03 | 8',
    'forest': '사업 A | 1.2 | .95 | 1.6\n사업 B | .9 | .7 | 1.1',
    'fan': '2027 | 10 | 15 | 19\n2028 | 12 | 17 | 22',
    'survival': '0 | 100 | 0\n1 | 90 | 5\n2 | 80 | 8',
    'contribution': 'A | 20\nB | -10\nC | 8',
    'lift': '10 | 24\n50 | 74\n100 | 100',
    'roc': '0 | 0\n0.2 | 0.8\n1 | 1',
}

def run():
    outcomes=[]
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        def check(label, fn, mobile=False):
            part,total=(int(x) for x in os.environ.get("DOCUT_TEST_SHARD","0/1").split("/"))
            if not hasattr(check,"position"):check.position=0
            idx=check.position;check.position+=1
            if idx%total!=part:return
            print('TEST',label,flush=True)
            pg=browser.new_page(viewport={'width':390,'height':844} if mobile else {'width':1550,'height':900},accept_downloads=False)
            pg.set_default_timeout(6500)
            errors=[]
            try:
                errors=load(pg);fn(pg);assert not errors,errors;outcomes.append((label,'PASS'))
            except Exception as e:
                traceback.print_exc();outcomes.append((label,'FAIL '+str(e)))
            finally: pg.close()

        def insert(pg):
            pg.locator('[data-left-tab="insert"]').click()
            pg.locator('[data-insert="stat"]').click()
            item=pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1)')
            assert item['type']=='stat' and item['data']['rows']==[],item
            assert pg.locator('[data-stat-kind]').count()==1
            assert pg.locator('#slide .stat-chart-svg').count()==1
            assert '원자료를 입력하세요' in pg.locator('#slide .stat-chart-svg').evaluate('(el)=>el.textContent')
            assert pg.locator('[data-visual-preset="statistic"]').count()==1
        check('blank stat insert and no fabricated samples',insert)

        def valid(pg):
            pg.evaluate('DocutApp.addElement("stat")')
            pg.locator('[data-stat-kind]').select_option('forest')
            pg.locator('[data-stat-rows]').fill(SAMPLES['forest'])
            pg.locator('[data-stat-rows]').press('Tab')
            data=pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).data')
            assert data['kind']=='forest' and len(data['rows'])==2,data
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).text')=='포레스트 플롯'
            assert abs(data['rows'][0][1]-1.2)<.000001
            assert pg.locator('#slide .stat-chart-svg circle').count()==2
            assert pg.locator('[data-stat-reference]').count()==1
            pg.locator('[data-stat-reference]').fill('1');pg.locator('[data-stat-reference]').press('Tab')
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).data.referenceValue')==1
            assert '기준 1' in pg.locator('#slide .stat-chart-svg').evaluate('(el)=>el.textContent')
            pg.locator('[data-visual-preset="statistic"]').click()
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).effects.at(-1).kind')=='stat-reveal'
            pg.locator('[data-action="undo"]').first.click()
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).effects.at(-1).kind')!='stat-reveal'
        check('forest input, native SVG, statistical effect and Undo',valid)

        def invalid(pg):
            pg.evaluate('DocutApp.addElement("stat")')
            area=pg.locator('[data-stat-rows]')
            area.fill('A | 0 | 100');area.press('Tab')
            before=pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).data.rows')
            area=pg.locator('[data-stat-rows]');area.fill('A | 0 | 120');area.press('Tab')
            after=pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).data.rows')
            assert before==after and len(after)==1,(before,after)
            assert '원자료 적용 취소' in pg.locator('#toast').inner_text()
            assert '100' in pg.locator('[data-stat-rows]').input_value()
        check('invalid percent never partially changes saved data',invalid)

        def control(pg):
            pg.evaluate('DocutApp.addElement("stat")')
            pg.locator('[data-stat-kind]').select_option('control')
            pg.locator('[data-stat-rows]').fill(SAMPLES['control']);pg.locator('[data-stat-rows]').press('Tab')
            assert '한계값 미입력' in pg.locator('#slide .stat-chart-svg').evaluate('(el)=>el.textContent')
            for field,value in [('lower','5'),('center','10'),('upper','15')]:
                p=pg.locator('[data-stat-limit="'+field+'"]');p.fill(value);p.press('Tab')
            data=pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).data')
            assert data['limits']==dict(lower=5,center=10,upper=15),data
            assert pg.locator('#slide .stat-chart-svg line').count()>5
        check('control chart limits require user input',control)

        def kinds(pg):
            pg.evaluate('DocutApp.addElement("stat")')
            for kind,raw in SAMPLES.items():
                pg.locator('[data-stat-kind]').select_option(kind)
                pg.locator('[data-stat-rows]').fill(raw);pg.locator('[data-stat-rows]').press('Tab')
                if kind=='control':
                    for field,value in [('lower','5'),('center','10'),('upper','15')]:
                        item=pg.locator('[data-stat-limit="'+field+'"]');item.fill(value);item.press('Tab')
                d=pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).data')
                assert d['kind']==kind and len(d['rows'])>=2,d
                assert pg.locator('#slide .stat-chart-svg').count()==1,kind
                assert pg.locator('#slide .stat-chart-svg > *').count()>=3,kind
        check('all nine chart kinds selectable and rendered',kinds)

        def provenance(pg):
            pg.evaluate('DocutApp.addElement("stat")')
            pg.locator('[data-adv="element.source"]').fill('2026 통계자료');pg.locator('[data-adv="element.source"]').press('Tab')
            pg.locator('[data-adv="element.asOfDate"]').fill('2026-11-03');pg.locator('[data-adv="element.asOfDate"]').press('Tab')
            pg.locator('[data-stat-rows]').fill('A | 0 | 100');pg.locator('[data-stat-rows]').press('Tab')
            pg.locator('[data-adv="element.verified"]').check()
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).verified')
            pg.locator('[data-stat-rows]').fill('A | 0 | 90');pg.locator('[data-stat-rows]').press('Tab')
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).verified') is False
            html=pg.evaluate('DocutExporter.exportHTML(DocutApp.getProject())')
            assert '2026 통계자료' in html and '"kind":"cohort"' in html
            txt=pg.evaluate('DocutExporter.exportText(DocutApp.getProject())')
            assert 'A | 0 | 90' in txt and '미확인' in txt
        check('source metadata / verified invalidation / HTML and TXT parity',provenance)

        def verify_data(pg):
            pg.evaluate('DocutApp.addElement("stat")')
            pg.locator('[data-adv="element.source"]').fill('원자료 테스트 기관')
            pg.locator('[data-adv="element.source"]').press('Tab')
            pg.locator('[data-adv="element.verified"]').click()
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).verified') is False
            assert '원자료' in pg.locator('#toast').inner_text()
            pg.locator('[data-stat-kind]').select_option('control')
            pg.locator('[data-stat-rows]').fill('Jan | 12')
            pg.locator('[data-stat-rows]').press('Tab')
            pg.locator('[data-adv="element.verified"]').click()
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).verified') is False
            assert '하한·중심선·상한' in pg.locator('#toast').inner_text()
            for key,value in [('lower','9'),('center','12'),('upper','16')]:
                field=pg.locator('[data-stat-limit="'+key+'"]');field.fill(value);field.press('Tab')
            pg.locator('[data-adv="element.verified"]').check()
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).verified') is True
        check('verification requires actual rows and control-limit evidence',verify_data)

        def csv(pg):
            pg.evaluate('DocutApp.addElement("stat")')
            pg.locator('[data-stat-kind]').select_option('forest')
            assert pg.locator('[data-action="stat-copy-columns"]').count()==1
            pg.locator('[data-action="stat-copy-columns"]').click()
            with pg.expect_file_chooser() as chooser:
                pg.locator('[data-action="import-csv"]').click()
            chooser.value.set_files({'name':'forest.csv','mimeType':'text/csv','buffer':'항목,추정치,하한,상한\n정책 A,1.1,0.9,1.5'.encode('utf-8')})
            assert pg.locator('#csvReviewDialog').evaluate('(n)=>n.open')
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).data.rows.length')==0
            pg.locator('[data-action="csv-apply"]').click()
            if pg.locator('#csvReviewDialog').is_visible():
                with pg.expect_download() as backup:
                    pg.locator('#csvReviewDialog [data-action="export-working-copy"]').click()
                assert backup.value.suggested_filename.endswith('_UNSAVED.docut.json')
                pg.locator('[data-action="csv-apply"]').click()
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).data.rows.length')==1
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).source')=='forest.csv'
        check('CSV import previews before explicit approval',csv)

        def csv_provenance(pg):
            pg.evaluate('DocutApp.addElement("stat")')
            pg.locator('[data-stat-kind]').select_option('forest')
            pg.locator('[data-adv="element.source"]').fill('2026 보건 통계 원본')
            pg.locator('[data-adv="element.source"]').press('Tab')
            with pg.expect_file_chooser() as chooser:
                pg.locator('[data-action="import-csv"]').click()
            chooser.value.set_files({'name':'supplement.csv','mimeType':'text/csv','buffer':'항목,추정치,하한,상한\n대안 A,0.9,0.7,1.1'.encode('utf-8')})
            pg.locator('[data-action="csv-apply"]').click()
            if pg.locator('#csvReviewDialog').is_visible():
                with pg.expect_download() as backup:
                    pg.locator('#csvReviewDialog [data-action="export-working-copy"]').click()
                assert backup.value.suggested_filename.endswith('_UNSAVED.docut.json')
                pg.locator('[data-action="csv-apply"]').click()
            chart=pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1)')
            assert chart['source']=='2026 보건 통계 원본',chart['source']
            assert 'CSV/TSV 입력 파일: supplement.csv' in chart['evidence'],chart['evidence']
            assert chart['verified'] is False
            pg.locator('[data-action="undo"]').first.click()
            restored=pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1)')
            assert restored['source']=='2026 보건 통계 원본'
            assert 'supplement.csv' not in restored['evidence']
        check('CSV approval preserves existing original provenance and Undo restores it',csv_provenance)

        def mobile(pg):
            pg.evaluate('DocutApp.addElement("stat")')
            pg.locator('[data-action="toggle-inspector"]').click()
            assert pg.locator('.rightbar').evaluate('(el)=>el.classList.contains("show")')
            pg.locator('[data-stat-kind]').select_option('roc')
            pg.locator('[data-stat-rows]').fill(SAMPLES['roc']);pg.locator('[data-stat-rows]').press('Tab')
            assert pg.locator('#slide .stat-chart-svg').count()==1
            assert pg.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1')
            assert pg.evaluate('DocutApp.getProject().pages[0].elements.at(-1).data.kind')=='roc'
        check('390px mobile viewport / statistical chart / no body overflow',mobile,True)

        def standalone(pg):
            # Reopen the generated HTML as a new document, exercising the real
            # embedded HTML script and static SVG instead of just text matching.
            report=pg.evaluate(r'''() => {
              const values={cohort:[['A',0,100],['A',1,75]],multiples:[['A','Jan',10],['B','Jan',20]],
                control:[['Jan',7],['Feb',10]],forest:[['정책',1.1,.9,1.3]],fan:[['2027',2,3,4]],
                survival:[[0,100,0],[1,90,8]],contribution:[['A',12],['B',-5]],
                lift:[[0,0],[20,75],[100,100]],roc:[[0,0],[.2,.8],[1,1]]};
              const p=DocutCore.createProject(8,'research');p.pages.push(DocutCore.createPage(8,9,'research'));
              Object.keys(values).forEach((kind,i)=>{
                const page=p.pages[i];page.elements=[];page.elements.push(DocutCore.makeBlock('stat',75,150,{
                  text:'실행 '+kind,source:'공식 자료 '+kind,asOfDate:'2026-11-03',unit:'해당 단위',
                  data:{kind,rows:values[kind],limits:kind==='control'?{lower:3,center:7,upper:14}:{},
                    referenceValue:kind==='forest'?1:null},
                  effects:[DocutCore.makeEffect('stat-reveal',700)]
                }));
              });
              return DocutExporter.exportHTML(p);
            }''')
            # A fresh page matters: the prior editor owns window resize listeners.
            # Reusing document.open on that document would artificially fire stale
            # editor handlers against the report-only document.
            output=browser.new_page()
            report_errors=[];output.on('pageerror',lambda e:report_errors.append(str(e)))
            try:
                output.emulate_media(reduced_motion='reduce')
                output.set_content(report,wait_until='domcontentloaded')
                assert output.locator('.report-screen .slide').count()==9
                assert output.locator('.stat-chart-svg').count()==9
                assert output.locator('#sources').count()==1
                output.locator('#sources').click()
                assert '공식 자료 cohort' in output.locator('#sourceRows').inner_text()
                assert output.locator('#sourceRows details').count()==1
                assert output.locator('#sourceRows dt',has_text='기준값 / 비교선').count()==0
                assert output.locator('#sourceRows dt',has_text='관리 한계').count()==0
                output.locator('#sourceRows summary').click()
                assert output.locator('#sourceRows table thead th').all_inner_texts()==['코호트','기간','잔존율(%)']
                assert output.locator('#sourceRows table tbody tr').count()==2
                assert output.locator('#sourceRows table tbody tr').first.locator('td').all_inner_texts()==['A','0','100']
                output.locator('#tabs button').nth(3).click()
                assert '공식 자료 forest' in output.locator('#sourceRows').inner_text()
                output.locator('#sourceRows summary').click()
                assert output.locator('#sourceRows table tbody tr').first.locator('td').all_inner_texts()==['정책','1.1','0.9','1.3']
                assert output.evaluate('window.matchMedia("(prefers-reduced-motion: reduce)").matches')
                assert output.evaluate('document.getAnimations().filter(x=>x.playState==="running").length')==0
                assert output.evaluate('performance.getEntriesByType("resource").filter(x=>/^https?:/.test(x.name)).length')==0
                assert not report_errors,report_errors
            finally:output.close()
        check('nine charts in standalone offline HTML / source drawer / reduced motion',standalone)

        def sourceless(pg):
            source=pg.evaluate('''() => {const p=DocutCore.createProject(1);p.pages[0].elements=[DocutCore.makeBlock('stat',120,170)];return DocutExporter.exportHTML(p)}''')
            output=browser.new_page()
            try:
                output.set_content(source,wait_until='domcontentloaded')
                assert output.locator('#sources').count()==1
                output.locator('#sources').click()
                assert '미확인' in output.locator('#sourceRows').inner_text()
                output.locator('#sourceRows summary').click()
                assert output.locator('#sourceRows table tbody tr').count()==0
                assert '원자료 미입력' in output.locator('#sourceRows').inner_text()
            finally: output.close()
        check('source drawer retains empty unsourced statistic with explicit uncertainty',sourceless)

        def zero_reference(pg):
            html=pg.evaluate('''() => {const p=DocutCore.createProject(1);p.pages[0].elements=[DocutCore.makeBlock('stat',30,160,{text:'기준 0 플롯',source:'관측자료',data:{kind:'forest',rows:[['대안',0.1,-0.1,0.3]],referenceValue:0}})];return DocutExporter.exportHTML(p)}''')
            output=browser.new_page()
            try:
                output.set_content(html,wait_until='domcontentloaded')
                output.locator('#sources').click()
                description=output.locator('#sourceRows').inner_text()
                assert '기준값 / 비교선' in description
                assert output.locator('#sourceRows dt',has_text='기준값 / 비교선').locator('xpath=following-sibling::dd[1]').inner_text()=='0'
                assert '관측자료' in description
            finally:output.close()
        check('forest benchmark reference zero is not mistaken for blank',zero_reference)

        browser.close()
    for label,status in outcomes:print(('PASS' if status=='PASS' else 'FAIL')+' '+label+((' :: '+status) if status!='PASS' else ''))
    passed=sum(x=='PASS' for _,x in outcomes)
    print(f'V0.17 browser: {passed}/{len(outcomes)}')
    if passed!=len(outcomes):raise SystemExit(1)

if __name__=='__main__':run()
