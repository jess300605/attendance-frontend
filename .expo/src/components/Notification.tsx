// src/components/Notification.tsx
import React from 'react';
import { useNotification } from '../context/NotificationContext';
import './Notification.css';

const Notification: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className={`notification notification-${notification.type}`}
        >
          <div className="notification-icon">
            {notification.type === 'success' && <i className="fas fa-check-circle"></i>}
            {notification.type === 'error' && <i className="fas fa-exclamation-circle"></i>}
            {notification.type === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
            {notification.type === 'info' && <i className="fas fa-info-circle"></i>}
          </div>
          <div className="notification-content">
            <p>{notification.message}</p>
          </div>
          <button 
            className="notification-close" 
            onClick={() => removeNotification(notification.id)}
            aria-label="Cerrar notificación"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notification;