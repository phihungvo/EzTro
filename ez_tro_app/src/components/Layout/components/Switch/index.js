import { Form, Input } from 'antd';

export default function Switch({ field }) {
    return (
        <Form.Item
            key={field.name}
            label={field.label}
            name={field.name}
            valuePropName="checked"
            rules={field.rules}
            tooltip={field.tooltip}
        >
            <Switch
                disabled={field.disabled}
                checkedChildren={field.checkedChildren}
                unCheckedChildren={field.unCheckedChildren}
                loading={field.loading}
            />
        </Form.Item>
    );
}
