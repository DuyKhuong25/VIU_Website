import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, createUser, updateUser, deleteUser } from '../services/userService';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import UserForm from '../components/users/UserForm';
import { PlusCircle, Edit, Trash2, Users } from 'lucide-react';
import Pagination from '../components/common/Pagination';
import { useSearchParams } from 'react-router-dom';
import ConfirmationModal from '../components/common/ConfirmationModal';

function UserManagementPage() {
    const { user: currentUserLoggedIn } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchParams] = useSearchParams();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const userRoles = new Set(currentUserLoggedIn?.roles || []);
    const isAdmin = userRoles.has('ROLE_ADMIN');
    const isManager = userRoles.has('ROLE_MANAGER');

    const canCreate = isAdmin || isManager;
    const canEdit = isAdmin || isManager;
    const canDelete = isAdmin || isManager;

    const searchTerm = searchParams.get('search') || '';

    const fetchUsers = useCallback(async (page, size, search) => {
        try {
            setLoading(true);
            const response = await getAllUsers(page, size, search);
            // console.log("Fetched users:", response);
            setUsers(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
            setCurrentPage(response.data.number);
        } catch (error) {
            toast.error("Không thể tải danh sách người dùng.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(currentPage, pageSize, searchTerm);
    }, [fetchUsers, currentPage, pageSize, searchTerm]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handlePageSizeChange = (event) => {
        const newSize = Number(event.target.value);
        setPageSize(newSize);
        setCurrentPage(0);
    };

    const handleOpenModal = (user = null) => {
        setCurrentUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
    };

    const handleSaveUser = async (userData) => {
        try {
            if (currentUser) {
                await updateUser(currentUser.id, {
                    fullName: userData.fullName,
                    email: userData.email,
                    roles: userData.roles
                });
                toast.success(`Đã cập nhật người dùng: ${currentUser.username}`);
            } else {
                await createUser(userData);
                toast.success(`Đã tạo người dùng mới: ${userData.username}`);
            }
            fetchUsers(currentPage, pageSize);
            handleCloseModal();
        } catch (error) {
            const errorMsg = error.data?.message || error.data?.error || "Đã có lỗi xảy ra.";
            toast.error(errorMsg);
        }
    };

    const handleDeleteUser = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        try {
            await deleteUser(userToDelete.id);
            toast.success(`Đã xóa người dùng: ${userToDelete.fullName} thành công!`);
            fetchUsers(currentPage, pageSize, searchTerm);
        } catch (error) {
            toast.error("Không thể xóa người dùng.");
        } finally {
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-x-3">
                    <Users size={36} className="text-[var(--brand-blue)]"/>
                    <h1 className="text-[22px] font-bold text-brand-blue uppercase tracking-wider">
                        Quản lý Người dùng
                    </h1>
                </div>
                {canCreate && (
                    <button onClick={() => handleOpenModal()}
                            className="flex items-center gap-x-2 px-4 py-2 bg-[var(--brand-blue)] text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors">
                        <PlusCircle size={20}/>
                        <span>Thêm người dùng</span>
                    </button>
                )}
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                {loading && <p className="p-4">Đang tải...</p>}
                {!loading && (
                    <table className="min-w-full leading-normal">
                        <thead>
                        <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                            <th className="px-5 py-3">Họ tên</th>
                            <th className="px-5 py-3">Email</th>
                            <th className="px-5 py-3">Username</th>
                            <th className="px-5 py-3">Quyền</th>
                            {(canEdit || canDelete) && <th className="px-5 py-3 text-center">Hành động</th>}
                        </tr>
                        </thead>
                        <tbody className="text-gray-700">
                        {users.map(user => (
                            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-5 py-4 text-sm">{user.fullName}</td>
                                <td className="px-5 py-4 text-sm">{user.email}</td>
                                <td className="px-5 py-4 text-sm">{user.username}</td>
                                <td className="px-5 py-4 text-sm">
                                    <div className="flex flex-wrap gap-1">
                                        {user.roles.map(role => (
                                            <span key={role}
                                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-semibold">{role}</span>
                                        ))}
                                    </div>
                                </td>
                                {(canEdit || canDelete) && (
                                    <td className="px-5 py-4 text-sm text-center whitespace-nowrap">
                                        {canEdit && (
                                            <button onClick={() => handleOpenModal(user)}
                                                    className="text-yellow-600 hover:text-yellow-900 mr-4 transition-colors">
                                                <Edit size={20}/>
                                            </button>
                                        )}
                                        {canDelete && !user.roles.includes('ROLE_ADMIN') && (
                                            <button onClick={() => handleDeleteUser(user)}
                                                    className="text-red-600 hover:text-red-900 transition-colors">
                                                <Trash2 size={20}/>
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="flex justify-between items-center mt-4 px-1 py-2">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <span>Hiển thị</span>
                    <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-blue)]"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                    </select>
                    <span>trên tổng số {totalElements} người dùng</span>
                </div>

                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal}
                   title={currentUser ? `Chỉnh sửa: ${currentUser.username}` : "Tạo người dùng mới"}>
                <UserForm user={currentUser} onSave={handleSaveUser} onCancel={handleCloseModal} loggedInUserRoles={userRoles}/>
            </Modal>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Xác nhận Xóa Người dùng"
                confirmText="Vẫn xóa"
                variant="danger"
            >
                <p>Bạn có chắc chắn muốn xóa người dùng <strong className="text-gray-900">{userToDelete?.fullName}</strong>?</p>
                <p className="mt-2">Hành động này không thể hoàn tác.</p>
            </ConfirmationModal>
        </div>
    );
}

export default UserManagementPage;