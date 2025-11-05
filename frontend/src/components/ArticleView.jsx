import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const API_URL = "http://localhost:3001/api";

function ArticleView() {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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
        setError(e.message);
        }
    };

    useEffect(() => {
        async function fetchArticle() {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/articles/${id}`);
            if (!response.ok) {
            setError("Article not found or server error.");
            return;
            }
            const data = await response.json();
            setArticle(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
        }
        fetchArticle();
    }, [id]);

    if (loading) return <div className="loading">Loading article...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!article) return null;

    return (
        <div className="article-view">
        <h1>{article.title}</h1>
        <div className="content" dangerouslySetInnerHTML={{ __html: article.content }} />
        <button className="article-action-btn" onClick={handleDelete}>Delete Article</button>
        <Link className="article-action-link" to={`/edit/${id}`}>Edit Article</Link>
        </div>
    );
}

export default ArticleView;