import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const API_URL = 'http://localhost:3001/api';

function ArticleEditor() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            setError('Title and content are required.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/articles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content }),
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errData = await response.json();
                    setError(errData.error || 'Bad request');
                } else {
                    setError(`Server error: ${response.statusText}`);
                }
                return;
            }


            const newArticle = await response.json();
            navigate(`/articles/${newArticle.id}`);

        } catch (e) {
            setError(e.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="article-editor">
            <h2>Create New Article</h2>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
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
                    {submitting ? 'Submitting...' : 'Submit Article'}
                </button>
            </form>
        </div>
    );
}

export default ArticleEditor;