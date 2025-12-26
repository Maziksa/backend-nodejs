import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { CONFIG } from './config/constants.js';
import { createArticlesRouter } from './routes/articles.js';
import { createAttachmentsRouter } from './routes/attachments.js';
import { createAuthRouter } from './routes/auth.js';
import { createCommentsRouter } from './routes/comments.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';
import { ensureDir } from './services/fileService.js';
import { db } from './models/index.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CONFIG.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(CONFIG.UPLOAD_DIR));

app.use('/api/auth', createAuthRouter());
app.use('/api/articles', createArticlesRouter(io));
app.use('/api/articles/:id/attachments', createAttachmentsRouter(io));
app.use('/api', createCommentsRouter(io));

setupSocketHandlers(io);

async function startServer() {
  try {
    console.log('Connecting to database...');
    await db.sequelize.authenticate();
    console.log('✓ Database connection established successfully');

    await ensureDir(CONFIG.UPLOAD_DIR);
    console.log('✓ Upload directory ready');
    
    httpServer.listen(CONFIG.PORT, () => {
      console.log(`✓ Server is running on http://localhost:${CONFIG.PORT}`);
      console.log(`✓ WebSocket server is ready`);
      console.log(`✓ Environment: ${CONFIG.NODE_ENV}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
