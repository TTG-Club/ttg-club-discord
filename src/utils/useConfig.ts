import 'dotenv/config';

interface Config {
  CLIENT_ID: string;
  TOKEN: string;
  API_URL: string;
}

export function useConfig(): Config {
  const required = ['CLIENT_ID', 'TOKEN', 'API_URL'] as const;

  for (const key of required) {
    const value = process.env[key];

    if (!value) {
      throw new Error(`${key} is not defined in environment`);
    }
  }

  return {
    CLIENT_ID: process.env.CLIENT_ID!,
    TOKEN: process.env.TOKEN!,
    API_URL: process.env.API_URL!,
  };
}
