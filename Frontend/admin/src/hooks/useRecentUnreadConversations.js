import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

export const useRecentUnreadConversations = (listLimit = 5) => {
    const { user } = useAuth();
    const [recentConversations, setRecentConversations] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) {
            setRecentConversations([]);
            setUnreadCount(0);
            return;
        }

        const listQuery = query(
            collection(db, "conversations"),
            where("hasUnreadByAdmin", "==", true),
            orderBy("lastMessageTimestamp", "desc"),
            limit(listLimit)
        );
        const unsubscribeList = onSnapshot(listQuery, (snapshot) => {
            const convs = snapshot.docs.map(doc => ({
                firestoreConversationId: doc.id,
                ...doc.data()
            }));
            setRecentConversations(convs);
        });

        const countQuery = query(collection(db, "conversations"), where("hasUnreadByAdmin", "==", true));
        const unsubscribeCount = onSnapshot(countQuery, (snapshot) => {
            setUnreadCount(snapshot.size);
        });

        return () => {
            unsubscribeList();
            unsubscribeCount();
        };

    }, [user, listLimit]);

    return { recentConversations, unreadCount };
};