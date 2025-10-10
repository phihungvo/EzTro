import { Form, Input } from 'antd';

export default function TextField({ field }) {
    return (
        <Form.Item
            key={field.name}
            label={field.label}
            name={field.name}
            rules={field.rules}
            tooltip={field.tooltip}
        >
            <Input
                placeholder={field.placeholder} 
                disabled={field.disabled}
                prefix={field.prefix}
                suffix={field.suffix}
                allowClear={field.allowClear}
                maxLength={field.maxLength}
            />
        </Form.Item>
    );
}
