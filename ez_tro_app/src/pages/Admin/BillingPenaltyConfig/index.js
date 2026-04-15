import React, {useCallback, useEffect, useState} from 'react';
import {Card, Form, InputNumber, Button, Space, message, Typography, Alert} from 'antd';
import {SaveOutlined, ReloadOutlined} from '@ant-design/icons';
import {getConfigByKey, upsertConfig} from '~/service/admin/systemConfig';

const {Text} = Typography;

const CONFIG_KEYS = [
    {key: 'BILLING_PENALTY_GRACE_DAYS', label: 'Số ngày grace (không phạt)', min: 0},
    {key: 'BILLING_PENALTY_DAILY_AMOUNT', label: 'Tiền phạt cố định mỗi ngày (VND)', min: 0, step: 1000},
    {key: 'BILLING_PENALTY_DAILY_THRESHOLD_DAYS', label: 'Bắt đầu phạt cố định từ ngày quá hạn thứ', min: 0},
    {key: 'BILLING_PENALTY_PERCENT_RATE', label: 'Tỷ lệ phạt % trên số dư (0.05 = 5%)', min: 0, step: 0.01},
    {key: 'BILLING_PENALTY_PERCENT_THRESHOLD_DAYS', label: 'Bắt đầu phạt % từ ngày quá hạn thứ', min: 0},
];

export default function BillingPenaltyConfig() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [idMap, setIdMap] = useState({});

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const entries = await Promise.all(
                CONFIG_KEYS.map(async (c) => {
                    const cfg = await getConfigByKey(c.key);
                    return {key: c.key, id: cfg?.id, value: cfg?.value};
                })
            );
            const map = {};
            const initialValues = {};
            entries.forEach(({key, id, value}) => {
                map[key] = id;
                initialValues[key] = value !== undefined ? Number(value) : undefined;
            });
            setIdMap(map);
            form.setFieldsValue(initialValues);
        } catch (e) {
            // error handled in service
        } finally {
            setLoading(false);
        }
    }, [form]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onSave = async (values) => {
        setLoading(true);
        try {
            await Promise.all(CONFIG_KEYS.map(async (cfg) => {
                const payload = {
                    id: idMap[cfg.key],
                    key: cfg.key,
                    value: values[cfg.key],
                    description: `Penalty config: ${cfg.label}`
                };
                const saved = await upsertConfig(payload);
                if (saved?.id) {
                    setIdMap((prev) => ({...prev, [cfg.key]: saved.id}));
                }
            }));
            message.success('Đã lưu cấu hình penalty');
        } catch (e) {
            // handled in service
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Cấu hình phí phạt trễ hạn" loading={loading}>
            <Space direction="vertical" size="large" style={{width: '100%'}}>
                <Alert
                    type="info"
                    message="Lưu ý"
                    description="Giá trị này áp dụng cho tất cả hóa đơn trễ hạn. Sau khi lưu, job penalty sẽ dùng giá trị mới."
                    showIcon
                />
                <Form form={form} layout="vertical" onFinish={onSave}>
                    {CONFIG_KEYS.map((cfg) => (
                        <Form.Item
                            key={cfg.key}
                            name={cfg.key}
                            label={<Text strong>{cfg.label}</Text>}
                            rules={[{required: true, message: 'Không được để trống'}]}
                        >
                            <InputNumber
                                min={cfg.min ?? 0}
                                step={cfg.step ?? 1}
                                style={{width: '100%'}}
                            />
                        </Form.Item>
                    ))}

                    <Space>
                        <Button icon={<ReloadOutlined/>} onClick={loadData}>Tải lại</Button>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined/>} loading={loading}>
                            Lưu cấu hình
                        </Button>
                    </Space>
                </Form>
            </Space>
        </Card>
    );
}
