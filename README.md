# 🎉 AI Note-Taking Assistant for Paralegals

A fun, personality-driven AI assistant built specifically for paralegals! Take notes, reword legal documents professionally, and let the AI learn your workflow patterns.

## ✨ Perfect for Paralegals

- **📝 Professional Document Rewording** - Transform casual notes into professional legal language
- **🗂️ Case Note Management** - Organize case notes with search and tags
- **🎯 Task Automation** - Learn repetitive legal tasks and execute them on command
- **💬 AI Assistant with Personality** - Choose Sassy, Cheerful, or Witty to make work more fun!
- **🔒 Secure Storage** - Your data is stored securely (locally or in database)

## 🚀 Quick Start (For Your Mom)

### Option 1: Windows Standalone Executable (Easiest for Windows Users!)

**No installation of Python, Node.js, or anything else required!**

1. Download the Windows executable: `Paralegal AI Assistant Setup {version}.exe`
2. Double-click to install
3. Launch from your desktop or Start menu
4. Start using immediately - everything is included!

**See [STANDALONE_BUILD.md](./STANDALONE_BUILD.md) for building instructions.**

### Option 2: Vercel Deployment (Easiest - No Setup!)

1. **Click the Deploy button** (if available) or follow these steps:
2. Go to [vercel.com](https://vercel.com) and create a free account
3. Click "Add New Project" → "Import Git Repository"
4. Connect your GitHub repository with this code
5. Vercel will automatically detect it's a Next.js app
6. Click **Deploy** and wait ~2 minutes
7. That's it! Your app will be live at `https://your-app.vercel.app`

### Option 3: Local Development

```bash
# Install dependencies
bun install

# Set up database
bun run db:push

# Start development server
bun run dev

# Open http://localhost:3000
```

## 🎭 Choose Your AI Personality

1. **Sassy 😏** - Confident, playful, makes legal drafting fun
2. **Cheerful 🎉** - Enthusiastic, great for staying motivated
3. **Witty 🧠** - Clever and sophisticated, perfect for legal precision

## 💡 How to Use for Legal Work

### 📜 Reword Legal Documents

1. Type your rough note in the chat
2. Click **"Reword This Nicely ✨"**
3. Choose style: "Professional" or "Formal"
4. AI transforms it into polished legal language!

**Example:**
- Your input: "client said they never signed anything"
- AI output: "The client expressly denies having executed any documentation pertaining to this matter."

### 🗒️ Organize Case Notes

1. Go to **Notes** tab
2. Click **Create Note**
3. Add case number as title
4. Paste notes, observations, client communications
5. Use search to find notes by case number or keyword

### ⚡ Automate Tasks

The AI learns from what you do! Soon it can:
- Draft standard documents
- Fill in templates
- Format citations
- Create case summaries
- And more!

## 🔧 Deployment Guide

### Deploy to Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Add environment variables
vercel env add DATABASE_URL

# 5. Deploy to production
vercel --prod
```

### Environment Variables Needed

Create a `.env` file:

```env
DATABASE_URL="file:./db/dev.db"  # For local
# For production, use PostgreSQL or MySQL URL
```

### Database Setup

```bash
# Push schema to database
bun run db:push

# Generate Prisma Client
bun run db:generate

# Create migrations (for production)
bun run db:migrate
```

## 📦 Project Structure

```
my-project/
├── src/
│   ├── app/
│   │   ├── api/          # Backend API routes
│   │   │   ├── chat/     # AI chat with personality
│   │   │   ├── notes/    # Note CRUD operations
│   │   │   ├── reword/   # Text rewording
│   │   │   └── tasks/    # Task learning & execution
│   │   └── page.tsx      # Main frontend
│   ├── components/ui/    # shadcn/ui components
│   └── lib/
│       └── db.ts         # Prisma database client
├── prisma/
│   └── schema.prisma     # Database schema
└── vercel.json          # Vercel configuration
```

## 🖥️ Windows Standalone Executable

The project includes complete support for building standalone Windows executables:

### Build Commands

```bash
# Build Windows standalone executable
npm run build:windows:standalone

# Build for other platforms
npm run electron:mac      # macOS
npm run electron:linux    # Linux
```

### Features

- ✅ **No Dependencies Required** - Users don't need Python, Node.js, or anything else
- ✅ **Everything Included** - Electron runtime, Node.js, Chromium, and all dependencies
- ✅ **Two Options**:
  - **NSIS Installer** - Professional installer with custom directory, shortcuts, and uninstaller
  - **Portable Executable** - Run from anywhere without installation
- ✅ **Local Database** - SQLite database stored in user's AppData
- ✅ **Offline-First** - No external dependencies or internet connection required

### Build Output

After building, you'll find:
- `dist/Paralegal AI Assistant Setup {version}.exe` - NSIS installer (~150-200 MB)
- `dist/Paralegal AI Assistant {version}.exe` - Portable executable (~150-200 MB)

### Documentation

- [STANDALONE_BUILD.md](./STANDALONE_BUILD.md) - Comprehensive build guide
- [WINDOWS_BUILD.md](./WINDOWS_BUILD.md) - Windows-specific instructions
- [USER_GUIDE.md](./USER_GUIDE.md) - End-user quick start guide
- [BUILD_COMPLETE.md](./BUILD_COMPLETE.md) - Setup verification and build status

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI)
- **Database**: Prisma ORM + SQLite (can use PostgreSQL/MySQL)
- **AI**: z-ai-web-dev-sdk (LLM for chat & rewording)
- **Animations**: Framer Motion
- **State**: Zustand + TanStack Query

## 🔒 Privacy & Security

For legal work, privacy is critical! Consider these security measures:

1. **Use Self-Hosted Database** - Don't rely on free tier databases for client data
2. **Enable Authentication** - Add NextAuth.js for multi-user access
3. **Use HTTPS** - Always enabled in production
4. **Regular Backups** - Backup database regularly
5. **Access Control** - Limit who can access the app

## 📱 Accessibility

- ✅ Fully responsive (works on phone, tablet, desktop)
- ✅ Keyboard navigation support
- ✅ High contrast mode
- ✅ Screen reader friendly

## 🆘 Getting Help

### Common Issues

**Database not working?**
```bash
# Reset database
bun run db:reset
```

**Build errors?**
```bash
# Clean build
rm -rf .next node_modules
bun install
bun run build
```

**API not responding?**
- Check dev logs: `tail -f dev.log`
- Ensure environment variables are set
- Verify database is running

## 🎯 Future Enhancements (Planned)

- [ ] **Document Templates** - Pre-built legal document templates
- [ ] **Case Management** - Track multiple cases with client info
- [ ] **Calendar Integration** - Court dates, deadlines, appointments
- [ ] **File Upload** - Upload and analyze documents
- [ ] **Citation Generator** - Auto-format legal citations
- [ ] **Client Portal** - Secure client communication
- [ ] **Mobile App** - Native iOS and Android apps
- [ ] **Offline Mode** - Work without internet connection

## 🤝 Contributing

This is a personal project for your mom, but feel free to customize it!

## 📄 License

Personal Use - Feel free to use and modify for personal or professional needs.

---

Made with ❤️ for paralegals everywhere! Need help? Just ask the AI assistant - it's always watching (in a helpful way) 😉
