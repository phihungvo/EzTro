import React, { useState, useEffect } from 'react';
import {
    Row, Col, Card, Tag, DatePicker,
    Typography, Avatar, Select, Spin, message,
} from 'antd';
import {
    DollarOutlined, HomeOutlined, TeamOutlined, ShoppingOutlined,
    ArrowUpOutlined, ArrowDownOutlined, FireOutlined,
    WalletOutlined, FieldTimeOutlined, FileProtectOutlined, ApartmentOutlined, CalendarOutlined, FilterOutlined
} from '@ant-design/icons';
import ReactApexChart from 'react-apexcharts';
import styles from './HomeDashboard.module.scss';
import { useAuth } from '~/routes/AuthContext';
import { getOwnerDashboardSummary } from '~/service/admin/dashboard';
import { getAllBoardingHousesNoPaged } from '~/service/admin/boarding_house';

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (v = 0) => Number(v || 0).toLocaleString('vi-VN');
const fmtM = (v) => `${(v / 1_000_000).toFixed(1)}M`;

// ─── shared chart defaults ───────────────────────────────────────────────────
const baseChart = {
    toolbar: { show: false },
    background: 'transparent',
    fontFamily: "'IBM Plex Mono', 'DM Mono', monospace",
    animations: { enabled: true, easing: 'easeinout', speed: 600 },
};

const labelColor = '#dce6ff';
const mutedLabel = '#9fb5d7';

const baseXAxis = {
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: labelColor, fontSize: '11px' } },
};

const baseYAxis = {
    labels: { style: { colors: labelColor, fontSize: '11px' } },
};

const baseGrid = {
    borderColor: '#1f2a44',
    strokeDashArray: 3,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
};

const baseTooltip = {
    theme: 'dark',
    style: { fontSize: '12px', fontFamily: "'IBM Plex Mono', monospace" },
};

// ─── static demo data ────────────────────────────────────────────────────────
const TRAFFIC_OPTIONS = {
    chart: { ...baseChart, type: 'area' },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: [2, 1.5], dashArray: [0, 4] },
    fill: {
        type: ['gradient', 'solid'],
        gradient: { shadeIntensity: 1, opacityFrom: 0.15, opacityTo: 0, stops: [0, 100] },
        opacity: [1, 0],
    },
    xaxis: { ...baseXAxis, categories: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] },
    yaxis: { ...baseYAxis, labels: { ...baseYAxis.labels, formatter: (v) => `${(v / 1000).toFixed(0)}K` } },
    colors: ['#22d3ee', '#8b5cf6'],
    grid: baseGrid,
    legend: {
        position: 'top', horizontalAlign: 'left',
        fontSize: '11px', fontWeight: 500,
        markers: { radius: 2, width: 10, height: 10 },
        labels: { colors: mutedLabel },
    },
    tooltip: { ...baseTooltip, y: { formatter: (v) => `${v.toLocaleString()} lượt` } },
};

const TRAFFIC_SERIES = [
    { name: 'Tổng lượt truy cập', data: [4200, 5300, 4800, 6400, 7100, 8200, 7600] },
    { name: 'Người dùng duy nhất', data: [1800, 2200, 2000, 2600, 2900, 3400, 3100] },
];

const GROWTH_OPTIONS = {
    chart: { ...baseChart, type: 'line' },
    stroke: { curve: 'smooth', width: [2, 1.5], dashArray: [0, 5] },
    markers: { size: [4, 0], strokeWidth: 2, strokeColors: '#fff' },
    xaxis: { ...baseXAxis, categories: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] },
    yaxis: { ...baseYAxis, labels: { ...baseYAxis.labels, formatter: (v) => `${v}%` } },
    colors: ['#22d3ee', '#8b5cf6'],
    grid: baseGrid,
    legend: {
        position: 'top', horizontalAlign: 'left', fontSize: '11px', fontWeight: 500,
        markers: { radius: 2, width: 10, height: 10 },
        labels: { colors: mutedLabel },
    },
    tooltip: { ...baseTooltip, y: { formatter: (v) => `${v}%` } },
};

