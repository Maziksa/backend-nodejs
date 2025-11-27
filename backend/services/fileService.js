import fs from 'fs/promises';
import path from 'path';
import { CONFIG } from '../config/constants.js';

export async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.error('Failed to create directory', err);
      throw err;
    }
  }
}

export async function deleteAttachmentFile(filename) {
  const filePath = path.join(CONFIG.UPLOAD_DIR, filename);
  try {
    await fs.unlink(filePath);
  } catch (err) {
    console.error('Error deleting file:', err);
  }
}
