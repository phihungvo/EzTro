import { Form, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';

export default function TextAreaField({ field }) {
    return (
        <Form.Item
            key={field.name}
            label={field.label}
            name={field.name}
            rules={field.rules}
            tooltip={field.tooltip}
        >
            <TextArea
                rows={field.rows || 6}
                placeholder={field.placeholder}
                disabled={field.disabled}
                maxLength={field.maxLength}
                showCount={field.showCount}
                allowClear={field.allowClear}
            />
        </Form.Item>
    );
}
