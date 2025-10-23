import React from 'react';
import classNames from 'classnames/bind';
import styles from './NavigationPanel.module.scss';

function NavigationPanel({ hiddenLogo = false, dataSource = [], onItemClick, selectedKey }) {
    const cx = classNames.bind(styles);

    return (
        <div className={cx('wrapper')}>
            {/* {!hiddenLogo && (
                <div className={cx('logo')}>
                    <Logo />
                </div>
            )} */}
            <div className={cx('menu')}>
                {dataSource.map((item) => (
                    <div
                        key={item.key}
                        className={cx('menu-item', { active: selectedKey === item.key })}
                        onClick={() => onItemClick(item.key)}
                    >
                        <span className={cx('icon')}>{item.icon}</span>
                        <span className={cx('title')}>{item.title}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default NavigationPanel;
