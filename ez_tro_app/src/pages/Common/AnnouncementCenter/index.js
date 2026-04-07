import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
    ApartmentOutlined,
    BellOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    HomeOutlined,
    NotificationOutlined,
    ReloadOutlined,
    SendOutlined,
    TeamOutlined,
    ThunderboltOutlined,
    WarningOutlined,
} from "@ant-design/icons";
import {Alert, Button, Form, Input, List, Select, Space, Tag, Typography, message} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import {
    getNotificationDeliveryLogs,
    previewAnnouncement,
    processPendingNotificationDeliveries,
    sendAnnouncement,
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
    {label: "Hệ thống", value: "SYSTEM"},
    {label: "Vận hành", value: "OPERATIONS"},
    {label: "Sự cố", value: "INCIDENT"},
    {label: "Thanh toán", value: "BILLING"},
    {label: "Khuyến mãi", value: "MARKETING"},
];

const deliveryChannelOptions = [
    {label: "Tất cả channel", value: ""},
    {label: "Email", value: "EMAIL"},
    {label: "SMS", value: "SMS"},
    {label: "Zalo", value: "ZALO"},
];

const priorityOptions = [
    {label: "Thấp", value: "LOW"},
    {label: "Trung bình", value: "MEDIUM"},
    {label: "Cao", value: "HIGH"},
];

