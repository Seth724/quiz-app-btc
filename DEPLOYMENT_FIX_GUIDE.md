# Fix: `__name is not a function` Error

## Problem

The error `__name is not a function` occurs when deployed contract modules are evaluated in the browser's SES (Secure ECMAScript) sandbox. This happens because:

1. The `__name` helper function is expected by compiled contract code but not defined in the SES scope
2. SES lockdown wasn't initialized before loading contracts
3. Old module specs (deployed without the prelude) are still being used

## Solution Overview

1. **Updated BC_PRELUDE** - Now defines `__name` globally-safe
2. **Enabled SES lockdown** - Runs before any contract operations
3. **Redeploy all contracts** - With the new prelude
4. **Update MODULE_SPECS** - Point to newly deployed contracts

## Files Changed

### 1. `packages/quiz-contracts/scripts/lib.ts`

**Before:**
```typescript
const BC_PRELUDE = `const __name = (target, value) => target;
`
```

**After:**
```typescript
const BC_PRELUDE = `
const __name = globalThis.__name || ((target, value) => target);
globalThis.__name = __name;
`
```

### 2. `apps/web/src/common-components/ClientProvider.tsx`

**Added SES lockdown initialization:**
```typescript
useEffect(() => {
  if (computerRef.current) return;

  // Initialize SES lockdown BEFORE creating Computer instance
  try {
    Computer.lockdown({
      consoleTaming: 'unsafe',
      errorTaming: 'unsafe',
      mathTaming: 'unsafe',
      dateTaming: 'unsafe',
      overrideTaming: 'severe',
    });
    console.log('✅ SES lockdown initialized');
  } catch (error: any) {
    if (!error.message?.includes('already called')) {
      console.warn('⚠️ SES lockdown warning:', error.message);
    }
  }

  // Create Computer instance AFTER lockdown
  const c = getComputer();
  computerRef.current = c;
  startTransition(() => setComputer(c));
}, []);
```

## Deployment Steps

### Step 1: Build the contracts package

```bash
cd packages/quiz-contracts
npm run build
```

### Step 2: Deploy all contracts with new prelude

```bash
npm run deploy
```

This will deploy all 7 contracts:
- Teacher
- Student
- Quiz
- QuizAttempt
- Payment (+ Withdraw)
- QuizAccess
- QuizAccessSale

### Step 3: Update environment variables

Copy the output from the deploy script and update your `.env` file:

```env
NEXT_PUBLIC_TEACHER_MOD_SPEC=<new_mod_spec>
NEXT_PUBLIC_STUDENT_MOD_SPEC=<new_mod_spec>
NEXT_PUBLIC_QUIZ_MOD_SPEC=<new_mod_spec>
NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC=<new_mod_spec>
NEXT_PUBLIC_PAYMENT_MOD_SPEC=<new_mod_spec>
NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC=<new_mod_spec>
NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC=<new_mod_spec>
```

### Step 4: Restart the development server

**Important:** Environment variables don't hot-reload reliably.

```bash
# Stop the dev server (Ctrl+C)
# Then restart
cd apps/web
npm run dev
```

### Step 5: Clear browser cache

Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R) to clear any cached module specs.

## Verification

### Check 1: Console logs

After restarting, you should see in the browser console:
```
✅ SES lockdown initialized
✅ Computer instance created
```

### Check 2: No `__name` errors

The error should no longer appear when:
- Loading deployed modules: `computer.load(modSpec)`
- Creating contract instances: `computer.new(Class, args)`
- Syncing contract state: `computer.sync(rev)`

### Check 3: Module source contains prelude

If your tooling allows viewing deployed module source, confirm it begins with:
```javascript
const __name = globalThis.__name || ((target, value) => target);
globalThis.__name = __name;
```

## Troubleshooting

### Error still occurs

1. **Check which module is failing** - Look at the console stack trace
2. **Verify all module specs are updated** - Check `.env` has all 7 new specs
3. **Confirm dev server restarted** - Old specs may be cached
4. **Clear browser cache** - Hard refresh

### Lockdown error

If you see "lockdown already called":
- This is normal and expected on fast-refresh
- The error is caught and ignored

### Insufficient balance for deployment

```bash
# For regtest
npm run fund:wallet

# For mainnet/testnet
# Fund the displayed address manually
```

## Why This Works

1. **Global `__name` definition** - The prelude now defines `__name` on `globalThis`, making it available to all subsequently evaluated contract code

2. **Lockdown before contracts** - SES lockdown must run before any contract loading to properly set up the secure evaluation environment

3. **Fresh deployment** - Old contracts deployed without the prelude will still fail; all contracts must be redeployed

## Architecture Notes

### Contract Loading Flow

```
ClientProvider.tsx
  └─> useEffect()
      ├─> Computer.lockdown()     ← Must run FIRST
      └─> getComputer()           ← Creates Computer instance
          └─> contract-loader.ts
              └─> computer.load(modSpec)  ← Loads deployed module
                  └─> Module code runs with __name available
```

### Module Spec Caching

The `contract-loader.ts` caches loaded modules:
```typescript
const moduleCache = new Map<string, any>()

export async function loadDeployedModule(computer: Computer, modSpec: string) {
  if (moduleCache.has(modSpec)) return moduleCache.get(modSpec)
  const mod = await computer.load(modSpec)
  moduleCache.set(modSpec, mod)
  return mod
}
```

This means after a successful load, the module is cached and won't be reloaded (avoiding repeated `__name` issues).

## Next Steps

After successful deployment:

1. Test creating a teacher
2. Test creating a quiz
3. Test student attempting quiz
4. Verify no `__name` errors in console

If all tests pass, the fix is complete.
