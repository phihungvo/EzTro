import { Form, Input } from 'antd';

export default function Rate({ field }) {
    return (
        <Form.Item
            key={field.name}
            label={field.label}
            name={field.name}
            rules={field.rules}
            tooltip={field.tooltip}
        >
            <Rate
                allowHalf={field.allowHalf}
                count={field.count || 5}
                disabled={field.disabled}
                character={field.character}
            />
        </Form.Item>
    );
}
