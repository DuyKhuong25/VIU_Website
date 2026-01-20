// Công dụng: File trung tâm định nghĩa tất cả các route của ứng dụng.
import { createBrowserRouter } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import GuestRoute from './components/auth/GuestRoute';
import ProfilePage from './pages/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import RoleManagementPage from './pages/RoleManagementPage';
import CategoryManagementPage from "./pages/CategoryManagementPage.jsx";
import TagManagementPage from "./pages/TagManagementPage.jsx";
import SlideManagementPage from './pages/SlideManagementPage';
import ArticleListPage from './pages/ArticleListPage';
import ArticleFormPage from './pages/ArticleFormPage';
import { NotificationProvider } from './hooks/useNotifications.jsx';
import ChatAdminPage from "./pages/ChatAdminPage.jsx";
import QuickAccessListPage from "./pages/QuickAccessListPage.jsx";
import QuickAccessFormPage from "./pages/QuickAccessFormPage.jsx";
import AcademicManagementPage from "./pages/AcademicManagementPage.jsx";
import PartnerListPage from "./pages/PartnerListPage.jsx";

// eslint-disable-next-line react-refresh/only-export-components
const AppLayout = () => {
    return (
        <NotificationProvider>
            <AdminLayout />
        </NotificationProvider>
    );
};

const router = createBrowserRouter([
    {
        element: <GuestRoute />,
        children: [ { path: '/login', element: <LoginPage /> } ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: '/',
                element: <AppLayout />,
                children: [
                    { index: true, element: <DashboardPage /> },
                    { path: 'profile', element: <ProfilePage /> },
                    { path: 'change-password', element: <ChangePasswordPage /> },
                    { path: 'users', element: <UserManagementPage /> },
                    { path: 'roles', element: <RoleManagementPage /> },
                    { path: 'categories', element: <CategoryManagementPage /> },
                    { path: 'tags', element: <TagManagementPage />},
                    { path: 'slides', element: <SlideManagementPage /> },
                    { path: 'articles', element: <ArticleListPage /> },
                    { path: 'articles/new', element: <ArticleFormPage /> },
                    { path: 'articles/edit/:id', element: <ArticleFormPage /> },
                    { path: 'chat', element: <ChatAdminPage />},
                    { path: '/quick-access', element: <QuickAccessListPage />},
                    { path: '/quick-access/new', element: <QuickAccessFormPage />},
                    { path: '/quick-access/edit/:id', element: <QuickAccessFormPage />},
                    { path: '/academics', element: <AcademicManagementPage /> },
                    { path:"/partners", element: <PartnerListPage /> }
                ],
            },
        ],
    },
], { basename: "/admin" });

export default router;