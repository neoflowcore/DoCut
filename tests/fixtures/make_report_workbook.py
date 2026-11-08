#!/usr/bin/env python3
"""Generate synthetic, non-UBS Excel fixtures (standard OOXML) for integration QA."""
import sys
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape
out=Path(sys.argv[1] if len(sys.argv)>1 else '/tmp/docut_excel_v039.xlsx')
out.parent.mkdir(parents=True, exist_ok=True)
main=[]
main.append(['Region','Value','Quarter'])
for i in range(1,81):
    main.append(['Region%03d'%i,(-i if i%9==0 else i*2),('Q1' if i<=40 else 'Q2')])
summary=[['Market','Amount'],['Seoul',120],['Busan',-30],['Seoul',80],['Daegu',15],['Busan',5]]
def cell(row,col,number):
    ref=chr(65+col)+str(number)
    if isinstance(row,(int,float)):
        return '<c r="%s"><v>%s</v></c>'%(ref,row)
    return '<c r="%s" t="inlineStr"><is><t>%s</t></is></c>'%(ref,escape(str(row)))
def sheet(rows):
    body=['<row r="%s">%s</row>'%(i,''.join(cell(v,c,i) for c,v in enumerate(row))) for i,row in enumerate(rows,1)]
    return '<?xml version="1.0" encoding="utf-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'+''.join(body)+'</sheetData></worksheet>'
types='<?xml version="1.0" encoding="utf-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'
workbook='<?xml version="1.0" encoding="utf-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Raw Data" sheetId="1" r:id="rId1"/><sheet name="Group Summary" sheetId="2" r:id="rId2"/></sheets></workbook>'
rels='<?xml version="1.0" encoding="utf-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/></Relationships>'
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as zip_file:
    for name,text in {'[Content_Types].xml':types,'xl/workbook.xml':workbook,'xl/_rels/workbook.xml.rels':rels,'xl/worksheets/sheet1.xml':sheet(main),'xl/worksheets/sheet2.xml':sheet(summary)}.items():
        zip_file.writestr(name,text.encode('utf-8'))
print(out,'size',out.stat().st_size)

