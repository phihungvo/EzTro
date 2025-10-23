import React, { useEffect, useState } from 'react';
import { Carousel } from 'antd';
import { getAllActorNoPaging } from '~/service/admin/actor';
import classNames from 'classnames/bind';
import styles from './CarouselCircleImage.module.scss';

const cx = classNames.bind(styles);

const contentStyle = {
    margin: 0,
    height: '160px',
    color: '#fff',
    lineHeight: '160px',
    textAlign: 'center',
    background: '#364d79',
};

export default function CarouselCircleImage({ datasource }) {
    
    return (
        <>
            <Carousel arrows infinite={false}>
                <div className={cx('card-wrapper')}>
                    <div className={cx('img-inside-card')}>
                    </div>
                </div>
            </Carousel>
        </>
    );
}

