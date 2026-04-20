import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Spin, Tag} from 'antd';
import ReactApexChart from 'react-apexcharts';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import classNames from 'classnames/bind';
import styles from './Dashboard.module.scss';
import {
    getMyBills,
    getSummaryInfo,
} from 'src/service/user/dashboard';
import {getMyRoomInfo, getMyCurrentContract} from '~/service/user/my-room';
import {getMyIncidentReports} from '~/service/user/incident-report';
import {
    getMyMeterReadingsCurrentPeriod,
    getMyMeterReadingsHistory,
} from '~/service/user/utilities';
import {getMyNotifications} from '~/service/admin/notification-service';
import {
    MOCK_MONTHLY_SPENDING,
    MOCK_TENANT_BILLS,
    MOCK_TENANT_CONTRACT,
    MOCK_TENANT_INCIDENTS,
    MOCK_TENANT_NOTICES,
    MOCK_TENANT_ROOM,
    MOCK_TENANT_SUMMARY,
    MOCK_TENANT_UTILITIES,
} from './mockData';

import {CloudUploadOutlined, PlusOutlined} from '@ant-design/icons';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const cx = classNames.bind(styles);

const INCIDENT_STATUS_META = {
    PENDING: {label: 'Đang chờ xử lý', tone: 'warning', icon: '🕐'},
    IN_PROGRESS: {label: 'Đang xử lý', tone: 'info', icon: '🔧'},
    RESOLVED: {label: 'Đã hoàn tất', tone: 'success', icon: '✅'},
    REJECTED: {label: 'Đã từ chối', tone: 'danger', icon: '⚠️'},
};

const BILL_STATUS_META = {
    PAID: {label: 'Đã thanh toán', tone: 'success'},
    UNPAID: {label: 'Chưa thanh toán', tone: 'warning'},
    OVERDUE: {label: 'Quá hạn', tone: 'danger'},
    PARTIALLY_PAID: {label: 'Thanh toán một phần', tone: 'warning'},
};

const currency = new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'});

const formatMoney = (value) => currency.format(Number(value || 0));

const formatCompactMoney = (value) => `${(Number(value || 0) / 1_000_000).toFixed(1)} tr`;

const formatDate = (value) => {
    if (!value) return '—';
    if (Array.isArray(value) && value.length >= 3) {
        const [year, month, day] = value;
        return dayjs(new Date(year, month - 1, day)).format('DD/MM/YYYY');
    }
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format('DD/MM/YYYY') : '—';
};

const isElectricReading = (reading) =>
    String(reading?.utilityUnit || '').toLowerCase().includes('kwh')
    || String(reading?.utilityName || '').toLowerCase().includes('điện');

const isWaterReading = (reading) => {
    const unit = String(reading?.utilityUnit || '').toLowerCase();
    return unit.includes('m³') || unit.includes('m3') || String(reading?.utilityName || '').toLowerCase().includes('nước');
};

const isInternetReading = (reading) =>
    String(reading?.utilityName || '').toLowerCase().includes('internet')
    || String(reading?.utilityUnit || '').toLowerCase().includes('gói');

const buildBillStatus = (status) => BILL_STATUS_META[status] || {label: status || '—', tone: 'default'};

