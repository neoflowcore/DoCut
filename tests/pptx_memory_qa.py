"""Check V0.14 PPTX bytes entirely in memory; no PPTX or ZIP artifact is saved."""
from io import BytesIO
from pathlib import Path
import base64, subprocess, zipfile
from PIL import Image
from pptx import Presentation

ROOT=Path(__file__).resolve().parents[1]
pic=BytesIO();Image.new('RGB',(20,12),(30,140,210)).save(pic,format='PNG');png=base64.b64encode(pic.getvalue()).decode()
node='''
const C=require('./assets/core.js');require('./assets/core_enhanced.js');const P=require('./assets/pptx.js');
const img='data:image/png;base64,'+process.env.DOCUT_TEST_PNG;
const p=C.createProject(3,'policy');p.master.logo=img;p.master.footer='Incheon Branch';
p.pages.forEach((pg,i)=>{pg.elements.push(C.makeBlock('image',60,210,{data:{src:img,alt:'Logo'},w:210,h:120}));});
p.pages[0].elements[0].text='Emphasized text';p.pages[0].elements[0].richText=[{text:'Emphasized',bold:true,color:'#224488'},{text:' text',normalWeight:true}];
p.pages[1].elements.push(C.makeBlock('line',100,240,{data:{labels:['Jan','Feb','Mar'],values:[22,-15,35]}}));
p.pages[2].elements.push(C.makeBlock('table',120,260,{data:{rows:[['Item','Value'],['A','-20']],cells:[[{background:'#BBDDEE',bold:true}]]}}));
process.stdout.write(Buffer.from(P.createPPTX(p)).toString('base64'));
'''
import os
env={**os.environ,'DOCUT_TEST_PNG':png}
result=subprocess.run(['node','-e',node],cwd=ROOT,env=env,check=True,capture_output=True,text=True,timeout=45)
data=base64.b64decode(result.stdout)
with zipfile.ZipFile(BytesIO(data)) as z:
    files=z.namelist()
    assert len(files)==len(set(files)), 'Duplicate ZIP member names'
    image_files=[name for name in files if name.startswith('ppt/media/image')]
    assert len(image_files)==6, image_files
    assert all(z.read(name)==pic.getvalue() for name in image_files)
    slide2=z.read('ppt/slides/slide2.xml').decode()
    assert 'flipV="1"' in slide2
    assert 'a:srgbClr val="224488"' in z.read('ppt/slides/slide1.xml').decode()
    assert z.testzip() is None
presentation=Presentation(BytesIO(data))
assert len(presentation.slides)==3
assert all(sum(shape.shape_type==13 for shape in s.shapes)==2 for s in presentation.slides)
assert 'Incheon Branch' in ' '.join(shape.text for shape in presentation.slides[0].shapes if shape.has_text_frame)
assert any('Item' in shape.text for shape in presentation.slides[2].shapes if shape.has_text_frame)
print('PPTX memory QA PASS: slides=3; embedded images=6; native editable shapes, styled runs and descending chart segments preserved')
