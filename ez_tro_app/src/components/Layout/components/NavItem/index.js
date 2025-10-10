import classNames from 'classnames/bind';
import styles from './NavItem.module.scss';
import { useState } from 'react';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function NavItem({ title, color, icon, children, url = '', roleIcon, permissionIcon }) {
    const [isOpen, setIsOpen] = useState(false);

    const navigate = useNavigate();

    const handleToggle = () => {
        if (children) setIsOpen(!isOpen);
    };

    const handleNavigate = () => {
        navigate(url);
    }

    return (
        <div className={cx('nav-item')} onClick={handleNavigate}>
            <div className={cx('sidebar-link')} onClick={handleToggle}>
                <div className={cx('logo-item')} style={{ color: color }}>
                    {icon}
                </div>
                <div className={cx('title')}>
                    <p>{title}</p>
                </div>
                <div className={cx('permission-icons')}>
                    {roleIcon && <span className={cx('icon', 'role')}>{roleIcon}</span>}
                    {permissionIcon && <span className={cx('icon', 'permission')}>{permissionIcon}</span>}
                </div>
                {children && (
                    <div className={cx('arrow')}>
                        {isOpen ? <DownOutlined /> : <RightOutlined />}
                    </div>
                )}
            </div>

            {children && isOpen && (
                <div className={cx('sub-menu')}>
                    {children.map((child, index) => (
                        <div key={index} className={cx('sub-item')}>
                            <span>{child.icon}</span>
                            <span>{child.title}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default NavItem;
