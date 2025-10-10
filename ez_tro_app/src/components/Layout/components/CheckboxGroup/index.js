import { Checkbox, Form, Input } from 'antd';

export default function CheckboxGroup({ field }) {
    return (
        <Form.Item
            key={field.name}
            label={field.label}
            name={field.name}
            rules={field.rules}
            tooltip={field.tooltip}
        >
            <Checkbox.Group
                options={field.options || []}
                disabled={field.disabled}
            />
        </Form.Item>
    );
}
