import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const API_URL = 'http://localhost:3001/api';

function ArticleEditor({ isEditMode }) {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [workspace, setWorkspace] = useState('personal');
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const workspaces = [
    { value: 'personal', label: 'Personal' },
    { value: 'university', label: 'University' },
    { value: 'work', label: 'Work' }
  ];

  useEffect(() => {
    if (isEditMode && id) {
      async function fetchArticle() {
        try {
          setLoading(true);
          const response = await fetch(`${API_URL}/articles/${id}`);

          if (!response.ok) {
            setError('Article not found or server error.');
            setLoading(false);
            return;
          }

          const data = await response.json();
          setTitle(data.title);
          setContent(data.content);
          setWorkspace(data.workspace || 'personal');
        } catch (e) {
          setError(e.message);
        } finally {
          setLoading(false);
        }
      }

      fetchArticle();
    }
  }, [isEditMode, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let response;
      const payload = { title, content, workspace };

      if (isEditMode) {
        response = await fetch(`${API_URL}/articles/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${API_URL}/articles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        const errData = await response.json();
        setError(
          errData.error || (isEditMode ? 'Update failed' : 'Create failed')
        );
        setSubmitting(false);
        return;
      }

      const article = await response.json();
      navigate(`/articles/${isEditMode ? id : article.id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <p className="loading">Loading article...</p>
      </div>
    );
  }

  return (
    <div className="container article-editor">
      <h1>{isEditMode ? 'Edit Article' : 'Create New Article'}</h1>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter article title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div>
          <label htmlFor="workspace-select">Workspace:</label>{' '}
          <select
            id="workspace-select"
            value={workspace}
            onChange={(e) => setWorkspace(e.target.value)}
          >
            {workspaces.map((ws) => (
              <option key={ws.value} value={ws.value}>
                {ws.label}
              </option>
            ))}
          </select>
        </div>

        <ReactQuill value={content} onChange={setContent} />

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              isEditMode && id ? navigate(`/articles/${id}`) : navigate('/')
            }
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting
              ? isEditMode
                ? 'Updating...'
                : 'Creating...'
              : isEditMode
              ? 'Update Article'
              : 'Create Article'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ArticleEditor;
