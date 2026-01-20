import React, { useState, useEffect } from 'react';
import { uploadFile } from '../../services/mediaService';
import { translateTexts } from '../../services/translationService';
import toast from 'react-hot-toast';
import { UploadCloud, Save, Loader2, Languages } from 'lucide-react';

function PartnerForm({ partnerData, onSave, onCancel, isOpen }) {
    const [formData, setFormData] = useState({
        name_vi: '',
        name_en: '',
        websiteUrl: '',
        logoMediaId: null,
        logoUrl: '',
        displayOrder: 0
    });
    const [originalMediaId, setOriginalMediaId] = useState(null);
    const [errors, setErrors] = useState({});
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setErrors({});
            if (partnerData) {
                const vi = partnerData.translations.find(t => t.languageCode === 'vi')?.title || '';
                const en = partnerData.translations.find(t => t.languageCode === 'en')?.title || '';
                setFormData({
                    name_vi: vi,
                    name_en: en,
                    websiteUrl: partnerData.websiteUrl || '',
                    logoMediaId: null,
                    logoUrl: partnerData.logoUrl,
                    displayOrder: partnerData.displayOrder
                });
                setOriginalMediaId(partnerData.logoMediaId);
            } else {
                setFormData({
                    name_vi: '',
                    name_en: '',
                    websiteUrl: '',
                    logoMediaId: null,
                    logoUrl: '',
                    displayOrder: 0
                });
                setOriginalMediaId(null);
            }
        }
    }, [partnerData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const fileSizeInMB = file.size / 1024 / 1024;
        const MAX_SIZE = 5;
        if (fileSizeInMB > MAX_SIZE) {
            toast.error(`Dung lượng file quá lớn (tối đa ${MAX_SIZE}MB).`);
            return;
        }

        setIsUploading(true);
        setErrors(prev => ({ ...prev, logo: null }));
        try {
            const response = await uploadFile(file);
            setFormData(prev => ({ ...prev, logoMediaId: response.data.mediaId, logoUrl: response.data.location }));
            toast.success("Upload logo thành công!");
        } catch (error) {
            toast.error("Upload logo thất bại.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleTranslate = async () => {
        if (!formData.name_vi.trim()) {
            toast.error("Vui lòng nhập Tên đối tác (Tiếng Việt) để dịch.");
            return;
        }
        setIsTranslating(true);
        try {
            const res = await translateTexts({ title: formData.name_vi });
            setFormData(prev => ({ ...prev, name_en: res.data.translatedTexts.title }));
            if (errors.name_en) setErrors(prev => ({ ...prev, name_en: null }));
        } catch (error) { toast.error("Dịch tự động thất bại."); }
        finally { setIsTranslating(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setErrors({});

        const finalMediaId = formData.logoMediaId || (partnerData ? originalMediaId : null);

        if (!finalMediaId) {
            setErrors({ logo: "Vui lòng tải lên logo." });
            setIsSaving(false);
            return;
        }

        const dataToSend = {
            name: formData.name,
            websiteUrl: formData.websiteUrl,
            logoMediaId: finalMediaId,
            translations: [
                { languageCode: 'vi', title: formData.name_vi },
                { languageCode: 'en', title: formData.name_en || formData.name_vi }
            ]
        };

        try {
            await onSave(dataToSend);
        } catch (error) {
            if (error.status === 400 && error.data) {
                const backendErrors = error.data;
                const newErrors = {};
                if (backendErrors.websiteUrl) newErrors.websiteUrl = backendErrors.websiteUrl;
                if (backendErrors.logoMediaId) newErrors.logo = backendErrors.logoMediaId;
                if (backendErrors['translations[0].title']) newErrors.name_vi = backendErrors['translations[0].title'];
                if (backendErrors['translations[1].title']) newErrors.name_en = backendErrors['translations[1].title'];

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
        <form onSubmit={handleSubmit} className="p-2 space-y-6">
            <div className="flex justify-between items-center">
                {partnerData && (
                    <div>
                        <label className="font-semibold text-[10px] uppercase text-gray-600 block mb-2">Thứ tự hiển thị</label>
                        <span className="text-lg font-bold text-gray-800 p-2 border border-gray-200 bg-gray-50 rounded-md min-w-[50px] inline-block text-center">
                            {formData.displayOrder}
                        </span>
                    </div>
                )}
            </div>

            <div>
                <label className="font-semibold text-[13px] uppercase text-gray-600">Logo đối tác
                    <span className="text-[10px] text-red-500 italic">*(Bắt buộc)</span>
                </label>
                <div
                    className={`mt-2 relative flex justify-center items-center w-full h-40 border-2 border-dashed rounded-lg p-2 ${errors.logo ? 'border-red-500' : 'border-gray-300'}`}>
                    {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Logo" className="h-full w-full object-contain"/>
                    ) : (
                        <div className="text-center text-gray-400">
                            <UploadCloud size={48} className="mx-auto"/>
                            <p>Kéo thả hoặc nhấn để chọn file</p>
                        </div>
                    )}
                    <input type="file" onChange={handleFileChange} className="absolute w-full h-full opacity-0 cursor-pointer" accept="image/*"/>
                </div>
                {isUploading && <p className="text-sm mt-2 text-center text-blue-600">Đang tải lên...</p>}
                {errors.logo && <p className="text-sm text-red-600 mt-1">{errors.logo}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="font-semibold text-[13px] uppercase text-gray-600">Tên đối tác (Tiếng Việt)
                        <span className="text-[10px] text-red-500 italic">*(Bắt buộc)</span>
                    </label>
                    <input name="name_vi" value={formData.name_vi} onChange={handleChange} className={`w-full mt-2 p-2 border rounded-md ${errors.name_vi ? 'border-red-500' : 'border-gray-300'}`}/>
                    {errors.name_vi && <p className="text-sm text-red-600 mt-1">{errors.name_vi}</p>}
                </div>
                <div>
                    <label className="font-semibold text-[13px] uppercase text-gray-600">Tên đối tác (Tiếng Anh)</label>
                    <input name="name_en" value={formData.name_en} onChange={handleChange} className={`w-full mt-2 p-2 border rounded-md ${errors.name_en ? 'border-red-500' : 'border-gray-300'}`}/>
                    {errors.name_en && <p className="text-sm text-red-600 mt-1">{errors.name_en}</p>}
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
                <label className="font-semibold text-[13px] uppercase text-gray-600">Website
                    <span className="text-[10px] text-red-500 italic">*(Bắt buộc)</span>
                </label>
                <input name="websiteUrl" type="url" value={formData.websiteUrl} onChange={handleChange} className={`w-full mt-2 p-2 border rounded-md ${errors.websiteUrl ? 'border-red-500' : 'border-gray-300'}`} placeholder="https://..."/>
                {errors.websiteUrl && <p className="text-sm text-red-600 mt-1">{errors.websiteUrl}</p>}
            </div>

            <div className="flex justify-end gap-x-4 pt-4">
                <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300">Hủy</button>
                <button type="submit" disabled={isSaving || isUploading} className="px-6 py-2 bg-[var(--brand-blue)] text-white font-semibold rounded-lg hover:bg-opacity-90 disabled:bg-gray-400 flex items-center">
                    {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                    {isSaving ? 'Đang lưu...' : 'Lưu'}
                </button>
            </div>
        </form>
    );
}

export default PartnerForm;