const SectionCard = ({title, subtitle, action, children, className = ''}) => (
    <section className={cx('card', className)}>
        <div className={cx('cardHeader')}>
            <div>
                <div className={cx('cardTitle')}>{title}</div>
                {subtitle && <div className={cx('cardSub')}>{subtitle}</div>}
            </div>
            {action}
        </div>
        <div className={cx('cardBody')}>
            {children}
        </div>
    </section>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(MOCK_TENANT_SUMMARY);
    const [bills, setBills] = useState(MOCK_TENANT_BILLS);
    const [roomInfo, setRoomInfo] = useState(MOCK_TENANT_ROOM);
    const [incidentReports, setIncidentReports] = useState(MOCK_TENANT_INCIDENTS);
    const [currentReadings, setCurrentReadings] = useState(MOCK_TENANT_UTILITIES.currentPeriod);
    const [historyReadings, setHistoryReadings] = useState(MOCK_TENANT_UTILITIES.history);
    const [noticeItems, setNoticeItems] = useState(MOCK_TENANT_NOTICES);
    const [contractData, setContractData] = useState(MOCK_TENANT_CONTRACT);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        try {
            const [summaryRes, billsRes] = await Promise.all([
                getSummaryInfo().catch(() => null),
                getMyBills().catch(() => null),
            ]);

            if (summaryRes) {
                setSummary(summaryRes);
            }

            const nextBills = billsRes?.result || billsRes?.content || billsRes || [];
            if (Array.isArray(nextBills) && nextBills.length > 0) {
                setBills(nextBills);
            }
        } catch (error) {
            console.error('Error fetching tenant dashboard summary', error);
        } finally {
            setLoading(false);
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
                if (!active || !response?.result) return;
                setRoomInfo(response.result);
            } catch (error) {
                console.error('Failed to load room info for dashboard', error);
            }
        };

        loadRoom();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;

        const loadContract = async () => {
            try {
                const data = await getMyCurrentContract();
                if (!active || !data) return;
                setContractData(data);
            } catch (error) {
                console.error('Failed to load contract for dashboard', error);
            }
        };

        loadContract();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;

        const loadIncidents = async () => {
            try {
                const response = await getMyIncidentReports();
                if (!active || !Array.isArray(response) || response.length === 0) return;
                setIncidentReports(response);
            } catch (error) {
                console.error('Failed to load incident reports for dashboard', error);
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
                    getMyMeterReadingsCurrentPeriod().catch(() => null),
                    getMyMeterReadingsHistory(24).catch(() => null),
                ]);

                if (!active) return;

                if (Array.isArray(current) && current.length > 0) {
                    setCurrentReadings(current);
                }
                if (Array.isArray(history) && history.length > 0) {
                    setHistoryReadings(history);
                }
            } catch (error) {
                console.error('Failed to load utility readings for dashboard', error);
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
                const response = await getMyNotifications(0, 3, {status: 'ALL'});
                if (!active) return;
                const nextItems = response?.content || response?.result?.content || [];
                if (Array.isArray(nextItems) && nextItems.length > 0) {
                    setNoticeItems(nextItems);
                }
            } catch (error) {
                console.error('Failed to load notifications for dashboard', error);
            }
        };

        loadNotices();
        return () => {
            active = false;
        };
    }, []);

    const unpaidCount = Number(summary?.unpaidBillCount ?? bills.filter((bill) =>
        ['UNPAID', 'OVERDUE', 'PARTIALLY_PAID'].includes(bill?.status)
    ).length);

    const outstandingAmount = Number(summary?.outstandingAmount || bills.reduce((sum, bill) => {
        const status = String(bill?.status || '').toUpperCase();
        if (!['UNPAID', 'OVERDUE', 'PARTIALLY_PAID'].includes(status)) return sum;
        return sum + Number(bill?.outstandingAmount ?? bill?.amount ?? 0);
    }, 0));

    const roomLabel = (roomInfo?.roomNumber || summary?.roomNumber)
        ? `Phòng ${roomInfo?.roomNumber || summary?.roomNumber}`
        : 'Phòng của bạn';

    const heroSubtitle = unpaidCount > 0
        ? `Bạn có ${unpaidCount} hóa đơn chưa thanh toán${outstandingAmount > 0 ? ` · Còn nợ ${formatCompactMoney(outstandingAmount)}` : ''}`
        : 'Hợp đồng và chi tiêu đang ổn định';

    const contractStartDate = dayjs(contractData?.startDate);
    const contractEndDate = dayjs(contractData?.endDate);
    const validContract = contractStartDate.isValid() && contractEndDate.isValid();
    const today = dayjs().startOf('day');
    const totalContractDays = validContract ? Math.max(1, contractEndDate.diff(contractStartDate, 'day')) : null;
    const elapsedContractDays = validContract ? Math.min(totalContractDays, Math.max(0, today.diff(contractStartDate, 'day'))) : null;
    const contractProgressPercent = totalContractDays
        ? Math.min(100, Math.max(0, Math.round((elapsedContractDays / totalContractDays) * 100)))
        : 0;
    const daysLeft = validContract ? contractEndDate.diff(today, 'day') : null;

    const contractStatus = useMemo(() => {
        if (!validContract) return {label: 'Chưa có hợp đồng', tone: 'muted'};
        if (contractData?.isLiving === false || (daysLeft != null && daysLeft < 0)) {
            return {label: 'Đã hết hạn', tone: 'danger'};
        }
        if (daysLeft != null && daysLeft <= 30) {
            return {label: 'Sắp hết hạn', tone: 'warning'};
        }
        return {label: 'Đang hiệu lực', tone: 'success'};
    }, [contractData?.isLiving, daysLeft, validContract]);

    const roomHighlights = useMemo(() => {
        const items = [
            roomInfo?.boardingHouseName,
            roomInfo?.buildingName ? `Tòa ${roomInfo.buildingName}` : null,
            roomInfo?.status,
            summary?.paymentStatus,
        ];
        return items.filter(Boolean);
    }, [roomInfo, summary?.paymentStatus]);

    const bannerActions = [
        {label: 'Thanh toán ngay', icon: <CloudUploadOutlined />, onClick: () => navigate('/user/dashboard?tab=bills'), primary: true},
        {label: 'Tạo yêu cầu', icon: <PlusOutlined />, onClick: () => navigate('/user/dashboard?tab=my-room'), primary: false},
    ];

    const statsData = useMemo(() => ([
        {
            label: 'Phòng hiện tại',
            value: roomLabel,
            icon: '🏠',
            accent: 'blue',
        },
        {
            label: 'Tiền thuê tháng này',
            value: formatCompactMoney(summary?.monthlyRent || contractData?.rentPrice || roomInfo?.price),
            icon: '💳',
            accent: 'purple',
        },
        {
            label: 'Thanh toán',
            value: summary?.paymentStatus || 'Đang cập nhật',
            icon: '✅',
            accent: unpaidCount > 0 ? 'red' : 'green',
            sub: unpaidCount > 0 ? `${unpaidCount} hóa đơn cần xử lý` : 'Không có hóa đơn quá hạn',
        },
        {
            label: 'Hết hạn hợp đồng',
            value: formatDate(summary?.contractEndDate || contractData?.endDate),
            icon: '📅',
            accent: 'green',
        },
    ]), [contractData?.endDate, contractData?.rentPrice, roomInfo?.price, roomLabel, summary?.contractEndDate, summary?.monthlyRent, summary?.paymentStatus, unpaidCount]);

    const utilityRows = useMemo(() => {
        const normalize = (value) => Number(value ?? 0);
        const build = (label, matcher, unit, cssKey) => {
            const reading = currentReadings.find(matcher);
            const values = historyReadings.filter(matcher).map((item) => normalize(item?.consumption));
            if (reading) {
                values.push(normalize(reading?.consumption));
            }
            const benchmark = values.length > 0 ? Math.max(...values, 1) : 1;
            const consumption = normalize(reading?.consumption);
            const amount = normalize(reading?.amount);
            return {
                label,
                unit,
                cssKey,
                amount,
                consumption: reading ? `${consumption.toLocaleString('vi-VN')} ${reading?.utilityUnit || ''}` : '—',
                amountLabel: amount ? formatMoney(amount) : '—',
                percent: reading ? Math.min(100, Math.round((consumption / benchmark) * 100)) : 0,
            };
        };

        return [
            build('Điện', isElectricReading, 'kWh', 'electricity'),
            build('Nước', isWaterReading, 'm³', 'water'),
            build('Internet', isInternetReading, 'gói', 'internet'),
        ];
    }, [currentReadings, historyReadings]);

    const utilityCompare = useMemo(() => {
        const total = utilityRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
        return [
            {label: 'Tiền điện', value: utilityRows[0]?.amountLabel || '—'},
            {label: 'Tiền nước', value: utilityRows[1]?.amountLabel || '—'},
            {label: 'Internet', value: utilityRows[2]?.amountLabel || '—'},
            {label: 'Tổng phụ phí', value: total ? formatMoney(total) : '—', highlight: true},
        ];
    }, [utilityRows]);

    const spendingSource = MOCK_MONTHLY_SPENDING;
    const highestSpend = useMemo(() => spendingSource.reduce((best, currentItem) => (
        currentItem.amount > best.amount ? currentItem : best
    ), spendingSource[0]), [spendingSource]);
    const lowestSpend = useMemo(() => spendingSource.reduce((best, currentItem) => (
        currentItem.amount < best.amount ? currentItem : best
    ), spendingSource[0]), [spendingSource]);

    const spendingSeries = useMemo(() => [{
        name: 'Chi tiêu',
        data: spendingSource.map((item) => item.amount),
    }], [spendingSource]);

    const spendingChartOptions = useMemo(() => ({
        chart: {
            type: 'bar',
            toolbar: {show: false},
            foreColor: '#8892a4',
            fontFamily: 'Be Vietnam Pro, sans-serif',
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 700,
            },
        },
        plotOptions: {
            bar: {
                borderRadius: 10,
                columnWidth: '46%',
                distributed: true,
            },
        },
        colors: spendingSource.map((item) => {
            if (item.month === highestSpend.month) return '#34d399';
            if (item.month === lowestSpend.month) return '#fbbf24';
            return '#4f9cf9';
        }),
        dataLabels: {
            enabled: true,
            formatter: (value) => formatCompactMoney(value),
            offsetY: -22,
            style: {
                fontSize: '11px',
                fontWeight: 700,
                colors: ['#e8eaf0'],
            },
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.07)',
            strokeDashArray: 4,
        },
        xaxis: {
            categories: spendingSource.map((item) => item.month),
            labels: {
                style: {
                    colors: '#8892a4',
                    fontSize: '11px',
                },
            },
            axisBorder: {color: 'rgba(255,255,255,0.07)'},
            axisTicks: {color: 'rgba(255,255,255,0.07)'},
        },
        yaxis: {
            labels: {
                formatter: (value) => formatCompactMoney(value),
                style: {colors: '#8892a4'},
            },
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: (value) => formatMoney(value),
            },
        },
        legend: {show: false},
        annotations: {
            points: [
                {
                    x: highestSpend.month,
                    y: highestSpend.amount,
                    marker: {
                        size: 6,
                        fillColor: '#34d399',
                        strokeColor: '#ffffff',
                        strokeWidth: 2,
                    },
                    label: {
                        text: `Cao nhất ${formatMoney(highestSpend.amount)}`,
                        offsetY: -12,
                        style: {
                            background: '#34d399',
                            color: '#0d111a',
                            fontSize: '11px',
                            fontWeight: 700,
                        },
                    },
                },
                {
                    x: lowestSpend.month,
                    y: lowestSpend.amount,
                    marker: {
                        size: 6,
                        fillColor: '#fbbf24',
                        strokeColor: '#ffffff',
                        strokeWidth: 2,
                    },
                    label: {
                        text: `Thấp nhất ${formatMoney(lowestSpend.amount)}`,
                        offsetY: -12,
                        style: {
                            background: '#fbbf24',
                            color: '#0d111a',
                            fontSize: '11px',
                            fontWeight: 700,
                        },
                    },
                },
            ],
        },
    }), [highestSpend.amount, highestSpend.month, lowestSpend.amount, lowestSpend.month, spendingSource]);

    const recentBills = Array.isArray(bills) ? bills.slice(0, 4) : [];
    const incidentList = Array.isArray(incidentReports) ? incidentReports.slice(0, 3) : [];
    const notices = Array.isArray(noticeItems) ? noticeItems.slice(0, 3) : [];

    const handleNavigate = (tab) => navigate(`/user/dashboard?tab=${tab}`);

    return (
        <div className={cx('dashboard')}>
            <section className={cx('hero')}>
                <div className={cx('heroContent')}>
                    <div className={cx('heroRoom')}>{roomLabel}</div>
                    <div className={cx('heroSub')}>{heroSubtitle}</div>
                    <div className={cx('heroActions')}>
                        {bannerActions.map((action) => (
                            <button
                                key={action.label}
                                type="button"
                                className={cx(action.primary ? 'btnPrimary' : 'btnOutline')}
                                onClick={action.onClick}
                            >
                                {action.icon}
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className={cx('heroDecor')}>🏠</div>
            </section>

            <section className={cx('statsGrid')}>
                {statsData.map((stat) => (
                    <div key={stat.label} className={cx('statCard', stat.accent)}>
                        <div className={cx('statIcon')}>{stat.icon}</div>
                        <div className={cx('statValue')}>{stat.value}</div>
                        <div className={cx('statLabel')}>{stat.label}</div>
                        {stat.sub && <div className={cx('statChange', 'up')}>{stat.sub}</div>}
                    </div>
                ))}
            </section>

            <div className={cx('mainGrid')}>
                <SectionCard
                    title="Thông tin phòng"
                    subtitle="Chi tiết phòng đang thuê"
                    action={(
                        <button type="button" className={cx('cardAction')} onClick={() => handleNavigate('contract')}>
                            Xem hợp đồng →
                        </button>
                    )}
                >
                    <div className={cx('roomHero')}>
                        <div className={cx('roomHeroBg')}>🏢</div>
                        <div className={cx('roomHeroInfo')}>
                            <div className={cx('roomNumber')}>{`Phòng ${roomInfo?.roomNumber || summary?.roomNumber || '—'}`}</div>
                            <div className={cx('roomType')}>
                                {roomInfo?.boardingHouseName || MOCK_TENANT_ROOM.boardingHouseName}
                                {' · '}
                                Tòa {roomInfo?.buildingName || MOCK_TENANT_ROOM.buildingName}
                                {' · '}
                                Tầng {roomInfo?.floor ?? MOCK_TENANT_ROOM.floor}
                            </div>
                        </div>
                    </div>

                    <div className={cx('roomDetails')}>
                        <div className={cx('roomDetailItem')}>
                            <div className={cx('roomDetailLabel')}>Diện tích</div>
                            <div className={cx('roomDetailValue')}>{roomInfo?.area ? `${roomInfo.area} m²` : '—'}</div>
                        </div>
                        <div className={cx('roomDetailItem')}>
                            <div className={cx('roomDetailLabel')}>Giá thuê</div>
                            <div className={cx('roomDetailValue')}>{formatMoney(roomInfo?.price || contractData?.rentPrice)}</div>
                        </div>
                        <div className={cx('roomDetailItem')}>
                            <div className={cx('roomDetailLabel')}>Tòa nhà</div>
                            <div className={cx('roomDetailValue')}>{roomInfo?.buildingName || '—'}</div>
                        </div>
                        <div className={cx('roomDetailItem')}>
                            <div className={cx('roomDetailLabel')}>Trạng thái</div>
                            <div className={cx('roomDetailValue')}>
                                <Tag color="blue">{roomInfo?.status || 'Đang cập nhật'}</Tag>
                            </div>
                        </div>
                    </div>

                    <div className={cx('amenitiesLabel')}>Tóm tắt nhanh</div>
                    <div className={cx('amenities')}>
                        {roomHighlights.length > 0 ? roomHighlights.map((tag) => (
                            <span key={tag} className={cx('amenityTag')}>{tag}</span>
                        )) : (
                            <span className={cx('amenityTag')}>Đang cập nhật</span>
                        )}
                    </div>
                </SectionCard>

                <div className={cx('rightCol')}>
                    <SectionCard
                        title="Hợp đồng"
                        subtitle="Trạng thái hợp đồng thuê"
                    >
                        <div className={cx('contractBox')}>
                            <div className={cx('contractStatusRow')}>
                                <div className={cx('contractLive', contractStatus.tone)}>
                                    <span className={cx('liveDot', contractStatus.tone)} />
                                    {contractStatus.label}
                                </div>
                                {contractData?.contractCode && (
                                    <div className={cx('contractCode')}>Mã: {contractData.contractCode}</div>
                                )}
                            </div>

                            <div className={cx('contractDates')}>
                                <div className={cx('contractDateItem')}>
                                    <div className={cx('contractDateLabel')}>Ngày bắt đầu</div>
                                    <div className={cx('contractDateValue')}>{formatDate(contractData?.startDate)}</div>
                                </div>
                                <span className={cx('contractArrow')}>→</span>
                                <div className={cx('contractDateItem')}>
                                    <div className={cx('contractDateLabel')}>Ngày kết thúc</div>
                                    <div className={cx('contractDateValue')}>{formatDate(contractData?.endDate)}</div>
                                </div>
                            </div>

                            <div className={cx('contractDivider')} />

                            <div className={cx('progressLabel')}>
                                <span>Tiến độ hợp đồng</span>
                                <span>
                                    {validContract
                                        ? `${contractProgressPercent}% · còn ${Math.max(0, daysLeft ?? 0)} ngày`
                                        : 'Chưa có dữ liệu'}
                                </span>
                            </div>
                            <div className={cx('progressBarWrap')}>
                                <div
                                    className={cx('progressBar')}
                                    style={{'--progress': `${contractProgressPercent}%`}}
                                />
                            </div>
                        </div>

                        <button type="button" className={cx('btnOutline', 'btnFull')} onClick={() => handleNavigate('contract')}>
                            📄 Xem hợp đồng PDF
                        </button>
                    </SectionCard>

                    <SectionCard
                        title="Thao tác nhanh"
                        subtitle="Điểm truy cập thường dùng"
                    >
                        <div className={cx('quickGrid')}>
                            {[
                                {icon: '💳', label: 'Thanh toán', sub: 'Tiền thuê & phí', tab: 'bills'},
                                {icon: '🔧', label: 'Sửa chữa', sub: 'Gửi yêu cầu', tab: 'my-room'},
                                {icon: '💬', label: 'Liên hệ', sub: 'Ban quản lý', tab: 'notifications'},
                                {icon: '📷', label: 'Báo cáo', sub: 'Sự cố phòng', tab: 'my-room'},
                                {icon: '🔑', label: 'Gia hạn', sub: 'Hợp đồng', tab: 'contract'},
                                {icon: '🚗', label: 'Đăng ký', sub: 'Bãi đỗ xe', tab: 'profile'},
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    type="button"
                                    className={cx('quickBtn')}
                                    onClick={() => handleNavigate(item.tab)}
                                >
                                    <div className={cx('quickBtnIcon')}>{item.icon}</div>
                                    <div className={cx('quickBtnText')}>{item.label}</div>
                                    <div className={cx('quickBtnSub')}>{item.sub}</div>
                                </button>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            </div>

            <div className={cx('bottomGrid')}>
                <SectionCard
                    title="Hóa đơn gần đây"
                    subtitle="Theo dõi tình trạng thanh toán"
                    action={(
                        <button type="button" className={cx('cardAction')} onClick={() => handleNavigate('bills')}>
                            Xem tất cả →
                        </button>
                    )}
                >
                    <div className={cx('billList')}>
                        {recentBills.length > 0 ? recentBills.map((bill) => {
                            const statusMeta = buildBillStatus(bill.status);
                            return (
                                <div key={bill.id || bill.billCode} className={cx('billItem')}>
                                    <div className={cx('billLeft')}>
                                        <div className={cx('billIcon', statusMeta.tone)}>
                                            {statusMeta.tone === 'success' ? '✅' : statusMeta.tone === 'danger' ? '⚠️' : '💳'}
                                        </div>
                                        <div>
                                            <div className={cx('billName')}>{bill.billTitle || bill.billCode || 'Hóa đơn'}</div>
                                            <div className={cx('billDate')}>Hạn thanh toán: {formatDate(bill.dueDate)}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className={cx('billAmount')}>{formatMoney(bill.outstandingAmount ?? bill.amount)}</div>
                                        <div className={cx('statusBadge', statusMeta.tone)}>{statusMeta.label}</div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className={cx('emptyState')}>
                                <div className={cx('emptyIcon')}>🧾</div>
                                <div className={cx('emptyText')}>Chưa có hóa đơn nào được phát hành</div>
                                <div className={cx('emptySubtext')}>Hệ thống sẽ hiển thị khi chủ trọ tạo hóa đơn</div>
                            </div>
                        )}
                    </div>
                </SectionCard>

                <SectionCard
                    title="Chi tiêu 6 tháng gần đây"
                    subtitle="Theo dõi chi phí sinh hoạt của tenant"
                >
                    <div className={cx('chartMeta')}>
                        <div className={cx('chartStat')}>
                            <div className={cx('chartStatLabel')}>Tháng cao nhất</div>
                            <div className={cx('chartStatValue')}>{highestSpend.month}</div>
                            <div className={cx('chartStatMoney')}>{formatMoney(highestSpend.amount)}</div>
                        </div>
                        <div className={cx('chartStat')}>
                            <div className={cx('chartStatLabel')}>Tháng thấp nhất</div>
                            <div className={cx('chartStatValue')}>{lowestSpend.month}</div>
                            <div className={cx('chartStatMoney')}>{formatMoney(lowestSpend.amount)}</div>
                        </div>
                    </div>
                    <div className={cx('chartWrap')}>
                        <ReactApexChart
                            options={spendingChartOptions}
                            series={spendingSeries}
                            type="bar"
                            height={280}
                        />
                    </div>
                    <div className={cx('chartLegend')}>
                        Dữ liệu đang hiển thị từ mock fallback. Khi API sẵn sàng, chart sẽ tự đồng bộ theo dữ liệu thật.
                    </div>
                </SectionCard>

                <SectionCard
                    title="Tiêu thụ điện nước"
                    subtitle="Tóm tắt mức dùng và phụ phí hiện tại"
                    action={(
                        <button type="button" className={cx('cardAction')} onClick={() => handleNavigate('utilities')}>
                            Chi tiết →
                        </button>
                    )}
                >
                    <div className={cx('utilityList')}>
                        {utilityRows.map((entry) => (
                            <div key={entry.label} className={cx('utilityRow')}>
                                <span className={cx('utilityIcon')}>{entry.label === 'Điện' ? '⚡' : entry.label === 'Nước' ? '💧' : '🌐'}</span>
                                <span className={cx('utilityLabel')}>{entry.label}</span>
                                <div className={cx('utilityBarWrap')}>
                                    <div
                                        className={cx('utilityBar', entry.cssKey)}
                                        style={{'--utility-pct': `${entry.percent}%`}}
                                    />
                                </div>
                                <span className={cx('utilityValue')}>{entry.consumption}</span>
                            </div>
                        ))}
                    </div>

                    <div className={cx('utilityCompare')}>
                        {utilityCompare.map((item) => (
                            <div
                                key={item.label}
                                className={cx('utilityCompareItem', {highlight: item.highlight})}
                            >
                                <div className={cx('utilityCompareLabel')}>{item.label}</div>
                                <div className={cx('utilityCompareValue')}>{item.value}</div>
                            </div>
                        ))}
                    </div>
                </SectionCard>

                <SectionCard
                    title="Yêu cầu bảo trì"
                    subtitle="Trạng thái xử lý"
                    action={(
                        <button type="button" className={cx('cardAction')} onClick={() => handleNavigate('my-room')}>
                            Tạo mới +
                        </button>
                    )}
                >
                    <div className={cx('requestList')}>
                        {incidentList.length > 0 ? incidentList.map((incident) => {
                            const meta = INCIDENT_STATUS_META[incident.status] || INCIDENT_STATUS_META.PENDING;
                            return (
                                <div key={incident.id} className={cx('requestItem')}>
                                    <div className={cx('requestIcon', meta.tone)}>{meta.icon}</div>
                                    <div className={cx('requestContent')}>
                                        <div className={cx('requestTitle')}>{incident.title}</div>
                                        <div className={cx('requestDesc')}>{incident.description || 'Không có mô tả chi tiết'}</div>
                                        <div className={cx('requestMeta')}>
                                            <span className={cx('statusPill', meta.tone)}>{meta.label}</span>
                                            <span className={cx('requestDate')}>{formatDate(incident.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className={cx('emptyState')}>
                                <div className={cx('emptyIcon')}>🎉</div>
                                <div className={cx('emptyText')}>Chưa có yêu cầu bảo trì nào</div>
                                <div className={cx('emptySubtext')}>Nhấn "Tạo mới +" để gửi yêu cầu đầu tiên</div>
                            </div>
                        )}
                    </div>
                </SectionCard>

                <SectionCard
                    title="Thông báo tòa nhà"
                    subtitle="Cập nhật mới nhất"
                    action={(
                        <button type="button" className={cx('cardAction')} onClick={() => handleNavigate('notifications')}>
                            Tất cả →
                        </button>
                    )}
                >
                    <div className={cx('noticeList')}>
                        {notices.length > 0 ? notices.map((notice) => (
                            <div key={`${notice.id}-${notice.createdAt}`} className={cx('noticeItem')}>
                                <div className={cx('noticeBadge')}>{notice.category || 'Thông báo'}</div>
                                <div className={cx('noticeTitle')}>{notice.title}</div>
                                <div className={cx('noticeDesc')}>{notice.message || 'Không có nội dung'}</div>
                                <div className={cx('noticeTime')}>{formatDate(notice.createdAt)}</div>
                            </div>
                        )) : (
                            <div className={cx('emptyState')}>
                                <div className={cx('emptyIcon')}>🔔</div>
                                <div className={cx('emptyText')}>Chưa có thông báo mới</div>
                                <div className={cx('emptySubtext')}>Hệ thống sẽ hiển thị khi có cập nhật</div>
                            </div>
                        )}
                    </div>
                </SectionCard>
            </div>

            <section className={cx('serviceStrip')}>
                {[
                    {icon: '⚡', label: 'Điện / Nước', tab: 'utilities'},
                    {icon: '📄', label: 'Hóa đơn', tab: 'bills'},
                    {icon: '👤', label: 'Hồ sơ', tab: 'profile'},
                    {icon: '📞', label: 'Liên hệ', tab: 'notifications'},
                ].map((item) => (
                    <button
                        key={item.label}
                        type="button"
                        className={cx('serviceBtn')}
                        onClick={() => handleNavigate(item.tab)}
                    >
                        <div className={cx('serviceIcon')}>{item.icon}</div>
                        <div className={cx('serviceLabel')}>{item.label}</div>
                    </button>
                ))}
            </section>

            {loading && (
                <div className={cx('loadingOverlay')}>
                    <Spin size="large" />
                </div>
            )}
        </div>
    );
};

export default Dashboard;
