import winston from 'winston';

export const logger = winston.createLogger({
  // format: winston.format.json(),
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
    // winston.format.printf(
    //   (info) => `${info.timestamp} ${info.level}: ${info.message}`
    // )
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console(),
    // new winston.transports.Console({ format: winston.format.simple() }),
  ],
});
