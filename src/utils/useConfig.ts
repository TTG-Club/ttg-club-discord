enum Env {
  CLIENT_ID = 'CLIENT_ID',
  TOKEN = 'TOKEN',
  API_URL = 'API_URL',
  SITE_URL = 'SITE_URL',
}

interface Config {
  [Env.CLIENT_ID]: string;
  [Env.TOKEN]: string;
  [Env.API_URL]: string;
  [Env.SITE_URL]: string;
}

export function useConfig(): Config {
  const getEnv = (key: string): string => {
    const value = process.env[key];

    if (!value) {
      throw new Error(`${key} is not defined in environment`);
    }

    return value;
  };

  return {
    CLIENT_ID: getEnv(Env.CLIENT_ID),
    TOKEN: getEnv(Env.TOKEN),
    API_URL: getEnv(Env.API_URL),
    SITE_URL: getEnv(Env.SITE_URL),
  };
}
