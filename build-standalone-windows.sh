#!/bin/bash

set -e

echo "=========================================="
echo "Building Paralegal AI Assistant for Windows"
echo "=========================================="
echo ""

# Clean build directories
echo "Cleaning build directories..."
rm -rf dist dist-electron

# Build the Next.js app
echo "Building Next.js application..."
npm run build:prod

echo ""

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

echo ""

# Build Electron TypeScript files
echo "Building Electron TypeScript files..."
npm run build:electron

echo ""

# Verify electron files exist
if [ ! -f "dist-electron/main.js" ]; then
  echo "Error: dist-electron/main.js not found!"
  exit 1
fi

if [ ! -f "dist-electron/preload.js" ]; then
  echo "Error: dist-electron/preload.js not found!"
  exit 1
fi

echo "Electron build successful!"
echo ""

# Build Windows executable
echo "Building Windows executable..."
electron-builder -w --config.compression=maximum

echo ""
echo "=========================================="
echo "Build complete!"
echo "=========================================="
echo "Output location: dist/"
echo ""
echo "Generated files:"
ls -lh dist/*.exe 2>/dev/null || echo "No .exe files found in dist/"
echo ""

echo "Setup files:"
ls -lh dist/*.exe 2>/dev/null || echo "No setup files found in dist/"
echo ""
