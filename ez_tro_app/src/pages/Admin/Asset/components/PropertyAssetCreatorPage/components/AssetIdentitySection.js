import React from 'react';
import classNames from 'classnames/bind';

import {CATEGORY_OPTIONS} from '../constants';
import FormField from './FormField';
import SectionCard from './SectionCard';
import styles from '../PropertyAssetCreatorPage.module.scss';

const cx = classNames.bind(styles);

export default function AssetIdentitySection({form, errors, onChange, onGenerateCode}) {
    return (
        <SectionCard
            eyebrow="01. Hồ sơ tài sản"
            title="Thông tin nhận diện"
            description="Nhập mã quản lý, tên tài sản và các đặc điểm nhận dạng để dễ tra cứu trong vận hành."
            side={
                <button type="button" className={cx('ghostButton')} onClick={onGenerateCode}>
                    Gợi ý mã tài sản
                </button>
            }
        >
            <div className={cx('grid', 'grid3')}>
                <FormField label="Mã tài sản" required error={errors.assetCode}>
                    <input className={cx('control', errors.assetCode && 'controlError')} value={form.assetCode}
                           onChange={(event) => onChange('assetCode', event.target.value)}
                           placeholder="VD: TS-FU-A01-001"/>
                </FormField>
                <FormField label="Tên tài sản" required error={errors.assetName}>
                    <input className={cx('control', errors.assetName && 'controlError')} value={form.assetName}
                           onChange={(event) => onChange('assetName', event.target.value)}
                           placeholder="VD: Giường ngủ gỗ 1m6"/>
                </FormField>
                <FormField label="Danh mục" required error={errors.category}>
                    <select className={cx('control', errors.category && 'controlError')} value={form.category}
                            onChange={(event) => onChange('category', event.target.value)}>
                        {CATEGORY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </FormField>
            </div>

            <div className={cx('grid', 'grid4')}>
                <FormField label="Thương hiệu">
                    <input className={cx('control')} value={form.brand}
                           onChange={(event) => onChange('brand', event.target.value)}
                           placeholder="Daikin, Panasonic, Ikea..."/>
                </FormField>
                <FormField label="Model">
                    <input className={cx('control')} value={form.model}
                           onChange={(event) => onChange('model', event.target.value)}
                           placeholder="FTKC35UAVMV"/>
                </FormField>
                <FormField label="Serial number">
                    <input className={cx('control')} value={form.serialNumber}
                           onChange={(event) => onChange('serialNumber', event.target.value)}
                           placeholder="Có thể để trống nếu không có"/>
                </FormField>
                <FormField label="Người phụ trách">
                    <input className={cx('control')} value={form.assignedTo}
                           onChange={(event) => onChange('assignedTo', event.target.value)}
                           placeholder="Quản lý, bảo trì, chủ trọ..."/>
                </FormField>
            </div>

            <FormField label="Mô tả / thông số kỹ thuật">
                <textarea className={cx('control', 'textarea')} value={form.specification}
                          onChange={(event) => onChange('specification', event.target.value)}
                          placeholder="Kích thước, chất liệu, công suất, tính năng nổi bật..."/>
            </FormField>
        </SectionCard>
    );
}
