# Windows Standalone Executable Build

This document provides a complete guide to building a standalone Windows executable (.exe) for the Paralegal AI Assistant that can be run without requiring Python, Node.js, or any other dependencies.

## Quick Start

### Building the Executable

Run the following command:

```bash
npm run build:windows:standalone
```

This will create two files in the `dist/` directory:
- `Paralegal AI Assistant Setup {version}.exe` - NSIS installer
- `Paralegal AI Assistant {version}.exe` - Portable executable

### What's Included

The standalone executable includes everything needed to run the application:

✓ Electron runtime (with bundled Node.js and Chromium)
✓ Next.js application bundle
✓ SQLite database engine
✓ All required npm dependencies
✓ Application assets and resources

The user only needs to download and run the executable - no other installations required!

## Detailed Build Process

### Step 1: Clean Previous Builds

The build script removes any previous build artifacts to ensure a clean build.

### Step 2: Build Next.js Application

```bash
npm run build:prod
```

This compiles the Next.js application for production and creates the `.next` directory.

### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

This generates the Prisma client with the bundled database schema.

### Step 4: Build Electron Files

```bash
npm run build:electron
```

This compiles the TypeScript files in the `electron/` directory to JavaScript.

### Step 5: Package with Electron Builder

```bash
electron-builder -w --config.compression=maximum
```

This creates the Windows executable with maximum compression for smaller file size.

## Build Requirements

### On Windows

- Node.js v18 or higher
- npm (comes with Node.js)
- Git (optional, for cloning)

### On Linux/macOS (Cross-Platform Build)

To build Windows executables from Linux or macOS, you need Wine:

**Linux:**
```bash
sudo apt-get install wine64 wine32  # Ubuntu/Debian
sudo dnf install wine                  # Fedora
sudo pacman -S wine                    # Arch Linux
```

**macOS:**
```bash
brew install --cask wine-stable
```

## Build Output

After a successful build, you'll find the following in the `dist/` directory:

### Windows

**NSIS Installer** (Recommended for distribution)
```
Paralegal AI Assistant Setup {version}.exe
```
- Allows users to choose installation directory
- Creates desktop shortcut
- Adds to Start menu
- Includes uninstaller
- File size: ~150-200 MB (compressed)

**Portable Executable** (For quick testing)
```
Paralegal AI Assistant {version}.exe
```
- No installation required
- Run directly from any location
- Creates data in AppData
- File size: ~150-200 MB (compressed)

## Distribution Options

### Option 1: NSIS Installer (Recommended)

**Best for:** General distribution, enterprise users, users who prefer traditional installation

**Pros:**
- Professional installer experience
- Customizable installation directory
- Automatic desktop and Start menu shortcuts
- Includes uninstaller
- More trusted by users

**Cons:**
- Slightly larger file size
- Requires administrator privileges (optional)

### Option 2: Portable Executable

**Best for:** Quick testing, portable use, users who prefer not to install

**Pros:**
- No installation required
- Can run from USB drive
- No administrator privileges needed
- Easy to try out

**Cons:**
- No automatic shortcuts
- Less professional appearance
- Users must manually manage the executable

## User Installation Guide

### Using the NSIS Installer

1. Download `Paralegal AI Assistant Setup {version}.exe`
2. Double-click to run the installer
3. Follow the installation wizard:
   - Choose installation directory (default: `%LOCALAPPDATA%\Programs\paralegal-ai-assistant`)
   - Select whether to create desktop shortcut
   - Select whether to add to Start menu
4. Click "Install" to begin installation
5. Click "Finish" when complete
6. Launch the application from:
   - Desktop shortcut (if created)
   - Start menu
   - Installation directory

### Using the Portable Executable

