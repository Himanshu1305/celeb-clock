#!/bin/bash
cd ~/Development/celeb-clock || exit 1
export BASH_DEFAULT_TIMEOUT_MS=3600000
export BASH_MAX_TIMEOUT_MS=3600000
LOG=logs/overnight/summary.log
report_for () { case "$1" in RC3) echo "docs/rc3-report.md";; FINAL) echo "docs/final-report.md";; *) echo "docs/growth-$(echo $1 | tr 'A-Z' 'a-z')-report.md";; esac; }
done_text () { case "$1" in RC3) echo "RC3 READY: YES";; *) echo "$1 COMPLETE: YES";; esac; }
for S in RC3 P0 P1 P2 P3 P4 P5 FINAL; do
  R=$(report_for $S); D=$(done_text $S)
  if head -n 5 "$R" 2>/dev/null | grep -q "$D"; then echo "$(date) — SKIP $S (already complete)" | tee -a $LOG; continue; fi
  max=8; [ "$S" = "RC3" ] && max=6
  real=0; waits=0
  while [ $real -lt $max ] && [ $waits -lt 80 ]; do
    f="logs/overnight/master-$S-$(date +%m%d-%H%M).log"; start=$(date +%s)
    echo "$(date) — START $S (real attempt $((real+1)))" | tee -a $LOG
    claude -p "Read docs/BornClock_Master.md in full and execute it for STAGE = $S only, starting with that stage's Step 0, without stopping to ask me anything. You are running unattended: never end your turn to wait for a build or test; run long commands in the foreground or keep polling them until they finish. Never deploy to production, never merge or push main, never add a Cloudflare token to GitHub. Include the stage report in full in your last message." --dangerously-skip-permissions > "$f" 2>&1
    status=$?; dur=$(( $(date +%s) - start ))
    result=$(head -n 5 "$R" 2>/dev/null | grep -m1 -E "READY|COMPLETE")
    echo "$(date) — END $S (exit $status, ${dur}s): $result" | tee -a $LOG
    echo "$result" | grep -q "$D" && break
    if [ $dur -lt 120 ]; then echo "$(date) — quick failure: $(head -c 200 "$f" | tr '\n' ' ') — waiting 20 min" | tee -a $LOG; waits=$((waits+1)); sleep 1200; continue; fi
    real=$((real+1))
  done
  if [ "$S" = "RC3" ] && ! head -n 5 "$R" 2>/dev/null | grep -q "$D"; then
    echo "$(date) — STOPPED: RC3 not ready — later stages not started. Paste docs/rc3-report.md to Claude." | tee -a $LOG; exit 1
  fi
done
echo "$(date) — MASTER RUNNER FINISHED" | tee -a $LOG
