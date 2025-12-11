import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';

const API_URL = 'http://localhost:3001/api';

function ArticleView() {
  const { id } = useParams();
  
  const [article, setArticle] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [uploading, setUploading] = useState(false);
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const navigate = useNavigate();

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/articles/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Article not found.');
        } else {
          setError('Server error. Please try again later.');
        }
        return;
      }
      const data = await response.json();
      setArticle(data);
      fetchHistory();
    } catch (e) {
      setError(e.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/articles/${id}/history`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  };

  const handleVersionClick = async (versionNumber) => {
    if (article && versionNumber === article.version) {
      setSelectedVersion(null);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/articles/${id}/version/${versionNumber}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedVersion(data);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to load version');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      const response = await fetch(`${API_URL}/articles/${id}`, { method: 'DELETE' });
      if (response.status === 204) {
        navigate('/articles');
      } else {
        const errData = await response.json();
        setError(errData.error || 'Error deleting article');
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
      setError('Invalid file type.');
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
      if (!response.ok) throw new Error('Failed to upload');
      await fetchArticle();
      e.target.value = '';
    } catch (e) {
      setError(e.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm('Delete attachment?')) return;
    try {
      const response = await fetch(`${API_URL}/articles/${id}/attachments/${attachmentId}`, { method: 'DELETE' });
      if (response.status === 204) await fetchArticle();
    } catch (e) {
      setError('Failed to delete attachment');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentAuthor.trim() || !commentContent.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`${API_URL}/articles/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: commentAuthor, content: commentContent })
      });
      if (response.ok) {
        setCommentAuthor('');
        setCommentContent('');
        await fetchArticle();
      }
    } catch (e) {
      setError('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete comment?')) return;
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}`, { method: 'DELETE' });
      if (response.status === 204) await fetchArticle();
    } catch (e) {
      setError('Failed to delete comment');
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype === 'application/pdf') return '📄';
    return '📎';
  };

  const displayedArticle = selectedVersion || article;
  const isHistoryMode = selectedVersion !== null;

  if (loading && !displayedArticle) return <div className="container"><p className="loading">Loading article...</p></div>;
  if (error) return <div className="container"><Link to="/articles" className="back-link">← Back</Link><div className="error">{error}</div></div>;
  if (!displayedArticle) return <div className="container"><Link to="/articles" className="back-link">← Back</Link><div className="error">Article not found</div></div>;

  return (
    <div className="container">
      <Link to="/articles" className="back-link">← Back to Articles</Link>
      
      <div className="article-view-container">
        <div className="article-main-column">
          <div className="article-view">
            
            {isHistoryMode && (
              <div className="version-warning">
                <span>
                  <strong>Viewing older version (v{displayedArticle.version})</strong>. This version is read-only.
                </span>
                <button onClick={() => setSelectedVersion(null)} className="btn-switch-version">
                  Switch to current
                </button>
              </div>
            )}

            <h1>{displayedArticle.title}</h1>
            
            <div className="article-meta">
              <span className={`workspace-badge workspace-${displayedArticle.workspace || (article && article.workspace)}`}>
                {displayedArticle.workspace || (article && article.workspace)}
              </span>
              <span className="date">
                Version {displayedArticle.version} • {formatDate(displayedArticle.createdAt)}
              </span>
            </div>

            {!isHistoryMode && (
              <div className="article-actions" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                <Link to={`/articles/${id}/edit`} className="btn btn-primary" style={{ marginRight: '1rem' }}>
                  Edit Article
                </Link>
                <button onClick={handleDelete} className="btn btn-danger">
                  Delete
                </button>
              </div>
            )}

            <div className="content ql-editor" dangerouslySetInnerHTML={{ __html: displayedArticle.content }} />

            {!isHistoryMode ? (
              <div className="attachments-section">
                <h3>Attachments</h3>
                {article.attachments && article.attachments.length > 0 ? (
                  <div className="attachments-list">
                    {article.attachments.map((file) => (
                      <div key={file.id} className="attachment-item">
                        <a href={`http://localhost:3001/uploads/${file.filename}`} target="_blank" rel="noopener noreferrer" className="attachment-link">
                          <span className="attachment-icon">{getFileIcon(file.mimetype)}</span>
                          <span className="attachment-name">{file.originalName}</span>
                          <span className="attachment-size">({formatFileSize(file.size)})</span>
                        </a>
                        <button className="attachment-delete-btn" onClick={() => handleDeleteAttachment(file.id)}>×</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#888', fontStyle: 'italic' }}>No attachments yet.</p>
                )}

                <div className="upload-section" style={{ marginTop: '1rem' }}>
                  <label className="upload-label">
                    <input type="file" className="upload-input" onChange={handleFileUpload} disabled={uploading} />
                    <span className="upload-button">{uploading ? 'Uploading...' : 'Upload File'}</span>
                  </label>
                  <div className="upload-hint">Max size: 10MB. Images and PDF only.</div>
                </div>
              </div>
            ) : (
              <div className="attachments-readonly">
                Attachments and upload functions are only available in the current version.
              </div>
            )}

            {!isHistoryMode && (
              <div className="comments-section">
                <h2>Comments ({article.comments ? article.comments.length : 0})</h2>
                
                <form className="comment-form" onSubmit={handleCommentSubmit}>
                  <div className="form-group">
                    <input type="text" placeholder="Your Name" value={commentAuthor} onChange={(e) => setCommentAuthor(e.target.value)} disabled={submittingComment} />
                  </div>
                  <div className="form-group">
                    <textarea placeholder="Write a comment..." rows="3" value={commentContent} onChange={(e) => setCommentContent(e.target.value)} disabled={submittingComment}></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={submittingComment}>
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </form>

                <div className="comments-list">
                  {article.comments && article.comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <strong>{comment.author}</strong>
                        <div className="header-actions">
                          <span className="comment-date">{formatDate(comment.createdAt)}</span>
                          <button className="btn-delete-comment" onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                        </div>
                      </div>
                      <div className="comment-content">{comment.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="article-history-column">
          <div className="history-box">
            <h3 className="history-title">Version History</h3>
            
            <ul className="history-list">
              {article && (
                <li>
                  <button
                    onClick={() => setSelectedVersion(null)}
                    className={`history-btn ${!selectedVersion ? 'is-current' : ''}`}
                  >
                    <div className="history-btn-header">
                      <span>v{article.version}</span>
                      <span className="badge-current">Current</span>
                    </div>
                    <div className="history-date">
                      {formatDate(article.updatedAt)}
                    </div>
                  </button>
                </li>
              )}

              {history.map((ver) => (
                <li key={ver.id}>
                  <button
                    onClick={() => handleVersionClick(ver.version)}
                    className={`history-btn ${selectedVersion && selectedVersion.version === ver.version ? 'is-selected' : ''}`}
                  >
                    <div className="history-btn-header">
                      <span>v{ver.version}</span>
                    </div>
                    <div className="history-date">
                      {formatDate(ver.createdAt)}
                    </div>
                  </button>
                </li>
              ))}
              
              {history.length === 0 && article && article.version === 1 && (
                <li className="history-empty">
                  No previous versions.
                </li>
              )}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ArticleView;
