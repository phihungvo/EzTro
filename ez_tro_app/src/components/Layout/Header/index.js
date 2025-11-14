import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import Avatar from '~/components/Layout/AdminLayout/components/Avatar';
import Notification from '~/components/Layout/AdminLayout/components/Notification';
import {MailOutlined, BellOutlined} from '@ant-design/icons';
import NotificationBell from "~/components/Layout/AdminLayout/components/NotificationBell";

const cx = classNames.bind(styles);

const notificationIcons = [{
    icon: <BellOutlined/>, count: 3, type: 'bell'
}, {
    icon: <MailOutlined/>, count: 5, type: 'mail'
},];

function Header({title}) {
    return (<>
        <div className={cx('header-nav')}>
            <div className={cx('header-container')}>
                <div className={cx('nav-left')}>
                    <h3>{title}</h3>
                </div>
                <div className={cx('nav-right')}>
                    {/*{notificationIcons.map((item) => (<Notification*/}
                    {/*        key={item.type}*/}
                    {/*        icon={item.icon}*/}
                    {/*        count={item.count}*/}
                    {/*        style={{}}*/}
                    {/*    />*/}

                    {/*))}*/}
                    <NotificationBell/>
                    <Avatar/>
                </div>
            </div>
        </div>
    </>);
}

export default Header;
