import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import logo from '../assets/logo_viethung.png';
import { useClickOutside } from '../hooks/useClickOutside';
import { useNotifications } from '../hooks/useNotifications.jsx';
import NotificationPanel from './NotificationPanel.jsx';
import useTimeAgo from '../hooks/useTimeAgo';

import { useRecentUnreadConversations } from '../hooks/useRecentUnreadConversations';
import { getFirebaseToken } from '../services/chatService';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

import {
    LayoutDashboard, Users, FolderKanban, Tag, FileText, Shield, Images, Info,
    GraduationCap, Loader2, Menu, Search, ChevronDown, UserCircle2, KeyRound, LogOut,
    Bell, MessageCircleMore, X, CheckCheck, Icon, Link2, Handshake
} from 'lucide-react';
import Avatar from "../components/chat/Avatar.jsx";

const ChatItem = ({ conv, closeDropdown }) => {
    const lastMessageDate = conv.lastMessageTimestamp ? conv.lastMessageTimestamp.toDate() : null;
    const timeAgo = useTimeAgo(lastMessageDate);

    return (
        <Link
            to="/chat"
            state={{ selectedId: conv.firestoreConversationId }} // Gửi ID để trang chat tự động chọn
            onClick={closeDropdown}
            className="block px-4 py-3 hover:bg-gray-100"
        >
            <div className="flex items-start space-x-3">
                <Avatar name={conv.studentName} />
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-bold text-gray-900 truncate">{conv.studentName}</p>
                        <p className="text-xs text-gray-400 flex-shrink-0">{timeAgo}</p>
                    </div>
                    <p className="text-sm text-blue-600 truncate">{conv.lastMessageText}</p>
                </div>
            </div>
        </Link>
    );
};

