import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import classNames from "classnames/bind";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import styles from "./Dashboard.module.scss";

import StatsGrid from "~/components/Layout/UserLayout/components/StatsGrid";
import BillsCard from "~/components/Layout/UserLayout/components/BillsCard";
import ServicesCard from "~/components/Layout/UserLayout/components/ServicesCard";

import { getMyBills, getSummaryInfo } from "src/service/user/dashboard";
import { getMyRoomInfo } from "~/service/user/my-room";
import { getMyIncidentReports } from "~/service/user/incident-report";
import {
    getMyMeterReadingsCurrentPeriod,
    getMyMeterReadingsHistory
} from "~/service/user/utilities";
import { getMyNotifications } from "~/service/admin/notification-service";

const cx = classNames.bind(styles);

const INCIDENT_STATUS_META = {
    PENDING: { label: "Đang chờ xử lý", pill: "new", icon: "🕐", iconClass: "pending" },
    IN_PROGRESS: { label: "Đang xử lý", pill: "processing", icon: "🔧", iconClass: "inProgress" },
    RESOLVED: { label: "Đã hoàn tất", pill: "done", icon: "✅", iconClass: "resolved" },
    REJECTED: { label: "Đã từ chối", pill: "done", icon: "⚠️", iconClass: "rejected" },
};

const formatMoney = (value) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value || 0));

const isElectricReading = (reading) =>
    String(reading?.utilityUnit || "")
        .toLowerCase()
        .includes("kwh")
    || String(reading?.utilityName || "").toLowerCase().includes("điện");

const isWaterReading = (reading) => {
    const unit = String(reading?.utilityUnit || "").toLowerCase();
    return unit.includes("m³") || unit.includes("m3") || String(reading?.utilityName || "").toLowerCase().includes("nước");
};

const isInternetReading = (reading) =>
    String(reading?.utilityName || "").toLowerCase().includes("internet")
    || String(reading?.utilityUnit || "").toLowerCase().includes("gói");

const formatTimestamp = (value) => {
    if (!value) return "—";
    return dayjs(value).fromNow();
};

dayjs.extend(relativeTime);
dayjs.locale("vi");

// ─── Component ────────────────────────────────────────────────────────────────

