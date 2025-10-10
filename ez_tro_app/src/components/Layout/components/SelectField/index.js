import { Form, Input, Select } from 'antd';

export default function SelectField({ field }) {
    return (
        <Form.Item
            key={field.name}
            label={field.label}
            name={field.name}
            rules={field.rules}
            tooltip={field.tooltip}
        >
            <Select
                mode={field.multiple ? 'multiple' : undefined}
                placeholder={field.placeholder || `Chọn ${field.label}`}
                showSearch={field.showSearch !== false}
                allowClear={field.allowClear !== false}
                disabled={field.disabled}
                loading={field.loading}
                optionFilterProp={field.optionFilterProp || 'children'}
                filterOption={
                    field.filterOption !== false
                        ? (input, option) =>
                              (option?.children || '')
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                        : undefined
                }
                notFoundContent={
                    field.notFoundContent || <div>Không tồn tại dữ liệu</div>
                }
                onChange={field.onChange}
            >
                {(field.options || []).map((option) => (
                    <Select.Option
                        key={
                            typeof option.value !== 'undefined'
                                ? option.value
                                : option
                        }
                        value={
                            typeof option.value !== 'undefined'
                                ? option.value
                                : option
                        }
                        disabled={option.disabled}
                    >
                        {option.label || option}
                    </Select.Option>
                ))}
            </Select>
        </Form.Item>
    );
}
