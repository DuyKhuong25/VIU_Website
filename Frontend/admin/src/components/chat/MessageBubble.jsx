import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import Avatar from './Avatar';

const MessageBubble = ({ message, senderName, isRead }) => {
    const isAdminMessage = message.senderType === 'ADMIN';

    return (
        <div className={`flex items-end w-full mt-2 space-x-3 max-w-lg ${isAdminMessage ? 'ml-auto justify-end' : ''}`}>
            {!isAdminMessage && <Avatar name={senderName} />}
            <div className="flex flex-col">
                <div className={`p-3 rounded-lg shadow-sm ${isAdminMessage ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-900 rounded-bl-none'}`}>
                    <p className="text-sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message.text}</p>
                </div>
                <div className={`flex items-center mt-1 px-1 ${isAdminMessage ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-gray-400 leading-none">
                        {message.timestamp ? format(message.timestamp.toDate(), 'HH:mm') : ''}
                    </span>
                    {isAdminMessage && (
                        isRead
                            ? <CheckCheck size={16} className="ml-1.5 text-blue-400" />
                            : <Check size={16} className="ml-1.5 text-gray-400" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;