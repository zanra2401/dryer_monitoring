// server/utils/logger.ts
import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    // Pada mode development, gunakan format teks yang mudah dibaca manusia.
    // Pada mode production, pino secara otomatis mengeluarkan JSON terstruktur yang sangat cepat.
    transport: isDevelopment
        ? {
              target: 'pino-pretty',
              options: {
                  colorize: true,
                  translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
              },
          }
        : undefined,
});