const deliveryStatusOptions = [
    {label: "Tất cả trạng thái", value: ""},
    {label: "Đang chờ gửi", value: "QUEUED"},
    {label: "Đã gửi", value: "SENT"},
    {label: "Gửi thất bại", value: "FAILED"},
    {label: "Bỏ qua", value: "SKIPPED"},
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

const statusConfig: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
    SENT: {icon: <CheckCircleOutlined />, className: styles.statusSent, label: "Đã gửi"},
    FAILED: {icon: <CloseCircleOutlined />, className: styles.statusFailed, label: "Thất bại"},
    SKIPPED: {icon: <WarningOutlined />, className: styles.statusSkipped, label: "Bỏ qua"},
    QUEUED: {icon: <ClockCircleOutlined />, className: styles.statusQueued, label: "Đang chờ"},
};

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
                message.error("Không thể tải dữ liệu phạm vi gửi thông báo");
            } finally {
                if (active) setLoadingOptions(false);
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
                return boardingHouses.map((item) => ({label: item.name || `Khu trọ #${item.id}`, value: item.id}));
            case "BUILDING":
                return buildings.map((item) => ({label: item.name || `Tòa nhà #${item.id}`, value: item.id}));
            case "ROOM":
                return rooms.map((item) => ({
                    label: item.roomNumber ? `Phòng ${item.roomNumber}${item.buildingName ? ` — ${item.buildingName}` : ""}` : `Phòng #${item.id}`,
                    value: item.id,
                }));
            case "TENANT_LIST":
                return tenants.map((item) => ({label: item.fullName || item.name || item.email || `Tenant #${item.id}`, value: item.id}));
            case "ALL_TENANTS_OF_OWNER":
                return isAdmin ? owners.map((item) => ({label: item.fullName || item.email || `Owner #${item.id}`, value: item.id})) : [];
            default:
                return [];
        }
    }, [selectedTargetType, boardingHouses, buildings, rooms, tenants, owners, isAdmin]);

    const needsTargetSelect = useMemo(
        () => selectedTargetType && selectedTargetType !== "ALL_SYSTEM" && !(selectedTargetType === "ALL_TENANTS_OF_OWNER" && !isAdmin),
        [selectedTargetType, isAdmin]
    );

    const previewTargetLabel = useMemo(() => {
        if (!preview?.targetType) return null;
        return targetOptions.find((item) => item.value === preview.targetType)?.label || preview.targetType;
    }, [preview?.targetType, targetOptions]);

    const summaryAlert = useMemo(() => {
        switch (selectedTargetType) {
            case "ALL_SYSTEM":
                return "Gửi tới toàn bộ người dùng trong hệ thống. Chỉ dùng cho thông báo thật sự quan trọng.";
            case "ALL_TENANTS_OF_OWNER":
                return isAdmin ? "Chọn chủ trọ để gửi tới toàn bộ người thuê đang hoạt động thuộc chủ trọ đó." : "Gửi tới toàn bộ người thuê đang hoạt động thuộc dữ liệu của bạn.";
            case "BOARDING_HOUSE":
                return "Gửi theo một hoặc nhiều khu trọ đã chọn.";
            case "BUILDING":
                return "Gửi theo một hoặc nhiều tòa nhà đã chọn.";
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
            message.error(error?.response?.data?.message || "Không thể xử lý hàng đợi delivery");
        } finally {
            setProcessingQueue(false);
        }
    };

    return (
        <div className={styles.root}>
            {/* ── HEADER ── */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerIcon}>
                        <NotificationOutlined />
                    </div>
                    <div>
                        <h1 className={styles.headerTitle}>Announcement Center</h1>
                        <p className={styles.headerSub}>Gửi thông báo vận hành tới người thuê theo phạm vi hệ thống</p>
                    </div>
                </div>
                <button className={styles.navBtn} onClick={() => navigate(notificationPath)}>
                    <BellOutlined />
                    <span>Notification Center</span>
                </button>
            </header>

            {/* ── COMPOSE + PREVIEW ── */}
            <div className={styles.composeGrid}>
                {/* Form */}
                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <span className={styles.panelLabel}>Soạn thông báo</span>
                    </div>

                    {loadingOptions ? (
                        <div className={styles.skeleton}>
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className={styles.skeletonLine} style={{width: i % 2 === 0 ? "60%" : "100%"}} />
                            ))}
                        </div>
                    ) : (
                        <Form
                            form={form}
                            layout="vertical"
                            className={styles.form}
                            initialValues={{
                                targetType: isAdmin ? "ALL_SYSTEM" : "ALL_TENANTS_OF_OWNER",
                                category: "SYSTEM",
                                priority: "MEDIUM",
                            }}
                        >
                            <div className={styles.scopeHint}>
                                <ThunderboltOutlined className={styles.scopeIcon} />
                                <span>{summaryAlert}</span>
                            </div>

                            <Form.Item label="Phạm vi gửi" name="targetType" rules={[{required: true, message: "Chọn phạm vi gửi"}]}>
                                <Select
                                    options={targetOptions}
                                    className={styles.select}
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
                                        placeholder="Nhập để tìm kiếm..."
                                        showSearch
                                        optionFilterProp="label"
                                        className={styles.select}
                                    />
                                </Form.Item>
                            )}

                            <div className={styles.rowTwo}>
                                <Form.Item label="Danh mục" name="category">
                                    <Select options={categoryOptions} className={styles.select} />
                                </Form.Item>
                                <Form.Item label="Mức độ ưu tiên" name="priority">
                                    <Select options={priorityOptions} className={styles.select} />
                                </Form.Item>
                            </div>

                            <Form.Item label="Tiêu đề" name="title" rules={[{required: true, message: "Nhập tiêu đề thông báo"}]}>
                                <Input placeholder="Ví dụ: Bảo trì hệ thống điện khu A tối nay" maxLength={255} className={styles.input} />
                            </Form.Item>

                            <Form.Item label="Nội dung" name="message" rules={[{required: true, message: "Nhập nội dung thông báo"}]}>
                                <TextArea rows={5} placeholder="Nhập nội dung chi tiết..." maxLength={2000} className={styles.textarea} />
                            </Form.Item>

                            <div className={styles.formActions}>
                                <button type="button" className={styles.btnGhost} onClick={handlePreview} disabled={previewLoading}>
                                    <EyeOutlined />
                                    {previewLoading ? "Đang tải..." : "Preview"}
                                </button>
                                <button type="button" className={styles.btnPrimary} onClick={handleSend} disabled={sending}>
                                    <SendOutlined />
                                    {sending ? "Đang gửi..." : "Gửi thông báo"}
                                </button>
                            </div>
                        </Form>
                    )}
                </section>

                {/* Preview */}
                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <span className={styles.panelLabel}>
                            <TeamOutlined /> Preview người nhận
                        </span>
                        {preview && (
                            <div className={styles.recipientBadges}>
                                <span className={styles.badge}>{previewTargetLabel || preview.targetType}</span>
                                <span className={`${styles.badge} ${styles.badgeGreen}`}>{preview.recipientCount} người</span>
                            </div>
                        )}
                    </div>

                    {!preview ? (
                        <div className={styles.emptyPreview}>
                            <div className={styles.emptyIcon}>
                                <TeamOutlined />
                            </div>
                            <p className={styles.emptyTitle}>Chưa có dữ liệu preview</p>
                            <p className={styles.emptySub}>Chọn phạm vi, nhập nội dung rồi bấm Preview để xem danh sách người nhận.</p>
                        </div>
                    ) : (
                        <div className={styles.recipientList}>
                            {(preview.recipients || []).slice(0, 50).map((recipient) => (
                                <div key={recipient.userId} className={styles.recipientItem}>
                                    <div className={styles.recipientAvatar}>{(recipient.fullName || recipient.email || "?")[0].toUpperCase()}</div>
                                    <div className={styles.recipientInfo}>
                                        <span className={styles.recipientName}>{recipient.fullName || recipient.email}</span>
                                        <span className={styles.recipientEmail}>{recipient.email || "Không có email"}</span>
                                    </div>
                                    <div className={styles.recipientMeta}>
                                        {preview.targetType === "BOARDING_HOUSE" && <ApartmentOutlined />}
                                        {preview.targetType === "ROOM" && <HomeOutlined />}
                                        <span className={styles.roleTag}>{recipient.role}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* ── DELIVERY AUDIT ── */}
            <section className={styles.auditSection}>
                <div className={styles.auditTop}>
                    <div>
                        <h2 className={styles.auditTitle}>
                            <BellOutlined /> Delivery Audit
                        </h2>
                        <p className={styles.auditDesc}>Theo dõi EMAIL · SMS · ZALO — kiểm tra bản ghi fail/skip và xử lý lại hàng đợi.</p>
                    </div>
                    <div className={styles.auditTopActions}>
                        <button className={styles.btnGhost} onClick={loadDeliveryLogs} disabled={deliveryLoading}>
                            <ReloadOutlined className={deliveryLoading ? styles.spin : ""} />
                            Tải lại
                        </button>
                        <button className={styles.btnAccent} onClick={handleProcessQueue} disabled={processingQueue}>
                            <ThunderboltOutlined />
                            {processingQueue ? "Đang xử lý..." : "Xử lý pending"}
                        </button>
                    </div>
                </div>

                <div className={styles.auditFilters}>
                    <Select value={deliveryChannel} options={deliveryChannelOptions} onChange={setDeliveryChannel} className={styles.filterSelect} placeholder="Channel" />
                    <Select value={deliveryStatus} options={deliveryStatusOptions} onChange={setDeliveryStatus} className={styles.filterSelect} placeholder="Trạng thái" />
                    <Input
                        value={deliveryKeyword}
                        onChange={(e) => setDeliveryKeyword(e.target.value)}
                        placeholder="Tìm theo event, người nhận, destination..."
                        className={styles.filterInput}
                        allowClear
                    />
                </div>

                {deliveryLoading ? (
                    <div className={styles.auditGrid}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className={styles.auditSkeleton}>
                                <div className={styles.skeletonLine} style={{width: "40%", marginBottom: 8}} />
                                <div className={styles.skeletonLine} style={{width: "70%", marginBottom: 6}} />
                                <div className={styles.skeletonLine} style={{width: "55%"}} />
                            </div>
                        ))}
                    </div>
                ) : deliveryLogs.length === 0 ? (
                    <div className={styles.emptyAudit}>
                        <BellOutlined className={styles.emptyAuditIcon} />
                        <p>Chưa có delivery log phù hợp</p>
                    </div>
                ) : (
                    <div className={styles.auditGrid}>
                        {deliveryLogs.map((item, idx) => {
                            const cfg = statusConfig[item.status] || statusConfig["QUEUED"];
                            return (
                                <div key={idx} className={`${styles.auditCard} ${cfg.className}`}>
                                    <div className={styles.auditCardTop}>
                                        <div className={styles.auditCardTitleRow}>
                                            <span className={styles.auditCardTitle}>{item.title}</span>
                                            <span className={`${styles.auditStatusBadge} ${cfg.className}`}>
                                                {cfg.icon} {cfg.label}
                                            </span>
                                        </div>
                                        <span className={styles.auditTime}>
                                            {item.lastAttemptAt ? dayjs(item.lastAttemptAt).fromNow() : dayjs(item.createdAt).fromNow()}
                                        </span>
                                    </div>
                                    <div className={styles.auditCardMeta}>
                                        <span className={styles.auditChannel}>{item.channel}</span>
                                        <span>{item.recipientName || item.recipientEmail || `User #${item.recipientId}`}</span>
                                        <span className={styles.auditDot}>·</span>
                                        <span>{item.destination || "No destination"}</span>
                                    </div>
                                    <div className={styles.auditCardSub}>
                                        Event: <b>{item.eventKey || "SYSTEM"}</b> · Attempts: <b>{item.attemptCount}/{item.maxAttempts}</b> · Provider: <b>{item.provider || "N/A"}</b>
                                    </div>
                                    {item.lastError && <div className={styles.auditError}>{item.lastError}</div>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

export default AnnouncementCenter;