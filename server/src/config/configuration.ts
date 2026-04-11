import type { JwtSignOptions } from '@nestjs/jwt';

type JwtExpiresIn = NonNullable<JwtSignOptions['expiresIn']>;

export interface AppConfig {
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
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT || '3000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'family_house',
    user: process.env.DB_USER || 'family_house_user',
    password: process.env.DB_PASSWORD || 'strongpassword',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change_this_in_production',
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as JwtExpiresIn,
  },
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  },
  uploads: {
    path: process.env.UPLOADS_PATH || '/app/uploads',
  },
});
