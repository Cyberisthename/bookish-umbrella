#!/bin/bash

# Post-build script to fix Electron output structure

cd dist-electron

# Move files from electron/ subdirectory to root
if [ -d "electron" ]; then
  # Move all files from electron/ to current directory
  mv electron/* .
  # Remove empty electron/ directory
  rmdir electron

  # Also move from src/lib if exists
  if [ -d "src" ]; then
    if [ -f "src/lib/db.js" ]; then
      mkdir -p ../lib
      mv src/lib/db.js ../lib/db.js
      rmdir -p src/lib 2>/dev/null || true
    fi
  fi
fi

echo "Electron build structure fixed"
