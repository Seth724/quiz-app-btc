# Quick Start Guide

This guide will help you get the restructured Quiz App up and running.

## Prerequisites

- Node.js 18+ installed
- npm 10+ installed
- A Bitcoin Computer node running (for regtest) or access to testnet/mainnet

## Step 1: Install Dependencies

```bash
# From repository root
npm install
```

This will install dependencies for all workspaces (apps/web, packages/sdk, packages/shared, packages/quiz-contracts).

## Step 2: Environment Configuration

```bash
# Copy environment template
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local`:

```env
# For local development (regtest)
NEXT_PUBLIC_CHAIN=LTC
NEXT_PUBLIC_NETWORK=regtest
NEXT_PUBLIC_URL=http://localhost:1031

# Module specs will be added after deployment
```

## Step 3: Build Packages

Build packages in dependency order:

```bash
# Build shared types
npm run build:shared

# Build SDK
npm run build:sdk
```

## Step 4: Deploy Contracts (First Time Only)

If you haven't deployed contracts yet:

```bash
# Make sure you have a funded wallet for deployment
npm run deploy
```

This will output module specifications like:

```
NEXT_PUBLIC_TEACHER_MOD=...
NEXT_PUBLIC_STUDENT_MOD=...
NEXT_PUBLIC_QUIZ_MOD=...
NEXT_PUBLIC_QUIZ_ATTEMPT_MOD=...
NEXT_PUBLIC_PAYMENT_MOD=...
```

**Copy these values to your `apps/web/.env.local` file.**

## Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Verification Checklist

- [ ] Dependencies installed without errors
- [ ] `.env.local` file created and configured
- [ ] `packages/shared` built successfully
- [ ] `packages/sdk` built successfully
- [ ] Contracts deployed (module specs in .env.local)
- [ ] Development server started
- [ ] App loads in browser
- [ ] No console errors

## Troubleshooting

### Error: Cannot find module '@quiz-app/sdk'

**Solution:** Build SDK package first
```bash
npm run build:sdk
```

### Error: Cannot find module '@quiz-app/shared'

**Solution:** Build shared package first
```bash
npm run build:shared
```

### Error: Module specification missing

**Solution:** Deploy contracts and add module specs to .env.local
```bash
npm run deploy
# Then copy the output to apps/web/.env.local
```

### Error: Connection refused to blockchain node

**Solution:** Check that your blockchain node is running and the URL in `.env.local` is correct.

For regtest:
```bash
# Make sure Bitcoin Computer node is running on localhost:1031
# Or update NEXT_PUBLIC_URL to match your node
```

### TypeScript errors about path aliases

**Solution:** Ensure your IDE is using the workspace TypeScript version
- VS Code: CMD/CTRL + Shift + P → "TypeScript: Select TypeScript Version" → "Use Workspace Version"

## Project Structure Overview

```
apps/
  web/                      # Next.js frontend
    src/
      app/                  # Pages
      components/           # UI components
      config/               # Configuration
      stores/               # State management
      services/             # Business logic
      hooks/                # React hooks
      lib/                  # Utilities

packages/
  quiz-contracts/           # Smart contracts
  sdk/                      # SDK clients
  shared/                   # Shared types
```

## Development Workflow

1. **Make changes** to your code
2. **If editing SDK/shared**, rebuild:
   ```bash
   npm run build:sdk
   # or
   npm run build:shared
   ```
3. **Hot reload** works for apps/web changes
4. **Test** your changes

## Common Commands

```bash
# Development
npm run dev              # Start web app
npm run dev:web         # Same as above

# Building
npm run build:shared    # Build shared package
npm run build:sdk       # Build SDK package
npm run build:web       # Build web app
npm run build           # Build all

# Testing
npm test                # Run all tests
npm run test --workspace=@quiz-app/contracts  # Contract tests only

# Linting
npm run lint            # Lint all packages
npm run lint:fix        # Auto-fix lint issues

# Contracts
npm run deploy          # Deploy contracts
npm run fund:wallet     # Fund deployment wallet (regtest only)
```

## Next Steps

1. **Explore the UI** - Navigate between Teacher and Student dashboards
2. **Create a Quiz** (Teacher) - Try creating your first quiz
3. **Attempt a Quiz** (Student) - Try taking a quiz
4. **Check Documentation** - Read ARCHITECTURE.md and MIGRATION_GUIDE.md

## Getting Help

- **Architecture:** See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Migration from old structure:** See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
- **Next steps:** See [TODO.md](TODO.md)
- **Bitcoin Computer Docs:** https://docs.bitcoincomputer.io/

## Success Indicators

You'll know everything is working when:
- ✅ App loads without errors
- ✅ Wallet page shows configuration
- ✅ Teacher dashboard loads
- ✅ Student dashboard loads
- ✅ No TypeScript errors in console
- ✅ Hot reload works

Happy coding! 🚀
