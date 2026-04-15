import React, { useState } from 'react';
import { Card, Button, Badge, Tag, Modal, Radio, Checkbox, message, Space, Divider, Progress, Alert, Timeline, Table, Empty } from 'antd';
import {
    CrownOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    RocketOutlined,
    StarOutlined,
    ThunderboltOutlined,
    SafetyOutlined,
    CreditCardOutlined,
    HistoryOutlined,
    GiftOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import classNames from 'classnames/bind';
import styles from './OwnerSubscriptionPage.module.scss';

const cx = classNames.bind(styles);

// Mock Data
const mockCurrentPlan = {
    id: 2,
    name: 'Basic',
    price: 150000,
    maxBoardingHouses: 1,
    maxBuildings: 2,
    maxRooms: 30,
    currentBoardingHouses: 1,
    currentBuildings: 2,
    currentRooms: 25,
    expireDate: '2025-03-15',
    autoRenew: true,
    status: 'ACTIVE'
};

const mockPlans = [
    {
        id: 1,
        name: 'Free',
        price: 0,
        duration: 'Miễn phí',
        maxBoardingHouses: 1,
        maxBuildings: 1,
        maxRooms: 10,
        features: [
            { name: 'Quản lý 1 khu nhà', included: true },
            { name: 'Quản lý 1 toà nhà', included: true },
            { name: 'Tối đa 10 phòng', included: true },
            { name: 'Báo cáo cơ bản', included: true },
            { name: 'Có watermark', included: false },
            { name: 'Hỗ trợ chat', included: false },
            { name: 'Gửi hóa đơn Zalo/SMS', included: false },
            { name: 'API tích hợp', included: false }
        ],
        recommended: false,
        badge: null
    },
    {
        id: 2,
        name: 'Basic',
        price: 150000,
        duration: '/ tháng',
        maxBoardingHouses: 1,
        maxBuildings: 2,
        maxRooms: 30,
        features: [
            { name: 'Quản lý 1 khu nhà', included: true },
            { name: 'Quản lý 2 toà nhà', included: true },
            { name: 'Tối đa 30 phòng', included: true },
            { name: 'Báo cáo cơ bản', included: true },
            { name: 'Loại bỏ watermark', included: true },
            { name: 'Hỗ trợ chat', included: true },
            { name: 'Gửi hóa đơn Zalo/SMS', included: false },
            { name: 'API tích hợp', included: false }
        ],
        recommended: false,
        badge: 'Phổ biến'
    },
    {
        id: 3,
        name: 'Standard',
        price: 350000,
        duration: '/ tháng',
        maxBoardingHouses: 999,
        maxBuildings: 3,
        maxRooms: 100,
        features: [
            { name: 'Không giới hạn khu nhà', included: true },
            { name: 'Tối đa 3 toà/khu', included: true },
            { name: 'Tối đa 100 phòng', included: true },
            { name: 'Báo cáo chi tiết', included: true },
            { name: 'Loại bỏ watermark', included: true },
            { name: 'Hỗ trợ ưu tiên', included: true },
            { name: 'Gửi hóa đơn Zalo/SMS', included: true },
            { name: 'Nhắc nợ tự động', included: true }
        ],
        recommended: true,
        badge: 'Khuyến nghị'
    },
    {
        id: 4,
        name: 'Pro',
        price: 799000,
        duration: '/ tháng',
        maxBoardingHouses: 999,
        maxBuildings: 999,
        maxRooms: 999,
        features: [
            { name: 'Không giới hạn khu/toà/phòng', included: true },
            { name: 'Báo cáo chuyên sâu', included: true },
            { name: 'Đa nhân viên quản lý', included: true },
            { name: 'Hỗ trợ 24/7', included: true },
            { name: 'API tích hợp đầy đủ', included: true },
            { name: 'Tự động tính tiền nâng cao', included: true },
            { name: 'Tích hợp ngân hàng', included: true },
            { name: 'Tùy chỉnh giao diện', included: true }
        ],
        recommended: false,
        badge: 'Doanh nghiệp'
    }
];

const mockPaymentMethods = [
    { id: 'momo', name: 'Ví MoMo', icon: '💰', fee: 0 },
    { id: 'zalopay', name: 'ZaloPay', icon: '💳', fee: 0 },
    { id: 'vnpay', name: 'VNPAY', icon: '🏦', fee: 0 },
    { id: 'bank', name: 'Chuyển khoản ngân hàng', icon: '🏛️', fee: 0 }
];

const mockTransactionHistory = [
    {
        id: 1,
        date: '2025-01-15',
        description: 'Thanh toán gói Basic - Tháng 1/2025',
        amount: 150000,
        status: 'SUCCESS',
        method: 'MoMo',
        invoiceCode: 'INV-2025-001'
    },
    {
        id: 2,
        date: '2024-12-15',
        description: 'Thanh toán gói Basic - Tháng 12/2024',
        amount: 150000,
        status: 'SUCCESS',
        method: 'VNPAY',
        invoiceCode: 'INV-2024-112'
    },
    {
        id: 3,
        date: '2024-11-15',
        description: 'Thanh toán gói Basic - Tháng 11/2024',
        amount: 150000,
        status: 'SUCCESS',
        method: 'Chuyển khoản',
        invoiceCode: 'INV-2024-098'
    }
];

const mockPromotions = [
    {
        id: 1,
        code: 'NEWYEAR2025',
        description: 'Giảm 30% cho gói 6 tháng',
        discount: 30,
        validUntil: '2025-02-28'
    },
    {
        id: 2,
        code: 'YEARLY50',
        description: 'Giảm 50% khi thanh toán 1 năm',
        discount: 50,
        validUntil: '2025-12-31'
    }
];

function OwnerSubscriptionPage() {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('momo');
    const [selectedDuration, setSelectedDuration] = useState(1);
    const [autoRenew, setAutoRenew] = useState(true);
    const [activeTab, setActiveTab] = useState('plans'); // plans, history, promotions

    const calculateDiscount = (months) => {
        if (months >= 12) return 0.5;
        if (months >= 6) return 0.3;
        return 0;
    };

    const calculateTotalPrice = (plan) => {
        if (!plan || plan.price === 0) return 0;
        const basePrice = plan.price * selectedDuration;
        const discount = calculateDiscount(selectedDuration);
        return basePrice * (1 - discount);
    };

    const handleUpgrade = (plan) => {
        if (plan.id === mockCurrentPlan.id) {
            message.info('Bạn đang sử dụng gói này');
            return;
        }
        setSelectedPlan(plan);
        setPaymentModalVisible(true);
    };

    const handlePayment = () => {
        message.success('Thanh toán thành công! Gói dịch vụ đã được kích hoạt.');
        setPaymentModalVisible(false);
    };

    const getDaysRemaining = () => {
        const today = new Date();
        const expire = new Date(mockCurrentPlan.expireDate);
        const diff = Math.ceil((expire - today) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const getUsagePercentage = (current, max) => {
        if (max === 999) return 0;
        return Math.round((current / max) * 100);
    };

    const transactionColumns = [
        {
            title: 'Mã hóa đơn',
            dataIndex: 'invoiceCode',
            key: 'invoiceCode',
            render: (text) => <span className={cx('invoice-code')}>{text}</span>
        },
        {
            title: 'Ngày thanh toán',
            dataIndex: 'date',
            key: 'date'
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description'
        },
        {
            title: 'Phương thức',
            dataIndex: 'method',
            key: 'method',
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => <span className={cx('amount')}>{amount.toLocaleString('vi-VN')} đ</span>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'SUCCESS' ? 'green' : 'red'}>
                    {status === 'SUCCESS' ? 'Thành công' : 'Thất bại'}
                </Tag>
            )
        }
    ];

    return (
        <div className={cx('subscription-wrapper')}>
            {/* Header */}
            <div className={cx('page-header')}>
                <div>
                    <h1 className={cx('page-title')}>
                        <CrownOutlined /> Gói dịch vụ & Thanh toán
                    </h1>
                    <p className={cx('page-description')}>Quản lý gói dịch vụ và lịch sử thanh toán của bạn</p>
                </div>
            </div>

            {/* Current Plan Info */}
            <Card className={cx('current-plan-card')}>
                <div className={cx('current-plan-header')}>
                    <div className={cx('plan-badge')}>
                        <CrownOutlined />
                        <span>Gói hiện tại</span>
                    </div>
                    <Tag color={mockCurrentPlan.status === 'ACTIVE' ? 'green' : 'orange'}>
                        {mockCurrentPlan.status === 'ACTIVE' ? 'Đang hoạt động' : 'Hết hạn'}
                    </Tag>
                </div>

                <div className={cx('current-plan-content')}>
                    <div className={cx('plan-info')}>
                        <h2 className={cx('plan-name')}>{mockCurrentPlan.name}</h2>
                        <div className={cx('plan-price')}>
                            {mockCurrentPlan.price === 0 ? 'Miễn phí' : `${mockCurrentPlan.price.toLocaleString('vi-VN')} đ/tháng`}
                        </div>
                        <div className={cx('expire-info')}>
                            <SafetyOutlined />
                            <span>Hết hạn: {mockCurrentPlan.expireDate}</span>
                            <Tag color={getDaysRemaining() < 7 ? 'red' : 'blue'}>
                                Còn {getDaysRemaining()} ngày
                            </Tag>
                        </div>
                    </div>

                    <div className={cx('usage-stats')}>
                        <div className={cx('usage-item')}>
                            <div className={cx('usage-label')}>Khu nhà</div>
                            <Progress
                                percent={getUsagePercentage(mockCurrentPlan.currentBoardingHouses, mockCurrentPlan.maxBoardingHouses)}
                                format={() => `${mockCurrentPlan.currentBoardingHouses}/${mockCurrentPlan.maxBoardingHouses === 999 ? '∞' : mockCurrentPlan.maxBoardingHouses}`}
                                strokeColor="#722ed1"
                            />
                        </div>
                        <div className={cx('usage-item')}>
                            <div className={cx('usage-label')}>Toà nhà</div>
                            <Progress
                                percent={getUsagePercentage(mockCurrentPlan.currentBuildings, mockCurrentPlan.maxBuildings)}
                                format={() => `${mockCurrentPlan.currentBuildings}/${mockCurrentPlan.maxBuildings === 999 ? '∞' : mockCurrentPlan.maxBuildings}`}
                                strokeColor="#1890ff"
                            />
                        </div>
                        <div className={cx('usage-item')}>
                            <div className={cx('usage-label')}>Phòng</div>
                            <Progress
                                percent={getUsagePercentage(mockCurrentPlan.currentRooms, mockCurrentPlan.maxRooms)}
                                format={() => `${mockCurrentPlan.currentRooms}/${mockCurrentPlan.maxRooms === 999 ? '∞' : mockCurrentPlan.maxRooms}`}
                                strokeColor="#52c41a"
                            />
                        </div>
                    </div>
                </div>

                {getUsagePercentage(mockCurrentPlan.currentRooms, mockCurrentPlan.maxRooms) > 80 && (
                    <Alert
                        message="Cảnh báo dung lượng"
                        description="Bạn đã sử dụng hơn 80% giới hạn phòng. Hãy nâng cấp gói để tiếp tục mở rộng."
                        type="warning"
                        showIcon
                        className={cx('usage-warning')}
                    />
                )}
            </Card>

            {/* Tabs */}
            <div className={cx('tabs-container')}>
                <div className={cx('tabs')}>
                    <button
                        className={cx('tab', { active: activeTab === 'plans' })}
                        onClick={() => setActiveTab('plans')}
                    >
                        <RocketOutlined /> Các gói dịch vụ
                    </button>
                    <button
                        className={cx('tab', { active: activeTab === 'history' })}
                        onClick={() => setActiveTab('history')}
                    >
                        <HistoryOutlined /> Lịch sử thanh toán
                    </button>
                    <button
                        className={cx('tab', { active: activeTab === 'promotions' })}
                        onClick={() => setActiveTab('promotions')}
                    >
                        <GiftOutlined /> Khuyến mãi
                    </button>
                </div>
            </div>

            {/* Tab Content: Plans */}
            {activeTab === 'plans' && (
                <div className={cx('plans-grid')}>
                    {mockPlans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={cx('plan-card', {
                                recommended: plan.recommended,
                                current: plan.id === mockCurrentPlan.id
                            })}
                        >
                            {plan.recommended && (
                                <div className={cx('recommended-badge')}>
                                    <StarOutlined /> Khuyến nghị
                                </div>
                            )}

                            {plan.id === mockCurrentPlan.id && (
                                <div className={cx('current-badge')}>
                                    <CheckCircleOutlined /> Đang sử dụng
                                </div>
                            )}

                            <div className={cx('plan-header')}>
                                <h3 className={cx('plan-name')}>{plan.name}</h3>
                                {plan.badge && <Badge count={plan.badge} style={{ backgroundColor: '#722ed1' }} />}
                            </div>

                            <div className={cx('plan-price-section')}>
                                <div className={cx('price')}>
                                    {plan.price === 0 ? 'Miễn phí' : `${plan.price.toLocaleString('vi-VN')} đ`}
                                </div>
                                <div className={cx('duration')}>{plan.duration}</div>
                            </div>

                            <Divider />

                            <div className={cx('features-list')}>
                                {plan.features.map((feature, index) => (
                                    <div key={index} className={cx('feature-item', { disabled: !feature.included })}>
                                        {feature.included ? (
                                            <CheckCircleOutlined className={cx('icon-check')} />
                                        ) : (
                                            <CloseCircleOutlined className={cx('icon-close')} />
                                        )}
                                        <span>{feature.name}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                type={plan.recommended ? 'primary' : 'default'}
                                size="large"
                                block
                                className={cx('upgrade-btn')}
                                onClick={() => handleUpgrade(plan)}
                                disabled={plan.id === mockCurrentPlan.id}
                            >
                                {plan.id === mockCurrentPlan.id ? 'Gói hiện tại' :
                                    plan.id < mockCurrentPlan.id ? 'Hạ cấp' : 'Nâng cấp'}
                            </Button>
                        </Card>
                    ))}
                </div>
            )}

            {/* Tab Content: History */}
            {activeTab === 'history' && (
                <Card className={cx('history-card')}>
                    <Table
                        columns={transactionColumns}
                        dataSource={Array.isArray(mockTransactionHistory) ? mockTransactionHistory : []}
                        rowKey="id"
                        locale={{
                            emptyText: (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="Không có dữ liệu"
                                />
                            ),
                        }}
                        pagination={{ pageSize: 10 }}
                    />
                </Card>
            )}

            {/* Tab Content: Promotions */}
            {activeTab === 'promotions' && (
                <div className={cx('promotions-grid')}>
                    {mockPromotions.map((promo) => (
                        <Card key={promo.id} className={cx('promo-card')}>
                            <div className={cx('promo-header')}>
                                <GiftOutlined className={cx('promo-icon')} />
                                <Tag color="red">{promo.discount}% OFF</Tag>
                            </div>
                            <div className={cx('promo-code')}>{promo.code}</div>
                            <div className={cx('promo-description')}>{promo.description}</div>
                            <div className={cx('promo-valid')}>
                                <InfoCircleOutlined /> Có hiệu lực đến: {promo.validUntil}
                            </div>
                            <Button type="primary" block className={cx('copy-btn')}>
                                Sao chép mã
                            </Button>
                        </Card>
                    ))}
                </div>
            )}

            {/* Payment Modal */}
            <Modal
                title={<><CreditCardOutlined /> Thanh toán gói dịch vụ</>}
                open={paymentModalVisible}
                onCancel={() => setPaymentModalVisible(false)}
                footer={null}
                width={600}
                className={cx('payment-modal')}
            >
                {selectedPlan && (
                    <div className={cx('payment-content')}>
                        <Alert
                            message={`Nâng cấp lên gói ${selectedPlan.name}`}
                            description={`Bạn sẽ có thể quản lý ${selectedPlan.maxBoardingHouses === 999 ? 'không giới hạn' : selectedPlan.maxBoardingHouses} khu nhà, ${selectedPlan.maxBuildings === 999 ? 'không giới hạn' : selectedPlan.maxBuildings} toà nhà và ${selectedPlan.maxRooms === 999 ? 'không giới hạn' : selectedPlan.maxRooms} phòng`}
                            type="info"
                            showIcon
                            style={{ marginBottom: 24 }}
                        />

                        <div className={cx('payment-section')}>
                            <h4>Chọn thời gian thanh toán</h4>
                            <Radio.Group
                                value={selectedDuration}
                                onChange={(e) => setSelectedDuration(e.target.value)}
                                className={cx('duration-radio')}
                            >
                                <Radio value={1}>1 tháng</Radio>
                                <Radio value={3}>
                                    3 tháng <Tag color="blue">Tiết kiệm 10%</Tag>
                                </Radio>
                                <Radio value={6}>
                                    6 tháng <Tag color="orange">Tiết kiệm 30%</Tag>
                                </Radio>
                                <Radio value={12}>
                                    12 tháng <Tag color="red">Tiết kiệm 50%</Tag>
                                </Radio>
                            </Radio.Group>
                        </div>

                        <div className={cx('payment-section')}>
                            <h4>Phương thức thanh toán</h4>
                            <Radio.Group
                                value={selectedPaymentMethod}
                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                className={cx('payment-methods')}
                            >
                                {mockPaymentMethods.map((method) => (
                                    <Radio.Button key={method.id} value={method.id} className={cx('payment-method-btn')}>
                                        <span className={cx('method-icon')}>{method.icon}</span>
                                        <span>{method.name}</span>
                                    </Radio.Button>
                                ))}
                            </Radio.Group>
                        </div>

                        <Checkbox
                            checked={autoRenew}
                            onChange={(e) => setAutoRenew(e.target.checked)}
                            className={cx('auto-renew-check')}
                        >
                            Tự động gia hạn khi hết hạn
                        </Checkbox>

                        <Divider />

                        <div className={cx('payment-summary')}>
                            <div className={cx('summary-row')}>
                                <span>Gói dịch vụ:</span>
                                <strong>{selectedPlan.name}</strong>
                            </div>
                            <div className={cx('summary-row')}>
                                <span>Thời gian:</span>
                                <strong>{selectedDuration} tháng</strong>
                            </div>
                            <div className={cx('summary-row')}>
                                <span>Đơn giá:</span>
                                <span>{selectedPlan.price.toLocaleString('vi-VN')} đ/tháng</span>
                            </div>
                            {calculateDiscount(selectedDuration) > 0 && (
                                <div className={cx('summary-row', 'discount')}>
                                    <span>Giảm giá:</span>
                                    <span>-{(calculateDiscount(selectedDuration) * 100)}%</span>
                                </div>
                            )}
                            <Divider />
                            <div className={cx('summary-row', 'total')}>
                                <span>Tổng thanh toán:</span>
                                <strong className={cx('total-amount')}>
                                    {calculateTotalPrice(selectedPlan).toLocaleString('vi-VN')} đ
                                </strong>
                            </div>
                        </div>

                        <Space style={{ width: '100%', marginTop: 24 }} size="middle">
                            <Button onClick={() => setPaymentModalVisible(false)} block>
                                Hủy
                            </Button>
                            <Button type="primary" onClick={handlePayment} block icon={<ThunderboltOutlined />}>
                                Thanh toán ngay
                            </Button>
                        </Space>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default OwnerSubscriptionPage;
