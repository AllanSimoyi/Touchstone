type LogLevel =
  | 'error'
  | 'warn'
  | 'info'
  | 'http'
  | 'verbose'
  | 'debug'
  | 'silly';
export function customLog(
  level: LogLevel,
  message: string,
  meta: Record<string, any>
) {
  console.log(JSON.stringify({ level, message, meta }));
}
