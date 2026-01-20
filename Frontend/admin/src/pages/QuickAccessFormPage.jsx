import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuickAccessLinkById, createQuickAccessLink, updateQuickAccessLink } from '../services/quickAccessService';
import { uploadFile } from '../services/mediaService';
import { translateTexts } from '../services/translationService';
import toast from 'react-hot-toast';
import { Link as LinkIcon, Save, UploadCloud, Loader2, Languages } from 'lucide-react';

function QuickAccessFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        title_vi: '',
        title_en: '',
        linkUrl: '',
        iconMediaId: null,
        iconUrl: '',
        displayOrder: 0,
        active: true,
    });
    const [originalMediaId, setOriginalMediaId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            getQuickAccessLinkById(id)
                .then(res => {
                    const link = res.data;
                    console.log("Res: ", res.data)
                    const viTranslation = link.translations.find(t => t.languageCode === 'vi')?.title || '';
                    const enTranslation = link.translations.find(t => t.languageCode === 'en')?.title || '';

                    setFormData({
                        title_vi: viTranslation,
                        title_en: enTranslation,
                        linkUrl: link.linkUrl,
                        iconMediaId: null,
                        iconUrl: link.iconUrl,
                        displayOrder: link.displayOrder,
                        active: link.active,
                    });
                    setOriginalMediaId(link.logoMediaId);
                })
                .catch(() => toast.error("Không tìm thấy thông tin."));
        }
    }, [id, isEditMode]);

    const handleIconUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const fileSizeInMB = file.size / 1024 / 1024;
        const MAX_SIZE = 2;

        if (fileSizeInMB > MAX_SIZE) {
            toast.error(`Dung lượng file quá lớn. Vui lòng chọn file nhỏ hơn ${MAX_SIZE}MB.`);
            setErrors(prev => ({ ...prev, icon: `Dung lượng file quá lớn (tối đa ${MAX_SIZE}MB).` }));
            return;
        }

        setIsUploading(true);
        setErrors(prev => ({ ...prev, icon: null }));
        try {
            const res = await uploadFile(file);
            setFormData(prev => ({ ...prev, iconMediaId: res.data.mediaId, iconUrl: res.data.location }));
            toast.success("Upload icon thành công!");
        } catch (error) {
            if (error.response && error.response.status === 413) {
                // Nếu nhận được lỗi 413 (Payload Too Large) từ backend
                const backendError = error.response.data.error;
                setErrors(prev => ({ ...prev, icon: backendError }));
                toast.error(backendError);
            } else {
                toast.error("Upload icon thất bại.");
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setIsSaving(true);

        const finalMediaId = formData.iconMediaId || (isEditMode ? originalMediaId : null);

        if (!finalMediaId) {
            toast.error("Vui lòng tải lên icon.");
            setErrors(prev => ({ ...prev, icon: "Vui lòng tải lên icon." }));
            setIsSaving(false);
            return;
        }

        const dataToSend = {
            linkUrl: formData.linkUrl,
            iconMediaId: finalMediaId,
            active: formData.active,
            translations: [
                { languageCode: 'vi', title: formData.title_vi },
                { languageCode: 'en', title: formData.title_en || formData.title_vi }
            ]
        };

        if (!dataToSend.iconMediaId && !formData.iconUrl) {
            setErrors(prev => ({ ...prev, icon: "Vui lòng tải lên icon." }));
            setIsSaving(false);
            return;
        }

        try {
            if (isEditMode) {
                if (!dataToSend.iconMediaId) delete dataToSend.iconMediaId;
                await updateQuickAccessLink(id, dataToSend);
                toast.success("Cập nhật thành công!");
            } else {
                await createQuickAccessLink(dataToSend);
                toast.success("Tạo liên kết thành công!");
            }
            navigate('/quick-access');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                const backendErrors = error.response.data;
                const newErrors = {};

                if (backendErrors.linkUrl) newErrors.linkUrl = backendErrors.linkUrl;
                if (backendErrors.iconMediaId) newErrors.icon = backendErrors.iconMediaId;
                if (backendErrors['translations[0].title']) newErrors.title_vi = backendErrors['translations[0].title'];
                if (backendErrors['translations[1].title']) newErrors.title_en = backendErrors['translations[1].title'];

                setErrors(newErrors);
                toast.error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường báo đỏ.");
            } else {
                toast.error(error.message || "Lỗi khi lưu thông tin.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleTranslate = async () => {
        if (!formData.title_vi.trim()) {
            toast.error("Vui lòng nhập tên Tiếng Việt để dịch.");
            return;
        }
        setIsTranslating(true);
        try {
            const res = await translateTexts({ title: formData.title_vi });
            setFormData(prev => ({ ...prev, title_en: res.data.translatedTexts.title }));
            toast.success("Đã dịch sang Tiếng Anh!");
        } catch (error) {
            toast.error("Dịch tự động thất bại.");
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit}>
                <div className="flex items-center gap-x-3 mb-8">
                    <LinkIcon size={36} className="text-[var(--brand-blue)]"/>
                    <h1 className="text-[16px] font-bold text-blue-900 uppercase">
                        {isEditMode ? 'Chỉnh sửa Liên kết' : 'Tạo Liên kết mới'}
                    </h1>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-md space-y-8">
                    <div className="flex justify-between items-center">
                        {isEditMode && (
                            <div>
                                <label className="font-semibold text-sm text-gray-600 block mb-2">Thứ tự hiển
                                    thị</label>
                                <span
                                    className="text-lg font-bold text-gray-800 p-2 border border-gray-200 bg-gray-50 rounded-md min-w-[50px] inline-block text-center">
                                    {formData.displayOrder}
                                </span>
                            </div>
                        )}
                        <div className={`${!isEditMode ? 'ml-auto' : ''} flex items-center align-middle`}>
                            <label className="font-semibold text-[13px] text-gray-600 block mr-2 uppercase">Trạng thái hoạt động</label>
                            <label htmlFor="active-toggle" className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input type="checkbox" id="active-toggle" name="active" className="sr-only"
                                           checked={formData.active} onChange={handleChange}/>
                                    <div
                                        className={`block ${formData.active ? 'bg-green-700' : 'bg-gray-200'} w-11.5 h-6 rounded-full`}></div>
                                    <div
                                        className={`dot absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition ${formData.active ? 'translate-x-5 bg-[var(--brand-blue)]' : ''}`}></div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="font-semibold text-gray-800 uppercase text-[13px]">Icon hiển thị
                            <span className="text-[10px] text-red-500 italic">*(Bắt buộc)</span>
                        </label>
                        <div
                            className="mt-2 relative flex justify-center items-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg p-2">
                            {formData.iconUrl ? (
                                <img src={formData.iconUrl} alt="Icon" className="h-24 w-24 object-contain"/>
                            ) : (
                                <div className="text-center text-gray-400">
                                    <UploadCloud size={48} className="mx-auto"/>
                                    <p className="text-[13px]">Kéo thả hoặc nhấn để chọn file</p>
                                </div>
                            )}
                            <input type="file" onChange={handleIconUpload}
                                   className="absolute w-full h-full opacity-0 cursor-pointer"
                                   accept="image/svg+xml, image/png, , image/jpg, image/jpeg"/>
                        </div>
                        {isUploading && <p className="text-sm mt-2 text-center text-blue-600">Đang tải lên...</p>}
                        {errors.icon && <p className="text-[11px] text-red-600 mt-1">{errors.icon}</p>}
                    </div>

                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                                <label className="font-semibold text-gray-800 uppercase text-[13px]">Tên liên kết (Tiếng
                                    Việt)
                                    <span className="text-[10px] text-red-500 italic">*(Bắt buộc)</span>
                                </label>
                                <input name="title_vi" value={formData.title_vi} onChange={handleChange}
                                       className="w-full mt-2 p-2 rounded-lg bg-gray-100 border-1 border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-300" autoComplete="off"/>
                                {errors.title_vi && <p className="text-sm text-red-600 mt-1">{errors.title_vi}</p>}
                            </div>
                            <div>
                                <label className="font-semibold text-gray-800 uppercase text-[13px]">Tên liên kết (Tiếng Anh)</label>
                                <input name="title_en" value={formData.title_en} onChange={handleChange}
                                       className="w-full mt-2 p-2 rounded-lg bg-gray-100 border-1 border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-300" autoComplete="off"/>
                            </div>
                        </div>
                        <div className="mt-2">
                            <button
                                type="button"
                                onClick={handleTranslate}
                                disabled={isTranslating}
                                className="w-full flex items-center justify-center gap-x-2 px-4 py-2 bg-[var(--brand-blue)] text-white text-[13px] font-semibold rounded-lg hover:bg-opacity-90 disabled:bg-gray-400"
                            >
                                <Languages size={16}/>
                                <span>{isTranslating ? 'Đang dịch...' : 'Dịch sang Tiếng Anh'}</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="font-semibold text-gray-800 uppercase text-[13px]">URL liên kết
                            <span className="text-[10px] text-red-500 italic">*(Bắt buộc)</span>
                        </label>
                        <input name="linkUrl" type="url" value={formData.linkUrl} onChange={handleChange}
                               className="w-full mt-2 p-2 rounded-lg bg-gray-100 border-1 border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-300"
                               placeholder="https://..." autoComplete="off"/>
                        {errors.linkUrl && <p className="text-sm text-red-600 mt-1">{errors.linkUrl}</p>}
                    </div>
                </div>

                <div className="flex justify-end gap-x-4 mt-8">
                    <button type="button" onClick={() => navigate('/quick-access')}
                            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300">Hủy
                    </button>
                    <button type="submit" disabled={isSaving || isUploading}
                            className="px-6 py-2 bg-[var(--brand-blue)] text-white font-semibold rounded-lg hover:bg-opacity-90 disabled:bg-gray-400 flex items-center">
                        {isSaving ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2"/>}
                        {isSaving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default QuickAccessFormPage;