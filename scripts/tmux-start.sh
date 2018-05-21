# Moving up to the parent scope
echo "Step 1 - Moving up to the parent scope"
cd ..

# Pane 0
tmux new-session \; split-window -h 'yarn watch:build' \; split-window -v 'yarn watch:unit' \; select-pane -t 0 \; split-window -v 'yarn watch:lint' \; select-pane -t 0;
