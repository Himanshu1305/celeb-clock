#!/bin/bash
cd ~/Development/celeb-clock || exit 1
export BASH_DEFAULT_TIMEOUT_MS=3600000
export BASH_MAX_TIMEOUT_MS=3600000
LOG=logs/overnight/summary.log
real=0; waits=0
while [ $real -lt 6 ] && [ $waits -lt 60 ]; do
  f="logs/overnight/rc3-$(date +%m%d-%H%M).log"; start=$(date +%s)
  echo "$(date) — START RC3 (real attempt $((real+1)))" | tee -a $LOG
  claude -p "Read docs/BornClock_RC3.md in full and execute it completely, starting with its Step 0 (create or switch to the rc3 branch), without stopping to ask me anything. You are running unattended: never end your turn to wait for a build or test; run long commands in the foreground or keep polling them until they finish. Rule 4 is critical: a tool counts as verified only after a real form submission on live staging returns a correct result. Include the report in full in your last message." --dangerously-skip-permissions > "$f" 2>&1
  status=$?; dur=$(( $(date +%s) - start ))
  result=$(head -n 5 docs/rc3-report.md 2>/dev/null | grep -m1 "RC3 READY")
  echo "$(date) — END RC3 (exit $status, ${dur}s): $result" | tee -a $LOG
  echo "$result" | grep -q "RC3 READY: YES" && break
  if [ $dur -lt 120 ]; then echo "$(date) — quick failure: $(head -c 200 "$f" | tr '\n' ' ') — waiting 20 min" | tee -a $LOG; waits=$((waits+1)); sleep 1200; continue; fi
  real=$((real+1))
done
echo "$(date) — RC3 RUNNER FINISHED" | tee -a $LOG
