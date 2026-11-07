#!/bin/sh
# Manual-only DoCut V0.20 regression; no build, deployment or installers.
set -eu
cd "$(dirname "$0")/.."
printf '%s\n' '[DoCut] syntax and Node unit tests'
npm run check:syntax
npm test
for suite in browser_recovery browser_extended browser_v014 browser_v015 browser_v016 browser_v017 browser_v018 browser_v019 browser_v020; do
 printf '\n[DoCut] Chromium suite %s\n' "$suite"
 python "tests/$suite.py"
done
for suite in pptx_memory_qa pptx_stats_memory_v017; do
 printf '\n[DoCut] PPTX in-memory %s (no file built)\n' "$suite"
 python "tests/$suite.py"
done
printf '\n%s\n' '[DoCut] all manual source regression commands passed.'
