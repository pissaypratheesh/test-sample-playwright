#!/bin/bash
cd /Users/pranam/Documents/codebase/Nammas/TATA_PW
npx playwright test tests/renewTata.spec.js --headed 2>&1 | tee latest-test.log