function AdminLayout() {
    const { user, logout: contextLogout } = useAuth();

    const userRoles = new Set(user?.roles || []);
    const isAdmin = userRoles.has('ROLE_ADMIN');
    const isManager = userRoles.has('ROLE_MANAGER');

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [openSubMenu, setOpenSubMenu] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const { recentNotifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const { recentConversations, unreadCount: unreadChatCount } = useRecentUnreadConversations(5);

    const userDropdownRef = useRef(null);
    const notificationsRef = useRef(null);
    const messagesRef = useRef(null);

    const informationSubMenuPaths = ['/majors', '/departments'];
    const isInformationMenuActive = informationSubMenuPaths.some(path => location.pathname.startsWith(path));
    const isArticleFormPage = location.pathname.startsWith('/articles/new') || location.pathname.startsWith('/articles/edit');
    const searchVisiblePaths = ['/users', '/categories', '/tags', '/articles'];
    const showSearchBar = searchVisiblePaths.includes(location.pathname);

    useEffect(() => { if (isInformationMenuActive) { setOpenSubMenu('information'); } }, [location.pathname, isInformationMenuActive]);
    useClickOutside(userDropdownRef, () => { if (openDropdown === 'user') setOpenDropdown(null); });
    useClickOutside(notificationsRef, () => { if (openDropdown === 'notifications') setOpenDropdown(null); });
    useClickOutside(messagesRef, () => { if (openDropdown === 'messages') setOpenDropdown(null); });

    const handleDropdownToggle = (dropdownName) => { setOpenDropdown(openDropdown === dropdownName ? null : dropdownName); };
    const handleNotificationClick = (id, link) => {
        markAsRead(id, link);
        navigate(link);
        setOpenDropdown(null);
    };

    useEffect(() => {
        const authenticateAdminWithFirebase = async () => {
            if (user) {
                try {
                    const res = await getFirebaseToken();
                    const firebaseToken = res.data.token;
                    console.log("ĐÃ LẤY TOKEN FIREBASE:", firebaseToken);
                    const auth = getAuth();
                    await signInWithCustomToken(auth, firebaseToken);
                } catch (error) {
                    console.error("Firebase authentication for admin failed:", error);
                    toast.error("Không thể kết nối tới dịch vụ chat.");
                }
            }
        };
        authenticateAdminWithFirebase();
    }, [user]);

    const handleLogout = () => {
        contextLogout();
        toast.success("Đăng xuất thành công.");
        navigate('/login', { replace: true });
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        if (!searchQuery.trim()) {
            navigate(location.pathname);
            return;
        }
        navigate(`${location.pathname}?search=${searchQuery}`);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        navigate(location.pathname);
    };

    const handleSubMenuToggle = (menuName) => {
        setOpenSubMenu(openSubMenu === menuName ? '' : menuName);
    };

    const NavItem = ({ to, icon: Icon, label }) => {
        const navLinkClass = ({ isActive }) =>
            `flex items-center rounded-lg transition-colors duration-200 text-sm font-medium relative group ${
                isSidebarOpen ? 'space-x-4 px-4 py-2.5' : 'justify-center w-12 h-12'
            } ${
                isActive ? 'bg-white/10 text-white' : 'text-blue-100 hover:bg-white/10'
            }`;
        return (
            <NavLink to={to} className={navLinkClass} end={to === '/'}>
                <Icon size={22} strokeWidth={2} />
                <span className={`whitespace-nowrap ${!isSidebarOpen && 'hidden'}`}>{label}</span>
                {!isSidebarOpen && (
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-[var(--brand-blue)] text-white text-xs font-semibold rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">{label}</div>
                )}
            </NavLink>
        );
    };

    const SubNavItem = ({to, icon: Icon, label }) => {
        const subNavLinkClass = ({ isActive }) =>
            `flex items-center space-x-3 w-full text-left pl-4 pr-2 py-2 rounded-md transition-colors duration-200 text-xs font-medium ${
                isActive ? 'text-white bg-white/5' : 'text-blue-200 hover:bg-white/5 hover:text-white'
            }`;
        return (
            <NavLink to={to} className={subNavLinkClass}>
                <Icon size={16} strokeWidth={2.5} />
                <span className="whitespace-nowrap">{label}</span>
            </NavLink>
        );
    };

    return (
        <div className="flex h-screen bg-slate-100 font-sans">
            <aside className={`bg-[var(--brand-blue)] text-white flex flex-col flex-shrink-0 shadow-xl transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="h-20 flex items-center justify-center bg-white border-b border-gray-200 flex-shrink-0">
                    <img src={logo} alt="VHU Logo" className="h-16 w-auto object-contain" />
                </div>
                <nav className={`flex-1 px-4 py-6 space-y-1.5 ${!isSidebarOpen && 'flex flex-col items-center'}`}>
                    <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem to="/chat" icon={MessageCircleMore} label="Tin nhắn" />
                    {(isAdmin || isManager) && (
                        <NavItem to="/users" icon={Users} label="Quản lý người dùng" />
                    )}

                    {isAdmin && (
                        <NavItem to="/roles" icon={Shield} label="Quản lý phân quyền" />
                    )}
                    <NavItem to="/slides" icon={Images} label="Quản lý Slide/Banner" />
                    <div className="relative group w-full">
                        <button onClick={() => handleSubMenuToggle('information')} className={`flex items-center w-full justify-between rounded-lg transition-colors duration-200 text-sm font-medium ${isSidebarOpen ? 'space-x-4 px-4 py-2.5' : 'justify-center w-12 h-12'} ${isInformationMenuActive ? 'bg-white/10 text-white' : 'text-blue-100 hover:bg-white/10'}`}>
                            <div className={`flex items-center ${isSidebarOpen ? 'space-x-4' : ''}`}>
                                <Info size={22} />
                                <span className={!isSidebarOpen ? 'hidden' : ''}>Quản lý thông tin</span>
                            </div>
                            {isSidebarOpen && <ChevronDown size={16} className={`transition-transform duration-200 ${openSubMenu === 'information' ? 'rotate-180' : ''}`} />}
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSubMenu === 'information' && isSidebarOpen ? 'max-h-40 mt-1' : 'max-h-0'}`}>
                            <div className="pl-4 pt-1 pb-1 space-y-1 bg-black/20 rounded-lg">
                                <SubNavItem to="/quick-access" icon={Link2} label="Truy cập nhanh" />
                                <SubNavItem to="/academics" icon={GraduationCap} label="Quản lý Đào tạo" />
                                <SubNavItem to="/partners" icon={Handshake} label="Thông tin đối tác" />
                            </div>
                        </div>
                        {!isSidebarOpen && (
                            <div className="absolute left-full top-0 pl-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                                <div className="p-2 bg-[var(--brand-blue)] rounded-md shadow-lg">
                                    <p className="px-2 py-2 text-xs font-bold text-white uppercase border-b border-white/10">Quản lý thông tin</p>
                                    <div className="mt-1 space-y-1">
                                        <SubNavItem to="/quick-access" icon={Link2} label="Truy cập nhanh" />
                                        <SubNavItem to="/academics" icon={GraduationCap} label="Quản lý Đào tạo" />
                                        <SubNavItem to="/partners" icon={Handshake} label="Thông tin đối tác" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <NavItem to="/categories" icon={FolderKanban} label="Quản lý danh mục" />
                    <NavItem to="/tags" icon={Tag} label="Quản lý thẻ" />
                    <NavItem to="/articles" icon={FileText} label="Quản lý bài viết" />
                </nav>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-6 shadow-sm flex-shrink-0">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-gray-100 focus:outline-none">
                            <Menu size={24} className="text-gray-600"/>
                        </button>
                        {showSearchBar && (
                            <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-gray-400"/>
                                </div>
                                <input type="text" placeholder="Tìm kiếm..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full lg:w-96 pl-10 pr-10 py-2 text-[14px] bg-transparent border-b border-gray-300 focus:outline-none focus:border-[var(--brand-blue)] transition-colors duration-300" />
                                {searchQuery && (
                                    <button type="button" onClick={handleClearSearch} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <X size={18} className="text-gray-500 hover:text-red-600"/>
                                    </button>
                                )}
                            </form>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="relative" ref={messagesRef}>
                            <button onClick={() => handleDropdownToggle('messages')}
                                    className="relative p-2 rounded-full hover:bg-gray-100">
                                <MessageCircleMore size={22} className="text-gray-600"/>
                                {unreadChatCount > 0 && (
                                    <span
                                        className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center ring-2 ring-white">
                                        {unreadChatCount}
                                    </span>
                                )}
                            </button>
                            {openDropdown === 'messages' && (
                                <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl inset-shadow-sm z-20">
                                    <div className="p-3 font-semibold border-b border-blue-300 text-[14px] uppercase">
                                        Tin nhắn chưa đọc
                                    </div>
                                    <div className="py-1 max-h-80 overflow-y-auto">
                                        {recentConversations.length > 0 ? (
                                            recentConversations.map(conv => (
                                                <ChatItem key={conv.firestoreConversationId} conv={conv}
                                                          closeDropdown={() => setOpenDropdown(null)}/>
                                            ))
                                        ) : (
                                            <div>
                                                <img
                                                    src="https://cdni.iconscout.com/illustration/premium/thumb/empty-notification-illustration-svg-download-png-8593294.png"
                                                    className="w-40 h-40 mx-auto object-contain"
                                                />
                                                <p className="text-center text-[12px] text-gray-500 py-4">Không có tin nhắn chưa đọc.</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2 text-center">
                                        <Link to="/chat" onClick={() => setOpenDropdown(null)}
                                              className="text-sm font-semibold text-[var(--brand-blue)] cursor-pointer">
                                            Đi đến Hộp thư
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="relative" ref={notificationsRef}>
                            <button onClick={() => handleDropdownToggle('notifications')}
                                    className="relative p-2 rounded-full hover:bg-gray-100">
                                <Bell size={22} className="text-gray-600"/>
                                {unreadCount > 0 && (
                                    <span
                                        className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center ring-2 ring-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            {openDropdown === 'notifications' && (
                                <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl inset-shadow-sm z-20">
                                    <div
                                        className="p-3 font-semibold border-b border-blue-300 text-[14px] uppercase">Thông báo
                                    </div>

                                    <div className="p-2 flex justify-end">
                                        <button onClick={markAllAsRead} disabled={unreadCount === 0}
                                                className="text-xs font-semibold text-gray-500 hover:text-[var(--brand-blue)] flex items-center gap-x-1 cursor-pointer">
                                            <CheckCheck size={14}/><span>Đánh dấu đã đọc tất cả</span>
                                        </button>
                                    </div>

                                    <div className="py-1 max-h-80 overflow-y-auto">
                                        {recentNotifications.length === 0 ? (
                                            <div>
                                                <img
                                                    src="https://cdni.iconscout.com/illustration/premium/thumb/empty-notification-illustration-svg-download-png-8593294.png"
                                                    className="w-40 h-40 mx-auto object-contain"
                                                />
                                                <p className="text-center text-[12px] text-gray-500 py-4">Không có thông báo mới.</p>
                                            </div>
                                        ) : (
                                            recentNotifications.map(noti => (
                                                <div key={noti.id} onClick={() => {
                                                    handleNotificationClick(noti.id, noti.link)

                                                }}
                                                     className={`px-3 py-3 cursor-pointer ${!noti.read ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-100`}>
                                                    <div className="flex items-center space-x-2">
                                                        <div
                                                            className={`w-1.5 h-1.5 mt-1.5 rounded-full flex-shrink-0 ${!noti.read ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm ${!noti.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{noti.message}</p>
                                                            <p className="text-xs text-gray-400 mt-1">{new Date(noti.createdAt).toLocaleString('vi-VN')}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="p-2 text-center">
                                        <button onClick={() => {
                                            setIsNotificationPanelOpen(true);
                                            setOpenDropdown(null);
                                        }} className="text-sm font-semibold text-[var(--brand-blue)] cursor-pointer">
                                            Xem tất cả thông báo
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-px h-8 bg-gray-200 mx-2"></div>
                        <div className="relative" ref={userDropdownRef}>
                            <button onClick={() => handleDropdownToggle('user')}
                                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                                <div
                                    className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span
                                        className="text-base font-bold text-[var(--brand-blue)] uppercase">{user?.fullName ? user.fullName.charAt(0) : 'A'}</span>
                                </div>
                                <div className="text-left hidden sm:block">
                                    <div
                                        className="text-[14px] font-semibold text-gray-800">{user?.fullName || 'Admin'}</div>
                                </div>
                                <ChevronDown size={15}
                                             className={`text-gray-500 transition-transform duration-200 ${openDropdown === 'user' ? 'rotate-180' : ''}`}/>
                            </button>
                            {openDropdown === 'user' && (
                                <div className="absolute right-0 mt-2 w-64 bg-white shadow-xl inset-shadow-sm z-20">
                                    <div className="p-4 border-b border-blue-300">
                                        <p className="text-sm font-semibold">{user?.fullName}</p>
                                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                    </div>
                                    <nav className="p-2">
                                        <Link to="/profile"
                                              className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                            <UserCircle2 size={18}
                                                         className="text-gray-500"/><span>Thông tin tài khoản</span>
                                        </Link>
                                        <Link to="/change-password"
                                              className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                            <KeyRound size={18} className="text-gray-500"/><span>Đổi mật khẩu</span>
                                        </Link>
                                        <div className="border-t border-blue-300 my-2"></div>
                                        <button onClick={handleLogout}
                                                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md font-semibold">
                                            <LogOut size={18} className="text-red-500"/><span>Đăng xuất</span>
                                        </button>
                                    </nav>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <main className={`flex-1 overflow-y-auto ${isArticleFormPage ? '' : 'p-6 lg:p-8'}`}>
                    <Outlet/>
                </main>
                <NotificationPanel
                    isOpen={isNotificationPanelOpen}
                    onClose={() => setIsNotificationPanelOpen(false)}
                />
            </div>
        </div>
    );
}

export default AdminLayout;