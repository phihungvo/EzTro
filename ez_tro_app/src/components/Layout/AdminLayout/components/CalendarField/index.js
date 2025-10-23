import { Cascader, Form, Input } from 'antd';

export default function CalendarField({ field }) {
    return (
        <Form.Item
            key={field.name}
            label={field.label}
            name={field.name}
            rules={field.rules}
            tooltip={field.tooltip}
        >
            <Cascader
                options={field.options || []}
                placeholder={field.placeholder}
                showSearch={field.showSearch}
                disabled={field.disabled}
                changeOnSelect={field.changeOnSelect}
            />
        </Form.Item>
    );
}
