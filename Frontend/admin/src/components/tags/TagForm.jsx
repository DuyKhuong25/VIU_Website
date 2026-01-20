import React, { useState, useEffect } from 'react';
import { translateTexts } from '../../services/translationService';
import toast from 'react-hot-toast';
import { Languages } from 'lucide-react';

function TagForm({ tag, onSave, onCancel, isOpen }) {
    const [formData, setFormData] = useState({
        viName: '',
        enName: ''
    });
    const [errors, setErrors] = useState({});
    const [isTranslating, setIsTranslating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (tag) {
                const vi = tag.translations.find(t => t.languageCode === 'vi') || {};
                const en = tag.translations.find(t => t.languageCode === 'en') || {};
                setFormData({
                    viName: vi.name || '',
                    enName: en.name || ''
                });
            } else {
                setFormData({ viName: '', enName: '' });
            }
            setErrors({});
        }
    }, [tag, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleTranslate = async () => {
        if (!formData.viName.trim()) {
            toast.error("Vui lòng nhập tên Tiếng Việt trước khi dịch.");
            return;
        }
        setIsTranslating(true);
        try {
            const response = await translateTexts({ name: formData.viName });
            setFormData(prev => ({ ...prev, enName: response.data.translatedTexts.name }));
        } catch (error) {
            toast.error("Dịch tự động thất bại.");
        } finally {
            setIsTranslating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setErrors({});

        const dataToSend = {
            translations: [
                { languageCode: 'vi', name: formData.viName.trim() },
                { languageCode: 'en', name: formData.enName.trim() }
            ]
        };

        try {
            await onSave(dataToSend);
        } catch (error) {
            console.error(error);
            if (error.status === 400 && typeof error.data === 'object') {
                if (error.data.message) {
                    toast.error(error.data.message);
                    setErrors({viName: error.data.message});
                } else {
                    const backendErrors = error.data;
                    const newFormErrors = {};
                    for (const key in backendErrors) {
                        if (key.includes('translations[0].name')) newFormErrors.viName = backendErrors[key];
                        if (key.includes('translations[1].name')) newFormErrors.enName = backendErrors[key];
                    }
                    setErrors(newFormErrors);
                }
            } else {
                toast.error("Đã có lỗi không mong muốn xảy ra.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Tên thẻ (Tiếng Việt)
                    <span className="text-[10px] text-red-500 italic">*(Bắt buộc)</span>
                </label>
                <div className="flex items-center space-x-2 mt-1">
                <input type="text" name="viName" value={formData.viName} onChange={handleChange}
                           className={`w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${errors.viName ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-[var(--brand-blue)]'}`} />
                    <button type="button" onClick={handleTranslate} disabled={isTranslating}
                            className="flex items-center gap-x-2 flex-shrink-0 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50">
                        <Languages size={18}/>
                        <span className="text-sm font-medium whitespace-nowrap">{isTranslating ? 'Đang dịch...' : 'Dịch'}</span>
                    </button>
                </div>
                {errors.viName && <p className="text-[13px] italic text-red-600 mt-1">{errors.viName}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Tên thẻ (Tiếng Anh)</label>
                <input type="text" name="enName" value={formData.enName} onChange={handleChange}
                       className={`w-full px-4 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${errors.enName ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-[var(--brand-blue)]'}`} />
                {errors.enName && <p className="text-[13px] italic text-red-600 mt-1">{errors.enName}</p>}
            </div>
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 mt-6">
                <button type="button" onClick={onCancel}
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold text-sm">Hủy</button>
                <button type="submit" disabled={isSaving}
                        className="px-6 py-2 bg-[var(--brand-blue)] text-white font-bold rounded-lg hover:bg-opacity-90 text-sm disabled:bg-gray-400">
                    {isSaving ? 'Đang lưu...' : 'Lưu'}
                </button>
            </div>
        </form>
    );
}
export default TagForm;