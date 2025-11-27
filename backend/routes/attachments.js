import express from 'express';
import { validateId, validateAttachmentId } from '../middleware/validation.js';
import { upload, handleUploadError } from '../middleware/upload.js';
import * as attachmentService from '../services/attachmentService.js';
import * as fileService from '../services/fileService.js';

export function createAttachmentsRouter(io) {
  const router = express.Router({ mergeParams: true });

  router.post(
    '/',
    validateId,
    (req, res, next) => {
      upload.single('file')(req, res, (err) => {
        handleUploadError(err, req, res, next);
      });
    },
    async (req, res) => {
      try {
        const { id } = req.params;

        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        const result = await attachmentService.addAttachment(id, req.file);

        io.emit('attachment-added', {
          articleId: id,
          articleTitle: result.articleTitle,
          attachment: {
            id: result.attachment.id,
            filename: result.attachment.filename,
            originalName: result.attachment.originalName,
            mimetype: result.attachment.mimetype,
            size: result.attachment.size,
            uploadedAt: result.attachment.uploadedAt
          }
        });

        res.status(201).json(result.attachment);
      } catch (err) {
        if (err.code === 'NOT_FOUND') {
          if (req.file) {
            await fileService.deleteAttachmentFile(req.file.filename);
          }
          return res.status(404).json({ error: err.message });
        }
        console.error('Error uploading attachment:', err);
        res.status(500).json({ error: err.message || 'Failed to upload attachment' });
      }
    }
  );

  router.delete('/:attachmentId', validateId, validateAttachmentId, async (req, res) => {
    try {
      const { id, attachmentId } = req.params;

      const result = await attachmentService.deleteAttachment(id, attachmentId);
      
      await fileService.deleteAttachmentFile(result.filename);

      io.emit('attachment-deleted', {
        articleId: id,
        articleTitle: result.articleTitle,
        attachmentId
      });

      res.status(204).send();
    } catch (err) {
      if (err.code === 'NOT_FOUND') {
        return res.status(404).json({ error: err.message });
      }
      console.error('Error deleting attachment:', err);
      res.status(500).json({ error: 'Failed to delete attachment' });
    }
  });

  return router;
}
