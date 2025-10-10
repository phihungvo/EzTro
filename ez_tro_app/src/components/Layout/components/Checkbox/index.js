import { Form, Input } from 'antd';

export default function Checkbox({ field }) {
    return (
        <Form.Item
            key={field.name}
            name={field.name}
            valuePropName="checked"
            rules={field.rules}
            tooltip={field.tooltip}
        >
            <Checkbox disabled={field.disabled}>{field.label}</Checkbox>
        </Form.Item>
    );
}
