import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {
    Card,
    Avatar,
    Descriptions,
    Button,
    Row,
    Col,
    Divider,
    message,
    Upload,
    Watermark,
    Badge,
    Space,
    Typography,
    Tooltip
} from 'antd';
import {
    UserOutlined,
    UploadOutlined,
    ArrowLeftOutlined,
    CalendarOutlined,
    PhoneOutlined,
    MailOutlined,
    HomeOutlined,
    IdcardOutlined
} from '@ant-design/icons';
import moment from 'moment';
import {tenantDetail} from '~/service/admin/tenant';
import {uploadFile, getPresignedUrl} from '~/service/admin/uploadFile';
import {useAuth} from '~/routes/AuthContext';
import 'moment/locale/vi';
import CustomTabs from "~/components/Layout/AdminLayout/components/Tab";
// import WorkHistory from "~/pages/AdminDashboard/WorkHistory";
// import Skill from "~/pages/AdminDashboard/Skill";
// import Education from "~/pages/AdminDashboard/Education";
// import Leave from "~/pages/AdminDashboard/Leave";
// import Position from "~/pages/AdminDashboard/Position";
// import Contract from "~/pages/AdminDashboard/Contract";

const {Title, Text} = Typography;

moment.locale('vi');

function TenantDetail() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {user} = useAuth();
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [avatarUrl, setAvatarUrl] = useState(null);

    useEffect(() => {
        if (!user || !user.token) {
            message.error('Vui lòng đăng nhập để xem chi tiết nhân viên');
            navigate('/login');
            return;
        }

        const fetchTenant = async () => {
            try {
                const response = await tenantDetail(id);
                if (response) {
                    setTenant({
                        ...response,
                        dateOfBirth: response.dateOfBirth ? moment(response.dateOfBirth).format('YYYY-MM-DD') : null,
                        hireDate: response.hireDate ? moment(response.hireDate).format('YYYY-MM-DD') : null,
                    });

                    // Lấy presigned URL nếu có profilePictureId
                    if (response.profilePictureId) {
                        const presignedUrl = await getPresignedUrl(response.profilePictureId);
                        setAvatarUrl(presignedUrl);
                    } else {
                        setAvatarUrl('/default-avatar.png');
                    }
                } else {
                    throw new Error('Không tìm thấy nhân viên');
                }
            } catch (error) {
                message.error(`Lỗi khi load chi tiết nhân viên: ${error.message}`);
                navigate('/admin/Tenant');
            } finally {
                setLoading(false);
            }
        };
        fetchTenant();
    }, [id, user, navigate]);

    const handleAvatarUpload = async (file) => {
        try {
            const uploadedFile = await uploadFile(file, parseInt(id));
            const presignedUrl = await getPresignedUrl(uploadedFile.result.id);
            setAvatarUrl(presignedUrl);
            message.success('Tải ảnh đại diện thành công!');

            const updatedTenant = await TenantDetail(id);
            setTenant(updatedTenant);
        } catch (error) {
            message.error(`Lỗi khi tải ảnh đại diện: ${error.message}`);
        }
        return false;
    };

    if (loading) return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh'
        }}>
            <Text>Đang tải...</Text>
        </div>
    );

    if (!tenant) return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh'
        }}>
            <Text type="secondary">Không tìm thấy nhân viên</Text>
        </div>
    );

    const tabItems = [
        // {
        //     key: '1',
        //     label: 'Lịch sử công việc',
        //     children: <WorkHistory TenantId={id}/>,
        // },
        // {
        //     key: '2',
        //     label: 'Kỹ năng',
        //     children: <Skill TenantId={id}/>,
        // },
        // {
        //     key: '3',
        //     label: 'Học vấn',
        //     children: <Education TenantId={id}/>,
        // },
        // {
        //     key: '4',
        //     label: 'Nghĩ phép',
        //     children: <Leave TenantId={id}/>,
        // },
        // {
        //     key: '5',
        //     label: 'Vị trí công việc',
        //     children: <Position TenantId={id}/>,
        // },
        // {
        //     key: '6',
        //     label: 'Hợp đồng',
        //     children: <Contract TenantId={id}/>,
        // },
        {
            key: '7',
            label: 'Báo cáo',
            children: (
                <Card style={{minHeight: 400}}>
                    <Watermark content="Ant Design">
                        <div style={{height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <Text type="secondary">Nội dung báo cáo sẽ được hiển thị ở đây</Text>
                        </div>
                    </Watermark>
                </Card>
            ),
        },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            padding: '0 16px',
            // background: '#f5f5f5'
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                // paddingTop: '20px'
            }}>
                {/* Header với nút quay lại */}
                <div style={{
                    marginBottom: '20px',
                    padding: '0 4px'
                }}>
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined/>}
                        onClick={() => navigate('/admin/tenant')}
                        style={{
                            fontSize: '14px',
                            height: '40px',
                            paddingLeft: '12px',
                            paddingRight: '16px'
                        }}
                    >
                        Quay lại danh sách nhân viên
                    </Button>
                </div>

                {/* Card thông tin chính */}
                <Card
                    style={{
                        marginBottom: '24px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        border: 'none',
                        overflow: 'hidden'
                    }}
                    bodyStyle={{
                        padding: '32px 32px 24px 32px',
                        background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)'
                    }}
                >
                    <Row gutter={[32, 32]} align="middle">
                        {/* Cột avatar - responsive */}
                        <Col
                            xs={{span: 24, order: 1}}
                            sm={{span: 24, order: 1}}
                            md={{span: 8, order: 1}}
                            lg={{span: 6, order: 1}}
                            xl={{span: 5, order: 1}}
                        >
                            <div style={{
                                textAlign: 'center',
                                padding: '0 16px'
                            }}>
                                <div style={{
                                    position: 'relative',
                                    display: 'inline-block',
                                    marginBottom: '20px'
                                }}>
                                    <Avatar
                                        size={140}
                                        src={avatarUrl}
                                        icon={<UserOutlined/>}
                                        style={{
                                            border: '5px solid #ffffff',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                        }}
                                    />
                                </div>
                                <Upload
                                    name="avatar"
                                    showUploadList={false}
                                    beforeUpload={handleAvatarUpload}
                                    accept="image/*"
                                >
                                    <Button
                                        icon={<UploadOutlined/>}
                                        type="primary"
                                        ghost
                                        style={{
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            height: '36px',
                                            paddingLeft: '16px',
                                            paddingRight: '16px'
                                        }}
                                    >
                                        Cập nhật ảnh
                                    </Button>
                                </Upload>
                            </div>
                        </Col>

                        {/* Cột thông tin - responsive */}
                        <Col
                            xs={{span: 24, order: 2}}
                            sm={{span: 24, order: 2}}
                            md={{span: 16, order: 2}}
                            lg={{span: 18, order: 2}}
                            xl={{span: 19, order: 2}}
                        >
                            <div style={{
                                textAlign: {xs: 'center', md: 'left'}[0] || 'left',
                                padding: '0 8px'
                            }}>
                                {/* Tên và mã nhân viên */}
                                <div style={{marginBottom: '20px'}}>
                                    <Title
                                        level={1}
                                        style={{
                                            margin: '0 0 8px 0',
                                            color: '#1a1a1a',
                                            fontSize: 'clamp(24px, 4vw, 32px)',
                                            fontWeight: '700',
                                            lineHeight: '1.2'
                                        }}
                                    >
                                        {tenant.lastName} {tenant.firstName}
                                    </Title>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: {xs: 'center', md: 'flex-start'}[0] || 'flex-start',
                                        gap: '12px',
                                        flexWrap: 'wrap',
                                        marginBottom: '16px'
                                    }}>
                                        <Text
                                            type="secondary"
                                            style={{
                                                fontSize: '16px',
                                                fontWeight: '500'
                                            }}
                                        >
                                            <IdcardOutlined style={{marginRight: '8px', color: '#1890ff'}}/>
                                            Mã NV: {tenant.tenantCode}
                                        </Text>
                                        <Badge
                                            status={tenant.active ? "success" : "error"}
                                            text={
                                                <Text strong style={{
                                                    fontSize: '14px',
                                                    color: tenant.active ? '#52c41a' : '#ff4d4f'
                                                }}>
                                                    {tenant.active ? 'Đang hoạt động' : 'Không hoạt động'}
                                                </Text>
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Thông tin liên hệ nhanh */}
                                <div style={{marginTop: '24px'}}>
                                    <Row gutter={[16, 16]} justify={{xs: 'center', md: 'start'}[0] || 'start'}>
                                        <Col xs={24} sm={12} md={24} lg={12}>
                                            <div style={{
                                                background: '#ffffff',
                                                padding: '12px 16px',
                                                borderRadius: '10px',
                                                border: '1px solid #f0f0f0',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px'
                                            }}>
                                                <MailOutlined style={{
                                                    fontSize: '18px',
                                                    color: '#1890ff',
                                                    flexShrink: 0
                                                }}/>
                                                <div style={{flex: 1, minWidth: 0}}>
                                                    <Text style={{
                                                        fontSize: '13px',
                                                        color: '#666',
                                                        display: 'block',
                                                        marginBottom: '2px'
                                                    }}>
                                                        Email
                                                    </Text>
                                                    <Text style={{
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                        wordBreak: 'break-all'
                                                    }}>
                                                        {tenant.email}
                                                    </Text>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col xs={24} sm={12} md={24} lg={12}>
                                            <div style={{
                                                background: '#ffffff',
                                                padding: '12px 16px',
                                                borderRadius: '10px',
                                                border: '1px solid #f0f0f0',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px'
                                            }}>
                                                <PhoneOutlined style={{
                                                    fontSize: '18px',
                                                    color: '#52c41a',
                                                    flexShrink: 0
                                                }}/>
                                                <div style={{flex: 1, minWidth: 0}}>
                                                    <Text style={{
                                                        fontSize: '13px',
                                                        color: '#666',
                                                        display: 'block',
                                                        marginBottom: '2px'
                                                    }}>
                                                        Số điện thoại
                                                    </Text>
                                                    <Text style={{
                                                        fontSize: '14px',
                                                        fontWeight: '500'
                                                    }}>
                                                        {tenant.phone}
                                                    </Text>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Divider style={{
                        margin: '32px 0 28px 0',
                        borderColor: '#e8e8e8'
                    }}/>

                    {/* Thông tin chi tiết - responsive grid */}
                    <Row gutter={[32, 24]}>
                        <Col xs={24} lg={12}>
                            <div style={{
                                background: '#ffffff',
                                padding: '24px',
                                borderRadius: '12px',
                                border: '1px solid #f0f0f0',
                                height: '100%'
                            }}>
                                <Title level={5} style={{
                                    marginBottom: '20px',
                                    color: '#1a1a1a',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}>
                                    Thông tin cá nhân
                                </Title>
                                <Descriptions
                                    column={1}
                                    size="middle"
                                    labelStyle={{
                                        fontWeight: '500',
                                        color: '#666',
                                        width: '140px',
                                        fontSize: '14px'
                                    }}
                                    contentStyle={{
                                        color: '#1a1a1a',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                    colon={false}
                                >
                                    <Descriptions.Item
                                        label={
                                            <Space size={8}>
                                                <CalendarOutlined style={{color: '#1890ff'}}/>
                                                Ngày sinh
                                            </Space>
                                        }
                                    >
                                        {tenant.dateOfBirth ? moment(tenant.dateOfBirth).format('DD/MM/YYYY') : 'Chưa cập nhật'}
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label={
                                            <Space size={8}>
                                                <UserOutlined style={{color: '#722ed1'}}/>
                                                Giới tính
                                            </Space>
                                        }
                                    >
                                        {tenant.gender || 'Chưa cập nhật'}
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label={
                                            <Space size={8}>
                                                <HomeOutlined style={{color: '#fa8c16'}}/>
                                                Địa chỉ
                                            </Space>
                                        }
                                    >
                                        <div style={{wordBreak: 'break-word'}}>
                                            {tenant.address || 'Chưa cập nhật'}
                                        </div>
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                        </Col>

                        <Col xs={24} lg={12}>
                            <div style={{
                                background: '#ffffff',
                                padding: '24px',
                                borderRadius: '12px',
                                border: '1px solid #f0f0f0',
                                height: '100%'
                            }}>
                                <Title level={5} style={{
                                    marginBottom: '20px',
                                    color: '#1a1a1a',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}>
                                    Thông tin công việc
                                </Title>
                                <Descriptions
                                    column={1}
                                    size="middle"
                                    labelStyle={{
                                        fontWeight: '500',
                                        color: '#666',
                                        width: '140px',
                                        fontSize: '14px'
                                    }}
                                    contentStyle={{
                                        color: '#1a1a1a',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                    colon={false}
                                >
                                    <Descriptions.Item
                                        label={
                                            <Space size={8}>
                                                <CalendarOutlined style={{color: '#52c41a'}}/>
                                                Ngày vào làm
                                            </Space>
                                        }
                                    >
                                        {tenant.hireDate ? moment(tenant.hireDate).format('DD/MM/YYYY') : 'Chưa cập nhật'}
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label={
                                            <Space size={8}>
                                                <IdcardOutlined style={{color: '#13c2c2'}}/>
                                                Ngày tạo
                                            </Space>
                                        }
                                    >
                                        {tenant.createdAt ? moment(tenant.createdAt).format('DD/MM/YYYY HH:mm') : 'N/A'}
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label={
                                            <Space size={8}>
                                                <UserOutlined style={{color: '#eb2f96'}}/>
                                                Cập nhật cuối
                                            </Space>
                                        }
                                    >
                                        {tenant.updatedAt ? moment(tenant.updatedAt).format('DD/MM/YYYY HH:mm') : 'N/A'}
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                        </Col>
                    </Row>
                </Card>

                {/* Tab content */}
                <Card
                    style={{
                        borderRadius: '16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        border: 'none',
                        marginBottom: '24px'
                    }}
                    bodyStyle={{
                        padding: '35px',
                        overflow: 'hidden'
                    }}
                >
                    <CustomTabs
                        items={tabItems}
                        defaultActiveKey="1"
                        tabPosition="top"
                        onChange={(key) => console.log('Tab changed:', key)}
                        style={{
                            minHeight: '400px'
                        }}
                        tabBarStyle={{
                            padding: '0 24px',
                            margin: 0,
                            background: '#fafafa',
                            borderBottom: '1px solid #f0f0f0'
                        }}
                        contentStyle={{
                            padding: '24px'
                        }}
                    />
                </Card>
            </div>
        </div>
    );
}

export default TenantDetail;