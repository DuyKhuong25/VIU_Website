import React, { useState, useEffect, useCallback } from 'react';
import { getAllPartners, deletePartner, reorderPartners, createPartner, updatePartner, getPartnerById } from '../services/partnerService';
import toast from 'react-hot-toast';
import { Handshake, PlusCircle, Edit, Trash2, Loader2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Modal from '../components/common/Modal';
import PartnerForm from '../components/partners/PartnerForm';

function PartnerListPage() {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [formKey, setFormKey] = useState(Date.now()); // Key để reset form

    const fetchPartners = useCallback(() => {
        setLoading(true);
        getAllPartners()
            .then(res => setPartners(res.data.content))
            .catch(() => toast.error("Không thể tải danh sách đối tác."))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchPartners();
    }, [fetchPartners]);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa đối tác này?")) {
            try {
                await deletePartner(id);
                setPartners(prev => prev.filter(p => p.id !== id));
                toast.success("Xóa thành công!");
            } catch {
                toast.error("Xóa thất bại.");
            }
        }
    };

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(partners);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setPartners(items);
        const partnerIds = items.map(item => item.id);

        reorderPartners(partnerIds)
            .then(() => toast.success("Cập nhật thứ tự thành công!"))
            .catch(() => {
                toast.error("Lỗi khi cập nhật thứ tự.");
                fetchPartners();
            });
    };

    const handleOpenCreate = () => {
        setSelectedPartner(null);
        setFormKey(Date.now());
        setIsModalOpen(true);
    };

    const handleOpenEdit = async (partner) => {
        try {
            const res = await getPartnerById(partner.id);
            setSelectedPartner(res.data);
            setFormKey(Date.now()); // Tạo key mới để reset form
            setIsModalOpen(true);
        } catch {
            toast.error("Không thể tải chi tiết đối tác.");
        }
    };

    const handleSave = async (data) => {
        if (selectedPartner) {
            await updatePartner(selectedPartner.id, data);
        } else {
            await createPartner(data);
        }
        setIsModalOpen(false);
        fetchPartners();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-x-3">
                    <Handshake size={36} className="text-[var(--brand-blue)]" />
                    <h1 className="text-[22px] font-bold text-[var(--brand-blue)] uppercase tracking-wider">Quản lý Đối tác</h1>
                </div>
                <button onClick={handleOpenCreate} className="flex items-center gap-x-2 px-4 py-2 bg-[var(--brand-blue)] text-white font-semibold rounded-lg hover:bg-opacity-90">
                    <PlusCircle size={20} /><span>Thêm đối tác mới</span>
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="partners">
                        {(provided) => (
                            <table className="min-w-full leading-normal" {...provided.droppableProps} ref={provided.innerRef}>
                                <thead>
                                <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                                    <th className="px-5 py-3 w-12"></th>
                                    <th className="px-5 py-3 w-32">Logo</th>
                                    <th className="px-5 py-3">Tên Đối tác (VI)</th>
                                    <th className="px-5 py-3">Website</th>
                                    <th className="px-5 py-3 w-40 text-center">Hành động</th>
                                </tr>
                                </thead>
                                <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center p-8"><Loader2 className="animate-spin text-blue-500 mx-auto" size={32} /></td></tr>
                                ) : partners.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center p-8 text-gray-500">Chưa có đối tác nào.</td></tr>
                                ) : partners.map((partner, index) => (
                                    <Draggable key={String(partner.id)} draggableId={String(partner.id)} index={index}>
                                        {(provided) => (
                                            <tr {...provided.draggableProps} ref={provided.innerRef} className="border-b border-gray-200 hover:bg-gray-50 bg-white">
                                                <td {...provided.dragHandleProps} className="px-5 py-2 text-center cursor-move text-gray-400">
                                                    <GripVertical size={20} />
                                                </td>
                                                <td className="px-5 py-2">
                                                    <img src={partner.logoUrl} alt={partner.name} className="w-24 h-16 object-contain bg-gray-50 p-1 rounded"/>
                                                </td>
                                                <td className="px-5 py-2 text-sm font-semibold text-gray-900">{partner.name}</td>
                                                <td className="px-5 py-2 text-sm">
                                                    <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{partner.websiteUrl}</a>
                                                </td>
                                                <td className="px-5 py-2 text-sm text-center">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <button onClick={() => handleOpenEdit(partner)} className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full">
                                                            <Edit size={18}/>
                                                        </button>
                                                        <button onClick={() => handleDelete(partner.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full">
                                                            <Trash2 size={18}/>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                                </tbody>
                            </table>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            <Modal
                title={selectedPartner ? "Chỉnh sửa Đối tác" : "Tạo Đối tác mới"}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <PartnerForm
                    key={formKey}
                    partnerData={selectedPartner}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                    isOpen={isModalOpen}
                />
            </Modal>
        </div>
    );
}

export default PartnerListPage;