import React, {useState} from 'react';
import {
    Card,
    Table,
    Button,
    Tag,
    Space,
    Modal,
    Form,
    Input,
    InputNumber,
    Switch,
    message,
    Popconfirm,
    Tooltip,
    Row,
    Col,
    Statistic,
    Badge,
    Divider,
    Select
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    CrownOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    HomeOutlined,
    BuildOutlined,
    TeamOutlined,
    FileTextOutlined,
    DollarOutlined,
    CalendarOutlined,
    EyeOutlined,
    SettingOutlined
} from '@ant-design/icons';

const {TextArea} = Input;

// Mock Data
const mockPlans = [{
    id: 1,
    code: 'FREE',
    name: 'Miễn phí',
    description: 'Gói cơ bản cho người mới bắt đầu',
    fullDescription: '## Gói miễn phí\n\nPhù hợp cho chủ trọ mới bắt đầu:\n- Quản lý 1 nhà trọ\n- Tối đa 5 phòng\n- Các tính năng cơ bản',
    maxBoardingHouses: 1,
    maxBuildings: 1,
    maxRooms: 5,
    maxTenants: 10,
    maxActiveContracts: 5,
    pricePerMonth: 0,
    durationDays: null,
    isActive: true,
    totalUsers: 1250,
    createdAt: '2024-01-01'
}, {
    id: 2,
    code: 'BASIC',
    name: 'Cơ bản',
    description: 'Dành cho chủ trọ nhỏ',
    fullDescription: '## Gói cơ bản\n\nPhù hợp cho chủ trọ quy mô nhỏ:\n- Quản lý 2 nhà trọ\n- Tối đa 20 phòng\n- Đầy đủ tính năng cơ bản',
    maxBoardingHouses: 2,
    maxBuildings: 3,
    maxRooms: 20,
    maxTenants: 40,
    maxActiveContracts: 20,
    pricePerMonth: 150000,
    durationDays: 30,
    isActive: true,
    totalUsers: 450,
    createdAt: '2024-01-01'
}, {
    id: 3,
    code: 'STANDARD',
    name: 'Tiêu chuẩn',
    description: 'Dành cho chủ trọ quy mô vừa',
    fullDescription: '## Gói tiêu chuẩn\n\nPhù hợp cho chủ trọ quy mô vừa:\n- Quản lý 5 nhà trọ\n- Tối đa 50 phòng\n- Tính năng nâng cao',
    maxBoardingHouses: 5,
    maxBuildings: 8,
    maxRooms: 50,
    maxTenants: 100,
    maxActiveContracts: 50,
    pricePerMonth: 350000,
    durationDays: 30,
    isActive: true,
    totalUsers: 280,
    createdAt: '2024-01-01'
}, {
    id: 4,
    code: 'PRO',
    name: 'Chuyên nghiệp',
    description: 'Dành cho chủ trọ chuyên nghiệp',
    fullDescription: '## Gói chuyên nghiệp\n\nPhù hợp cho chủ trọ chuyên nghiệp:\n- Quản lý 15 nhà trọ\n- Tối đa 200 phòng\n- Toàn bộ tính năng cao cấp',
    maxBoardingHouses: 15,
    maxBuildings: 20,
    maxRooms: 200,
    maxTenants: 400,
    maxActiveContracts: 200,
    pricePerMonth: 799000,
    durationDays: 30,
    isActive: true,
    totalUsers: 95,
    createdAt: '2024-01-01'
}, {
    id: 5,
    code: 'ENTERPRISE',
    name: 'Doanh nghiệp',
    description: 'Giải pháp cho doanh nghiệp lớn',
    fullDescription: '## Gói doanh nghiệp\n\nGiải pháp toàn diện:\n- Không giới hạn nhà trọ\n- Không giới hạn phòng\n- Hỗ trợ ưu tiên 24/7',
    maxBoardingHouses: 999,
    maxBuildings: 999,
    maxRooms: 9999,
    maxTenants: 9999,
    maxActiveContracts: 9999,
    pricePerMonth: 1999000,
    durationDays: 30,
    isActive: true,
    totalUsers: 12,
    createdAt: '2024-01-01'
}];

