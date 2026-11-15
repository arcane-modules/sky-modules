#!/bin/bash
# Arbor Visual Test — tmux runner
# Usage: bash arbor/visual-tests/run.sh
set -e

SESSION="arbor-visual"
ROOT="/Users/a/Space/Projects/ArcaneModules/sky-modules"

echo "🌳 Arbor Visual Tests"
echo ""
echo "Interactive: npx tsx arbor/visual-tests/runner.ts"
echo "Capture:    npx tsx arbor/visual-tests/capture.ts > output.txt"
echo ""

# Kill existing session if any
tmux kill-session -t "$SESSION" 2>/dev/null || true

tmux new-session -d -s "$SESSION" -x 100 -y 40 "cd $ROOT && npx tsx arbor/visual-tests/capture.ts"

echo "Session '$SESSION' started."
echo ""
echo "To watch:   tmux attach -t $SESSION"
echo "To capture: tmux capture-pane -p -t $SESSION > arbor/visual-tests/output.txt"
echo "To stop:    tmux kill-session -t $SESSION"
echo ""

# Auto-attach if interactive
if [ -t 0 ]; then
    echo "Waiting for scenarios to complete..."
    sleep 20
    echo ""
    echo "Capturing final output:"
    echo ""
    tmux capture-pane -p -t "$SESSION"
    tmux kill-session -t "$SESSION" 2>/dev/null
fi
