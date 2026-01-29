import { Op } from 'sequelize'
import { db } from '../models/index.js'

const { Article, Attachment, Comment, ArticleVersion, User } = db;

export async function getAllArticles(workspace = null, search = null) {
  const whereClause = {};

  if (workspace) {
    whereClause.workspace = workspace;
  }

  if (search) {
    whereClause[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { content: { [Op.iLike]: `%${search}%` } }
    ];
  }

  return Article.findAll({
    where: whereClause,
    attributes: ['id', 'title', 'workspace', 'version', 'createdAt', 'updatedAt'],
    order: [['createdAt', 'DESC']]
  });
}

export async function getArticleById(id) {
  const article = await Article.findByPk(id, {
    attributes: ['id', 'title', 'content', 'workspace', 'version', 'createdAt', 'updatedAt', 'userId'],
    include: [
      {
        model: Attachment,
        as: 'attachments',
        attributes: [
          'id',
          'filename',
          'originalName',
          'mimetype',
          'size',
          'uploadedAt'
        ]
      },
      {
        model: Comment,
        as: 'comments',
        attributes: ['id', 'author', 'content', 'createdAt', 'updatedAt'],
        order: [['createdAt', 'ASC']]
      }
    ]
  });

  if (!article) {
    const error = new Error('Article not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  return article;
}

export async function getArticleForExport(id) {
  const article = await Article.findByPk(id, {
    attributes: ['id', 'title', 'content', 'workspace', 'version', 'createdAt', 'updatedAt', 'userId'],
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'email']
      }
    ]
  });

  if (!article) {
    const error = new Error('Article not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  return article;
}

export async function createArticle(data, userId) {
  const { title, content, workspace = 'personal' } = data;

  if (!title || !content) {
    const error = new Error('Title and content are required');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (title.trim().length === 0 || content.trim().length === 0) {
    const error = new Error('Title and content cannot be empty');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const validWorkspaces = ['personal', 'university', 'work'];
  if (!validWorkspaces.includes(workspace)) {
    const error = new Error('Invalid workspace');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  return Article.create({
    title: title.trim(),
    content: content.trim(),
    workspace,
    version: 1,
    userId
  });
}

export async function updateArticle(id, data) {
  const { title, content, workspace } = data;

  if (!title || !content) {
    const error = new Error('Title and content are required');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (title.trim().length === 0 || content.trim().length === 0) {
    const error = new Error('Title and content cannot be empty');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (workspace) {
    const validWorkspaces = ['personal', 'university', 'work'];
    if (!validWorkspaces.includes(workspace)) {
      const error = new Error('Invalid workspace');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
  }

  const article = await Article.findByPk(id);
  if (!article) {
    const error = new Error('Article not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  const transaction = await db.sequelize.transaction();

  try {
    await ArticleVersion.create({
      articleId: article.id,
      version: article.version,
      title: article.title,
      content: article.content,
      workspace: article.workspace
    }, { transaction });

    article.title = title.trim();
    article.content = content.trim();
    if (workspace) {
      article.workspace = workspace;
    }
    article.version = article.version + 1;

    await article.save({ transaction });
    await transaction.commit();

    return article;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

export async function deleteArticle(id) {
  const article = await Article.findByPk(id, {
    include: [
      {
        model: Attachment,
        as: 'attachments'
      }
    ]
  });

  if (!article) {
    const error = new Error('Article not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  const attachments = article.attachments || [];
  await article.destroy();

  return attachments;
}

export async function getArticleHistory(id) {
  return ArticleVersion.findAll({
    where: { articleId: id },
    attributes: ['id', 'version', 'createdAt'],
    order: [['version', 'DESC']]
  });
}

export async function getArticleVersion(articleId, version) {
  const archived = await ArticleVersion.findOne({
    where: { articleId, version }
  });

  if (archived) return archived;

  const current = await Article.findByPk(articleId);
  if (current && current.version == version) {
    return current;
  }

  const error = new Error('Version not found');
  error.code = 'NOT_FOUND';
  throw error;
}
