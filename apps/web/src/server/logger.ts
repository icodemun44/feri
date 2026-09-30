type LogContext = Record<string, unknown>;

type LogLevel = "info" | "warn" | "error";

export const describeError = (error: unknown): LogContext => {
  if (error instanceof Error) {
    return { errorName: error.name, errorMessage: error.message, errorStack: error.stack };
  }
  return { errorMessage: String(error) };
};

const writeLog = (level: LogLevel, message: string, context: LogContext = {}): void => {
  const line = `${JSON.stringify({ level, message, time: new Date().toISOString(), ...context })}\n`;
  if (level === "error") {
    process.stderr.write(line);
    return;
  }
  process.stdout.write(line);
};

export const logger = {
  info: (message: string, context?: LogContext) => writeLog("info", message, context),
  warn: (message: string, context?: LogContext) => writeLog("warn", message, context),
  error: (message: string, context?: LogContext) => writeLog("error", message, context),
};
