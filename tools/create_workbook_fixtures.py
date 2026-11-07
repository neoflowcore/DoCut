from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from xml.sax.saxutils import escape
ROOT=Path(__file__).resolve().parents[1]/'tests'/'fixtures'
def write(name, rows, extra=None):
 def col(n):
  out=''
  while n: n,r=divmod(n-1,26);out=chr(65+r)+out
  return out
 cells=[]
 for r,row in enumerate(rows,1):
  items=[]
  for c,value in enumerate(row,1):
   addr=f'{col(c)}{r}'
   if isinstance(value,tuple): xml=f'<c r="{addr}"><f>{escape(value[0])}</f><v>{value[1]}</v></c>'
   elif value is None: xml=f'<c r="{addr}"/>'
   elif isinstance(value,(int,float)): xml=f'<c r="{addr}"><v>{value}</v></c>'
   else: xml=f'<c r="{addr}" t="inlineStr"><is><t>{escape(str(value))}</t></is></c>'
   items.append(xml)
  cells.append('<row r="'+str(r)+'">'+''.join(items)+'</row>')
 ns='http://schemas.openxmlformats.org/spreadsheetml/2006/main'
 entries={'[Content_Types].xml':'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/></Types>',
 'xl/workbook.xml':f'<workbook xmlns="{ns}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="성과" sheetId="1" r:id="rId1"/></sheets></workbook>',
 'xl/_rels/workbook.xml.rels':'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
 'xl/worksheets/sheet1.xml':f'<worksheet xmlns="{ns}"><sheetData>'+''.join(cells)+'</sheetData></worksheet>'}
 if extra: entries.update(extra)
 with ZipFile(ROOT/name,'w',ZIP_DEFLATED) as z:
  for path,data in entries.items():z.writestr(path,data)
write('quarterly.xlsx',[['분기','부서','실적'],['1분기','가',0],['1분기','나',-5],['2분기','가',12],['2분기','나',('SUM(C2:C4)',7)]])
write('budget.xlsx',[['항목','금액','단위'],['수입',3200,'만원'],['지출',-1250,'만원'],['잔액',('SUM(B2:B3)',1950),'만원']])
print('Created two bounded XLSX fixtures')
