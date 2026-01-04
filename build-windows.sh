#!/bin/bash

# Clean build directories
echo "Cleaning build directories..."
rm -rf dist dist-electron

# Use existing dev build (works!)
echo "Using existing .next build..."
if [ ! -d ".next" ]; then
  echo "Error: .next directory not found!"
  echo "Run 'bun run dev' first to create build, then:"
  echo "Run: bun run electron:pack-dev"
  exit 1
fi

# Build Electron TypeScript
echo "Building Electron TypeScript files..."
bun run build:electron

# Prepare packaging directory
echo "Preparing packaging..."
mkdir -p dist/electron

# Copy files
echo "Copying files to package..."
cp -r dist-electron dist/electron/
cp package.json dist/electron/
cp -r .next dist/electron/
cp -r public dist/electron/
cp -r prisma dist/electron/

# Copy node_modules (selectively)
echo "Copying required node_modules..."
mkdir -p dist/electron/node_modules
cp -r node_modules/.prisma dist/electron/node_modules/
cp -r node_modules/@prisma dist/electron/node_modules/

# Copy electron-server.js
cp electron-server.js dist/electron/

echo "Build preparation complete!"
echo "Now run: cd dist/electron && electron-builder -w"
