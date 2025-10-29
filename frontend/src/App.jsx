import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import ArticleList from './components/ArticleList';
import ArticleView from './components/ArticleView';
import ArticleEditor from './components/ArticleEditor';

function App() {
    return (
        <>
            <nav>
                <ul>
                    <li>
                        <Link to="/">Home (Article List)</Link>
                    </li>
                    <li>
                        <Link to="/create">Create New Article</Link>
                    </li>
                </ul>
            </nav>

            <main className="container">
                <Routes>
                    <Route path="/" element={<ArticleList />} />
                    <Route path="/articles/:id" element={<ArticleView />} />
                    <Route path="/create" element={<ArticleEditor />} />
                </Routes>
            </main>
        </>
    );
}

export default App;