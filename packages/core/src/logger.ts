export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface LogEntry { level: LogLevel; message: string; context?: Record<string, unknown>; timestamp: string; }

export class Logger {
  private levels: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

  constructor(private name: string, private minLevel: LogLevel = 'info') {}

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.minLevel];
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    if (!this.shouldLog(level)) return;
    const entry: LogEntry = {
      level,
      message: `[${this.name}] ${message}`,
      context,
      timestamp: new Date().toISOString()
    };
    
    // In a real app this might write to a file or standard output
    const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : level === 'info' ? console.info : console.debug;
    consoleMethod(JSON.stringify(entry));
  }

  debug(msg: string, ctx?: Record<string, unknown>): void { this.log('debug', msg, ctx); }
  info(msg: string, ctx?: Record<string, unknown>): void { this.log('info', msg, ctx); }
  warn(msg: string, ctx?: Record<string, unknown>): void { this.log('warn', msg, ctx); }
  error(msg: string, ctx?: Record<string, unknown>): void { this.log('error', msg, ctx); }

  child(name: string): Logger {
    return new Logger(`${this.name}:${name}`, this.minLevel);
  }
}
