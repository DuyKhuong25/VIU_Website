import React from 'react';
import ToggleSwitch from '../common/ToggleSwitch';
import { Edit, Trash2, GripVertical, ListChevronsDownUp } from 'lucide-react';

function SlideListItem({ slide, provided, onEdit, onDelete, onToggle }) {
    const vi = slide.translations.find(t => t.languageCode === 'vi') || {};

    return (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className="flex items-center p-4 bg-white border-b border-gray-200 hover:bg-gray-50"
        >
            <div {...provided.dragHandleProps} className="p-2 cursor-move text-gray-400">
                <ListChevronsDownUp size={20} />
            </div>

            <div className="w-2/12 px-4">
                <img src={slide.imageUrl} alt={vi.title} className="w-24 h-14 object-cover rounded-md shadow-md" />
            </div>

            <div className="w-6/12 px-4">
                <p className="font-semibold text-[14px] uppercase text-gray-800 truncate">{vi.title}</p>
                <p className="text-[13px] italic text-gray-500 truncate">{vi.description}</p>
            </div>

            <div className="w-2/12 px-4 text-center">
                <ToggleSwitch checked={slide.active} onChange={() => onToggle(slide.id)} />
            </div>

            <div className="w-2/12 px-4 text-center space-x-2">
                <button onClick={() => onEdit(slide)} className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full transition-colors"><Edit size={18} /></button>
                <button onClick={() => onDelete(slide.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"><Trash2 size={18} /></button>
            </div>
        </div>
    );
}

export default SlideListItem;