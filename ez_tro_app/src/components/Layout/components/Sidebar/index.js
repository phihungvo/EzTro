import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';
import logo from '../../../../assets/images/logo.png';
import NavItem from '../NavItem';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const cx = classNames.bind(styles);

function Sidebar({ hiddenLogo = false, dataSource, collapsed = false, onCollapse }) {
    return (
        <div className={cx('side-bar', { collapsed })}>
            <div className={cx('sidebar-inner')}>
                {hiddenLogo && (
                    <div className={cx('sidebar-logo', { collapsed })}>
                        <div className={cx('logo')}>
                            <img src={logo} alt="logo" />
                        </div>
                        <div className={cx('logo-text')}>Adminator</div>
                    </div>
                )}

                <div className={cx('collapse-btn')} onClick={onCollapse}>
                    {collapsed ? <RightOutlined /> : <LeftOutlined />}
                </div>

                <div className={cx('sidebar-menu')}>
                    {dataSource.map((item, index) => (
                        <NavItem
                            key={index}
                            title={item.title}
                            color={item.color}
                            icon={item.icon}
                            children={item.children}
                            url={item.url}
                            collapsed={collapsed}
                            roleIcon={item.roleIcon}
                            permissionIcon={item.permissionIcon}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
