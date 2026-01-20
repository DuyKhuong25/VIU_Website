import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Import Component Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

// Import CSS Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import apiClient from '../services/api';

const Slider = () => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    const [slides, setSlides] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                setIsLoading(true);
                const response = await apiClient.get('/public/slides/active');
                setSlides(response.data);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu slider:", error);
                setSlides([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSlides();
    }, []);

    if (isLoading) {
        return (
            <div className="w-full h-[40vh] sm:h-[60vh] lg:h-[65vh] bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Đang tải slider...</span>
            </div>
        );
    }

    if (slides.length === 0) {
        return null;
    }

    return (
        <div className="w-full">
            <Swiper
                modules={[Navigation, Pagination, Autoplay, EffectFade]}
                spaceBetween={30}
                slidesPerView={1}
                loop={true}
                effect="fade"
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                }}
                navigation={true}
                pagination={false}
                className="w-full h-[40vh] sm:h-[60vh] lg:h-[65vh]"
            >
                {slides.map((slide, index) => {
                    const translation = slide.translations.find(t => t.languageCode === currentLang)
                        || slide.translations[0];

                    const linkDestination = translation.linkUrl;
                    const isInternalLink = linkDestination && linkDestination.startsWith('/');

                    return (
                        <SwiperSlide key={slide.id}>
                            <div className="w-full h-full relative">

                                <div className="absolute inset-0 z-0">
                                    <img
                                        src={slide.imageUrl}
                                        alt=""
                                        className="w-full h-full object-cover blur-xl opacity-60 scale-110"
                                    />
                                </div>

                                <img
                                    src={slide.imageUrl}
                                    alt={translation.title || 'Slide background'}
                                    className="absolute inset-0 w-full h-full object-contain z-10"
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                />

                                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-3 z-10
                                                bg-black/80
                                                flex items-center justify-between">

                                    <div className="text-white flex-1 min-w-0">
                                        <h1 className="text-[14px] md:text-1xl font-bold drop-shadow-lg leading-tight truncate">
                                            {translation.title}
                                        </h1>

                                        <p className="mt-1 text-xs md:text-sm max-w-2xl drop-shadow-md truncate">
                                            {translation.description}
                                        </p>
                                    </div>

                                    <div className="ml-4 flex-shrink-0">
                                        {linkDestination && (
                                            isInternalLink ? (
                                                <Link
                                                    to={linkDestination}
                                                    className="inline-flex items-center justify-center bg-[var(--brand-blue)] text-white font-semibold rounded-full hover:bg-amber-400 transition-colors duration-300
                                                            h-10 w-10 text-lg
                                                            lg:h-auto lg:w-auto lg:px-5 lg:py-2 lg:text-xs"
                                                >
                                                    <span className="hidden lg:inline">
                                                        {currentLang === 'vi' ? 'Xem chi tiết' : 'View Details'}
                                                    </span>

                                                    <span className="inline lg:hidden">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                             viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"
                                                             className="w-5 h-5">
                                                          <path strokeLinecap="round" strokeLinejoin="round"
                                                                d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
                                                        </svg>
                                                    </span>
                                                </Link>
                                            ) : (
                                                <a
                                                    href={linkDestination}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center bg-[var(--brand-blue)] text-white font-semibold rounded-full hover:bg-amber-400 transition-colors duration-300
                                                            h-10 w-10 text-lg
                                                            lg:h-auto lg:w-auto lg:px-5 lg:py-2 lg:text-xs"
                                                >
                                                    <span className="hidden lg:inline">
                                                        {currentLang === 'vi' ? 'Xem chi tiết' : 'View Details'}
                                                    </span>

                                                    <span className="inline lg:hidden">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                             viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"
                                                             className="w-5 h-5">
                                                          <path strokeLinecap="round" strokeLinejoin="round"
                                                                d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
                                                        </svg>
                                                    </span>
                                                </a>
                                            )
                                        )}
                                    </div>

                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
};

export default Slider;