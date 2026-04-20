import React from 'react';
import classNames from 'classnames/bind';

import styles from '../PropertyAssetCreatorPage.module.scss';

const cx = classNames.bind(styles);

export default function FormField({label, required = false, hint, error, children}) {
    return (
        <label className={cx('field')}>
            <span className={cx('label')}>
                {label}
                {required ? <span className={cx('required')}>*</span> : null}
            </span>
            {children}
            {error ? <span className={cx('errorText')}>{error}</span> : null}
            {!error && hint ? <span className={cx('hint')}>{hint}</span> : null}
        </label>
    );
}
