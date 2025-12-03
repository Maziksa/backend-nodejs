export const validateId = (req, res, next) => {
  const { id, articleId } = req.params;
  const value = articleId || id;

  const uuidRegex = /^[0-9a-fA-F-]{10,}$/;

  if (articleId || (value && value.length > 10)) {
    if (!value || !uuidRegex.test(value)) {
      return res.status(400).json({ error: 'Invalid article ID format' });
    }
    return next();
  }

  const intId = parseInt(value, 10);
  if (!intId || Number.isNaN(intId) || intId <= 0) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  next();
};

export const validateAttachmentId = (req, res, next) => {
  const { attachmentId } = req.params;
  const uuidRegex = /^[0-9a-fA-F-]{10,}$/;

  if (!attachmentId || !uuidRegex.test(attachmentId)) {
    return res.status(400).json({ error: 'Invalid attachment ID format' });
  }

  next();
};
