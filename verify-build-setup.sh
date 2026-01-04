#!/bin/bash

echo "=========================================="
echo "Verifying Windows Standalone Build Setup"
echo "=========================================="
echo ""

ERRORS=0

# Check required files
echo "Checking required files..."

FILES=(
  "package.json"
  "electron/main.ts"
  "electron/preload.ts"
  "electron/database.ts"
  "electron/handlers.ts"
  "electron-server.js"
  "prisma/schema.prisma"
  "build/icon.ico"
  "build/icon.png"
  "build/icon.icns"
  "build-standalone-windows.sh"
  "scripts/fix-electron-build.sh"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ $file"
  else
    echo "✗ $file (MISSING)"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""
echo "Checking required directories..."

DIRS=(
  "electron"
  "prisma"
  "build"
  "src"
  "public"
)

for dir in "${DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "✓ $dir/"
  else
    echo "✗ $dir/ (MISSING)"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""
echo "Checking package.json configuration..."

# Check for build scripts
if grep -q '"build:windows:standalone"' package.json; then
  echo "✓ build:windows:standalone script exists"
else
  echo "✗ build:windows:standalone script missing"
  ERRORS=$((ERRORS + 1))
fi

if grep -q '"build:electron"' package.json; then
  echo "✓ build:electron script exists"
else
  echo "✗ build:electron script missing"
  ERRORS=$((ERRORS + 1))
fi

if grep -q '"electron:windows"' package.json; then
  echo "✓ electron:windows script exists"
else
  echo "✗ electron:windows script missing"
  ERRORS=$((ERRORS + 1))
fi

echo ""
echo "Checking build configuration..."

if grep -q '"build"' package.json; then
  echo "✓ build configuration exists in package.json"
else
  echo "✗ build configuration missing from package.json"
  ERRORS=$((ERRORS + 1))
fi

if grep -q '"files"' package.json | grep -A 10 '"build"'; then
  echo "✓ files array defined in build config"
else
  echo "⚠ files array may not be properly configured"
fi

if grep -q '"extraResources"' package.json | grep -A 10 '"build"'; then
  echo "✓ extraResources defined in build config"
else
  echo "⚠ extraResources may not be properly configured"
fi

echo ""
echo "Checking dependencies..."

if grep -q '"electron"' package.json; then
  echo "✓ electron dependency found"
else
  echo "✗ electron dependency missing"
  ERRORS=$((ERRORS + 1))
fi

if grep -q '"electron-builder"' package.json; then
  echo "✓ electron-builder dependency found"
else
  echo "✗ electron-builder dependency missing"
  ERRORS=$((ERRORS + 1))
fi

if grep -q '"@prisma/client"' package.json; then
  echo "✓ @prisma/client dependency found"
else
  echo "✗ @prisma/client dependency missing"
  ERRORS=$((ERRORS + 1))
fi

echo ""
echo "Checking for Windows build script permissions..."

if [ -x "build-standalone-windows.sh" ]; then
  echo "✓ build-standalone-windows.sh is executable"
else
  echo "⚠ build-standalone-windows.sh is not executable (run: chmod +x build-standalone-windows.sh)"
fi

if [ -x "scripts/fix-electron-build.sh" ]; then
  echo "✓ scripts/fix-electron-build.sh is executable"
else
  echo "⚠ scripts/fix-electron-build.sh is not executable"
fi

echo ""
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
  echo "✓ All checks passed! Ready to build."
  echo ""
  echo "To build the Windows standalone executable, run:"
  echo "  npm run build:windows:standalone"
  echo ""
  echo "Or use the script directly:"
  echo "  bash build-standalone-windows.sh"
  exit 0
else
  echo "✗ Found $ERRORS error(s). Please fix before building."
  exit 1
fi