const GROWTH_SERIES = [
    { name: 'Người dùng', data: [12, 18, 25, 32, 38, 45, 52] },
    { name: 'Doanh thu', data: [8, 15, 22, 28, 35, 42, 48] },
];

const REVENUE_OPTIONS = {
    chart: { ...baseChart, type: 'bar' },
    plotOptions: { bar: { borderRadius: 3, horizontal: true, barHeight: '60%', distributed: true } },
    dataLabels: {
        enabled: true,
        formatter: (v) => fmtM(v),
        style: { fontSize: '11px', fontWeight: 600, colors: ['#fff'] },
    },
    xaxis: {
        ...baseXAxis,
        categories: ['Gói đăng ký', 'Một lần', 'Cao cấp', 'Tư vấn', 'Đối tác'],
        labels: { ...baseXAxis.labels, formatter: (v) => fmtM(v) },
    },
    yaxis: { labels: { style: { colors: '#475569', fontSize: '12px' } } },
    colors: ['#22d3ee', '#0ea5e9', '#6366f1', '#8b5cf6', '#c084fc'],
    grid: { ...baseGrid, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
    legend: { show: false },
    tooltip: { ...baseTooltip, y: { formatter: (v) => `${fmtM(v)} VNĐ` } },
};

const REVENUE_SERIES = [{ data: [42_500_000, 28_300_000, 18_700_000, 12_400_000, 8_600_000] }];

const DONUT_OPTIONS = {
    chart: { ...baseChart, type: 'donut' },
    labels: ['5★ Xuất sắc', '4★ Tốt', '3★ Trung bình', '2★ Kém', '1★ Rất tệ'],
    colors: ['#0f172a', '#475569', '#94a3b8', '#cbd5e1', '#e2e8f0'],
    legend: { show: false },
    plotOptions: {
        pie: {
            donut: {
                size: '72%',
                labels: {
                    show: true,
                    total: {
                        show: true, label: 'Đánh giá',
                        fontSize: '11px', fontWeight: 500, color: '#94a3b8',
                        formatter: () => '4.6★',
                    },
                    value: { fontSize: '22px', fontWeight: 600, color: '#0f172a' },
                },
            },
        },
    },
    dataLabels: { enabled: false },
    stroke: { width: 2, colors: ['#fff'] },
    tooltip: { ...baseTooltip },
};

const DONUT_SERIES = [68, 22, 7, 2, 1];

const HEATMAP_OPTIONS = {
    chart: { ...baseChart, type: 'heatmap' },
    plotOptions: {
        heatmap: {
            shadeIntensity: 0.7,
            radius: 4,
            colorScale: {
                ranges: [
                    { from: 0, to: 500, color: '#f1f5f9', name: 'Thấp' },
                    { from: 501, to: 1000, color: '#94a3b8', name: 'Vừa' },
                    { from: 1001, to: 1500, color: '#475569', name: 'Cao' },
                    { from: 1501, to: 2000, color: '#0f172a', name: 'Rất cao' },
                ],
            },
        },
    },
    dataLabels: { enabled: false },
    xaxis: { ...baseXAxis, categories: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'] },
    yaxis: { labels: { style: { colors: '#475569', fontSize: '11px' } } },
    grid: { padding: { right: 16 } },
    legend: { fontSize: '11px', fontWeight: 500, labels: { colors: '#64748b' } },
    tooltip: { ...baseTooltip, y: { formatter: (v) => `${v} users` } },
};

const HEATMAP_SERIES = [
    { name: 'Thứ 2', data: [420, 280, 650, 1450, 1820, 890] },
    { name: 'Thứ 3', data: [380, 310, 720, 1520, 1750, 920] },
    { name: 'Thứ 4', data: [450, 290, 680, 1480, 1890, 850] },
    { name: 'Thứ 5', data: [410, 320, 710, 1560, 1920, 910] },
    { name: 'Thứ 6', data: [480, 340, 750, 1620, 1980, 1150] },
];

const REGION_DATA = [
    { region: 'Hồ Chí Minh', users: 4521, growth: 24.5 },
    { region: 'Hà Nội', users: 3842, growth: 19.8 },
    { region: 'Đà Nẵng', users: 2156, growth: 32.1 },
    { region: 'Cần Thơ', users: 1487, growth: 28.4 },
    { region: 'Hải Phòng', users: 1234, growth: 15.7 },
];

const MAX_REGION = 4521;

const LANDLORDS = [
    { rank: 1, name: 'Nguyễn Văn Minh', properties: 38, revenue: 245_000_000, rating: 4.9, tenants: 142, growth: 28.5 },
    { rank: 2, name: 'Trần Thị Hương', properties: 32, revenue: 198_000_000, rating: 4.8, tenants: 118, growth: 24.2 },
    { rank: 3, name: 'Lê Quang Đạt', properties: 28, revenue: 167_000_000, rating: 4.7, tenants: 96, growth: 31.8 },
    { rank: 4, name: 'Phạm Minh Thu', properties: 24, revenue: 142_000_000, rating: 4.6, tenants: 84, growth: 19.4 },
    { rank: 5, name: 'Hoàng Tuấn Anh', properties: 21, revenue: 128_000_000, rating: 4.5, tenants: 72, growth: 22.1 },
];

// ─── sub-components ──────────────────────────────────────────────────────────
function KpiCard({
                                    title,
                                    value,
                                    suffix,
                                    change,
                                    changeDesc,
                                    icon,
                                    iconColor,
                                    iconBg,
                                }) {
    const isUp = change >= 0;
    const displayValue = value ?? 0;

    const formatValue = () => {
        if (suffix === 'VNĐ') {
            if (displayValue >= 1_000_000_000)
                return (displayValue / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + 'B';
            if (displayValue >= 1_000_000)
                return (displayValue / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + 'M';
            return displayValue.toLocaleString('vi-VN');
        }
        return displayValue.toLocaleString('vi-VN');
    };

    return (
        <div className={styles.card}>
            <div
                className={styles.iconWrap}
                style={{
                    '--kpi-icon-color': iconColor,
                    '--kpi-icon-bg': iconBg,
                }}
            >
                {icon}
            </div>

            <div className={styles.body}>
                <span className={styles.label}>{title}</span>

                <div className={styles.valueRow}>
                    <span className={styles.value}>{formatValue()}</span>
                    {suffix === 'VNĐ' && <span className={styles.suffix}>đ</span>}
                    {suffix === '%' && <span className={styles.suffix}>%</span>}
                </div>

                <div className={styles.footer}>
          <span className={`${styles.badge} ${isUp ? styles.badgeUp : styles.badgeDn}`}>
            {isUp
                ? <ArrowUpOutlined className={styles.arrow} />
                : <ArrowDownOutlined className={styles.arrow} />}
              {Math.abs(change)}%
          </span>
                    {changeDesc && (
                        <span className={styles.desc}>{changeDesc}</span>
                    )}
                </div>
            </div>
        </div>
    );
}

function SectionLabel({ children }) {
    return <div className={styles.sectionLabel}>{children}</div>;
}

function ChartCard({ title, subtitle, children, className }) {
    return (
        <div className={`${styles.chartCard} ${className || ''}`}>
            {title && (
                <div className={styles.chartCardHeader}>
                    <div className={styles.chartCardTitle}>{title}</div>
                    {subtitle && <div className={styles.chartCardSub}>{subtitle}</div>}
                </div>
            )}
            {children}
        </div>
    );
}

// ─── main component ──────────────────────────────────────────────────────────
function AdminDashboard() {
    const { user } = useAuth();
    const isOwner = user?.role === 'OWNER';

    const [filterRangeType, setFilterRangeType] = useState('MONTH');
    const [filterDateRange, setFilterDateRange] = useState(null);
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [boardingHouses, setBoardingHouses] = useState([]);
    const [ownerSummary, setOwnerSummary] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);

    const handleRangeChange = (value) => {
        setFilterRangeType(value);
        if (value !== 'CUSTOM') setFilterDateRange(null);
    };

    useEffect(() => {
        if (!isOwner) return;
        getAllBoardingHousesNoPaged()
            .then((data) => setBoardingHouses(data || []))
            .catch(() => message.error('Không tải được danh sách khu nhà'));
    }, [isOwner]);

    useEffect(() => {
        if (!isOwner) return;
        const fetch = async () => {
            setLoadingSummary(true);
            try {
                const params = { rangeType: filterRangeType };
                if (filterRangeType === 'CUSTOM' && filterDateRange?.length === 2) {
                    params.startDate = filterDateRange[0].format('YYYY-MM-DD');
                    params.endDate = filterDateRange[1].format('YYYY-MM-DD');
                }
                if (selectedHouse) params.boardingHouseId = selectedHouse;
                setOwnerSummary(await getOwnerDashboardSummary(params));
            } catch (e) {
                message.error(e?.response?.data?.message || 'Không tải được dữ liệu dashboard');
            } finally {
                setLoadingSummary(false);
            }
        };
        fetch();
    }, [filterRangeType, filterDateRange, selectedHouse, isOwner]);

    // KPI data
    const occupancyRate = (ownerSummary && ownerSummary.totalRooms > 0)
        ? Math.round((ownerSummary.occupiedRooms / ownerSummary.totalRooms) * 100)
        : 0;

    const kpiMetrics = (isOwner && ownerSummary)
        ? [
            { title: 'Doanh thu', value: ownerSummary.revenueInRange || 0, suffix: 'VNĐ', change: 0, changeBadge: 'Thu tiền', icon: <DollarOutlined />, iconColor: '#22c55e', iconBg: 'rgba(34, 197, 94, 0.14)', description: 'Tiền đã nhận' },
            { title: 'Công nợ', value: ownerSummary.outstandingInRange || 0, suffix: 'VNĐ', change: 0, changeBadge: 'Chưa thu', icon: <WalletOutlined />, iconColor: '#0ea5e9', iconBg: 'rgba(14, 165, 233, 0.14)', description: 'Chưa thu' },
            { title: 'Thanh toán quá hạn', value: ownerSummary.overdueOutstandingInRange || 0, suffix: 'VNĐ', change: 0, changeBadge: `${ownerSummary.overdueBillsCount || 0} hóa đơn`, icon: <FieldTimeOutlined />, iconColor: '#f97316', iconBg: 'rgba(249, 115, 22, 0.14)', description: 'Công nợ quá hạn cần thu' },
            { title: 'Tổng số phòng', value: ownerSummary.totalRooms || 0, suffix: '', change: 0, changeBadge: `${ownerSummary.occupiedRooms || 0} đang thuê`, icon: <HomeOutlined />, iconColor: '#8b5cf6', iconBg: 'rgba(139, 92, 246, 0.14)', description: `${ownerSummary.occupiedRooms || 0} phòng đang thuê` },
            { title: 'Tỷ lệ lấp đầy', value: occupancyRate, suffix: '%', change: 0, changeBadge: 'So với kỳ trước', icon: <ApartmentOutlined />, iconColor: '#ec4899', iconBg: 'rgba(236, 72, 153, 0.14)', description: 'Occupied / Total' },
            { title: 'Hợp đồng hiệu lực', value: ownerSummary.activeContracts || 0, suffix: '', change: 0, changeBadge: 'Đang active', icon: <FileProtectOutlined />, iconColor: '#14b8a6', iconBg: 'rgba(20, 184, 166, 0.14)', description: 'Hợp đồng active' },
        ]
        : [
            { title: 'Tổng doanh thu', value: 1_250_000_000, suffix: 'VNĐ', change: 28.4, changeBadge: 'MoM', icon: <DollarOutlined />, iconColor: '#22c55e', iconBg: 'rgba(34, 197, 94, 0.14)', description: '+385M so với tháng trước' },
            { title: 'Người dùng hoạt động', value: 15847, suffix: '', change: 18.2, changeBadge: 'Wow', icon: <TeamOutlined />, iconColor: '#38bdf8', iconBg: 'rgba(56, 189, 248, 0.14)', description: '+2,435 mới trong tháng' },
            { title: 'Tổng số phòng', value: 3421, suffix: '', change: 12.8, changeBadge: 'Doanh nghiệp', icon: <HomeOutlined />, iconColor: '#8b5cf6', iconBg: 'rgba(139, 92, 246, 0.14)', description: '+389 phòng mới' },
            { title: 'Tỷ lệ lấp đầy', value: 87, suffix: '%', change: 4.2, changeBadge: 'QoQ', icon: <TeamOutlined />, iconColor: '#ec4899', iconBg: 'rgba(236, 72, 153, 0.14)', description: '+3 điểm % so với tháng trước' },
            { title: 'Thanh toán quá hạn', value: 120_000_000, suffix: 'VNĐ', change: -2.1, changeBadge: 'So với tuần trước', icon: <FieldTimeOutlined />, iconColor: '#f97316', iconBg: 'rgba(249, 115, 22, 0.14)', description: 'Công nợ quá hạn' },
            { title: 'Tổng giao dịch', value: 8956, suffix: '', change: 24.6, changeBadge: 'Tháng', icon: <ShoppingOutlined />, iconColor: '#14b8a6', iconBg: 'rgba(20, 184, 166, 0.14)', description: '+1,756 tháng này' },
        ];

    // Owner dynamic chart data
    const revenueCategories = ownerSummary?.revenueTrend?.categories || [];
    const revenueSeries = ownerSummary?.revenueTrend?.series?.map((s) => ({ name: s.name, data: s.data })) || [];
    const ownerRevenueOptions = {
        chart: { ...baseChart, type: 'line' },
        stroke: { curve: 'smooth', width: 2 },
        dataLabels: { enabled: false },
        xaxis: { ...baseXAxis, categories: revenueCategories },
        yaxis: { ...baseYAxis, labels: { ...baseYAxis.labels, formatter: (v) => fmt(v) } },
        colors: ['#22d3ee'],
        grid: baseGrid,
        tooltip: { ...baseTooltip, y: { formatter: (v) => `${fmt(v)} VNĐ` } },
    };

    const occupancyCategories = ownerSummary?.occupancyByHouses?.map((h) => h.boardingHouseName) || [];
    const occupancySeries = ownerSummary
        ? [
            { name: 'Đã thuê', data: ownerSummary.occupancyByHouses.map((h) => h.occupiedRooms) },
            { name: 'Còn trống', data: ownerSummary.occupancyByHouses.map((h) => Math.max(0, (h.totalRooms || 0) - (h.occupiedRooms || 0))) },
        ]
        : [];
    const occupancyOptions = {
        chart: { ...baseChart, type: 'bar', stacked: true },
        plotOptions: { bar: { horizontal: false, columnWidth: '52%', borderRadius: 4 } },
        dataLabels: { enabled: false },
        xaxis: { ...baseXAxis, categories: occupancyCategories },
        yaxis: baseYAxis,
        colors: ['#22c55e', '#1f2937'],
        grid: baseGrid,
        legend: { position: 'top', horizontalAlign: 'right', fontSize: '11px', labels: { colors: mutedLabel } },
        tooltip: { ...baseTooltip, y: { formatter: (v) => v.toLocaleString() } },
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                {isOwner && (
                    <div className={styles.filterBar}>
                        {/*<div className={styles.filterHead}>*/}
                        {/*    <div className={styles.filterBadge}>*/}
                        {/*        <FilterOutlined />*/}
                        {/*        <span>Bộ lọc dữ liệu</span>*/}
                        {/*    </div>*/}
                        {/*    <div className={styles.filterHint}>Chọn nhanh khoảng thời gian và khu nhà</div>*/}
                        {/*</div>*/}

                        <div className={styles.filterGrid}>
                            <div className={styles.filterGroup}>
                                <div className={styles.filterLabel}>Khoảng thời gian</div>
                                <div className={styles.pillRow}>
                                    {['WEEK', 'MONTH', 'YEAR'].map((v) => (
                                        <button
                                            key={v}
                                            className={`${styles.pill} ${filterRangeType === v ? styles.pillActive : ''}`}
                                            onClick={() => handleRangeChange(v)}
                                        >
                                            {{ WEEK: 'Tuần', MONTH: 'Tháng', YEAR: 'Năm' }[v]}
                                        </button>
                                    ))}
                                    <button
                                        className={`${styles.pill} ${styles.pillCustom} ${filterRangeType === 'CUSTOM' ? styles.pillActive : ''}`}
                                        onClick={() => handleRangeChange('CUSTOM')}
                                    >
                                        <CalendarOutlined />
                                        <span>Tùy chọn</span>
                                    </button>
                                </div>
                                {filterRangeType === 'CUSTOM' && (
                                    <div className={styles.rangeWrap}>
                                        <RangePicker
                                            value={filterDateRange}
                                            onChange={setFilterDateRange}
                                            allowClear
                                            size="small"
                                            className="ez-home-range-picker"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className={styles.filterGroup}>
                                <div className={styles.filterLabel}>Khu nhà</div>
                                <div className={styles.selectShell}>
                                    <ApartmentOutlined className={styles.selectIcon} />
                                    <Select
                                        allowClear
                                        placeholder="Tất cả khu nhà"
                                        value={selectedHouse}
                                        onChange={setSelectedHouse}
                                        options={boardingHouses.map((bh) => ({ value: bh.id, label: bh.name }))}
                                        size="small"
                                        className="ez-home-house-select"
                                        popupClassName="ez-home-house-select-dropdown"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── KPI Grid ── */}
                <div className={styles.kpiGrid}>
                    {kpiMetrics.map((m, i) => <KpiCard key={i} {...m} />)}
                </div>

                {/* ── Owner-specific charts ── */}
                {isOwner && (
                    <Spin spinning={loadingSummary}>
                        <Row gutter={[16, 16]} className={styles.section}>
                            <Col xs={24} xl={16}>
                                <ChartCard title="Doanh thu theo ngày" subtitle="Tổng tiền đã nhận trong khoảng lọc">
                                    {revenueSeries.length > 0
                                        ? <ReactApexChart options={ownerRevenueOptions} series={revenueSeries} type="line" height={280} />
                                        : <div className={styles.empty}>Chưa có dữ liệu</div>}
                                </ChartCard>
                            </Col>
                            <Col xs={24} xl={8}>
                                <ChartCard title="Tình trạng phòng" subtitle="Đã thuê / còn trống theo khu nhà">
                                    {occupancySeries.length > 0
                                        ? <ReactApexChart options={occupancyOptions} series={occupancySeries} type="bar" height={280} />
                                        : <div className={styles.empty}>Chưa có dữ liệu</div>}
                                </ChartCard>
                            </Col>
                        </Row>
                    </Spin>
                )}

                {/* ── Traffic & Growth ── */}
                <div className={styles.section}>
                    <SectionLabel>Lưu lượng &amp; tăng trưởng</SectionLabel>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} xl={16}>
                            <ChartCard title="Lưu lượng truy cập" subtitle="7 ngày qua — tổng &amp; duy nhất">
                                <ReactApexChart options={TRAFFIC_OPTIONS} series={TRAFFIC_SERIES} type="area" height={260} />
                            </ChartCard>
                        </Col>
                        <Col xs={24} xl={8}>
                            <ChartCard title="So sánh tăng trưởng" subtitle="Người dùng vs doanh thu">
                                <ReactApexChart options={GROWTH_OPTIONS} series={GROWTH_SERIES} type="line" height={260} />
                            </ChartCard>
                        </Col>
                    </Row>
                </div>

                {/* ── Revenue & Satisfaction ── */}
                <div className={styles.section}>
                    <SectionLabel>Doanh thu &amp; hài lòng</SectionLabel>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={14}>
                            <ChartCard title="Doanh thu theo nguồn">
                                <ReactApexChart options={REVENUE_OPTIONS} series={REVENUE_SERIES} type="bar" height={280} />
                            </ChartCard>
                        </Col>
                        <Col xs={24} lg={10}>
                            <ChartCard title="Mức độ hài lòng" subtitle="2,847 đánh giá">
                                <div className={styles.donutWrap}>
                                    <ReactApexChart options={DONUT_OPTIONS} series={DONUT_SERIES} type="donut" height={200} />
                                </div>
                                <div className={styles.satisfactionRow}>
                                    <div className={styles.satItem}>
                                        <div className={styles.satNum}>4.6★</div>
                                        <div className={styles.satLabel}>Avg rating</div>
                                    </div>
                                    <div className={styles.satDivider} />
                                    <div className={styles.satItem}>
                                        <div className={styles.satNum}>94%</div>
                                        <div className={styles.satLabel}>Khuyến nghị</div>
                                    </div>
                                    <div className={styles.satDivider} />
                                    <div className={styles.satItem}>
                                        <div className={styles.satNum}>2.8K</div>
                                        <div className={styles.satLabel}>Tổng đánh giá</div>
                                    </div>
                                </div>
                            </ChartCard>
                        </Col>
                    </Row>
                </div>

                {/* ── Heatmap & Regions ── */}
                <div className={styles.section}>
                    <SectionLabel>Hoạt động &amp; khu vực</SectionLabel>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={14}>
                            <ChartCard title="Bản đồ nhiệt" subtitle="Giờ cao điểm theo từng ngày">
                                <ReactApexChart options={HEATMAP_OPTIONS} series={HEATMAP_SERIES} type="heatmap" height={260} />
                            </ChartCard>
                        </Col>
                        <Col xs={24} lg={10}>
                            <ChartCard title="Khu vực nổi bật" subtitle="Người dùng theo tỉnh/thành">
                                <div className={styles.regionList}>
                                    {REGION_DATA.map((r) => (
                                        <div key={r.region} className={styles.regionRow}>
                                            <div className={styles.regionName}>{r.region}</div>
                                            <div className={styles.regionBarWrap}>
                                                <div
                                                    className={styles.regionBar}
                                                    style={{ width: `${Math.round((r.users / MAX_REGION) * 100)}%` }}
                                                />
                                            </div>
                                            <div className={styles.regionMeta}>
                                                <span className={styles.regionVal}>{r.users.toLocaleString()}</span>
                                                <span className={`${styles.regionGrowth} ${styles.up}`}>+{r.growth}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ChartCard>
                        </Col>
                    </Row>
                </div>

                {/* ── Leaderboard ── */}
                <div className={styles.section}>
                    <SectionLabel>Chủ nhà có hiệu suất tốt nhất</SectionLabel>
                    <ChartCard>
                        <div className={styles.tableWrap}>
                            <table className={styles.landlordTable}>
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Tên</th>
                                    <th>Phòng</th>
                                    <th>Người thuê</th>
                                    <th>Doanh thu</th>
                                    <th>Tăng trưởng</th>
                                    <th>Đánh giá</th>
                                </tr>
                                </thead>
                                <tbody>
                                {LANDLORDS.map((l) => (
                                    <tr key={l.rank}>
                                        <td className={styles.rankCell}>{String(l.rank).padStart(2, '0')}</td>
                                        <td>
                                            <div className={styles.nameCell}>
                                                <Avatar size={28} className={styles.miniAvatar}>{l.name.charAt(0)}</Avatar>
                                                <span>{l.name}</span>
                                            </div>
                                        </td>
                                        <td className={styles.numCell}>{l.properties}</td>
                                        <td className={styles.numCell}>{l.tenants}</td>
                                        <td className={styles.numCell}>{fmtM(l.revenue)}</td>
                                        <td>
                        <span className={`${styles.changeBadge} ${styles.up}`}>
                          <ArrowUpOutlined /> {l.growth}%
                        </span>
                                        </td>
                                        <td className={styles.numCell}>{l.rating}★</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </ChartCard>
                </div>

            </div>
        </div>
    );
}

export default AdminDashboard;
