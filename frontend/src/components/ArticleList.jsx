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

  if (loading) return <div className="container loading">Loading articles...</div>;
  if (error) return <div className="container error">Error: {error}</div>;

  return (
    <div className="container article-list">
      <h1>All Articles</h1>
      {articles.length === 0 ? (
        <p>No articles found. Why not <Link to="/articles/create">create one</Link>?</p>
      ) : (
        <ul>
          {articles.map((article) => (
            <li key={article.id}>
              <Link to={`/articles/${article.id}`}>{article.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ArticleList;
