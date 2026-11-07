#!/bin/sh
# Manual source-only DoCut V0.23 QA. No install/build/GitHub Actions/release output.
set -eu
cd "$(dirname "$0")/.."
printf '%s\n' '[DoCut V0.23] JavaScript syntax and Node tests'
npm run check:syntax
npm test
for suite in browser_recovery browser_extended browser_v014 browser_v015 browser_v016 browser_v017 browser_v018 browser_v019 browser_v020 browser_v021 browser_v022 browser_v023; do
 printf '[DoCut V0.23] Chromium: %s\n' "$suite"
 python "tests/$suite.py"
done
for suite in pptx_memory_qa pptx_stats_memory_v017; do
 printf '[DoCut V0.23] In-memory PPTX geometry: %s\n' "$suite"
 python "tests/$suite.py"
done
printf '%s\n' '[DoCut V0.23] Source-only regression finished.'
