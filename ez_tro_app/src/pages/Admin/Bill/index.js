// src/pages/Admin/Bill/Bill.jsx
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import classNames from 'classnames/bind';
import dayjs from 'dayjs';
import styles from './Bill.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
import {
    PlusOutlined, CloudUploadOutlined,
    EditOutlined, TableOutlined, AppstoreOutlined, StopOutlined, EyeOutlined, SendOutlined
} from '@ant-design/icons';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import PopupModal from '~/components/Layout/AdminLayout/components/PopupModal';
import FilterComponent from '~/components/Layout/AdminLayout/components/FilterComponent';
import AppPagination from '~/components/Layout/AdminLayout/components/AppPagination';
import {Form, message, Segmented, Tag, DatePicker, Spin, Empty, Row, Col, Modal, Descriptions, Divider, List, Table, Timeline} from 'antd';
import {
    updateBill, cancelBill, filterBills, getBillDetail, sendBill, downloadBillDocument, downloadBillReceipt
} from '~/service/admin/bill';
import {getAllActiveContracts} from '~/service/admin/contract';
import useDebounce from '~/hooks/useDebounce';
import usePagination from '~/hooks/usePagination';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function Bill() {
    const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')} đ`;
    const formatDateValue = (value) => (value ? dayjs(value).format('DD/MM/YYYY') : '');
    const escapeCsv = (value) => {
        const text = value == null ? '' : String(value);
        if (/[",\n]/.test(text)) {
            return `"${text.replace(/"/g, '""')}"`;
        }
        return text;
    };
    const parseDeliveryChannels = (value) => {
        if (!value) {
            return null;
        }
        try {
            return typeof value === 'string' ? JSON.parse(value) : value;
        } catch (error) {
            return null;
        }
    };
    const [bills, setBills] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(false);
    const {
        pagination,
        handleChange: handlePaginationChange,
        reset: resetPagination,
        setTotal: setPaginationTotal,
    } = usePagination({ initialPageSize: 10 });
    const [modalMode, setModalMode] = useState('edit');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailBill, setDetailBill] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const navigate = useNavigate();
    const [form] = Form.useForm();

    // Filter states
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [dateRange, setDateRange] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [monthFilter, setMonthFilter] = useState(null);
    const [yearFilter, setYearFilter] = useState(null);
    const [contractFilter, setContractFilter] = useState(null);
    const filterFingerprint = useMemo(() => {
        const start = dateRange?.[0]?.format?.('YYYY-MM-DD') || '';
        const end = dateRange?.[1]?.format?.('YYYY-MM-DD') || '';
        return [
            debouncedSearch || '',
            start,
            end,
            statusFilter || 'ALL',
            monthFilter ?? '',
            yearFilter ?? '',
            contractFilter ?? '',
        ].join('|');
    }, [debouncedSearch, dateRange, statusFilter, monthFilter, yearFilter, contractFilter]);
    const lastFilterFingerprintRef = useRef(filterFingerprint);

    const getStatusTag = (status) => {
        const map = {
            PAID: {color: 'success', text: 'Đã thanh toán'},
            UNPAID: {color: 'warning', text: 'Chưa thanh toán'},
            OVERDUE: {color: 'error', text: 'Quá hạn'},
            PARTIALLY_PAID: {color: 'processing', text: 'Thanh toán một phần'},
            CANCELLED: {color: 'default', text: 'Đã hủy'},
        };
        const cfg = map[status] || {color: 'default', text: status};
        return <Tag color={cfg.color}>{cfg.text}</Tag>;
    };

    const getDeliveryTag = (status) => {
        const map = {
            NOT_SENT: { color: 'default', text: 'Chưa gửi' },
            SENT: { color: 'success', text: 'Đã gửi' },
            PARTIALLY_SENT: { color: 'warning', text: 'Gửi một phần' },
            FAILED: { color: 'error', text: 'Gửi lỗi' },
        };
        const cfg = map[status] || { color: 'default', text: status || 'Chưa gửi' };
        return <Tag color={cfg.color}>{cfg.text}</Tag>;
    };

    const getLifecycleTag = (status) => {
        const map = {
            ISSUED: { color: 'blue', text: 'Đã phát hành' },
            SENT: { color: 'green', text: 'Đã gửi tenant' },
            CANCELLED: { color: 'default', text: 'Đã hủy phát hành' },
        };
        const cfg = map[status] || { color: 'default', text: status || 'Đã phát hành' };
        return <Tag color={cfg.color}>{cfg.text}</Tag>;
    };

    const renderChannelTags = (channels = [], color = 'default') => {
        if (!channels.length) {
            return '—';
        }
        return channels.map((channel) => (
            <Tag key={`${color}-${channel}`} color={color} style={{marginBottom: 4}}>
                {channel}
            </Tag>
        ));
    };

    const getTimelineColor = (eventType) => {
        const map = {
            ISSUED: 'blue',
            SENT: 'green',
            SEND_FAILED: 'red',
            UPDATED: 'gold',
            PAYMENT_SUBMITTED: 'cyan',
            PAYMENT_ALLOCATED: 'green',
            PAYMENT_REVERSED: 'orange',
            CANCELLED: 'gray',
        };
        return map[eventType] || 'blue';
    };

    const columns = [
        {title: 'Mã', dataIndex: 'billCode', width: 150, fixed: 'left', align: 'center',},
        {title: 'Tiêu đề', dataIndex: 'billTitle', width: 200, align: 'center',},
        {title: 'Phòng', dataIndex: 'roomNumber', width: 110, align: 'center', render: (value) => value || '—'},
        {title: 'Người thuê', dataIndex: 'tenantName', width: 150, align: 'center',},
        {
            title: 'Kỳ tính',
            width: 220,
            align: 'center',
            render: (_, record) => (
                record.billingPeriodStart && record.billingPeriodEnd
                    ? `${dayjs(record.billingPeriodStart).format('DD/MM/YYYY')} - ${dayjs(record.billingPeriodEnd).format('DD/MM/YYYY')}`
                    : '—'
            ),
        },
        {title: 'Loại HĐ', dataIndex: 'invoiceType', width: 120, align: 'center', render: (value) => value || '—'},
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            width: 140,
            render: (v) => v?.toLocaleString('vi-VN') + ' đ',
            align: 'center',
        },
        {
            title: 'Đã phân bổ',
            dataIndex: 'allocatedAmount',
            width: 140,
            render: (v) => formatCurrency(v),
            align: 'center',
        },
        {
            title: 'Còn phải thu',
            dataIndex: 'outstandingAmount',
            width: 150,
            render: (v) => formatCurrency(v),
            align: 'center',
        },
        {title: 'Trạng thái', dataIndex: 'status', width: 130, align: 'center', render: getStatusTag},
        {
            title: 'Hạn thanh toán',
            dataIndex: 'dueDate',
            width: 140,
            align: 'center',
            render: (d) => d ? dayjs(d).format('DD/MM/YYYY') : '—'
        },
        {
            title: 'Phát hành',
            dataIndex: 'lifecycleStatus',
            width: 130,
            align: 'center',
            render: getLifecycleTag,
        },
        {
            title: 'Thao tác',
            fixed: 'right',
            width: 150,
            render: (_, r) => (
                <>
                    <SmartButton
                        type="default"
                        icon={<EyeOutlined/>}
                        buttonWidth={40}
                        onClick={() => handleViewDetail(r)}
                    />
                    <SmartButton
                        type="primary"
                        icon={<SendOutlined/>}
                        buttonWidth={40}
                        onClick={() => handleSend(r)}
                        disabled={r.status === 'CANCELLED'}
                        style={{marginLeft: 8}}
                    />
                    <SmartButton
                        type="primary"
                        icon={<EditOutlined/>}
                        buttonWidth={40}
                        onClick={() => handleEdit(r)}
                        disabled={r.status === 'CANCELLED'}
                        style={{marginLeft: 8}}
                    />
                    {r.status !== 'PAID' && r.status !== 'CANCELLED' && (
                        <SmartButton
                            type="danger"
                            icon={<StopOutlined/>}
                            buttonWidth={40}
                            onClick={() => handleCancel(r)}
                            style={{marginLeft: 8}}
                        />
                    )}
                </>
            )
        }
    ];

    const modalFields = [
        {
            label: 'Hợp đồng',
            name: 'contractId',
            type: 'select',
            options: contracts,
            disabled: modalMode === 'edit',
            rules: [{required: true}]
        },
        {label: 'Tiêu đề', name: 'billTitle', type: 'text', rules: [{required: true}]},
        {label: 'Tiền dịch vụ', name: 'serviceAmount', type: 'number', placeholder: '0'},
        {
            label: 'Hạn thanh toán',
            name: 'dueDate',
            type: 'date',
            render: () => <DatePicker format="DD/MM/YYYY" style={{width: '100%'}}/>
        },
        {label: 'Ghi chú', name: 'note', type: 'textarea'}
    ];

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getAllActiveContracts();
                const opts = (res || []).map(c => ({
                    label: `${c.boardingHouseName} - P.${c.roomNumber} - ${c.tenantFullName}`,
                    value: c.id
                }));
                setContracts(opts);
            } catch (e) {
                console.error(e);
            }
        };
        load();
    }, []);

    // Filter bills
    const fetchBills = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current - 1,
                size: pagination.pageSize,
                search: debouncedSearch || undefined,
                status: statusFilter === 'ALL' ? undefined : statusFilter,
                month: monthFilter,
                year: yearFilter,
                contractId: contractFilter
            };
            if (dateRange?.[0]) {
                params.startDate = dateRange[0].format('YYYY-MM-DD');
                params.endDate = dateRange[1].format('YYYY-MM-DD');
            }

            const res = await filterBills(params);
            setBills(res?.content || []);
            setPaginationTotal(res?.totalElements || 0);
        } catch (e) {
            message.error('Lỗi tải hóa đơn');
            setBills([]);
            setPaginationTotal(0);
        } finally {
            setLoading(false);
        }
    }, [
        pagination.current,
        pagination.pageSize,
        debouncedSearch,
        statusFilter,
        monthFilter,
        yearFilter,
        contractFilter,
        dateRange,
        setPaginationTotal,
    ]);

    useEffect(() => {
        const filtersChanged = lastFilterFingerprintRef.current !== filterFingerprint;
        if (filtersChanged) {
            lastFilterFingerprintRef.current = filterFingerprint;
            if (pagination.current !== 1) {
                resetPagination();
                return;
            }
        }

        fetchBills();
    }, [filterFingerprint, pagination.current, pagination.pageSize, fetchBills, resetPagination]);

    const handleAdd = () => {
       navigate(`/owner/bills/create-bill`)
       //  window.location.href = '/create-bill.html';

    };

    const handleEdit = (r) => {
        setModalMode('edit');
        setSelectedBill(r);
        form.setFieldsValue({
            ...r,
            dueDate: r.dueDate ? dayjs(r.dueDate) : null
        });
        setIsModalOpen(true);
    };

    const handleViewDetail = async (bill) => {
        setDetailOpen(true);
        setDetailLoading(true);
        try {
            const response = await getBillDetail(bill.id);
            setDetailBill(response);
        } catch (error) {
            setDetailBill(null);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleSend = (bill, resend = false) => {
        Modal.confirm({
            title: resend || bill.sentAt ? 'Gửi lại hóa đơn' : 'Gửi hóa đơn',
            content: `Hệ thống sẽ gửi thông báo hóa đơn ${bill.billCode} cho người thuê qua in-app. Các kênh Email/SMS/Zalo sẽ được lưu trạng thái để tích hợp tiếp.`,
            okText: resend || bill.sentAt ? 'Gửi lại' : 'Gửi',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await sendBill(bill.id, {
                        sendInApp: true,
                        resend,
                    });
                    message.success(resend || bill.sentAt ? 'Đã gửi lại hóa đơn' : 'Đã gửi hóa đơn');
                    if (detailOpen && detailBill?.id === bill.id) {
                        const refreshed = await getBillDetail(bill.id);
                        setDetailBill(refreshed);
                    }
                    fetchBills();
                } catch (error) {
                    message.error(error.response?.data?.message || 'Không thể gửi hóa đơn');
                }
            }
        });
    };

    const handleCancel = (r) => {
        Modal.confirm({
            title: 'Hủy hóa đơn',
            content: `Hệ thống sẽ reverse allocation liên quan và chuyển hóa đơn ${r.billCode} sang trạng thái hủy.`,
            okText: 'Hủy hóa đơn',
            okButtonProps: { danger: true },
            cancelText: 'Đóng',
            onOk: async () => {
                try {
                    await cancelBill(r.id);
                    message.success('Đã hủy hóa đơn');
                    fetchBills();
                } catch (error) {
                    message.error(error.response?.data?.message || 'Không thể hủy hóa đơn');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        const data = {
            ...values,
            dueDate: values.dueDate?.format('YYYY-MM-DD')
        };

        try {
            if (modalMode === 'edit') {
                await updateBill(selectedBill.id, data);
            }
            setIsModalOpen(false);
            fetchBills();
        } catch (e) {
            message.error(e.response?.data?.message || 'Lỗi');
        }
    };

    const handleReset = () => {
        setSearch('');
        setDateRange(null);
        setStatusFilter('ALL');
        setMonthFilter(null);
        setYearFilter(null);
        setContractFilter(null);
        message.success('Đã reset bộ lọc');
    };

    const handleExportCsv = () => {
        if (!bills.length) {
            message.info('Không có hóa đơn để xuất');
            return;
        }

        const headers = [
            'Mã hóa đơn',
            'Tiêu đề',
            'Phòng',
            'Người thuê',
            'Loại hóa đơn',
            'Kỳ tính',
            'Hạn thanh toán',
            'Tổng tiền',
            'Đã phân bổ',
            'Còn phải thu',
            'Trạng thái thanh toán',
            'Trạng thái phát hành',
            'Trạng thái gửi',
        ];
        const rows = bills.map((bill) => [
            bill.billCode,
            bill.billTitle,
            bill.roomNumber,
            bill.tenantName,
            bill.invoiceType,
            bill.billingPeriodStart && bill.billingPeriodEnd
                ? `${formatDateValue(bill.billingPeriodStart)} - ${formatDateValue(bill.billingPeriodEnd)}`
                : '',
            formatDateValue(bill.dueDate),
            Number(bill.amount || 0),
            Number(bill.allocatedAmount || 0),
            Number(bill.outstandingAmount || 0),
            bill.status,
            bill.lifecycleStatus,
            bill.deliveryStatus,
        ]);
        const csv = [headers, ...rows]
            .map((row) => row.map(escapeCsv).join(','))
            .join('\n');
        const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bills-${dayjs().format('YYYYMMDD-HHmmss')}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        message.success('Đã xuất danh sách hóa đơn');
    };

    const handleDownloadBlob = async (downloadAction, fallbackSuccess) => {
        const file = await downloadAction();
        const url = window.URL.createObjectURL(file.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.fileName || 'document.pdf';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        message.success(fallbackSuccess);
    };

    const deliveryChannels = parseDeliveryChannels(detailBill?.deliveryChannelsJson);

    return (
        <div className={cx('wrapper')}>
            <FilterComponent
                fields={[
                    {type: 'search', value: search, onChange: setSearch, placeholder: 'Tìm mã, tên, phòng...'},
                    {type: 'dateRange', value: dateRange, onChange: setDateRange},
                    {
                        type: 'select',
                        value: statusFilter,
                        onChange: setStatusFilter,
                        options: [
                            {value: 'ALL', label: 'Tất cả trạng thái'},
                            {value: 'UNPAID', label: 'Chưa thanh toán'},
                            {value: 'PARTIALLY_PAID', label: 'Thanh toán một phần'},
                            {value: 'PAID', label: 'Đã thanh toán'},
                            {value: 'OVERDUE', label: 'Quá hạn'},
                            {value: 'CANCELLED', label: 'Đã hủy'}
                        ]
                    },
                    // {type: 'month', value: monthFilter, onChange: setMonthFilter, placeholder: 'Tháng'},
                    // {type: 'year', value: yearFilter, onChange: setYearFilter, placeholder: 'Năm'},
                    {
                        type: 'select',
                        value: contractFilter,
                        onChange: setContractFilter,
                        options: contracts,
                        placeholder: 'Chọn hợp đồng',
                        allowClear: true
                    }
                ]}
                onReset={handleReset}
                gridTemplate="minmax(200px, 1fr) minmax(240px, 1fr) 1fr 1fr 80px"

            />

            <div className={cx('container')}>
                <div className={cx('header')}>
                    <div className={cx('left')}>
                        <Segmented
                            options={[
                                {label: <>Bảng <TableOutlined/></>, value: 'table'},
                                {label: <>Thẻ <AppstoreOutlined/></>, value: 'card'}
                            ]}
                            value={viewMode}
                            onChange={setViewMode}
                        />
                        <SmartButton title="Thêm" icon={<PlusOutlined/>} type="primary" onClick={handleAdd}/>
                        <SmartButton title="Excel" icon={<CloudUploadOutlined/>}
                                     onClick={handleExportCsv}/>
                    </div>
                    <AppPagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        onChange={handlePaginationChange}
                        showTotal={(total, range) => `Đang xem ${range[0]}-${range[1]} trong ${total} hóa đơn`}
                    />
                </div>

                {viewMode === 'table' ? (
                    <SmartTable
                        columns={columns}
                        dataSources={bills}
                        loading={loading}
                        pagination={false}
                    />
                ) : (
                    <Spin spinning={loading}>
                        {bills.length === 0 ? <Empty/> : (
                            <Row gutter={[16, 16]}>
                                {bills.map(b => (
                                    <Col xs={24} md={12} lg={8} key={b.id}>
                                        <div className={cx('card')}>
                                            <div><strong>{b.billCode}</strong></div>
                                            <div>{b.billTitle}</div>
                                            <div>Phòng: {b.roomNumber || '—'}</div>
                                            <div>{b.tenantName}</div>
                                            <div><strong>{b.amount?.toLocaleString()}đ</strong></div>
                                            <div>Còn phải thu: <strong>{formatCurrency(b.outstandingAmount)}</strong></div>
                                            {getStatusTag(b.status)}
                                            <div style={{marginTop: 8}}>{getDeliveryTag(b.deliveryStatus)}</div>
                                            <div style={{marginTop: 8}}>
                                                <SmartButton
                                                    size="small"
                                                    onClick={() => handleSend(b)}
                                                >
                                                    Gửi
                                                </SmartButton>
                                                <SmartButton
                                                    size="small"
                                                    onClick={() => handleViewDetail(b)}
                                                    style={{marginLeft: 8}}
                                                >
                                                    Xem
                                                </SmartButton>
                                                <SmartButton
                                                    size="small"
                                                    onClick={() => handleEdit(b)}
                                                    disabled={b.status === 'CANCELLED'}
                                                    style={{marginLeft: 8}}
                                                >
                                                    Sửa
                                                </SmartButton>
                                                {b.status !== 'PAID' && b.status !== 'CANCELLED' && (
                                                    <SmartButton
                                                        size="small"
                                                        type="danger"
                                                        onClick={() => handleCancel(b)}
                                                        style={{marginLeft: 8}}
                                                    >
                                                        Hủy
                                                    </SmartButton>
                                                )}
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </Spin>
                )}
            </div>

            <PopupModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                title={modalMode === 'edit' ? 'Sửa hóa đơn' : 'Xóa hóa đơn'}
                fields={modalMode === 'delete' ? [] : modalFields}
                onSubmit={handleSubmit}
                initialValues={selectedBill}
                isDeleteMode={modalMode === 'delete'}
                formInstance={form}
            />

            <Modal
                open={detailOpen}
                onCancel={() => {
                    setDetailOpen(false);
                    setDetailBill(null);
                }}
                footer={null}
                width={1080}
                title={detailBill?.billCode ? `Chi tiết hóa đơn ${detailBill.billCode}` : 'Chi tiết hóa đơn'}
            >
                <Spin spinning={detailLoading}>
                    {!detailBill ? (
                        <Empty description="Không có dữ liệu hóa đơn" />
                    ) : (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
                                <SmartButton
                                    size="small"
                                    type="primary"
                                    title="Tải hoá đơn"
                                    onClick={() => handleDownloadBlob(
                                        () => downloadBillDocument(detailBill.id),
                                        'Đã tải tài liệu hóa đơn'
                                    )}
                                />
                                <SmartButton
                                    size="small"
                                    type="warning"
                                    title="Tải biên nhận"
                                    onClick={() => handleDownloadBlob(
                                        () => downloadBillReceipt(detailBill.id),
                                        'Đã tải biên nhận hóa đơn'
                                    )}
                                />
                            </div>
                            <Descriptions bordered size="small" column={2}>
                                <Descriptions.Item label="Tiêu đề">{detailBill.billTitle || '—'}</Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">{getStatusTag(detailBill.status)}</Descriptions.Item>
                                <Descriptions.Item label="Người thuê">{detailBill.tenantName || '—'}</Descriptions.Item>
                                <Descriptions.Item label="Phòng">{detailBill.roomNumber || '—'}</Descriptions.Item>
                                <Descriptions.Item label="Kỳ tính">
                                    {detailBill.billingPeriodStart && detailBill.billingPeriodEnd
                                        ? `${dayjs(detailBill.billingPeriodStart).format('DD/MM/YYYY')} - ${dayjs(detailBill.billingPeriodEnd).format('DD/MM/YYYY')}`
                                        : '—'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Loại hóa đơn">{detailBill.invoiceType || '—'}</Descriptions.Item>
                                <Descriptions.Item label="Tổng tiền">{formatCurrency(detailBill.amount)}</Descriptions.Item>
                                <Descriptions.Item label="Đã phân bổ">{formatCurrency(detailBill.allocatedAmount)}</Descriptions.Item>
                                <Descriptions.Item label="Còn phải thu">{formatCurrency(detailBill.outstandingAmount)}</Descriptions.Item>
                                <Descriptions.Item label="Ngày đến hạn">
                                    {detailBill.dueDate ? dayjs(detailBill.dueDate).format('DD/MM/YYYY') : '—'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Lifecycle">{getLifecycleTag(detailBill.lifecycleStatus)}</Descriptions.Item>
                                <Descriptions.Item label="Trạng thái gửi">{getDeliveryTag(detailBill.deliveryStatus)}</Descriptions.Item>
                                <Descriptions.Item label="Gửi lúc">
                                    {detailBill.sentAt ? dayjs(detailBill.sentAt).format('DD/MM/YYYY HH:mm:ss') : '—'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Kênh yêu cầu" span={2}>
                                    {renderChannelTags(deliveryChannels?.requestedChannels || [], 'blue')}
                                </Descriptions.Item>
                                <Descriptions.Item label="Kênh đã gửi" span={2}>
                                    {renderChannelTags(deliveryChannels?.deliveredChannels || [], 'green')}
                                </Descriptions.Item>
                                <Descriptions.Item label="Kênh chờ tích hợp" span={2}>
                                    {renderChannelTags(deliveryChannels?.unsupportedChannels || [], 'orange')}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ghi chú khách thuê" span={2}>
                                    {detailBill.publicNote || '—'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Hướng dẫn thanh toán" span={2}>
                                    {detailBill.paymentInstructions || '—'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ghi chú nội bộ" span={2}>
                                    {detailBill.internalNote || '—'}
                                </Descriptions.Item>
                            </Descriptions>

                            <Divider>Chi tiết dòng hóa đơn</Divider>
                            <Table
                                size="small"
                                rowKey="id"
                                pagination={false}
                                dataSource={detailBill.lines || []}
                                columns={[
                                    { title: 'Loại', dataIndex: 'lineType', width: 160 },
                                    { title: 'Mô tả', dataIndex: 'description' },
                                    { title: 'SL', dataIndex: 'quantity', width: 100, align: 'right' },
                                    { title: 'Đơn giá', dataIndex: 'unitPrice', width: 140, align: 'right', render: formatCurrency },
                                    { title: 'Thành tiền', dataIndex: 'amount', width: 160, align: 'right', render: formatCurrency },
                                ]}
                            />

                            <Divider>Phân bổ thanh toán</Divider>
                            <Table
                                size="small"
                                rowKey="id"
                                pagination={false}
                                dataSource={detailBill.allocations || []}
                                locale={{ emptyText: 'Chưa có phân bổ thanh toán' }}
                                columns={[
                                    { title: 'Payment ID', dataIndex: 'paymentId', width: 100 },
                                    { title: 'Mã tham chiếu', dataIndex: 'externalReference' },
                                    { title: 'Trạng thái payment', dataIndex: 'paymentStatus', width: 180 },
                                    { title: 'Loại phân bổ', dataIndex: 'allocationType', width: 150 },
                                    { title: 'Số tiền', dataIndex: 'amount', width: 160, align: 'right', render: formatCurrency },
                                    {
                                        title: 'Ngày nhận',
                                        dataIndex: 'receivedAt',
                                        width: 150,
                                        render: (value) => value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—'
                                    },
                                ]}
                            />

                            <Divider>Timeline</Divider>
                            <Timeline
                                items={(detailBill.timeline || []).map((item) => ({
                                    color: getTimelineColor(item.eventType),
                                    children: (
                                        <div>
                                            <strong>{item.title}</strong>
                                            <div style={{color: '#666'}}>
                                                {item.occurredAt ? dayjs(item.occurredAt).format('DD/MM/YYYY HH:mm:ss') : '—'}
                                                {item.actorName ? ` • ${item.actorName}` : ''}
                                            </div>
                                            <div>{item.description || '—'}</div>
                                            {item.amount !== null && item.amount !== undefined && (
                                                <div style={{marginTop: 4}}>{formatCurrency(item.amount)}</div>
                                            )}
                                        </div>
                                    )
                                }))}
                            />

                            <Divider>Audit log</Divider>
                            <div style={{marginBottom: 12}}>
                                <SmartButton
                                    type="primary"
                                    icon={<SendOutlined />}
                                    onClick={() => handleSend(detailBill, !!detailBill.sentAt)}
                                    disabled={detailBill.status === 'CANCELLED'}
                                >
                                    {detailBill.sentAt ? 'Gửi lại hóa đơn' : 'Gửi hóa đơn'}
                                </SmartButton>
                            </div>
                            <List
                                size="small"
                                dataSource={detailBill.auditLogs || []}
                                locale={{ emptyText: 'Chưa có audit log' }}
                                renderItem={(item) => (
                                    <List.Item>
                                        <div style={{width: '100%'}}>
                                            <strong>{item.operationType}</strong> bởi {item.actorName || 'Hệ thống'}
                                            <div style={{color: '#888'}}>{item.createdAt ? dayjs(item.createdAt).format('DD/MM/YYYY HH:mm:ss') : '—'}</div>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </>
                    )}
                </Spin>
            </Modal>
        </div>
    );
}

export default Bill;
