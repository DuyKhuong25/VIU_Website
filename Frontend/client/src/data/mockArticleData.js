// src/data/mockArticleData.js

export const articleData = [
    {
        id: 101,
        isFeatured: true,
        thumbnailUrl: 'https://picsum.photos/800/600?random=11',
        publishedAt: '2025-09-11',
        category: {
            id: 2,
            translations: [
                { languageCode: 'vi', name: 'Sự kiện', slug: 'su-kien' },
                { languageCode: 'en', name: 'Events', slug: 'events' },
            ],
        },
        translations: [
            {
                languageCode: 'vi',
                title: 'Hội nghị Khoa học Sinh viên Toàn quốc lần thứ X',
                excerpt: 'Một sân chơi học thuật đỉnh cao, nơi các tài năng trẻ trình bày những nghiên cứu đột phá của mình.',
                slug: 'hoi-nghi-khoa-hoc-sinh-vien-lan-x',
            },
            {
                languageCode: 'en',
                title: 'The 10th National Student Scientific Conference',
                excerpt: 'A premier academic playground for young talents to present their breakthrough research.',
                slug: 'the-10th-national-student-scientific-conference',
            },
        ],
    },
    {
        id: 102,
        isFeatured: true,
        thumbnailUrl: 'https://picsum.photos/800/600?random=12',
        publishedAt: '2025-09-10',
        category: {
            id: 1,
            translations: [
                { languageCode: 'vi', name: 'Thông báo', slug: 'thong-bao' },
                { languageCode: 'en', name: 'Announcements', slug: 'announcements' },
            ],
        },
        translations: [
            {
                languageCode: 'vi',
                title: 'Thông báo về lịch nghỉ lễ Quốc Khánh 2/9',
                excerpt: 'Toàn thể cán bộ, giảng viên và sinh viên sẽ được nghỉ lễ theo quy định của nhà nước.',
                slug: 'thong-bao-lich-nghi-le-quoc-khanh',
            },
            {
                languageCode: 'en',
                title: 'Announcement on National Day Holiday Schedule',
                excerpt: 'All staff, lecturers, and students will have a day off in accordance with state regulations.',
                slug: 'announcement-national-day-holiday-schedule',
            },
        ],
    },
    {
        id: 103,
        isFeatured: true,
        thumbnailUrl: 'https://picsum.photos/800/600?random=13',
        publishedAt: '2025-09-09',
        category: {
            id: 5,
            translations: [
                { languageCode: 'vi', name: 'Tuyển sinh', slug: 'tuyen-sinh' },
                { languageCode: 'en', name: 'Admissions', slug: 'admissions' },
            ],
        },
        translations: [
            {
                languageCode: 'vi',
                title: 'Chính thức mở cổng đăng ký xét tuyển đợt 2',
                excerpt: 'Trường thông báo tiếp tục nhận hồ sơ xét tuyển đợt 2 cho các ngành còn chỉ tiêu.',
                slug: 'chinh-thuc-mo-cong-dang-ky-xet-tuyen-dot-2',
            },
            {
                languageCode: 'en',
                title: 'Official Opening of the Second Round of Admissions Registration',
                excerpt: 'The university announces the continued acceptance of applications for the second round of admissions.',
                slug: 'official-opening-second-round-admissions',
            },
        ],
    },
    {
        id: 104,
        isFeatured: true,
        thumbnailUrl: 'https://picsum.photos/800/600?random=14',
        publishedAt: '2025-09-08',
        category: {
            id: 3,
            translations: [
                { languageCode: 'vi', name: 'Đào tạo', slug: 'dao-tao' },
                { languageCode: 'en', name: 'Academics', slug: 'academics' },
            ],
        },
        translations: [
            { languageCode: 'vi', title: 'Bảo vệ thành công luận văn thạc sĩ đợt 1', excerpt: '15 học viên cao học đã bảo vệ thành công luận văn của mình trước hội đồng.', slug: 'bao-ve-luan-van-thac-si-dot-1' },
            { languageCode: 'en', title: 'Successful Defense of Master\'s Theses in Round 1', excerpt: '15 graduate students successfully defended their theses before the council.', slug: 'successful-defense-masters-theses-round-1' },
        ],
    },
    {
        id: 105,
        isFeatured: true,
        thumbnailUrl: 'https://picsum.photos/800/600?random=15',
        publishedAt: '2025-09-07',
        category: {
            id: 6,
            translations: [
                { languageCode: 'vi', name: 'Sự kiện', slug: 'su-kien' },
                { languageCode: 'en', name: 'Events', slug: 'events' },
            ],
        },
        translations: [
            { languageCode: 'vi', title: 'Ngày hội việc làm 2025: Kết nối doanh nghiệp và sinh viên', excerpt: 'Hơn 50 doanh nghiệp hàng đầu đã tham gia tuyển dụng trực tiếp tại sân trường.', slug: 'ngay-hoi-viec-lam-2025' },
            { languageCode: 'en', title: 'Job Fair 2025: Connecting Businesses and Students', excerpt: 'Over 50 leading enterprises participated in direct recruitment on campus.', slug: 'job-fair-2025' },
        ],
    },

    {
        id: 105,
        isFeatured: true,
        thumbnailUrl: 'https://picsum.photos/800/600?random=12',
        publishedAt: '2025-09-10',
        category: {
            id: 1,
            translations: [
                { languageCode: 'vi', name: 'Thông báo', slug: 'thong-bao' },
                { languageCode: 'en', name: 'Announcements', slug: 'announcements' },
            ],
        },
        translations: [
            {
                languageCode: 'vi',
                title: 'Thông báo về lịch khai giảng năm học 2025-2026',
                excerpt: 'Toàn thể cán bộ, giảng viên và sinh viên sẽ quay trở lại trường vào ngày 15/9.',
                slug: 'thong-bao-lich-khai-giang-2025-2026',
            },
            {
                languageCode: 'en',
                title: 'Announcement on National Day Holiday Schedule',
                excerpt: 'All staff, lecturers, and students will have a day off in accordance with state regulations.',
                slug: 'announcement-national-day-holiday-schedule',
            },
        ],
    },
];