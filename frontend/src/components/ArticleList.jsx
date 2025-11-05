import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api';

function ArticleList() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchArticles() {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/articles`);

                if (!response.ok) {
                    setError(`HTTP error! status: ${response.status}`);
                    return;
                }

                const data = await response.json();
                setArticles(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }

        fetchArticles().catch(console.error);

    }, []);

    if (loading) return <div className="loading">Loading articles...</div>;
    if (error) return <div className="error">Error fetching articles: {error}</div>;

    return (
        <div className="article-list">
            <h2>All Articles</h2>
            <ul>
                {articles.length === 0 ? (
                    <p>No articles found. Why not create one?</p>
                ) : (
                    articles.map((article) => (
                        <li key={article.id}>
                            <Link to={`/articles/${article.id}`}>{article.title}</Link>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}

export default ArticleList;