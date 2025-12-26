import express from 'express';
import { validateId } from '../middleware/validation.js';
import { verifyToken } from '../middleware/auth.js';
import * as commentService from '../services/commentService.js';

export function createCommentsRouter(io) {
  const router = express.Router();

  router.post('/articles/:id/comments', validateId, verifyToken, async (req, res) => {
    try {
      const comment = await commentService.createComment(
        req.params.id,
        req.body
      );
      io.emit('comment-created', {
        articleId: req.params.id,
        comment
      });
      res.status(201).json(comment);
    } catch (err) {
      if (err.code === 'VALIDATION_ERROR') {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === 'NOT_FOUND') {
        return res.status(404).json({ error: err.message });
      }
      console.error('Error creating comment:', err);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  });

  router.delete('/comments/:id', validateId, verifyToken, async (req, res) => {
    try {
      await commentService.deleteComment(req.params.id);
      io.emit('comment-deleted', { commentId: req.params.id });
      res.status(204).send();
    } catch (err) {
      if (err.code === 'NOT_FOUND') {
        return res.status(404).json({ error: err.message });
      }
      console.error('Error deleting comment:', err);
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  });

  return router;
}
