#!/bin/bash

# Clean Apple Metadata Files
# Removes macOS-specific metadata files (.DS_Store, ._* files) from the repository
# Performs the same cleaning as start.sh

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the project root (parent of scripts directory)
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Change to project root directory
cd "$PROJECT_ROOT"

echo "🧹 Cleaning up resource fork files..."

# Remove ._* resource fork files (same as start.sh)
find . -name "._*" -type f -delete 2>/dev/null

# Remove .DS_Store files (same as start.sh)
find . -name ".DS_Store" -type f -delete 2>/dev/null

echo "✅ Cleanup complete!"
echo ""
