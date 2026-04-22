import type { JwtSignOptions } from '@nestjs/jwt';

type JwtExpiresIn = NonNullable<JwtSignOptions['expiresIn']>;

export interface AppConfig {
  env: 'development' | 'production' | 'test';
  port: number;
  clientUrl: string;
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  jwt: {
    secret: string;
    expiresIn: JwtExpiresIn;
  };
  admin: {
    username: string;
    password: string;
  };
  uploads: {
    path: string;
  };
  serverPublicUrl: string;
}

const INSECURE_DEFAULTS = new Set([
  'change_this_in_production',
  'your_jwt_secret_key_change_in_production',
  'strongpassword',
  'admin123',
  '',
]);

function requireEnv(key: string, isProd: boolean, fallback?: string): string {
  const raw = process.env[key]?.trim();
  if (raw && !INSECURE_DEFAULTS.has(raw)) return raw;
  if (isProd) {
    throw new Error(
      `[config] ${key} must be set to a non-default value in production`,
    );
  }
  if (raw) return raw;
  if (fallback !== undefined) return fallback;
  throw new Error(`[config] ${key} is required`);
}

export default (): AppConfig => {
  const env = (process.env.NODE_ENV || 'development') as AppConfig['env'];
  const isProd = env === 'production';

  return {
    env,
    port: parseInt(process.env.PORT || '3000', 10),
    clientUrl: requireEnv('CLIENT_URL', isProd, 'http://localhost:5173'),
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      name: process.env.DB_NAME || 'family_house',
      user: process.env.DB_USER || 'family_house_user',
      password: requireEnv('DB_PASSWORD', isProd),
    },
    jwt: {
      secret: requireEnv('JWT_SECRET', isProd),
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as JwtExpiresIn,
    },
    admin: {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: requireEnv('ADMIN_PASSWORD', isProd),
    },
    uploads: {
      path: process.env.UPLOADS_PATH || '/app/uploads',
    },
    serverPublicUrl: process.env.SERVER_PUBLIC_URL || '',
  };
};
