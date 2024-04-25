import dotenv from 'dotenv';
import path from 'path';

//dotenv.config({ path: path.join(process.cwd(), '.env') });
const envPath = path.join(process.cwd(), '.env');
dotenv.config({ path: envPath });
export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET,
    expires_in: process.env.EXPIRES_IN,
    refresh_secret: process.env.REFRESH_SECRET,
    refresh_expires_in: process.env.REFRESH_EXPIRES_IN,
  },
  super_admin_email: process.env.SUPER_ADMIN_EMAIL,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
  super_admin_username: process.env.SUPER_ADMIN_USERNAME,
};