function AdminSubscriptionPlan() {
    const [plans, setPlans] = useState(mockPlans);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [form] = Form.useForm();

    // Statistics
    const stats = {
        totalPlans: plans.length,
        activePlans: plans.filter(p => p.isActive).length,
        totalUsers: plans.reduce((sum, p) => sum + p.totalUsers, 0),
        totalRevenue: plans.reduce((sum, p) => sum + (p.pricePerMonth * p.totalUsers), 0)
    };

    const getPlanColor = (code) => {
        const colors = {
            FREE: 'default', BASIC: 'blue', STANDARD: 'cyan', PRO: 'purple', ENTERPRISE: 'gold'
        };
        return colors[code] || 'default';
    };

    const getPlanIcon = (code) => {
        const icons = {
            FREE: '🆓', BASIC: '📦', STANDARD: '⭐', PRO: '👑', ENTERPRISE: '🏢'
        };
        return icons[code] || '📋';
    };

    const handleCreate = () => {
        setEditingPlan(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingPlan(record);
        form.setFieldsValue({
            ...record, durationDays: record.durationDays || undefined
        });
        setModalVisible(true);
    };

    const handleViewDetail = (record) => {
        setSelectedPlan(record);
        setDetailModalVisible(true);
    };

    const handleDelete = (id) => {
        const plan = plans.find(p => p.id === id);
        if (plan.totalUsers > 0) {
            message.warning(`Không thể xóa gói "${plan.name}" vì đang có ${plan.totalUsers} người dùng`);
            return;
        }
        setPlans(plans.filter(p => p.id !== id));
        message.success('Đã xóa gói thành công');
    };

    const handleToggleStatus = (id) => {
        setPlans(plans.map(p => p.id === id ? {...p, isActive: !p.isActive} : p));
        const plan = plans.find(p => p.id === id);
        message.success(`Đã ${plan.isActive ? 'tắt' : 'bật'} gói "${plan.name}"`);
    };

    const handleSubmit = (values) => {
        if (editingPlan) {
            // Update
            setPlans(plans.map(p => p.id === editingPlan.id ? {
                ...p, ...values,
                updatedAt: new Date().toISOString()
            } : p));
            message.success('Cập nhật gói thành công');
        } else {
            // Create
            const newPlan = {
                id: Math.max(...plans.map(p => p.id)) + 1, ...values, totalUsers: 0, createdAt: new Date().toISOString()
            };
            setPlans([...plans, newPlan]);
            message.success('Tạo gói mới thành công');
        }
        setModalVisible(false);
        form.resetFields();
    };

    const columns = [{
        title: 'Gói',
        key: 'plan',
        width: 220,
        fixed: 'left',
        render: (_, record) => (<div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <span style={{fontSize: 28}}>{getPlanIcon(record.code)}</span>
                <div>
                    <div style={{fontWeight: 600, fontSize: 15, marginBottom: 4}}>
                        {record.name}
                    </div>
                    <Tag color={getPlanColor(record.code)} style={{margin: 0}}>
                        {record.code}
                    </Tag>
                </div>
            </div>)
    }, {
        title: 'Giới hạn',
        key: 'limits',
        width: 280,
        render: (_, record) => (<Space direction="vertical" size={4} style={{width: '100%'}}>
                <div style={{fontSize: 13}}>
                    <HomeOutlined style={{color: '#1890ff', marginRight: 6}}/>
                    <strong>Nhà trọ:</strong> {record.maxBoardingHouses === 999 ? '∞' : record.maxBoardingHouses}
                    {' / '}
                    <BuildOutlined style={{color: '#52c41a', marginLeft: 8, marginRight: 6}}/>
                    <strong>Tòa:</strong> {record.maxBuildings === 999 ? '∞' : record.maxBuildings}
                </div>
                <div style={{fontSize: 13}}>
                    <TeamOutlined style={{color: '#fa8c16', marginRight: 6}}/>
                    <strong>Phòng:</strong> {record.maxRooms === 9999 ? '∞' : record.maxRooms}
                    {' / '}
                    <strong>Khách:</strong> {record.maxTenants === 9999 ? '∞' : record.maxTenants}
                </div>
            </Space>)
    }, {
        title: 'Giá', key: 'price', width: 160, render: (_, record) => (<div>
                <div style={{
                    fontSize: 18, fontWeight: 700, color: record.pricePerMonth === 0 ? '#52c41a' : '#722ed1'
                }}>
                    {record.pricePerMonth === 0 ? 'Miễn phí' : `${record.pricePerMonth.toLocaleString('vi-VN')}đ`}
                </div>
                {record.durationDays && (<div style={{fontSize: 12, color: '#8c8c8c', marginTop: 4}}>
                        {record.durationDays} ngày
                    </div>)}
            </div>)
    }, {
        title: 'Người dùng',
        dataIndex: 'totalUsers',
        key: 'totalUsers',
        width: 120,
        align: 'center',
        render: (count) => (<Badge count={count} showZero style={{backgroundColor: '#1890ff'}}/>)
    }, {
        title: 'Doanh thu/tháng',
        key: 'revenue',
        width: 140,
        align: 'right',
        render: (_, record) => (<span style={{fontWeight: 600, color: '#262626'}}>
          {(record.pricePerMonth * record.totalUsers).toLocaleString('vi-VN')}đ
        </span>)
    }, {
        title: 'Trạng thái',
        dataIndex: 'isActive',
        key: 'isActive',
        width: 120,
        align: 'center',
        render: (isActive, record) => (<Switch
                checked={isActive}
                onChange={() => handleToggleStatus(record.id)}
                checkedChildren={<CheckCircleOutlined/>}
                unCheckedChildren={<CloseCircleOutlined/>}
            />)
    }, {
        title: 'Thao tác', key: 'action', fixed: 'right', width: 180, render: (_, record) => (<Space size="small">
                <Tooltip title="Xem chi tiết">
                    <Button
                        type="text"
                        icon={<EyeOutlined/>}
                        onClick={() => handleViewDetail(record)}
                    />
                </Tooltip>
                <Tooltip title="Chỉnh sửa">
                    <Button
                        type="text"
                        icon={<EditOutlined/>}
                        onClick={() => handleEdit(record)}
                    />
                </Tooltip>
                <Popconfirm
                    title="Xóa gói?"
                    description={`Bạn có chắc muốn xóa gói "${record.name}"?`}
                    onConfirm={() => handleDelete(record.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    disabled={record.totalUsers > 0}
                >
                    <Tooltip title={record.totalUsers > 0 ? 'Không thể xóa gói đang có người dùng' : 'Xóa'}>
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined/>}
                            disabled={record.totalUsers > 0}
                        />
                    </Tooltip>
                </Popconfirm>
            </Space>)
    }];

    return (<div style={{padding: 24, background: '#f5f5f5', minHeight: '100vh'}}>
            {/* Header */}
            <div style={{marginBottom: 24}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                        <h1 style={{
                            fontSize: 28,
                            fontWeight: 700,
                            margin: 0,
                            marginBottom: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12
                        }}>
                            <CrownOutlined style={{color: '#722ed1'}}/>
                            Quản lý Gói dịch vụ
                        </h1>
                        <p style={{fontSize: 14, color: '#8c8c8c', margin: 0}}>
                            Quản lý các gói subscription cho người dùng thuê
                        </p>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined/>}
                        onClick={handleCreate}
                        style={{height: 44}}
                    >
                        Tạo gói mới
                    </Button>
                </div>
            </div>

            {/* Statistics */}
            <Row gutter={16} style={{marginBottom: 24}}>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        style={{
                            borderRadius: 12, borderLeft: '4px solid #1890ff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                    >
                        <Statistic
                            title="Tổng số gói"
                            value={stats.totalPlans}
                            prefix={<SettingOutlined/>}
                            valueStyle={{color: '#1890ff', fontSize: 28}}
                        />
                        <div style={{marginTop: 8, fontSize: 13, color: '#8c8c8c'}}>
                            {stats.activePlans} gói đang hoạt động
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        style={{
                            borderRadius: 12, borderLeft: '4px solid #52c41a', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                    >
                        <Statistic
                            title="Tổng người dùng"
                            value={stats.totalUsers}
                            prefix={<TeamOutlined/>}
                            valueStyle={{color: '#52c41a', fontSize: 28}}
                        />
                        <div style={{marginTop: 8, fontSize: 13, color: '#8c8c8c'}}>
                            Đang sử dụng các gói
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        style={{
                            borderRadius: 12, borderLeft: '4px solid #722ed1', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                    >
                        <Statistic
                            title="Doanh thu/tháng"
                            value={stats.totalRevenue}
                            prefix={<DollarOutlined/>}
                            suffix="đ"
                            valueStyle={{color: '#722ed1', fontSize: 28}}
                        />
                        <div style={{marginTop: 8, fontSize: 13, color: '#8c8c8c'}}>
                            Từ subscription
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        style={{
                            borderRadius: 12, borderLeft: '4px solid #fa8c16', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                    >
                        <Statistic
                            title="Gói phổ biến nhất"
                            value={plans.sort((a, b) => b.totalUsers - a.totalUsers)[0]?.name || 'N/A'}
                            valueStyle={{color: '#fa8c16', fontSize: 22}}
                        />
                        <div style={{marginTop: 8, fontSize: 13, color: '#8c8c8c'}}>
                            {plans.sort((a, b) => b.totalUsers - a.totalUsers)[0]?.totalUsers || 0} người dùng
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Table */}
            <Card
                style={{
                    borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
                bodyStyle={{padding: 0}}
            >
                <Table
                    columns={columns}
                    dataSource={plans}
                    rowKey="id"
                    scroll={{x: 1200}}
                    pagination={{
                        pageSize: 10, showTotal: (total) => `Tổng ${total} gói`, showSizeChanger: true
                    }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={<div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <CrownOutlined style={{color: '#722ed1'}}/>
                    {editingPlan ? 'Chỉnh sửa gói' : 'Tạo gói mới'}
                </div>}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText={editingPlan ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        isActive: true,
                        maxBoardingHouses: 1,
                        maxBuildings: 1,
                        maxRooms: 5,
                        maxTenants: 10,
                        maxActiveContracts: 5,
                        pricePerMonth: 0
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="code"
                                label="Mã gói"
                                rules={[{required: true, message: 'Vui lòng nhập mã gói'}]}
                            >
                                <Input placeholder="VD: BASIC, PRO..."/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Tên gói"
                                rules={[{required: true, message: 'Vui lòng nhập tên gói'}]}
                            >
                                <Input placeholder="VD: Gói cơ bản"/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="description"
                        label="Mô tả ngắn"
                    >
                        <TextArea rows={2} placeholder="Mô tả ngắn về gói (hiển thị trên card pricing)"/>
                    </Form.Item>

                    <Form.Item
                        name="fullDescription"
                        label="Mô tả chi tiết (Markdown)"
                    >
                        <TextArea rows={4} placeholder="Mô tả chi tiết (hỗ trợ Markdown)"/>
                    </Form.Item>

                    <Divider>Giới hạn</Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="maxBoardingHouses"
                                label="Số nhà trọ tối đa"
                                rules={[{required: true, message: 'Vui lòng nhập số nhà trọ'}]}
                            >
                                <InputNumber min={1} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="maxBuildings"
                                label="Số tòa tối đa"
                                rules={[{required: true, message: 'Vui lòng nhập số tòa'}]}
                            >
                                <InputNumber min={1} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="maxRooms"
                                label="Số phòng tối đa"
                                rules={[{required: true, message: 'Vui lòng nhập số phòng'}]}
                            >
                                <InputNumber min={1} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="maxTenants"
                                label="Số khách thuê tối đa"
                                rules={[{required: true, message: 'Vui lòng nhập số khách'}]}
                            >
                                <InputNumber min={1} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="maxActiveContracts"
                                label="Hợp đồng tối đa"
                                rules={[{required: true, message: 'Vui lòng nhập số hợp đồng'}]}
                            >
                                <InputNumber min={1} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider>Giá & Thời hạn</Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="pricePerMonth"
                                label="Giá/tháng (VNĐ)"
                                rules={[{required: true, message: 'Vui lòng nhập giá'}]}
                            >
                                <InputNumber
                                    min={0}
                                    style={{width: '100%'}}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="durationDays"
                                label="Thời hạn (ngày)"
                                tooltip="Để trống nếu gói vĩnh viễn"
                            >
                                <InputNumber min={1} style={{width: '100%'}} placeholder="VD: 30, 365..."/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="isActive"
                        label="Trạng thái"
                        valuePropName="checked"
                    >
                        <Switch
                            checkedChildren="Hoạt động"
                            unCheckedChildren="Tắt"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Detail Modal */}
            <Modal
                title={<div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <span style={{fontSize: 24}}>{selectedPlan && getPlanIcon(selectedPlan.code)}</span>
                    Chi tiết gói: {selectedPlan?.name}
                </div>}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[<Button key="close" onClick={() => setDetailModalVisible(false)}>
                    Đóng
                </Button>, <Button key="edit" type="primary" icon={<EditOutlined/>} onClick={() => {
                    setDetailModalVisible(false);
                    handleEdit(selectedPlan);
                }}>
                    Chỉnh sửa
                </Button>]}
                width={700}
            >
                {selectedPlan && (<div>
                        <Row gutter={16} style={{marginBottom: 24}}>
                            <Col span={12}>
                                <Card size="small" style={{background: '#f0f5ff', border: '1px solid #adc6ff'}}>
                                    <Statistic
                                        title="Giá"
                                        value={selectedPlan.pricePerMonth}
                                        suffix="đ/tháng"
                                        valueStyle={{color: '#1890ff', fontSize: 24}}
                                    />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small" style={{background: '#f6ffed', border: '1px solid #b7eb8f'}}>
                                    <Statistic
                                        title="Người dùng"
                                        value={selectedPlan.totalUsers}
                                        valueStyle={{color: '#52c41a', fontSize: 24}}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        <Divider orientation="left">Thông tin cơ bản</Divider>
                        <Space direction="vertical" size="small" style={{width: '100%'}}>
                            <div><strong>Mã gói:</strong> <Tag
                                color={getPlanColor(selectedPlan.code)}>{selectedPlan.code}</Tag></div>
                            <div><strong>Mô tả:</strong> {selectedPlan.description || '—'}</div>
                            <div><strong>Thời
                                hạn:</strong> {selectedPlan.durationDays ? `${selectedPlan.durationDays} ngày` : 'Vĩnh viễn'}
                            </div>
                            <div><strong>Trạng thái:</strong> {selectedPlan.isActive ?
                                <Tag color="success">Hoạt động</Tag> : <Tag>Tắt</Tag>}</div>
                        </Space>

                        <Divider orientation="left">Giới hạn</Divider>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Card size="small" hoverable>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                        <HomeOutlined style={{fontSize: 24, color: '#1890ff'}}/>
                                        <div>
                                            <div style={{fontSize: 12, color: '#8c8c8c'}}>Phòng</div>
                                            <div style={{fontSize: 20, fontWeight: 600}}>
                                                {selectedPlan.maxRooms === 9999 ? '∞' : selectedPlan.maxRooms}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small" hoverable>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                        <FileTextOutlined style={{fontSize: 24, color: '#722ed1'}}/>
                                        <div>
                                            <div style={{fontSize: 12, color: '#8c8c8c'}}>Hợp đồng</div>
                                            <div style={{fontSize: 20, fontWeight: 600}}>
                                                {selectedPlan.maxActiveContracts === 9999 ? '∞' : selectedPlan.maxActiveContracts}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        {selectedPlan.fullDescription && (<>
                                <Divider orientation="left">Mô tả chi tiết</Divider>
                                <div style={{
                                    background: '#fafafa',
                                    padding: 16,
                                    borderRadius: 8,
                                    whiteSpace: 'pre-wrap',
                                    fontSize: 13,
                                    lineHeight: 1.6
                                }}>
                                    {selectedPlan.fullDescription}
                                </div>
                            </>)}

                        <Divider orientation="left">Thống kê</Divider>
                        <Row gutter={16}>
                            <Col span={12}>
                                <div style={{marginBottom: 8}}>
                                    <div style={{fontSize: 12, color: '#8c8c8c', marginBottom: 4}}>Doanh thu/tháng</div>
                                    <div style={{fontSize: 18, fontWeight: 600, color: '#722ed1'}}>
                                        {(selectedPlan.pricePerMonth * selectedPlan.totalUsers).toLocaleString('vi-VN')}đ
                                    </div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div>
                                    <div style={{fontSize: 12, color: '#8c8c8c', marginBottom: 4}}>Ngày tạo</div>
                                    <div style={{fontSize: 14}}>{selectedPlan.createdAt}</div>
                                </div>
                            </Col>
                        </Row>
                    </div>)}
            </Modal>
        </div>);
}

export default AdminSubscriptionPlan;