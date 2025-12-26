import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useApiClient } from '../api/client';

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
  const { apiCall } = useApiClient();

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
          const response = await apiCall(`${API_URL}/articles/${id}`);

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
      const payload = { title, content, workspace };

      const response = await apiCall(
        isEditMode ? `${API_URL}/articles/${id}` : `${API_URL}/articles`,
        {
          method: isEditMode ? 'PUT' : 'POST',
          body: JSON.stringify(payload)
        }
      );

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
