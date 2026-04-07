import React from 'react';
import classNames from 'classnames/bind';

import styles from '../PropertyAssetCreatorPage.module.scss';

const cx = classNames.bind(styles);

export default function CreatorActionBar({submitting, onBack, onSubmit}) {
    return (
        <div className={cx('actionBar')}>
            <button type="button" className={cx('secondaryButton')} onClick={onBack} disabled={submitting}>
                Quay lại danh sách
            </button>
            <button type="button" className={cx('primaryButton')} onClick={onSubmit} disabled={submitting}>
                {submitting ? 'Đang tạo tài sản...' : 'Tạo tài sản'}
            </button>
        </div>
    );
}
