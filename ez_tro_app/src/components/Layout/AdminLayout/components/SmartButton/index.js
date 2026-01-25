import React from 'react';
import { Button, Tooltip } from 'antd';

function SmartButton({
                         size = 'middle',          // large | middle | small
                         type = 'default',         // primary | default | dashed | link | text
                         title = '',
                         icon = null,
                         onClick,
                         disabled = false,
                         loading = false,
                         tooltip = '',
                         buttonWidth = 120,
                         buttonHeight = 38,
                         className = '',
                         style = {},
                         ...rest
                     }) {
    const button = (
        <Button
            size={size}
            type={type}
            icon={icon}
            onClick={onClick}
            disabled={disabled}
            loading={loading}
            className={className}
            style={{
                width: buttonWidth,
                height: buttonHeight,
                ...style
            }}
            {...rest}
        >
            {title}
        </Button>
    );

    if (tooltip || disabled) {
        return (
            <Tooltip title={disabled ? (tooltip || 'Nút bị vô hiệu hóa') : tooltip}>
                {button}
            </Tooltip>
        );
    }

    return button;
}

export default SmartButton;