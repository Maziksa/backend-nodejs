export function setupSocketHandlers(io) {
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
}

export function emitArticleCreated(io, data) {
  io.emit('article-created', data);
}

export function emitArticleUpdated(io, data) {
  io.emit('article-updated', data);
}

export function emitArticleDeleted(io, data) {
  io.emit('article-deleted', data);
}

export function emitAttachmentAdded(io, data) {
  io.emit('attachment-added', data);
}

export function emitAttachmentDeleted(io, data) {
  io.emit('attachment-deleted', data);
}
