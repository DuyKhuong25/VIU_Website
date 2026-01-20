import React, { useState, useEffect } from 'react';
import { getAllProgramLevels, createProgramLevel, updateProgramLevel, deleteProgramLevel } from '../../services/academicService';
import toast from 'react-hot-toast';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import ProgramLevelForm from './ProgramLevelForm';

function ProgramLevelManager({ onProgramsUpdated }) {
    const [programLevels, setProgramLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        setLoading(true);
        getAllProgramLevels()
            .then(res => setProgramLevels(res.data))
            .catch(() => toast.error("Không thể tải danh sách chương trình."))
            .finally(() => setLoading(false));
    };

    const handleOpenModal = (level = null) => {
        setSelectedLevel(level);
        setIsModalOpen(true);
    };

    const handleSave = async (data) => {
        // eslint-disable-next-line no-useless-catch
        try {
            if (selectedLevel) {
                await updateProgramLevel(selectedLevel.id, data);
                toast.success("Cập nhật thành công!");
            } else {
                await createProgramLevel(data);
                toast.success("Tạo mới thành công!");
            }
            fetchData();
            setIsModalOpen(false);
            onProgramsUpdated();
        } catch (error) {
            throw error;
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa? Mọi ngành học thuộc chương trình này cũng sẽ bị ảnh hưởng.")) {
            try {
                await deleteProgramLevel(id);
                toast.success("Xóa thành công!");
                fetchData();
            } catch {
                toast.error("Xóa thất bại. Có thể do vẫn còn ngành học phụ thuộc.");
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-end mb-4">
                <button onClick={() => handleOpenModal()} className="flex items-center gap-x-2 px-4 py-2 bg-[var(--brand-blue)] text-white text-[13px] uppercase font-semibold rounded-lg hover:bg-opacity-90">
                    <PlusCircle size={20} /><span>Thêm Chương trình</span>
                </button>
            </div>
            <table className="min-w-full leading-normal">
                <thead>
                <tr className="bg-gray-100 text-left text-gray-600 uppercase text-[13px]">
                    <th className="px-5 py-3">Tên chương trình (VI)</th>
                    <th className="px-5 py-3">Mã chương trình</th>
                    <th className="px-5 py-3 w-40 text-center">Hành động</th>
                </tr>
                </thead>
                <tbody>
                {loading ? (
                    <tr><td colSpan="3" className="text-center p-8"><Loader2 className="animate-spin text-blue-500 mx-auto" /></td></tr>
                ) : programLevels.length === 0 ? (
                    <tr><td colSpan="3" className="text-center p-8 text-gray-500">Chưa có chương trình đào tạo nào.</td></tr>
                ) : programLevels.map(level => (
                    <tr key={level.id} className="border-b border-blue-300 hover:bg-gray-50">
                        <td className="px-5 py-3 text-sm font-semibold">{level.name}</td>
                        <td className="px-5 py-3 text-sm font-mono">{level.code}</td>
                        <td className="px-5 py-3 text-sm text-center">
                            <div className="flex items-center justify-center space-x-2">
                                <button onClick={() => handleOpenModal(level)} className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full"><Edit size={18}/></button>
                                <button onClick={() => handleDelete(level.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={18}/></button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <Modal title={selectedLevel ? "Chỉnh sửa Chương trình" : "Tạo Chương trình mới"} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ProgramLevelForm
                    levelData={selectedLevel}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                    isOpen={isModalOpen}
                />
            </Modal>
        </div>
    );
}

export default ProgramLevelManager;