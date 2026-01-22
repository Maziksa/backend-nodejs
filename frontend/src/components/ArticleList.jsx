import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApiClient } from '../api/client';

const API_URL = 'http://localhost:3001/api';

function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workspace, setWorkspace] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const { apiCall } = useApiClient();

  const workspaces = [
    { value: '', label: 'All Workspaces' },
    { value: 'personal', label: 'Personal' },
    { value: 'university', label: 'University' },
    { value: 'work', label: 'Work' }
  ];

  useEffect(() => {
    fetchArticles();
  }, [workspace, activeSearchTerm]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `${API_URL}/articles`;
      const params = new URLSearchParams();

      if (workspace) params.append('workspace', workspace);
      if (activeSearchTerm) params.append('search', activeSearchTerm);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await apiCall(url);

      if (!response.ok) {
        setError('Failed to load articles');
        return;
      }

      const data = await response.json();
      setArticles(data);
    } catch (e) {
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setActiveSearchTerm(searchTerm);
    }
  };

  const getWorkspaceLabel = (ws) => {
    const found = workspaces.find((w) => w.value === ws);
    return found ? found.label : ws;
  };

  if (loading) {
    return (
      <div className="container">
        <p className="loading">Loading articles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="container article-list">
      <div className="header-actions">
        <input
          type="text"
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="search-input"
        />
        <button onClick={() => setActiveSearchTerm(searchTerm)} className="btn btn-secondary">
          Search
        </button>

        <select
          className="workspace-filter"
          value={workspace}
          onChange={(e) => setWorkspace(e.target.value)}
        >
          {workspaces.map((ws) => (
            <option key={ws.value} value={ws.value}>
              {ws.label}
            </option>
          ))}
        </select>

        <Link to="/articles/new" className="btn btn-primary">
          Create New Article
        </Link>
      </div>

      {articles.length === 0 ? (
        <div>
          <p>
            No articles found
            {activeSearchTerm && ` matching "${activeSearchTerm}"`}
            {workspace && ` in ${getWorkspaceLabel(workspace)}`}.
          </p>
          <p>
            <Link to="/articles/new" className="btn btn-primary">
              Create your first article
            </Link>
          </p>
        </div>
      ) : (
        <ul>
          {articles.map((article) => (
            <li key={article.id}>
              <Link to={`/articles/${article.id}`}>
                {article.title}
              </Link>{' '}
              <span
                className={`workspace-badge workspace-${article.workspace}`}
              >
                {getWorkspaceLabel(article.workspace)}
              </span>{' '}
              <span className='date'>
                {formatDate(article.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ArticleList;
