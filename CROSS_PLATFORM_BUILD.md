# Cross-Platform Build Guide

## Building Windows Executable

### On Windows (Recommended)

```bash
npm run build:windows:standalone
```

### On Linux/macOS

To build Windows executables from Linux or macOS, you'll need to set up a cross-platform build environment.

#### Prerequisites on Linux

1. Install Wine:
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install wine64 wine32

   # Fedora
   sudo dnf install wine

   # Arch Linux
   sudo pacman -S wine
   ```

2. Configure Wine:
   ```bash
   winecfg
   ```

#### Prerequisites on macOS

1. Install Homebrew if you haven't already:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. Install Wine:
   ```bash
   brew install --cask wine-stable
   ```

#### Building

Once Wine is installed, you can build the Windows executable:

```bash
npm run build:windows:standalone
```

## Build Process Overview

The build process consists of several steps:

1. **Clean previous builds**: Removes `dist/` and `dist-electron/` directories
2. **Build Next.js app**: Compiles the Next.js application for production
3. **Generate Prisma client**: Creates the Prisma client with the bundled schema
4. **Build Electron files**: Compiles TypeScript files in the `electron/` directory
5. **Package with Electron Builder**: Creates the standalone executables

## Output Files

After building, you'll find the following in the `dist/` directory:

### Windows
- `Paralegal AI Assistant Setup {version}.exe` - NSIS installer
- `Paralegal AI Assistant {version}.exe` - Portable executable

### macOS
- `Paralegal AI Assistant-{version}.dmg` - Disk image installer
- `Paralegal AI Assistant-{version}-mac.zip` - ZIP archive

### Linux
- `Paralegal AI Assistant-{version}.AppImage` - Universal Linux package
- `paralegal-ai-assistant_{version}_amd64.deb` - Debian package

## Standalone Package Contents

The standalone executable includes:

- Electron runtime (with bundled Node.js and Chromium)
- Next.js application bundle (.next directory)
- Public assets (images, fonts, etc.)
- Prisma database engine
- SQLite database support
- All required npm dependencies
- Configuration files

## What Gets Bundled vs. What Doesn't

### Bundled (included in the executable)
- Application code
- UI components and assets
- Node.js runtime
- Database engine
- All npm dependencies

### NOT Bundled (created at runtime)
- User database (created in %APPDATA% on Windows)
- Application logs
- User preferences
- Saved documents and notes

## Database in Standalone Build

The standalone executable uses SQLite as its database:

- **Location**: `%APPDATA%\paralegal-ai-assistant\database.db` (Windows)
- **Auto-initialization**: The database is created on first launch
- **Migration**: SQLite auto-migrates to match the schema
- **Portability**: The database can be backed up by copying the file

## Testing the Build

### Testing on Windows

1. Copy the `.exe` file to a Windows machine (or a Windows VM)
2. Run the executable
3. Verify:
   - Application launches successfully
   - Database is created
   - UI renders correctly
   - Features work as expected

### Testing on Linux/macOS

1. Build the respective target:
   ```bash
   # Linux
   npm run electron:linux

   # macOS
   npm run electron:mac
   ```
2. Run the generated package
3. Verify functionality

## Troubleshooting

### Build Fails

1. **Missing dependencies**:
   ```bash
   npm install
   ```

2. **TypeScript compilation errors**:
   ```bash
   npm run build:electron
   ```

3. **Prisma generation errors**:
   ```bash
   npx prisma generate
   ```

### Executable Won't Run

1. **Check logs**: Look in the console or log files
2. **Verify dependencies**: Ensure all required files are bundled
3. **Test Electron directly**:
   ```bash
   npm run build:electron
   electron .
   ```

### Database Issues

The database will be created automatically on first run. If you encounter issues:

1. Delete the database file
2. Restart the application
3. A new database will be created

## Advanced Configuration

### Customizing the Build

You can customize the build by editing `package.json`:

```json
"build": {
  "win": {
    "target": ["nsis", "portable"],
    "icon": "build/icon.ico"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true
  }
}
```

### Adding Additional Resources

To include additional files in the build, add them to the `files` or `extraResources` arrays in `package.json`:

```json
"extraResources": [
  {
    "from": "path/to/files",
    "to": "destination/in/app"
  }
]
```

### Code Signing (Windows)

For production releases, you may want to code sign your executable:

1. Obtain a code signing certificate
2. Configure in `package.json`:
   ```json
   "win": {
     "certificateFile": "path/to/cert.pfx",
     "certificatePassword": "password"
   }
   ```

## Performance Optimization

To reduce the executable size:

1. Use `--config.compression=maximum` in build script
2. Exclude unnecessary files from the build
3. Minimize dependencies
4. Use production builds (already enabled)

## Security Considerations

The standalone executable includes:

- **Context isolation**: Enabled (default)
- **Node integration**: Disabled (default)
- **Local server only**: Runs on 127.0.0.1:3000
- **No external API calls**: Unless configured
- **Local database**: No cloud dependencies

## Support

For build-related issues:
1. Check Electron Builder documentation: https://www.electron.build/
2. Check Electron documentation: https://www.electronjs.org/docs
3. Review build logs in `dist/` directory
4. Check application logs in `%APPDATA%\paralegal-ai-assistant\`
