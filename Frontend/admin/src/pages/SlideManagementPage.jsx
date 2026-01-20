import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getAllSlides, createSlide, updateSlide, deleteSlide, toggleSlideStatus, reorderSlides } from '../services/slideService';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import SlideForm from '../components/slides/SlideForm';
import SlideListItem from '../components/slides/SlideListItem';
import { Images, PlusCircle } from 'lucide-react';

function SlideManagementPage() {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(null);

    const fetchSlides = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getAllSlides();
            setSlides(response.data);
        } catch {
            toast.error("Không thể tải danh sách slide.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSlides(); }, [fetchSlides]);

    const handleOpenModal = (slide = null) => {
        setCurrentSlide(slide);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentSlide(null);
    };

    const handleSaveSlide = async (slideData) => {
        if (currentSlide) {
            await updateSlide(currentSlide.id, slideData);
            toast.success("Cập nhật slide thành công!");
        } else {
            await createSlide(slideData);
            toast.success("Tạo slide mới thành công!");
        }
        fetchSlides();
        handleCloseModal();
    };

    const handleDeleteSlide = async (slideId) => {
        if (window.confirm("Bạn có chắc muốn xóa slide này?")) {
            try {
                await deleteSlide(slideId);
                toast.success("Xóa slide thành công!");
                fetchSlides();
            } catch {
                toast.error("Xóa slide thất bại.");
            }
        }
    };

    const handleToggleStatus = async (slideId) => {
        try {
            const response = await toggleSlideStatus(slideId);
            setSlides(prevSlides =>
                prevSlides.map(s => s.id === slideId ? response.data : s)
            );
        } catch {
            toast.error("Cập nhật trạng thái thất bại.");
            fetchSlides();
        }
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(slides);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setSlides(items);
    };

    const handleSaveOrder = async () => {
        try {
            const slideIds = slides.map(s => s.id);
            await reorderSlides(slideIds);
            toast.success("Đã lưu thứ tự mới!");
        } catch {
            toast.error("Lỗi khi lưu thứ tự.");
        }
    };

    if (loading) return <p>Đang tải dữ liệu...</p>;

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div>
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-x-3">
                        <Images size={36} className="text-[var(--brand-blue)]" />
                        <h1 className="text-[22px] font-bold text-brand-blue uppercase tracking-wider">Quản lý Slide</h1>
                    </div>
                    <div className="flex items-center gap-x-4">
                        <button onClick={handleSaveOrder} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                            Lưu thứ tự hiển thị
                        </button>
                        <button onClick={() => handleOpenModal()} className="flex items-center gap-x-2 px-4 py-2 bg-[var(--brand-blue)] text-white font-semibold rounded-lg hover:bg-opacity-90">
                            <PlusCircle size={20} /><span>Thêm Slide mới</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow-md rounded-lg">
                    <div className="flex items-center p-4 bg-gray-100 text-left text-gray-600 uppercase text-sm font-semibold rounded-t-lg">
                        <div className="w-10"></div>
                        <div className="w-2/12 px-4">Ảnh</div>
                        <div className="w-6/12 px-4">Tiêu đề</div>
                        <div className="w-2/12 px-4 text-center">Trạng thái hiển thị</div>
                        <div className="w-2/12 px-4 text-center">Hành động</div>
                    </div>

                    <Droppable droppableId="slides">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                {slides.map((slide, index) => (
                                    <Draggable key={slide.id} draggableId={String(slide.id)} index={index}>
                                        {(providedDraggable) => (
                                            <SlideListItem
                                                slide={slide}
                                                provided={providedDraggable}
                                                onEdit={handleOpenModal}
                                                onDelete={handleDeleteSlide}
                                                onToggle={handleToggleStatus}
                                            />
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentSlide ? 'Chỉnh sửa Slide' : 'Tạo Slide mới'}>
                <SlideForm slide={currentSlide} onSave={handleSaveSlide} onCancel={handleCloseModal} isOpen={isModalOpen} />
            </Modal>
        </DragDropContext>
    );
}

export default SlideManagementPage;