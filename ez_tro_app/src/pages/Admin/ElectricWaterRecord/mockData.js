import dayjs from 'dayjs';

export const electricPrice = 3500; // VND per kWh
export const waterPrice = 15000; // VND per m³

export const mockPeriods = [
    {
        id: 1,
        name: 'Tháng 11/2024',
        startDate: '2024-11-01',
        endDate: '2024-11-30',
        status: 'ACTIVE',
        totalRooms: 25,
        recordedRooms: 0,
        description: 'Kỳ ghi điện nước tháng 11/2024',
    },
    {
        id: 2,
        name: 'Tháng 10/2024',
        startDate: '2024-10-01',
        endDate: '2024-10-31',
        status: 'COMPLETED',
        totalRooms: 25,
        recordedRooms: 25,
        description: 'Kỳ ghi điện nước tháng 10/2024 - Đã hoàn thành',
    },
    {
        id: 3,
        name: 'Tháng 12/2024',
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        status: 'PENDING',
        totalRooms: 25,
        recordedRooms: 0,
        description: 'Kỳ ghi điện nước tháng 12/2024 - Chưa mở',
    },
];

export const mockRooms = [
    {
        id: 1,
        roomNumber: '101',
        building: 'Toà A',
        boardingHouse: 'Nhà trọ Sunshine',
        tenantName: 'Nguyễn Văn A',
        lastElectricIndex: 1250,
        lastWaterIndex: 45,
        status: 'OCCUPIED',
    },
    {
        id: 2,
        roomNumber: '102',
        building: 'Toà A',
        boardingHouse: 'Nhà trọ Sunshine',
        tenantName: 'Trần Thị B',
        lastElectricIndex: 980,
        lastWaterIndex: 38,
        status: 'OCCUPIED',
    },
    {
        id: 3,
        roomNumber: '103',
        building: 'Toà A',
        boardingHouse: 'Nhà trọ Sunshine',
        tenantName: null,
        lastElectricIndex: 0,
        lastWaterIndex: 0,
        status: 'VACANT',
    },
    {
        id: 4,
        roomNumber: '201',
        building: 'Toà B',
        boardingHouse: 'Nhà trọ Green Park',
        tenantName: 'Lê Văn C',
        lastElectricIndex: 1500,
        lastWaterIndex: 52,
        status: 'OCCUPIED',
    },
    {
        id: 5,
        roomNumber: '202',
        building: 'Toà B',
        boardingHouse: 'Nhà trọ Green Park',
        tenantName: 'Phạm Thị D',
        lastElectricIndex: 1100,
        lastWaterIndex: 42,
        status: 'OCCUPIED',
    },
    {
        id: 6,
        roomNumber: '301',
        building: 'Toà C',
        boardingHouse: 'Nhà trọ Sky View',
        tenantName: 'Hoàng Văn E',
        lastElectricIndex: 1350,
        lastWaterIndex: 48,
        status: 'OCCUPIED',
    },
    // Add more rooms...
    ...Array.from({length: 19}, (_, i) => ({
        id: 7 + i,
        roomNumber: `${Math.floor((i + 7) / 10) + 1}0${((i + 7) % 10) + 1}`,
        building: ['Toà A', 'Toà B', 'Toà C'][i % 3],
        boardingHouse: ['Nhà trọ Sunshine', 'Nhà trọ Green Park', 'Nhà trọ Sky View'][i % 3],
        tenantName: i % 4 === 0 ? null : `Người thuê ${i + 7}`,
        lastElectricIndex: Math.floor(Math.random() * 1000) + 500,
        lastWaterIndex: Math.floor(Math.random() * 30) + 20,
        status: i % 4 === 0 ? 'VACANT' : 'OCCUPIED',
    })),
];

export const mockRecords = [];