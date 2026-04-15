export const MOCK_ROOMS = {
    "101": { tenant: "Trần Văn An",    phone: "0912 345 678", people: 3, contract: "HD-101-2025", months_left: 8,  rent: 3500000, elec_prev: 3842, water_prev: 1024, history: "ontime", floor: 1, status: "available" },
    "102": { tenant: "Nguyễn Thị Bích",phone: "0933 222 111", people: 2, contract: "HD-102-2025", months_left: 4,  rent: 3000000, elec_prev: 2210, water_prev: 876,  history: "ontime", floor: 1, status: "available" },
    "103": { tenant: "Lê Minh Tuấn",   phone: "0977 888 999", people: 1, contract: "HD-103-2024", months_left: 1,  rent: 2500000, elec_prev: 1500, water_prev: 543,  history: "late",   floor: 1, status: "invoiced"  },
    "201": { tenant: "Phạm Thanh Hoa", phone: "0901 777 333", people: 2, contract: "HD-201-2025", months_left: 10, rent: 4000000, elec_prev: 3100, water_prev: 1200, history: "ontime", floor: 2, status: "available" },
    "202": { tenant: null,             phone: null,           people: 0, contract: null,           months_left: 0,  rent: 0,       elec_prev: 0,    water_prev: 0,    history: null,    floor: 2, status: "empty"     },
    "203": { tenant: "Võ Đức Thịnh",   phone: "0988 111 444", people: 4, contract: "HD-203-2025", months_left: 6,  rent: 4500000, elec_prev: 4200, water_prev: 1800, history: "ontime", floor: 2, status: "available" },
    "301": { tenant: "Ngô Thị Lan",    phone: "0966 555 777", people: 2, contract: "HD-301-2026", months_left: 11, rent: 3200000, elec_prev: 1800, water_prev: 700,  history: "ontime", floor: 3, status: "available" },
    "302": { tenant: "Đặng Văn Khánh", phone: "0944 333 666", people: 3, contract: "HD-302-2025", months_left: 3,  rent: 3800000, elec_prev: 2900, water_prev: 1100, history: "late",   floor: 3, status: "invoiced"  },
    "303": { tenant: "Trịnh Thị Mai",  phone: "0911 222 888", people: 1, contract: "HD-303-2025", months_left: 7,  rent: 2800000, elec_prev: 1200, water_prev: 450,  history: "ontime", floor: 3, status: "available" },
};

export const SERVICES_CONFIG = {
    wifi:     { name: "Internet / WiFi",       price: 100000, icon: "📶" },
    parking:  { name: "Gửi xe máy",            price: 100000, icon: "🛵" },
    cleaning: { name: "Vệ sinh phòng",         price: 150000, icon: "🧹" },
    cable:    { name: "Truyền hình cáp",       price: 80000,  icon: "📺" },
    trash:    { name: "Phí vệ sinh MT",        price: 30000,  icon: "🗑️" },
    elevator: { name: "Phí thang máy",         price: 50000,  icon: "🛗" },
};

export const PAYMENT_METHODS = [
    { key: "cash",  icon: "💵", label: "Tiền mặt"       },
    { key: "bank",  icon: "🏦", label: "Chuyển khoản"   },
    { key: "momo",  icon: "🩷", label: "Momo / Zalo"    },
];

export function fmt(n) {
    return Math.round(n || 0).toLocaleString("vi-VN");
}
export const PAYMENT_HISTORY = [
    {ok: true, period: "2/2026", date: "03/02", desc: "Tiền phòng + điện + nước", amount: 4250000},
    {ok: true, period: "1/2026", date: "05/01", desc: "Tiền phòng + điện + nước", amount: 4100000},
    {ok: false, period: "12/2025", date: "Quá hạn 5 ngày", desc: "Tiền phòng + điện + nước + phí trễ", amount: 4350000},
];
