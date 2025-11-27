import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);
const PROJECT_ROOT = path.dirname(currentDirPath);

export const CONFIG = {
  PORT: process.env.PORT || 3001,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'articles_db',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  
  UPLOAD_DIR: path.join(PROJECT_ROOT, 'uploads'),
  
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ],
  ALLOWED_EXTENSIONS: /\.(jpg|jpeg|png|gif|webp|pdf)$/i
};
