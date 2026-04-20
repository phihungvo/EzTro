export const CATEGORY_OPTIONS = [
    {value: 'HVAC', label: 'Điều hoa, thông gió'},
    {value: 'FURNITURE', label: 'Nội thất'},
    {value: 'APPLIANCE', label: 'Thiết bị điện'},
    {value: 'PLUMBING', label: 'Thiết bị nước'},
    {value: 'ELECTRONICS', label: 'Điện tử'},
    {value: 'OTHER', label: 'Khác'},
];

export const STATUS_OPTIONS = [
    {value: 'ACTIVE', label: 'Đang sử dụng'},
    {value: 'MAINTENANCE', label: 'Đang bảo trì'},
    {value: 'BROKEN', label: 'Hỏng hóc'},
    {value: 'STORED', label: 'Lưu kho'},
    {value: 'DISPOSED', label: 'Đã thanh lý'},
];

export const CONDITION_OPTIONS = [
    {value: 'EXCELLENT', label: 'Rất tốt'},
    {value: 'GOOD', label: 'Tốt'},
    {value: 'FAIR', label: 'Khá'},
    {value: 'POOR', label: 'Kém'},
];

export const INITIAL_FORM = {
    assetCode: '',
    assetName: '',
    category: 'FURNITURE',
    boardingHouseId: '',
    buildingId: '',
    roomId: '',
    specification: '',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    purchasePrice: '',
    warrantyMonths: '',
    installDate: '',
    status: '',
    condition: 'GOOD',
    lastMaintenanceDate: '',
    maintenanceCycle: '',
    depreciationRate: '',
    supplier: '',
    supplierPhone: '',
    notes: '',
    assignedTo: '',
    assignedDate: '',
};

export const CATEGORY_CODE_MAP = {
    HVAC: 'HV',
    FURNITURE: 'FU',
    APPLIANCE: 'AP',
    PLUMBING: 'PL',
    ELECTRONICS: 'EL',
    OTHER: 'OT',
};
