import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {
    Card,
    Avatar,
    Button,
    Row,
    Col,
    message,
    Upload,
    Badge,
    Typography,
    Spin,
    Tag,
    Divider
} from 'antd';
import {
    UserOutlined,
    UploadOutlined,
    ArrowLeftOutlined,
    EditOutlined,
    PhoneOutlined,
    MailOutlined,
    IdcardOutlined,
    HomeOutlined,
    EnvironmentOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import classNames from 'classnames/bind';
import {tenantDetail, tenantRentalDetail} from '~/service/admin/tenant';
import {getPresignedUrl} from '~/service/admin/contract';
import {uploadFile} from "~/service/admin/user";
import {useAuth} from '~/routes/AuthContext';
import styles from './TenantDetail.module.scss';
import 'moment/locale/vi';

const cx = classNames.bind(styles);
const {Title, Text, Link} = Typography;

moment.locale('vi');

function TenantDetail() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {user} = useAuth();
    const tenantBasePath = user?.role === 'OWNER' ? '/owner/tenants' : '/admin/tenants';
    const [tenant, setTenant] = useState(null);
    const [rentalInfo, setRentalInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [avatarUrl, setAvatarUrl] = useState(null);

    const statusMap = {
        "Đang thuê": { color: "green" },
        "Đang Hiệu Lực": { color: "green" },
        "Đã kết thúc": { color: "gold" },
        "Chưa thuê": { color: "red" },
    };

    useEffect(() => {
        if (!user || !user.token) {
            message.error('Vui lòng đăng nhập để xem chi tiết người thuê');
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const tenantResponse = await tenantDetail(id);
                if (tenantResponse) {
                    setTenant({
                        ...tenantResponse,
                        dateOfBirth: tenantResponse.dateOfBirth ? moment(tenantResponse.dateOfBirth).format('YYYY-MM-DD') : null,
                        hireDate: tenantResponse.hireDate ? moment(tenantResponse.hireDate).format('YYYY-MM-DD') : null,
                    });

                    if (tenantResponse.profilePictureId) {
                        const presignedUrl = await getPresignedUrl(tenantResponse.profilePictureId);
                        setAvatarUrl(presignedUrl);
                    }
                }

                try {
                    const rentalResponse = await tenantRentalDetail(id);
                    setRentalInfo(rentalResponse);
                } catch (rentalError) {
                    console.log('Không có thông tin thuê:', rentalError);
                }
            } catch (error) {
                message.error(`Lỗi khi load chi tiết người thuê: ${error.message}`);
                navigate(tenantBasePath);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, user, navigate, tenantBasePath]);

    const handleAvatarUpload = async (file) => {
        try {
            const uploadedFile = await uploadFile(file, parseInt(id));
            const presignedUrl = await getPresignedUrl(uploadedFile.result.id);
            setAvatarUrl(presignedUrl);
            message.success('Tải ảnh đại diện thành công!');
        } catch (error) {
            message.error(`Lỗi khi tải ảnh đại diện: ${error.message}`);
        }
        return false;
    };

    if (loading) {
        return (
            <div className={cx('loading-container')}>
                <Spin size="large" tip="Đang tải thông tin..."/>
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className={cx('loading-container')}>
                <Text type="secondary">Không tìm thấy người thuê</Text>
            </div>
        );
    }

    const InfoField = ({label, value}) => (
        <div className={cx('info-field')}>
            <Text className={cx('label')}>{label}</Text>
            <Text className={cx('value')}>{value || 'Chưa cập nhật'}</Text>
        </div>
    );

    const formatCurrency = (value) => {
        if (!value) return 'Chưa cập nhật';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    return (
        <div className={cx('tenant-detail')}>
            <div className={cx('container')}>
                {/* Header */}
                <div className={cx('header')}>
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined/>}
                        onClick={() => navigate(tenantBasePath)}
                        className={cx('back-button')}
                    >
                        Quay lại danh sách
                    </Button>
                    <Button
                        type="primary"
                        icon={<EditOutlined/>}
                        onClick={() => navigate(`${tenantBasePath}/${id}/edit`)}
                    >
                        Chỉnh sửa
                    </Button>
                </div>

                {/* Profile Card */}
                <Card className={cx('profile-card')} bordered={false}>
                    <Row gutter={[32, 32]}>
                        {/* Avatar Section */}
                        <Col xs={24} md={8} lg={6}>
                            <div className={cx('avatar-section')}>
                                <div className={cx('avatar-wrapper')}>
                                    <Avatar
                                        size={160}
                                        src={avatarUrl}
                                        icon={<UserOutlined/>}
                                        className={cx('avatar')}
                                    />
                                    <Badge
                                        status={tenant.active ? "success" : "error"}
                                        className={cx('status-badge')}
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
                                        className={cx('upload-button')}
                                    >
                                        Cập nhật ảnh
                                    </Button>
                                </Upload>
                            </div>
                        </Col>

                        {/* Info Section */}
                        <Col xs={24} md={16} lg={18}>
                            <div className={cx('info-section')}>
                                <div className={cx("title-group")}>
                                    <Title level={2} className={cx("name")}>
                                        {tenant.fullName}
                                    </Title>

                                    <div className={cx("meta-info")}>
                                        <span><IdcardOutlined /> Trạng thái hợp đồng:</span>
                                        <Tag color={statusMap[tenant.contractStatus]?.color || "default"}>
                                            {tenant.contractStatus}
                                        </Tag>
                                        <Badge
                                            status={tenant.isLiving ? "success" : "default"}
                                            text={tenant.isLiving ? "Đang ở" : "Không ở"}
                                        />
                                    </div>
                                </div>

                                {/* Contact Cards */}
                                <Row gutter={[16, 16]} className={cx('contact-cards')}>
                                    <Col xs={24} sm={12}>
                                        <div className={cx('contact-card')}>
                                            <MailOutlined className={cx('contact-icon', 'email')}/>
                                            <div className={cx('contact-info')}>
                                                <Text className={cx('contact-label')}>Email</Text>
                                                <Text className={cx('contact-value')}>{tenant.email}</Text>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <div className={cx('contact-card')}>
                                            <PhoneOutlined className={cx('contact-icon', 'phone')}/>
                                            <div className={cx('contact-info')}>
                                                <Text className={cx('contact-label')}>Số điện thoại</Text>
                                                <Text className={cx('contact-value')}>{tenant.phoneNumber}</Text>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                    </Row>
                </Card>

                {/* Personal Information */}
                <Card className={cx('info-card')} bordered={false}>
                    <Title level={5} className={cx('section-title')}>Thông Tin Cá Nhân</Title>
                    <Row gutter={[48, 24]}>
                        <Col xs={24} sm={12} md={8}>
                            <InfoField label="Họ Tên" value={tenant.fullName} />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <InfoField
                                label="Ngày Sinh"
                                value={tenant.dateOfBirth ? moment(tenant.dateOfBirth).format('DD/MM/YYYY') : null}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <InfoField label="Giới Tính" value={tenant.gender} />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <InfoField label="Số CMND/CCCD" value={tenant.identityNumber} />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <InfoField
                                label="Ngày Cấp"
                                value={tenant.issueDate ? moment(tenant.issueDate).format('DD/MM/YYYY') : null}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <InfoField label="Nơi Cấp" value={tenant.issuePlace} />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <InfoField label="Địa Chỉ Hiện Tại" value={tenant.address} />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <InfoField label="Địa Chỉ Thường Trú" value={tenant.permanentAddress} />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <InfoField label="Nghề Nghiệp" value={tenant.occupation} />
                        </Col>
                    </Row>
                </Card>

                {/* Contact Information */}
                <Card className={cx('info-card')} bordered={false}>
                    <Title level={5} className={cx('section-title')}>Thông Tin Liên Hệ & Khác</Title>
                    <Row gutter={[48, 24]}>
                        <Col xs={24} sm={12} md={8}>
                            <InfoField label="Số Điện Thoại" value={tenant.phoneNumber} />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <InfoField label="Email" value={tenant.email} />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <InfoField label="Người Liên Hệ Khẩn Cấp" value={tenant.emergencyContact} />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <InfoField label="SĐT Liên Hệ Khẩn Cấp" value={tenant.emergencyPhone} />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <InfoField label="Thông Tin Xe" value={tenant.vehicleInfo} />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <InfoField label="Ghi Chú" value={tenant.note} />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <InfoField
                                label="Ngày Tạo"
                                value={tenant.createdAt ? moment(tenant.createdAt).format('DD/MM/YYYY HH:mm') : null}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <InfoField
                                label="Cập Nhật Cuối"
                                value={tenant.updatedAt ? moment(tenant.updatedAt).format('DD/MM/YYYY HH:mm') : null}
                            />
                        </Col>
                    </Row>
                </Card>

                {/* Rental Information - Only show if exists */}
                {rentalInfo && (
                    <Card className={cx('rental-card')} bordered={false}>
                        <div className={cx('rental-header')}>
                            <HomeOutlined className={cx('rental-icon')} />
                            <Title level={5} className={cx('rental-title')}>
                                Thông Tin Thuê Hiện Tại
                            </Title>
                            {rentalInfo.isContractRepresentative && (
                                <Tag color="blue" icon={<CheckCircleOutlined />}>Đại diện hợp đồng</Tag>
                            )}
                        </div>

                        <Divider style={{ margin: '16px 0' }} />

                        {/* Contract Info */}
                        <div className={cx('rental-section')}>
                            <Text className={cx('rental-section-title')}>
                                <IdcardOutlined /> Hợp Đồng ({rentalInfo.contractCode})
                            </Text>
                            <Link onClick={() => navigate(`/admin/contracts/${rentalInfo.contractCode}`)}>
                                Xem chi tiết
                            </Link>
                        </div>

                        <Row gutter={[32, 16]} style={{ marginTop: '16px' }}>
                            <Col xs={12} sm={8}>
                                <InfoField
                                    label="Trạng thái HĐ"
                                    value={
                                        <Tag color={statusMap[rentalInfo.contractStatus]?.color || "default"}>
                                            {rentalInfo.contractStatus}
                                        </Tag>
                                    }
                                />
                            </Col>
                            <Col xs={12} sm={8}>
                                <InfoField
                                    label="Ngày bắt đầu"
                                    value={moment(rentalInfo.startDate).format('DD/MM/YYYY')}
                                />
                            </Col>
                            <Col xs={12} sm={8}>
                                <InfoField
                                    label="Ngày kết thúc"
                                    value={moment(rentalInfo.endDate).format('DD/MM/YYYY')}
                                />
                            </Col>
                            <Col xs={12} sm={8}>
                                <InfoField
                                    label="Giá thuê (lúc ký)"
                                    value={formatCurrency(rentalInfo.rentPrice)}
                                />
                            </Col>
                            <Col xs={12} sm={8}>
                                <InfoField
                                    label="Tiền cọc"
                                    value={formatCurrency(rentalInfo.deposit)}
                                />
                            </Col>
                            <Col xs={12} sm={8}>
                                <InfoField
                                    label="Ngày vào ở"
                                    value={moment(rentalInfo.moveInDate).format('DD/MM/YYYY')}
                                />
                            </Col>
                        </Row>

                        <Divider style={{ margin: '20px 0' }} />

                        {/* Room Info */}
                        <div className={cx('rental-section')}>
                            <Text className={cx('rental-section-title')}>
                                <HomeOutlined /> Phòng Thuê
                            </Text>
                            <Link onClick={() => navigate(`/admin/rooms/${rentalInfo.roomName}`)}>
                                Xem chi tiết
                            </Link>
                        </div>

                        <Row gutter={[32, 16]} style={{ marginTop: '16px' }}>
                            <Col xs={12} sm={8}>
                                <InfoField label="Tên phòng" value={rentalInfo.roomName} />
                            </Col>
                            <Col xs={12} sm={8}>
                                <InfoField label="Tầng" value={rentalInfo.floorNumber} />
                            </Col>
                            <Col xs={12} sm={8}>
                                <InfoField label="Diện tích" value={`${rentalInfo.area} m²`} />
                            </Col>
                        </Row>

                        <Divider style={{ margin: '20px 0' }} />

                        {/* Boarding House Info */}
                        <div className={cx('rental-section')}>
                            <Text className={cx('rental-section-title')}>
                                <EnvironmentOutlined /> Khu Nhà
                            </Text>
                            <Link onClick={() => navigate(`/admin/boarding-houses/${rentalInfo.boardingHouseName}`)}>
                                Xem chi tiết
                            </Link>
                        </div>

                        <Row gutter={[32, 16]} style={{ marginTop: '16px' }}>
                            <Col xs={24} sm={12}>
                                <InfoField label="Tên khu nhà" value={rentalInfo.boardingHouseName} />
                            </Col>
                            <Col xs={24} sm={12}>
                                <InfoField label="Địa chỉ" value={rentalInfo.boardingHouseAddress} />
                            </Col>
                        </Row>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default TenantDetail;
