#!/bin/bash

# Find the PID of the node process and kill it
PID=$(pgrep -f "node app.js")
if [ -n "$PID" ]; then
  kill -15 $PID
  echo "Node server stopped gracefully."
else
  echo "No node server running."
fi
