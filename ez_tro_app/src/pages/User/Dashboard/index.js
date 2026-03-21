import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import classNames from "classnames/bind";
import styles from "./Dashboard.module.scss";

import StatsGrid from "~/components/Layout/UserLayout/components/StatsGrid";
import BillsCard from "~/components/Layout/UserLayout/components/BillsCard";
import ServicesCard from "~/components/Layout/UserLayout/components/ServicesCard";

import { getMyBills, getSummaryInfo } from "src/service/user/dashboard";

const cx = classNames.bind(styles);

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ROOM = {
    number: "302",
    type: "Căn hộ studio",
    floor: "Tầng 3",
    building: "Tòa nhà An Phú",
    area: "28 m²",
    moveInDate: "01/07/2025",
    monthlyRent: "4.500.000 ₫",
    occupants: "1 người",
    amenities: ["📶 WiFi", "❄️ Máy lạnh", "🅿️ Bãi xe", "🏋️ Gym", "🔐 An ninh 24/7", "🚿 Nóng lạnh"],
};

const MOCK_CONTRACT = {
    startDate: "01/07/2025",
    endDate: "30/06/2026",
    progressPercent: 62,
    monthsLeft: 8,
};

const MOCK_PAYMENTS = [
    {
        id: 1,
        name: "Tiền thuê tháng 3/2026",
        date: "Hạn: 15/03/2026",
        amount: "5.100.000 ₫",
        status: "overdue",
        statusLabel: "Chưa thanh toán",
    },
    {
        id: 2,
        name: "Tiền thuê tháng 2/2026",
        date: "Đã thanh toán: 10/02/2026",
        amount: "4.900.000 ₫",
        status: "paid",
        statusLabel: "Đã thanh toán",
    },
    {
        id: 3,
        name: "Tiền thuê tháng 1/2026",
        date: "Đã thanh toán: 08/01/2026",
        amount: "4.750.000 ₫",
        status: "paid",
        statusLabel: "Đã thanh toán",
    },
    {
        id: 4,
        name: "Tiền thuê tháng 12/2025",
        date: "Đã thanh toán: 05/12/2025",
        amount: "4.700.000 ₫",
        status: "paid",
        statusLabel: "Đã thanh toán",
    },
];

const MOCK_UTILITIES = {
    electricity: { value: 312, unit: "kWh", cost: "468.000 ₫", percent: 72 },
    water: { value: 8, unit: "m³", cost: "72.000 ₫", percent: 45 },
    internet: { value: null, unit: "Gói cố định", cost: "150.000 ₫", percent: 90 },
    total: "690.000 ₫",
};

const MOCK_MAINTENANCE = [
    {
        id: 1,
        icon: "🔧",
        type: "repair",
        title: "Vòi nước bị rỉ",
        description: "Nhà vệ sinh chính, vòi nước bồn rửa bị rỉ",
        status: "processing",
        statusLabel: "Đang xử lý",
        date: "10/03/2026",
    },
    {
        id: 2,
        icon: "🧹",
        type: "clean",
        title: "Vệ sinh định kỳ",
        description: "Vệ sinh hành lang và khu vực chung",
        status: "done",
        statusLabel: "Hoàn thành",
        date: "05/03/2026",
    },
    {
        id: 3,
        icon: "💡",
        type: "other",
        title: "Thay bóng đèn",
        description: "Hành lang phòng, bóng đèn bị hỏng",
        status: "new",
        statusLabel: "Mới gửi",
        date: "12/03/2026",
    },
];

const MOCK_NOTICES = [
    {
        id: 1,
        badge: "urgent",
        badgeIcon: "🔴",
        badgeLabel: "Khẩn cấp",
        title: "Cúp điện bảo trì hệ thống",
        description: "Ngày 14/03/2026 từ 08:00–12:00, khu A sẽ tạm ngừng điện để bảo trì định kỳ.",
        time: "Hôm nay, 09:30",
    },
    {
        id: 2,
        badge: "warning",
        badgeIcon: "⚠️",
        badgeLabel: "Lưu ý",
        title: "Nhắc nhở đóng cửa xe máy",
        description: "Vui lòng đảm bảo xe được khóa đúng vị trí và cổng hầm xe đóng sau 22:00.",
        time: "Hôm qua, 16:00",
    },
    {
        id: 3,
        badge: "info",
        badgeIcon: "ℹ️",
        badgeLabel: "Thông tin",
        title: "Chào mừng cư dân mới tầng 4",
        description: "Tòa nhà chào đón 2 cư dân mới tại phòng 401 và 405 từ ngày 10/03.",
        time: "10/03/2026",
    },
];

