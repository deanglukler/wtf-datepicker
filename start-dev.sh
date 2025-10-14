#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the dev server and log output to file
echo "Starting development server..."
echo "Logs will be written to logs/dev.log"
echo "To view logs in real-time, run: tail -f logs/dev.log"

# Run npm dev and tee output to both console and log file
npm run dev 2>&1 | tee logs/dev.log