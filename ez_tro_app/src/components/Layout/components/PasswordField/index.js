import { Form, Input } from 'antd';

export default function PasswordField({ field }) {
    return (
        <Form.Item
            key={field.name}
            label={field.label}
            name={field.name}
            rules={field.rules}
            tooltip={field.tooltip}
        >
            <Input.Password
                placeholder={field.placeholder}
                disabled={field.disabled}
            />
        </Form.Item>
    );
}
