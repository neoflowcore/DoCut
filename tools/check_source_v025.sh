#!/bin/sh
# SOURCE-ONLY source verification. No Actions, build/deploy, installers or release PPTX.
set -eu
cd "$(dirname "$0")/.."
npm run check:syntax
npm test
python tests/pptx_memory_qa.py
python tests/pptx_stats_memory_v017.py
for suite in recovery extended v014; do
 python "tests/browser_${suite}.py"
done
for suite in v015 v016 v017 v018 v019 v020 v021 v022 v023 v024 v025; do
 for part in 0 1 2; do
  DOCUT_TEST_SHARD="${part}/3" python "tests/browser_${suite}.py"
 done
done
