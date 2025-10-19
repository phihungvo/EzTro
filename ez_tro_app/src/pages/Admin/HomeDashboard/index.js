import styles from './HomeDashboard.module.scss';
import React, { useState, useEffect } from 'react';
import {
    ArrowDownOutlined,
    ArrowUpOutlined,
} from '@ant-design/icons';
import {
    Col,
    Row,
    Statistic,
    Card,
    Spin,
} from 'antd';
import ReactApexChart from 'react-apexcharts';
import {getEmployeeByDepartment} from "~/service/admin/dashboard";

const { Countdown } = Statistic;

const cx = (classNames) => styles[classNames];

function HomeDashboard() {
    const deadline = Date.now() + 1000 * 60 * 60 * 24 * 30; // 30 ngày cho sự kiện

    const onFinish = () => {
        console.log('Sự kiện đã kết thúc!');
    };

    // State cho dữ liệu chart employee by department
    const [barChartData, setBarChartData] = useState({
        categories: [],
        series: [{ name: 'Nhân viên', data: [] }]
    });
    const [loadingBarChart, setLoadingBarChart] = useState(true);
    const [errorBarChart, setErrorBarChart] = useState(null);

    // Fetch data cho chart employee by department
    useEffect(() => {
        const fetchEmployeeByDepartment = async () => {
            try {
                setLoadingBarChart(true);
                setErrorBarChart(null);
                const data = await getEmployeeByDepartment();
                if (data && data.result) {
                    setBarChartData(data.result);
                } else {
                    // Fallback hardcode nếu API lỗi hoặc không có data
                    setBarChartData({
                        categories: ['Kỹ thuật', 'Nhân sự', 'Kinh doanh', 'Marketing', 'Tài chính'],
                        series: [{ name: 'Nhân viên', data: [120, 50, 80, 60, 30] }]
                    });
                }
            } catch (error) {
                console.error('Lỗi fetch employee by department:', error);
                setErrorBarChart('Không thể tải dữ liệu chart');
                // Fallback hardcode
                setBarChartData({
                    categories: ['Kỹ thuật', 'Nhân sự', 'Kinh doanh', 'Marketing', 'Tài chính'],
                    series: [{ name: 'Nhân viên', data: [120, 50, 80, 60, 30] }]
                });
            } finally {
                setLoadingBarChart(false);
            }
        };

        fetchEmployeeByDepartment();
    }, []);

    // Dữ liệu cho biểu đồ cột (Số lượng nhân viên theo phòng ban) - Động
    const barChartOptions = {
        chart: {
            type: 'bar',
            height: 350,
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                endingShape: 'rounded',
            },
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories: barChartData.categories,  // Động từ API
        },
        yaxis: {
            title: {
                text: 'Số lượng nhân viên',
            },
        },
        colors: ['#1890ff'],
        title: {
            text: 'Số lượng nhân viên theo phòng ban',
            align: 'center',
        },
    };

    const barChartSeries = barChartData.series;  // Động từ API

    // Dữ liệu cho biểu đồ tròn (Tỷ lệ nghỉ việc)
    const pieChartOptions = {
        chart: {
            type: 'pie',
            height: 350,
        },
        labels: ['Nghỉ tự nguyện', 'Sa thải', 'Hết hợp đồng', 'Khác'],
        colors: ['#ff4d4f', '#faad14', '#52c41a', '#1890ff'],
        title: {
            text: 'Tỷ lệ nghỉ việc',
            align: 'center',
        },
        responsive: [
            {
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200,
                    },
                    legend: {
                        position: 'bottom',
                    },
                },
            },
        ],
    };

    const pieChartSeries = [44, 15, 25, 16];

    // Dữ liệu cho biểu đồ đường (Xu hướng tuyển dụng)
    const lineChartOptions = {
        chart: {
            type: 'line',
            height: 350,
        },
        xaxis: {
            categories: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6'],
        },
        yaxis: {
            title: {
                text: 'Số lượng tuyển dụng',
            },
        },
        colors: ['#52c41a'],
        title: {
            text: 'Xu hướng tuyển dụng trong 6 tháng',
            align: 'center',
        },
        stroke: {
            curve: 'smooth',
        },
    };

    const lineChartSeries = [
        {
            name: 'Tuyển dụng',
            data: [10, 15, 8, 20, 25, 30],
        },
    ];

    // Dữ liệu cho biểu đồ Donut (Phân bố nhân viên theo độ tuổi)
    const donutChartOptions = {
        chart: {
            type: 'donut',
            height: 350,
        },
        labels: ['Dưới 25', '25-35', '35-45', 'Trên 45'],
        colors: ['#13c2c2', '#1890ff', '#fadb14', '#f5222d'],
        title: {
            text: 'Phân bố nhân viên theo độ tuổi',
            align: 'center',
        },
        responsive: [
            {
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200,
                    },
                    legend: {
                        position: 'bottom',
                    },
                },
            },
        ],
    };

    const donutChartSeries = [20, 45, 25, 10];

    // Dữ liệu cho biểu đồ Area (Giờ làm thêm)
    const areaChartOptions = {
        chart: {
            type: 'area',
            height: 350,
        },
        xaxis: {
            categories: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6'],
        },
        yaxis: {
            title: {
                text: 'Giờ làm thêm',
            },
        },
        colors: ['#faad14'],
        title: {
            text: 'Xu hướng giờ làm thêm trong 6 tháng',
            align: 'center',
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.9,
                stops: [0, 90, 100],
            },
        },
    };

    const areaChartSeries = [
        {
            name: 'Giờ làm thêm',
            data: [50, 60, 45, 70, 80, 65],
        },
    ];

    return (
        <div className={cx('dashboard-wrapper')}>
            <div className={cx('dashboard-container')}>
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                    <Col span={8}>
                        <Card bordered={false}>
                            <Statistic
                                title="Tổng số nhân viên"
                                value={1128}
                                valueStyle={{ color: '#3f8600' }}
                                prefix={<ArrowUpOutlined />}
                                suffix="người"
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card bordered={false}>
                            <Statistic
                                title="Tỷ lệ nghỉ việc"
                                value={9.3}
                                precision={2}
                                valueStyle={{ color: '#cf1322' }}
                                prefix={<ArrowDownOutlined />}
                                suffix="%"
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card bordered={false}>
                            <Countdown
                                title="Thời gian còn lại cho kỳ đánh giá"
                                value={deadline}
                                onFinish={onFinish}
                                format="D [ngày] HH:mm:ss"
                            />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Card bordered={false} title="Số lượng nhân viên theo phòng ban">
                            {loadingBarChart ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
                                    <Spin size="large" tip="Đang tải dữ liệu..." />
                                </div>
                            ) : errorBarChart ? (
                                <div style={{ color: 'red', textAlign: 'center', height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {errorBarChart} (Sử dụng dữ liệu mẫu)
                                </div>
                            ) : (
                                <ReactApexChart
                                    options={barChartOptions}
                                    series={barChartSeries}
                                    type="bar"
                                    height={350}
                                />
                            )}
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card bordered={false} title="Tỷ lệ nghỉ việc">
                            <ReactApexChart
                                options={pieChartOptions}
                                series={pieChartSeries}
                                type="pie"
                                height={350}
                            />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                    <Col span={12}>
                        <Card bordered={false} title="Phân bố nhân viên theo độ tuổi">
                            <ReactApexChart
                                options={donutChartOptions}
                                series={donutChartSeries}
                                type="donut"
                                height={350}
                            />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card bordered={false} title="Xu hướng giờ làm thêm">
                            <ReactApexChart
                                options={areaChartOptions}
                                series={areaChartSeries}
                                type="area"
                                height={350}
                            />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                    <Col span={24}>
                        <Card bordered={false} title="Xu hướng tuyển dụng">
                            <ReactApexChart
                                options={lineChartOptions}
                                series={lineChartSeries}
                                type="line"
                                height={350}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default HomeDashboard;