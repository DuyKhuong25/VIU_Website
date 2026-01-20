import React, { useState, useEffect } from 'react';
import { translateTexts } from '../../services/translationService';
import { uploadFile } from '../../services/mediaService';
import { getAllArticleTitles } from '../../services/articleService';
import toast from 'react-hot-toast';
import { Languages, UploadCloud } from 'lucide-react';
import ToggleSwitch from '../common/ToggleSwitch';
import Select from 'react-select';

const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        borderColor: '#d1d5db',
        borderRadius: '0.5rem',
        minHeight: '42px',
        boxShadow: state.isFocused ? `0 0 0 1px var(--brand-blue)` : '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        '&:hover': {
            borderColor: 'var(--brand-blue)',
        },
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? 'var(--brand-blue)' : state.isFocused ? '#eff6ff' : 'white',
        color: state.isSelected ? 'white' : '#1f2937',
    }),
};

function SlideForm({ slide, onSave, onCancel, isOpen }) {
    const [formData, setFormData] = useState({
        mediaId: null, imageUrl: '', active: true,
        linkType: 'none', linkedArticleId: null, externalLinkUrl: '',
        vi: { title: '', description: '' },
        en: { title: '', description: '' },
    });
    const [articleList, setArticleList] = useState([]);
    const [errors, setErrors] = useState({});
    const [isUploading, setIsUploading] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchArticles = async () => {
                try {
                    const response = await getAllArticleTitles();
                    setArticleList(response.data);
                } catch { toast.error("Không thể tải danh-sách bài-viết."); }
            };
            fetchArticles();
            if (slide) {
                const vi = slide.translations.find(t => t.languageCode === 'vi') || {};
                const en = slide.translations.find(t => t.languageCode === 'en') || {};
                let type = 'none';
                if (vi.linkedArticleId) type = 'article';
                else if (vi.linkUrl) type = 'external';

                setFormData({
                    mediaId: slide.mediaId,
                    imageUrl: slide.imageUrl,
                    active: slide.active,
                    linkType: type,
                    linkedArticleId: vi.linkedArticleId,
                    externalLinkUrl: vi.linkUrl || '',
                    vi: { title: vi.title || '' , description: vi.description || ''},
                    en: { title: en.title || '', description: en.description || ''},
                });
            } else {
                setFormData({
                    mediaId: null, imageUrl: '', active: true,
                    linkType: 'none', linkedArticleId: null, externalLinkUrl: '',
                    vi: { title: '', description: '' },
                    en: { title: '', description: '' },
                });
            }
            setErrors({});
        }
    }, [slide, isOpen]);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const response = await uploadFile(file, 'slides');
            setFormData(prev => ({ ...prev, mediaId: response.data.mediaId, imageUrl: response.data.location }));
            toast.success("Upload ảnh thành-công!");
        } catch (error) {
            toast.error("Upload ảnh thất-bại.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleTranslate = async () => {
        if (!formData.vi.title) { toast.error("Vui-lòng nhập tiêu-đề Tiếng Việt."); return; }
        setIsTranslating(true);
        try {
            const textsToTranslate = { title: formData.vi.title, description: formData.vi.description };
            const response = await translateTexts(textsToTranslate);
            const translated = response.data.translatedTexts;
            setFormData(prev => ({ ...prev, en: { ...prev.en, title: translated.title, description: translated.description } }));
        } catch (error) {
            toast.error("Dịch tự-động thất-bại.");
        } finally {
            setIsTranslating(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: null}));
        }
    };

    const handleTranslationChange = (lang, field, value) => {
        setFormData(prev => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));
        const errorKey = field === 'title' ? `title_${lang}` : `description_${lang}`;
        if(errors[errorKey]) {
            setErrors(prev => ({...prev, [errorKey]: null}));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setErrors({});
        try {
            const translations = [
                { languageCode: 'vi', title: formData.vi.title, description: formData.vi.description },
                { languageCode: 'en', title: formData.en.title, description: formData.en.description }
            ];
            if (formData.linkType === 'article') {
                translations.forEach(t => t.linkedArticleId = formData.linkedArticleId);
            } else if (formData.linkType === 'external') {
                translations.forEach(t => t.externalLinkUrl = formData.externalLinkUrl);
            }
            const dataToSend = { mediaId: formData.mediaId, active: formData.active, translations: translations };
            await onSave(dataToSend);
        } catch (error) {
            if (error.status === 400 && typeof error.data === 'object') {
                const backendErrors = error.data;
                const newFormErrors = {};
                for (const key in backendErrors) {
                    if (key.includes('mediaId')) newFormErrors.image = backendErrors[key];
                    if (key.includes('translations[0].title')) newFormErrors.title_vi = backendErrors[key];
                    if (key.includes('translations[1].title')) newFormErrors.title_en = backendErrors[key];
                }
                setErrors(newFormErrors);
                toast.error("Dữ liệu không hợp lệ.");
            } else {
                toast.error(error.message || "Đã có lỗi không mong muốn xảy ra.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-2 space-y-6">
            <div className="flex justify-between items-center">
                <div></div>
                <div className="flex items-center space-x-3">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">KÍCH HOẠT SLIDE</label>
                    <ToggleSwitch checked={formData.active} onChange={() => setFormData(prev => ({ ...prev, active: !prev.active }))} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <label className="block text-[14px] uppercase font-medium text-gray-700 mb-2">Ảnh Slide
                            <span className="text-[11px] text-red-500 italic">*(Bắt buộc)</span>
                        </label>
                        <div
                            className={`mt-1 relative flex justify-center items-center w-full h-48 border-2 border-dashed rounded-lg p-2 ${errors.image ? 'border-red-500' : 'border-gray-300'}`}>
                            {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-contain rounded-md" />}
                            {!formData.imageUrl && (
                                <div className="text-center">
                                    <UploadCloud size={48} className="mx-auto text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">Kéo thả hoặc chọn file</p>
                                </div>
                            )}
                            <input type="file" className="absolute w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                        </div>
                        {isUploading && <p className="text-sm text-gray-500 mt-1">Đang tải lên...</p>}
                        {errors.image && <p className="text-sm text-red-600 mt-1">{errors.image}</p>}
                    </div>
                    <div>
                        <h4 className="font-semibold text-[14px] uppercase text-gray-800 mb-2">Tùy chọn liên kết</h4>
                        <div className="flex border border-gray-200 rounded-lg p-1 space-x-1 bg-gray-100">
                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, linkType: 'none' }))} className={`w-full text-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${formData.linkType === 'none' ? 'bg-white shadow text-[var(--brand-blue)]' : 'text-gray-600 hover:bg-gray-200'}`}>Không liên kết</button>
                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, linkType: 'article' }))} className={`w-full text-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${formData.linkType === 'article' ? 'bg-white shadow text-[var(--brand-blue)]' : 'text-gray-600 hover:bg-gray-200'}`}>Bài viết</button>
                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, linkType: 'external' }))} className={`w-full text-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${formData.linkType === 'external' ? 'bg-white shadow text-[var(--brand-blue)]' : 'text-gray-600 hover:bg-gray-200'}`}>Link ngoài</button>
                        </div>
                        <div className="mt-4 p-4 border border-gray-200 rounded-lg min-h-[96px]">
                            {formData.linkType === 'article' && (
                                <div>
                                    <label className="block text-sm font-medium">Chọn bài viết</label>
                                    <Select
                                        options={articleList.map(a => ({ value: a.id, label: a.title }))}
                                        value={articleList.find(a => a.id === formData.linkedArticleId) ? { value: formData.linkedArticleId, label: articleList.find(a => a.id === formData.linkedArticleId).title } : null}
                                        onChange={(selected) => setFormData(prev => ({...prev, linkedArticleId: selected.value }))}
                                        placeholder="-- Chọn một bài-viết --"
                                        styles={customSelectStyles}
                                        className="mt-1"
                                    />
                                </div>
                            )}
                            {formData.linkType === 'external' && (
                                <div>
                                    <label className="block text-sm font-medium">Dán URL tùy chỉnh</label>
                                    <input type="url" name="externalLinkUrl" value={formData.externalLinkUrl} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" />
                                </div>
                            )}
                            {formData.linkType === 'none' && ( <p className="text-center text-sm text-gray-500 pt-5">Slide này sẽ không có liên kết.</p> )}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                        <div className="space-y-4">
                            <h4 className="font-medium text-[14px] uppercase text-lg text-gray-800">Nội dung Tiếng Việt:</h4>
                            <div>
                                <label className="block text-sm font-medium">Tiêu đề
                                    <span className="text-[11px] text-red-500 italic">*(Bắt buộc)</span>
                                </label>
                                <input type="text" value={formData.vi.title} onChange={e => handleTranslationChange('vi', 'title', e.target.value)}
                                       className={`w-full mt-1 px-3 py-2 border rounded-md shadow-sm ${errors.title_vi ? 'border-red-500' : 'border-gray-300'}`} />
                                {errors.title_vi && <p className="text-sm text-red-600 mt-1">{errors.title_vi}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Mô tả
                                    <span className="text-[11px] text-red-500 italic">*(Bắt buộc)</span>
                                </label>
                                <textarea value={formData.vi.description} onChange={e => handleTranslationChange('vi', 'description', e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm" rows="5"></textarea>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-medium text-[14px] uppercase text-lg text-gray-800">Nội dung Tiếng Anh:</h4>
                            <div>
                                <label className="block text-sm font-medium">Tiêu đề</label>
                                <input type="text" value={formData.en.title} onChange={e => handleTranslationChange('en', 'title', e.target.value)}
                                       className={`w-full mt-1 px-3 py-2 border rounded-md shadow-sm ${errors.title_en ? 'border-red-500' : 'border-gray-300'}`} />
                                {errors.title_en && <p className="text-sm text-red-600 mt-1">{errors.title_en}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Mô tả</label>
                                <textarea value={formData.en.description} onChange={e => handleTranslationChange('en', 'description', e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm" rows="5"></textarea>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 mt-4">
                        <button type="button" onClick={handleTranslate} disabled={isTranslating} className="w-full flex items-center justify-center gap-x-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 text-sm font-semibold">
                            <Languages size={16} />
                            <span>{isTranslating ? 'Đang dịch...' : 'Dịch sang Tiếng Anh'}</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
                <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold text-sm">Hủy</button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 bg-[var(--brand-blue)] text-white font-bold rounded-lg hover:bg-opacity-90 text-sm disabled:bg-gray-400">
                    {isSaving ? 'Đang lưu...' : 'Lưu Slide'}
                </button>
            </div>
        </form>
    );
}
export default SlideForm;