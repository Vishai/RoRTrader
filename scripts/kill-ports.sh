#!/bin/bash

# Kill any processes using port 3000
echo "Checking for processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No process found on port 3000"

# Kill any processes using port 3001 (API)
echo "Checking for processes on port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "No process found on port 3001"

echo "Ports cleared!"
