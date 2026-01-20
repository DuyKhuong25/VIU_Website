import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, User } from 'lucide-react';

const Avatar = ({ isAdmin }) => (
    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
        <img
            src="https://cdn-icons-png.flaticon.com/512/9165/9165197.png"
            alt="Hỗ trợ"
            className="w-full h-full object-cover"
        />
    </div>
);

const MessageBubble = ({message, isMyMessage, isRead, isEndOfBlock, isExpanded, onClick}) => {
    return (
        <div
            className={`flex items-end w-full mt-1 space-x-3 max-w-[70%] cursor-pointer ${isMyMessage ? 'ml-auto justify-end' : 'justify-start'}`}
            onClick={onClick}
        >
            {!isMyMessage && <Avatar />}
            <div className="flex flex-col">
                <div className={`p-3 rounded-lg shadow-sm text-[12px] ${isMyMessage ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-900 rounded-bl-none'}`}>
                    <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message.text}</p>
                </div>

                {(isEndOfBlock || isExpanded) && (
                    <div className={`flex items-center mt-1 px-1 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[9px] text-gray-400 leading-none">
                            {message.timestamp ? format(message.timestamp.toDate(), 'HH:mm') : ''}
                        </span>
                        {isMyMessage && (
                            isRead
                                ? <CheckCheck size={12} className="ml-1.5 text-blue-400" />
                                : <Check size={12} className="ml-1.5 text-gray-400" />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;