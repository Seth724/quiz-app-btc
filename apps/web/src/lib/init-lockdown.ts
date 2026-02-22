/**
 * SES Lockdown Initialization
 * This MUST be imported before any @bitcoin-computer/lib imports
 * 
 * IMPORTANT: This runs at module load time, BEFORE any React components render
 */

// Initialize SES lockdown immediately on import (only in browser)
if (typeof window !== 'undefined') {
  try {
    // Define __name globally BEFORE lockdown and before any BC imports
    // This ensures it's available for deployed contract code
    if (!(globalThis as any).__name) {
      (globalThis as any).__name = (target: any, value?: string) => target;
    }
    
    // Dynamically import Computer to avoid circular dependencies
    // @ts-ignore - Computer.lockdown is available at runtime
    const { Computer } = require('@bitcoin-computer/lib');
    
    // Use more permissive settings to avoid conflicts with BC library
    Computer.lockdown({
      consoleTaming: 'unsafe',
      errorTaming: 'unsafe',
      mathTaming: 'unsafe',
      dateTaming: 'unsafe',
      overrideTaming: 'min',
    });
    
    // Log to console (this is safe, not a React state update)
    console.log('✅ SES lockdown initialized (early init)');
    console.log('✅ __name polyfill defined globally');
  } catch (error: any) {
    // Lockdown might already be called, which is fine
    if (!error.message?.includes('already called')) {
      console.warn('⚠️ SES lockdown warning:', error.message);
    }
  }
}

export {};
