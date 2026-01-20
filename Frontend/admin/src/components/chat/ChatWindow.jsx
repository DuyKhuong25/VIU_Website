import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Send, Loader2, Paperclip, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import MessageBubble from './MessageBubble';
import { format, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import Avatar from "./Avatar.jsx";

const DateSeparator = ({ date }) => (
    <div className="text-center my-4">
        <span className="px-3 py-1 bg-gray-200 text-gray-600 text-[10px] font-semibold rounded-full">
            {format(date, 'EEEE, dd MMMM, yyyy', { locale: vi })}
        </span>
    </div>
);

function ChatWindow({ conversation, onSendMessage }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [messages]);

    useEffect(() => {
        if (!conversation?.firestoreConversationId) return;

        setIsLoading(true);
        const convDocRef = doc(db, "conversations", conversation.firestoreConversationId);

        const markAsRead = () => {
            if (conversation.hasUnreadByAdmin) {
                updateDoc(convDocRef, {
                    "lastReadBy.admin": serverTimestamp(),
                    hasUnreadByAdmin: false,
                    unreadMessageCountByAdmin: 0
                });
            }
        };

        markAsRead();

        const unsubscribeConversation = onSnapshot(convDocRef, (docSnapshot) => {});

        const messagesQuery = query(collection(convDocRef, "messages"), orderBy("timestamp", "asc"));
        const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsLoading(false);
        });

        return () => {
            unsubscribeMessages();
            unsubscribeConversation();
        };
    }, [conversation.firestoreConversationId, conversation.hasUnreadByAdmin]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || isSending) return;
        setIsSending(true);
        try {
            await onSendMessage(conversation.firestoreConversationId, newMessage);
            setNewMessage('');
        } catch { toast.error("Gửi tin nhắn thất bại."); }
        finally {
            setIsSending(false);
        }
    };

    const groupedMessages = useMemo(() => {
        if (!messages) return [];
        const groups = [];
        let lastDate = null;
        messages.forEach(message => {
            if (message.timestamp) {
                const messageDate = message.timestamp.toDate();
                if (!lastDate || !isSameDay(lastDate, messageDate)) {
                    groups.push({ type: 'date', date: messageDate, id: messageDate.toISOString() });
                    lastDate = messageDate;
                }
            }
            groups.push({ type: 'message', ...message });
        });
        return groups;
    }, [messages]);

    const handleInputFocus = () => {
        if (conversation.hasUnreadByAdmin) {
            const convDocRef = doc(db, "conversations", conversation.firestoreConversationId);
            updateDoc(convDocRef, {
                "lastReadBy.admin": serverTimestamp(),
                hasUnreadByAdmin: false,
                unreadMessageCountByAdmin: 0
            });
        }
    };

    return (
        <div className="flex flex-col h-full bg-white w-full">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                    <Avatar name={conversation.studentName} />
                    <div>
                        <p className="font-bold text-gray-800">{conversation.studentName}</p>
                        <p className="text-sm text-gray-500 flex items-center"><Mail className="mail mr-1" size={16}/>{conversation.studentEmail}</p>
                    </div>
                </div>
            </div>

            <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
                ) : groupedMessages.map((item) =>
                    item.type === 'date' ? (
                        <DateSeparator key={item.id} date={item.date} />
                    ) : (
                        <MessageBubble
                            key={item.id}
                            message={item}
                            senderName={conversation.studentName}
                            isRead={
                                item.senderType === 'ADMIN' &&
                                conversation.lastReadBy?.student?.toDate() &&
                                item.timestamp?.toDate() &&
                                item.timestamp.toDate() <= conversation.lastReadBy.student.toDate()
                            }
                        />
                    )
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <button type="button" className="p-2 text-gray-500 hover:text-blue-600">
                        <Paperclip size={22} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onFocus={handleInputFocus}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        className="flex-grow px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-300 transition"
                        disabled={isSending}
                    />
                    <button type="submit" disabled={isSending} className="p-3 bg-blue-900 text-white rounded-full hover:bg-blue-800 disabled:bg-gray-400 transition-colors flex items-center justify-center w-10 h-10">
                        {isSending ? <Loader2 className="animate-spin" size={22} /> : <Send size={22} />}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ChatWindow;