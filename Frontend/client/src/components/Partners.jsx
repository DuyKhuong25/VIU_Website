// src/components/Partners.jsx
import React, {useEffect, useState} from 'react';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectCoverflow } from 'swiper/modules';

import apiClient from '../services/api';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Partners = () => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    const [partners, setPartners] = useState([]);

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const response = await apiClient.get(`/public/partners`);
                setPartners([...response.data, ...response.data]);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu đối tác:", error);
            }
        };
        fetchPartners();
    }, []);

    if (partners.length === 0) {
        return null;
    }

    return (
        <div className="bg-gray-50 w-full py-12">
            <div className="w-full lg:w-3/4 mx-auto px-4 relative">
                <div className="flex items-center mb-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <h2 className="px-4 text-center text-xl md:text-2xl font-bold text-gray-700 uppercase">{currentLang === "vi" ? "Đối tác liên kết" : "Our Partners"}</h2>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <Swiper
                    modules={[Autoplay, Pagination, Navigation, EffectCoverflow]}
                    effect={'coverflow'}
                    coverflowEffect={{
                        rotate: 0,
                        stretch: 0,
                        depth: 100,
                        modifier: 1,
                        scale: 0.8,
                        slideShadows: false,
                    }}
                    loop={true}
                    centeredSlides={true}
                    slidesPerView={3}
                    navigation={{
                        nextEl: '.swiper-button-next-custom',
                        prevEl: '.swiper-button-prev-custom',
                    }}

                    // Kích hoạt lại dynamicBullets
                    pagination={{
                        clickable: true,
                        dynamicBullets: true,
                    }}

                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    breakpoints={{
                        1024: { slidesPerView: 5 },
                    }}
                    className="!py-8"
                >
                    {partners.map((partner, index) => {
                        const translation = partner.translations.find(t => t.languageCode === currentLang) || partner.translations[0];
                        if (!translation) return null;
                        return (
                            <SwiperSlide key={`${partner.id}-${index}`}>
                                <a
                                    href={partner.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center gap-4 group"
                                >
                                    <div className="h-24 w-full flex items-center justify-center">
                                        <img
                                            src={partner.logoUrl}
                                            alt={translation.name}
                                            className="max-h-20 max-w-full object-contain transition-all duration-300"
                                        />
                                    </div>
                                    <span className="font-semibold text-[12px] text-gray-600 text-center group-hover:text-[var(--brand-blue)] transition-colors duration-300">
                                        {translation.title}
                                    </span>
                                </a>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>

                <div className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 rounded-full shadow-md cursor-pointer hover:bg-white transition-colors">
                    <FaChevronLeft className="text-xl text-[var(--brand-blue)]" />
                </div>
                <div className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 rounded-full shadow-md cursor-pointer hover:bg-white transition-colors">
                    <FaChevronRight className="text-xl text-[var(--brand-blue)]" />
                </div>
            </div>
        </div>
    );
};

export default Partners;