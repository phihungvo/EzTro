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
    Tag
} from 'antd';
import {
    UserOutlined,
    UploadOutlined,
    ArrowLeftOutlined,
    PhoneOutlined,
    MailOutlined,
    IdcardOutlined
} from '@ant-design/icons';
import moment from 'moment';
import classNames from 'classnames/bind';
import {tenantDetail, tenantRentalDetail} from '~/service/admin/tenant';
import {uploadFile, getPresignedUrl} from '~/service/admin/uploadFile';
import {useAuth} from '~/routes/AuthContext';
import styles from './TenantDetail.module.scss';
import 'moment/locale/vi';

const cx = classNames.bind(styles);
const {Title, Text} = Typography;

moment.locale('vi');

function TenantDetail() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {user} = useAuth();
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [avatarUrl, setAvatarUrl] = useState(null);

    const statusMap = {
        "Đang thuê": { color: "green" },
        "Đã kết thúc": { color: "gold" },
        "Chưa thuê": { color: "red" },
    };

    useEffect(() => {
        if (!user || !user.token) {
            message.error('Vui lòng đăng nhập để xem chi tiết người thuê');
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

                    if (response.profilePictureId) {
                        const presignedUrl = await getPresignedUrl(response.profilePictureId);
                        setAvatarUrl(presignedUrl);
                    }
                } else {
                    throw new Error('Không tìm thấy người thuê');
                }
            } catch (error) {
                message.error(`Lỗi khi load chi tiết người thuê: ${error.message}`);
                navigate('/admin/tenants');
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

    return (
        <div className={cx('tenant-detail')}>
            <div className={cx('container')}>
                {/* Header */}
                <div className={cx('header')}>
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined/>}
                        onClick={() => navigate('/admin/tenants')}
                        className={cx('back-button')}
                    >
                        Quay lại danh sách
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
            </div>
        </div>
    );
}

export default TenantDetail;