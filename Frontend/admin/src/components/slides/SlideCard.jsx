import React from 'react';
import ToggleSwitch from '../common/ToggleSwitch';
import { Edit, Trash2, GripVertical } from 'lucide-react';

function SlideCard({ slide, provided, onEdit, onDelete, onToggle }) {
    const vi = slide.translations.find(t => t.languageCode === 'vi') || {};

    return (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className="bg-white rounded-lg shadow-md overflow-hidden relative group"
        >
            <div
                {...provided.dragHandleProps}
                className="absolute top-2 left-2 p-1.5 cursor-move text-white bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <GripVertical size={20} />
            </div>
            <img src={slide.imageUrl} alt={vi.title} className="w-full h-40 object-cover" />
            <div className="p-4">
                <h3 className="font-bold truncate text-lg text-gray-800">{vi.title}</h3>
                <p className="text-sm text-gray-500 truncate h-5">{vi.description}</p>
                <div className="mt-4 flex justify-between items-center">
                    <ToggleSwitch checked={slide.active} onChange={() => onToggle(slide.id)} />
                    <div className="space-x-1">
                        <button onClick={() => onEdit(slide)} className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full transition-colors"><Edit size={18} /></button>
                        <button onClick={() => onDelete(slide.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"><Trash2 size={18} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default SlideCard;