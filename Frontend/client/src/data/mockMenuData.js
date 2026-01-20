// src/data/mockMenuData.js

export const menuAPIData = [
    {
        "id": 1,
        "parentId": null,
        "showOnHomepage": true,
        "translations": [
            { "languageCode": "vi", "name": "Thông báo", "slug": "thong-bao" },
            { "languageCode": "en", "name": "Announcements", "slug": "announcements" }
        ],
        "children": []
    },
    {
        "id": 2,
        "parentId": null,
        "showOnHomepage": true,
        "translations": [
            { "languageCode": "vi", "name": "Sự kiện", "slug": "su-kien" },
            { "languageCode": "en", "name": "Events", "slug": "events" }
        ],
        "children": [
            {
                "id": 3,
                "parentId": 2,
                "translations": [
                    { "languageCode": "vi", "name": "Sự kiện sinh viên", "slug": "su-kien-sinh-vien" },
                    { "languageCode": "en", "name": "Student Events", "slug": "student-events" }
                ],
                "children": []
            },
            {
                "id": 4,
                "parentId": 2,
                "translations": [
                    { "languageCode": "vi", "name": "Hội thảo khoa học", "slug": "hoi-thao-khoa-hoc" },
                    { "languageCode": "en", "name": "Scientific Conference", "slug": "scientific-conference" }
                ],
                "children": [
                    {
                        "id": 6,
                        "parentId": 4,
                        "translations": [
                            { "languageCode": "vi", "name": "Hội thảo quốc tế", "slug": "hoi-thao-quoc-te" },
                            { "languageCode": "en", "name": "International Conference", "slug": "international-conference" }
                        ],
                        "children": []
                    }
                ]
            }
        ]
    },
    {
        "id": 5,
        "parentId": null,
        "showOnHomepage": true,
        "translations": [
            { "languageCode": "vi", "name": "Tuyển sinh", "slug": "tuyen-sinh" },
            { "languageCode": "en", "name": "Admissions", "slug": "admissions" }
        ],
        "children": []
    }
];