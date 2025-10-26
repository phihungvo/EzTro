import React, {useState, useEffect} from 'react';
import classNames from 'classnames/bind';
import moment from 'moment';
import styles from '~/pages/Admin/Bill/Bill.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
// import BillCard from '~/components/Layout/AdminLayout/components/BillCard';
import {
    SearchOutlined,
    PlusOutlined,
    FilterOutlined,
    CloudUploadOutlined,
    EditOutlined,
    DeleteOutlined,
    TableOutlined,
    AppstoreOutlined,
} from '@ant-design/icons';
import SmartInput from '~/components/Layout/AdminLayout/components/SmartInput';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import PopupModal from '~/components/Layout/AdminLayout/components/PopupModal';
import {Form, message, Row, Col, Pagination, Segmented, Tag, DatePicker} from 'antd';
import {getAllBills, createBill, updateBill, deleteBill} from '~/service/admin/bill';
import {getAllActiveContracts} from "~/service/admin/contract";

const cx = classNames.bind(styles);

function Bill() {
    const [billSource, setBillSource] = useState([]);
    const [contractOption, setContractOption] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [modalMode, setModalMode] = useState('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [form] = Form.useForm();

    const disabledWhenEdit = modalMode === 'edit';

    const getStatusTag = (status) => {
        const statusConfig = {
            'PAID': {color: 'success', text: 'Đã thanh toán'},
            'UNPAID': {color: 'warning', text: 'Chưa thanh toán'},
            'OVERDUE': {color: 'error', text: 'Quá hạn thanh toán'},
        };
        const config = statusConfig[status] || {color: 'default', text: status};
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const columns = [
        {
            title: 'Mã hoá đơn',
            dataIndex: 'billCode',
            key: 'billCode',
            width: 150,
            fixed: 'left',
            align: 'center',
        },
        {
            title: 'Tên hoá đơn',
            dataIndex: 'billTitle',
            key: 'billTitle',
            width: 250,
            align: 'center',
        },
        {
            title: 'Người thuê',
            dataIndex: 'tenantName',
            key: 'tenantName',
            width: 160,
            align: 'center',
        },
        {
            title: 'Số tiền (VNĐ)',
            dataIndex: 'amount',
            key: 'amount',
            width: 150,
            align: 'center',
            render: (value) =>
                value != null
                    ? value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                    : 'N/A',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            align: 'center',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Ngày thanh toán',
            dataIndex: 'paymentDate',
            key: 'paymentDate',
            align: 'center',
            width: 150,
            render: (date) =>
                date ? new Date(date).toLocaleDateString('vi-VN') : 'Chờ thanh toán',
        },
        {
            title: 'Hạn thanh toán',
            dataIndex: 'dueDate',
            key: 'dueDate',
            align: 'center',
            width: 150,
            render: (date) =>
                date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
            width: 160,
            render: (date) =>
                date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            align: 'center',
            width: 160,
            render: (date) =>
                date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
        },
        {
            title: 'Thao tác',
            key: 'action',
            fixed: 'right',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <>
                    <SmartButton
                        type="primary"
                        icon={<EditOutlined />}
                        buttonWidth={40}
                        onClick={() => handleEditBill(record)}
                    />
                    <SmartButton
                        type="danger"
                        icon={<DeleteOutlined />}
                        buttonWidth={40}
                        onClick={() => handleDeleteBill(record)}
                        style={{ marginLeft: '8px' }}
                    />
                </>
            ),
        },
    ];

    const billModalFields = [
        {
            label: 'Hợp đồng thuê',
            name: 'contractId',
            type: 'select',
            options: contractOption,
            disabled: disabledWhenEdit,
            fullWidth: true,
        },
        {
            label: 'Tiêu đề hoá đơn',
            name: 'billTitle',
            type: 'text',
        },
        {
            label: 'Tiền dịch vụ',
            name: 'serviceAmount',
            type: 'number',
            render: () => (
                <DatePicker format="DD/MM/YYYY" style={{width: '100%'}}/>
            ),
        },
        {
            label: 'Hạn thanh toán',
            name: 'dueDate',
            type: 'date',
            render: () => (
                <DatePicker format="DD/MM/YYYY" style={{width: '100%'}}/>
            ),
        },
        {
            label: 'Ghi chú',
            name: 'note',
            type: 'textarea',
        },
    ];

    useEffect(() => {
        fetchContractOptions();
        handleGetBills();
    }, []);

    const fetchContractOptions = async () => {
        try {
            const contractResponse = await getAllActiveContracts();
            if (contractResponse && Array.isArray(contractResponse)) {
                const c = contractResponse.map((c) => ({
                    label: `${c.boardingHouseName} - Phòng ${c.roomNumber} - ${c.tenantFullName} (${new Date(c.startDate).toLocaleDateString('vi-VN')} → ${new Date(c.endDate).toLocaleDateString('vi-VN')})`,
                    value: c.id,
                }));
                setContractOption(c);
            }
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    };

    const handleGetBills = async (page = 1, pageSize = pagination.pageSize) => {
        setLoading(true);
        try {
            const response = await getAllBills({page: page - 1, pageSize});

            if (response && Array.isArray(response.result)) {
                setBillSource(response.result);
                setPagination({
                    current: page,
                    pageSize: pageSize,
                    total: response.totalElements,
                });
            } else {
                setBillSource([]);
                message.error('Dữ liệu hoá đơn không hợp lệ');
            }
        } catch (error) {
            message.error(`Lỗi khi lấy danh sách hoá đơn: ${error.response?.data?.message || error.message}`);
            setBillSource([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBill = () => {
        setModalMode('create');
        setSelectedBill(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallCreateBill = async (formData) => {
        try {
            await createBill(formData);
            handleGetBills();
            setIsModalOpen(false);
        } catch (error) {
            message.error(
                `Lỗi khi tạo hoá đơn: ${
                    error.response?.data?.message || error.message
                }`,
            );
        }
    };

    const handleEditBill = (record) => {
        setSelectedBill(record);
        setModalMode('edit');
        const formValues = {
            ...record,
            startDate: record.startDate ? moment(record.startDate) : null,
            endDate: record.endDate ? moment(record.endDate) : null,
        };
        form.setFieldsValue(formValues);
        setIsModalOpen(true);
    };

    const handleCallUpdateBill = async (formData) => {
        try {
            // await updateBill(selectedBill.id, formData);
            handleGetBills();
            setIsModalOpen(false);
        } catch (error) {
            message.error(
                `Lỗi khi cập nhật hoá đơn: ${
                    error.response?.data?.message || error.message
                }`,
            );
        }
    };

    const handleDeleteBill = (record) => {
        setModalMode('delete');
        setSelectedBill(record);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallDeleteBill = async () => {
        // await deleteBill(selectedBill.id);
        handleGetBills();
        setIsModalOpen(false);
    };

    const handleFormSubmit = (formData) => {
        const submitData = {
            ...formData,
        };

        if (modalMode === 'create') {
            handleCallCreateBill(submitData);
        } else if (modalMode === 'edit') {
            handleCallUpdateBill(submitData);
        } else if (modalMode === 'delete') {
            handleCallDeleteBill();
        }
        setIsModalOpen(false);
    };

    const handleTableChange = (pagination) => {
        handleGetBills(pagination.current, pagination.pageSize);
    };

    const getModalTitle = () => {
        switch (modalMode) {
            case 'create':
                return 'Thêm khu hoá đơn';
            case 'edit':
                return 'Chỉnh sửa hoá đơn';
            case 'delete':
                return 'Xóa hoá đơn';
            default:
                return 'Chi tiết hoá đơn';
        }
    };

    const handleViewBill = (record) => {
        setSelectedBill(record);
        setModalMode('view');
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    return (
        <div className={cx('bill-wrapper')}>
            {/* Header */}
            <div className={cx('sub_header')}>
                <SmartInput size="large" placeholder="Tìm kiếm hoá đơn" icon={<SearchOutlined/>}/>
                <div className={cx('features')}>
                    <Segmented
                        value={viewMode}
                        onChange={setViewMode}
                        options={[
                            {label: 'Bảng', value: 'table', icon: <TableOutlined/>},
                            {label: 'Thẻ', value: 'card', icon: <AppstoreOutlined/>},
                        ]}
                        className={cx('view-toggle')}
                    />
                    <SmartButton title="Thêm" icon={<PlusOutlined/>} type="primary" onClick={handleAddBill}/>
                    <SmartButton title="Bộ lọc" icon={<FilterOutlined/>}/>
                    <SmartButton title="Excel" icon={<CloudUploadOutlined/>}/>
                </div>
            </div>

            {/* Nội dung */}
            <div className={cx('bill-container')}>
                {viewMode === 'table' ? (
                    <SmartTable
                        columns={columns}
                        dataSources={billSource}
                        loading={loading}
                        pagination={pagination}
                        onTableChange={handleTableChange}
                    />
                ) : (
                    <>
                        <Row gutter={[16, 16]} className={cx('card-grid')}>
                            {billSource.map((Bill) => (
                                <Col xs={24} sm={24} md={12} lg={8} xl={6} key={Bill.id}>
                                    {/*<BillCard*/}
                                    {/*    bill={bill}*/}
                                    {/*    onView={() => handleViewBill(Bill)}*/}
                                    {/*    onEdit={() => handleEditBill(Bill)}*/}
                                    {/*    onDelete={() => handleDeleteBill(Bill)}*/}
                                    {/*/>*/}
                                </Col>
                            ))}
                        </Row>

                        {/* ✅ Pagination riêng cho chế độ card */}
                        <div className={cx('pagination-wrapper')}>
                            <Pagination
                                current={pagination.current}
                                pageSize={pagination.pageSize}
                                total={pagination.total}
                                showSizeChanger
                                showQuickJumper
                                pageSizeOptions={['10', '20', '30']}
                                onChange={(page, pageSize) => handleGetBills(page, pageSize)}
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
                fields={modalMode === 'delete' ? [] : billModalFields}
                onSubmit={handleFormSubmit}
                initialValues={selectedBill}
                isDeleteMode={modalMode === 'delete'}
                formInstance={form}
            />
        </div>
    );
}

export default Bill;
