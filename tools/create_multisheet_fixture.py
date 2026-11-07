from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from xml.sax.saxutils import escape
root=Path(__file__).resolve().parents[1]/'tests'/'fixtures'
ns='http://schemas.openxmlformats.org/spreadsheetml/2006/main'
def worksheet(rows):
 lines=[]
 for i,row in enumerate(rows,1):
  cells=[]
  for j,v in enumerate(row):
   address=chr(65+j)+str(i)
   cells.append(f'<c r="{address}"><v>{v}</v></c>' if isinstance(v,(int,float)) else f'<c r="{address}" t="inlineStr"><is><t>{escape(str(v))}</t></is></c>')
  lines.append(f'<row r="{i}">'+''.join(cells)+'</row>')
 return f'<worksheet xmlns="{ns}"><sheetData>'+''.join(lines)+'</sheetData></worksheet>'
files={'[Content_Types].xml':'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/></Types>',
'xl/workbook.xml':f'<workbook xmlns="{ns}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="매출 현황" sheetId="1" r:id="rId1"/><sheet name="직원 교육" sheetId="2" r:id="rId2"/></sheets></workbook>',
'xl/_rels/workbook.xml.rels':'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Target="worksheets/sheet2.xml"/></Relationships>',
'xl/worksheets/sheet1.xml':worksheet([['항목','매출'],['가',1200],['나',-300]]),
'xl/worksheets/sheet2.xml':worksheet([['교육','참석 인원'],['기초',17],['심화',23],['대기',0]])}
with ZipFile(root/'multi_sheet.xlsx','w',ZIP_DEFLATED) as out:
 for name,content in files.items():out.writestr(name,content)
print('Created multi_sheet.xlsx with two distinct sheets')
