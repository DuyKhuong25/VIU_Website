import React, {useState, useEffect, useCallback} from 'react';
import { getAllMajors, deleteMajor, createMajor, updateMajor, getMajorById, getAllProgramLevels } from '../../services/academicService';
import toast from 'react-hot-toast';
import { PlusCircle, Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import Modal from '../common/Modal';
import MajorForm from './MajorForm';

function MajorManager({ onSwitchToPrograms }) {
    const [majors, setMajors] = useState([]);
    const [programLevels, setProgramLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const [selectedMajor, setSelectedMajor] = useState(null);
    const [formKey, setFormKey] = useState(Date.now());

    const fetchInitialData = useCallback(() => {
        setLoading(true);
        Promise.all([getAllMajors(), getAllProgramLevels()])
            .then(([majorsRes, programsRes]) => {
                setMajors(majorsRes.data.content);
                setProgramLevels(programsRes.data);
            })
            .catch(() => toast.error("Không thể tải dữ liệu."))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleOpenCreate = () => {
        if (programLevels.length === 0) {
            setIsWarningModalOpen(true);
        } else {
            setSelectedMajor(null);
            setFormKey(Date.now());
            setIsFormModalOpen(true);
        }
    };

    const handleOpenEdit = async (major) => {
        try {
            const res = await getMajorById(major.id);
            setSelectedMajor(res.data);
            setFormKey(Date.now());
            setIsFormModalOpen(true);
        } catch {
            toast.error("Không thể tải chi tiết ngành học.");
        }
    };

    const handleSave = async (data) => {
        try {
            if (selectedMajor) {
                await updateMajor(selectedMajor.id, data);
                toast.success("Cập nhật thành công!");
            } else {
                await createMajor(data);
                toast.success("Tạo mới thành công!");
            }
            setIsFormModalOpen(false);
            fetchInitialData();
        } catch (error) {
            toast.error(error.message || "Lưu thất bại.");
            throw error;
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa ngành học này?")) {
            try {
                await deleteMajor(id);
                toast.success("Xóa thành công!");
                fetchInitialData();
            } catch {
                toast.error("Xóa thất bại.");
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-end mb-4">
                <button onClick={handleOpenCreate} className="flex items-center gap-x-2 px-4 py-2 bg-[var(--brand-blue)] text-white text-[13px] uppercase font-semibold rounded-lg hover:bg-opacity-90">
                    <PlusCircle size={20} /><span>Thêm Ngành học</span>
                </button>
            </div>
            <table className="min-w-full leading-normal">
                <thead>
                <tr className="bg-gray-100 text-left text-gray-600 uppercase text-[13px]">
                    <th className="px-5 py-3">Tên Ngành học (VI)</th>
                    <th className="px-5 py-3">Chương trình đào tạo</th>
                    <th className="px-5 py-3 text-center">Các chuyên ngành</th>
                    <th className="px-5 py-3 w-40 text-center">Hành động</th>
                </tr>
                </thead>
                <tbody>
                {loading ? (
                    <tr><td colSpan="4" className="text-center p-8"><Loader2 className="animate-spin text-blue-500 mx-auto" /></td></tr>
                ) : majors.map(major => (
                    <tr key={major.id} className="border-b border-blue-300 hover:bg-gray-50">
                        <td className="px-5 py-3 text-sm font-semibold">{major.name}</td>
                        <td className="px-5 py-3 text-sm">{major.programLevelName}</td>
                        <td className="px-5 py-3 text-sm text-center">
                            {major.specializations && major.specializations.length > 0 ? (
                                <div className="flex flex-col space-y-1 items-center">
                                    {major.specializations.map(spec => (
                                        <span key={spec.id}
                                              className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full inline-block w-fit">
                                                {spec.name}
                                            </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-xs text-gray-400">Không có chuyên ngành</span>
                            )}
                        </td>
                        <td className="px-5 py-3 text-sm text-center">
                            <div className="flex items-center justify-center space-x-2">
                                <button onClick={() => handleOpenEdit(major)}
                                        className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full"><Edit
                                    size={18}/></button>
                                <button onClick={() => handleDelete(major.id)}
                                        className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={18}/>
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Modal cảnh báo */}
            <Modal title="Hành động tạm thời không thể thực hiện!" isOpen={isWarningModalOpen}
                   onClose={() => setIsWarningModalOpen(false)}>
                <div className="text-center p-4">
                    <AlertTriangle size={48} className="mx-auto text-yellow-500"/>
                    <h3 className="mt-4 text-lg font-bold uppercase">Chưa có Chương trình đào tạo</h3>
                    <p className="mt-2 text-sm text-gray-600">Bạn cần tạo ít nhất một chương trình đào tạo (ví dụ: Đại
                        học, Cao đẳng, ...) trước khi thêm ngành học mới.</p>
                    <div className="mt-6 flex justify-center gap-x-4">
                        <button onClick={() => setIsWarningModalOpen(false)}
                                className="px-6 py-2 bg-gray-200 rounded-lg font-semibold">Đóng</button>
                        <button onClick={onSwitchToPrograms} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold">Tạo chương trình</button>
                    </div>
                </div>
            </Modal>

            {/* Modal Form */}
            <Modal title={selectedMajor ? "Chỉnh sửa Ngành học" : "Tạo Ngành học mới"} isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)}>
                <MajorForm
                    key={formKey}
                    majorId={selectedMajor ? selectedMajor.id : null}
                    majorData={selectedMajor}
                    programLevels={programLevels}
                    onSave={handleSave}
                    onCancel={() => setIsFormModalOpen(false)}
                    isOpen={isFormModalOpen}
                />
            </Modal>
        </div>
    );
}

export default MajorManager;