1. Download `Paralegal AI Assistant {version}.exe`
2. Place it in any directory of your choice
3. Double-click to run
4. Application data will be stored in:
   - `%APPDATA%\paralegal-ai-assistant\`

## Application Data Location

All user data is stored in:

```
%APPDATA%\paralegal-ai-assistant\
```

This includes:
- **database.db** - SQLite database with all user data
- **logs/** - Application logs
- **schema.prisma** - Database schema file
- User preferences and settings

### Backing Up Data

To backup your data:
1. Close the application
2. Navigate to `%APPDATA%\paralegal-ai-assistant\`
3. Copy the entire directory to a backup location

### Restoring Data

To restore your data:
1. Close the application
2. Navigate to `%APPDATA%\paralegal-ai-assistant\`
3. Replace the directory contents with your backup
4. Restart the application

## Uninstalling

### NSIS Installer Version

1. Open Settings > Apps > Installed apps
2. Find "Paralegal AI Assistant"
3. Click "Uninstall"
4. Follow the uninstaller prompts
5. Optionally delete the data directory manually

### Portable Version

1. Simply delete the executable file
2. Manually delete the data directory:
   ```
   %APPDATA%\paralegal-ai-assistant
   ```

## Troubleshooting

### Build Issues

**Issue:** Build fails with TypeScript errors
```bash
# Solution: Check TypeScript compilation
npm run build:electron
```

**Issue:** Build fails with Prisma errors
```bash
# Solution: Regenerate Prisma client
npx prisma generate
```

**Issue:** Build fails with file not found errors
```bash
# Solution: Run verification script
bash verify-build-setup.sh
```

### Runtime Issues

**Issue:** Application won't start
- Check if another instance is already running
- Verify port 3000 is not in use
- Check Windows Event Viewer for error logs

**Issue:** Database errors
- Close the application
- Delete the database file: `%APPDATA%\paralegal-ai-assistant\database.db`
- Restart the application (a new database will be created)

**Issue:** Performance issues
- Close other resource-intensive applications
- Ensure at least 4GB RAM is available
- Check disk space (ensure at least 1GB free)

## Advanced Build Options

### Custom Build Configuration

You can customize the build by editing `package.json`:

```json
"build": {
  "win": {
    "target": [
      {
        "target": "nsis",
        "arch": ["x64"]
      },
      {
        "target": "portable",
        "arch": ["x64"]
      }
    ],
    "icon": "build/icon.ico"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true
  }
}
```

### Code Signing (Production)

For production releases, code sign your executable:

1. Obtain a code signing certificate from a trusted CA
2. Configure in `package.json`:
   ```json
   "win": {
     "certificateFile": "path/to/cert.pfx",
     "certificatePassword": "password",
     "certificateSha1": "SHA1_HASH",
     "publisherName": "Your Company Name"
   }
   ```
3. Build again with code signing enabled

### Compression Levels

To reduce file size, use maximum compression (already enabled in the build script):

```bash
electron-builder -w --config.compression=maximum
```

Compression levels:
- `store` - No compression (largest file, fastest build)
- `normal` - Default compression
- `maximum` - Maximum compression (smallest file, slower build)

## Verification

After building, verify the executable:

1. **File size check**:
   - Should be ~150-200 MB (compressed)
   - Larger sizes may indicate unnecessary files are included

2. **Launch test**:
   - Double-click the executable
   - Verify the application launches
   - Check that the UI loads correctly
   - Test basic functionality

3. **Database test**:
   - Create a test note
   - Close and reopen the application
   - Verify the note persists

4. **No dependencies test**:
   - Try running on a clean Windows machine
   - Verify it works without Node.js or Python installed

## Performance Considerations

### Build Time

Typical build times:
- Clean build: 5-10 minutes
- Incremental build: 3-5 minutes
- On slower machines: up to 15 minutes

### File Size

Expected file sizes:
- NSIS installer: ~150-200 MB
- Portable executable: ~150-200 MB
- Installed application: ~300-400 MB (uncompressed)

### Runtime Performance

The application runs with:
- Memory: ~200-500 MB typical usage
- CPU: Minimal impact when idle
- Disk: ~300-400 MB installed size

## Security Features

The standalone executable includes several security features:

✓ **Context Isolation**: Enabled (prevents code injection)
✓ **Node Integration**: Disabled (reduces attack surface)
✓ **Local Server Only**: Runs on 127.0.0.1:3000 (not exposed externally)
✓ **No External API Calls**: Unless configured (offline-first)
✓ **Local Database**: No cloud dependencies
✓ **Code Signing**: Available for production builds

## Distribution Checklist

Before distributing the executable:

- [ ] Build on the target platform (Windows)
- [ ] Test on a clean Windows machine
- [ ] Verify all features work correctly
- [ ] Check for any dependency issues
- [ ] Ensure file size is reasonable
- [ ] Consider code signing for production
- [ ] Test the uninstaller (for NSIS version)
- [ ] Create a checksum for download verification
- [ ] Prepare installation instructions
- [ ] Create a user guide

## Getting Help

If you encounter issues:

1. Check the build logs in `dist/` directory
2. Review the main `README.md`
3. Check the application logs in `%APPDATA%\paralegal-ai-assistant\`
4. Search for similar issues in the repository
5. Create a new issue with:
   - Build logs
   - Error messages
   - System information (OS version, Node.js version)
   - Steps to reproduce

## License

Copyright © 2024 Paralegal AI Assistant

The standalone executable includes:
- Electron (MIT license)
- Node.js (MIT license)
- Chromium (BSD license)
- Various npm dependencies (see package.json)
