import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const API_URL = 'http://localhost:3001/api';

function ArticleEditor({ isEditMode }) {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(isEditMode); // только для редактирования true
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Если редактируем, подгружаем данные
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
      if (isEditMode) {
        response = await fetch(`${API_URL}/articles/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content })
        });
      } else {
        response = await fetch(`${API_URL}/articles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content })
        });
      }
      if (!response.ok) {
        const errData = await response.json();
        setError(errData.error || (isEditMode ? 'Update failed' : 'Create failed'));
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

  if (loading) return <div>Loading...</div>;
  return (
    <div className="article-editor">
      <h2>{isEditMode ? 'Edit Article' : 'Create New Article'}</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Article Title"
          disabled={submitting}
        />
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          readOnly={submitting}
        />
        <button type="submit" disabled={submitting}>
          {isEditMode ? 'Save Changes' : 'Submit Article'}
        </button>
      </form>
    </div>
  );
}

export default ArticleEditor;
