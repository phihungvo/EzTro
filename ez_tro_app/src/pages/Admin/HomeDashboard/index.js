import React, {useState, useEffect} from 'react';
import {
    Row, Col, Card, Tag, DatePicker,
    Space, Typography, Avatar, Button, Divider,
} from 'antd';
import {
    ArrowUpOutlined, UserOutlined, DollarOutlined, HomeOutlined,
    FireOutlined, TeamOutlined, RiseOutlined, TrophyOutlined,
    StarOutlined, HeartOutlined, ShoppingOutlined, CaretUpOutlined, CaretDownOutlined,
} from '@ant-design/icons';
import ReactApexChart from 'react-apexcharts';
import styles from './HomeDashboard.module.scss';
import {color} from "three/tsl";

const {RangePicker} = DatePicker;
const {Title, Text, Paragraph} = Typography;

function AdminDashboard() {
    const [timeRange, setTimeRange] = useState('7days');
    const [dateRange, setDateRange] = useState(null);
    const [animatedValues, setAnimatedValues] = useState({});

    // Animated counter effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedValues({
                revenue: 1250000000,
                users: 15847,
                properties: 3421,
                transactions: 8956
            });
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Real-time data simulation
    const [realTimeData, setRealTimeData] = useState({
        activeNow: 342,
        transactionsToday: 1247,
        revenueToday: 48500000
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setRealTimeData(prev => ({
                activeNow: prev.activeNow + Math.floor(Math.random() * 10 - 5),
                transactionsToday: prev.transactionsToday + Math.floor(Math.random() * 5),
                revenueToday: prev.revenueToday + Math.floor(Math.random() * 500000)
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Enhanced traffic chart
    const trafficChartOptions = {
        chart: {
            type: 'area',
            height: 380,
            toolbar: {show: false},
            background: 'transparent',
            fontFamily: "'SF Pro Display', 'Inter', sans-serif",
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
            }
        },
        dataLabels: {enabled: false},
        stroke: {curve: 'smooth', width: 3},
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.6,
                opacityTo: 0.05,
                stops: [0, 100]
            }
        },
        xaxis: {
            categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            labels: {
                style: {colors: '#94a3b8', fontSize: '12px', fontWeight: 500}
            },
            axisBorder: {show: false},
            axisTicks: {show: false},
        },
        yaxis: {
            labels: {
                style: {colors: '#94a3b8', fontSize: '12px'},
                formatter: (val) => (val / 1000).toFixed(0) + 'K'
            }
        },
        colors: ['#6366f1', '#ec4899', '#10b981'],
        legend: {
            position: 'top',
            horizontalAlign: 'left',
            fontSize: '13px',
            fontWeight: 600,
            markers: {radius: 12, width: 12, height: 12},
            itemMargin: {horizontal: 16},
            labels: {colors: '#475569'}
        },
        grid: {
            borderColor: '#f1f5f9',
            strokeDashArray: 4,
            xaxis: {lines: {show: false}},
            yaxis: {lines: {show: true}},
            padding: {top: 0, right: 20, bottom: 0, left: 10}
        },
        tooltip: {
            theme: 'light',
            style: {fontSize: '13px'},
            y: {
                formatter: (val) => val.toLocaleString() + ' visits'
            }
        }
    };

    const trafficChartSeries = [
        {name: 'Tổng lượt truy cập', data: [4200, 5300, 4800, 6400, 7100, 8200, 7600]},
        {name: 'Người dùng duy nhất', data: [1800, 2200, 2000, 2600, 2900, 3400, 3100]},
        {name: 'Chuyển đổi', data: [450, 580, 520, 680, 750, 890, 820]},
    ];

    // Revenue funnel chart
    const revenueFunnelOptions = {
        chart: {type: 'bar', height: 320, toolbar: {show: false}},
        plotOptions: {
            bar: {
                borderRadius: 10,
                horizontal: true,
                barHeight: '70%',
                distributed: true,
            }
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => (val / 1000000).toFixed(1) + 'M',
            style: {fontSize: '14px', fontWeight: 700, colors: ['#fff']}
        },
        xaxis: {
            categories: [
                'Gói đăng ký',
                'Doanh thu một lần',
                'Tính năng cao cấp',
                'Dịch vụ tư vấn',
                'Hợp tác / Đối tác'
            ],
            labels: {
                style: {colors: '#94a3b8', fontSize: '12px'},
                formatter: (val) => (val / 1000000).toFixed(0) + 'M'
            }
        },
        yaxis: {
            labels: {style: {colors: '#475569', fontSize: '13px', fontWeight: 500}}
        },
        colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
        grid: {
            borderColor: '#f1f5f9',
            xaxis: {lines: {show: true}},
            yaxis: {lines: {show: false}},
        },
        legend: {show: false},
    };

    const revenueFunnelSeries = [{data: [42500000, 28300000, 18700000, 12400000, 8600000]}];

    // Customer satisfaction donut
    const satisfactionOptions = {
        chart: {type: 'donut', height: 320},
        labels: ['Excellent (5★)', 'Good (4★)', 'Average (3★)', 'Poor (2★)', 'Bad (1★)'],
        colors: ['#10b981', '#6366f1', '#f59e0b', '#f97316', '#ef4444'],
        legend: {
            position: 'bottom',
            fontSize: '13px',
            fontWeight: 600,
            markers: {radius: 12}
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '75%',
                    labels: {
                        show: true,
                        name: {fontSize: '14px', fontWeight: 600, color: '#475569'},
                        value: {
                            fontSize: '32px',
                            fontWeight: 800,
                            color: '#1e293b',
                            formatter: (val) => parseFloat(val).toFixed(0) + '%'
                        },
                        total: {
                            show: true,
                            label: 'Avg Rating',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'white',
                            formatter: () => '4.6★'
                        }
                    }
                }
            }
        },
        dataLabels: {enabled: false},
        stroke: {width: 2, colors: ['#fff']},
    };

    const satisfactionSeries = [68, 22, 7, 2, 1];

    // User activity heatmap data
    const activityHeatmapOptions = {
        chart: {type: 'heatmap', height: 280, toolbar: {show: false}},
        plotOptions: {
            heatmap: {
                shadeIntensity: 0.5,
                radius: 8,
                colorScale: {
                    ranges: [
                        {from: 0, to: 500, color: '#e0e7ff', name: 'Low'},
                        {from: 501, to: 1000, color: '#a5b4fc', name: 'Medium'},
                        {from: 1001, to: 1500, color: '#6366f1', name: 'High'},
                        {from: 1501, to: 2000, color: '#4338ca', name: 'Very High'},
                    ]
                }
            }
        },
        dataLabels: {enabled: false},
        xaxis: {
            categories: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
            labels: {style: {colors: '#94a3b8', fontSize: '11px'}}
        },
        yaxis: {
            labels: {style: {colors: '#475569', fontSize: '12px', fontWeight: 500}}
        },
        grid: {padding: {right: 20}},
        tooltip: {
            y: {formatter: (val) => val + ' users'}
        }
    };

    const activityHeatmapSeries = [
        {name: 'Monday', data: [420, 280, 650, 1450, 1820, 890]},
        {name: 'Tuesday', data: [380, 310, 720, 1520, 1750, 920]},
        {name: 'Wednesday', data: [450, 290, 680, 1480, 1890, 850]},
        {name: 'Thursday', data: [410, 320, 710, 1560, 1920, 910]},
        {name: 'Friday', data: [480, 340, 750, 1620, 1980, 1150]},
    ];

    // Growth comparison
    const growthComparisonOptions = {
        chart: {type: 'line', height: 300, toolbar: {show: false}},
        stroke: {curve: 'smooth', width: [3, 3, 3], dashArray: [0, 0, 5]},
        markers: {size: [6, 6, 0], strokeWidth: 2, strokeColors: '#fff', hover: {size: 8}},
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            labels: {style: {colors: '#94a3b8', fontSize: '12px'}}
        },
        yaxis: {
            labels: {
                style: {colors: '#94a3b8', fontSize: '12px'},
                formatter: (val) => val + '%'
            }
        },
        colors: ['#10b981', '#6366f1', '#94a3b8'],
        legend: {
            position: 'top',
            horizontalAlign: 'left',
            fontSize: '13px',
            fontWeight: 600,
            markers: {radius: 12}
        },
        grid: {borderColor: '#f1f5f9', strokeDashArray: 4},
    };

    const growthComparisonSeries = [
        {name: 'User Growth', data: [12, 18, 25, 32, 38, 45, 52]},
        {name: 'Revenue Growth', data: [8, 15, 22, 28, 35, 42, 48]},
        {name: 'Target', data: [15, 20, 25, 30, 35, 40, 45]},
    ];

    // Top performing regions
    const regionData = [
        {region: 'Ho Chi Minh', users: 4521, revenue: 342000000, growth: 24.5, flag: '🏙️'},
        {region: 'Hanoi', users: 3842, revenue: 298000000, growth: 19.8, flag: '🏛️'},
        {region: 'Da Nang', users: 2156, revenue: 165000000, growth: 32.1, flag: '🌊'},
        {region: 'Can Tho', users: 1487, revenue: 112000000, growth: 28.4, flag: '🌾'},
        {region: 'Hai Phong', users: 1234, revenue: 94000000, growth: 15.7, flag: '⚓'},
    ];

    // Top landlords with more details
    const topLandlordsData = [
        {
            rank: 1,
            name: 'Nguyễn Văn Minh',
            properties: 38,
            revenue: 245000000,
            rating: 4.9,
            tenants: 142,
            growth: 28.5,
            badge: '👑'
        },
        {
            rank: 2,
            name: 'Trần Thị Hương',
            properties: 32,
            revenue: 198000000,
            rating: 4.8,
            tenants: 118,
            growth: 24.2,
            badge: '⭐'
        },
        {
            rank: 3,
            name: 'Lê Quang Đạt',
            properties: 28,
            revenue: 167000000,
            rating: 4.7,
            tenants: 96,
            growth: 31.8,
            badge: '🌟'
        },
        {
            rank: 4,
            name: 'Phạm Minh Thu',
            properties: 24,
            revenue: 142000000,
            rating: 4.6,
            tenants: 84,
            growth: 19.4,
            badge: '💎'
        },
        {
            rank: 5,
            name: 'Hoàng Tuấn Anh',
            properties: 21,
            revenue: 128000000,
            rating: 4.5,
            tenants: 72,
            growth: 22.1,
            badge: '🔥'
        },
    ];

    // Feature usage with trends
    const featureUsageData = [
        {feature: 'Tạo hóa đơn tự động', usage: 2847, trend: 18.4, users: 1425, icon: '📄'},
        {feature: 'Ghi điện nước thông minh', usage: 2634, trend: 15.2, users: 1318, icon: '⚡'},
        {feature: 'Quản lý phòng trực tuyến', usage: 2156, trend: 22.8, users: 1089, icon: '🏠'},
        {feature: 'Xuất báo cáo chi tiết', usage: 1892, trend: 12.6, users: 945, icon: '📊'},
        {feature: 'Hợp đồng điện tử', usage: 1647, trend: 28.3, users: 824, icon: '📝'},
        {feature: 'Thanh toán trực tuyến', usage: 1523, trend: 31.5, users: 762, icon: '💳'},
    ];

    return (
        <div className={styles.dashboardWrapper}>
            <div className={styles.dashboardContainer}>
                {/* Premium Header */}
                {/*<div className={styles.premiumHeader}>*/}
                {/*    <div className={styles.headerContent}>*/}
                {/*        <div className={styles.headerLeft}>*/}
                {/*            <div className={styles.welcomeSection}>*/}
                {/*                <Title level={1} className={styles.mainTitle}>*/}
                {/*                    Comprehensive insights and real-time business intelligence*/}
                {/*                    /!*<span className={styles.titleBadge}>PRO</span>*!/*/}
                {/*                </Title>*/}
                {/*                /!*<Paragraph className={styles.subtitle}>*!/*/}
                {/*                /!*    Comprehensive insights and real-time business intelligence*!/*/}
                {/*                /!*</Paragraph>*!/*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*        <div className={styles.headerRight}>*/}
                {/*            <Space size="middle" wrap>*/}
                {/*                <Select*/}
                {/*                    defaultValue="7days"*/}
                {/*                    className={styles.premiumSelect}*/}
                {/*                    onChange={setTimeRange}*/}
                {/*                    options={[*/}
                {/*                        {value: 'today', label: '📅 Today'},*/}
                {/*                        {value: '7days', label: '📊 Last 7 Days'},*/}
                {/*                        {value: '30days', label: '📈 Last 30 Days'},*/}
                {/*                        {value: 'custom', label: '🎯 Custom Range'},*/}
                {/*                    ]}*/}
                {/*                />*/}
                {/*                <Button type="primary" icon={<DownloadOutlined/>} className={styles.actionButton}>*/}
                {/*                    Export Report*/}
                {/*                </Button>*/}
                {/*                <Tooltip title="Refresh Data">*/}
                {/*                    <Button icon={<ReloadOutlined/>} className={styles.iconButton}/>*/}
                {/*                </Tooltip>*/}
                {/*            </Space>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/* Real-time Alert Bar */}
                {/*<div className={styles.alertBar}>*/}
                {/*    <div className={styles.alertItem}>*/}
                {/*        <Badge status="success" className={styles.pulseBadge}/>*/}
                {/*        <Text strong>{realTimeData.activeNow}</Text>*/}
                {/*        <Text type="secondary">Người dùng đang online</Text>*/}
                {/*    </div>*/}
                {/*    <Divider type="vertical" style={{height: 32}}/>*/}
                {/*    <div className={styles.alertItem}>*/}
                {/*        <CheckCircleOutlined style={{color: '#10b981', fontSize: 18}}/>*/}
                {/*        <Text strong>{realTimeData.transactionsToday}</Text>*/}
                {/*        <Text type="secondary">Giao dịch hôm nay</Text>*/}
                {/*    </div>*/}
                {/*    <Divider type="vertical" style={{height: 32}}/>*/}
                {/*    <div className={styles.alertItem}>*/}
                {/*        <DollarOutlined style={{color: '#6366f1', fontSize: 18}}/>*/}
                {/*        <Text strong>{(realTimeData.revenueToday / 1000000).toFixed(1)}M</Text>*/}
                {/*        <Text type="secondary">Doanh thu hôm nay</Text>*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/* Key Metrics Section */}
                <div className={styles.section}>
                    {/*<div className={styles.sectionHeader}>*/}
                    {/*    <Title level={3} className={styles.sectionTitle}>*/}
                    {/*        <LineChartOutlined/> Chỉ số Hiệu suất Chính*/}
                    {/*    </Title>*/}
                    {/*    <Tag color="success" className={styles.statusTag}>Tất cả hệ thống đang hoạt động bình*/}
                    {/*        thường.</Tag>*/}
                    {/*</div>*/}

                    <Row gutter={[24, 24]}>
                        {[
                            {
                                title: 'Tổng doanh thu',
                                value: 1250000000,
                                suffix: 'VNĐ',
                                change: 28.4,
                                trend: 'up',
                                icon: <DollarOutlined/>,
                                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                target: 85,
                                description: '+385M vs tháng trước'
                            },
                            {
                                title: 'Người dùng đang hoạt động',
                                value: 15847,
                                suffix: '',
                                change: 18.2,
                                trend: 'up',
                                icon: <TeamOutlined/>,
                                gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                target: 92,
                                description: '+2,435 mới trong tháng này'
                            },
                            {
                                title: 'Tổng số phòng đang quản lý',
                                value: 3421,
                                suffix: '',
                                change: 12.8,
                                trend: 'up',
                                icon: <HomeOutlined/>,
                                gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                target: 78,
                                description: '+389 phòng mới trong tháng này'
                            },
                            {
                                title: 'Tổng số giao dịch',
                                value: 8956,
                                suffix: '',
                                change: 24.6,
                                trend: 'up',
                                icon: <ShoppingOutlined/>,
                                gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                target: 88,
                                description: '+1,756 tháng này'
                            },
                        ].map((metric, idx) => (
                            <Col xs={24} sm={12} xl={6} key={idx}>
                                <Card className={styles.kpiCard} bordered={false}>
                                    <div className={styles.kpiHeader}>
                                        <div className={styles.kpiIconWrapper} style={{background: metric.gradient}}>
                                            {metric.icon}
                                        </div>
                                        <Tag className={`${styles.trendTag} ${styles[metric.trend]}`}>
                                            {metric.trend === 'up' ? <CaretUpOutlined/> : <CaretDownOutlined/>}
                                            {metric.change}%
                                        </Tag>
                                    </div>
                                    <div className={styles.kpiContent}>
                                        <Text className={styles.kpiTitle}>{metric.title}</Text>
                                        <Title level={2} className={styles.kpiValue}>
                                            {metric.suffix === 'VNĐ'
                                                ? (metric.value / 1000000000).toFixed(2) + 'B'
                                                : metric.value.toLocaleString()}
                                        </Title>
                                        <Text type="secondary" className={styles.kpiDescription}>
                                            {metric.description}
                                        </Text>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>

                {/* Traffic & Engagement */}
                <div className={styles.section}>
                    {/*<div className={styles.sectionHeader}>*/}
                    {/*    <Title level={3} className={styles.sectionTitle}>*/}
                    {/*        <GlobalOutlined/> Lưu lượng truy cập & mức độ tương tác của người dùng*/}
                    {/*    </Title>*/}
                    {/*</div>*/}

                    <Row gutter={[24, 24]}>
                        <Col xs={24} xl={16}>
                            <Card className={styles.chartCard} bordered={false}>
                                <div className={styles.chartHeader}>
                                    <div>
                                        <Title level={4} className={styles.chartTitle}>Tổng quan Lưu lượng</Title>
                                        <Text type="secondary" style={{color: 'white'}}>Theo dõi hiệu suất đa kênh</Text>
                                    </div>
                                    <Space>
                                        <Button size="small" type="text">Day</Button>
                                        <Button size="small" type="primary">Week</Button>
                                        <Button size="small" type="text">Month</Button>
                                    </Space>
                                </div>
                                <ReactApexChart options={trafficChartOptions} series={trafficChartSeries} type="area"
                                                height={380}/>
                            </Card>
                        </Col>
                        <Col xs={24} xl={8}>
                            <Card className={styles.chartCard} bordered={false} style={{height: '100%'}}>
                                <Title level={4} className={styles.chartTitle}>Mức độ Hài lòng Khách hàng</Title>
                                <Text type="secondary">Dựa trên 2.847 lượt đánh giá</Text>
                                <ReactApexChart options={satisfactionOptions} series={satisfactionSeries} type="donut"
                                                height={320}/>
                                <div className={styles.satisfactionFooter}>
                                    <div className={styles.satisfactionItem}>
                                        <StarOutlined style={{color: '#fadb14', fontSize: 20}}/>
                                        <div>
                                            <Text strong style={{fontSize: 24, color: '#fff'}}>4.6</Text>
                                            <Text type="secondary" style={{display: 'block', fontSize: 12}}>Avg
                                                Rating</Text>
                                        </div>
                                    </div>
                                    <Divider type="vertical" style={{height: 40}}/>
                                    <div className={styles.satisfactionItem}>
                                        <HeartOutlined style={{color: '#ef4444', fontSize: 20}}/>
                                        <div>
                                            <Text strong style={{fontSize: 24, color: '#fff'}}>94%</Text>
                                            <Text type="secondary" style={{display: 'block', fontSize: 12, color: 'white'}}>Would
                                                Recommend</Text>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={[24, 24]} style={{marginTop: 24}}>
                        <Col xs={24} lg={12}>
                            <Card className={styles.chartCard} bordered={false}>
                                <Title level={4} className={styles.chartTitle}>Bản đồ nhiệt Hoạt động Người dùng</Title>
                                <Text type="secondary">Khung giờ cao điểm theo từng ngày trong tuần</Text>
                                <ReactApexChart options={activityHeatmapOptions} series={activityHeatmapSeries}
                                                type="heatmap" height={280}/>
                            </Card>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Card className={styles.chartCard} bordered={false}>
                                <Title level={4} className={styles.chartTitle}>So sánh Tăng trưởng</Title>
                                <Text type="secondary">Hiệu suất so với cùng kỳ năm trước</Text>
                                <ReactApexChart options={growthComparisonOptions} series={growthComparisonSeries}
                                                type="line" height={280}/>
                            </Card>
                        </Col>
                    </Row>
                </div>

                {/* Revenue Analytics */}
                <div className={styles.section}>
                    {/*<div className={styles.sectionHeader}>*/}
                    {/*    <Title level={3} className={styles.sectionTitle}>*/}
                    {/*        <BarChartOutlined/> Phân tích Doanh thu*/}
                    {/*    </Title>*/}
                    {/*</div>*/}

                    <Row gutter={[24, 24]}>
                        <Col xs={24} lg={14}>
                            <Card className={styles.chartCard} bordered={false}>
                                <Title level={4} className={styles.chartTitle}>Doanh thu theo Nguồn</Title>
                                <Text type="secondary">Phân tích chi tiết các nguồn doanh thu</Text>
                                <ReactApexChart options={revenueFunnelOptions} series={revenueFunnelSeries} type="bar"
                                                height={320}/>
                            </Card>
                        </Col>
                        <Col xs={24} lg={10}>
                            <Card className={styles.insightCard} bordered={false}>
                                <div className={styles.insightHeader}>
                                    <TrophyOutlined className={styles.insightIcon}/>
                                    <Title level={4}>Thông tin Doanh thu</Title>
                                </div>
                                <div className={styles.insightList}>
                                    <div className={styles.insightItem}>
                                        <div className={styles.insightBadge} style={{background: '#10b981'}}>
                                            <ArrowUpOutlined/>
                                        </div>
                                        <div className={styles.insightContent}>
                                            <Text strong>Doanh thu từ gói đăng ký tăng 32%</Text>
                                            <Text type="secondary">Các gói cao cấp đang thúc đẩy tăng trưởng</Text>
                                        </div>
                                        <Text className={styles.insightValue}>+42.5M</Text>
                                    </div>
                                    <div className={styles.insightItem}>
                                        <div className={styles.insightBadge} style={{background: '#6366f1'}}>
                                            <FireOutlined/>
                                        </div>
                                        <div className={styles.insightContent}>
                                            <Text strong>Giai đoạn doanh thu cao nhất</Text>
                                            <Text type="secondary">Tháng có hiệu suất tốt nhất trong quý 4 năm
                                                2025</Text>
                                        </div>
                                        <Text className={styles.insightValue}>Dec</Text>
                                    </div>
                                    <div className={styles.insightItem}>
                                        <div className={styles.insightBadge} style={{background: '#ec4899'}}>
                                            <RiseOutlined/>
                                        </div>
                                        <div className={styles.insightContent}>
                                            <Text strong>Doanh thu trên mỗi người dùng</Text>
                                            <Text type="secondary">ARPU trung bình tăng</Text>
                                        </div>
                                        <Text className={styles.insightValue}>485K</Text>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>

                {/* Top Landlords */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <Title level={3} className={styles.sectionTitle}>
                            <TrophyOutlined/> Chủ nhà Có hiệu suất Tốt nhất
                        </Title>
                    </div>

                    <Card className={styles.leaderboardCard} bordered={false}>
                        <div className={styles.leaderboardList}>
                            {topLandlordsData.map((landlord) => (
                                <div key={landlord.rank} className={styles.leaderboardItem}>
                                    <div className={styles.leaderboardRank}>
                                        <div
                                            className={`${styles.rankBadge} ${landlord.rank <= 3 ? styles.topThree : ''}`}>
                                            {landlord.rank <= 3 ? landlord.badge : `#${landlord.rank}`}
                                        </div>
                                    </div>
                                    <Avatar size={56} className={styles.leaderboardAvatar}>
                                        {landlord.name.charAt(0)}
                                    </Avatar>
                                    <div className={styles.leaderboardInfo}>
                                        <div className={styles.leaderboardName}>
                                            <Text strong style={{fontSize: 16}}>{landlord.name}</Text>
                                            <div className={styles.leaderboardRating}>
                                                <StarOutlined style={{color: '#fadb14', fontSize: 14}}/>
                                                <Text strong>{landlord.rating}</Text>
                                            </div>
                                        </div>
                                        <Space size="large" className={styles.leaderboardMeta}>
                                            <Text type="secondary">
                                                <HomeOutlined/> {landlord.properties} properties
                                            </Text>
                                            <Text type="secondary">
                                                <UserOutlined/> {landlord.tenants} tenants
                                            </Text>
                                        </Space>
                                    </div>
                                    <div className={styles.leaderboardMetrics}>
                                        <div className={styles.metricItem}>
                                            <Text type="secondary">Revenue</Text>
                                            <Text strong style={{fontSize: 18, color: '#10b981'}}>
                                                {(landlord.revenue / 1000000).toFixed(1)}M
                                            </Text>
                                        </div>
                                        <div className={styles.metricItem}>
                                            <Text type="secondary">Growth</Text>
                                            <Tag color="success" style={{fontSize: 13, fontWeight: 600}}>
                                                <ArrowUpOutlined/> {landlord.growth}%
                                            </Tag>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;

