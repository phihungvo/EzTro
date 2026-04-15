export const STEPS = [
    {label: 'Vi tri phong'},
    {label: 'Gia va van hanh'},
    {label: 'Tien ich'},
    {label: 'Ra soat'},
];

export const INITIAL_STATE = {
    boardingHouseId: '',
    buildingId: '',
    roomNumber: '',
    area: '',
    price: '',
    status: 'AVAILABLE',
    note: '',
    utilityIds: [],
    floorNumber: '',
    maxOccupants: '2',
    hasAirConditioner: false,
    hasBathroom: true,
    hasKitchen: true,
};

export const STATUS_OPTIONS = [
    {
        value: 'AVAILABLE',
        label: 'Sẵn sàng cho thuê',
        desc: 'Phòng có thể đưa vào hợp đồng ngay.',
        tone: 'teal',
    },
    {
        value: 'MAINTENANCE',
        label: 'Đang chuẩn bị',
        desc: 'Tạm khóa phòng trong quá trình setup hoặc bảo trì.',
        tone: 'amber',
    },
];

export const FEATURE_FIELDS = [
    {
        "key": "hasAirConditioner",
        "icon": "❄️",
        "title": "Điều hòa",
        "desc": "Đã lắp sẵn, phù hợp phòng cho thuê trung và cao cấp.",
        "tone": "sky"
    },
    {
        "key": "hasBathroom",
        "icon": "🚿",
        "title": "Phòng tắm riêng",
        "desc": "Có khu vệ sinh riêng cho từng phòng.",
        "tone": "violet"
    },
    {
        "key": "hasKitchen",
        "icon": "🍳",
        "title": "Khu bếp",
        "desc": "Có thể nấu nướng hoặc sơ chế trong phòng.",
        "tone": "coral"
    }
];
