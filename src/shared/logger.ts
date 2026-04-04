type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
}

class Logger {
  private readonly isProduction: boolean;

  constructor() {
    this.isProduction = process.env["NODE_ENV"] === "production";
  }

  private write(
    level: LogLevel,
    message: string,
    context?: string,
    data?: unknown,
  ): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    if (context !== undefined) entry.context = context;
    if (data !== undefined) entry.data = data;

    if (this.isProduction) {
      const out = level === "error" ? process.stderr : process.stdout;
      out.write(JSON.stringify(entry) + "\n");
    } else {
      const prefix = `[${entry.timestamp}] ${level.toUpperCase().padEnd(5)}`;
      const ctx = context !== undefined ? ` [${context}]` : "";
      const line = `${prefix}${ctx}  ${message}`;

      if (level === "error") {
        console.error(line, data ?? "");
      } else if (level === "warn") {
        console.warn(line, data ?? "");
      } else {
        console.log(line, data ?? "");
      }
    }
  }

  debug(message: string, context?: string, data?: unknown): void {
    if (!this.isProduction) this.write("debug", message, context, data);
  }

  info(message: string, context?: string, data?: unknown): void {
    this.write("info", message, context, data);
  }

  warn(message: string, context?: string, data?: unknown): void {
    this.write("warn", message, context, data);
  }

  error(message: string, context?: string, data?: unknown): void {
    this.write("error", message, context, data);
  }
}

export const logger = new Logger();
