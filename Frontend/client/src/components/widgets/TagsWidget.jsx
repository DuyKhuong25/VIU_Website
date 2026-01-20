// src/components/widgets/TagsWidget.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PATHS } from '../../routesConfig';
import { FaTag } from 'react-icons/fa';

const TagsWidget = ({ tags, title }) => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;
    const localizedTagPath = PATHS.tag[currentLang] || PATHS.tag.en;

    if (!tags || tags.length === 0) {
        return null;
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h3 className="text-xl md:text-[14px] font-bold text-gray-800 border-l-4 border-amber-400 pl-3 mb-4 uppercase">
                {title}
            </h3>
            <div className="flex flex-wrap gap-2">
                {tags.map(tag => {
                    let tagName, tagSlug;

                    if (tag.translations) {
                        const translation = tag.translations.find(t => t.languageCode === currentLang) || tag.translations[0];
                        if (!translation) return null;
                        tagName = translation.name;
                        tagSlug = translation.slug;
                    } else {
                        tagName = tag.name;
                        tagSlug = tag.slug;
                    }

                    if (!tagName || !tagSlug) return null;

                    return (
                        <Link
                            key={tag.id}
                            to={`/${localizedTagPath}/${tagSlug}`}
                            className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 text-[12px] font-semibold px-3 py-1 rounded-full transition-colors"
                        >
                            <FaTag size={12} className="mr-2 text-gray-500" />
                            {tagName}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default TagsWidget;