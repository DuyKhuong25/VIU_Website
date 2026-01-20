import React, {useRef, useState} from 'react';
import Avatar from './Avatar';
import useTimeAgo from '../../hooks/useTimeAgo';
import {MoreVertical, Trash2} from 'lucide-react';
import {useClickOutside} from "../../hooks/useClickOutside.js";

const ConversationItem = ({ conv, onSelect, selectedId, onDelete }) => {
    const isSelected = selectedId === conv.firestoreConversationId;
    const lastMessage = conv.lastMessageText || '...';
    const lastMessageDateMs = conv.lastMessageTimestamp ? conv.lastMessageTimestamp.toDate().getTime() : null;
    const timeAgo = useTimeAgo(lastMessageDateMs);
    const isUnread = conv.hasUnreadByAdmin === true;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useClickOutside(menuRef, () => {
        if (isMenuOpen) {
            setIsMenuOpen(false);
        }
    });

    const handleMenuToggle = (e) => {
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        onDelete(conv);
    };

    return (
        <div
            onClick={() => onSelect(conv)}
            className={`flex items-start p-3 cursor-pointer border-l-4 transition-all duration-200 group relative ${
                isMenuOpen ? 'z-10' : 'z-0'}
            ${
                isSelected
                    ? 'bg-blue-100 border-blue-600'
                    : isUnread
                        ? 'bg-blue-50 border-transparent hover:bg-gray-100'
                        : 'border-transparent hover:bg-gray-100'
            }`}
        >
            <Avatar name={conv.studentName}/>
            <div className="flex-grow min-w-0 ml-3">
                <div className="flex justify-between items-center">
                    <p className={`text-sm truncate ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {conv.studentName}
                    </p>
                    {timeAgo && (
                        <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                            {timeAgo}
                        </span>
                    )}
                </div>
                <div className="flex justify-between items-start mt-1">
                    <p className={`text-sm truncate pr-2 ${isUnread ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                        {conv.lastMessageSenderType === 'ADMIN' && <span className="font-normal">Bạn: </span>}
                        {lastMessage}
                    </p>
                    {isUnread && conv.unreadMessageCountByAdmin > 0 && (
                        <div
                            className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                            {conv.unreadMessageCountByAdmin}
                        </div>
                    )}
                </div>
            </div>
            <div
                className="absolute bottom-2 right-2"
                ref={menuRef}
            >
                <button
                    onClick={handleMenuToggle}
                    className={`p-2 rounded-full text-gray-400 hover:bg-gray-200 
                                transition-opacity ${isMenuOpen ? 'bg-gray-200' : ''}`}
                    title="Tùy chọn"
                >
                    <MoreVertical size={16}/>
                </button>

                {isMenuOpen && (
                    <div
                        className="absolute right-0 -bottom-12 mb-1 w-36 bg-white shadow-lg rounded-md border border-gray-200"
                    >
                        <nav className="p-1">
                            <button
                                onClick={handleDeleteClick}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md font-medium"
                            >
                                <Trash2 size={14}/>
                                <span>Xóa tin nhắn</span>
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationItem;