import { db } from '../models/index.js';

const { Article, Attachment, Comment } = db;

export async function getAllArticles(workspace = null) {
  const whereClause = workspace ? { workspace } : {};

  return Article.findAll({
    where: whereClause,
    attributes: ['id', 'title', 'workspace', 'createdAt', 'updatedAt'],
    order: [['createdAt', 'DESC']]
  });
}

export async function getArticleById(id) {
  const article = await Article.findByPk(id, {
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

export async function createArticle(data) {
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
    workspace
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

  article.title = title.trim();
  article.content = content.trim();
  if (workspace) {
    article.workspace = workspace;
  }

  await article.save();
  return article;
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
