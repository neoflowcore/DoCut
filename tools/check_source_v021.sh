#!/bin/sh
# On-demand source-only verification. Never creates a release artifact or runs CI.
set -eu
cd "$(dirname "$0")/.."
printf '\n%s\n' '[DoCut V0.21] JavaScript syntax and Node tests'
npm run check:syntax
npm test
for suite in browser_recovery browser_extended browser_v014 browser_v015 browser_v016 browser_v017 browser_v018 browser_v019 browser_v020 browser_v021; do
 printf '\n[DoCut V0.21] Chromium source QA: %s\n' "$suite"
 python "tests/$suite.py"
done
for suite in pptx_memory_qa pptx_stats_memory_v017; do
 printf '\n[DoCut V0.21] PPTX in-memory structural QA (no .pptx written): %s\n' "$suite"
 python "tests/$suite.py"
done
printf '\n%s\n' '[DoCut V0.21] All source-only suites passed.'
