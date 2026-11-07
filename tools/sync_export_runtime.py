#!/usr/bin/env python3
"""Keep the zero-build standalone report motion runtime byte-identical to the editor.

Run manually whenever assets/easing.js is changed. Does not create binaries,
installer files, ZIPs, or launch GitHub Actions.
"""
from pathlib import Path
import json
import re

ROOT=Path(__file__).resolve().parent.parent
source=(ROOT/'assets/easing.js').read_text(encoding='utf-8')
exporter=ROOT/'assets/export.js'
old=exporter.read_text(encoding='utf-8')
regex=re.compile(r'(?m)^ const embeddedEasing=.*?;\n(?= const sourcePanelCSS=| const reportJS=| const embeddedVisual=| const embeddedInteraction=)')
replacement=' const embeddedEasing='+json.dumps(source,ensure_ascii=False)+';\n'
result,count=regex.subn(lambda _:replacement,old)
if count!=1:
 raise RuntimeError(f'Expected a single embeddedEasing declaration, found {count}')
# Mirror the bounded DOM-motion implementation in standalone HTML, without fetching modules.
visual=(ROOT/'assets/visual_motion.js').read_text(encoding='utf-8')
visual_declaration=' const embeddedVisual='+json.dumps(visual,ensure_ascii=False)+';\n'
pattern=re.compile(r'(?m)^ const embeddedVisual=.*?;\n')
if pattern.search(result):
 result=pattern.sub(lambda _:visual_declaration,result,count=1)
else:
 result=result.replace(replacement,replacement+visual_declaration,1)
story=(ROOT/'assets/story_player.js').read_text(encoding='utf-8')
story_declaration=' const embeddedStory='+json.dumps(story,ensure_ascii=False)+';\n'
story_pattern=re.compile(r'(?m)^ const embeddedStory=.*?;\n')
if story_pattern.search(result):
 result=story_pattern.sub(lambda _:story_declaration,result,count=1)
else:
 result=result.replace(' const sourcePanelCSS=',story_declaration+' const sourcePanelCSS=',1)
# Identical hover/pointer/ambient interaction runtime in exported standalone HTML.
interaction=(ROOT/'assets/interaction_fx.js').read_text(encoding='utf-8')
interaction_declaration=' const embeddedInteraction='+json.dumps(interaction,ensure_ascii=False)+';\n'
interaction_pattern=re.compile(r'(?m)^ const embeddedInteraction=.*?;\n')
if interaction_pattern.search(result):
 result=interaction_pattern.sub(lambda _:interaction_declaration,result,count=1)
else:
 result=result.replace(' const embeddedVisual=',interaction_declaration+' const embeddedVisual=',1)
# Identical page-transition runtime in exported standalone HTML.

transition=(ROOT/'assets/page_transitions.js').read_text(encoding='utf-8')
transition_declaration=' const embeddedTransitions='+json.dumps(transition,ensure_ascii=False)+';\n'
transition_pattern=re.compile(r'(?m)^ const embeddedTransitions=.*?;\n')
if transition_pattern.search(result):
 result=transition_pattern.sub(lambda _:transition_declaration,result,count=1)
else:
 result=result.replace(' const reportJS=',transition_declaration+' const reportJS=',1)
for filename, variable in [('workbook.js','embeddedWorkbook'),('data_motion.js','embeddedDataMotion')]:
 source_text=(ROOT/'assets'/filename).read_text(encoding='utf-8')
 declaration=' const '+variable+'='+json.dumps(source_text,ensure_ascii=False)+';\n'
 pattern=re.compile(r'(?m)^ const '+variable+r'=.*?;\n')
 if pattern.search(result):
  result=pattern.sub(lambda _:declaration,result,count=1)
 else:
  result=result.replace(' const reportJS=',declaration+' const reportJS=',1)
if result!=old:
 exporter.write_text(result,encoding='utf-8')
print('DoCut standalone motion runtimes synced:',len(source),len(visual),'source characters')
