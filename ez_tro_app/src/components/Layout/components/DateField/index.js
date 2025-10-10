import { DatePicker, Form, Input } from 'antd';

export default function DateField({ field }) {
    return (
        <Form.Item
            key={field.name}
            label={field.label}
            name={field.name}
            rules={field.rules}
            tooltip={field.tooltip}
        >
            <DatePicker
                style={{ width: '100%' }}
                format={field.format || 'YYYY-MM-DD'}
                disabled={field.disabled}
                showTime={field.showTime}
                disabledDate={field.disabledDate}
            />
        </Form.Item>
    );
}
