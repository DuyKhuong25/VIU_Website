// src/components/QuickLinks.jsx

import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import apiClient from '../services/api';

const QuickLinks = () => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;
    const [links, setLinks] = useState([]);

    useEffect(() => {
        const fetchQuickLinks = async () => {
            try {
                const response = await apiClient.get('/public/quick-links');
                setLinks(response.data);
            } catch (error) {
                console.error("Lỗi khi tải Quick Links:", error);
                setLinks([]);
            }
        };
        fetchQuickLinks();
    }, []);

    return (
        <div className="bg-gray-100 w-full py-3">
            <div className="w-full lg:w-3/4 mx-auto px-4">

                {/* Desktop View */}
                <div className="hidden md:grid grid-cols-4 lg:grid-cols-8 gap-2 text-center">
                    {links.map((item) => {
                        const translation = item.translations.find(t => t.languageCode === currentLang) || item.translations[0];
                        return (
                            <Link
                                key={item.id}
                                to={item.linkUrl}
                                target="_blank"
                                className="flex flex-col items-center justify-center p-1 bg-white rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group h-20"
                            >
                                <img
                                    src={item.iconUrl}
                                    alt={translation?.title}
                                    className="w-10 h-10 object-contain mb-3 rounded-md"
                                />
                                <span className="font-semibold text-[10px] text-gray-700 w-full truncate">
                                  {translation?.title}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile View */}
                <div className="md:hidden">
                    <Swiper slidesPerView={3.5} spaceBetween={16} className="w-full">
                        {links.map((item) => {
                            const translation = item.translations.find(t => t.languageCode === currentLang) || item.translations[0];
                            return (
                                <SwiperSlide key={item.id}>
                                    <Link
                                        to={item.linkUrl}
                                        target="_blank"
                                        className="flex flex-col items-center justify-start p-2 bg-white rounded-lg shadow-sm h-20 overflow-hidden"
                                    >
                                        <img
                                            src={item.iconUrl}
                                            alt={translation?.title}
                                            className="w-9 h-9 object-contain mb-3 rounded-md"
                                        />
                                        <div className="h-8 w-full flex items-start justify-center">
                                            <span className="font-semibold text-[8px] text-gray-700 text-center">
                                              {translation?.title}
                                            </span>
                                        </div>
                                    </Link>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                </div>

            </div>
        </div>
    );
};

export default QuickLinks;