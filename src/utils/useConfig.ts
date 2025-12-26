import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { error, parsed } = dotenv.config({
  path: resolve(__dirname, '../../.env'),
});

export function useConfig(): {
  CLIENT_ID: string;
  TOKEN: string;
  API_URL: string;
} {
  if (error !== undefined || parsed === undefined) {
    throw error;
  }

  if (!parsed.CLIENT_ID) {
    throw new Error('CLIENT_ID is not defined');
  }

  if (!parsed.TOKEN) {
    throw new Error('TOKEN is not defined');
  }

  if (!parsed.API_URL) {
    throw new Error('API_URL is not defined');
  }

  return {
    CLIENT_ID: parsed.CLIENT_ID,
    TOKEN: parsed.TOKEN,
    API_URL: parsed.API_URL,
  };
}
