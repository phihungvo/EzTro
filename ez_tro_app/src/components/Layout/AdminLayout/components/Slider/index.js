import { Form, Input, Slider } from 'antd';

export default function TextField({ field }) {
    return (
        <Form.Item
            key={field.name}
            label={field.label}
            name={field.name}
            rules={field.rules}
            tooltip={field.tooltip}
        >
            <Slider
                min={field.min}
                max={field.max}
                step={field.step}
                marks={field.marks}
                range={field.range}
                disabled={field.disabled}
                tooltip={field.sliderTooltip}
            />
        </Form.Item>
    );
}
