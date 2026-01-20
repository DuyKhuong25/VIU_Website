import React, {useState, useEffect, useMemo} from 'react';
import { db } from '../firebase';
import {collection, query, orderBy, onSnapshot, updateDoc, serverTimestamp, doc} from "firebase/firestore";
import { markAsRead, postAdminMessage } from '../services/chatService';
import toast from 'react-hot-toast';
import { MessageCircleMore, Inbox, Loader2, Search } from 'lucide-react';
import ChatWindow from '../components/chat/ChatWindow';
import ConversationItem from '../components/chat/ConversationItem';
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from '../firebase';


function ChatAdminPage() {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [filter, setFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // useEffect lắng nghe Firebase real-time
    useEffect(() => {
        setLoading(true);

        // Query để lấy tất cả conversations, sắp xếp theo tin nhắn mới nhất lên đầu
        const q = query(collection(db, "conversations"), orderBy("lastMessageTimestamp", "desc"));

        // Thiết lập trình lắng nghe real-time
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const conversationsFromFirebase = querySnapshot.docs.map(doc => ({
                firestoreConversationId: doc.id,
                ...doc.data()
            }));

            setConversations(conversationsFromFirebase);
            setLoading(false);
        }, (error) => {
            console.error("Lỗi khi lắng nghe conversations:", error);
            toast.error("Không thể tải danh sách cuộc trò chuyện.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);
        // Chỉ thực hiện cập nhật khi người dùng chọn
        if (conversation.hasUnreadByAdmin) {
            const convDocRef = doc(db, "conversations", conversation.firestoreConversationId);
            // Cập nhật cả trạng thái và thời gian đọc của Admin
            updateDoc(convDocRef, {
                hasUnreadByAdmin: false,
                unreadMessageCountByAdmin: 0,
                "lastReadBy.admin": serverTimestamp()
            }).catch(err => console.error("Lỗi khi đánh dấu đã đọc:", err));
        }
    };

    const handleAdminSendMessage = async (firestoreId, text) => {
        try {
            // Chỉ cần gọi API, Cloud Function và onSnapshot sẽ tự động cập nhật giao diện
            await postAdminMessage(firestoreId, { text });
        } catch (error) {
            toast.error("Gửi tin nhắn thất bại.");
            throw error;
        }
    };

    const handleDeleteConversation = async (conversation) => {
        if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn cuộc trò chuyện với ${conversation.studentName}?`)) {
            return;
        }

        // Nếu đang xem tin nhắn bị xóa thì đóng tin nhắn
        if (selectedConversation?.firestoreConversationId === conversation.firestoreConversationId) {
            setSelectedConversation(null);
        }

        const toastId = toast.loading("Đang xóa cuộc trò chuyện...");
        try {
            const functions = getFunctions(app, "asia-southeast1");
            const deleteChatCallable = httpsCallable(functions, 'deleteConversation');
            // Gọi Cloud Function
            await deleteChatCallable({ firestoreId: conversation.firestoreConversationId });

            toast.success("Đã xóa thành công.", { id: toastId });

        } catch (error) {
            console.error("Lỗi khi xóa:", error);
            toast.error(error.message || "Xóa thất bại. Vui lòng thử lại.", { id: toastId });
        }
    };

    const FilterButton = ({ label, value, count }) => (
        <button
            onClick={() => setFilter(value)}
            className={`relative px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                filter === value ? 'bg-[var(--brand-blue)] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
            {label}
            {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white">
                    {count}
                </span>
            )}
        </button>
    );

    const unreadConversationsCount = useMemo(() => {
        return conversations.filter(c => c.hasUnreadByAdmin === true).length;
    }, [conversations]);

    // Lọc dữ liệu cuộc trò chuyện
    const filteredConversations = useMemo(() => {
        return conversations.filter(conv => {
            // 1. Lọc theo trạng thái (Tất cả / Chưa đọc)
            const matchesFilter = (filter === 'UNREAD') ? conv.hasUnreadByAdmin === true : true;

            // 2. Lọc theo tên sinh viên (không phân biệt hoa thường)
            const matchesSearch = (searchQuery.trim() === '') ? true :
                conv.studentName.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesFilter && matchesSearch;
        });
    }, [conversations, filter, searchQuery]);

    return (
        <div className="h-full flex flex-col p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div className="flex items-center gap-x-3">
                    <MessageCircleMore size={36} className="text-[var(--brand-blue)]" />
                    <h1 className="text-[22px] font-bold text-[var(--brand-blue)] uppercase tracking-wider">Tin nhắn sinh viên</h1>
                </div>
            </div>

            <div className="bg-white shadow-lg rounded-xl flex-grow flex overflow-hidden">
                <div className="w-full md:w-[380px] h-full border-r border-gray-200 flex flex-col flex-shrink-0">
                    <div className="p-4 border-b border-gray-200">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input
                                type="text"
                                placeholder="Tìm kiếm cuộc trò chuyện..."
                                className="w-full text-[13px] pl-10 pr-4 py-3 bg-gray-100 rounded-full focus:outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)} // <-- Thêm onChange
                            />
                        </div>
                        <div className="flex items-center space-x-2 mt-4">
                            <FilterButton label="Tất cả" value="ALL"/>
                            <FilterButton label="Chưa đọc" value="UNREAD" count={unreadConversationsCount}/>
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 mt-10">
                                {filter === 'UNREAD' ? 'Không có tin nhắn chưa đọc.' : 'Không có cuộc trò chuyện nào.'}
                            </div>
                        ) : (
                            filteredConversations.map(conv => (
                                <ConversationItem
                                    key={conv.firestoreConversationId}
                                    conv={conv}
                                    onSelect={handleSelectConversation}
                                    onDelete={handleDeleteConversation}
                                    selectedId={selectedConversation?.firestoreConversationId}
                                />
                            ))
                        )}
                    </div>
                </div>
                <div className="hidden md:flex flex-1 h-full bg-gray-50">
                    {selectedConversation ? (
                        <ChatWindow
                            key={selectedConversation.firestoreConversationId}
                            conversation={selectedConversation}
                            onSendMessage={handleAdminSendMessage}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full w-full text-gray-400">
                            <Inbox size={64} />
                            <p className="mt-4 text-lg font-medium">Chọn một cuộc trò chuyện để xem</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChatAdminPage;