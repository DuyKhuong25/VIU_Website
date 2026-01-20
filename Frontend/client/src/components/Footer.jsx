// src/components/Footer.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaFacebookF, FaYoutube, FaTwitter, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaChevronRight } from 'react-icons/fa';
import apiClient from '../services/api';
import { PATHS } from '../routesConfig';

const Footer = () => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    const [topLevelCategories, setTopLevelCategories] = useState([]);
    const [studentLinks, setStudentLinks] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const categoryRes = await apiClient.get('/public/categories/tree');
                setTopLevelCategories(categoryRes.data.filter(item => item.parentId === null));

                const quickLinksRes = await apiClient.get('/public/quick-links');
                setStudentLinks(quickLinksRes.data);

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu cho Footer:", error);
            }
        };
        fetchData();
    }, []);

    const studentLinksCol1 = studentLinks.slice(0, 4);
    const studentLinksCol2 = studentLinks.slice(4, 8);

    const localizedPath = PATHS.category[currentLang] || PATHS.category.en;

    const content = {
        columnTitles: {
            info: { vi: 'Thông tin trường', en: 'University Info' },
            locations: { vi: 'Địa điểm đào tạo', en: 'Our Campuses' },
            quickLinks: { vi: 'Liên kết nhanh', en: 'Quick Links' },
            forStudents: { vi: 'Dành cho Sinh viên', en: 'For Students' },
        },
        locationsData: {
            mainCampusTitle: { vi: 'Cơ sở chính:', en: 'Main Campus:' },
            otherCampusesTitle: { vi: 'Cơ sở khác:', en: 'Other Campuses:' },
            sonTayName: { vi: 'Sơn Tây', en: 'Son Tay' },
            thachThatName: { vi: 'Thạch Thất', en: 'Thach That' },
            thanhXuanName: { vi: 'Thanh Xuân', en: 'Thanh Xuan' },
            sonTayAddress: {
                vi: 'Số 16 Hữu Nghị, phường Tùng Thiện, TP. Hà Nội',
                en: '16 Huu Nghi St, Tung Thien Ward, Hanoi City'
            },
            thachThatAddress: {
                vi: 'Số 88, đường 419 - Tây Phương, TP. Hà Nội',
                en: '88, Road 419 - Tay Phuong, Hanoi City'
            },
            thanhXuanAddress: {
                vi: 'Số 27 Lê Văn Lương, phường Thanh Xuân, TP. Hà Nội',
                en: '27 Le Van Luong St, Thanh Xuan Ward, Hanoi City'
            }
        },
        copyrightText: {
            vi: `Copyright © ${new Date().getFullYear()} Trường Đại học Công Nghiệp Việt-Hung. All Rights Reserved.`,
            en: `Copyright © ${new Date().getFullYear()} Viet-Hung Industrial University. All Rights Reserved.`
        }
    };

    const socialLinks = [
        { icon: <FaFacebookF />, path: 'https://facebook.com', name: 'Facebook' },
        { icon: <FaYoutube />, path: 'https://youtube.com', name: 'YouTube' },
        { icon: <FaTwitter />, path: 'https://twitter.com', name: 'Twitter' },
    ];

    const footerStyle = {
        backgroundImage: `url('https://fct.haui.edu.vn/dnn/web/haui/assets/images/footer.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    };

    return (
        <footer className="w-full text-gray-300" style={{ backgroundColor: '#083970', ...footerStyle }}>
            <div className="w-full lg:w-3/4 mx-auto px-4 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <div className="aspect-video w-full">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6402.095005471857!2d105.44173577693599!3d21.111144384940605!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31345f3390d8a149%3A0x372b9b5e16ee7935!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2hp4buHcCBWaeG7h3QgLSBIdW5n!5e1!3m2!1svi!2s!4v1757997407898!5m2!1svi!2s"
                                className="w-full h-full border-0 rounded-md"
                                allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade">
                            </iframe>
                        </div>
                        <div className="text-sm space-y-2">
                            <div className="flex items-center text-[13px]"><FaPhoneAlt className="mr-3 text-gray-400 flex-shrink-0" /><a href="tel:02433838345" className="hover:text-white">Hotline: 02433 838 345</a></div>
                            <div className="flex items-center text-[13px]"><FaEnvelope className="mr-3 text-gray-400 flex-shrink-0" /><a href="mailto:dhcnviethung.viu@gmail.com" className="hover:text-white">Email: dhcnviethung.viu@gmail.com</a></div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[16px] font-bold text-white uppercase">{content.columnTitles.locations[currentLang]}</h3>
                        <div className="text-[13px] space-y-3">
                            <p className="font-semibold text-gray-100">{content.locationsData.mainCampusTitle[currentLang]}</p>
                            <div className="flex items-start">
                                <FaMapMarkerAlt className="mr-3 mt-1 text-gray-400 flex-shrink-0" />
                                <span><span className="font-semibold">{content.locationsData.sonTayName[currentLang]}:</span> {content.locationsData.sonTayAddress[currentLang]}</span>
                            </div>
                            <p className="font-semibold text-gray-100 pt-2">{content.locationsData.otherCampusesTitle[currentLang]}</p>
                            <div className="flex items-start">
                                <FaMapMarkerAlt className="mr-3 mt-1 text-gray-400 flex-shrink-0" />
                                <span><span className="font-semibold">{content.locationsData.thachThatName[currentLang]}:</span> {content.locationsData.thachThatAddress[currentLang]}</span>
                            </div>
                            <div className="flex items-start">
                                <FaMapMarkerAlt className="mr-3 mt-1 text-gray-400 flex-shrink-0" />
                                <span><span className="font-semibold">{content.locationsData.thanhXuanName[currentLang]}:</span> {content.locationsData.thanhXuanAddress[currentLang]}</span>
                            </div>
                        </div>
                    </div>

                    {/* Cột 3: Các Liên kết */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-[16px] font-bold text-white uppercase">{content.columnTitles.quickLinks[currentLang]}</h3>
                            <div className="grid grid-cols-2 gap-x-4 text-[13px]">
                                <ul className="space-y-2">
                                    {topLevelCategories.map(item => {
                                        const translation = item.translations.find(t => t.languageCode === currentLang) || item.translations[0];
                                        if (!translation) return null;
                                        return (
                                            <li key={item.id}><Link to={`/${localizedPath}/${translation.slug}`}
                                                                    className="flex items-center hover:text-white group"><FaChevronRight
                                                size={10}
                                                className="mr-2 text-gray-500 group-hover:text-amber-400 transition-colors"/><span
                                                className="group-hover:underline">{translation.name}</span></Link></li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-[16px] font-bold text-white uppercase">{content.columnTitles.forStudents[currentLang]}</h3>
                            <div className="grid grid-cols-2 gap-x-4 text-[13px]">
                                <ul className="space-y-2">
                                    {studentLinksCol1.map(link => {
                                        const translation = link.translations.find(t => t.languageCode === currentLang) || link.translations[0];
                                        if (!translation) return null;
                                        return (
                                            <li key={link.id}><a href={link.linkUrl} target="_blank"
                                                                 rel="noopener noreferrer"
                                                                 className="flex items-center hover:text-white group"><FaChevronRight
                                                size={10}
                                                className="mr-2 text-gray-500 group-hover:text-amber-400 transition-colors"/><span
                                                className="group-hover:underline">{translation.title}</span></a></li>
                                        );
                                    })}
                                </ul>
                                <ul className="space-y-2">
                                    {studentLinksCol2.map(link => {
                                        const translation = link.translations.find(t => t.languageCode === currentLang) || link.translations[0];
                                        if (!translation) return null;
                                        return (
                                            <li key={link.id}><a href={link.linkUrl} target="_blank"
                                                                 rel="noopener noreferrer"
                                                                 className="flex items-center hover:text-white group"><FaChevronRight
                                                size={10}
                                                className="mr-2 text-gray-500 group-hover:text-amber-400 transition-colors"/><span
                                                className="group-hover:underline">{translation.title}</span></a></li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="mt-8 pt-6 border-t border-gray-500 flex flex-col sm:flex-row items-center justify-between text-sm text-white">
                    <p className="mb-4 sm:mb-0">{content.copyrightText[currentLang]}</p>
                    <div className="flex space-x-4">
                        {socialLinks.map(social => (
                            <a key={social.name} href={social.path} target="_blank" rel="noopener noreferrer"
                               className="text-gray-400 hover:text-white transition-colors text-xl"
                               aria-label={social.name}>{social.icon}</a>))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;