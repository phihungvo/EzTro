import React from 'react';
import classNames from 'classnames/bind';

import {CONDITION_OPTIONS, STATUS_OPTIONS} from '../constants';
import FormField from './FormField';
import SectionCard from './SectionCard';
import styles from '../PropertyAssetCreatorPage.module.scss';

const cx = classNames.bind(styles);

export default function AssetLifecycleSection({form, onChange}) {
    return (
        <SectionCard
            eyebrow="03. Vòng đời vận hành"
            title="Mua sắm, bảo hành và bảo trì"
            description="Khai báo đầy đủ dữ liệu vận hành để hệ thống tính khấu hao, mốc bảo trì và trạng thái sử dụng."
        >
            <div className={cx('grid', 'grid4')}>
                <FormField label="Ngày mua">
                    <input type="date" className={cx('control')} value={form.purchaseDate}
                           onChange={(event) => onChange('purchaseDate', event.target.value)}/>
                </FormField>
                <FormField label="Giá mua (VND)">
                    <input type="number" min="0" className={cx('control')} value={form.purchasePrice}
                           onChange={(event) => onChange('purchasePrice', event.target.value)}
                           placeholder="12000000"/>
                </FormField>
                <FormField label="Bảo hành (tháng)">
                    <input type="number" min="0" className={cx('control')} value={form.warrantyMonths}
                           onChange={(event) => onChange('warrantyMonths', event.target.value)}
                           placeholder="24"/>
                </FormField>
                <FormField label="Ngày lắp đặt">
                    <input type="date" className={cx('control')} value={form.installDate}
                           onChange={(event) => onChange('installDate', event.target.value)}/>
                </FormField>
            </div>

            <div className={cx('grid', 'grid4')}>
                <FormField label="Trạng thái">
                    <select className={cx('control')} value={form.status}
                            onChange={(event) => onChange('status', event.target.value)}>
                        <option value="">Tự suy ra từ vị trí</option>
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </FormField>
                <FormField label="Tình trạng">
                    <select className={cx('control')} value={form.condition}
                            onChange={(event) => onChange('condition', event.target.value)}>
                        {CONDITION_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </FormField>
                <FormField label="Bảo trì gần nhất">
                    <input type="date" className={cx('control')} value={form.lastMaintenanceDate}
                           onChange={(event) => onChange('lastMaintenanceDate', event.target.value)}/>
                </FormField>
                <FormField label="Chu kỳ bảo trì (tháng)">
                    <input type="number" min="0" className={cx('control')} value={form.maintenanceCycle}
                           onChange={(event) => onChange('maintenanceCycle', event.target.value)}
                           placeholder="6"/>
                </FormField>
            </div>

            <div className={cx('grid', 'grid4')}>
                <FormField label="Khấu hao năm (%)">
                    <input type="number" min="0" step="0.01" className={cx('control')} value={form.depreciationRate}
                           onChange={(event) => onChange('depreciationRate', event.target.value)}
                           placeholder="10"/>
                </FormField>
                <FormField label="Nhà cung cấp">
                    <input className={cx('control')} value={form.supplier}
                           onChange={(event) => onChange('supplier', event.target.value)}
                           placeholder="Tên đơn vị cung cấp"/>
                </FormField>
                <FormField label="SĐT nhà cung cấp">
                    <input className={cx('control')} value={form.supplierPhone}
                           onChange={(event) => onChange('supplierPhone', event.target.value)}
                           placeholder="0901234567"/>
                </FormField>
                <FormField label="Ngày bàn giao phụ trách">
                    <input type="date" className={cx('control')} value={form.assignedDate}
                           onChange={(event) => onChange('assignedDate', event.target.value)}/>
                </FormField>
            </div>
        </SectionCard>
    );
}
