/**
 * Centralized Application Logger
 * Supports level-based logging for development and production environments.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const ctxString = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${ctxString}`;
  }

  debug(message: string, context?: Record<string, any>): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: Record<string, any>): void {
    console.info(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: Record<string, any>): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: unknown, context?: Record<string, any>): void {
    const errorDetails = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : { error };
    const mergedContext = { ...errorDetails, ...context };
    console.error(this.formatMessage('error', message, mergedContext));
  }
}

export const logger = new Logger();
