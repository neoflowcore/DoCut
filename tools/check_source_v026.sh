#!/bin/sh
# Manual source-only validation; never run automatically on GitHub push.
# No Actions/workflows, builds, installation ZIP/EXE/APK, release PPTX or deployments.
set -eu
cd "$(dirname "$0")/.."
npm run check:syntax
node -e 'const fs=require("fs"); const c=JSON.parse(fs.readFileSync("vercel.json","utf8")); if(c.git?.deploymentEnabled!==false) process.exit(1); console.log("VERCEL SOURCE GUARD PASS")'
npm test
python3 tests/pptx_memory_qa.py
python3 tests/pptx_stats_memory_v017.py
for suite in recovery extended v014 v015; do
  python3 "tests/browser_${suite}.py"
done
for suite in v016 v017 v018 v019 v020 v021 v022 v023 v024 v025 v026; do
  for part in 0 1 2 3 4; do
    DOCUT_TEST_SHARD="${part}/5" python3 "tests/browser_${suite}.py"
  done
done
