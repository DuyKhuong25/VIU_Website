import React from 'react';
import { ChevronRight, Edit, Trash2 } from 'lucide-react';
import ToggleSwitch from '../common/ToggleSwitch';

function CategoryRow({ category, level = 0, onEdit, onDelete, expandedIds, toggleExpand, onToggleHomepage }) {
    const isExpanded = expandedIds.has(category.id);
    const hasChildren = category.children && category.children.length > 0;
    const vietnameseTranslation = category.translations.find(t => t.languageCode === 'vi') || {};
    const englishTranslation = category.translations.find(t => t.languageCode === 'en') || {};
    const isParent = category.parentId === null;

    return (
        <>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-5 py-3 text-sm">
                    <div className="flex items-center" style={{paddingLeft: `${level * 24}px`}}>
                        {hasChildren ? (
                            <button onClick={() => toggleExpand(category.id)}
                                    className="mr-2 p-1 rounded-full hover:bg-gray-200">
                                <ChevronRight size={16} className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}/>
                            </button>
                        ) : (
                            <div className="w-8"></div>
                        )}
                        <span className="font-semibold">{vietnameseTranslation.name}</span>
                    </div>
                </td>

                <td className="px-5 py-3 text-sm text-gray-600 font-mono">
                    {vietnameseTranslation.slug} / {englishTranslation.slug}
                </td>

                <td className="px-5 py-3 text-sm text-center whitespace-nowrap">
                    <button onClick={() => onEdit(category)}
                            className="text-yellow-600 hover:text-yellow-900 mr-4 transition-colors">
                        <Edit size={20}/>
                    </button>
                    <button
                        onClick={() => onDelete(category.id)}
                        className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={hasChildren}
                    >
                        <Trash2 size={20}/>
                    </button>
                </td>
                <td className="px-5 py-3 text-sm text-center">
                    <ToggleSwitch
                        checked={category.showOnHomepage}
                        onChange={() => onToggleHomepage(category.id)}
                        disabled={!isParent}
                    />
                </td>
            </tr>

            {isExpanded && hasChildren && (
                category.children.map(child => (
                    <CategoryRow
                        key={child.id}
                        category={child}
                        level={level + 1}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        expandedIds={expandedIds}
                        toggleExpand={toggleExpand}
                    />
                ))
            )}
        </>
    );
}

export default CategoryRow;