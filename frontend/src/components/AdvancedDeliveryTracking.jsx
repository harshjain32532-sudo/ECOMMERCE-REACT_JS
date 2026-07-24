import React, { useState, useEffect } from 'react';
import './DeliveryTracking.css';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DeliveryTracking = ({ orderId, trackingNumber }) => {
    const [tracking, setTracking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('timeline');
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        fetchTrackingData();
    }, [trackingNumber, orderId]);

    const fetchTrackingData = async () => {
        try {
            setLoading(true);
            const endpoint = trackingNumber
                ? `${API_BASE}/delivery-tracking/${trackingNumber}`
                : `${API_BASE}/delivery-tracking/order/${orderId}`;

            const response = await fetch(endpoint);
            const data = await response.json();
            setTracking(data.tracking);
        } catch (error) {
            console.error('Error fetching tracking:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        const icons = {
            'pending': '📦',
            'picked_up': '📤',
            'in_transit': '🚚',
            'out_for_delivery': '🚗',
            'delivered': '✅',
            'failed': '❌',
            'returned': '↩️'
        };
        return icons[status] || '📦';
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': '#f39c12',
            'picked_up': '#3498db',
            'in_transit': '#9b59b6',
            'out_for_delivery': '#e74c3c',
            'delivered': '#27ae60',
            'failed': '#c0392b',
            'returned': '#95a5a6'
        };
        return colors[status] || '#95a5a6';
    };

    if (loading) {
        return <div className="delivery-tracking loading">Loading tracking information...</div>;
    }

    if (!tracking) {
        return <div className="delivery-tracking error">Tracking information not available</div>;
    }

    return (
        <div className="delivery-tracking">
            <div className="tracking-header">
                <div className="header-content">
                    <h2>📍 Delivery Tracking</h2>
                    <p className="tracking-number">Tracking #: {tracking.trackingNumber}</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowMap(!showMap)}
                >
                    {showMap ? 'Hide Map' : 'Show Map'}
                </button>
            </div>

            {/* Current Status Section */}
            <div className="status-section">
                <div className="current-status">
                    <div className="status-badge" style={{ background: getStatusColor(tracking.status) }}>
                        {getStatusIcon(tracking.status)}
                    </div>
                    <div className="status-info">
                        <h3>{tracking.status?.replace('_', ' ').toUpperCase()}</h3>
                        <p>{tracking.currentLocation}</p>
                        {tracking.estimatedDeliveryTime && (
                            <p className="estimated-time">
                                📅 Expected by: {new Date(tracking.estimatedDeliveryTime).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>

                {/* Driver Info */}
                {tracking.driver && (
                    <div className="driver-card">
                        <div className="driver-photo">
                            {tracking.driver.photo ? (
                                <img src={tracking.driver.photo} alt="Driver" />
                            ) : (
                                <div className="photo-placeholder">👤</div>
                            )}
                        </div>
                        <div className="driver-info">
                            <h4>{tracking.driver.name}</h4>
                            <p className="rating">⭐ {tracking.driver.rating || 5}.0 ({tracking.driver.totalDeliveries || 0} deliveries)</p>
                            <a href={`tel:${tracking.driver.phone}`} className="driver-phone">
                                📞 {tracking.driver.phone}
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* GPS Live Tracking */}
            {showMap && tracking.gpsTracking?.enabled && (
                <div className="map-section">
                    {(tracking.gpsTracking.latitude !== undefined && tracking.gpsTracking.longitude !== undefined) ? (
                        <div className="map-frame-wrapper">
                            <iframe
                                title="Live delivery map"
                                className="map-frame"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${tracking.gpsTracking.longitude - 0.03}%2C${tracking.gpsTracking.latitude - 0.02}%2C${tracking.gpsTracking.longitude + 0.03}%2C${tracking.gpsTracking.latitude + 0.02}&layer=mapnik&marker=${tracking.gpsTracking.latitude}%2C${tracking.gpsTracking.longitude}`}
                                loading="lazy"
                            />
                            <div className="map-caption">
                                <p><strong>Live driver location</strong></p>
                                <p>Latitude: {tracking.gpsTracking.latitude.toFixed(6)}</p>
                                <p>Longitude: {tracking.gpsTracking.longitude.toFixed(6)}</p>
                                <p>Accuracy: ±{tracking.gpsTracking.accuracy} meters</p>
                                <p>Last updated: {new Date(tracking.gpsTracking.lastUpdated).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="map-placeholder">
                            <div className="map-info">
                                <h3>📍 Live Location</h3>
                                <p>Latitude: {tracking.gpsTracking.latitude?.toFixed(6) || 'N/A'}</p>
                                <p>Longitude: {tracking.gpsTracking.longitude?.toFixed(6) || 'N/A'}</p>
                                <p>Accuracy: ±{tracking.gpsTracking.accuracy} meters</p>
                                <p className="last-update">
                                    Last updated: {new Date(tracking.gpsTracking.lastUpdated).toLocaleTimeString()}
                                </p>
                                <p className="next-update">
                                    Next update in: {tracking.gpsTracking.nextUpdateScheduled || '5 minutes'}
                                </p>
                            </div>
                            <div className="map-icon">🗺️</div>
                        </div>
                    )}

                    {tracking.route?.length > 0 && (
                        <div className="route-summary">
                            <h4>Route checkpoints</h4>
                            <ul>
                                {tracking.route.map((point, idx) => (
                                    <li key={idx}>
                                        <strong>{point.checkpoint}</strong> — {point.status}
                                        {point.notes ? `: ${point.notes}` : ''}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Tabs */}
            <div className="tracking-tabs">
                <button
                    className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
                    onClick={() => setActiveTab('timeline')}
                >
                    Timeline
                </button>
                <button
                    className={`tab ${activeTab === 'details' ? 'active' : ''}`}
                    onClick={() => setActiveTab('details')}
                >
                    Details
                </button>
                {tracking.deliveryAttempts?.length > 0 && (
                    <button
                        className={`tab ${activeTab === 'attempts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('attempts')}
                    >
                        Attempts
                    </button>
                )}
            </div>

            {/* Tab Content */}
            <div className="tracking-content">
                {activeTab === 'timeline' && (
                    <div className="timeline">
                        {tracking.statusHistory?.length > 0 ? (
                            tracking.statusHistory.map((event, idx) => (
                                <div key={idx} className="timeline-event">
                                    <div className="timeline-dot" style={{ background: getStatusColor(event.status) }}>
                                        {getStatusIcon(event.status)}
                                    </div>
                                    <div className="timeline-body">
                                        <h4>{event.status?.replace('_', ' ').toUpperCase()}</h4>
                                        <p className="timeline-location">📍 {event.location}</p>
                                        <p className="timeline-notes">{event.notes}</p>
                                        <span className="timeline-date">
                                            {new Date(event.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="empty">No timeline events yet</p>
                        )}
                    </div>
                )}

                {activeTab === 'details' && (
                    <div className="details">
                        <div className="detail-row">
                            <span className="label">Carrier:</span>
                            <span className="value">{tracking.carrierName} ({tracking.carrier})</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Tracking Number:</span>
                            <span className="value">{tracking.trackingNumber}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Current Location:</span>
                            <span className="value">{tracking.currentLocation}</span>
                        </div>
                        {tracking.estimatedDeliveryTime && (
                            <div className="detail-row">
                                <span className="label">Estimated Delivery:</span>
                                <span className="value">
                                    {new Date(tracking.estimatedDeliveryTime).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        {tracking.actualDeliveryTime && (
                            <div className="detail-row">
                                <span className="label">Delivered At:</span>
                                <span className="value">
                                    {new Date(tracking.actualDeliveryTime).toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'attempts' && tracking.deliveryAttempts?.length > 0 && (
                    <div className="attempts">
                        {tracking.deliveryAttempts.map((attempt, idx) => (
                            <div key={idx} className="attempt-card">
                                <div className="attempt-header">
                                    <h4>Attempt #{attempt.attemptNumber}</h4>
                                    <span className="attempt-status">{attempt.status}</span>
                                </div>
                                <p className="attempt-time">
                                    📅 {new Date(attempt.timestamp).toLocaleString()}
                                </p>
                                {attempt.notes && <p className="attempt-notes">{attempt.notes}</p>}
                                {attempt.photoUrl && (
                                    <img src={attempt.photoUrl} alt="Delivery attempt" className="attempt-photo" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Proof of Delivery */}
            {tracking.proofOfDelivery && tracking.status === 'delivered' && (
                <div className="proof-section">
                    <h3>✅ Proof of Delivery</h3>
                    <div className="proof-content">
                        {tracking.proofOfDelivery.recipientName && (
                            <p><strong>Recipient:</strong> {tracking.proofOfDelivery.recipientName}</p>
                        )}
                        {tracking.proofOfDelivery.deliveryPhoto && (
                            <div className="proof-photo">
                                <img src={tracking.proofOfDelivery.deliveryPhoto} alt="Delivery proof" />
                            </div>
                        )}
                        {tracking.proofOfDelivery.signaturePhoto && (
                            <div className="proof-signature">
                                <p><strong>Signature:</strong></p>
                                <img src={tracking.proofOfDelivery.signaturePhoto} alt="Signature" />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Issues */}
            {tracking.issues?.length > 0 && (
                <div className="issues-section">
                    <h3>⚠️ Issues Reported</h3>
                    {tracking.issues.map((issue, idx) => (
                        <div key={idx} className="issue-card">
                            <h4>{issue.type}</h4>
                            <p>{issue.description}</p>
                            {issue.resolution && (
                                <p className="resolution">✅ Resolution: {issue.resolution}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DeliveryTracking;
