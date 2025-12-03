import express from 'express';
import { validateId } from '../middleware/validation.js';
import * as commentService from '../services/commentService.js';

export function createCommentsRouter(io) {
  const router = express.Router();

  router.get('/articles/:articleId/comments', validateId, async (req, res) => {
    try {
      const comments = await commentService.getCommentsByArticleId(
        req.params.articleId
      );
      res.json(comments);
    } catch (err) {
      console.error('Error reading comments:', err);
      res.status(500).json({ error: 'Failed to read comments' });
    }
  });

  router.post('/articles/:articleId/comments', validateId, async (req, res) => {
    try {
      const comment = await commentService.createComment(
        req.params.articleId,
        req.body
      );

      io.emit('comment-created', {
        articleId: req.params.articleId,
        commentId: comment.id
      });

      res.status(201).json(comment);
    } catch (err) {
      if (err.code === 'NOT_FOUND') {
        return res.status(404).json({ error: err.message });
      }
      if (err.code === 'VALIDATION_ERROR') {
        return res.status(400).json({ error: err.message });
      }

      console.error('Error creating comment:', err);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  });

  router.put('/comments/:id', validateId, async (req, res) => {
    try {
      const comment = await commentService.updateComment(
        req.params.id,
        req.body
      );

      io.emit('comment-updated', {
        commentId: comment.id
      });

      res.json(comment);
    } catch (err) {
      if (err.code === 'NOT_FOUND') {
        return res.status(404).json({ error: err.message });
      }
      if (err.code === 'VALIDATION_ERROR') {
        return res.status(400).json({ error: err.message });
      }

      console.error('Error updating comment:', err);
      res.status(500).json({ error: 'Failed to update comment' });
    }
  });

  router.delete('/comments/:id', validateId, async (req, res) => {
    try {
      await commentService.deleteComment(req.params.id);

      io.emit('comment-deleted', {
        commentId: req.params.id
      });

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
