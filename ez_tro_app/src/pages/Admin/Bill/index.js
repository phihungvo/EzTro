// src/pages/Admin/Bill/Bill.jsx
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import classNames from 'classnames/bind';
import dayjs from 'dayjs';
import styles from './Bill.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
import {
    SearchOutlined, PlusOutlined, FilterOutlined, CloudUploadOutlined,
    EditOutlined, DeleteOutlined, TableOutlined, AppstoreOutlined
} from '@ant-design/icons';
import SmartInput from '~/components/Layout/AdminLayout/components/SmartInput';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import PopupModal from '~/components/Layout/AdminLayout/components/PopupModal';
import FilterComponent from '~/components/Layout/AdminLayout/components/FilterComponent';
import AppPagination from '~/components/Layout/AdminLayout/components/AppPagination';
import {Form, message, Segmented, Tag, DatePicker, Spin, Empty, Row, Col} from 'antd';
import {
    getAllBills, createBill, updateBill, deleteBill, filterBills
} from '~/service/admin/bill';
import {getAllActiveContracts} from '~/service/admin/contract';
import useDebounce from '~/hooks/useDebounce';
import usePagination from '~/hooks/usePagination';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);
const {RangePicker} = DatePicker;

function Bill() {
    const [bills, setBills] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(false);
    const {
        pagination,
        handleChange: handlePaginationChange,
        reset: resetPagination,
        setTotal: setPaginationTotal,
    } = usePagination({ initialPageSize: 10 });
    const [modalMode, setModalMode] = useState('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
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
        };
        const cfg = map[status] || {color: 'default', text: status};
        return <Tag color={cfg.color}>{cfg.text}</Tag>;
    };

    const columns = [
        {title: 'Mã', dataIndex: 'billCode', width: 150, fixed: 'left', align: 'center',},
        {title: 'Tiêu đề', dataIndex: 'billTitle', width: 200, align: 'center',},
        {title: 'Người thuê', dataIndex: 'tenantName', width: 150, align: 'center',},
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            width: 140,
            render: (v) => v?.toLocaleString('vi-VN') + ' đ',
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
            title: 'Thao tác',
            fixed: 'right',
            width: 100,
            render: (_, r) => (
                <>
                    <SmartButton
                        type="primary"
                        icon={<EditOutlined/>}
                        buttonWidth={40}
                        onClick={() => handleEdit(r)}
                    />
                    <SmartButton
                        type="danger"
                        icon={<DeleteOutlined/>}
                        buttonWidth={40}
                        onClick={() => handleDelete(r)}
                        style={{marginLeft: 8}}
                    />
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

    const handleDelete = (r) => {
        setModalMode('delete');
        setSelectedBill(r);
        setIsModalOpen(true);
    };

    const handleSubmit = async (values) => {
        const data = {
            ...values,
            dueDate: values.dueDate?.format('YYYY-MM-DD')
        };

        try {
            if (modalMode === 'create') await createBill(data);
            // else if (modalMode === 'edit') await updateBill(selectedBill.id, data);
            // else if (modalMode === 'delete') await deleteBill(selectedBill.id);
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
                            {value: 'PAID', label: 'Đã thanh toán'},
                            {value: 'OVERDUE', label: 'Quá hạn'}
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
                                     onClick={() => message.info('Sắp có!')}/>
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
                                            <div>{b.tenantName}</div>
                                            <div><strong>{b.amount?.toLocaleString()}đ</strong></div>
                                            {getStatusTag(b.status)}
                                            <div style={{marginTop: 8}}>
                                                <SmartButton size="small"
                                                             onClick={() => handleEdit(b)}>Sửa</SmartButton>
                                                <SmartButton size="small" type="danger" onClick={() => handleDelete(b)}
                                                             style={{marginLeft: 8}}>Xóa</SmartButton>
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
                title={modalMode === 'create' ? 'Tạo hóa đơn' : modalMode === 'edit' ? 'Sửa hóa đơn' : 'Xóa hóa đơn'}
                fields={modalMode === 'delete' ? [] : modalFields}
                onSubmit={handleSubmit}
                initialValues={selectedBill}
                isDeleteMode={modalMode === 'delete'}
                formInstance={form}
            />
        </div>
    );
}

export default Bill;
