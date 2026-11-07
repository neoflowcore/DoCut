#!/bin/sh
# Manual source-only checks. No CI, production deploy, installer or release artifact.
set -eu
cd "$(dirname "$0")/.."
npm run check:syntax
npm test
python tests/pptx_memory_qa.py
python tests/pptx_stats_memory_v017.py
# Browser cases may be independently split via DOCUT_TEST_FILTER for large suites.
for suite in recovery extended v014 v015 v016 v017 v018 v019 v020 v021 v022 v023 v024; do
 python "tests/browser_${suite}.py"
done
