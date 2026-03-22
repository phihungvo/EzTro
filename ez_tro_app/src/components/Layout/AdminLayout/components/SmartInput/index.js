import { Input } from 'antd';
import { SearchOutlined, CloseCircleFilled } from '@ant-design/icons';
import styles from './SmartInput.module.scss';

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
        <div className={styles['input-wrapper']}>
            <Input
                size={size}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onPressEnter={onPressEnter}
                style={{
                    width: inputWidth,
                    height: inputHeight,
                    color: '#e5eefc',
                }}
                prefix={
                    icon && (
                        <span style={{ fontSize: '18px', color: '#60a5fa' }}>
                            {icon}
                        </span>
                    )
                }
                suffix={
                    allowClear && value ? (
                        <CloseCircleFilled
                            onClick={handleClear}
                            style={{
                                color: '#94a3b8',
                                cursor: 'pointer',
                                fontSize: '16px',
                            }}
                        />
                    ) : null
                }
            />
        </div>
    );
}

export default SmartInput;