// ─── Component ────────────────────────────────────────────────────────────────

const Dashboard = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [bills, setBills] = useState([]);

    const fetchDashboardData = useCallback(async () => {
        try {
            const [summaryRes, billsRes] = await Promise.all([
                getSummaryInfo(),
                getMyBills(),
            ]);

            if (!summaryRes) {
                message.warning("Không thể lấy thông tin tổng quan");
            } else {
                setSummary(summaryRes);
            }

            setBills(billsRes?.result || []);
        } catch (error) {
            console.error("❌ Error fetching dashboard data:", error);
            message.error("Lỗi khi tải dữ liệu tổng quan");
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const statsData = summary
        ? [
            { label: "Phòng hiện tại", value: summary.roomNumber },
            {
                label: "Tiền thuê tháng này",
                value: `${(summary.monthlyRent / 1_000_000).toFixed(1)} tr`,
            },
            {
                label: "Thanh toán",
                value: summary.paymentStatus,
                status: summary.paymentStatus?.includes("Chưa") ? "unpaid" : "paid",
            },
            {
                label: "Hết hạn hợp đồng",
                value: new Date(summary.contractEndDate).toLocaleDateString("vi-VN"),
            },
        ]
        : [];

    const servicesData = [
        { icon: "⚡", label: "Điện / Nước", onClick: () => navigate("/user/utilities") },
        { icon: "📄", label: "Hoá đơn", onClick: () => navigate("/user/bills") },
        { icon: "👤", label: "Hồ sơ", onClick: () => navigate("/user/profile") },
        { icon: "📞", label: "Liên hệ", onClick: () => {} },
    ];

    const unpaidCount = bills.filter((b) => !b.paid).length;

    return (
        <div className={cx("dashboard")}>

            {/* ── Banner ── */}
            <div className={cx("banner")}>
                <div className={cx("bannerContent")}>
                    <div className={cx("bannerRoom")}>Phòng {MOCK_ROOM.number} — {MOCK_ROOM.building}</div>
                    <div className={cx("bannerSub")}>
                        {unpaidCount > 0
                            ? `Bạn có ${unpaidCount} hoá đơn chưa thanh toán`
                            : "Hợp đồng còn hiệu lực · Đến hạn thanh toán: 15/03/2026"}
                    </div>
                    <div className={cx("bannerActions")}>
                        <button className={cx("btnPrimary")} onClick={() => navigate("/user/bills")}>
                            💳 Thanh toán ngay
                        </button>
                        <button className={cx("btnOutline")} onClick={() => navigate("/user/maintenance")}>
                            🔧 Tạo yêu cầu
                        </button>
                    </div>
                </div>
                <div className={cx("bannerDecor")}>🏠</div>
            </div>

            {/* ── Stats (from API) ── */}
            {summary && <StatsGrid stats={statsData} />}

            {/* ── Main grid: Room info + Contract ── */}
            <div className={cx("mainGrid")}>

                {/* Room Info Card */}
                <div className={cx("card")}>
                    <div className={cx("cardHeader")}>
                        <div>
                            <div className={cx("cardTitle")}>Thông tin phòng</div>
                            <div className={cx("cardSub")}>Chi tiết phòng đang thuê</div>
                        </div>
                        <span className={cx("cardAction")} onClick={() => navigate("/user/contract")}>
                            Xem hợp đồng →
                        </span>
                    </div>
                    <div className={cx("cardBody")}>
                        <div className={cx("roomHero")}>
                            <div className={cx("roomHeroBg")}>🏢</div>
                            <div className={cx("roomHeroInfo")}>
                                <div className={cx("roomNumber")}>Phòng {MOCK_ROOM.number}</div>
                                <div className={cx("roomType")}>
                                    {MOCK_ROOM.type} · {MOCK_ROOM.floor} · {MOCK_ROOM.building}
                                </div>
                            </div>
                        </div>

                        <div className={cx("roomDetails")}>
                            {[
                                { label: "Diện tích", value: MOCK_ROOM.area },
                                { label: "Ngày vào ở", value: MOCK_ROOM.moveInDate },
                                { label: "Giá thuê", value: MOCK_ROOM.monthlyRent },
                                { label: "Số người", value: MOCK_ROOM.occupants },
                            ].map((item) => (
                                <div key={item.label} className={cx("roomDetailItem")}>
                                    <div className={cx("roomDetailLabel")}>{item.label}</div>
                                    <div className={cx("roomDetailValue")}>{item.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className={cx("amenitiesLabel")}>Tiện nghi</div>
                        <div className={cx("amenities")}>
                            {MOCK_ROOM.amenities.map((a) => (
                                <span key={a} className={cx("amenityTag")}>{a}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className={cx("rightCol")}>

                    {/* Contract Status */}
                    <div className={cx("card")}>
                        <div className={cx("cardHeader")}>
                            <div>
                                <div className={cx("cardTitle")}>Hợp đồng</div>
                                <div className={cx("cardSub")}>Trạng thái hợp đồng thuê</div>
                            </div>
                        </div>
                        <div className={cx("cardBody")}>
                            <div className={cx("contractBox")}>
                                <div className={cx("contractLive")}>
                                    <span className={cx("liveDot")} />
                                    Đang hiệu lực
                                </div>
                                <div className={cx("contractDates")}>
                                    <div className={cx("contractDateItem")}>
                                        <div className={cx("contractDateLabel")}>Ngày bắt đầu</div>
                                        <div className={cx("contractDateValue")}>{MOCK_CONTRACT.startDate}</div>
                                    </div>
                                    <span className={cx("contractArrow")}>→</span>
                                    <div className={cx("contractDateItem")}>
                                        <div className={cx("contractDateLabel")}>Ngày kết thúc</div>
                                        <div className={cx("contractDateValue")}>{MOCK_CONTRACT.endDate}</div>
                                    </div>
                                </div>
                                <div className={cx("contractDivider")} />
                                <div className={cx("progressLabel")}>
                                    <span>Tiến độ hợp đồng</span>
                                    <span>{MOCK_CONTRACT.progressPercent}% — còn {MOCK_CONTRACT.monthsLeft} tháng</span>
                                </div>
                                <div className={cx("progressBarWrap")}>
                                    <div
                                        className={cx("progressBar")}
                                        style={{ "--progress": `${MOCK_CONTRACT.progressPercent}%` }}
                                    />
                                </div>
                            </div>
                            <button
                                className={cx("btnOutline", "btnFull")}
                                onClick={() => navigate("/user/contract")}
                            >
                                📄 Tải hợp đồng PDF
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className={cx("card")}>
                        <div className={cx("cardHeader")}>
                            <div className={cx("cardTitle")}>Thao tác nhanh</div>
                        </div>
                        <div className={cx("cardBody")}>
                            <div className={cx("quickGrid")}>
                                {[
                                    { icon: "💳", label: "Thanh toán", sub: "Tiền thuê & phí", path: "/user/bills" },
                                    { icon: "🔧", label: "Sửa chữa", sub: "Gửi yêu cầu", path: "/user/maintenance" },
                                    { icon: "💬", label: "Liên hệ", sub: "Ban quản lý", path: null },
                                    { icon: "📷", label: "Báo cáo", sub: "Sự cố phòng", path: null },
                                    { icon: "🔑", label: "Gia hạn", sub: "Hợp đồng", path: "/user/contract" },
                                    { icon: "🚗", label: "Đăng ký", sub: "Bãi đỗ xe", path: null },
                                ].map((item) => (
                                    <button
                                        key={item.label}
                                        className={cx("quickBtn")}
                                        onClick={() => item.path && navigate(item.path)}
                                    >
                                        <div className={cx("quickBtnIcon")}>{item.icon}</div>
                                        <div className={cx("quickBtnText")}>{item.label}</div>
                                        <div className={cx("quickBtnSub")}>{item.sub}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* ── Bills (from API) ── */}
            <BillsCard bills={bills} onViewAll={() => navigate("/user/bills")} />

            {/* ── Bottom grid ── */}
            <div className={cx("bottomGrid")}>

                {/* Maintenance Requests */}
                <div className={cx("card")}>
                    <div className={cx("cardHeader")}>
                        <div>
                            <div className={cx("cardTitle")}>Yêu cầu bảo trì</div>
                            <div className={cx("cardSub")}>Trạng thái xử lý</div>
                        </div>
                        <span
                            className={cx("cardAction")}
                            onClick={() => navigate("/user/maintenance")}
                        >
                            Tạo mới +
                        </span>
                    </div>
                    <div className={cx("cardBody")}>
                        {MOCK_MAINTENANCE.map((item) => (
                            <div key={item.id} className={cx("requestItem")}>
                                <div className={cx("requestIcon", item.type)}>{item.icon}</div>
                                <div className={cx("requestContent")}>
                                    <div className={cx("requestTitle")}>{item.title}</div>
                                    <div className={cx("requestDesc")}>{item.description}</div>
                                    <div className={cx("requestMeta")}>
                                        <span className={cx("statusPill", item.status)}>{item.statusLabel}</span>
                                        <span className={cx("requestDate")}>{item.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Utilities */}
                <div className={cx("card")}>
                    <div className={cx("cardHeader")}>
                        <div>
                            <div className={cx("cardTitle")}>Tiêu thụ điện nước</div>
                            <div className={cx("cardSub")}>Tháng 3/2026</div>
                        </div>
                        <span
                            className={cx("cardAction")}
                            onClick={() => navigate("/user/utilities")}
                        >
                            Chi tiết →
                        </span>
                    </div>
                    <div className={cx("cardBody")}>
                        {[
                            { icon: "⚡", label: "Điện", key: "electricity" },
                            { icon: "💧", label: "Nước", key: "water" },
                            { icon: "🌐", label: "Internet", key: "internet" },
                        ].map(({ icon, label, key }) => (
                            <div key={key} className={cx("utilRow")}>
                                <span className={cx("utilIcon")}>{icon}</span>
                                <span className={cx("utilLabel")}>{label}</span>
                                <div className={cx("utilBarWrap")}>
                                    <div
                                        className={cx("utilBar", key)}
                                        style={{ "--util-pct": `${MOCK_UTILITIES[key].percent}%` }}
                                    />
                                </div>
                                <span className={cx("utilVal")}>
                                    {MOCK_UTILITIES[key].value
                                        ? `${MOCK_UTILITIES[key].value} ${MOCK_UTILITIES[key].unit}`
                                        : MOCK_UTILITIES[key].unit}
                                </span>
                            </div>
                        ))}

                        <div className={cx("utilCompare")}>
                            {[
                                { label: "Tiền điện", value: MOCK_UTILITIES.electricity.cost },
                                { label: "Tiền nước", value: MOCK_UTILITIES.water.cost },
                                { label: "Internet", value: MOCK_UTILITIES.internet.cost },
                                { label: "Tổng phụ phí", value: MOCK_UTILITIES.total, highlight: true },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className={cx("utilCompareItem", { highlight: item.highlight })}
                                >
                                    <div className={cx("utilCompareLabel")}>{item.label}</div>
                                    <div className={cx("utilCompareValue")}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Notices */}
                <div className={cx("card")}>
                    <div className={cx("cardHeader")}>
                        <div>
                            <div className={cx("cardTitle")}>Thông báo tòa nhà</div>
                            <div className={cx("cardSub")}>Cập nhật mới nhất</div>
                        </div>
                        <span className={cx("cardAction")}>Tất cả →</span>
                    </div>
                    <div className={cx("cardBody")}>
                        {MOCK_NOTICES.map((item) => (
                            <div key={item.id} className={cx("noticeItem")}>
                                <div className={cx("noticeBadge", item.badge)}>
                                    {item.badgeIcon} {item.badgeLabel}
                                </div>
                                <div className={cx("noticeTitle")}>{item.title}</div>
                                <div className={cx("noticeDesc")}>{item.description}</div>
                                <div className={cx("noticeTime")}>{item.time}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* ── Services (from API) ── */}
            <ServicesCard services={servicesData} />

        </div>
    );
};

export default Dashboard;