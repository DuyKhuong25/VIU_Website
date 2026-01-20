// src/data/mockAcademicProgramsData.js

export const academicProgramsData = [
    {
        id: '1',
        level: 'undergraduate', // Cấp độ: Đại học
        translations: [
            { languageCode: 'vi', name: 'Công nghệ thông tin' },
            { languageCode: 'en', name: 'Information Technology' }
        ],
        link: '/academics/cntt'
    },
    {
        id: '2',
        level: 'undergraduate',
        translations: [
            { languageCode: 'vi', name: 'Quản trị kinh doanh' },
            { languageCode: 'en', name: 'Business Administration' }
        ],
        link: '/academics/qtkd'
    },
    {
        id: '3',
        level: 'undergraduate',
        translations: [
            { languageCode: 'vi', name: 'Ngôn ngữ Anh' },
            { languageCode: 'en', name: 'English Language' }
        ],
        link: '/academics/nn'
    },
    {
        id: '4',
        level: 'graduate', // Cấp độ: Sau Đại học
        translations: [
            { languageCode: 'vi', name: 'Thạc sĩ Quản trị kinh doanh' },
            { languageCode: 'en', name: 'Master of Business Administration' }
        ],
        link: '/academics/mba'
    },
    {
        id: '5',
        level: 'associate', // Cấp độ: Liên kết
        translations: [
            { languageCode: 'vi', name: 'Liên kết với Đại học Anh Quốc' },
            { languageCode: 'en', name: 'Associate Program with UK University' }
        ],
        link: '/academics/uk-associate'
    },
];