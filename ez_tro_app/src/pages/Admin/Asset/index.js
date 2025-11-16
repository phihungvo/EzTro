// src/pages/Admin/Asset/Asset.jsx
import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Asset.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
import AssetCard from '~/components/Layout/AdminLayout/components/AssetCard';
import {
    PlusOutlined,
    CloudUploadOutlined,
    EyeOutlined,
    TableOutlined,
    AppstoreOutlined,
    ToolOutlined,
    HistoryOutlined,
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    BarcodeOutlined,
} from '@ant-design/icons';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import PopupModal from '~/components/Layout/AdminLayout/components/PopupModal';
import FilterComponent from '~/components/Layout/AdminLayout/components/FilterComponent';
import { Form, message, Row, Col, Pagination, Segmented, Tag, Card, Statistic, Input, Select, InputNumber, DatePicker, Timeline, Tabs } from 'antd';
import dayjs from 'dayjs';
import useDebounce from '~/hooks/useDebounce';

const cx = classNames.bind(styles);

// Mock data - Tài sản theo phòng với lịch sử đầy đủ
const mockAssets = [
    {
        id: 1,
        assetCode: 'TS-A101-001',
        assetName: 'Điều hòa 2 chiều Daikin',
        category: 'HVAC',
        specification: '12000 BTU, Inverter',
        brand: 'Daikin',
        model: 'FTKC35UAVMV',
        serialNumber: 'DK2024001234',
        boardingHouseName: 'Nhà trọ Sunshine',
        buildingName: 'Toà A',
        roomNumber: '101',
        roomId: 'R101',
        purchaseDate: '2024-01-15',
        purchasePrice: 12000000,
        warrantyMonths: 24,
        warrantyExpiry: '2026-01-15',
        installDate: '2024-01-20',
        status: 'ACTIVE',
        condition: 'GOOD',
        lastMaintenanceDate: '2024-10-15',
        nextMaintenanceDate: '2025-04-15',
        maintenanceCycle: 6, // tháng
        depreciationRate: 10, // %/năm
        currentValue: 10800000,
        supplier: 'Công ty TNHH Điện Lạnh ABC',
        supplierPhone: '0901234567',
        notes: 'Bảo trì định kỳ 6 tháng/lần',
        assignedTo: 'Nguyễn Văn A',
        assignedDate: '2024-01-20',
        history: [
            {
                action: 'INSTALL',
                date: '2024-01-20',
                performedBy: 'Admin',
                note: 'Lắp đặt mới cho phòng 101'
            },
            {
                action: 'MAINTENANCE',
                date: '2024-04-15',
                performedBy: 'Kỹ thuật viên',
                note: 'Vệ sinh máy, kiểm tra gas'
            },
            {
                action: 'MAINTENANCE',
                date: '2024-10-15',
                performedBy: 'Kỹ thuật viên',
                note: 'Vệ sinh máy, thay gas R32'
            }
        ],
        createdAt: '2024-01-15T08:00:00',
    },
    {
        id: 2,
        assetCode: 'TS-A101-002',
        assetName: 'Giường ngủ gỗ',
        category: 'FURNITURE',
        specification: '1.6m x 2m, gỗ sồi',
        brand: 'Nội thất Hoàng Gia',
        model: 'HG-BED160',
        serialNumber: null,
        boardingHouseName: 'Nhà trọ Sunshine',
        buildingName: 'Toà A',
        roomNumber: '101',
        roomId: 'R101',
        purchaseDate: '2024-01-15',
        purchasePrice: 4500000,
        warrantyMonths: 12,
        warrantyExpiry: '2025-01-15',
        installDate: '2024-01-20',
        status: 'ACTIVE',
        condition: 'GOOD',
        lastMaintenanceDate: null,
        nextMaintenanceDate: null,
        maintenanceCycle: null,
        depreciationRate: 15,
        currentValue: 3825000,
        supplier: 'Nội thất Hoàng Gia',
        supplierPhone: '0912345678',
        notes: '',
        assignedTo: 'Nguyễn Văn A',
        assignedDate: '2024-01-20',
        history: [
            {
                action: 'INSTALL',
                date: '2024-01-20',
                performedBy: 'Admin',
                note: 'Lắp đặt nội thất phòng mới'
            }
        ],
        createdAt: '2024-01-15T08:00:00',
    },
    {
        id: 3,
        assetCode: 'TS-B205-001',
        assetName: 'Tủ lạnh Aqua',
        category: 'APPLIANCE',
        specification: '180L, Inverter',
        brand: 'Aqua',
        model: 'AQR-I190AN',
        serialNumber: 'AQ2024005678',
        boardingHouseName: 'Nhà trọ Green Park',
        buildingName: 'Toà B',
        roomNumber: '205',
        roomId: 'R205',
        purchaseDate: '2024-02-20',
        purchasePrice: 5500000,
        warrantyMonths: 24,
        warrantyExpiry: '2026-02-20',
        installDate: '2024-02-25',
        status: 'MAINTENANCE',
        condition: 'FAIR',
        lastMaintenanceDate: '2024-11-10',
        nextMaintenanceDate: '2025-05-10',
        maintenanceCycle: 6,
        depreciationRate: 12,
        currentValue: 4840000,
        supplier: 'Siêu thị Điện máy Xanh',
        supplierPhone: '1800123456',
        notes: 'Đang sửa chữa do không làm lạnh',
        assignedTo: 'Trần Thị B',
        assignedDate: '2024-02-25',
        history: [
            {
                action: 'INSTALL',
                date: '2024-02-25',
                performedBy: 'Admin',
                note: 'Lắp đặt mới'
            },
            {
                action: 'REPORT',
                date: '2024-11-08',
                performedBy: 'Trần Thị B',
                note: 'Khách báo tủ lạnh không lạnh'
            },
            {
                action: 'MAINTENANCE',
                date: '2024-11-10',
                performedBy: 'Kỹ thuật viên',
                note: 'Đang sửa chữa, thay gas'
            }
        ],
        createdAt: '2024-02-20T10:30:00',
    },
    {
        id: 4,
        assetCode: 'TS-C302-001',
        assetName: 'Máy nước nóng Ariston',
        category: 'APPLIANCE',
        specification: '20L, Titanium',
        brand: 'Ariston',
        model: 'AN2 20 RS 2.5 FE',
        serialNumber: 'AR2024003456',
        boardingHouseName: 'Nhà trọ Sky View',
        buildingName: 'Toà C',
        roomNumber: '302',
        roomId: 'R302',
        purchaseDate: '2024-03-10',
        purchasePrice: 3800000,
        warrantyMonths: 36,
        warrantyExpiry: '2027-03-10',
        installDate: '2024-03-15',
        status: 'ACTIVE',
        condition: 'EXCELLENT',
        lastMaintenanceDate: null,
        nextMaintenanceDate: '2025-03-15',
        maintenanceCycle: 12,
        depreciationRate: 10,
        currentValue: 3420000,
        supplier: 'Công ty CP Điện máy Long Việt',
        supplierPhone: '0923456789',
        notes: 'Thiết bị mới, chưa cần bảo trì',
        assignedTo: 'Lê Văn C',
        assignedDate: '2024-03-15',
        history: [
            {
                action: 'INSTALL',
                date: '2024-03-15',
                performedBy: 'Admin',
                note: 'Lắp đặt máy nước nóng mới'
            }
        ],
        createdAt: '2024-03-10T14:20:00',
    },
    {
        id: 5,
        assetCode: 'TS-KHO-001',
        assetName: 'Quạt trần Panasonic',
        category: 'APPLIANCE',
        specification: '5 cánh, điều khiển từ xa',
        brand: 'Panasonic',
        model: 'F-56MPG',
        serialNumber: null,
        boardingHouseName: 'Nhà trọ Sunshine',
        buildingName: 'Kho',
        roomNumber: 'Kho tầng 1',
        roomId: null,
        purchaseDate: '2024-05-01',
        purchasePrice: 1200000,
        warrantyMonths: 12,
        warrantyExpiry: '2025-05-01',
        installDate: null,
        status: 'STORED',
        condition: 'GOOD',
        lastMaintenanceDate: null,
        nextMaintenanceDate: null,
        maintenanceCycle: null,
        depreciationRate: 15,
        currentValue: 1020000,
        supplier: 'Điện máy HC',
        supplierPhone: '0934567890',
        notes: 'Dự phòng cho phòng mới',
        assignedTo: null,
        assignedDate: null,
        history: [
            {
                action: 'PURCHASE',
                date: '2024-05-01',
                performedBy: 'Admin',
                note: 'Mua mới lưu kho'
            }
        ],
        createdAt: '2024-05-01T09:00:00',
    },
    {
        id: 6,
        assetCode: 'TS-A108-001',
        assetName: 'Bàn làm việc',
        category: 'FURNITURE',
        specification: '1.2m x 0.6m, gỗ công nghiệp',
        brand: 'Nội thất Minh Khai',
        model: 'MK-DESK120',
        serialNumber: null,
        boardingHouseName: 'Nhà trọ Sunshine',
        buildingName: 'Toà A',
        roomNumber: '108',
        roomId: 'R108',
        purchaseDate: '2024-01-20',
        purchasePrice: 1500000,
        warrantyMonths: 6,
        warrantyExpiry: '2024-07-20',
        installDate: '2024-01-25',
        status: 'BROKEN',
        condition: 'POOR',
        lastMaintenanceDate: null,
        nextMaintenanceDate: null,
        maintenanceCycle: null,
        depreciationRate: 20,
        currentValue: 900000,
        supplier: 'Nội thất Minh Khai',
        supplierPhone: '0945678901',
        notes: 'Chân bàn bị gãy, cần thay thế',
        assignedTo: 'Phạm Thị D',
        assignedDate: '2024-01-25',
        history: [
            {
                action: 'INSTALL',
                date: '2024-01-25',
                performedBy: 'Admin',
                note: 'Lắp đặt nội thất phòng'
            },
            {
                action: 'REPORT',
                date: '2024-11-05',
                performedBy: 'Phạm Thị D',
                note: 'Khách báo chân bàn bị gãy'
            }
        ],
        createdAt: '2024-01-20T09:15:00',
    },
];

