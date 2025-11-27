import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import { CONFIG } from '../config/constants.js';
import { ensureDir } from '../services/fileService.js';

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureDir(CONFIG.UPLOAD_DIR);
    cb(null, CONFIG.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + randomUUID();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (
    CONFIG.ALLOWED_MIME_TYPES.includes(file.mimetype) &&
    CONFIG.ALLOWED_EXTENSIONS.test(file.originalname)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only images (JPG, PNG, GIF, WEBP) and PDF files are allowed!'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: CONFIG.MAX_FILE_SIZE }
});

export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large. Maximum size is 10MB.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected field name.' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};
