import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import ArticleList from './components/ArticleList';
import ArticleView from './components/ArticleView';
import ArticleEditor from './components/ArticleEditor';
import NotificationToast from './components/NotificationToast';
import Login from './components/Login';
import Register from './components/Register';
import UserManagement from './components/UserManagement';

function AppContent() {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();

  return (
    <div>
      {isAuthenticated && (
        <>
          <nav>
            <ul>
              <li><Link to="/articles">Articles</Link></li>
              <li><Link to="/articles/new">Create New</Link></li>
              {isAdmin && <li><Link to="/users">User Management</Link></li>}
              <li className='logout-container'>
                <span className='logout-message'>Welcome, {user?.email}</span>
                <button
                  onClick={logout}
                  className='logout-btn'
                >
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}
      <NotificationToast />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<ProtectedRoute><ArticleList /></ProtectedRoute>} />
        <Route path="/articles" element={<ProtectedRoute><ArticleList /></ProtectedRoute>} />
        <Route path="/articles/new" element={<ProtectedRoute><ArticleEditor isEditMode={false} /></ProtectedRoute>} />
        <Route path="/articles/:id" element={<ProtectedRoute><ArticleView /></ProtectedRoute>} />
        <Route path="/articles/:id/edit" element={<ProtectedRoute><ArticleEditor isEditMode={true} /></ProtectedRoute>} />
        <Route path="/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;