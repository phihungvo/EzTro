import React from 'react';
import { Card, Row, Col, Button, Space } from 'antd';
import { SaveOutlined, SendOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import classNames from 'classnames/bind';
import styles from './ActionButtons.module.scss';

const cx = classNames.bind(styles);

function ActionButtons({ onBack, onSaveDraft, onSubmit, disabledSubmit, recordedCount }) {
    return (
        <Card className={cx('action-card')}>
            <Row gutter={16} justify="space-between" align="middle">
                <Col>
                    <Button size="large" icon={<ArrowLeftOutlined />} onClick={onBack}>
                        Chọn lại kỳ ghi
                    </Button>
                </Col>

                <Col>
                    <Space size="middle">
                        <Button
                            type="default"
                            size="large"
                            icon={<SaveOutlined />}
                            onClick={onSaveDraft}
                        >
                            Lưu nháp
                        </Button>
                        <Button
                            type="primary"
                            size="large"
                            icon={<SendOutlined />}
                            onClick={onSubmit}
                            disabled={disabledSubmit}
                        >
                            Gửi & Tạo hóa đơn {recordedCount > 0 ? `(${recordedCount})` : ''}
                        </Button>
                    </Space>
                </Col>
            </Row>
        </Card>
    );
}

export default ActionButtons;