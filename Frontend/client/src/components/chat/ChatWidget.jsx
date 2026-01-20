import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MessageSquare, X, Loader2 } from 'lucide-react';
import { startStudentChat } from '../../services/chatService';
import toast from 'react-hot-toast';
import StudentChatWindow from './StudentChatWindow';

const PreChatForm = ({ onStart, onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) {
            toast.error("Vui lòng nhập đầy đủ tên và email.");
            return;
        }
        setIsSubmitting(true);
        try {
            await onStart({ name, email });
        } catch (error) {
            toast.error("Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6">
            <div className="relative p-6 bg-blue-600 text-white rounded-t-xl text-center">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-2 text-blue-200 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Đóng"
                >
                    <X size={20}/>
                </button>
                <MessageSquare size={32} className="mx-auto"/>
                <h2 className="text-lg font-bold mt-2">Chào mừng bạn!</h2>
                <p className="text-sm text-blue-100 mt-1">Để lại thông tin để chúng tôi hỗ trợ bạn tốt nhất nhé.</p>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Họ và tên</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required
                           className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                           className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <button type="submit" disabled={isSubmitting}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
                    {isSubmitting ? "Đang kết nối..." : "Bắt đầu trò chuyện"}
                </button>
            </form>
        </div>
    );
};


const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [session, setSession] = useState(null);
    const [step, setStep] = useState('loading');

    useEffect(() => {
        try {
            const savedSession = localStorage.getItem('studentChatSession');
            if (savedSession) {
                setSession(JSON.parse(savedSession));
                setStep('chat');
            } else {
                setStep('form');
            }
        } catch (error) {
            console.error("Lỗi khi đọc session:", error);
            localStorage.removeItem('studentChatSession');
            setStep('form');
        }
    }, []);

    const handleStartChat = async ({ name, email }) => {
        const chatId = uuidv4();
        const studentInfo = {
            firestoreConversationId: chatId,
            studentName: name,
            studentEmail: email
        };

        const res = await startStudentChat(studentInfo);
        const newSession = { chatId, name, email, firebaseToken: res.data.token };

        localStorage.setItem('studentChatSession', JSON.stringify(newSession));
        setSession(newSession);
        setStep('chat');
    };

    const renderStep = () => {
        const handleClose = () => setIsOpen(false);

        switch (step) {
            case 'loading':
                return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;
            case 'form':
                return <PreChatForm onStart={handleStartChat} onClose={handleClose} />;
            case 'chat':
                return session ? <StudentChatWindow session={session} isOpen={isOpen} onClose={handleClose} /> : <PreChatForm onStart={handleStartChat} onClose={handleClose} />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-50">
            <div
                className={`bg-white rounded-xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${
                    isOpen ? 'w-[330px] h-[450px] opacity-100 translate-y-0' : 'w-0 h-0 opacity-0 translate-y-4 pointer-events-none'
                }`}
                style={{transformOrigin: 'bottom right'}}
            >
                {renderStep()}
            </div>

            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="mt-4 float-right w-16 h-16 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 animate-bounce"
                >
                    <img
                        src="https://cdn-icons-png.flaticon.com/256/2504/2504926.png"
                        alt="Mở Hộp thư"
                        className="w-9 h-9"
                    />
                </button>
            )}
        </div>
    );
};

export default ChatWidget;