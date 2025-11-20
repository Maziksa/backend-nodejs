import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

function NotificationToast() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket:', reason);
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to WebSocket after', attemptNumber, 'attempts');
      addNotification('Reconnected to server', 'success');
    });

    socket.on('reconnect_attempt', () => {
      console.log('Attempting to reconnect...');
    });

    socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect to WebSocket');
      addNotification('Failed to connect to server', 'error');
    });

    socket.on('article-created', (data) => {
      addNotification(`New article created: "${data.title}"`, 'success');
    });

    socket.on('article-updated', (data) => {
      addNotification(`Article updated: "${data.title}"`, 'info');
    });

    socket.on('article-deleted', (data) => {
      addNotification(`Article deleted`, 'warning');
    });

    socket.on('attachment-added', (data) => {
      addNotification(`File attached to "${data.articleTitle}": ${data.attachment.originalName}`, 'success');
    });

    socket.on('attachment-deleted', (data) => {
      addNotification(`Attachment removed from "${data.articleTitle}"`, 'warning');
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('reconnect');
      socket.off('reconnect_attempt');
      socket.off('reconnect_error');
      socket.off('reconnect_failed');
      socket.off('article-created');
      socket.off('article-updated');
      socket.off('article-deleted');
      socket.off('attachment-added');
      socket.off('attachment-deleted');
    };
  }, []);

  const addNotification = (message, type) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map(notif => (
        <div key={notif.id} className={`notification notification-${notif.type}`}>
          <span>{notif.message}</span>
          <button 
            className="notification-close" 
            onClick={() => removeNotification(notif.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default NotificationToast;
export { socket };
