import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Editor } from '@tinymce/tinymce-react';
import Select from 'react-select';
import { getArticleById, createArticle, updateArticle } from '../services/articleService';
import { getAllCategoriesAsTree } from '../services/categoryService';
import { getAllTags } from '../services/tagService';
import { uploadFile } from '../services/mediaService';
import { translateTexts } from '../services/translationService';
import toast from 'react-hot-toast';
import { UploadCloud, Save, Languages, FileText } from 'lucide-react';

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

function ArticleFormPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();
    const editorViRef = useRef(null);
    const editorEnRef = useRef(null);

    const [formData, setFormData] = useState({
        title_vi: '', title_en: '',
        excerpt_vi: '', excerpt_en: '',
        category: null,
        tags: [],
        thumbnailMediaId: null,
        thumbnailUrl: '',
        status: { value: 'DRAFT', label: 'Bản nháp' },
        pinned: false,
    });
    const [contentVi, setContentVi] = useState('');
    const [contentEn, setContentEn] = useState('');
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [tagOptions, setTagOptions] = useState([]);
    const [errors, setErrors] = useState({}); // State mới để lưu lỗi validation
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);

    const canChangeStatus = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_MANAGER');

    const buildCategoryOptions = (categories, level = 0) => {
        let options = [];
        categories.forEach(cat => {
            const prefix = '\u00A0\u00A0'.repeat(level) + (level > 0 ? '↳ ' : '');
            const catName = cat.translations.find(t => t.languageCode === 'vi')?.name || 'N/A';
            options.push({ value: cat.id, label: prefix + catName });
            if (cat.children && cat.children.length > 0) {
                options = options.concat(buildCategoryOptions(cat.children, level + 1));
            }
        });
        return options;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, tagRes] = await Promise.all([
                    getAllCategoriesAsTree(),
                    getAllTags(0, 1000)
                ]);
                setCategoryOptions(buildCategoryOptions(catRes.data));
                setTagOptions(tagRes.data.content.map(tag => {
                    const viName = tag.translations.find(t => t.languageCode === 'vi')?.name;
                    return { value: tag.id, label: viName || tag.id };
                }));

                if (isEditMode) {
                    const articleRes = await getArticleById(id);
                    const article = articleRes.data;
                    const vi = article.translations.find(t => t.languageCode === 'vi') || {};
                    const en = article.translations.find(t => t.languageCode === 'en') || {};
                    setFormData({
                        title_vi: vi.title || '', title_en: en.title || '',
                        excerpt_vi: vi.excerpt || '', excerpt_en: en.excerpt || '',
                        category: { value: article.category.id, label: article.category.name },
                        tags: article.tags.map(t => ({ value: t.id, label: t.name })),
                        thumbnailMediaId: article.thumbnailMediaId,
                        thumbnailUrl: article.thumbnailUrl,
                        status: { value: article.status, label: article.status === 'PUBLISHED' ? 'Xuất bản' : 'Bản nháp' },
                        pinned: article.pinned || false,
                    });
                    setContentVi(vi.content || '');
                    setContentEn(en.content || '');
                }
            } catch (error) {
                toast.error("Lỗi khi tải dữ liệu cho form.");
                navigate('/articles');
            }
        };
        fetchData();
    }, [id, isEditMode, navigate]);

    const handleThumbnailUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const res = await uploadFile(file);
            setFormData(prev => ({ ...prev, thumbnailMediaId: res.data.mediaId, thumbnailUrl: res.data.location }));
            toast.success("Upload ảnh đại diện thành công!");
        } catch {
            toast.error("Upload ảnh đại diện thất bại.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleTinymceUpload = (blobInfo) => new Promise((resolve, reject) => {
        // API upload
        uploadFile(blobInfo.blob())
            .then(res => resolve(res.data.location))
            .catch(err => reject('Upload ảnh thất bại: ' + err.message));
    });

    const handleTranslate = async () => {
        setIsTranslating(true);
        if(formData.title_vi.trim() === '' && (!editorViRef.current || editorViRef.current.getContent().trim() === '')) {
            setErrors(prev => ({...prev, title_vi: 'Tiêu đề tiếng Việt không được để trống.', content_vi: 'Nội dung tiếng Việt không được để trống.'}));
            toast.error("Vui lòng nhập tiêu đề và nội dung tiếng Việt để dịch.");
            setIsTranslating(false);
            return;
        }else {
            try {
                const texts = {
                    title: formData.title_vi,
                    excerpt: formData.excerpt_vi,
                    content: editorViRef.current ? editorViRef.current.getContent() : ''
                };
                const res = await translateTexts(texts);
                const translated = res.data.translatedTexts;
                setFormData(prev => ({ ...prev, title_en: translated.title, excerpt_en: translated.excerpt }));
                if (editorEnRef.current) {
                    editorEnRef.current.setContent(translated.content);
                }
                toast.success("Đã dịch sang Tiếng Anh!");
            } catch {
                toast.error("Dịch tự động thất bại.");
            } finally {
                setIsTranslating(false);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setIsSaving(true);
        try {
            const dataToSend = {
                categoryId: formData.category?.value,
                thumbnailMediaId: formData.thumbnailMediaId,
                tagIds: formData.tags.map(t => t.value),
                status: formData.status?.value,
                pinned: formData.pinned,
                translations: [
                    { languageCode: 'vi', title: formData.title_vi, excerpt: formData.excerpt_vi, content: editorViRef.current ? editorViRef.current.getContent() : '' },
                    { languageCode: 'en', title: formData.title_en, excerpt: formData.excerpt_en, content: editorEnRef.current ? editorEnRef.current.getContent() : '' }
                ]
            };
            if (isEditMode) {
                await updateArticle(id, dataToSend);
                toast.success("Cập nhật bài viết thành công!");
            } else {
                await createArticle(dataToSend);
                toast.success("Tạo bài viết thành công!");
            }
            navigate('/articles');
        } catch (error) {
            console.error(error);
            if (error.status === 400 && typeof error.data === 'object') {
                const backendErrors = error.data;
                const newFormErrors = {};
                for (const key in backendErrors) {
                    if (key.includes('thumbnailMediaId')) newFormErrors.thumbnail = backendErrors[key];
                    if (key.includes('categoryId')) newFormErrors.category = backendErrors[key];
                    if (key.includes('translations[0].title')) newFormErrors.title_vi = backendErrors[key];
                    if (key.includes('translations[1].title')) newFormErrors.title_en = backendErrors[key];
                    if (key.includes('translations[0].content')) newFormErrors.content_vi = backendErrors[key];
                    if (key.includes('translations[1].content')) newFormErrors.content_en = backendErrors[key];
                }
                setErrors(newFormErrors);
                toast.error("Dữ liệu không hợp lệ, vui lòng kiểm tra lại.");
            } else {
                toast.error(error.message || "Lỗi khi lưu bài viết.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
                {/* --- HEADER CỐ ĐỊNH --- */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 py-4 -mx-8 px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-x-3">
                            <FileText size={36} className="text-[var(--brand-blue)]"/>
                            <h1 className="text-[20px] font-bold text-brand-blue uppercase tracking-wider">
                                {isEditMode ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                            </h1>
                        </div>
                        <div className="flex items-center gap-x-2">
                            <button type="button" onClick={() => navigate('/articles')}
                                    className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold text-sm hover:bg-gray-300">Hủy
                            </button>
                            <button type="button" onClick={handleTranslate} disabled={isTranslating}
                                    className="flex items-center gap-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-semibold">
                                <Languages size={16}/>
                                <span>{isTranslating ? 'Đang dịch...' : 'Dịch nội dung bài viết'}</span>
                            </button>
                            <button type="submit" disabled={isSaving}
                                    className="flex items-center gap-x-2 px-5 py-2.5 bg-[var(--brand-blue)] text-white font-semibold rounded-lg hover:bg-opacity-90 disabled:bg-gray-400">
                                <Save size={18}/>
                                <span>{isSaving ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Tạo mới')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- KHU VỰC NỘI DUNG CÓ THỂ CUỘN --- */}
                <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-2 pt-6 overflow-y-auto">
                    {/* --- CỘT TRÁI (NỘI DUNG) --- */}
                    <div className="lg:col-span-9 space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow space-y-4">
                            <h3 className="font-bold text-[16px] uppercase text-gray-800">Tiêu đề & Mô tả ngắn</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                    <label className="font-semibold text-[14px] text-gray-600">Tiêu đề
                                        <span className="text-[12px] text-gray-600 italic"> (Tiếng Việt)</span>
                                        <span className="text-[10px] text-red-500 italic">*(Bắt buộc)</span>
                                    </label>
                                    <input name="title_vi" value={formData.title_vi} onChange={handleChange}
                                           className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:outline-none"/>
                                    {errors.title_vi && <p className="text-[12px] italic text-red-600 mt-1">{errors.title_vi}</p>}
                                </div>
                                <div>
                                    <label className="font-semibold text-[14px] text-gray-600">Tiêu đề
                                        <span className="text-[12px] text-gray-600 italic"> (Tiếng Anh)</span></label>
                                    <input name="title_en" value={formData.title_en} onChange={handleChange}
                                           className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:outline-none"/>
                                    {errors.title_en && <p className="text-[12px] italic text-red-600 mt-1">{errors.title_en}</p>}
                                </div>
                                <div>
                                    <label className="font-semibold text-[14px] text-gray-600">Mô tả ngắn
                                        <span className="text-[12px] text-gray-600 italic"> (Tiếng Việt)</span>
                                        <span className="text-[10px] text-red-500 italic">*(Bắt buộc)</span>
                                    </label>
                                    <textarea name="excerpt_vi" value={formData.excerpt_vi} onChange={handleChange}
                                              rows={3} className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:outline-none"/>
                                </div>
                                <div>
                                    <label className="font-semibold text-[14px] text-gray-600">Mô tả ngắn
                                        <span className="text-[12px] text-gray-600 italic"> (Tiếng Anh)</span>
                                    </label>
                                    <textarea name="excerpt_en" value={formData.excerpt_en} onChange={handleChange}
                                              rows={3} className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:outline-none"/>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <label className="font-bold text-[16px] uppercase text-gray-800">Nội dung chi tiết (Tiếng
                                Việt)
                                <span className="text-[10px] text-red-500 italic">*(Bắt buộc)</span>
                            </label>
                            {errors.content_vi && <p className="text-[12px] italic text-red-600 mt-1">{errors.content_vi}</p>}
                            <div className={`mt-4 rounded-md overflow-hidden ${errors.content_en ? 'border border-red-500' : ''}`}>
                                <Editor onInit={(evt, editor) => editorViRef.current = editor} initialValue={contentVi}
                                        apiKey="a7jb5xyoctbhn4rtoai29su7ylhuf59xrzuoer72q0r25iqy" init={{
                                    height: 400,
                                    plugins: 'lists link image media table wordcount',
                                    toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist | link image media',
                                    images_upload_handler: handleTinymceUpload,
                                    highlight_on_focus: false
                                }}/>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <label className="font-bold text-[16px] uppercase text-gray-800">Nội dung chi tiết (Tiếng Anh)</label>
                            {errors.content_en && <p className="text-[12px] italic text-red-600 mt-1">{errors.content_en}</p>}
                            <div className={`mt-4 rounded-md overflow-hidden ${errors.content_en ? 'border border-red-500' : ''}`}>
                                <Editor onInit={(evt, editor) => editorEnRef.current = editor} initialValue={contentEn}
                                        apiKey="a7jb5xyoctbhn4rtoai29su7ylhuf59xrzuoer72q0r25iqy" init={{
                                    height: 400,
                                    plugins: 'lists link image media table wordcount',
                                    toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist | link image media',
                                    images_upload_handler: handleTinymceUpload,
                                    highlight_on_focus: false
                                }}/>
                            </div>
                        </div>
                    </div>

                    {/* --- CỘT PHẢI (CÀI ĐẶT) --- */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="p-4 bg-white rounded-lg shadow sticky">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-[14px] uppercase pb-2">Ghim bài viết</h3>
                                    <label htmlFor="pin-toggle" className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input type="checkbox" id="pin-toggle" className="sr-only"
                                                   checked={formData.pinned}
                                                   onChange={() => setFormData(prev => ({
                                                       ...prev,
                                                       pinned: !prev.pinned
                                                   }))}/>
                                            <div className={`block ${formData.pinned ? 'bg-green-700' : 'bg-gray-200'} w-11.5 h-6 rounded-full`}></div>
                                            <div
                                                className={`dot absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition ${formData.pinned ? 'translate-x-5 bg-[var(--brand-blue)]' : ''}`}></div>
                                        </div>
                                        <div className="ml-3 text-gray-700 text-[11px]">
                                            {formData.pinned ? 'Đang ghim' : 'Không ghim'}
                                        </div>
                                    </label>
                                    <p className="text-xs text-gray-500 mt-2 italic">{formData.pinned ? 'Bài viết được ghim sẽ hiển thị ở đầu danh sách.' : ''}</p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-[14px] uppercase pb-2 mb-">Trạng thái bài
                                        đăng</h3>
                                    <div>
                                        <div className="mt-2">
                                            <Select
                                                options={[{value: 'DRAFT', label: 'Bản nháp'}, {
                                                    value: 'PUBLISHED',
                                                    label: 'Xuất bản'
                                                }]}
                                                value={formData.status}
                                                onChange={(selected) => setFormData(prev => ({
                                                    ...prev,
                                                    status: selected
                                                }))}
                                                styles={customSelectStyles}
                                                isDisabled={!canChangeStatus}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base mb-2">Ảnh đại diện
                                        <span className="text-[10px] text-red-500 italic">*(Bắt buộc)</span>
                                    </h3>
                                    <div
                                        className={`mt-1 relative flex justify-center items-center w-full h-40 border-2 rounded-lg p-2 ${errors.thumbnail ? 'border-red-500' : 'border-dashed border-gray-300'}`}>
                                        {formData.thumbnailUrl ? <img src={formData.thumbnailUrl} alt="Thumbnail"
                                                                      className="h-full w-full object-contain"/> :
                                            <UploadCloud size={40} className="text-gray-400"/>}
                                        <input type="file" onChange={handleThumbnailUpload}
                                               className="absolute w-full h-full opacity-0 cursor-pointer"
                                               accept="image/*"/>
                                    </div>
                                    {isUploading && <p className="text-sm mt-1 text-center">Đang tải lên...</p>}
                                    {errors.thumbnail &&
                                        <p className="text-[12px] italic text-red-600 mt-1">{errors.thumbnail}</p>}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[14px] uppercase mb-2">Chọn danh mục
                                        <span className="text-[10px] text-red-500 italic">*(Bắt buộc)</span>
                                    </h3>
                                    <div className="mt-2">
                                    <Select
                                            options={categoryOptions}
                                            value={formData.category}
                                            onChange={(selected) => setFormData(prev => ({
                                                ...prev,
                                                category: selected
                                            }))}
                                            placeholder="-- Chọn danh mục --"
                                            styles={customSelectStyles}
                                        />
                                        {errors.category &&
                                            <p className="text-[12px] italic text-red-600 mt-1">{errors.category}</p>}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[14px] uppercase mb-2">Gắn thẻ bài viết</h3>
                                    <div className="mt-2">
                                        <Select
                                            isMulti
                                            options={tagOptions}
                                            value={formData.tags}
                                            onChange={(selected) => setFormData(prev => ({...prev, tags: selected}))}
                                            placeholder="Chọn hoặc gõ để tìm thẻ..."
                                            styles={customSelectStyles}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default ArticleFormPage;