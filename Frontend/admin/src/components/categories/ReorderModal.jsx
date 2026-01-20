// src/components/categories/ReorderModal.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllCategoriesAsTree, reorderCategories } from '../../services/categoryService';

const DraggableCategoryItem = ({ category, provided, snapshot }) => {
    const viName = category.translations.find(t => t.languageCode === 'vi')?.name || 'N/A';

    const itemContent = (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={provided.draggableProps.style}
            className={`flex items-center p-3 bg-white
                ${snapshot.isDragging ? 'shadow-xl rounded-md' : ''}`}
        >
            <GripVertical size={18} className="text-gray-400 mr-3" />
            <span className="font-semibold text-gray-700">{viName}</span>
        </div>
    );

    if (snapshot.isDragging) {
        return createPortal(itemContent, document.body);
    }

    return itemContent;
};


const ReorderModal = ({ onClose, onReorderSuccess }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await getAllCategoriesAsTree();
                setCategories(response.data);
            } catch {
                toast.error("Không thể tải danh sách danh mục.");
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const handleDragEnd = async (result) => {
        const { destination, source } = result;
        if (!destination || (destination.index === source.index)) {
            return;
        }

        const items = Array.from(categories);
        const [reorderedItem] = items.splice(source.index, 1);
        items.splice(destination.index, 0, reorderedItem);

        setCategories(items);

        const categoryIds = items.map(c => c.id);
        try {
            await reorderCategories(categoryIds);
            toast.success("Đã cập nhật thứ tự!");
        } catch {
            toast.error("Lỗi khi lưu thứ tự.");
            const originalItems = Array.from(categories);
            const [movedItem] = originalItems.splice(destination.index, 1);
            originalItems.splice(source.index, 0, movedItem);
            setCategories(originalItems);
        }
    };

    return (
        <div className="p-4" style={{ minWidth: '500px' }}>
            <p className="text-sm text-gray-600 mb-4">
                Kéo và thả để sắp xếp lại thứ tự. Thứ tự sẽ được tự động lưu.
            </p>
            {loading ? (
                <p>Đang tải danh mục...</p>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="reorder-list">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="max-h-[60vh] overflow-y-auto rounded-lg border border-gray-200"
                            >
                                {categories.map((category, index) => {
                                    return (
                                        <Draggable
                                            key={category.id}
                                            draggableId={category.id.toString()}
                                            index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <DraggableCategoryItem
                                                    category={category}
                                                    provided={provided}
                                                    snapshot={snapshot}
                                                />
                                            )}
                                        </Draggable>
                                    );
                                })}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}

            <div className="flex justify-end pt-4 mt-4">
                <button
                    type="button"
                    onClick={() => {
                        onReorderSuccess();
                        onClose();
                    }}
                    className="px-6 py-2 bg-[var(--brand-blue)] text-white font-bold rounded-lg hover:bg-opacity-90 text-sm"
                >
                    Đóng
                </button>
            </div>
        </div>
    );
};

export default ReorderModal;