import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Languages, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { translateTexts } from '../../services/translationService';
import { getMajorById } from '../../services/academicService';
import { v4 as uuidv4 } from 'uuid';

const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        borderColor: state.isFocused ? 'var(--brand-blue)' : (state.menuIsOpen ? 'var(--brand-blue)' : '#d1d5db'),
        borderRadius: '0.375rem',
        minHeight: '42px',
        boxShadow: state.isFocused ? '0 0 0 1px var(--brand-blue)' : null,
        '&:hover': {
            borderColor: 'var(--brand-blue)',
        },
    }),
    controlError: (provided) => ({
        ...provided,
        borderColor: '#ef4444',
        borderRadius: '0.375rem',
        minHeight: '42px',
        boxShadow: '0 0 0 1px #ef4444',
        '&:hover': {
            borderColor: '#ef4444',
        },
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? 'var(--brand-blue)' : state.isFocused ? '#eff6ff' : 'white',
        color: state.isSelected ? 'white' : '#1f2937',
    }),
};

function MajorForm({ majorId, programLevels, onSave, onCancel, isOpen }) {
    const [formData, setFormData] = useState({
        programLevelId: null,
        name_vi: '',
        name_en: '',
        specializations: []
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isSpecTranslating, setIsSpecTranslating] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const specListRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setErrors({});
            if (majorId) {
                setIsLoading(true);
                getMajorById(majorId)
                    .then(res => {
                        const majorData = res.data;
                        setFormData({
                            programLevelId: majorData.programLevel.id,
                            name_vi: majorData.translations.find(t => t.languageCode === 'vi')?.title || '',
                            name_en: majorData.translations.find(t => t.languageCode === 'en')?.title || '',
                            specializations: majorData.specializations.map(spec => ({
                                key: uuidv4(),
                                name_vi: spec.translations.find(t => t.languageCode === 'vi')?.title || '',
                                name_en: spec.translations.find(t => t.languageCode === 'en')?.title || '',
                            }))
                        });
                    })
                    .catch(() => toast.error("Không thể tải dữ liệu ngành học."))
                    .finally(() => setIsLoading(false));
            } else {
                setFormData({
                    programLevelId: null,
                    name_vi: '',
                    name_en: '',
                    specializations: []
                });
                setIsLoading(false);
            }
        }
    }, [majorId]);

    const handleAddSpec = () => {
        setFormData(prev => ({
            ...prev,
            specializations: [...prev.specializations, { key: uuidv4(), name_vi: '', name_en: '' }]
        }));
    };

    useEffect(() => {
        if (specListRef.current) {
            specListRef.current.scrollTop = specListRef.current.scrollHeight;
        }
    }, [formData.specializations.length]);

    const handleRemoveSpec = (key) => {
        setFormData(prev => ({
            ...prev,
            specializations: prev.specializations.filter(spec => spec.key !== key)
        }));
    };

    const handleSpecChange = (key, field, value) => {
        setFormData(prev => ({
            ...prev,
            specializations: prev.specializations.map(spec =>
                spec.key === key ? { ...spec, [field]: value } : spec
            )
        }));
        const index = formData.specializations.findIndex(s => s.key === key);
        const errorKey = `spec_${index}_${field.replace('name_', '')}`;
        if (errors[errorKey]) {
            setErrors(prev => ({ ...prev, [errorKey]: null }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: null}));
        }
    };

    const handleTranslate = async () => {
        if (!formData.name_vi.trim()) {
            toast.error("Vui lòng nhập tên Ngành học (Tiếng Việt) để dịch.");
            return;
        }
        setIsTranslating(true);
        try {
            const res = await translateTexts({ title: formData.name_vi });
            setFormData(prev => ({ ...prev, name_en: res.data.translatedTexts.title }));
            if (errors.name_en) setErrors(prev => ({ ...prev, name_en: null }));
            toast.success("Đã dịch sang Tiếng Anh!");
        } catch (error) { toast.error("Dịch tự động thất bại."); }
        finally { setIsTranslating(false); }
    };

    const handleSpecTranslate = async (key) => {
        const specToTranslate = formData.specializations.find(s => s.key === key);
        if (!specToTranslate || !specToTranslate.name_vi.trim()) {
            toast.error("Vui lòng nhập tên chuyên ngành (Tiếng Việt) để dịch.");
            return;
        }
        setIsSpecTranslating(key);
        try {
            const res = await translateTexts({ title: specToTranslate.name_vi });
            setFormData(prev => ({
                ...prev,
                specializations: prev.specializations.map(spec =>
                    spec.key === key ? { ...spec, name_en: res.data.translatedTexts.title } : spec
                )
            }));
            const index = formData.specializations.findIndex(s => s.key === key);
            if (errors[`spec_${index}_en`]) {
                setErrors(prev => ({ ...prev, [`spec_${index}_en`]: null }));
            }
        } catch (error) {
            toast.error("Dịch tự động thất bại.");
        } finally {
            setIsSpecTranslating(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrors({});
        let validationErrors = {};

        if (!formData.programLevelId) {
            validationErrors.programLevelId = "Vui lòng chọn một chương trình đào tạo.";
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
            return;
        }

        setIsSaving(true);

        const dataToSend = {
            programLevelId: formData.programLevelId,
            translations: [
                { languageCode: 'vi', title: formData.name_vi },
                { languageCode: 'en', title: formData.name_en || formData.name_vi }
            ],
            specializations: formData.specializations
                .filter(spec => spec.name_vi.trim() !== '')
                .map(spec => ({
                    translations: [
                        { languageCode: 'vi', title: spec.name_vi },
                        { languageCode: 'en', title: spec.name_en || spec.name_vi }
                    ]
                }))
        };

        try {
            await onSave(dataToSend);
        } catch (error) {
            if (error.status === 400 && error.data) {
                console.error("Backend validation errors:", error.data);
                const backendErrors = error.data;
                const newErrors = {};

                if (backendErrors.programLevelId) newErrors.programLevelId = backendErrors.programLevelId;
                if (backendErrors['translations[0].title']) newErrors.name_vi = backendErrors['translations[0].title'];
                if (backendErrors['translations[1].title']) newErrors.name_en = backendErrors['translations[1].title'];

                Object.keys(backendErrors).forEach(key => {
                    let match = key.match(/specializations\[(\d+)\].*translations\[(\d+)\].title/);
                    if (match) {
                        const specIndex = parseInt(match[1], 10);
                        const langIndex = parseInt(match[2], 10);
                        const lang = langIndex === 0 ? 'vi' : 'en';

                        const specKey = formData.specializations[specIndex]?.key;
                        if (specKey) {
                            const formErrorKey = `spec_${specKey}_name_${lang}`;
                            newErrors[formErrorKey] = backendErrors[key];
                        }
                    }

                    match = key.match(/spec_(\d+)_name_(vi|en)/);
                    if (match) {
                        const specIndex = parseInt(match[1], 10);
                        const lang = match[2];

                        const specKey = formData.specializations[specIndex]?.key;
                        if (specKey) {
                            const formErrorKey = `spec_${specKey}_name_${lang}`;
                            newErrors[formErrorKey] = backendErrors[key];
                        }
                    }
                });

                setErrors(newErrors);
                toast.error("Dữ liệu không hợp lệ. Kiểm tra lại.");
            } else {
                toast.error(error.message || "Đã có lỗi xảy ra.");
            }
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;
    }

    return (
        <form onSubmit={handleSubmit} className="p-2 space-y-6 min-w-[700px]">
            <div>
                <label className="font-semibold text-gray-700 text-[13px] uppercase">Chương trình đào tạo
                    <span className="text-[10px] text-red-500 italic">*(Bắt buộc)</span>
                </label>
                <Select
                    options={programLevels.map(p => ({ value: p.id, label: p.name }))}
                    value={programLevels.map(p => ({ value: p.id, label: p.name })).find(p => p.value === formData.programLevelId)}
                    onChange={(selected) => {
                        setFormData(prev => ({...prev, programLevelId: selected.value}));
                        if (errors.programLevelId) setErrors(prev => ({...prev, programLevelId: null}));
                    }}
                    styles={customSelectStyles}
                    placeholder="-- Bắt buộc chọn --"
                    className={`mt-1 ${errors.programLevelId ? 'ring-2 ring-red-500 rounded-md' : ''}`}
                />
                {errors.programLevelId && <p className="text-[11px] italic text-red-600 mt-1">{errors.programLevelId}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="font-semibold text-gray-700 text-[13px] uppercase">Tên ngành học (Tiếng Việt)
                        <span className="text-[10px] text-red-500 italic">*(Bắt buộc)</span>
                    </label>
                    <input name="name_vi" value={formData.name_vi} onChange={handleChange} className={`w-full mt-1 p-2 border rounded-md ${errors.name_vi ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.name_vi && <p className="text-[11px] italic text-red-600 mt-1">{errors.name_vi}</p>}
                </div>
                <div>
                    <label className="font-semibold text-gray-700 text-[13px] uppercase">Tên ngành học (Tiếng Anh)</label>
                    <input name="name_en" value={formData.name_en} onChange={handleChange} className={`w-full mt-1 p-2 border rounded-md ${errors.name_en ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.name_en && <p className="text-[11px] italic text-red-600 mt-1">{errors.name_en}</p>}
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

            <fieldset className="border p-4 rounded-lg">
                <legend className="font-semibold px-2 text-gray-700 text-[13px] uppercase">Thêm chuyên ngành (Tùy chọn)</legend>
                <div ref={specListRef} className="space-y-4 max-h-64 overflow-y-auto pr-2">
                    {formData.specializations.map((spec, index) => (
                        <div key={spec.key}
                             className="relative p-4 pt-8 bg-white rounded border border-gray-200 shadow-sm">
                            <button
                                type="button"
                                onClick={() => handleRemoveSpec(spec.key)}
                                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                            >
                                <X size={16}/>
                            </button>
                            <div className="grid grid-cols-9 gap-2 items-end">
                                <div className="col-span-4">
                                    <label className="text-[11px] uppercase font-semibold text-gray-600">Tên chuyên ngành (Tiếng Việt)</label>
                                    <input
                                        value={spec.name_vi}
                                        onChange={e => handleSpecChange(spec.key, 'name_vi', e.target.value)}
                                        className={`w-full mt-1 p-2 border rounded-md text-sm bg-white ${errors[`spec_${spec.key}_name_vi`] ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors[`spec_${spec.key}_name_vi`] &&
                                        <p className="text-[11px] italic text-red-600 mt-1">{errors[`spec_${spec.key}_name_vi`]}</p>}
                                </div>

                                <div className="text-center col-span-1">
                                    <button
                                        type="button"
                                        onClick={() => handleSpecTranslate(spec.key)}
                                        disabled={isSpecTranslating === spec.key}
                                        className="inline-flex items-center justify-center gap-x-1 px-5 py-2 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 text-xs font-semibold"
                                    >
                                        <Languages size={14}/>
                                        {isSpecTranslating === spec.key ? '...' : 'Dịch'}
                                    </button>
                                </div>

                                <div className="col-span-4">
                                    <label className="text-[11px] uppercase font-semibold text-gray-600">Tên chuyên ngành (Tiếng Anh)</label>
                                    <input
                                        value={spec.name_en}
                                        onChange={e => handleSpecChange(spec.key, 'name_en', e.target.value)}
                                        className={`w-full mt-1 p-2 border rounded-md text-sm bg-white ${errors[`spec_${spec.key}_name_en`] ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors[`spec_${spec.key}_name_en`] &&
                                        <p className="text-[11px] italic text-red-600 mt-1">{errors[`spec_${spec.key}_name_en`]}</p>}
                                </div>
                            </div>
                        </div>
                        ))}
                </div>
                <button
                    type="button"
                    onClick={handleAddSpec}
                    className="mt-4 text-blue-600 font-semibold text-[13px] flex items-center gap-1 cursor-pointer"
                >
                    <Plus size={16}/>Thêm chuyên ngành
                </button>
            </fieldset>

            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onCancel}
                        className="px-6 py-2 bg-gray-200 rounded-lg font-semibold">Hủy
                </button>
                <button type="submit" disabled={isSaving}
                        className="px-6 py-2 bg-[var(--brand-blue)] text-white rounded-lg font-semibold flex items-center disabled:bg-gray-400">
                    <Save size={18} className="mr-2"/> {isSaving ? 'Đang lưu...' : 'Lưu'}
                </button>
            </div>
        </form>
    );
}

export default MajorForm;