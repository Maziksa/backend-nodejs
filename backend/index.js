import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import multer from 'multer';
import { createServer } from 'http';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureDir(UPLOAD_DIR);
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + randomUUID();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ];
  
  const allowedExtensions = /\.(jpg|jpeg|png|gif|webp|pdf)$/i;
  
  if (allowedMimes.includes(file.mimetype) && allowedExtensions.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error('Only images (JPG, PNG, GIF, WEBP) and PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const validateId = (req, res, next) => {
  const { id } = req.params;
  if (!id || !/^[a-f0-9\-]+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid article ID format' });
  }
  next();
};

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.error('Failed to create directory', err);
      throw err;
    }
  }
}

async function ensureDataDir() {
  await ensureDir(DATA_DIR);
}

function getArticlePath(id) {
  return path.join(DATA_DIR, `${id}.json`);
}

async function readArticle(id) {
  const filePath = getArticlePath(id);
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

async function writeArticle(id, article) {
  const filePath = getArticlePath(id);
  await fs.writeFile(filePath, JSON.stringify(article, null, 2));
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

io.on('error', (error) => {
  console.error('Socket.IO server error:', error);
});

app.get('/api/articles', async (req, res) => {
  try {
    const files = await fs.readdir(DATA_DIR);
    const articles = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async file => {
          const id = file.replace('.json', '');
          const article = await readArticle(id);
          return {
            id: article.id,
            title: article.title,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt
          };
        })
    );
    
    articles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(articles);
  } catch (err) {
    console.error('Error reading articles:', err);
    res.status(500).json({ error: 'Failed to read articles' });
  }
});

app.get('/api/articles/:id', validateId, async (req, res) => {
  try {
    const article = await readArticle(req.params.id);
    res.json(article);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: 'Article not found' });
    }
    console.error('Error reading article:', err);
    res.status(500).json({ error: 'Failed to read article' });
  }
});

app.post('/api/articles', async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    if (title.trim().length === 0 || content.trim().length === 0) {
      return res.status(400).json({ error: 'Title and content cannot be empty' });
    }
    
    const id = randomUUID();
    const now = new Date().toISOString();
    const article = {
      id,
      title: title.trim(),
      content: content.trim(),
      attachments: [],
      createdAt: now,
      updatedAt: now
    };
    
    await writeArticle(id, article);
    
    io.emit('article-created', { id, title: article.title });
    
    res.status(201).json(article);
  } catch (err) {
    console.error('Error creating article:', err);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

app.put('/api/articles/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    if (title.trim().length === 0 || content.trim().length === 0) {
      return res.status(400).json({ error: 'Title and content cannot be empty' });
    }
    
    const article = await readArticle(id);
    article.title = title.trim();
    article.content = content.trim();
    article.updatedAt = new Date().toISOString();
    
    await writeArticle(id, article);
    
    io.emit('article-updated', { id, title: article.title });
    
    res.json(article);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: 'Article not found' });
    }
    console.error('Error updating article:', err);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

app.delete('/api/articles/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await readArticle(id);
    
    if (article.attachments && article.attachments.length > 0) {
      await Promise.all(
        article.attachments.map(async (attachment) => {
          const filePath = path.join(UPLOAD_DIR, attachment.filename);
          try {
            await fs.unlink(filePath);
          } catch (err) {
            console.error('Error deleting attachment:', err);
          }
        })
      );
    }
    
    await fs.unlink(getArticlePath(id));
    
    io.emit('article-deleted', { id });
    
    res.status(204).send();
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: 'Article not found' });
    }
    console.error('Error deleting article:', err);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

app.post('/api/articles/:id/attachments', validateId, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
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
  });
}, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const article = await readArticle(id);
    
    const attachment = {
      id: randomUUID(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date().toISOString()
    };
    
    if (!article.attachments) {
      article.attachments = [];
    }
    
    article.attachments.push(attachment);
    article.updatedAt = new Date().toISOString();
    
    await writeArticle(id, article);
    
    io.emit('attachment-added', { 
      articleId: id, 
      articleTitle: article.title,
      attachment: attachment 
    });
    
    res.status(201).json(attachment);
  } catch (err) {
    if (err.code === 'ENOENT') {
      if (req.file) {
        try {
          await fs.unlink(path.join(UPLOAD_DIR, req.file.filename));
        } catch (unlinkErr) {
          console.error('Error deleting uploaded file:', unlinkErr);
        }
      }
      return res.status(404).json({ error: 'Article not found' });
    }
    console.error('Error uploading attachment:', err);
    res.status(500).json({ error: err.message || 'Failed to upload attachment' });
  }
});

app.delete('/api/articles/:id/attachments/:attachmentId', validateId, async (req, res) => {
  try {
    const { id, attachmentId } = req.params;
    
    if (!attachmentId || !/^[a-f0-9\-]+$/.test(attachmentId)) {
      return res.status(400).json({ error: 'Invalid attachment ID format' });
    }
    
    const article = await readArticle(id);
    
    if (!article.attachments) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    
    const attachmentIndex = article.attachments.findIndex(a => a.id === attachmentId);
    
    if (attachmentIndex === -1) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    
    const attachment = article.attachments[attachmentIndex];
    const filePath = path.join(UPLOAD_DIR, attachment.filename);
    
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error('Error deleting file:', err);
    }
    
    article.attachments.splice(attachmentIndex, 1);
    article.updatedAt = new Date().toISOString();
    
    await writeArticle(id, article);
    
    io.emit('attachment-deleted', { 
      articleId: id, 
      articleTitle: article.title,
      attachmentId 
    });
    
    res.status(204).send();
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: 'Article not found' });
    }
    console.error('Error deleting attachment:', err);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
});

async function startServer() {
  try {
    await ensureDataDir();
    await ensureDir(UPLOAD_DIR);
    
    httpServer.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`WebSocket server is ready`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
