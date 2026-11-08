#!/usr/bin/env python3
"""Generate deterministic, formula-free XLSX for manual capacity acceptance.
No install artifact, CI action or production deployment is created.
"""
import argparse
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from xml.sax.saxutils import escape

NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
RNS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"

def col_name(i):
    s = ""
    i += 1
    while i:
        i, rem = divmod(i - 1, 26)
        s = chr(65 + rem) + s
    return s

def generate(path, rows, columns):
    if not 1 <= rows <= 29999 or not 2 <= columns <= 256:
        raise ValueError("rows 1..29999 and columns 2..256 are supported")
    total = rows * columns + 2
    if total > 3_000_000:
        raise ValueError(f"fixture exceeds the 3,000,000 filled-cell target: {total}")
    path.parent.mkdir(parents=True, exist_ok=True)
    types = ('<?xml version="1.0" encoding="utf-8"?>'
             '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
             '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
             '<Default Extension="xml" ContentType="application/xml"/>'
             '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
             '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
             '</Types>')
    book = (f'<workbook xmlns="{NS}" xmlns:r="{RNS}">'
            '<sheets><sheet name="대용량 검증" sheetId="1" r:id="rId1"/></sheets></workbook>')
    rels = (f'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>')
    with ZipFile(path, "w", ZIP_DEFLATED, compresslevel=5) as out:
        out.writestr("[Content_Types].xml", types)
        out.writestr("xl/workbook.xml", book)
        out.writestr("xl/_rels/workbook.xml.rels", rels)
        with out.open("xl/worksheets/sheet1.xml", "w") as stream:
            stream.write((f'<worksheet xmlns="{NS}"><sheetData>'
                          '<row r="1"><c r="A1" t="inlineStr"><is><t>Category</t></is></c>'
                          '<c r="B1" t="inlineStr"><is><t>Value</t></is></c></row>').encode())
            names = [col_name(i) for i in range(columns)]
            for i in range(rows):
                row_num = i + 2
                category = "G" + str(i % 50).zfill(2)
                val = -(i % 47 + 1) if i % 9 == 0 else (i % 47 + 1)
                parts = [f'<row r="{row_num}">',
                         f'<c r="A{row_num}" t="inlineStr"><is><t>{escape(category)}</t></is></c>',
                         f'<c r="B{row_num}"><v>{val}</v></c>']
                parts.extend(f'<c r="{name}{row_num}"><v>{i % 97 + j}</v></c>'
                             for j, name in enumerate(names[2:], 2))
                parts.append('</row>')
                stream.write("".join(parts).encode())
            stream.write(b'</sheetData></worksheet>')
    print(f"XLSX={path} populated_cells={total:,} file_bytes={path.stat().st_size:,} rows={rows+1} columns={columns}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--rows", type=int, default=6500)
    parser.add_argument("--columns", type=int, default=120)
    parser.add_argument("--output", type=Path, default=Path("/tmp/docut_large_v041.xlsx"))
    args = parser.parse_args()
    generate(args.output, args.rows, args.columns)
