import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
    ApartmentOutlined,
    BellOutlined,
    EyeOutlined,
    HomeOutlined,
    NotificationOutlined,
    SendOutlined,
    TeamOutlined
} from "@ant-design/icons";
import {
    Alert,
    Button,
    Card,
    Form,
    Input,
    List,
    Select,
    Space,
    Tag,
    Typography,
    message
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import {
    getNotificationDeliveryLogs,
    previewAnnouncement,
    processPendingNotificationDeliveries,
    sendAnnouncement
} from "~/service/admin/notification-service";
import {useNavigate} from "react-router-dom";
import styles from "./AnnouncementCenter.module.scss";
import {useAuth} from "~/routes/AuthContext";
import {getAllBoardingHousesNoPaged} from "~/service/admin/boarding_house";
import {getAllBuildingsByRole} from "~/service/admin/building";
import {getAllOwners} from "~/service/admin/owner";
import {getAllRoomNoPaged} from "~/service/admin/room";
import {getAllTenantNoPaged} from "~/service/admin/tenant";

const {TextArea} = Input;

const MAX_OWNER_OPTIONS = 1000;
const DELIVERY_PAGE_SIZE = 12;

dayjs.extend(relativeTime);
dayjs.locale("vi");

const categoryOptions = [
    { label: "Hệ thống", value: "SYSTEM" },
    { label: "Vận hành", value: "OPERATIONS" },
    { label: "Sự cố", value: "INCIDENT" },
    { label: "Thanh toán", value: "BILLING" },
    { label: "Khuyến mãi", value: "MARKETING" },
];

const deliveryChannelOptions = [
    {label: "Tất cả channel", value: ""},
    {label: "Email", value: "EMAIL"},
    {label: "SMS", value: "SMS"},
    {label: "Zalo", value: "ZALO"},
];

const priorityOptions = [
    { label: "Thấp", value: "LOW" },
    { label: "Trung bình", value: "MEDIUM" },
    { label: "Cao", value: "HIGH" },
];

const deliveryStatusOptions = [
    { label: "Tất cả trạng thái", value: "" },
    { label: "Đang chờ gửi", value: "QUEUED" },
    { label: "Đã gửi", value: "SENT" },
    { label: "Gửi thất bại", value: "FAILED" },
    { label: "Bỏ qua", value: "SKIPPED" },
];

const ownerTargetOptions = [
    {label: "Tất cả người thuê của tôi", value: "ALL_TENANTS_OF_OWNER"},
    {label: "Theo khu trọ", value: "BOARDING_HOUSE"},
    {label: "Theo tòa nhà", value: "BUILDING"},
    {label: "Theo phòng", value: "ROOM"},
    {label: "Chọn người thuê cụ thể", value: "TENANT_LIST"},
];

const adminTargetOptions = [
    {label: "Toàn hệ thống", value: "ALL_SYSTEM"},
    {label: "Người thuê theo chủ trọ", value: "ALL_TENANTS_OF_OWNER"},
    {label: "Theo khu trọ", value: "BOARDING_HOUSE"},
    {label: "Theo tòa nhà", value: "BUILDING"},
    {label: "Theo phòng", value: "ROOM"},
    {label: "Chọn người thuê cụ thể", value: "TENANT_LIST"},
];

const AnnouncementCenter = () => {
    const {user} = useAuth();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [preview, setPreview] = useState(null);
    const [boardingHouses, setBoardingHouses] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [owners, setOwners] = useState([]);
    const [deliveryLogs, setDeliveryLogs] = useState([]);
    const [deliveryLoading, setDeliveryLoading] = useState(true);
    const [processingQueue, setProcessingQueue] = useState(false);
    const [deliveryChannel, setDeliveryChannel] = useState("");
    const [deliveryStatus, setDeliveryStatus] = useState("");
    const [deliveryKeyword, setDeliveryKeyword] = useState("");

    const isAdmin = user?.role === "ADMIN";
    const targetOptions = isAdmin ? adminTargetOptions : ownerTargetOptions;
    const notificationPath = isAdmin ? "/admin/notifications" : "/owner/notifications";

    useEffect(() => {
        let active = true;

        const loadOptions = async () => {
            try {
                const [boardingHouseData, buildingData, roomData, tenantData, ownerData] = await Promise.all([
                    getAllBoardingHousesNoPaged(),
                    getAllBuildingsByRole({page: 0, pageSize: 1000}),
                    getAllRoomNoPaged(),
                    getAllTenantNoPaged(),
                    isAdmin ? getAllOwners({page: 0, pageSize: MAX_OWNER_OPTIONS}) : Promise.resolve([]),
                ]);

                if (!active) return;

                setBoardingHouses(boardingHouseData || []);
                setBuildings(buildingData?.content || []);
                setRooms(roomData || []);
                setTenants(tenantData || []);
                setOwners(ownerData?.content || []);
            } catch (error) {
                console.error("Failed to load announcement options", error);
                message.error("Không thể tải dữ liệu phạm vi gửi thông báo");
            } finally {
                if (active) {
                    setLoadingOptions(false);
                }
            }
        };

        loadOptions();
        return () => {
            active = false;
        };
    }, [isAdmin]);

    const loadDeliveryLogs = useCallback(async () => {
        try {
            setDeliveryLoading(true);
            const response = await getNotificationDeliveryLogs(0, DELIVERY_PAGE_SIZE, {
                channel: deliveryChannel,
                status: deliveryStatus,
                keyword: deliveryKeyword.trim(),
            });
            setDeliveryLogs(response?.content || []);
        } catch (error) {
            console.error("Failed to load notification delivery logs", error);
            message.error(error?.response?.data?.message || "Không thể tải delivery logs");
        } finally {
            setDeliveryLoading(false);
        }
    }, [deliveryChannel, deliveryKeyword, deliveryStatus]);

    useEffect(() => {
        loadDeliveryLogs();
    }, [loadDeliveryLogs]);

    const selectedTargetType = Form.useWatch("targetType", form);

    const targetSelectOptions = useMemo(() => {
        switch (selectedTargetType) {
            case "BOARDING_HOUSE":
                return boardingHouses.map(item => ({
                    label: item.name || `Khu trọ #${item.id}`,
                    value: item.id
                }));
            case "BUILDING":
                return buildings.map(item => ({
                    label: item.name || `Tòa nhà #${item.id}`,
                    value: item.id
                }));
            case "ROOM":
                return rooms.map(item => ({
                    label: item.roomNumber
                        ? `Phòng ${item.roomNumber}${item.buildingName ? ` - ${item.buildingName}` : ""}`
                        : `Phòng #${item.id}`,
                    value: item.id
                }));
            case "TENANT_LIST":
                return tenants.map(item => ({
                    label: item.fullName || item.name || item.email || `Tenant #${item.id}`,
                    value: item.id
                }));
            case "ALL_TENANTS_OF_OWNER":
                return isAdmin
                    ? owners.map(item => ({
                        label: item.fullName || item.email || `Owner #${item.id}`,
                        value: item.id
                    }))
                    : [];
            default:
                return [];
        }
    }, [selectedTargetType, boardingHouses, buildings, rooms, tenants, owners, isAdmin]);

    const needsTargetSelect = useMemo(() => (
        selectedTargetType && selectedTargetType !== "ALL_SYSTEM" && !(selectedTargetType === "ALL_TENANTS_OF_OWNER" && !isAdmin)
    ), [selectedTargetType, isAdmin]);

    const previewTargetLabel = useMemo(() => {
        if (!preview?.targetType) {
            return null;
        }
        const target = targetOptions.find((item) => item.value === preview.targetType);
        return target?.label || preview.targetType;
    }, [preview?.targetType, targetOptions]);

    const summaryAlert = useMemo(() => {
        switch (selectedTargetType) {
            case "ALL_SYSTEM":
                return "Admin sẽ gửi tới toàn bộ user trong hệ thống. Chỉ dùng cho thông báo thật sự quan trọng.";
            case "ALL_TENANTS_OF_OWNER":
                return isAdmin
                    ? "Admin chọn một chủ trọ để gửi tới toàn bộ người thuê đang hoạt động thuộc chủ trọ đó."
                    : "Chủ trọ sẽ gửi tới toàn bộ người thuê đang hoạt động thuộc dữ liệu của mình.";
            case "BOARDING_HOUSE":
                return "Gửi theo một hoặc nhiều khu trọ.";
            case "BUILDING":
                return "Gửi theo một hoặc nhiều tòa nhà.";
            case "ROOM":
                return "Gửi theo một hoặc nhiều phòng cụ thể.";
            case "TENANT_LIST":
                return "Gửi trực tiếp tới danh sách người thuê đã chọn.";
            default:
                return "Chọn phạm vi gửi phù hợp trước khi preview hoặc gửi thông báo.";
        }
    }, [isAdmin, selectedTargetType]);

    const buildPayload = async () => {
        const values = await form.validateFields();
        return {
            targetType: values.targetType,
            targetIds: Array.isArray(values.targetIds) ? values.targetIds : values.targetIds ? [values.targetIds] : [],
            title: values.title,
            message: values.message,
            category: values.category,
            priority: values.priority,
        };
    };

    const handlePreview = async () => {
        try {
            setPreviewLoading(true);
            const payload = await buildPayload();
            const result = await previewAnnouncement(payload);
            setPreview(result);
        } catch (error) {
            console.error("Preview announcement failed", error);
            message.error(error?.response?.data?.message || "Không thể preview người nhận");
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleSend = async () => {
        try {
            setSending(true);
            const payload = await buildPayload();
            const result = await sendAnnouncement(payload);
            setPreview(result);
            message.success(`Đã gửi thông báo tới ${result?.recipientCount || 0} người nhận`);
            form.resetFields(["title", "message"]);
            loadDeliveryLogs();
        } catch (error) {
            console.error("Send announcement failed", error);
            message.error(error?.response?.data?.message || "Gửi thông báo thất bại");
        } finally {
            setSending(false);
        }
    };

    const handleProcessQueue = async () => {
        try {
            setProcessingQueue(true);
            const processed = await processPendingNotificationDeliveries(50);
            message.success(`Đã xử lý ${processed || 0} delivery log trong hàng đợi`);
            loadDeliveryLogs();
        } catch (error) {
            console.error("Process pending notification deliveries failed", error);
            message.error(error?.response?.data?.message || "Không thể xử lý hàng đợi delivery");
        } finally {
            setProcessingQueue(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            <Card className={styles.heroCard} bordered={false}>
                <div className={styles.heroTop}>
                    <div>
                        <Typography.Title level={3} className={styles.heroTitle}>
                            <NotificationOutlined /> Trung tâm gửi announcement
                        </Typography.Title>
                        <Typography.Paragraph className={styles.heroDesc}>
                            Gửi thông báo vận hành tới người thuê theo phạm vi thực tế của hệ thống: chủ trọ cụ thể, khu trọ,
                            tòa nhà, phòng hoặc danh sách người thuê chỉ định.
                        </Typography.Paragraph>
                    </div>
                    <Space wrap>
                        <Button icon={<BellOutlined />} onClick={() => navigate(notificationPath)}>
                            Về Notification Center
                        </Button>
                    </Space>
                </div>
            </Card>

            <div className={styles.grid}>
                <Card className={styles.formCard} bordered={false} loading={loadingOptions}>
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                            targetType: isAdmin ? "ALL_SYSTEM" : "ALL_TENANTS_OF_OWNER",
                            category: "SYSTEM",
                            priority: "MEDIUM",
                        }}
                    >
                        <Alert
                            type="info"
                            showIcon
                            className={styles.scopeAlert}
                            message="Quy tắc gửi thông báo"
                            description={summaryAlert}
                        />

                        <Form.Item
                            label="Phạm vi gửi"
                            name="targetType"
                            rules={[{required: true, message: "Chọn phạm vi gửi"}]}
                        >
                            <Select
                                options={targetOptions}
                                onChange={() => {
                                    form.setFieldValue("targetIds", undefined);
                                    setPreview(null);
                                }}
                            />
                        </Form.Item>

                        {needsTargetSelect && (
                            <Form.Item
                                label={selectedTargetType === "ALL_TENANTS_OF_OWNER" ? "Chọn chủ trọ" : "Chọn đối tượng"}
                                name="targetIds"
                                rules={[{required: true, message: "Chọn ít nhất một đối tượng"}]}
                            >
                                <Select
                                    mode={selectedTargetType === "ALL_TENANTS_OF_OWNER" ? undefined : "multiple"}
                                    options={targetSelectOptions}
                                    placeholder="Chọn phạm vi cụ thể"
                                    showSearch
                                    optionFilterProp="label"
                                />
                            </Form.Item>
                        )}

                        <div className={styles.inlineFields}>
                            <Form.Item label="Danh mục" name="category" className={styles.inlineItem}>
                                <Select options={categoryOptions} />
                            </Form.Item>
                            <Form.Item label="Mức độ ưu tiên" name="priority" className={styles.inlineItem}>
                                <Select options={priorityOptions} />
                            </Form.Item>
                        </div>

                        <Form.Item
                            label="Tiêu đề"
                            name="title"
                            rules={[{required: true, message: "Nhập tiêu đề thông báo"}]}
                        >
                            <Input placeholder="Ví dụ: Bảo trì hệ thống điện khu A tối nay" maxLength={255} />
                        </Form.Item>

                        <Form.Item
                            label="Nội dung"
                            name="message"
                            rules={[{required: true, message: "Nhập nội dung thông báo"}]}
                        >
                            <TextArea rows={6} placeholder="Nhập nội dung chi tiết gửi tới người thuê..." maxLength={2000} />
                        </Form.Item>

                        <Space wrap>
                            <Button icon={<EyeOutlined />} onClick={handlePreview} loading={previewLoading}>
                                Preview người nhận
                            </Button>
                            <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={sending}>
                                Gửi thông báo
                            </Button>
                        </Space>
                    </Form>
                </Card>

                <Card className={styles.previewCard} bordered={false}>
                    <Typography.Title level={4} className={styles.previewTitle}>
                        <TeamOutlined /> Preview người nhận
                    </Typography.Title>

                    {!preview && (
                        <Alert
                            type="info"
                            showIcon
                            message="Chưa có preview"
                            description="Chọn phạm vi, nhập nội dung rồi bấm Preview để xem số lượng người nhận trước khi gửi."
                        />
                    )}

                    {preview && (
                        <div className={styles.previewContent}>
                            <div className={styles.previewSummary}>
                                <Tag color="blue">{previewTargetLabel || preview.targetType}</Tag>
                                <Tag color="green">{preview.recipientCount} người nhận</Tag>
                            </div>

                            <Alert
                                type="success"
                                showIcon
                                message="Preview đã sẵn sàng"
                                description="Danh sách dưới đây hiển thị tối đa 50 người nhận đầu tiên để kiểm tra trước khi gửi."
                            />

                            <div className={styles.recipientList}>
                                {(preview.recipients || []).slice(0, 50).map((recipient) => (
                                    <div key={recipient.userId} className={styles.recipientItem}>
                                        <div>
                                            <Typography.Text strong>{recipient.fullName || recipient.email}</Typography.Text>
                                            <Typography.Paragraph className={styles.recipientMeta}>
                                                {recipient.email || "Không có email"}
                                            </Typography.Paragraph>
                                        </div>
                                        <Space wrap>
                                            {preview.targetType === "BOARDING_HOUSE" && <ApartmentOutlined />}
                                            {preview.targetType === "ROOM" && <HomeOutlined />}
                                            <Tag>{recipient.role}</Tag>
                                        </Space>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            <Card className={styles.auditCard} bordered={false}>
                <div className={styles.auditHeader}>
                    <div>
                        <Typography.Title level={4} className={styles.previewTitle}>
                            <BellOutlined /> Delivery audit
                        </Typography.Title>
                        <Typography.Paragraph className={styles.auditDesc}>
                            Theo dõi các bản ghi gửi `EMAIL`, `SMS`, `ZALO`, kiểm tra bản ghi fail/skip và xử lý lại hàng đợi.
                        </Typography.Paragraph>
                    </div>
                    <Space wrap>
                        <Button onClick={loadDeliveryLogs} loading={deliveryLoading}>
                            Tải lại
                        </Button>
                        <Button type="primary" onClick={handleProcessQueue} loading={processingQueue}>
                            Xử lý pending queue
                        </Button>
                    </Space>
                </div>

                <div className={styles.auditFilters}>
                    <Select
                        value={deliveryChannel}
                        options={deliveryChannelOptions}
                        onChange={setDeliveryChannel}
                        className={styles.auditSelect}
                    />
                    <Select
                        value={deliveryStatus}
                        options={deliveryStatusOptions}
                        onChange={setDeliveryStatus}
                        className={styles.auditSelect}
                    />
                    <Input
                        value={deliveryKeyword}
                        onChange={(event) => setDeliveryKeyword(event.target.value)}
                        placeholder="Tìm theo event, người nhận, destination"
                    />
                </div>

                <List
                    loading={deliveryLoading}
                    dataSource={deliveryLogs}
                    locale={{emptyText: "Chưa có delivery log phù hợp"}}
                    renderItem={(item) => (
                        <List.Item className={styles.auditItem}>
                            <div className={styles.auditItemBody}>
                                <div className={styles.auditItemHeader}>
                                    <Space wrap>
                                        <Typography.Text strong>{item.title}</Typography.Text>
                                        <Tag color="blue">{item.channel}</Tag>
                                        <Tag color={item.status === "FAILED" ? "red" : item.status === "SKIPPED" ? "gold" : "green"}>
                                            {item.status}
                                        </Tag>
                                    </Space>
                                    <Typography.Text type="secondary">
                                        {item.lastAttemptAt ? dayjs(item.lastAttemptAt).fromNow() : dayjs(item.createdAt).fromNow()}
                                    </Typography.Text>
                                </div>

                                <Typography.Paragraph className={styles.auditMeta}>
                                    {item.recipientName || item.recipientEmail || `User #${item.recipientId}`} - {item.destination || "Không có destination"}
                                </Typography.Paragraph>
                                <Typography.Paragraph className={styles.auditSubMeta}>
                                    Event: {item.eventKey || "SYSTEM"} | Attempts: {item.attemptCount}/{item.maxAttempts} | Provider: {item.provider || "N/A"}
                                </Typography.Paragraph>
                                {item.lastError && (
                                    <Alert
                                        type={item.status === "FAILED" ? "error" : "warning"}
                                        showIcon
                                        message={item.lastError}
                                    />
                                )}
                            </div>
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
};

export default AnnouncementCenter;
