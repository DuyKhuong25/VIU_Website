import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app as firebaseApp } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    getRecentNotifications,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    subscribeToNotifications,
    deleteNotification, deleteAllNotifications
} from '../services/notificationService';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [recentNotifications, setRecentNotifications] = useState([]);
    const [paginatedData, setPaginatedData] = useState({ notifications: [], pageInfo: { currentPage: 0, totalPages: 0 } });
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchRecent = useCallback(async () => {
        try {
            const res = await getRecentNotifications();
            setRecentNotifications(res.data);
        } catch (error) {
            console.error("Không thể tải thông báo gần đây", error);
        }
    }, []);

    const fetchPaginated = useCallback(async (page = 0) => {
        try {
            const res = await getNotifications(page, 15);
            setPaginatedData({
                notifications: res.data.content,
                pageInfo: { currentPage: res.data.number, totalPages: res.data.totalPages }
            });
        } catch (error) {
            toast.error("Không thể tải lịch sử thông báo.");
        }
    }, []);

    const handleDeleteNotification = async (id) => {
        try {
            await deleteNotification(id);
            refreshAll();
        } catch (error) {
            toast.error("Lỗi khi xóa thông báo.");
        }
    };

    const handleDeleteAllNotifications = async () => {
        try {
            await deleteAllNotifications();
            refreshAll();
            toast.success("Đã xóa tất cả thông báo.");
        } catch (error) {
            toast.error("Lỗi khi xóa tất cả thông báo.");
        }
    };

    const refreshAll = useCallback(() => {
        fetchRecent();
        setPaginatedData(prev => {
            fetchPaginated(prev.pageInfo.currentPage);
            return prev;
        });
    }, [fetchRecent, fetchPaginated]);

    useEffect(() => {
        if (!user) return;

        const canReceiveNotifications = user.roles.includes('ROLE_ADMIN');

        if (canReceiveNotifications) {
            fetchRecent();

            const setupFirebaseListener = async () => {
                try {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        const messaging = getMessaging(firebaseApp);
                        const currentToken = await getToken(messaging, { vapidKey: 'BJIcTFpg4QNiPc7Us9NQo7yYE0p2w0yy0QORKQKtxL5OGnp5ylGRXP6lWO_XfCPc4RAzSPdoawYkxLawKv3hynw' });
                        if (currentToken) {
                            await subscribeToNotifications(currentToken);
                        }
                    }
                } catch (error) {
                    console.error('Lỗi khi thiết lập Firebase Messaging: ', error);
                }
            };
            setupFirebaseListener();

            const messaging = getMessaging(firebaseApp);
            const unsubscribeOnMessage = onMessage(messaging, (payload) => {
                toast.success(payload.notification.title || 'Bạn có thông báo mới!');
                refreshAll();
            });

            const broadcast = new BroadcastChannel('notifications-channel');
            const broadcastListener = (event) => {
                if (event.data && event.data.type === 'NEW_NOTIFICATION_RECEIVED') {
                    toast.success('Bạn có thông báo mới!');
                    refreshAll();
                }
            };
            broadcast.addEventListener('message', broadcastListener);

            return () => {
                unsubscribeOnMessage();
                broadcast.removeEventListener('message', broadcastListener);
                broadcast.close();
            };
        }
    }, [user, fetchRecent, refreshAll]);

    const handleMarkAsRead = async (id, link) => {
        try {
            await markNotificationAsRead(id);
            refreshAll();
            if (link) navigate(link);
        } catch (error) { toast.error("Lỗi khi đánh dấu đã đọc."); }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            refreshAll();
        } catch (error) { toast.error("Lỗi khi đánh dấu đã đọc tất cả."); }
    };

    const unreadCount = recentNotifications.filter(n => !n.read).length;

    const value = {
        recentNotifications,
        unreadCount,
        paginatedData,
        fetchPaginated,
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
        deleteNotification: handleDeleteNotification,
        deleteAllNotifications: handleDeleteAllNotifications
    };

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};