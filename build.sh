#!/bin/bash
set -e

# Install npm dependencies
npm install

# Build the project
npm run build

# If you have Python dependencies, uncomment these lines
# pip install -r requirements.txt
# or
# python -m pip install -e .
