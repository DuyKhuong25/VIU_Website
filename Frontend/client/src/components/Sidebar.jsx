// src/components/Sidebar.jsx
import React from 'react';
import AcademicProgramsWidget from './widgets/AcademicProgramsWidget';
import VideoWidget from './widgets/VideoWidget';
import AnnouncementsWidget from './widgets/AnnouncementsWidget';
import TagsWidget from "./widgets/TagsWidget.jsx";
import {useTranslation} from "react-i18next";

const Sidebar = ({ announcements, popularTags }) => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    let tagsToShow, tagsTitle;
    if(popularTags){
        tagsToShow = popularTags;
        tagsTitle = (currentLang === 'vi') ? 'Thẻ nổi bật' : 'Popular Tags';
    }
    return (
        <aside>
            <div className="hidden lg:block">
                <AnnouncementsWidget announcements={announcements} />
            </div>

            <AcademicProgramsWidget />
            <TagsWidget tags={tagsToShow} title={tagsTitle}/>
            <VideoWidget />
        </aside>
    );
};

export default Sidebar;