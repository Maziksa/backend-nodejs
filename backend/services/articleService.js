import { db } from '../models/index.js';

const { Article, Attachment } = db;

export async function getAllArticles() {
  return await Article.findAll({
    attributes: ['id', 'title', 'createdAt', 'updatedAt'],
    order: [['createdAt', 'DESC']]
  });
}

export async function getArticleById(id) {
  const article = await Article.findByPk(id, {
    include: [{
      model: Attachment,
      as: 'attachments',
      attributes: ['id', 'filename', 'originalName', 'mimetype', 'size', 'uploadedAt']
    }]
  });
  
  if (!article) {
    const error = new Error('Article not found');
    error.code = 'NOT_FOUND';
    throw error;
  }
  
  return article;
}

export async function createArticle(data) {
  const { title, content } = data;
  
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
  
  return await Article.create({
    title: title.trim(),
    content: content.trim()
  });
}

export async function updateArticle(id, data) {
  const { title, content } = data;
  
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
  
  const article = await Article.findByPk(id);
  
  if (!article) {
    const error = new Error('Article not found');
    error.code = 'NOT_FOUND';
    throw error;
  }
  
  article.title = title.trim();
  article.content = content.trim();
  await article.save();
  
  return article;
}

export async function deleteArticle(id) {
  const article = await Article.findByPk(id, {
    include: [{
      model: Attachment,
      as: 'attachments'
    }]
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