const Dashboard = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [bills, setBills] = useState([]);
    const [roomInfo, setRoomInfo] = useState(null);
    const [incidentReports, setIncidentReports] = useState([]);
    const [currentReadings, setCurrentReadings] = useState([]);
    const [historyReadings, setHistoryReadings] = useState([]);
    const [noticeItems, setNoticeItems] = useState([]);

    const formatCurrencyCompact = (value) => `${(Number(value || 0) / 1_000_000).toFixed(1)} tr`;
    const parseDate = (value) => {
        if (!value) {
            return null;
        }
        const date = new Date(`${value}T00:00:00`);
        return Number.isNaN(date.getTime()) ? null : date;
    };
    const formatDate = (value) => {
        const date = parseDate(value);
        if (!date) {
            return "—";
        }
        return date.toLocaleDateString("vi-VN");
    };

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

    useEffect(() => {
        let active = true;
        const loadRoom = async () => {
            try {
                const response = await getMyRoomInfo();
                if (active) {
                    setRoomInfo(response?.result || null);
                }
            } catch (error) {
                console.error("Failed to load room info for dashboard", error);
            }
        };
        loadRoom();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;
        const loadIncidents = async () => {
            try {
                const response = await getMyIncidentReports();
                if (active) {
                    setIncidentReports(Array.isArray(response) ? response : []);
                }
            } catch (error) {
                console.error("Failed to load incident reports for dashboard", error);
            }
        };
        loadIncidents();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;
        const loadUtilities = async () => {
            try {
                const [current, history] = await Promise.all([
                    getMyMeterReadingsCurrentPeriod(),
                    getMyMeterReadingsHistory(24),
                ]);
                if (active) {
                    setCurrentReadings(Array.isArray(current) ? current : []);
                    setHistoryReadings(Array.isArray(history) ? history : []);
                }
            } catch (error) {
                console.error("Failed to load utility readings for dashboard", error);
            }
        };
        loadUtilities();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;
        const loadNotices = async () => {
            try {
                const response = await getMyNotifications(0, 3, { status: "ALL" });
                if (active) {
                    setNoticeItems(response?.content || []);
                }
            } catch (error) {
                console.error("Failed to load notifications for dashboard", error);
            }
        };
        loadNotices();
        return () => {
            active = false;
        };
    }, []);

    const statsData = summary
        ? [
            { label: "Phòng hiện tại", value: summary.roomNumber },
            {
                label: "Tiền thuê tháng này",
                value: formatCurrencyCompact(summary.monthlyRent),
            },
            {
                label: "Thanh toán",
                value: summary.paymentStatus,
                status: summary.paymentStatus?.includes("Chưa") || summary.paymentStatus?.includes("Quá hạn")
                    ? "unpaid"
                    : "paid",
            },
            {
                label: "Hết hạn hợp đồng",
                value: formatDate(summary.contractEndDate),
            },
        ]
        : [];

    const servicesData = [
        { icon: "⚡", label: "Điện / Nước", onClick: () => navigate("/user/dashboard?tab=utilities") },
        { icon: "📄", label: "Hoá đơn", onClick: () => navigate("/user/dashboard?tab=bills") },
        { icon: "👤", label: "Hồ sơ", onClick: () => navigate("/user/dashboard?tab=profile") },
        { icon: "📞", label: "Liên hệ", onClick: () => {} },
    ];

    const unpaidCount = Number(summary?.unpaidBillCount ?? bills.filter((b) =>
        ["UNPAID", "OVERDUE", "PARTIALLY_PAID"].includes(b?.status)
    ).length);
    const outstandingAmount = Number(summary?.outstandingAmount || 0);
    const bannerRoomLabel = (roomInfo?.roomNumber || summary?.roomNumber)
        ? `Phòng ${roomInfo?.roomNumber || summary?.roomNumber}`
        : "Phòng của bạn";
    const bannerSubText = unpaidCount > 0
        ? `Bạn có ${unpaidCount} hoá đơn chưa thanh toán${outstandingAmount > 0 ? ` · Còn nợ ${(outstandingAmount / 1_000_000).toFixed(1)} triệu` : ""}`
        : summary?.latestBillDueDate
            ? `Hợp đồng còn hiệu lực · Kỳ gần nhất đến hạn: ${formatDate(summary.latestBillDueDate)}`
            : "Hợp đồng còn hiệu lực";
    const contractStartDate = parseDate(summary?.contractStartDate);
    const contractEndDate = parseDate(summary?.contractEndDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalContractDays = contractStartDate && contractEndDate
        ? Math.max(1, Math.round((contractEndDate - contractStartDate) / (1000 * 60 * 60 * 24)))
        : null;
    const elapsedContractDays = contractStartDate && contractEndDate
        ? Math.min(
            totalContractDays,
            Math.max(0, Math.round((today - contractStartDate) / (1000 * 60 * 60 * 24)))
        )
        : null;
    const contractProgressPercent = totalContractDays
        ? Math.min(100, Math.max(0, Math.round((elapsedContractDays / totalContractDays) * 100)))
        : 0;
    const monthsLeft = contractEndDate
        ? Math.max(
            0,
            (contractEndDate.getFullYear() - today.getFullYear()) * 12
                + (contractEndDate.getMonth() - today.getMonth())
                + (contractEndDate.getDate() >= today.getDate() ? 0 : -1)
        )
        : 0;

    const heroRoomLabel = roomInfo?.roomNumber ? `Phòng ${roomInfo.roomNumber}` : bannerRoomLabel;
    const heroRoomSubtitle = roomInfo
        ? `Tòa ${roomInfo.buildingName || "—"} · Tầng ${roomInfo.floor ?? "—"}`
        : "Đang tải thông tin phòng";

    const roomHighlights = useMemo(() => {
        const highlights = [
            roomInfo?.buildingName,
            roomInfo?.status,
            summary?.paymentStatus,
            summary?.unpaidBillCount > 0 ? `${summary.unpaidBillCount} hoá đơn chưa thanh toán` : null,
        ];
        return highlights.filter(Boolean);
    }, [roomInfo, summary]);

    const roomDetailRows = useMemo(() => [
        { label: "Diện tích", value: roomInfo?.area ? `${roomInfo.area} m²` : "Đang tải..." },
        { label: "Giá thuê", value: roomInfo?.price ? formatMoney(roomInfo.price) : "Đang tải..." },
        { label: "Tòa nhà", value: roomInfo?.buildingName || "Đang tải..." },
        { label: "Trạng thái", value: roomInfo?.status || "Đang tải..." },
    ], [roomInfo]);

    const incidentList = useMemo(() => incidentReports.slice(0, 3), [incidentReports]);

    const utilityStats = useMemo(() => {
        const normalize = (value) => Number(value ?? 0);
        const maxConsumption = (matcher) => {
            const values = historyReadings
                .filter(matcher)
                .map((reading) => normalize(reading?.consumption));
            values.push(normalize(currentReadings.find(matcher)?.consumption));
            return values.length > 0 ? Math.max(...values, 1) : 1;
        };

        const buildEntry = (icon, label, matcher, cssKey) => {
            const reading = currentReadings.find(matcher);
            const consumption = normalize(reading?.consumption);
            const benchmark = maxConsumption(matcher);
            const percent = reading ? Math.min(100, Math.round((consumption / benchmark) * 100)) : 0;
            const amount = normalize(reading?.amount);
            return {
                icon,
                label,
                cssKey,
                percent,
                displayValue: reading?.consumption ? `${consumption.toLocaleString()} ${reading?.utilityUnit || ""}` : "—",
                amount,
                amountLabel: amount ? formatMoney(amount) : "—",
            };
        };

        const entries = [
            buildEntry("⚡", "Điện", isElectricReading, "electricity"),
            buildEntry("💧", "Nước", isWaterReading, "water"),
            buildEntry("🌐", "Internet", isInternetReading, "internet"),
        ];

        const totalCost = entries.reduce((sum, entry) => sum + entry.amount, 0);
        const compareItems = [
            { label: "Tiền điện", value: entries[0].amountLabel },
            { label: "Tiền nước", value: entries[1].amountLabel },
            { label: "Internet", value: entries[2].amountLabel },
        ];

        return {
            entries,
            compareItems,
            totalLabel: totalCost ? formatMoney(totalCost) : "—",
        };
    }, [currentReadings, historyReadings]);

    const notices = useMemo(() => noticeItems.slice(0, 3), [noticeItems]);

    return (
        <div className={cx("dashboard")}>

            {/* ── Banner ── */}
            <div className={cx("banner")}>
                <div className={cx("bannerContent")}>
                    <div className={cx("bannerRoom")}>{bannerRoomLabel}</div>
                    <div className={cx("bannerSub")}>{bannerSubText}</div>
                    <div className={cx("bannerActions")}>
                        <button className={cx("btnPrimary")} onClick={() => navigate("/user/dashboard?tab=bills")}>
                            💳 Thanh toán ngay
                        </button>
                        <button className={cx("btnOutline")} onClick={() => navigate("/user/dashboard?tab=my-room")}>
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
                        <span className={cx("cardAction")} onClick={() => navigate("/user/dashboard?tab=contract")}>
                            Xem hợp đồng →
                        </span>
                    </div>
                    <div className={cx("cardBody")}>
                        <div className={cx("roomHero")}>
                            <div className={cx("roomHeroBg")}>🏢</div>
                            <div className={cx("roomHeroInfo")}>
                                <div className={cx("roomNumber")}>{heroRoomLabel}</div>
                                <div className={cx("roomType")}>{heroRoomSubtitle}</div>
                            </div>
                        </div>

                        <div className={cx("roomDetails")}>
                            {roomDetailRows.map((item) => (
                                <div key={item.label} className={cx("roomDetailItem")}>
                                    <div className={cx("roomDetailLabel")}>{item.label}</div>
                                    <div className={cx("roomDetailValue")}>{item.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className={cx("amenitiesLabel")}>Tóm tắt nhanh</div>
                        <div className={cx("amenities")}>
                            {roomHighlights.length > 0 ? (
                                roomHighlights.map((tag) => (
                                    <span key={tag} className={cx("amenityTag")}>{tag}</span>
                                ))
                            ) : (
                                <span className={cx("amenityTag")}>Đang cập nhật</span>
                            )}
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
                                        <div className={cx("contractDateValue")}>
                                            {summary?.contractStartDate ? formatDate(summary.contractStartDate) : "—"}
                                        </div>
                                    </div>
                                    <span className={cx("contractArrow")}>→</span>
                                    <div className={cx("contractDateItem")}>
                                        <div className={cx("contractDateLabel")}>Ngày kết thúc</div>
                                        <div className={cx("contractDateValue")}>
                                            {summary?.contractEndDate ? formatDate(summary.contractEndDate) : "—"}
                                        </div>
                                    </div>
                                </div>
                                <div className={cx("contractDivider")} />
                                <div className={cx("progressLabel")}>
                                    <span>Tiến độ hợp đồng</span>
                                    <span>{contractProgressPercent}% — còn {monthsLeft} tháng</span>
                                </div>
                                <div className={cx("progressBarWrap")}>
                                    <div
                                        className={cx("progressBar")}
                                        style={{ "--progress": `${contractProgressPercent}%` }}
                                    />
                                </div>
                            </div>
                            <button
                                className={cx("btnOutline", "btnFull")}
                                onClick={() => navigate("/user/dashboard?tab=contract")}
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
                                        onClick={() => {
                                            if (!item.path) return;
                                            const map = {
                                                "/user/maintenance": "/user/dashboard?tab=my-room",
                                                "/user/utilities": "/user/dashboard?tab=utilities",
                                                "/user/contract": "/user/dashboard?tab=contract",
                                                "/user/bills": "/user/dashboard?tab=bills",
                                            };
                                            navigate(map[item.path] || item.path);
                                        }}
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
            <BillsCard bills={bills} onViewAll={() => navigate("/user/dashboard?tab=bills")} />

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
                            onClick={() => navigate("/user/dashboard?tab=my-room")}
                        >
                            Tạo mới +
                        </span>
                    </div>
                <div className={cx("cardBody")}>
                        {incidentList.length > 0 ? (
                            incidentList.map((incident) => {
                                const statusKey = incident.status ?? "PENDING";
                                const meta = INCIDENT_STATUS_META[statusKey] || {
                                    label: statusKey,
                                    pill: "new",
                                    icon: "🛠️",
                                    iconClass: "pending",
                                };
                                return (
                                    <div key={incident.id} className={cx("requestItem")}>
                                        <div className={cx("requestIcon", meta.iconClass)}>{meta.icon}</div>
                                        <div className={cx("requestContent")}>
                                            <div className={cx("requestTitle")}>{incident.title}</div>
                                            <div className={cx("requestDesc")}>
                                                {incident.description || "Không có mô tả chi tiết"}
                                            </div>
                                            <div className={cx("requestMeta")}>
                                                <span className={cx("statusPill", meta.pill)}>
                                                    {meta.label}
                                                </span>
                                                <span className={cx("requestDate")}>
                                                    {formatTimestamp(incident.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className={cx("emptyState")}>
                                <div className={cx("emptyIcon")}>🎉</div>
                                <div className={cx("emptyText")}>Chưa có yêu cầu bảo trì nào</div>
                                <div className={cx("emptySubtext")}>
                                    Nhấn "Tạo mới +" để gửi yêu cầu đầu tiên
                                </div>
                            </div>
                        )}
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
                            onClick={() => navigate("/user/dashboard?tab=utilities")}
                        >
                            Chi tiết →
                        </span>
                    </div>
                    <div className={cx("cardBody")}>
                        {utilityStats.entries.map((entry) => (
                            <div key={entry.label} className={cx("utilRow")}>
                                <span className={cx("utilIcon")}>{entry.icon}</span>
                                <span className={cx("utilLabel")}>{entry.label}</span>
                                <div className={cx("utilBarWrap")}>
                                    <div
                                        className={cx("utilBar", entry.cssKey)}
                                        style={{ "--util-pct": `${entry.percent}%` }}
                                    />
                                </div>
                                <span className={cx("utilVal")}>{entry.displayValue}</span>
                            </div>
                        ))}

                        <div className={cx("utilCompare")}>
                            {utilityStats.compareItems.map((item) => (
                                <div key={item.label} className={cx("utilCompareItem")}>
                                    <div className={cx("utilCompareLabel")}>{item.label}</div>
                                    <div className={cx("utilCompareValue")}>{item.value}</div>
                                </div>
                            ))}
                            <div className={cx("utilCompareItem", "highlight")}>
                                <div className={cx("utilCompareLabel")}>Tổng phụ phí</div>
                                <div className={cx("utilCompareValue")}>{utilityStats.totalLabel}</div>
                            </div>
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
                        {notices.length > 0 ? (
                            notices.map((notice) => (
                                <div key={`${notice.id}-${notice.createdAt}`} className={cx("noticeItem")}>
                                    <div className={cx("noticeBadge")}>
                                        {notice.category || notice.priority || "Thông báo"}
                                    </div>
                                    <div className={cx("noticeTitle")}>{notice.title}</div>
                                    <div className={cx("noticeDesc")}>{notice.message || "Không có nội dung"}</div>
                                    <div className={cx("noticeTime")}>{formatTimestamp(notice.createdAt)}</div>
                                </div>
                            ))
                        ) : (
                            <div className={cx("emptyState")}>
                                <div className={cx("emptyIcon")}>🔔</div>
                                <div className={cx("emptyText")}>Chưa có thông báo mới</div>
                                <div className={cx("emptySubtext")}>Hệ thống sẽ hiển thị thông báo khi có cập nhật</div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* ── Services (from API) ── */}
            <ServicesCard services={servicesData} />

        </div>
    );
};

export default Dashboard;
