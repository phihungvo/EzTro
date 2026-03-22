import React, {useState, useEffect} from 'react';
import classNames from 'classnames/bind';
import styles from '~/pages/Admin/IncidentReport/IncidentReport.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
// import IncidentReportCard from '~/components/Layout/AdminLayout/components/IncidentReportCard';
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
import {Form, message, Row, Col, Pagination, Segmented, Tag} from 'antd';
import moment from 'moment';
import {
    getAllIncidentReports,
    createIncidentReport,
    updateIncidentReport,
    deleteIncidentReport
} from '~/service/admin/incident-report';
import {getAllRoomNoPaged} from "~/service/admin/room";
import {disablePastDates} from "~/utils/dateUtils";

const cx = classNames.bind(styles);

function IncidentReport() {
    const [incidentReportSource, setIncidentReportSource] = useState([]);
    const [roomOptionSource, setRoomOptionSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [modalMode, setModalMode] = useState('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIncidentReport, setSelectedIncidentReport] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [form] = Form.useForm();

    const disabledWhenEdit = modalMode === 'edit';

    const renderStatusTag = (status) => {
        const map = {
            PENDING: { color: 'orange', text: 'Chờ xử lý' },
            IN_PROGRESS: { color: 'blue', text: 'Đang xử lý' },
            RESOLVED: { color: 'green', text: 'Đã xử lý' },
        };
        const { color, text } = map[status] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
    };

    const columns = [
        {
            title: 'Mã báo cáo',
            dataIndex: 'id',
            key: 'id',
            width: 120,
            align: 'center',
            fixed: 'left',
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            width: 200,
            align: 'center',
        },
        {
            title: 'Người báo cáo',
            dataIndex: 'tenantName',
            key: 'tenantName',
            width: 200,
            align: 'center',
        },
        {
            title: 'Phòng - Toà nhà - Khu trọ',
            key: 'boardingAndBuilding',
            width: 250,
            align: 'center',
            render: (_, record) => (
                <>
                    {record.roomNumber} - {record.buildingName} - {record.boardingHouseName}
                </>
            ),
        },
        {
            title: 'Mô tả sự cố',
            dataIndex: 'description',
            key: 'description',
            width: 300,
            align: 'center',
            ellipsis: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            align: 'center',
            render: renderStatusTag
        },
        {
            title: 'Ngày dự kiến xử lý',
            dataIndex: 'expectedResolveDate',
            key: 'expectedResolveDate',
            width: 180,
            align: 'center',
            render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            align: 'center',
            render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            fixed: 'right',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <>
                    <SmartButton
                        type="primary"
                        icon={<EditOutlined/>}
                        buttonWidth={40}
                        onClick={() => handleEditIncidentReport(record)}
                    />
                    <SmartButton
                        type="danger"
                        icon={<DeleteOutlined/>}
                        buttonWidth={40}
                        onClick={() => handleDeleteIncidentReport(record)}
                        style={{marginLeft: '8px'}}
                    />
                </>
            ),
        },
    ];

    const incidentReportModalFields = [
        {
            label: 'Phòng',
            name: 'roomId',
            type: 'select',
            // disabled: disabledWhenEdit,
            options: roomOptionSource
        },
        {
            label: 'Tiêu đề',
            name: 'title',
            type: 'text',
            rules: [{required: true, message: 'Tiêu đề là bắt buộc!'}],
        },
        {
            label: 'Trạng thái sự cố',
            name: 'status',
            type: 'select',
            options: [
                {label: 'Chờ xử lý', value: 'PENDING'},
                {label: 'Đang xử lý', value: 'IN_PROGRESS'},
                {label: 'Đã xử lý', value: 'RESOLVED'},
                {label: 'Từ chối', value: 'REJECTED'},
            ],
        },
        {
            label: 'Ngày dự kiến xử lý',
            name: 'expectedResolveDate',
            type: 'date',
            disabledDate: disablePastDates
        },
        {
            label: 'Mô tả',
            name: 'description',
            type: 'textarea',
        },
    ];

    useEffect(() => {
        handleGetAllRooms();
        handleGetIncidentReports();
    }, []);

    const handleGetAllRooms = async () => {
        try {
            const response = await getAllRoomNoPaged();
            const mappedRooms = response.map(rm => ({
                value: rm.id,
                label: `Phòng ${rm.roomNumber} - ${rm.boardingHouseName}`
            }));
            setRoomOptionSource(mappedRooms);
        } catch (error) {
            console.error('Error fetching users:', error);
            setRoomOptionSource([]);
        }
    };

    const handleGetIncidentReports = async (page = 1, pageSize = pagination.pageSize) => {
        setLoading(true);
        try {
            const response = await getAllIncidentReports({page: page - 1, pageSize});
            if (response && Array.isArray(response.content)) {

                const mapped = response.content.map(rp => {
                    const matchedRoom = roomOptionSource.find(rm =>
                        rm.label.includes(rp.roomNumber) && rm.label.includes(rp.boardingHouseName)
                    );
                    return {
                        ...rp,
                        roomId: matchedRoom?.value || null,
                    };
                });

                setIncidentReportSource(mapped);
                setPagination({
                    current: page,
                    pageSize,
                    total: response.totalElements,
                });
            } else {
                setIncidentReportSource([]);
                message.error('Dữ liệu khu nhà không hợp lệ');
            }
        } catch (error) {
            message.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddIncidentReport = () => {
        setModalMode('create');
        setSelectedIncidentReport(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallCreateIncidentReport = async (formData) => {
        try {
            await createIncidentReport(formData);
            handleGetIncidentReports();
            setIsModalOpen(false);
        } catch (error) {
            message.error(
                `Lỗi khi tạo khu nhà: ${
                    error.response?.data?.message || error.message
                }`,
            );
        }
    };

    const handleEditIncidentReport = (record) => {
        setSelectedIncidentReport(record);
        setModalMode('edit');

        form.setFieldsValue({
            roomId: record.roomId,
            title: record.title,
            description: record.description
        });
        setIsModalOpen(true);
    };


    const handleCallUpdateIncidentReport = async (formData) => {
        try {
            await updateIncidentReport(selectedIncidentReport.id, formData);
            handleGetIncidentReports();
            setIsModalOpen(false);
        } catch (error) {
            message.error(
                `Lỗi khi cập nhật khu nhà: ${
                    error.response?.data?.message || error.message
                }`,
            );
        }
    };

    const handleDeleteIncidentReport = (record) => {
        setModalMode('delete');
        setSelectedIncidentReport(record);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallDeleteIncidentReport = async () => {
        await deleteIncidentReport(selectedIncidentReport.id);
        handleGetIncidentReports();
        setIsModalOpen(false);
    };

    const handleFormSubmit = (formData) => {
        if (modalMode === 'create') {
            handleCallCreateIncidentReport(formData);
        } else if (modalMode === 'edit') {
            handleCallUpdateIncidentReport(formData);
        } else if (modalMode === 'delete') {
            handleCallDeleteIncidentReport();
        }
        setIsModalOpen(false);
    };

    const handleTableChange = (pagination) => {
        handleGetIncidentReports(pagination.current, pagination.pageSize);
    };

    const getModalTitle = () => {
        switch (modalMode) {
            case 'create':
                return 'Thêm toà nhà mới';
            case 'edit':
                return 'Chỉnh sửa toà nhà';
            case 'delete':
                return 'Xóa toà nhà';
            default:
                return 'Chi tiết toà nhà';
        }
    };

    const handleViewIncidentReport = (record) => {
        setSelectedIncidentReport(record);
        setModalMode('view');
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    return (
        <div className={cx('incidentReport-wrapper')}>
            {/* Header */}
            <div className={cx('sub_header')}>
                <SmartInput size="large" placeholder="Tìm kiếm khu nhà" icon={<SearchOutlined/>}/>
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
                    <SmartButton title="Thêm" icon={<PlusOutlined/>} type="primary" onClick={handleAddIncidentReport}/>
                    <SmartButton title="Bộ lọc" icon={<FilterOutlined/>}/>
                    <SmartButton title="Excel" icon={<CloudUploadOutlined/>}/>
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        showSizeChanger
                        showQuickJumper
                        pageSizeOptions={['6', '12', '24']}
                        onChange={(page, pageSize) => handleGetIncidentReports(page, pageSize)}
                    />
                </div>
            </div>

            {/* Nội dung */}
            <div className={cx('incidentReport-container')}>
                {viewMode === 'table' ? (
                    <SmartTable
                        columns={columns}
                        dataSources={incidentReportSource}
                        loading={loading}
                        pagination={false}
                        onTableChange={handleTableChange}
                    />
                ) : (
                    <Row gutter={[16, 16]} className={cx('card-grid')}>
                        {incidentReportSource.map((incidentReport) => (
                            <Col xs={24} sm={24} md={12} lg={8} xl={6} key={incidentReport.id}>
                                {/*<IncidentReportCard*/}
                                {/*    incidentReport={incidentReport}*/}
                                {/*    onView={() => handleViewIncidentReport(incidentReport)}*/}
                                {/*    onEdit={() => handleEditIncidentReport(incidentReport)}*/}
                                {/*    onDelete={() => handleDeleteIncidentReport(incidentReport)}*/}
                                {/*/>*/}
                            </Col>
                        ))}
                    </Row>
                )}
            </div>

            {/* Modal */}
            <PopupModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                title={getModalTitle()}
                fields={modalMode === 'delete' ? [] : incidentReportModalFields}
                onSubmit={handleFormSubmit}
                initialValues={selectedIncidentReport}
                isDeleteMode={modalMode === 'delete'}
                formInstance={form}
            />
        </div>
    );
}

export default IncidentReport;
