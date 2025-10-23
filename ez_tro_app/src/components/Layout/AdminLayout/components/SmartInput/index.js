import { Input } from 'antd';
import { SearchOutlined, CloseCircleFilled } from '@ant-design/icons';

function SmartInput({
    size = 'medium',
    placeholder = 'Input',
    inputWidth = 250,
    inputHeight = 38,
    value,
    onChange,
    onPressEnter,
    icon = <SearchOutlined />,
    allowClear = false,
    onClear,
}) {
    const handleClear = () => {
        if (onClear) onClear();
    };

    return (
        <Input
            size={size}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onPressEnter={onPressEnter}
            style={{
                width: inputWidth,
                height: inputHeight,
                color: 'black',
            }}
            prefix={
                icon && (
                    <span style={{ fontSize: '20px', color: '#1890ff' }}>
                        {icon}
                    </span>
                )
            }
            suffix={
                allowClear && value ? (
                    <CloseCircleFilled
                        onClick={handleClear}
                        style={{
                            color: '#999',
                            cursor: 'pointer',
                            fontSize: '16px',
                        }}
                    />
                ) : null
            }
        />
    );
}

export default SmartInput;
