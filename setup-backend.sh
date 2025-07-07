#!/bin/bash

# Navigate to the API directory
cd "$(dirname "$0")/.."

# Run the database setup
./scripts/setup-db.sh
