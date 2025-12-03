import { db } from '../models/index.js';

const { Article, Attachment } = db;

export async function addAttachment(articleId, fileData) {
  const article = await Article.findByPk(articleId);

  if (!article) {
    const error = new Error('Article not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  const attachment = await Attachment.create({
    articleId,
    filename: fileData.filename,
    originalName: fileData.originalname,
    mimetype: fileData.mimetype,
    size: fileData.size
  });

  return {
    attachment,
    articleTitle: article.title
  };
}

export async function deleteAttachment(articleId, attachmentId) {
  const article = await Article.findByPk(articleId);

  if (!article) {
    const error = new Error('Article not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  const attachment = await Attachment.findOne({
    where: {
      id: attachmentId,
      articleId
    }
  });

  if (!attachment) {
    const error = new Error('Attachment not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  const filename = attachment.filename;
  await attachment.destroy();

  return {
    filename,
    articleTitle: article.title
  };
}
