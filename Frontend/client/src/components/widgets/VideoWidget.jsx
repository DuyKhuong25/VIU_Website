// src/components/widgets/VideoWidget.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';


const VideoWidget = () => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h3 className="text-xl md:text-[14px] font-bold text-gray-800 border-l-4 border-[var(--brand-blue)] pl-3 mb-4 uppercase">
                {currentLang === 'vi' ? 'Video giới thiệu' : 'Introduction Video'}
            </h3>
            <div className="aspect-video">
                <iframe
                    className="w-full h-full rounded-md"
                    src="https://www.youtube.com/embed/-KY5bW5xigM"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen>
                </iframe>
            </div>
        </div>
    );
};

export default VideoWidget;