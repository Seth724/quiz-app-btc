/**
 * Type augmentation for @bitcoin-computer/lib Computer class.
 * Adds the `latest()` method which exists at runtime but is missing
 * from the shipped type declarations (which only expose the deprecated `getLatestRev`).
 */
import '@bitcoin-computer/lib'

declare module '@bitcoin-computer/lib' {
  interface Computer {
    /** Resolve the latest revision of a smart object by its root id */
    latest(id: string): Promise<string>
  }
}
