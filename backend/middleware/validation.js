export const validateId = (req, res, next) => {
  const { id } = req.params;
  if (!id || !/^[a-f0-9\-]+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid article ID format' });
  }
  next();
};

export const validateAttachmentId = (req, res, next) => {
  const { attachmentId } = req.params;
  if (!attachmentId || !/^[a-f0-9\-]+$/.test(attachmentId)) {
    return res.status(400).json({ error: 'Invalid attachment ID format' });
  }
  next();
};
