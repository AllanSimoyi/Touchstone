import type { DataFunctionArgs } from '@remix-run/node';
import type { ZodError } from 'zod';

import { logger } from './logger';

export function logSchemaParseErr(
  request: DataFunctionArgs['request'],
  zodError: ZodError,
  providedData: any
) {
  logger.info(
    'Schema parse failed',
    request.method,
    request.url,
    zodError,
    providedData
  );
}
