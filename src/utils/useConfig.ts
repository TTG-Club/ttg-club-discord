import dotenv from 'dotenv';
import path from 'node:path';

const { error, parsed } = dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

if (error !== undefined || parsed === undefined) {
  throw error;
}

export const useConfig = (): {
  CLIENT_ID: string
  TOKEN: string
  PREFIX: string
  API_URL: string
} => {
  if (!parsed.CLIENT_ID) {
    throw new Error('CLIENT_ID is not defined');
  }

  if (!parsed.TOKEN) {
    throw new Error('TOKEN is not defined');
  }

  if (!parsed.PREFIX) {
    throw new Error('PREFIX is not defined');
  }

  if (!parsed.API_URL) {
    throw new Error('API_URL is not defined');
  }

  return {
    CLIENT_ID: parsed.CLIENT_ID,
    TOKEN: parsed.TOKEN,
    PREFIX: parsed.PREFIX,
    API_URL: parsed.API_URL
  };
};
