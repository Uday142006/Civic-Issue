import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import '../styles/Notifications.css';

export default function Notifications() {
  const user = useSelector((state) => state.auth.user);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Initialize Socket.io
    const newSocket = io(import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Connected to notification server');
      newSocket.emit('join-user-room', user.id);
    });

    newSocket.on('notification', (data) => {
      addNotification(data);
    });

    newSocket.on('report-updated', (data) => {
      addNotification({
        type: 'report_update',
        message: `Report updated: ${data.action}`,
        reportId: data.report._id,
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const addNotification = (notif) => {
    const newNotif = {
      id: Date.now(),
      ...notif,
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev].slice(0, 50));
    setUnreadCount((prev) => prev + 1);

    // Auto-dismiss after 5s
    setTimeout(() => {
      dismissNotification(newNotif.id);
    }, 5000);
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      report_update: '📝',
      comment: '💬',
      assignment: '📋',
      resolution: '✅',
      message: '📧',
      system: 'ℹ️',
    };
    return icons[type] || '🔔';
  };

  return (
    <div className="notifications-container">
      {/* Notification Bell */}
      <button
        className="notification-bell"
        onClick={() => setShowPanel(!showPanel)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {/* Notifications Panel */}
      {showPanel && (
        <div className="notifications-panel">
          <div className="panel-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={clearAll} className="clear-btn">
                Clear All
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="empty-state">
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${!notif.read ? 'unread' : ''}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="notif-icon">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="notif-content">
                    <p className="notif-message">{notif.message}</p>
                    <span className="notif-time">
                      {new Date(notif.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <button
                    className="close-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissNotification(notif.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
