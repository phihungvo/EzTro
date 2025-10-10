import { Form, Input, Radio } from 'antd';

export default function RadioGroup({ field }) {
    return (
        <Form.Item
            key={field.name}
            label={field.label}
            name={field.name}
            rules={field.rules}
            tooltip={field.tooltip}
        >
            <Radio.Group
                options={field.options || []}
                disabled={field.disabled}
                buttonStyle={field.buttonStyle}
                optionType={field.optionType}
            />
        </Form.Item>
    );
}
