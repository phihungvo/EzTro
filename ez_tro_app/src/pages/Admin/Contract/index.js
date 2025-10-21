import React, {useState, useEffect} from 'react';
import classNames from 'classnames/bind';
import moment from 'moment';
import styles from '~/pages/Admin/Contract/Contract.module.scss';
import SmartTable from '~/components/Layout/components/SmartTable';
import ContractCard from 'src/components/Layout/components/ContractCard';
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
import SmartInput from '~/components/Layout/components/SmartInput';
import SmartButton from '~/components/Layout/components/SmartButton';
import PopupModal from '~/components/Layout/components/PopupModal';
import {Form, message, Row, Col, Pagination, Segmented, Tag, DatePicker} from 'antd';
import {getAllContracts, createContract, updateContract, deleteContract} from '~/service/admin/contract';
import {getAllRoomNoPaged} from "~/service/admin/room";
import {getAllTenantNoPaged} from "~/service/admin/tenant";

const cx = classNames.bind(styles);

function Contract() {
    const [contractSource, setContractSource] = useState([]);
    const [roomOptions, setRoomOptions] = useState([]);
    const [tenantOptions, setTenantOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [modalMode, setModalMode] = useState('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [form] = Form.useForm();

    const disabledWhenEdit = modalMode === 'edit';

    const getStatusTag = (status) => {
        const statusConfig = {
            'ACTIVE': {color: 'success', text: 'Đang hiệu lực'},
            'CANCELLED': {color: 'warning', text: 'Đã chấm dứt'},
            'EXPIRED': {color: 'error', text: 'Hết hạn'},
        };
        const config = statusConfig[status] || {color: 'default', text: status};
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const columns = [
        {
            title: 'Mã phòng',
            dataIndex: 'roomId',
            key: 'roomId',
            width: 100,
            fixed: 'left',
            align: 'center',
        },
        {
            title: 'Số phòng',
            dataIndex: 'roomNumber',
            key: 'roomNumber',
            width: 100,
            align: 'center',
        },
        {
            title: 'Người thuê',
            dataIndex: 'tenantFullName',
            key: 'tenantFullName',
            width: 250,
            align: 'center',
        },
        {
            title: 'Thời hạn hợp đồng',
            dataIndex: 'contractDuration',
            key: 'contractDuration',
            width: 200,
            align: 'center',
            render: (_, record) => {
                const start = record.startDate ? new Date(record.startDate).toLocaleDateString('vi-VN') : 'N/A';
                const end = record.endDate ? new Date(record.endDate).toLocaleDateString('vi-VN') : 'N/A';
                return (
                    <div className={cx('date-range')}>
                        <span className={cx('date-start')}>{start}</span>
                        <span className={cx('date-arrow')}>→</span>
                        <span className={cx('date-end')}>{end}</span>
                    </div>
                );
            }
        },
        {
            title: 'Trạng thái hợp đồng',
            dataIndex: 'status',
            key: 'status',
            width: 180,
            align: 'center',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Tiền cọc (VNĐ)',
            dataIndex: 'deposit',
            key: 'deposit',
            width: 150,
            align: 'center',
            render: (value) =>
                value != null ? (
                    <span className={cx('salary-value')}>
                        {value.toLocaleString('vi-VN', {style: 'currency', currency: 'VND'})}
                    </span>
                ) : 'N/A',
        },
        {
            title: 'Giá thuê (VNĐ/tháng)',
            dataIndex: 'rentPrice',
            key: 'rentPrice',
            width: 200,
            align: 'center',
            render: (value) =>
                value != null ? (
                    <span className={cx('salary-value')}>
                        {value.toLocaleString('vi-VN', {style: 'currency', currency: 'VND'})}
                    </span>
                ) : 'N/A',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
            width: 200,
            render: (date) =>
                date ? new Date(date).toLocaleString('vi-VN') : 'N/A',
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            align: 'center',
            width: 200,
            render: (date) =>
                date ? new Date(date).toLocaleString('vi-VN') : 'N/A',
        },
        {
            title: 'Thao tác',
            fixed: 'right',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <>
                    <SmartButton
                        type="primary"
                        icon={<EditOutlined/>}
                        buttonWidth={40}
                        onClick={() => handleEditContract(record)}
                    />
                    <SmartButton
                        type="danger"
                        icon={<DeleteOutlined/>}
                        buttonWidth={40}
                        onClick={() => handleDeleteContract(record)}
                        style={{marginLeft: '8px'}}
                    />
                </>
            ),
        },
    ];

    const contractModalFields = [
        {
            label: 'Phòng trọ',
            name: 'roomId',
            type: 'select',
            options: roomOptions,
            disabled: disabledWhenEdit
        },
        {
            label: 'Người thuê',
            name: 'tenantId',
            type: 'select',
            options: tenantOptions,
            disabled: disabledWhenEdit
        },
        {
            label: 'Ngày bắt đầu',
            name: 'startDate',
            type: 'date',
            render: () => (
                <DatePicker format="DD/MM/YYYY" style={{width: '100%'}}/>
            ),
        },
        {
            label: 'Ngày kết thúc',
            name: 'endDate',
            type: 'date',
            render: () => (
                <DatePicker format="DD/MM/YYYY" style={{width: '100%'}}/>
            ),
        },
        {
            label: 'Tiền cọc (VNĐ)',
            name: 'deposit',
            type: 'number',
        },
        {
            label: 'Giá thuê (VNĐ/tháng)',
            name: 'rentPrice',
            type: 'number',
        },
        {
            label: 'Trạng thái hợp đồng',
            name: 'status',
            type: 'select',
            options: [
                {label: 'Đang hiệu lực', value: 'ACTIVE'},
                {label: 'Đã hết hạn', value: 'EXPIRED'},
                {label: 'Đã hủy', value: 'CANCELLED'},
            ],
        },
        {
            label: 'Ghi chú',
            name: 'note',
            type: 'textarea',
        },
    ];

    useEffect(() => {
        fetchRoomAndTenantOptions();
        handleGetContracts();
    }, []);

    const fetchRoomAndTenantOptions = async () => {
        try {
            const roomResponse = await getAllRoomNoPaged();
            if (roomResponse && Array.isArray(roomResponse)) {
                const rooms = roomResponse.map((room) => ({
                    label: `${room.roomNumber} - ${room.boardingHouseName}`,
                    value: room.id,
                }));
                setRoomOptions(rooms);
            }

            const tenantResponse = await getAllTenantNoPaged();
            if (tenantResponse && Array.isArray(tenantResponse)) {
                const tenants = tenantResponse.map((tenant) => ({
                    label: `${tenant.userId} - ${tenant.fullName}`,
                    value: tenant.id,
                }));
                setTenantOptions(tenants);
            }
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    };

    const handleGetContracts = async (page = 1, pageSize = pagination.pageSize) => {
        setLoading(true);
        try {
            const response = await getAllContracts({page: page - 1, pageSize});

            if (response && Array.isArray(response.content)) {
                setContractSource(response.content);
                setPagination({
                    current: page,
                    pageSize: pageSize,
                    total: response.totalElements,
                });
                console.log('Contract sources: ', response.content);
            } else {
                setContractSource([]);
                message.error('Dữ liệu khu nhà không hợp lệ');
            }
        } catch (error) {
            message.error(`Lỗi khi lấy danh sách khu nhà: ${error.response?.data?.message || error.message}`);
            setContractSource([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddContract = () => {
        setModalMode('create');
        setSelectedContract(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallCreateContract = async (formData) => {
        try {
            await createContract(formData);
            handleGetContracts();
            setIsModalOpen(false);
        } catch (error) {
            message.error(
                `Lỗi khi tạo khu nhà: ${
                    error.response?.data?.message || error.message
                }`,
            );
        }
    };

    const handleEditContract = (record) => {
        setSelectedContract(record);
        setModalMode('edit');
        const formValues = {
            ...record,
            startDate: record.startDate ? moment(record.startDate) : null,
            endDate: record.endDate ? moment(record.endDate) : null,
        };
        form.setFieldsValue(formValues);
        setIsModalOpen(true);
    };

    const handleCallUpdateContract = async (formData) => {
        try {
            await updateContract(selectedContract.id, formData);
            handleGetContracts();
            setIsModalOpen(false);
        } catch (error) {
            message.error(
                `Lỗi khi cập nhật khu nhà: ${
                    error.response?.data?.message || error.message
                }`,
            );
        }
    };

    const handleDeleteContract = (record) => {
        setModalMode('delete');
        setSelectedContract(record);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallDeleteContract = async () => {
        await deleteContract(selectedContract.id);
        handleGetContracts();
        setIsModalOpen(false);
    };

    const handleFormSubmit = (formData) => {
        const submitData = {
            ...formData,
            startDate: formData.startDate ? formData.startDate.format('YYYY-MM-DD') : null,
            endDate: formData.endDate ? formData.endDate.format('YYYY-MM-DD') : null,
        };

        if (modalMode === 'create') {
            handleCallCreateContract(submitData);
        } else if (modalMode === 'edit') {
            handleCallUpdateContract(submitData);
        } else if (modalMode === 'delete') {
            handleCallDeleteContract();
        }
        setIsModalOpen(false);
    };

    const handleTableChange = (pagination) => {
        handleGetContracts(pagination.current, pagination.pageSize);
    };

    const getModalTitle = () => {
        switch (modalMode) {
            case 'create':
                return 'Thêm khu hợp đồng';
            case 'edit':
                return 'Chỉnh sửa hợp đồng';
            case 'delete':
                return 'Xóa hợp đồng';
            default:
                return 'Chi tiết hợp đồng';
        }
    };

    const handleViewContract = (record) => {
        setSelectedContract(record);
        setModalMode('view');
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    return (
        <div className={cx('contract-wrapper')}>
            {/* Header */}
            <div className={cx('sub_header')}>
                <SmartInput size="large" placeholder="Tìm kiếm hợp đồng" icon={<SearchOutlined/>}/>
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
                    <SmartButton title="Thêm" icon={<PlusOutlined/>} type="primary" onClick={handleAddContract}/>
                    <SmartButton title="Bộ lọc" icon={<FilterOutlined/>}/>
                    <SmartButton title="Excel" icon={<CloudUploadOutlined/>}/>
                </div>
            </div>

            {/* Nội dung */}
            <div className={cx('contract-container')}>
                {viewMode === 'table' ? (
                    <SmartTable
                        columns={columns}
                        dataSources={contractSource}
                        loading={loading}
                        pagination={pagination}
                        onTableChange={handleTableChange}
                    />
                ) : (
                    <>
                        <Row gutter={[16, 16]} className={cx('card-grid')}>
                            {contractSource.map((contract) => (
                                <Col xs={24} sm={24} md={12} lg={8} xl={6} key={contract.id}>
                                    <ContractCard
                                        contract={contract}
                                        onView={() => handleViewContract(contract)}
                                        onEdit={() => handleEditContract(contract)}
                                        onDelete={() => handleDeleteContract(contract)}
                                    />
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
                                onChange={(page, pageSize) => handleGetContracts(page, pageSize)}
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
                fields={modalMode === 'delete' ? [] : contractModalFields}
                onSubmit={handleFormSubmit}
                initialValues={selectedContract}
                isDeleteMode={modalMode === 'delete'}
                formInstance={form}
            />
        </div>
    );
}

export default Contract;
