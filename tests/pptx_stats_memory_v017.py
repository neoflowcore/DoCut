"""Verify nine editable PowerPoint statistical diagrams without saving a PPTX/ZIP build."""
from io import BytesIO
from pathlib import Path
import base64
import subprocess
import zipfile
import xml.etree.ElementTree as ET
from pptx import Presentation

ROOT = Path(__file__).resolve().parents[1]
NODE = r'''
const C=require('./assets/core.js');require('./assets/core_enhanced.js');require('./assets/effect_catalog.js');require('./assets/stat_charts.js');
const P=require('./assets/pptx.js');
const cases={
 cohort:[['Jan',0,100],['Jan',1,75]],
 multiples:[['A','1',10],['A','2',20],['B','1',15],['B','2',25]],
 control:[['1월',10],['2월',13]],
 forest:[['A',1.05,.9,1.25],['B',.9,.7,1.2]],
 fan:[['2027',2,3,4],['2028',3,5,7]],
 survival:[[0,100,0],[1,90,10],[2,80,6]],
 contribution:[['P',100],['N',-30]],
 lift:[[0,0],[20,70],[100,100]],
 roc:[[0,0],[.3,.8],[1,1]]
};
const kinds=Object.keys(cases),report=C.createProject(8,'analysis');report.pages.push(C.createPage(8,9,'analysis'));
report.pages.forEach((p,i)=>{
 const kind=kinds[i],data={kind,rows:cases[kind],palette:'ocean',limits:kind==='control'?{lower:5,center:10,upper:15}:{},referenceValue:kind==='forest'?1:null};
 p.elements=[];p.elements.push(C.makeBlock('stat',55,145,{w:1130,h:480,text:'종류 '+kind,source:'실측 데이터 '+kind,asOfDate:'2026-11-03',unit:'테스트 단위',evidence:'사용자 입력 검증 후 추가',verified:true,data}));
});
process.stdout.write(Buffer.from(P.createPPTX(report)).toString('base64'));
'''
run=subprocess.run(['node','-e',NODE],cwd=ROOT,capture_output=True,text=True,check=True,timeout=60)
data=base64.b64decode(run.stdout)
with zipfile.ZipFile(BytesIO(data),'r') as archive:
    files=archive.namelist()
    assert len(files)==len(set(files)), 'duplicate PPTX zip member'
    assert archive.testzip() is None
    assert all(f'ppt/slides/slide{n}.xml' in files for n in range(1,10))
    for i,kind in enumerate(['cohort','multiples','control','forest','fan','survival','contribution','lift','roc'],1):
        payload=archive.read(f'ppt/slides/slide{i}.xml')
        slide=ET.fromstring(payload)
        ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
        native=slide.findall('.//p:sp',ns)
        assert len(native)>3, (kind,len(native))
        assert slide.find('.//p:pic',ns) is None, f'{kind} rendered as raster image'
        xml=payload.decode('utf-8')
        assert ('실측 데이터 '+kind) in xml, f'{kind}: missing provenance'
        assert ('종류 '+kind) in xml, f'{kind}: missing editable chart heading'
    presentation=Presentation(BytesIO(data))
    assert len(presentation.slides)==9
    assert all(len(slide.shapes)>3 for slide in presentation.slides)
print('PPTX STAT MEMORY QA PASS: 9 kinds, 9 slides, editable native shapes, XML parsed, source metadata, no saved artifact')
