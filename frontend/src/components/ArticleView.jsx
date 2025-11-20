import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const API_URL = "http://localhost:3001/api";

function ArticleView() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/articles/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("Article not found.");
        } else {
          setError("Server error. Please try again later.");
        }
        return;
      }
      const data = await response.json();
      setArticle(data);
    } catch (e) {
      setError(e.message || 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    
    try {
      const response = await fetch(`${API_URL}/articles/${id}`, { method: "DELETE" });
      if (response.status === 204) {
        navigate('/articles');
      } else {
        const errData = await response.json();
        setError(errData.error || "Error deleting article");
      }
    } catch (e) {
      setError(e.message || 'Failed to delete article');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File is too large. Maximum size is 10MB.');
      e.target.value = '';
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPG, PNG, GIF, WEBP, and PDF files are allowed.');
      e.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setError(null);
      const response = await fetch(`${API_URL}/articles/${id}/attachments`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json();
        setError(errData.error || 'Failed to upload file');
        return;
      }

      await fetchArticle();
      e.target.value = '';
    } catch (e) {
      setError(e.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm("Are you sure you want to delete this attachment?")) return;

    try {
      const response = await fetch(`${API_URL}/articles/${id}/attachments/${attachmentId}`, {
        method: 'DELETE'
      });

      if (response.status === 204) {
        await fetchArticle();
      } else {
        const errData = await response.json();
        setError(errData.error || 'Failed to delete attachment');
      }
    } catch (e) {
      setError(e.message || 'Failed to delete attachment');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype === 'application/pdf') return '📄';
  };

  if (loading) return <div className="container loading">Loading article...</div>;
  if (error && !article) return <div className="container error">Error: {error}</div>;
  if (!article) return <div className="container">Article not found</div>;

  return (
    <div className="container article-view">
      <h1>{article.title}</h1>

      {article.attachments && article.attachments.length > 0 && (
        <div className="attachments-section">
          <h3>Attachments ({article.attachments.length})</h3>
          <div className="attachments-list">
            {article.attachments.map(attachment => (
              <div key={attachment.id} className="attachment-item">
                <a 
                  href={`http://localhost:3001/uploads/${attachment.filename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="attachment-link"
                >
                  <span className="attachment-icon">{getFileIcon(attachment.mimetype)}</span>
                  <span className="attachment-name">{attachment.originalName}</span>
                  <span className="attachment-size">({formatFileSize(attachment.size)})</span>
                </a>
                <button 
                  className="attachment-delete-btn"
                  onClick={() => handleDeleteAttachment(attachment.id)}
                  title="Delete attachment"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="upload-section">
        <label className="upload-label">
          <input 
            type="file" 
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf"
            onChange={handleFileUpload}
            disabled={uploading}
            className="upload-input"
          />
          <span className="upload-button">
            {uploading ? '⏳ Uploading...' : 'Attach File'}
          </span>
        </label>
        <span className="upload-hint">Images (JPG, PNG, GIF, WEBP) and PDF only, max 10MB</span>
      </div>

      {error && <div className="error" style={{ marginTop: '1rem' }}>{error}</div>}

      <div className="content" dangerouslySetInnerHTML={{ __html: article.content }} />

      <div style={{ marginTop: '2rem' }}>
        <button className="article-action-btn" onClick={handleDelete}>
          Delete Article
        </button>
        <Link className="article-action-link" to={`/articles/${id}/edit`}>
          Edit Article
        </Link>
      </div>
    </div>
  );
}

export default ArticleView;
