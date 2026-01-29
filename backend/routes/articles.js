import express from 'express';
import { requireArticleOwnerOrAdmin } from '../middleware/articleAccess.js';
import { verifyToken } from '../middleware/auth.js';
import { validateId } from '../middleware/validation.js';
import { db } from '../models/index.js';
import * as articleService from '../services/articleService.js';
import * as fileService from '../services/fileService.js';
import { streamArticleAsPdf } from '../services/pdfService.js';

const { Article } = db;

export function createArticlesRouter(io) {
  const router = express.Router();

  router.get('/', verifyToken, async (req, res) => {
    try {
      const { workspace, search } = req.query;
      const articles = await articleService.getAllArticles(workspace, search);
      res.json(articles);
    } catch (err) {
      console.error('Error reading articles:', err);
      res.status(500).json({ error: 'Failed to read articles' });
    }
  });

  router.get('/:id', verifyToken, validateId, async (req, res) => {
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

    router.get('/:id/export/pdf', verifyToken, validateId, async (req, res) => {
    try {
      const article = await articleService.getArticleForExport(req.params.id);
      streamArticleAsPdf(res, article);
    } catch (err) {
      if (err.code === 'NOT_FOUND') {
        return res.status(404).json({ error: err.message });
      }
      console.error('Error exporting article as PDF:', err);
      res.status(500).json({ error: 'Failed to export article as PDF' });
    }
  });

	router.get('/:id/history', verifyToken, validateId, async (req, res) => {
		try {
      const history = await articleService.getArticleHistory(req.params.id);
      res.json(history);
    } catch (err) {
      console.error('Error reading history:', err);
      res.status(500).json({ error: 'Failed to read history' });
    }
  });
  
  router.get(
		'/:id/version/:version',
		verifyToken,
		validateId,
		async (req, res) => {
			try {
				const versionData = await articleService.getArticleVersion(
					req.params.id,
					req.params.version,
				)
				res.json(versionData);
			} catch (err) {
				if (err.code === 'NOT_FOUND') {
					return res.status(404).json({ error: err.message })
				}
				console.error('Error reading version:', err)
				res.status(500).json({ error: 'Failed to read version' })
			}
		},
	)

	router.post('/', verifyToken, async (req, res) => {
		try {
			const article = await articleService.createArticle(req.body, req.user.id)
			io.emit('article-created', {
				id: article.id,
				title: article.title,
				workspace: article.workspace,
			})
      res.status(201).json(article);
		} catch (err) {
			if (err.code === 'VALIDATION_ERROR') {
        return res.status(400).json({ error: err.message });
			}
      console.error('Error creating article:', err);
      res.status(500).json({ error: 'Failed to create article' });
    }
	});

	router.put(
		'/:id',
		validateId,
		verifyToken,
		requireArticleOwnerOrAdmin,
		async (req, res) => {
			try {
				const article = await articleService.updateArticle(
					req.params.id,
					req.body,
				);
				io.emit('article-updated', {
					id: article.id,
					title: article.title,
					workspace: article.workspace,
					version: article.version,
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
		},
	);

	router.delete(
		'/:id',
		validateId,
		verifyToken,
		requireArticleOwnerOrAdmin,
		async (req, res) => {
			try {
				const attachments = await articleService.deleteArticle(req.params.id)
				if (attachments && attachments.length > 0) {
					await Promise.all(
						attachments.map(async attachment =>
							fileService.deleteAttachmentFile(attachment.filename),
						),
					)
				}
				io.emit('article-deleted', { id: req.params.id })
				res.status(204).send()
			} catch (err) {
				if (err.code === 'NOT_FOUND') {
          return res.status(404).json({ error: err.message });
        }
        console.error('Error deleting article:', err);
        res.status(500).json({ error: 'Failed to delete article' });
      }
    }
  );

	return router;
}
