import { ROLES } from '../config/roles.js'
import { db } from '../models/index.js'

const { Article } = db

export async function requireArticleOwnerOrAdmin(req, res, next) {
	try {
		const article = await Article.findByPk(req.params.id, {
			attributes: ['id', 'userId'],
		})

		if (!article) {
			return res.status(404).json({ error: 'Article not found' })
		}

		if (article.userId !== req.user.id && req.user.role !== ROLES.ADMIN) {
			return res.status(403).json({ error: 'Permission denied' })
		}

		req.article = article
		next()
	} catch (err) {
		console.error('Error checking article permissions:', err)
		res.status(500).json({ error: 'Failed to check permissions' })
	}
}
