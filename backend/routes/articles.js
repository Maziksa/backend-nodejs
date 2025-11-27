import express from 'express';
import { validateId } from '../middleware/validation.js';
import * as articleService from '../services/articleService.js';
import * as fileService from '../services/fileService.js';

export function createArticlesRouter(io) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const articles = await articleService.getAllArticles();
      res.json(articles);
    } catch (err) {
      console.error('Error reading articles:', err);
      res.status(500).json({ error: 'Failed to read articles' });
    }
  });

  router.get('/:id', validateId, async (req, res) => {
    try {
      const article = await articleService.getArticleById(req.params.id);
      res.json(article);
    } catch (err) {
      if (err.code === 'NOT_FOUND') {
        return res.status(404).json({ error: err.message });
      }
      console.error('Error reading article:', err);
      res.status(500).json({ error: 'Failed to read article' });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const article = await articleService.createArticle(req.body);
      
      io.emit('article-created', { 
        id: article.id, 
        title: article.title 
      });
      
      res.status(201).json(article);
    } catch (err) {
      if (err.code === 'VALIDATION_ERROR') {
        return res.status(400).json({ error: err.message });
      }
      console.error('Error creating article:', err);
      res.status(500).json({ error: 'Failed to create article' });
    }
  });

  router.put('/:id', validateId, async (req, res) => {
    try {
      const article = await articleService.updateArticle(req.params.id, req.body);
      
      io.emit('article-updated', { 
        id: article.id, 
        title: article.title 
      });
      
      res.json(article);
    } catch (err) {
      if (err.code === 'NOT_FOUND') {
        return res.status(404).json({ error: err.message });
      }
      if (err.code === 'VALIDATION_ERROR') {
        return res.status(400).json({ error: err.message });
      }
      console.error('Error updating article:', err);
      res.status(500).json({ error: 'Failed to update article' });
    }
  });

  router.delete('/:id', validateId, async (req, res) => {
    try {
      const attachments = await articleService.deleteArticle(req.params.id);
      
      if (attachments && attachments.length > 0) {
        await Promise.all(
          attachments.map(async (attachment) => {
            await fileService.deleteAttachmentFile(attachment.filename);
          })
        );
      }
      
      io.emit('article-deleted', { id: req.params.id });
      
      res.status(204).send();
    } catch (err) {
      if (err.code === 'NOT_FOUND') {
        return res.status(404).json({ error: err.message });
      }
      console.error('Error deleting article:', err);
      res.status(500).json({ error: 'Failed to delete article' });
    }
  });

  return router;
}
