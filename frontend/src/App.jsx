import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ArticleList from './components/ArticleList';
import ArticleView from './components/ArticleView';
import ArticleEditor from './components/ArticleEditor';
import NotificationToast from './components/NotificationToast';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <ul>
          <li>
            <Link to="/articles">Home (Article List)</Link>
          </li>
          <li>
            <Link to="/articles/create">Create New Article</Link>
          </li>
        </ul>
      </nav>
      
      <NotificationToast />
      
      <Routes>
        <Route path="/" element={<ArticleList />} />
        <Route path="/articles" element={<ArticleList />} />
        <Route path="/articles/create" element={<ArticleEditor isEditMode={false} />} />
        <Route path="/articles/:id" element={<ArticleView />} />
        <Route path="/articles/:id/edit" element={<ArticleEditor isEditMode={true} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
