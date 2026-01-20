// src/components/ArticleSidebar.jsx
import React from 'react';
import AnnouncementsWidget from './widgets/AnnouncementsWidget';
import RelatedArticlesWidget from './widgets/RelatedArticlesWidget';
import TagsWidget from './widgets/TagsWidget';
import { useTranslation } from 'react-i18next';

const ArticleSidebar = ({ announcements, relatedArticles, tags, mainCategory }) => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    let tagsToShow, tagsTitle;

    if (tags) {
        tagsToShow = tags;
        tagsTitle = (currentLang === 'vi') ? 'Thẻ bài viết' : 'Article Tags';
    }

    return (
        <aside>
            <AnnouncementsWidget announcements={announcements} />
            {relatedArticles && <RelatedArticlesWidget articles={relatedArticles} category={mainCategory} />}
            <TagsWidget tags={tagsToShow} title={tagsTitle} />
        </aside>
    );
};

export default ArticleSidebar;