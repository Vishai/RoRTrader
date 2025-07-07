#!/bin/bash

echo "Installing dependencies for RoR Trader Web..."
cd /Users/brandonarmstrong/Documents/Github/RoRTrader/apps/web

echo "Running npm install..."
npm install

echo "Starting development server..."
npm run dev