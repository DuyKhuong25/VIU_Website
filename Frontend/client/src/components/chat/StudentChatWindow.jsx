import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db, auth } from '../../../firebase.js';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { signInWithCustomToken, onAuthStateChanged } from "firebase/auth";
import { Send, MessageCircleMore, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import MessageBubble from './MessageBubble';
import { format, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';

const DateSeparator = ({ date }) => (
    <div className="text-center my-4">
        <span className="px-3 py-1 bg-gray-200 text-gray-600 text-[9px] font-semibold rounded-full">
            {format(date, 'EEEE, dd MMMM, yyyy', { locale: vi })}
        </span>
    </div>
);

function StudentChatWindow({ session, isOpen, onClose }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [conversationData, setConversationData] = useState(null);
    const [firebaseUser, setFirebaseUser] = useState(null);
    const messagesEndRef = useRef(null);
    const [expandedMessageId, setExpandedMessageId] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                if (messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({ behavior: "auto" });
                }
            }, 350);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user && user.uid === session.chatId) {
                setFirebaseUser(user);
            } else if (session?.firebaseToken) {
                signInWithCustomToken(auth, session.firebaseToken)
                    .catch(err => toast.error("Không thể kết nối tới dịch vụ chat."));
            }
        });
        return () => unsubscribeAuth();
    }, [session?.firebaseToken, session.chatId]);

    useEffect(() => {
        if (!firebaseUser || !session?.chatId) return;

        setIsLoading(true);
        const convDocRef = doc(db, "conversations", session.chatId);

        const unsubscribeConversation = onSnapshot(convDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const convData = docSnapshot.data();
                setConversationData(convData);

                const lastRead = convData.lastReadBy?.student?.toDate();
                const lastMessageTime = convData.lastMessageTimestamp?.toDate();
                if (lastMessageTime && (!lastRead || lastMessageTime > lastRead) && convData.lastMessageSenderType === 'ADMIN') {
                    updateDoc(convDocRef, { "lastReadBy.student": serverTimestamp() });
                }
            }
        });

        const messagesQuery = query(collection(convDocRef, "messages"), orderBy("timestamp", "asc"));
        const unsubscribeMessages = onSnapshot(messagesQuery, (messagesSnapshot) => {
            setMessages(messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsLoading(false);
        });

        return () => {
            unsubscribeConversation();
            unsubscribeMessages();
        };
    }, [firebaseUser, session?.chatId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        setIsSending(true)
        const textToSend = newMessage.trim();
        if (textToSend === '' || isSending || isLoading) return;

        setNewMessage('');

        const tempId = `temp_${Date.now()}`;
        const tempMessage = {
            id: tempId,
            text: textToSend,
            senderId: session.chatId,
            senderType: 'STUDENT',
            timestamp: { toDate: () => new Date() } // Dùng thời gian cục bộ cho tin nhắn tạm
        };

        setMessages(prevMessages => [...prevMessages, tempMessage]);

        const messagesColRef = collection(db, "conversations", session.chatId, "messages");
        try {
            await addDoc(messagesColRef, {
                text: textToSend,
                senderId: session.chatId,
                senderType: 'STUDENT',
                timestamp: serverTimestamp()
            });
            setIsSending(false)
        } catch (error) {
            toast.error("Gửi tin nhắn thất bại.");
            setIsSending(false)
            setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempId));
        }
    };

    const handleInputFocus = () => {
        if (!conversationData || !session?.chatId) return;
        const lastRead = conversationData.lastReadBy?.student?.toDate();
        const lastMessageTime = conversationData.lastMessageTimestamp?.toDate();
        if (lastMessageTime && (!lastRead || lastMessageTime > lastRead) && conversationData.lastMessageSenderType === 'ADMIN') {
            const convDocRef = doc(db, "conversations", session.chatId);
            updateDoc(convDocRef, { "lastReadBy.student": serverTimestamp() });
        }
    };

    const handleBubbleClick = (messageId) => {
        setExpandedMessageId(prevId => (prevId === messageId ? null : messageId));
    };

    const groupedMessages = useMemo(() => {
        if (!messages || messages.length === 0) return [];

        const groups = [];
        let lastDate = null;

        messages.forEach((message, index) => {
            if (message.timestamp) {
                const messageDate = message.timestamp.toDate();

                if (!lastDate || !isSameDay(lastDate, messageDate)) {
                    groups.push({ type: 'date', date: messageDate, id: messageDate.toISOString() });
                    lastDate = messageDate;
                }

                const nextMessage = messages[index + 1];

                const isEndOfBlock = !nextMessage ||
                    nextMessage.senderType !== message.senderType ||
                    (nextMessage.timestamp && (nextMessage.timestamp.toDate() - messageDate > 5 * 60 * 1000));

                groups.push({ type: 'message', ...message, isEndOfBlock });
            } else {
                groups.push({ type: 'message', ...message, isEndOfBlock: true });
            }
        });
        return groups;
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-white rounded-[3px] overflow-hidden">
            <div className="relative p-4 border-b flex items-center space-x-3 bg-blue-600 text-white">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                    <MessageCircleMore size={22} className="text-blue-600"/>
                </div>
                <div>
                    <p className="font-bold text-[13px]">Đại Học Công Nghiêp Việt Hung</p>
                    <p className="text-[10px] text-blue-200 mt-0.5">dhcnviethung.viu@gmail.com</p>
                </div>
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-2 text-blue-200 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Đóng"
                >
                    <X size={20}/>
                </button>
            </div>

            <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full"><Loader2
                        className="animate-spin text-blue-500" size={32}/></div>
                ) : groupedMessages.map(item =>
                    item.type === 'date' ? (
                        <DateSeparator key={item.id} date={item.date}/>
                    ) : (
                        <MessageBubble
                            key={item.id}
                            message={item}
                            isMyMessage={item.senderType === 'STUDENT'}
                            isRead={item.senderType === 'STUDENT' && conversationData?.lastReadBy?.admin && item.timestamp?.toDate() <= conversationData.lastReadBy.admin?.toDate()}
                            isEndOfBlock={item.isEndOfBlock}
                            isExpanded={expandedMessageId === item.id}
                            onClick={() => handleBubbleClick(item.id)}
                        />
                    )
                )}
                <div ref={messagesEndRef}/>
            </div>

            <div className="p-2 border-t border-blue-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={newMessage}
                        onFocus={handleInputFocus}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        className="flex-grow text-[13px] px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-300 transition"
                    />
                    <button type="submit" disabled={isSending || isLoading}
                            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center w-10 h-10">
                        {isSending ? <Loader2 className="animate-spin" size={16}/> : <Send size={22}/>}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default StudentChatWindow;