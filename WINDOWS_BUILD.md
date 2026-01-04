# Paralegal AI Assistant - Windows Standalone Build

This document explains how to build and use the Windows standalone executable for the Paralegal AI Assistant.

## Building the Windows Standalone Executable

### Prerequisites

Before building the Windows executable, ensure you have the following installed:

1. **Node.js** (v18 or higher) - Download from https://nodejs.org/
2. **npm** (comes with Node.js)
3. **Git** (for cloning the repository)

### Building on Windows

1. Open a Command Prompt or PowerShell terminal

2. Navigate to the project directory:
   ```bash
   cd path\to\paralegal-ai-assistant
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build the standalone Windows executable:
   ```bash
   npm run build:windows:standalone
   ```

This process will:
- Clean previous build artifacts
- Build the Next.js application
- Generate the Prisma client
- Build Electron TypeScript files
- Create the Windows executable

### Build Output

After a successful build, you will find the following files in the `dist/` directory:

- **Paralegal AI Assistant Setup x.x.x.exe** - NSIS installer (allows custom installation directory)
- **Paralegal AI Assistant x.x.x.exe** - Portable executable (runs without installation)

## Installing the Application

### Using the Installer (Recommended)

1. Double-click `Paralegal AI Assistant Setup x.x.x.exe`
2. Follow the installation wizard
3. Choose your preferred installation directory (default: `C:\Users\<username>\AppData\Local\Programs\paralegal-ai-assistant`)
4. Complete the installation
5. Launch the application from the desktop shortcut or Start menu

### Using the Portable Version

1. Download `Paralegal AI Assistant x.x.x.exe`
2. Place it in any directory of your choice
3. Double-click to run
4. The application will create necessary data files in your AppData directory

## First-Time Setup

When you launch the application for the first time:

1. The application will start a local web server on port 3000
2. A database will be initialized in your AppData directory:
   - Path: `%APPDATA%\paralegal-ai-assistant\database.db`
3. The main application window will open

## Application Data Location

All application data is stored in:
```
%APPDATA%\paralegal-ai-assistant\
```

This includes:
- SQLite database (`database.db`)
- Application logs
- User preferences
- Saved notes and documents

## Uninstalling

### If using the installer:

1. Go to Settings > Apps > Installed apps
2. Find "Paralegal AI Assistant"
3. Click Uninstall
4. Follow the uninstaller prompts
5. Optionally, delete the data directory manually

### If using the portable version:

1. Simply delete the executable file
2. Manually delete the data directory if desired:
   ```
   %APPDATA%\paralegal-ai-assistant
   ```

## Troubleshooting

### Application won't start

1. Check if another instance is already running
2. Check Windows Event Viewer for error logs
3. Verify port 3000 is not in use by another application

### Database errors

1. Close the application
2. Navigate to `%APPDATA%\paralegal-ai-assistant`
3. Rename or delete `database.db`
4. Restart the application (a new database will be created)

### Performance issues

1. Close other resource-intensive applications
2. Ensure you have at least 4GB RAM available
3. Check disk space (ensure at least 1GB free)

## Building on Linux/macOS for Windows Target

You can build the Windows executable from Linux or macOS using Wine and Electron Builder:

1. Install Wine (Linux) or use the macOS cross-platform build tools
2. Follow the same build command:
   ```bash
   npm run build:windows:standalone
   ```

Note: Building from non-Windows platforms may require additional configuration.

## Development

For development and testing, you don't need to build the executable. Instead:

1. Run the development server:
   ```bash
   npm run dev
   ```
2. Or run Electron in development mode:
   ```bash
   npm run electron:dev
   ```

## Technical Details

### Included Dependencies

The standalone executable includes:
- Electron runtime
- Node.js runtime
- Next.js application bundle
- Prisma database engine
- All required npm dependencies

### Network Requirements

The application runs entirely offline after installation. It uses:
- Local web server (127.0.0.1:3000)
- Local SQLite database
- No external API calls (except for AI features if configured)

### Security

- The application runs in an isolated Electron environment
- All data is stored locally
- No telemetry or data collection
- Context isolation is enabled for security

## Support

For issues or questions:
1. Check the main README.md
2. Review existing issues in the repository
3. Create a new issue with detailed error information

## License

Copyright © 2024 Paralegal AI Assistant
