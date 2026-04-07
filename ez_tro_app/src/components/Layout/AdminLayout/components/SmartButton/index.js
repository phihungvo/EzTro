import React from 'react';
import { Button, Tooltip } from 'antd';
import classNames from 'classnames/bind';
import styles from './SmartButton.module.scss';

const cx = classNames.bind(styles);

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
    const normalizedTitle = String(title).toLowerCase();
    const isExcelButton = normalizedTitle.includes('excel') || normalizedTitle.includes('xuất');
    const buttonClassName = cx('smartButton', {
        primary: type === 'primary',
        excel: isExcelButton,
    }, className);

    const button = (
        <Button
            size={size}
            type={type}
            icon={icon}
            onClick={onClick}
            disabled={disabled}
            loading={loading}
            className={buttonClassName}
            style={{
                '--smart-button-width': typeof buttonWidth === 'number' ? `${buttonWidth}px` : buttonWidth,
                '--smart-button-height': typeof buttonHeight === 'number' ? `${buttonHeight}px` : buttonHeight,
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
