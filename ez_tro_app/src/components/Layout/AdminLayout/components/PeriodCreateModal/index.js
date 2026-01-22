import React from 'react';
import { Modal, Form, DatePicker, message } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

function PeriodCreateModal({ open, onCancel, onCreate, loading }) {
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // values.dateRange sẽ là mảng [dayjs, dayjs]
            const [startDate, endDate] = values.dateRange || [];

            if (!startDate || !endDate) {
                message.error('Vui lòng chọn khoảng thời gian');
                return;
            }

            const month = startDate.month() + 1; // 1-12
            const year = startDate.year();

            const payload = {
                periodMonth: month,
                periodYear: year,
                startDate: startDate.format('YYYY-MM-DD'),
                endDate: endDate.format('YYYY-MM-DD'),
            };

            await onCreate(payload);

            form.resetFields();
        } catch (errorInfo) {
            // Antd Form tự hiển thị lỗi validate
            // Nếu lỗi khác thì show message
            if (!errorInfo.errorFields) {
                message.error('Có lỗi xảy ra khi tạo kỳ hạn');
            }
        }
    };

    return (
        <Modal
            title="Tạo kỳ ghi điện nước mới"
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Tạo kỳ"
            cancelText="Hủy"
            width={500}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="dateRange"
                    label="Khoảng thời gian (Tháng / Năm)"
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng chọn khoảng thời gian',
                        },
                    ]}
                    tooltip="Tháng và năm sẽ tự động lấy từ ngày bắt đầu"
                >
                    <RangePicker
                        format="DD/MM/YYYY"
                        placeholder={['Từ ngày', 'Đến ngày']}
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                {/* Hiển thị preview tháng/năm (tùy chọn) */}
                <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
                    Kỳ sẽ được tạo: Tháng X / Năm YYYY (tự động từ ngày bắt đầu)
                </div>
            </Form>
        </Modal>
    );
}

export default PeriodCreateModal;