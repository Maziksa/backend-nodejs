import React from 'react';

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import ArticleList from './components/ArticleList';
import ArticleView from './components/ArticleView';
import ArticleEditor from './components/ArticleEditor';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <ul>
          <li><Link to="/articles">Home (Article List)</Link></li>
          <li><Link to="/create">Create New Article</Link></li>
        </ul>
      </nav>
      <main className="container">
        <Routes>
          <Route path="/articles" element={<ArticleList />} />
          <Route path="/articles/:id" element={<ArticleView />} />
          <Route path="/create" element={<ArticleEditor isEditMode={false} />} />
          <Route path="/edit/:id" element={<ArticleEditor isEditMode={true} />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
