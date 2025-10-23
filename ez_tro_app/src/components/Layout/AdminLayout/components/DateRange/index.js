import { Form, Input } from 'antd';
import { DatePicker } from 'antd';
const { RangePicker } = DatePicker;

export default function DateRange({ field }) {
    return (
        <Form.Item
            key={field.name}
            label={field.label}
            name={field.name}
            rules={field.rules}
            tooltip={field.tooltip}
        >
            <RangePicker
                style={{ width: '100%' }}
                format={field.format || 'YYYY-MM-DD'}
                disabled={field.disabled}
                showTime={field.showTime}
                disabledDate={field.disabledDate}
            />
        </Form.Item>
    );
}
