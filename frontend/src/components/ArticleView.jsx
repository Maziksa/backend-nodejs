import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api';

function ArticleView() {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchArticle() {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/articles/${id}`);

                if (!response.ok) {
                    setError(`Article not found or server error.`);
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

        fetchArticle().catch(console.error);

    }, [id]);

    if (loading) return <div className="loading">Loading article...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!article) return <div>Article not found.</div>;

    return (
        <article className="article-view">
            <h1>{article.title}</h1>
            <div
                className="content"
                dangerouslySetInnerHTML={{ __html: article.content }}
            />
        </article>
    );
}

export default ArticleView;