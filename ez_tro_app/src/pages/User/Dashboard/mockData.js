export const MOCK_TENANT_ROOM = {
    roomNumber: '302',
    buildingName: 'A1',
    boardingHouseName: 'NestHome Central',
    floor: 3,
    area: 28,
    price: 4200000,
    status: 'Đang Ở',
};

export const MOCK_TENANT_CONTRACT = {
    contractCode: 'CTR-2026-00302',
    startDate: '2025-09-01',
    endDate: '2026-08-31',
    isLiving: true,
    autoRenew: true,
    rentPrice: 4200000,
    deposit: 5000000,
    roomName: '302',
    floorNumber: 3,
    boardingHouseName: 'NestHome Central',
    boardingHouseAddress: '12 Nguyễn Văn Linh, Q.7, TP.HCM',
    area: 28,
};

export const MOCK_TENANT_SUMMARY = {
    roomNumber: '302',
    monthlyRent: 4200000,
    paymentStatus: 'Chưa thanh toán',
    unpaidBillCount: 2,
    latestBillDueDate: '2026-04-30',
    contractStartDate: '2025-09-01',
    contractEndDate: '2026-08-31',
    outstandingAmount: 2380000,
};

export const MOCK_TENANT_BILLS = [
    {
        id: 1,
        billCode: 'BILL-0401',
        billTitle: 'Tiền thuê tháng 04/2026',
        status: 'UNPAID',
        amount: 4200000,
        outstandingAmount: 4200000,
        dueDate: '2026-04-30',
    },
    {
        id: 2,
        billCode: 'BILL-0301',
        billTitle: 'Điện nước tháng 03/2026',
        status: 'PARTIALLY_PAID',
        amount: 680000,
        outstandingAmount: 380000,
        dueDate: '2026-04-15',
    },
    {
        id: 3,
        billCode: 'BILL-0201',
        billTitle: 'Tiền thuê tháng 02/2026',
        status: 'PAID',
        amount: 4200000,
        outstandingAmount: 0,
        dueDate: '2026-02-28',
    },
];

export const MOCK_TENANT_INCIDENTS = [
    {
        id: 101,
        title: 'Ổ điện khu bếp bị lỏng',
        description: 'Ổ điện bên phải khu bếp có hiện tượng chập chờn khi cắm thiết bị công suất lớn.',
        status: 'PENDING',
        createdAt: '2026-04-08T09:30:00Z',
    },
    {
        id: 102,
        title: 'Thay đèn hành lang',
        description: 'Đèn hành lang tầng 3 đã được kiểm tra và thay mới.',
        status: 'RESOLVED',
        createdAt: '2026-03-25T14:00:00Z',
    },
];

export const MOCK_TENANT_NOTICES = [
    {
        id: 201,
        title: 'Lịch thu tiền điện nước',
        message: 'Từ ngày 10 đến 15 hàng tháng, vui lòng hoàn thành thanh toán đúng hạn.',
        category: 'Hóa đơn',
        createdAt: '2026-04-05T10:00:00Z',
    },
    {
        id: 202,
        title: 'Bảo trì thang máy',
        message: 'Thang máy sẽ bảo trì định kỳ vào sáng Chủ nhật tuần này.',
        category: 'Bảo trì',
        createdAt: '2026-04-03T07:15:00Z',
    },
    {
        id: 203,
        title: 'Cập nhật chính sách an ninh',
        message: 'Cửa cổng sẽ đóng từ 23:00, vui lòng mang thẻ từ khi ra vào.',
        category: 'Thông báo',
        createdAt: '2026-04-01T08:20:00Z',
    },
];

export const MOCK_TENANT_UTILITIES = {
    currentPeriod: [
        {
            utilityName: 'Điện',
            utilityUnit: 'kWh',
            consumption: 236,
            amount: 590000,
        },
        {
            utilityName: 'Nước',
            utilityUnit: 'm3',
            consumption: 13,
            amount: 156000,
        },
        {
            utilityName: 'Internet',
            utilityUnit: 'gói',
            consumption: 1,
            amount: 250000,
        },
    ],
    history: [
        { periodMonth: 11, periodYear: 2025, utilityName: 'Điện', utilityUnit: 'kWh', consumption: 211, amount: 530000, previousIndex: 1500, currentIndex: 1711, unitPrice: 2512 },
        { periodMonth: 12, periodYear: 2025, utilityName: 'Điện', utilityUnit: 'kWh', consumption: 226, amount: 568000, previousIndex: 1711, currentIndex: 1937, unitPrice: 2513 },
        { periodMonth: 1, periodYear: 2026, utilityName: 'Điện', utilityUnit: 'kWh', consumption: 240, amount: 602000, previousIndex: 1937, currentIndex: 2177, unitPrice: 2508 },
        { periodMonth: 2, periodYear: 2026, utilityName: 'Điện', utilityUnit: 'kWh', consumption: 232, amount: 583000, previousIndex: 2177, currentIndex: 2409, unitPrice: 2512 },
        { periodMonth: 3, periodYear: 2026, utilityName: 'Điện', utilityUnit: 'kWh', consumption: 228, amount: 571000, previousIndex: 2409, currentIndex: 2637, unitPrice: 2504 },
        { periodMonth: 4, periodYear: 2026, utilityName: 'Điện', utilityUnit: 'kWh', consumption: 236, amount: 590000, previousIndex: 2637, currentIndex: 2873, unitPrice: 2500 },
        { periodMonth: 11, periodYear: 2025, utilityName: 'Nước', utilityUnit: 'm3', consumption: 12, amount: 132000, previousIndex: 40, currentIndex: 52, unitPrice: 11000 },
        { periodMonth: 12, periodYear: 2025, utilityName: 'Nước', utilityUnit: 'm3', consumption: 11, amount: 121000, previousIndex: 52, currentIndex: 63, unitPrice: 11000 },
        { periodMonth: 1, periodYear: 2026, utilityName: 'Nước', utilityUnit: 'm3', consumption: 12, amount: 132000, previousIndex: 63, currentIndex: 75, unitPrice: 11000 },
        { periodMonth: 2, periodYear: 2026, utilityName: 'Nước', utilityUnit: 'm3', consumption: 13, amount: 143000, previousIndex: 75, currentIndex: 88, unitPrice: 11000 },
        { periodMonth: 3, periodYear: 2026, utilityName: 'Nước', utilityUnit: 'm3', consumption: 12, amount: 132000, previousIndex: 88, currentIndex: 100, unitPrice: 11000 },
        { periodMonth: 4, periodYear: 2026, utilityName: 'Nước', utilityUnit: 'm3', consumption: 13, amount: 156000, previousIndex: 100, currentIndex: 113, unitPrice: 12000 },
    ],
};

export const MOCK_MONTHLY_SPENDING = [
    { month: '11/2025', amount: 2480000 },
    { month: '12/2025', amount: 2160000 },
    { month: '01/2026', amount: 2980000 },
    { month: '02/2026', amount: 1850000 },
    { month: '03/2026', amount: 3620000 },
    { month: '04/2026', amount: 2730000 },
];

