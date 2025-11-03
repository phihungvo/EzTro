import { Checkbox as AntCheckbox, Form, Input } from 'antd';

export default function Checkbox({ field }) {
    if (!field) return null;
    return (
        <Form.Item
            key={field.name}
            name={field.name}
            valuePropName="checked"
            rules={field.rules}
            tooltip={field.tooltip}
        >
            <AntCheckbox disabled={field.disabled}>{field.label}</AntCheckbox>
        </Form.Item>
    );
}