// Mock danh sách phòng để gán tài sản
const mockRooms = [
    { id: 'R101', name: 'Phòng 101 - Toà A - Nhà trọ Sunshine' },
    { id: 'R102', name: 'Phòng 102 - Toà A - Nhà trọ Sunshine' },
    { id: 'R205', name: 'Phòng 205 - Toà B - Nhà trọ Green Park' },
    { id: 'R302', name: 'Phòng 302 - Toà C - Nhà trọ Sky View' },
];

function Asset() {
    const [assetSource, setAssetSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [modalMode, setModalMode] = useState('view');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [form] = Form.useForm();

    // Filter states
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [conditionFilter, setConditionFilter] = useState('ALL');
    const [roomFilter, setRoomFilter] = useState('ALL');

    // Statistics
    const [statistics, setStatistics] = useState({
        totalAssets: 0,
        totalValue: 0,
        activeAssets: 0,
        needMaintenance: 0,
        brokenAssets: 0,
        storedAssets: 0,
    });

    const renderStatusTag = (status) => {
        const map = {
            ACTIVE: { color: 'green', text: 'Đang hoạt động', icon: <CheckCircleOutlined /> },
            MAINTENANCE: { color: 'orange', text: 'Đang bảo trì', icon: <ToolOutlined /> },
            BROKEN: { color: 'red', text: 'Hỏng hóc', icon: <ExclamationCircleOutlined /> },
            STORED: { color: 'blue', text: 'Lưu kho', icon: <BarcodeOutlined /> },
            DISPOSED: { color: 'default', text: 'Đã thanh lý', icon: <WarningOutlined /> },
        };
        const { color, text, icon } = map[status] || { color: 'default', text: status };
        return <Tag color={color} icon={icon}>{text}</Tag>;
    };

    const renderConditionTag = (condition) => {
        const map = {
            EXCELLENT: { color: 'green', text: 'Rất tốt' },
            GOOD: { color: 'cyan', text: 'Tốt' },
            FAIR: { color: 'orange', text: 'Khá' },
            POOR: { color: 'red', text: 'Kém' },
        };
        const { color, text } = map[condition] || { color: 'default', text: condition };
        return <Tag color={color}>{text}</Tag>;
    };

    const renderCategoryTag = (category) => {
        const map = {
            HVAC: { color: 'blue', text: 'Điều hòa' },
            FURNITURE: { color: 'purple', text: 'Nội thất' },
            APPLIANCE: { color: 'cyan', text: 'Thiết bị điện' },
            PLUMBING: { color: 'geekblue', text: 'Thiết bị nước' },
            ELECTRONICS: { color: 'magenta', text: 'Điện tử' },
            OTHER: { color: 'default', text: 'Khác' },
        };
        const { color, text } = map[category] || { color: 'default', text: category };
        return <Tag color={color}>{text}</Tag>;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const columns = [
        {
            title: 'Mã tài sản',
            dataIndex: 'assetCode',
            key: 'assetCode',
            width: 140,
            align: 'center',
            fixed: 'left',
            render: (code) => <strong style={{ color: '#722ed1' }}>{code}</strong>
        },
        {
            title: 'Tên tài sản',
            dataIndex: 'assetName',
            key: 'assetName',
            width: 200,
            align: 'center',
        },
        {
            title: 'Loại',
            dataIndex: 'category',
            key: 'category',
            width: 130,
            align: 'center',
            render: renderCategoryTag,
        },
        {
            title: 'Vị trí',
            key: 'location',
            width: 180,
            align: 'center',
            render: (_, record) => (
                <span style={{ fontWeight: 500 }}>
                    {record.roomNumber} - {record.buildingName}
                </span>
            ),
        },
        {
            title: 'Người sử dụng',
            dataIndex: 'assignedTo',
            key: 'assignedTo',
            width: 150,
            align: 'center',
            render: (name) => name || <span style={{ color: '#999' }}>Chưa gán</span>
        },
        {
            title: 'Giá trị hiện tại',
            dataIndex: 'currentValue',
            key: 'currentValue',
            width: 140,
            align: 'right',
            render: (value) => (
                <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                    {formatCurrency(value)}
                </span>
            ),
        },
        {
            title: 'Tình trạng',
            dataIndex: 'condition',
            key: 'condition',
            width: 110,
            align: 'center',
            render: renderConditionTag,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            align: 'center',
            render: renderStatusTag,
        },
        {
            title: 'Bảo trì tiếp',
            dataIndex: 'nextMaintenanceDate',
            key: 'nextMaintenanceDate',
            width: 120,
            align: 'center',
            render: (date) => {
                if (!date) return <span style={{ color: '#999' }}>-</span>;
                const isNear = dayjs(date).diff(dayjs(), 'days') < 30;
                return (
                    <span style={{ color: isNear ? '#ff4d4f' : '#52c41a', fontWeight: isNear ? 'bold' : 'normal' }}>
                        {dayjs(date).format('DD/MM/YYYY')}
                    </span>
                );
            }
        },
        {
            title: 'Thao tác',
            key: 'actions',
            fixed: 'right',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <SmartButton
                    type="default"
                    icon={<EyeOutlined />}
                    buttonWidth={40}
                    onClick={() => handleViewAsset(record)}
                />
            ),
        },
    ];

    const assetFormFields = [
        {
            label: 'Mã tài sản',
            name: 'assetCode',
            type: 'input',
            placeholder: 'VD: TS-A101-001',
            rules: [{ required: true, message: 'Vui lòng nhập mã tài sản!' }],
        },
        {
            label: 'Tên tài sản',
            name: 'assetName',
            type: 'input',
            rules: [{ required: true, message: 'Vui lòng nhập tên tài sản!' }],
        },
        {
            label: 'Loại tài sản',
            name: 'category',
            type: 'select',
            options: [
                { value: 'HVAC', label: 'Điều hòa' },
                { value: 'FURNITURE', label: 'Nội thất' },
                { value: 'APPLIANCE', label: 'Thiết bị điện' },
                { value: 'PLUMBING', label: 'Thiết bị nước' },
                { value: 'ELECTRONICS', label: 'Điện tử' },
                { value: 'OTHER', label: 'Khác' },
            ],
            rules: [{ required: true, message: 'Vui lòng chọn loại tài sản!' }],
        },
        {
            label: 'Thương hiệu',
            name: 'brand',
            type: 'input',
        },
        {
            label: 'Model',
            name: 'model',
            type: 'input',
        },
        {
            label: 'Serial Number',
            name: 'serialNumber',
            type: 'input',
        },
        {
            label: 'Thông số kỹ thuật',
            name: 'specification',
            type: 'textarea',
        },
        {
            label: 'Gán cho phòng',
            name: 'roomId',
            type: 'select',
            options: [
                { value: null, label: 'Lưu kho' },
                ...mockRooms.map(r => ({ value: r.id, label: r.name }))
            ],
        },
        {
            label: 'Ngày mua',
            name: 'purchaseDate',
            type: 'date',
            render: () => <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />,
            rules: [{ required: true, message: 'Vui lòng chọn ngày mua!' }],
        },
        {
            label: 'Giá mua',
            name: 'purchasePrice',
            type: 'number',
            render: () => <InputNumber min={0} style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />,
            rules: [{ required: true, message: 'Vui lòng nhập giá mua!' }],
        },
        {
            label: 'Bảo hành (tháng)',
            name: 'warrantyMonths',
            type: 'number',
            render: () => <InputNumber min={0} style={{ width: '100%' }} />,
        },
        {
            label: 'Nhà cung cấp',
            name: 'supplier',
            type: 'input',
        },
        {
            label: 'SĐT nhà cung cấp',
            name: 'supplierPhone',
            type: 'input',
        },
        {
            label: 'Chu kỳ bảo trì (tháng)',
            name: 'maintenanceCycle',
            type: 'number',
            render: () => <InputNumber min={0} style={{ width: '100%' }} />,
        },
        {
            label: 'Ghi chú',
            name: 'notes',
            type: 'textarea',
        },
    ];

    useEffect(() => {
        handleGetAssets();
    }, [pagination.current, pagination.pageSize]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, current: 1 }));
        handleGetAssets();
    }, [debouncedSearch, categoryFilter, statusFilter, conditionFilter, roomFilter]);

    const handleGetAssets = async (page = pagination.current, pageSize = pagination.pageSize) => {
        setLoading(true);
        try {
            setTimeout(() => {
                let filtered = [...mockAssets];

                if (debouncedSearch) {
                    filtered = filtered.filter(a =>
                        a.assetCode.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                        a.assetName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                        a.serialNumber?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                        a.assignedTo?.toLowerCase().includes(debouncedSearch.toLowerCase())
                    );
                }

                if (categoryFilter !== 'ALL') {
                    filtered = filtered.filter(a => a.category === categoryFilter);
                }

                if (statusFilter !== 'ALL') {
                    filtered = filtered.filter(a => a.status === statusFilter);
                }

                if (conditionFilter !== 'ALL') {
                    filtered = filtered.filter(a => a.condition === conditionFilter);
                }

                if (roomFilter !== 'ALL') {
                    filtered = filtered.filter(a => a.roomId === roomFilter);
                }

                // Calculate statistics
                const stats = {
                    totalAssets: filtered.length,
                    totalValue: filtered.reduce((sum, a) => sum + a.currentValue, 0),
                    activeAssets: filtered.filter(a => a.status === 'ACTIVE').length,
                    needMaintenance: filtered.filter(a =>
                        a.nextMaintenanceDate && dayjs(a.nextMaintenanceDate).diff(dayjs(), 'days') < 30
                    ).length,
                    brokenAssets: filtered.filter(a => a.status === 'BROKEN').length,
                    storedAssets: filtered.filter(a => a.status === 'STORED').length,
                };
                setStatistics(stats);

                setAssetSource(filtered);
                setPagination({
                    current: page,
                    pageSize,
                    total: filtered.length,
                });
                setLoading(false);
            }, 500);
        } catch (error) {
            message.error(error.response?.data?.message || error.message);
            setAssetSource([]);
            setLoading(false);
        }
    };

    const handleViewAsset = (record) => {
        setSelectedAsset(record);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleAddAsset = () => {
        setSelectedAsset(null);
        setModalMode('add');
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (modalMode === 'add') {
                console.log('Add asset:', formData);
                message.success('Thêm tài sản thành công!');
            }
            handleGetAssets();
            setIsModalOpen(false);
        } catch (error) {
            message.error(`Lỗi: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleTableChange = (pagination) => {
        handleGetAssets(pagination.current, pagination.pageSize);
    };

    const getModalTitle = () => {
        switch (modalMode) {
            case 'view':
                return 'Chi tiết tài sản';
            case 'add':
                return 'Thêm tài sản mới';
            default:
                return 'Tài sản';
        }
    };

    const handleReset = () => {
        setSearch('');
        setCategoryFilter('ALL');
        setStatusFilter('ALL');
        setConditionFilter('ALL');
        setRoomFilter('ALL');
        message.success('Đã reset bộ lọc');
    };

    const renderViewContent = () => {
        if (!selectedAsset) return null;

        const warrantyDaysLeft = dayjs(selectedAsset.warrantyExpiry).diff(dayjs(), 'days');
        const isWarrantyValid = warrantyDaysLeft > 0;

        return (
            <Tabs defaultActiveKey="1" items={[
                {
                    key: '1',
                    label: 'Thông tin chung',
                    children: (
                        <div style={{ padding: '16px 0' }}>
                            <Row gutter={[24, 16]}>
                                <Col span={12}>
                                    <div className={cx('detail-section')}>
                                        <h4>Thông tin cơ bản</h4>
                                        <div className={cx('detail-item')}>
                                            <span className={cx('label')}>Mã tài sản:</span>
                                            <span className={cx('value', 'primary')}>{selectedAsset.assetCode}</span>
                                        </div>
                                        <div className={cx('detail-item')}>
                                            <span className={cx('label')}>Tên tài sản:</span>
                                            <span className={cx('value')}>{selectedAsset.assetName}</span>
                                        </div>
                                        <div className={cx('detail-item')}>
                                            <span className={cx('label')}>Loại:</span>
                                            {renderCategoryTag(selectedAsset.category)}
                                        </div>
                                        <div className={cx('detail-item')}>
                                            <span className={cx('label')}>Thương hiệu:</span>
                                            <span className={cx('value')}>{selectedAsset.brand}</span>
                                        </div>
                                        <div className={cx('detail-item')}>
                                            <span className={cx('label')}>Model:</span>
                                            <span className={cx('value')}>{selectedAsset.model}</span>
                                        </div>
                                        {selectedAsset.serialNumber && (
                                            <div className={cx('detail-item')}>
                                                <span className={cx('label')}>Serial Number:</span>
                                                <span className={cx('value', 'code')}>{selectedAsset.serialNumber}</span>
                                            </div>
                                        )}
                                        <div className={cx('detail-item')}>
                                            <span className={cx('label')}>Thông số kỹ thuật:</span>
                                            <span className={cx('value')}>{selectedAsset.specification}</span>
                                        </div>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div className={cx('detail-section')}>
                                        <h4>Vị trí & Người sử dụng</h4>
                                        <div className={cx('detail-item')}>
                                            <span className={cx('label')}>Phòng:</span>
                                            <span className={cx('value')}>{selectedAsset.roomNumber}</span>
                                        </div>
                                        <div className={cx('detail-item')}>
                                            <span className={cx('label')}>Toà nhà:</span>
                                            <span className={cx('value')}>{selectedAsset.buildingName}</span>
                                        </div>
                                        <div className={cx('detail-item')}>
                                            <span className={cx('label')}>Khu trọ:</span>
                                            <span className={cx('value')}>{selectedAsset.boardingHouseName}</span>
                                        </div>
                                        <div className={cx('detail-item')}>
                                            <span className={cx('label')}>Người sử dụng:</span>
                                            <span className={cx('value', 'primary')}>
                                                {selectedAsset.assignedTo || 'Chưa gán'}
                                            </span>
                                        </div>
                                        {selectedAsset.assignedDate && (
                                            <div className={cx('detail-item')}>
                                                <span className={cx('label')}>Ngày gán:</span>
                                                <span className={cx('value')}>
                                                    {dayjs(selectedAsset.assignedDate).format('DD/MM/YYYY')}
                                                </span>
                                            </div>
                                        )}
                                        <div className={cx('detail-item')}>
                                            <span className={cx('label')}>Trạng thái:</span>
                                            {renderStatusTag(selectedAsset.status)}
                                        </div>
                                        <div className={cx('detail-item')}>
                                            <span className={cx('label')}>Tình trạng:</span>
                                            {renderConditionTag(selectedAsset.condition)}
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            <Row gutter={[24, 16]} style={{ marginTop: '24px' }}>
                                <Col span={12}>
                                    <div className={cx('detail-section', 'financial')}>
                                        <h4>Thông tin tài chính</h4>
                                        <div className={cx('detail-item')}>
                                            <span className={cx('label')}>Giá mua ban đầu:</span>
                                            <span className={cx('value', 'price')}>{formatCurrency(selectedAsset.purchasePrice)}</span>
                                        </div>
                                        <div className={cx('detail-item')}>
                                            <span className={cx('label')}>Giá trị hiện tại:</span>
                                            <span className={cx('value', 'price', 'highlight')}>{formatCurrency(selectedAsset.currentValue)}</span>
                                        </div>
                                        <div className={cx('detail-item')}>
                                            <span className={cx('label')}>Tỷ lệ khấu hao:</span>
                                            <span className={cx('value')}>{selectedAsset.depreciationRate}% / năm</span>
                                        </div>
                                        <div className={cx('detail-item')}>
                                            <span className={cx('label')}>Ngày mua:</span>
                                            <span className={cx('value')}>{dayjs(selectedAsset.purchaseDate).format('DD/MM/YYYY')}</span>
                                        </div>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div className={cx('detail-section', 'warranty')}>
                                        <h4>Bảo hành & Bảo trì</h4>
                                        <div className={cx('detail-item')}>
                                            <span className={cx('label')}>Thời gian bảo hành:</span>
                                            <span className={cx('value')}>{selectedAsset.warrantyMonths} tháng</span>
                                        </div>
                                        <div className={cx('detail-item')}>
                                            <span className={cx('label')}>Hạn bảo hành:</span>
                                            <span className={cx('value', isWarrantyValid ? 'success' : 'danger')}>
                                                {dayjs(selectedAsset.warrantyExpiry).format('DD/MM/YYYY')}
                                                {isWarrantyValid ? ` (còn ${warrantyDaysLeft} ngày)` : ' (hết hạn)'}
                                            </span>
                                        </div>
                                        {selectedAsset.maintenanceCycle && (
                                            <div className={cx('detail-item')}>
                                                <span className={cx('label')}>Chu kỳ bảo trì:</span>
                                                <span className={cx('value')}>{selectedAsset.maintenanceCycle} tháng/lần</span>
                                            </div>
                                        )}
                                        {selectedAsset.lastMaintenanceDate && (
                                            <div className={cx('detail-item')}>
                                                <span className={cx('label')}>Bảo trì gần nhất:</span>
                                                <span className={cx('value')}>
                                                    {dayjs(selectedAsset.lastMaintenanceDate).format('DD/MM/YYYY')}
                                                </span>
                                            </div>
                                        )}
                                        {selectedAsset.nextMaintenanceDate && (
                                            <div className={cx('detail-item')}>
                                                <span className={cx('label')}>Bảo trì tiếp theo:</span>
                                                <span className={cx('value', 'warning')}>
                                                    {dayjs(selectedAsset.nextMaintenanceDate).format('DD/MM/YYYY')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Col>
                            </Row>

                            <Row gutter={[24, 16]} style={{ marginTop: '24px' }}>
                                <Col span={24}>
                                    <div className={cx('detail-section')}>
                                        <h4>Nhà cung cấp</h4>
                                        <Row gutter={[16, 16]}>
                                            <Col span={12}>
                                                <div className={cx('detail-item')}>
                                                    <span className={cx('label')}>Tên nhà cung cấp:</span>
                                                    <span className={cx('value')}>{selectedAsset.supplier}</span>
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div className={cx('detail-item')}>
                                                    <span className={cx('label')}>Số điện thoại:</span>
                                                    <span className={cx('value')}>{selectedAsset.supplierPhone}</span>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            </Row>

                            {selectedAsset.notes && (
                                <Row gutter={[24, 16]} style={{ marginTop: '24px' }}>
                                    <Col span={24}>
                                        <div className={cx('detail-section')}>
                                            <h4>Ghi chú</h4>
                                            <div className={cx('note-box')}>
                                                {selectedAsset.notes}
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            )}
                        </div>
                    )
                },
                {
                    key: '2',
                    label: 'Lịch sử',
                    children: (
                        <div style={{ padding: '16px 0' }}>
                            <Timeline
                                items={selectedAsset.history.map((item, index) => {
                                    const actionMap = {
                                        INSTALL: { color: 'green', text: 'Lắp đặt' },
                                        MAINTENANCE: { color: 'blue', text: 'Bảo trì' },
                                        REPORT: { color: 'orange', text: 'Báo cáo sự cố' },
                                        REPAIR: { color: 'red', text: 'Sửa chữa' },
                                        MOVE: { color: 'purple', text: 'Di chuyển' },
                                        PURCHASE: { color: 'cyan', text: 'Mua mới' },
                                    };
                                    const { color, text } = actionMap[item.action] || { color: 'gray', text: item.action };

                                    return {
                                        color: color,
                                        children: (
                                            <div>
                                                <div style={{ marginBottom: '8px' }}>
                                                    <Tag color={color}>{text}</Tag>
                                                    <span style={{ marginLeft: '8px', color: '#595959' }}>
                                                        {dayjs(item.date).format('DD/MM/YYYY HH:mm')}
                                                    </span>
                                                </div>
                                                <div style={{ marginBottom: '4px', fontWeight: 500 }}>
                                                    Người thực hiện: {item.performedBy}
                                                </div>
                                                {item.note && (
                                                    <div style={{ color: '#595959', fontStyle: 'italic' }}>
                                                        {item.note}
                                                    </div>
                                                )}
                                            </div>
                                        ),
                                    };
                                })}
                            />
                        </div>
                    )
                },
            ]} />
        );
    };

    return (
        <div className={cx('asset-wrapper')}>
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} className={cx('statistics-section')}>
                <Col xs={24} sm={12} lg={4}>
                    <Card className={cx('stat-card', 'total')}>
                        <Statistic
                            title="Tổng tài sản"
                            value={statistics.totalAssets}
                            prefix={<ToolOutlined />}
                            suffix="món"
                            valueStyle={{ color: '#722ed1', fontSize: '24px' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={5}>
                    <Card className={cx('stat-card', 'value')}>
                        <Statistic
                            title="Tổng giá trị"
                            value={statistics.totalValue}
                            suffix="đ"
                            valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={5}>
                    <Card className={cx('stat-card', 'active')}>
                        <Statistic
                            title="Đang hoạt động"
                            value={statistics.activeAssets}
                            prefix={<CheckCircleOutlined />}
                            suffix="món"
                            valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={5}>
                    <Card className={cx('stat-card', 'maintenance')}>
                        <Statistic
                            title="Cần bảo trì"
                            value={statistics.needMaintenance}
                            prefix={<WarningOutlined />}
                            suffix="món"
                            valueStyle={{ color: '#fa8c16', fontSize: '24px' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={5}>
                    <Card className={cx('stat-card', 'broken')}>
                        <Statistic
                            title="Hỏng hóc"
                            value={statistics.brokenAssets}
                            prefix={<ExclamationCircleOutlined />}
                            suffix="món"
                            valueStyle={{ color: '#ff4d4f', fontSize: '24px' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filter Section */}
            <FilterComponent
                fields={[
                    {
                        type: 'search',
                        value: search,
                        onChange: setSearch,
                        placeholder: 'Tìm mã tài sản, tên, serial, người dùng...'
                    },
                    {
                        type: 'select',
                        value: categoryFilter,
                        onChange: setCategoryFilter,
                        options: [
                            { value: 'ALL', label: 'Tất cả loại' },
                            { value: 'HVAC', label: 'Điều hòa' },
                            { value: 'FURNITURE', label: 'Nội thất' },
                            { value: 'APPLIANCE', label: 'Thiết bị điện' },
                            { value: 'PLUMBING', label: 'Thiết bị nước' },
                            { value: 'ELECTRONICS', label: 'Điện tử' },
                            { value: 'OTHER', label: 'Khác' },
                        ]
                    },
                    {
                        type: 'select',
                        value: roomFilter,
                        onChange: setRoomFilter,
                        options: [
                            { value: 'ALL', label: 'Tất cả phòng' },
                            ...mockRooms.map(r => ({ value: r.id, label: r.name })),
                            { value: null, label: 'Lưu kho' }
                        ]
                    },
                    {
                        type: 'select',
                        value: statusFilter,
                        onChange: setStatusFilter,
                        options: [
                            { value: 'ALL', label: 'Tất cả trạng thái' },
                            { value: 'ACTIVE', label: 'Đang hoạt động' },
                            { value: 'MAINTENANCE', label: 'Đang bảo trì' },
                            { value: 'BROKEN', label: 'Hỏng hóc' },
                            { value: 'STORED', label: 'Lưu kho' },
                            { value: 'DISPOSED', label: 'Đã thanh lý' },
                        ]
                    },
                    {
                        type: 'select',
                        value: conditionFilter,
                        onChange: setConditionFilter,
                        options: [
                            { value: 'ALL', label: 'Tất cả tình trạng' },
                            { value: 'EXCELLENT', label: 'Rất tốt' },
                            { value: 'GOOD', label: 'Tốt' },
                            { value: 'FAIR', label: 'Khá' },
                            { value: 'POOR', label: 'Kém' },
                        ]
                    }
                ]}
                onReset={handleReset}
                gridTemplate="minmax(200px, 1fr) minmax(150px, 1fr) minmax(180px, 1fr) minmax(180px, 1fr) minmax(150px, 1fr) 80px"
            />

            {/* Header */}
            <div className={cx('sub_header')}>
                <div className={cx('features')}>
                    <SmartButton
                        title="Thêm tài sản"
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={handleAddAsset}
                    />
                    <Segmented
                        value={viewMode}
                        onChange={setViewMode}
                        options={[
                            { label: 'Bảng', value: 'table', icon: <TableOutlined /> },
                            { label: 'Thẻ', value: 'card', icon: <AppstoreOutlined /> },
                        ]}
                        className={cx('view-toggle')}
                    />
                    <SmartButton
                        title="In mã QR"
                        icon={<BarcodeOutlined />}
                        onClick={() => message.info('Tính năng in mã QR sắp có!')}
                    />
                    <SmartButton
                        title="Xuất Excel"
                        icon={<CloudUploadOutlined />}
                        onClick={() => message.info('Xuất Excel sắp có!')}
                    />
                </div>
            </div>

            {/* Content */}
            <div className={cx('asset-container')}>
                {viewMode === 'table' ? (
                    <SmartTable
                        columns={columns}
                        dataSources={assetSource}
                        loading={loading}
                        pagination={pagination}
                        onTableChange={handleTableChange}
                    />
                ) : (
                    <>
                        <Row gutter={[16, 16]} className={cx('card-grid')}>
                            {assetSource.map((asset) => (
                                <Col xs={24} sm={24} md={12} lg={8} xl={6} key={asset.id}>
                                    <AssetCard
                                        asset={asset}
                                        onView={() => handleViewAsset(asset)}
                                        renderStatusTag={renderStatusTag}
                                        renderConditionTag={renderConditionTag}
                                        renderCategoryTag={renderCategoryTag}
                                        formatCurrency={formatCurrency}
                                    />
                                </Col>
                            ))}
                        </Row>

                        <div className={cx('pagination-wrapper')}>
                            <Pagination
                                current={pagination.current}
                                pageSize={pagination.pageSize}
                                total={pagination.total}
                                showSizeChanger
                                showQuickJumper
                                pageSizeOptions={['6', '12', '24']}
                                onChange={(page, pageSize) => handleGetAssets(page, pageSize)}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Modal */}
            <PopupModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                title={getModalTitle()}
                fields={modalMode === 'view' ? [] : assetFormFields}
                onSubmit={handleFormSubmit}
                initialValues={selectedAsset}
                isDeleteMode={false}
                formInstance={form}
                customContent={modalMode === 'view' ? renderViewContent() : null}
                width={modalMode === 'view' ? 900 : 600}
            />
        </div>
    );
}

export default Asset;