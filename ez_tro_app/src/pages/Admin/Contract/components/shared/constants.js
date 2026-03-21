export const PAYMENT_METHOD_OPTIONS = [
    { label: 'Tiền mặt',     value: 'CASH'          },
    { label: 'Chuyển khoản', value: 'BANK_TRANSFER'  },
    { label: 'MoMo',         value: 'MOMO'           },
    { label: 'ZaloPay',      value: 'ZALO_PAY'       },
];

export const INITIAL_STATE = {
    boardingHouseId:      '',
    roomId:               '',
    tenantFullName:       '',
    tenantPhoneNumber:    '',
    tenantEmail:          '',
    tenantPassword:       '',
    tenantIdentityNumber: '',
    tenantDateOfBirth:    '',
    tenantOccupation:     '',
    startDate:            '',
    endDate:              '',
    isOpenEnded:          false,
    rentPrice:            '',
    deposit:              '',
    depositMonths:        '2',
    depositReceivedAt:    '',
    depositPaymentMethod: '',
    paymentCycleMonths:   1,
    monthlyPaymentDay:    '',
    note:                 '',
};

export const DEFAULT_SERVICES = [
    { id: 1, name: 'Điện (đồng hồ riêng)',  unit: 'kWh',   price: 3500,   qty: 0, on: true,  byMeter: true  },
    { id: 2, name: 'Nước (đồng hồ riêng)', unit: 'm³',    price: 15000,  qty: 0, on: true,  byMeter: true  },
    { id: 3, name: 'Internet / Wifi',       unit: 'Tháng', price: 100000, qty: 1, on: true,  byMeter: false },
    { id: 4, name: 'Phí rác / vệ sinh',    unit: 'Tháng', price: 20000,  qty: 1, on: true,  byMeter: false },
    { id: 5, name: 'Phí gửi xe máy',       unit: 'Tháng', price: 100000, qty: 1, on: false, byMeter: false },
];

export const DEFAULT_CLAUSES = [
    { id: 1, selected: true,  text: 'Bên thuê thanh toán tiền thuê trước ngày mùng 5 hàng tháng. Quá hạn 7 ngày tính phạt trễ hạn 0.5%/ngày.' },
    { id: 2, selected: true,  text: 'Thông báo trước 30 ngày khi chấm dứt hợp đồng trước hạn. Vi phạm mất tiền cọc 1 tháng.' },
    { id: 3, selected: true,  text: 'Không được tự ý sửa chữa, cải tạo phòng khi chưa có sự đồng ý bằng văn bản của bên cho thuê.' },
    { id: 4, selected: true,  text: 'Không nuôi động vật trong phòng. Không sử dụng bếp gas, bếp than. Không tổ chức tụ tập ồn ào sau 22h.' },
    { id: 5, selected: false, text: 'Cho phép bên cho thuê kiểm tra phòng định kỳ 1 lần/tháng sau khi thông báo trước 24h.' },
    { id: 6, selected: true,  text: 'Bên thuê chịu trách nhiệm bồi thường thiệt hại tài sản do lỗi chủ quan trong quá trình sử dụng.' },
    { id: 7, selected: false, text: 'Phòng chỉ sử dụng cho mục đích ở, không được dùng làm văn phòng, kho hàng hoặc kinh doanh.' },
];

export const DEFAULT_ASSETS = [
    'Giường', 'Tủ quần áo', 'Bàn làm việc', 'Điều hòa',
    'Tủ lạnh', 'Máy giặt (riêng)', 'Nóng lạnh', 'WC riêng',
    'Ban công', 'Bếp riêng', 'Cửa sổ', 'TV',
];

export const DEFAULT_ASSETS_ACTIVE = new Set([
    'Giường', 'Tủ quần áo', 'Bàn làm việc', 'Điều hòa', 'Nóng lạnh', 'WC riêng', 'Cửa sổ',
]);

export const STEPS = [
    { label: 'Thông tin phòng' },
    { label: 'Khách thuê'      },
    { label: 'Tài chính'       },
    { label: 'Điều khoản'      },
    { label: 'Xác nhận'        },
];

/* ── Helpers ── */
export const resolveBasePath = (pathname) =>
    pathname.startsWith('/admin') ? '/admin/contracts' : '/owner/contracts';

export const formatVND = (n) =>
    n ? Number(n).toLocaleString('vi-VN') + 'đ' : '0đ';

let _nextId = 100;
export const nextId = () => ++_nextId;
