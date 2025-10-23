import { Form, Input, TimePicker } from 'antd';

export default function TimeField({ field }) {
    return (
        <Form.Item
            key={field.name}
            label={field.label}
            name={field.name}
            rules={field.rules}
            tooltip={field.tooltip}
        >
            <TimePicker
                style={{ width: '100%' }}
                format={field.format || 'HH:mm:ss'}
                disabled={field.disabled}
                use12Hours={field.use12Hours}
            />
        </Form.Item>
    );
}
