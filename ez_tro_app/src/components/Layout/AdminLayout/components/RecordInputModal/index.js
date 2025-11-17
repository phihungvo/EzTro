import React, {useState, useEffect} from 'react';
import classNames from 'classnames/bind';
import styles from './RecordInputModal.module.scss';
import {Modal, Form, Row, Col, InputNumber, Divider, Card, message} from 'antd';
import {ThunderboltOutlined, CalculatorOutlined} from '@ant-design/icons';

const cx = classNames.bind(styles);

const RecordInputModal = ({isOpen, onClose, room, period, onSave, electricPrice, waterPrice}) => {
    const [form] = Form.useForm();
    const [electricUsage, setElectricUsage] = useState(0);
    const [waterUsage, setWaterUsage] = useState(0);
    const [electricAmount, setElectricAmount] = useState(0);
    const [waterAmount, setWaterAmount] = useState(0);

    useEffect(() => {
        if (room && isOpen) {
            const record = room.record;
            if (record) {
                form.setFieldsValue({
                    electricOldIndex: record.electricOldIndex,
                    electricNewIndex: record.electricNewIndex,
                    waterOldIndex: record.waterOldIndex,
                    waterNewIndex: record.waterNewIndex,
                });
                calculateUsage(
                    record.electricOldIndex,
                    record.electricNewIndex,
                    record.waterOldIndex,
                    record.waterNewIndex
                );
            } else {
                // Set old index from room's last record
                form.setFieldsValue({
                    electricOldIndex: room.lastElectricIndex || 0,
                    electricNewIndex: null,
                    waterOldIndex: room.lastWaterIndex || 0,
                    waterNewIndex: null,
                });
                calculateUsage(room.lastElectricIndex || 0, 0, room.lastWaterIndex || 0, 0);
            }
        }
    }, [room, isOpen]);

    const calculateUsage = (electricOld, electricNew, waterOld, waterNew) => {
        const eOld = electricOld || 0;
        const eNew = electricNew || 0;
        const wOld = waterOld || 0;
        const wNew = waterNew || 0;

        const eUsage = eNew >= eOld ? eNew - eOld : 0;
        const wUsage = wNew >= wOld ? wNew - wOld : 0;

        setElectricUsage(eUsage);
        setWaterUsage(wUsage);
        setElectricAmount(eUsage * electricPrice);
        setWaterAmount(wUsage * waterPrice);
    };

    const handleValuesChange = (changedValues, allValues) => {
        calculateUsage(
            allValues.electricOldIndex,
            allValues.electricNewIndex,
            allValues.waterOldIndex,
            allValues.waterNewIndex
        );
    };

    const handleSubmit = async (values) => {
        if (values.electricNewIndex < values.electricOldIndex) {
            message.error('Chỉ số điện mới không được nhỏ hơn chỉ số cũ!');
            return;
        }
        if (values.waterNewIndex < values.waterOldIndex) {
            message.error('Chỉ số nước mới không được nhỏ hơn chỉ số cũ!');
            return;
        }

        const recordData = {
            roomId: room.id,
            electricOldIndex: values.electricOldIndex,
            electricNewIndex: values.electricNewIndex,
            electricUsage,
            electricAmount,
            waterOldIndex: values.waterOldIndex,
            waterNewIndex: values.waterNewIndex,
            waterUsage,
            waterAmount,
        };

        onSave(recordData);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    if (!room) return null;

    return (
        <Modal
            title={
                <div className={cx('modal-title')}>
                    <span>Ghi chỉ số điện nước</span>
                    <span className={cx('room-info')}>Phòng {room.roomNumber}</span>
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            onOk={() => form.submit()}
            okText="Lưu chỉ số"
            cancelText="Hủy"
            width={700}
            className={cx('record-modal')}
        >
            <div className={cx('modal-content')}>
                {/* Room Info */}
                <Card size="small" className={cx('info-card')}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <div className={cx('info-item')}>
                                <span className={cx('info-label')}>Khu trọ:</span>
                                <span className={cx('info-value')}>{room.boardingHouse}</span>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className={cx('info-item')}>
                                <span className={cx('info-label')}>Toà nhà:</span>
                                <span className={cx('info-value')}>{room.building}</span>
                            </div>
                        </Col>
                        {room.tenantName && (
                            <Col span={24}>
                                <div className={cx('info-item')}>
                                    <span className={cx('info-label')}>Người thuê:</span>
                                    <span className={cx('info-value')}>{room.tenantName}</span>
                                </div>
                            </Col>
                        )}
                    </Row>
                </Card>

                <Divider/>

                {/* Form */}
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    onValuesChange={handleValuesChange}
                >
                    {/* Electric */}
                    <Card
                        size="small"
                        className={cx('utility-card', 'electric')}
                        title={
                            <span className={cx('utility-title')}>
                <ThunderboltOutlined/> Điện ({formatCurrency(electricPrice)}/kWh)
              </span>
                        }
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="electricOldIndex"
                                    label="Chỉ số cũ"
                                    rules={[{required: true, message: 'Vui lòng nhập chỉ số cũ!'}]}
                                >
                                    <InputNumber
                                        style={{width: '100%'}}
                                        min={0}
                                        placeholder="0"
                                        disabled
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="electricNewIndex"
                                    label="Chỉ số mới"
                                    rules={[{required: true, message: 'Vui lòng nhập chỉ số mới!'}]}
                                >
                                    <InputNumber
                                        style={{width: '100%'}}
                                        min={0}
                                        placeholder="0"
                                        autoFocus
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <div className={cx('calculation-result')}>
                            <div className={cx('result-row')}>
                                <CalculatorOutlined className={cx('result-icon')}/>
                                <span className={cx('result-label')}>Tiêu thụ:</span>
                                <span className={cx('result-value')}>{electricUsage} kWh</span>
                            </div>
                            <div className={cx('result-row', 'amount')}>
                                <span className={cx('result-label')}>Thành tiền:</span>
                                <span className={cx('result-amount')}>{formatCurrency(electricAmount)}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Water */}
                    <Card
                        size="small"
                        className={cx('utility-card', 'water')}
                        title={
                            <span className={cx('utility-title')}>
                <CalculatorOutlined/> Nước ({formatCurrency(waterPrice)}/m³)
              </span>
                        }
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="waterOldIndex"
                                    label="Chỉ số cũ"
                                    rules={[{required: true, message: 'Vui lòng nhập chỉ số cũ!'}]}
                                >
                                    <InputNumber
                                        style={{width: '100%'}}
                                        min={0}
                                        placeholder="0"
                                        disabled
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="waterNewIndex"
                                    label="Chỉ số mới"
                                    rules={[{required: true, message: 'Vui lòng nhập chỉ số mới!'}]}
                                >
                                    <InputNumber
                                        style={{width: '100%'}}
                                        min={0}
                                        placeholder="0"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <div className={cx('calculation-result')}>
                            <div className={cx('result-row')}>
                                <CalculatorOutlined className={cx('result-icon')}/>
                                <span className={cx('result-label')}>Tiêu thụ:</span>
                                <span className={cx('result-value')}>{waterUsage} m³</span>
                            </div>
                            <div className={cx('result-row', 'amount')}>
                                <span className={cx('result-label')}>Thành tiền:</span>
                                <span className={cx('result-amount')}>{formatCurrency(waterAmount)}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Total */}
                    <Card size="small" className={cx('total-card')}>
                        <div className={cx('total-content')}>
                            <span className={cx('total-label')}>Tổng cộng:</span>
                            <span className={cx('total-amount')}>
                {formatCurrency(electricAmount + waterAmount)}
              </span>
                        </div>
                    </Card>
                </Form>
            </div>
        </Modal>
    );
};

export default RecordInputModal;