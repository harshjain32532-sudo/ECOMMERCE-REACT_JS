import React, { useState, useEffect } from 'react';
import './NotificationCenter.css';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [preferences, setPreferences] = useState({});
    const [activeTab, setActiveTab] = useState('notifications');
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        loadNotifications();
        loadPreferences();
    }, [activeTab]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/notifications?page=1&limit=20');
            const data = await response.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPreferences = async () => {
        try {
            const response = await fetch('/api/notification-preferences');
            const data = await response.json();
            setPreferences(data.preferences || {});
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await fetch(`/api/notifications/${notificationId}/read`, { method: 'PUT' });
            loadNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/mark-all-read', { method: 'PUT' });
            loadNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' });
            loadNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const updatePreferences = async (newPrefs) => {
        try {
            await fetch('/api/notification-preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPrefs)
            });
            setPreferences(newPrefs);
        } catch (error) {
            console.error('Error updating preferences:', error);
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            'order_status': '📦',
            'promotion': '🎉',
            'payment': '💳',
            'delivery': '🚚',
            'review': '⭐',
            'wishlist': '❤️',
            'general': 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    };

    return (
        <div className="notification-center">
            <div className="nc-header">
                <h1>🔔 Notification Center</h1>
                {unreadCount > 0 && (
                    <button className="btn btn-secondary" onClick={markAllAsRead}>
                        Mark All as Read ({unreadCount})
                    </button>
                )}
            </div>

            <div className="nc-tabs">
                <button
                    className={`nc-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    Notifications ({unreadCount})
                </button>
                <button
                    className={`nc-tab ${activeTab === 'preferences' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preferences')}
                >
                    Preferences
                </button>
            </div>

            <div className="nc-content">
                {activeTab === 'notifications' && (
                    <div className="notifications-section">
                        {loading ? (
                            <div className="loading">Loading notifications...</div>
                        ) : notifications.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🔔</div>
                                <p>No notifications</p>
                            </div>
                        ) : (
                            <div className="notifications-list">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                                    >
                                        <div className="notification-icon">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="notification-body">
                                            <h3>{notification.title}</h3>
                                            <p>{notification.message}</p>
                                            <span className="notification-time">
                                                {new Date(notification.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="notification-actions">
                                            {!notification.read && (
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => markAsRead(notification._id)}
                                                >
                                                    ✓
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => deleteNotification(notification._id)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'preferences' && (
                    <div className="preferences-section">
                        <div className="preference-group">
                            <h2>📢 Notification Channels</h2>
                            <div className="preference-option">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={preferences.channels?.email || false}
                                        onChange={(e) => updatePreferences({
                                            ...preferences,
                                            channels: { ...preferences.channels, email: e.target.checked }
                                        })}
                                    />
                                    <span>📧 Email Notifications</span>
                                </label>
                            </div>
                            <div className="preference-option">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={preferences.channels?.sms || false}
                                        onChange={(e) => updatePreferences({
                                            ...preferences,
                                            channels: { ...preferences.channels, sms: e.target.checked }
                                        })}
                                    />
                                    <span>📱 SMS Notifications</span>
                                </label>
                            </div>
                            <div className="preference-option">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={preferences.channels?.push || false}
                                        onChange={(e) => updatePreferences({
                                            ...preferences,
                                            channels: { ...preferences.channels, push: e.target.checked }
                                        })}
                                    />
                                    <span>🔔 Push Notifications</span>
                                </label>
                            </div>
                        </div>

                        <div className="preference-group">
                            <h2>📋 Notification Categories</h2>
                            {[
                                { key: 'orderUpdates', label: 'Order Updates', icon: '📦' },
                                { key: 'promotions', label: 'Promotions & Offers', icon: '🎉' },
                                { key: 'productRecommendations', label: 'Product Recommendations', icon: '💡' },
                                { key: 'reviews', label: 'Review Requests', icon: '⭐' },
                                { key: 'wishlistNotifications', label: 'Wishlist Price Drops', icon: '❤️' },
                                { key: 'newsletter', label: 'Newsletter', icon: '📰' },
                                { key: 'paymentUpdates', label: 'Payment Updates', icon: '💳' },
                                { key: 'deliveryUpdates', label: 'Delivery Updates', icon: '🚚' }
                            ].map((category) => (
                                <div key={category.key} className="preference-option">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={preferences.categories?.[category.key] || false}
                                            onChange={(e) => updatePreferences({
                                                ...preferences,
                                                categories: {
                                                    ...preferences.categories,
                                                    [category.key]: e.target.checked
                                                }
                                            })}
                                        />
                                        <span>{category.icon} {category.label}</span>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="preference-group">
                            <h2>⏰ Quiet Hours</h2>
                            <div className="quiet-hours-toggle">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={preferences.quietHours?.enabled || false}
                                        onChange={(e) => updatePreferences({
                                            ...preferences,
                                            quietHours: { ...preferences.quietHours, enabled: e.target.checked }
                                        })}
                                    />
                                    <span>Enable Quiet Hours</span>
                                </label>
                            </div>
                            {preferences.quietHours?.enabled && (
                                <div className="quiet-hours-inputs">
                                    <label>
                                        From:
                                        <input
                                            type="time"
                                            defaultValue={preferences.quietHours?.startTime || '22:00'}
                                            onChange={(e) => updatePreferences({
                                                ...preferences,
                                                quietHours: { ...preferences.quietHours, startTime: e.target.value }
                                            })}
                                        />
                                    </label>
                                    <label>
                                        To:
                                        <input
                                            type="time"
                                            defaultValue={preferences.quietHours?.endTime || '08:00'}
                                            onChange={(e) => updatePreferences({
                                                ...preferences,
                                                quietHours: { ...preferences.quietHours, endTime: e.target.value }
                                            })}
                                        />
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="preference-group">
                            <h2>🔄 Notification Frequency</h2>
                            <div className="frequency-selector">
                                {['instant', 'daily', 'weekly', 'never'].map((freq) => (
                                    <label key={freq}>
                                        <input
                                            type="radio"
                                            name="frequency"
                                            value={freq}
                                            checked={preferences.frequency === freq}
                                            onChange={(e) => updatePreferences({
                                                ...preferences,
                                                frequency: e.target.value
                                            })}
                                        />
                                        <span className="frequency-label">
                                            {freq === 'instant' && '⚡ Instantly'}
                                            {freq === 'daily' && '📅 Daily Digest'}
                                            {freq === 'weekly' && '📈 Weekly Digest'}
                                            {freq === 'never' && '🔕 Never'}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="preferences-actions">
                            <button className="btn btn-primary">✓ Save Preferences</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;
