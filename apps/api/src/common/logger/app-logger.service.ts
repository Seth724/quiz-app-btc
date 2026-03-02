import { ConsoleLogger, Injectable } from '@nestjs/common';

/**
 * Custom application logger extending NestJS's ConsoleLogger.
 * Adds structured context and can be extended to write to files or external services.
 */
@Injectable()
export class AppLogger extends ConsoleLogger {
  error(message: string, stack?: string, context?: string) {
    // Could add external logging (e.g., Sentry, file transport) here
    super.error(message, stack, context);
  }

  warn(message: string, context?: string) {
    super.warn(message, context);
  }

  log(message: string, context?: string) {
    super.log(message, context);
  }

  debug(message: string, context?: string) {
    super.debug(message, context);
  }
}
