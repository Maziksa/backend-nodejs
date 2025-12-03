import { db } from '../models/index.js';

const { Comment, Article } = db;

export async function getCommentsByArticleId(articleId) {
  return Comment.findAll({
    where: { articleId },
    attributes: ['id', 'author', 'content', 'createdAt', 'updatedAt'],
    order: [['createdAt', 'ASC']]
  });
}

export async function createComment(articleId, data) {
  const { author, content } = data;

  if (!author || !content) {
    const error = new Error('Author and content are required');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (author.trim().length === 0 || content.trim().length === 0) {
    const error = new Error('Author and content cannot be empty');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const article = await Article.findByPk(articleId);
  if (!article) {
    const error = new Error('Article not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  return Comment.create({
    articleId,
    author: author.trim(),
    content: content.trim()
  });
}

export async function updateComment(id, data) {
  const { author, content } = data;

  if (!author || !content) {
    const error = new Error('Author and content are required');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (author.trim().length === 0 || content.trim().length === 0) {
    const error = new Error('Author and content cannot be empty');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const comment = await Comment.findByPk(id);

  if (!comment) {
    const error = new Error('Comment not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  comment.author = author.trim();
  comment.content = content.trim();
  await comment.save();

  return comment;
}

export async function deleteComment(id) {
  const comment = await Comment.findByPk(id);

  if (!comment) {
    const error = new Error('Comment not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  await comment.destroy();
}
