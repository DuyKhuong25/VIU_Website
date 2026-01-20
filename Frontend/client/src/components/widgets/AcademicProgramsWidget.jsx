// src/components/widgets/AcademicProgramsWidget.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaChevronDown, FaGraduationCap, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import apiClient from '../../services/api';

// 1. IMPORT SWIPER VÀ CÁC MODULE CẦN THIẾT
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const MajorAccordion = ({ major, currentLang }) => {
    const [isOpen, setIsOpen] = useState(false);

    const majorName = major.name;
    const hasSpecializations = major.specializations && major.specializations.length > 0;

    return (
        <div className="border-b last:border-b-0 border-gray-200">
            <button
                onClick={() => hasSpecializations && setIsOpen(!isOpen)}
                className={`group flex items-center justify-between w-full text-gray-700 p-3 transition-all duration-300
                            ${hasSpecializations ? 'hover:bg-sky-50' : 'cursor-default'}`
                }
                disabled={!hasSpecializations}
            >
                <div className="flex items-center">
                    <FaGraduationCap className="mr-2 text-gray-400 group-hover:text-[var(--brand-blue)] transition-colors" />
                    <span className={`font-medium text-[13px] text-left ${hasSpecializations ? 'group-hover:text-[var(--brand-blue)]' : ''}`}>
                        {majorName}
                    </span>
                </div>
                {hasSpecializations && (
                    <FaChevronDown size={10} className={`opacity-50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}/>
                )}
            </button>

            {hasSpecializations && isOpen && (
                <div className="pl-8 pr-3 pb-3">
                    <ul className="space-y-2 pt-1">
                        {major.specializations.map(spec => (
                            <li key={spec.id} className="flex items-center text-[12px] text-gray-600">
                                <FaChevronRight size={8} className="mr-1 text-amber-500 flex-shrink-0" />
                                <span>{spec.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// --- Component chính của Widget ---
const AcademicProgramsWidget = () => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    const [activeTabId, setActiveTabId] = useState(null);
    const [programLevels, setProgramLevels] = useState([]);
    const [allMajors, setAllMajors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [swiperInstance, setSwiperInstance] = useState(null);
    const [hasBeenClicked, setHasBeenClicked] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const levelsPromise = apiClient.get(`/public/program-levels/${currentLang}`);
                const majorsPromise = apiClient.get(`/public/majors/${currentLang}`);

                const [levelsRes, majorsRes] = await Promise.all([levelsPromise, majorsPromise]);

                setProgramLevels(levelsRes.data);
                setAllMajors(majorsRes.data);

                if (levelsRes.data.length > 0) {
                    setActiveTabId(levelsRes.data[0].id);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu ngành đào tạo:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [currentLang]);

    const filteredMajors = useMemo(() => {
        if (!activeTabId) return [];
        return allMajors.filter(major => major.programLevel && major.programLevel.id === activeTabId);
    }, [activeTabId, allMajors]);

    const handleTabClick = (tabId, index) => {
        setActiveTabId(tabId);

        if (!hasBeenClicked) {
            setHasBeenClicked(true);
        }

        if (swiperInstance) {
            swiperInstance.slideTo(index);
        }
    };

    if (isLoading) {
        return <div className="bg-white p-4 rounded-lg shadow-md mb-6">Đang tải...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
            <h3 className="text-xl md:text-[14px] uppercase font-bold text-gray-800 border-l-4 border-[var(--brand-blue)] pl-3 p-4">
                {currentLang === 'vi' ? 'Chương trình đào tạo' : 'Academic Programs'}
            </h3>

            <div className="border-b border-gray-200 flex items-center">
                <button className="academic-tabs-prev p-3 text-gray-400 hover:text-[var(--brand-blue)] hidden md:block transition-all duration-300">
                    <FaChevronLeft size={14} />
                </button>

                <div className="flex-1 overflow-hidden">
                    <Swiper
                        modules={[Navigation]}
                        slidesPerView={'auto'}
                        spaceBetween={16}
                        centeredSlides={hasBeenClicked}
                        centeredSlidesBounds={hasBeenClicked}
                        slideToClickedSlide={true}
                        loop={false}
                        navigation={{
                            nextEl: '.academic-tabs-next',
                            prevEl: '.academic-tabs-prev',
                        }}
                        onSwiper={setSwiperInstance}
                        className="!py-1"
                    >
                        {programLevels.map((level, index) => (
                            <SwiperSlide key={level.id} className="!w-auto">
                                <button
                                    onClick={() => handleTabClick(level.id, index)}
                                    className={`flex-shrink-0 whitespace-nowrap py-2 px-3 text-[13px] font-semibold transition-colors duration-300
                                        ${activeTabId === level.id
                                        ? 'border-b-2 border-amber-400 text-[var(--brand-blue)]'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`
                                    }
                                >
                                    {level.name}
                                </button>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                <button className="academic-tabs-next p-3 text-gray-400 hover:text-[var(--brand-blue)] hidden md:block transition-all duration-300">
                    <FaChevronRight size={14} />
                </button>
            </div>

            <ul className="p-2">
                {filteredMajors.length > 0 ? (
                    filteredMajors.map(major => (
                        <MajorAccordion key={major.id} major={major} currentLang={currentLang} />
                    ))
                ) : (
                    <li className="text-center text-gray-500 text-[12px] py-4"> {currentLang === "vi" ? "Không có ngành học nào" : "Empty Majors"} </li>
                )}
            </ul>
        </div>
    );
};

export default AcademicProgramsWidget;