import { Form, Input, InputNumber } from 'antd';

export default function InputNumberField({ field }) {
    return (
        <Form.Item
            key={field.name}
            label={field.label}
            name={field.name}
            rules={field.rules}
            tooltip={field.tooltip}
        >
            <InputNumber
                style={{ width: '100%' }}
                min={field.min}
                max={field.max}
                step={field.step}
                disabled={field.disabled}
                addonBefore={field.addonBefore}
                addonAfter={field.addonAfter}
                formatter={field.formatter}
                parser={field.parser}
            />
        </Form.Item>
    );
}
