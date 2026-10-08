#!/bin/bash
cd ~/Development/celeb-clock || exit 1
export BASH_DEFAULT_TIMEOUT_MS=3600000
export BASH_MAX_TIMEOUT_MS=3600000
LOG=logs/overnight/summary.log
real=0; waits=0
while [ $real -lt 6 ] && [ $waits -lt 60 ]; do
  f="logs/overnight/backlog1-$(date +%m%d-%H%M).log"; start=$(date +%s)
  echo "$(date) — START BACKLOG-1 (real attempt $((real+1)))" | tee -a $LOG
  claude -p "Read docs/BornClock_Backlog1.md in full and execute it completely, starting with its Step 0 (create or switch to the backlog-1 branch), without stopping to ask me anything. You are running unattended: never end your turn to wait for a build or test; run long commands in the foreground or keep polling them until they finish. Another project may be building on this Mac at the same time: before any speed or perf-budget measurement, check the load average with 'uptime'; if it is above half the CPU cores ('sysctl -n hw.ncpu'), wait in 5-minute steps (up to 60 minutes) until it drops, and note the load in the report. Include the report in full in your last message." --dangerously-skip-permissions > "$f" 2>&1
  status=$?; dur=$(( $(date +%s) - start ))
  result=$(head -n 5 docs/backlog1-report.md 2>/dev/null | grep -m1 "BACKLOG-1 COMPLETE")
  echo "$(date) — END BACKLOG-1 (exit $status, ${dur}s): $result" | tee -a $LOG
  echo "$result" | grep -q "BACKLOG-1 COMPLETE: YES" && break
  if [ $dur -lt 120 ]; then echo "$(date) — quick failure: $(head -c 200 "$f" | tr '\n' ' ') — waiting 20 min" | tee -a $LOG; waits=$((waits+1)); sleep 1200; continue; fi
  real=$((real+1))
done
echo "$(date) — BACKLOG-1 RUNNER FINISHED" | tee -a $LOG
