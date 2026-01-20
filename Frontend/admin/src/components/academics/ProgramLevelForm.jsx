import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getProgramLevelById } from '../../services/academicService';
import { translateTexts } from '../../services/translationService';
import { slugify } from '../../utils/slugify';
import { Languages, Save, Loader2 } from 'lucide-react';

const ProgramLevelForm = ({ levelData, onSave, onCancel, isOpen }) => {
    const [formData, setFormData] = useState({ code: '', name_vi: '', name_en: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setErrors({});
            if (levelData) {
                getProgramLevelById(levelData.id).then(res => {
                    const vi = res.data.translations.find(t => t.languageCode === 'vi')?.title || '';
                    const en = res.data.translations.find(t => t.languageCode === 'en')?.title || '';
                    setFormData({ code: res.data.code, name_vi: vi, name_en: en });
                });
            } else {
                setFormData({ code: '', name_vi: '', name_en: '' });
            }
        }
    }, [levelData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'name_vi' && { code: slugify(value) })
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }

        if (name === 'name_vi' && errors.code) {
            setErrors(prev => ({ ...prev, code: null }));
        }

        if (name === 'name_en' && errors.name_en) {
            setErrors(prev => ({ ...prev, name_en: null }));
        }
    };

    const handleTranslate = async () => {
        if (!formData.name_vi.trim()) {
            toast.error("Vui lòng nhập tên Tiếng Việt để dịch.");
            return;
        }
        setIsTranslating(true);
        try {
            const res = await translateTexts({ title: formData.name_vi });
            setFormData(prev => ({ ...prev, name_en: res.data.translatedTexts.title }));

            if (errors.name_en) {
                setErrors(prev => ({ ...prev, name_en: null }));
            }

            toast.success("Đã dịch sang Tiếng Anh!");
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
            code: formData.code,
            translations: [
                { languageCode: 'vi', title: formData.name_vi },
                { languageCode: 'en', title: formData.name_en || formData.name_vi }
            ]
        };

        try {
            await onSave(dataToSend);
        } catch (error) {
            console.log(error);
            if (error.status === 400 && error.data) {
                const backendErrors = error.data;
                const newErrors = {};

                if (backendErrors.code) {
                    newErrors.code = backendErrors.code;
                }
                if (backendErrors['translations[0].title']) {
                    newErrors.name_vi = backendErrors['translations[0].title'];
                }
                if (backendErrors['translations[1].title']) {
                    newErrors.name_en = backendErrors['translations[1].title'];
                }

                setErrors(newErrors);
                toast.error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
            } else {
                toast.error(error.message || "Đã có lỗi xảy ra.");
            }
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-2 p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                    <label className="font-semibold text-gray-700 uppercase text-[13px]">Tên chương trình (Tiếng Việt)
                        <span className="text-[10px] text-red-500 italic">*(Bắt buộc)</span>
                    </label>
                    <input
                        name="name_vi"
                        value={formData.name_vi}
                        onChange={handleChange}
                        className={`w-full mt-1 p-2 border rounded-md ${errors.name_vi ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.name_vi && <p className="text-[10px] italic text-red-600 mt-1">{errors.name_vi}</p>}
                </div>
                <div>
                    <label className="font-semibold text-gray-700 uppercase text-[13px]">Tên chương trình (Tiếng Anh)</label>
                    <input
                        name="name_en"
                        value={formData.name_en}
                        onChange={handleChange}
                        className={`w-full mt-1 p-2 border rounded-md ${errors.name_en ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.name_en && <p className="text-[10px] italic text-red-600 mt-1">{errors.name_en}</p>}
                </div>
            </div>
            <div className="text-center">
                <button
                    type="button"
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className="inline-flex items-center justify-center gap-x-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 text-sm font-semibold"
                >
                    <Languages size={16}/>
                    {isTranslating ? 'Đang dịch...' : 'Dịch tự động'}
                </button>
            </div>
            <div>
                <label className="font-semibold text-gray-700 uppercase text-[13px]">Mã chương trình</label>
                <input
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className={`w-full mt-1 p-2 border rounded-md text-[13px] ${errors.code ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Ví dụ: dai-hoc, sau-dai-hoc"
                />
                <p className="text-[11px] text-gray-500 mt-1 italic">Mã này là duy nhất, không dấu, dùng cho URL.(Được tự động tạo dựa trên tên chương trình nếu bỏ trống!)</p>
                {errors.code && <p className="text-[10px] italic text-red-600 mt-1">{errors.code}</p>}
            </div>
            <div className="flex justify-end gap-x-4 pt-4">
                <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold">Hủy</button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 bg-[var(--brand-blue)] text-white font-semibold rounded-lg flex items-center disabled:bg-gray-400">
                    <Save size={18} className="mr-2" /> {isSaving ? 'Đang lưu...' : 'Lưu'}
                </button>
            </div>
        </form>
    );
};

export default ProgramLevelForm;