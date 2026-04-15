import React from 'react';
import classNames from 'classnames/bind';

import styles from '../PropertyAssetCreatorPage.module.scss';

const cx = classNames.bind(styles);

export default function SectionCard({eyebrow, title, description, children, side}) {
    return (
        <section className={cx('sectionCard')}>
            <div className={cx('sectionHead')}>
                <div>
                    {eyebrow ? <div className={cx('eyebrow')}>{eyebrow}</div> : null}
                    <h2 className={cx('sectionTitle')}>{title}</h2>
                    {description ? <p className={cx('sectionDescription')}>{description}</p> : null}
                </div>
                {side ? <div className={cx('sectionSide')}>{side}</div> : null}
            </div>
            {children}
        </section>
    );
}
