import classNames from 'classnames/bind';
import styles from './Notification.module.scss';

const cx = classNames.bind(styles);

function Notification({icon, count}) {
    return (
        <div className={cx('notification-wrapper')}>
            <div className={cx('container')}>
                <div className={cx('count')}>{count}</div>
                <div className={cx('icon')}>{icon}</div>
            </div>
        </div>
    );
}

export default Notification;
