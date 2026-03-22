import React from 'react';
import classNames from 'classnames/bind';

import FormField from './FormField';
import SectionCard from './SectionCard';
import styles from '../PropertyAssetCreatorPage.module.scss';

const cx = classNames.bind(styles);

export default function AssetPlacementSection({
    form,
    errors,
    boardingHouses,
    buildings,
    rooms,
    loadingMeta,
    onChange,
}) {
    return (
        <SectionCard
            eyebrow="02. Vị trí triển khai"
            title="Khu trọ, toà nhà và phòng"
            description="Chọn nơi tài sản đang lưu kho hoặc được bàn giao. Nếu chọn phòng, backend sẽ tự ràng buộc về đúng toà nhà."
        >
            <div className={cx('grid', 'grid3')}>
                <FormField label="Khu trọ" required error={errors.boardingHouseId}>
                    <select
                        className={cx('control', errors.boardingHouseId && 'controlError')}
                        value={form.boardingHouseId}
                        onChange={(event) => onChange('boardingHouseId', event.target.value)}
                        disabled={loadingMeta}
                    >
                        <option value="">Chọn khu trọ</option>
                        {boardingHouses.map((item) => (
                            <option key={item.id} value={String(item.id)}>{item.name}</option>
                        ))}
                    </select>
                </FormField>
                <FormField label="Toà nhà">
                    <select
                        className={cx('control')}
                        value={form.buildingId}
                        onChange={(event) => onChange('buildingId', event.target.value)}
                        disabled={!form.boardingHouseId || loadingMeta}
                    >
                        <option value="">Chưa gán toà nhà</option>
                        {buildings.map((item) => (
                            <option key={item.id} value={String(item.id)}>{item.name}</option>
                        ))}
                    </select>
                </FormField>
                <FormField label="Phòng sử dụng" hint="Để trống nếu tài sản đang lưu kho hoặc chưa bàn giao">
                    <select
                        className={cx('control', errors.roomId && 'controlError')}
                        value={form.roomId}
                        onChange={(event) => onChange('roomId', event.target.value)}
                        disabled={!form.boardingHouseId || loadingMeta}
                    >
                        <option value="">Lưu kho / chưa gán phòng</option>
                        {rooms.map((item) => (
                            <option key={item.id} value={String(item.id)}>
                                {item.roomNumber} {item.buildingName ? `• ${item.buildingName}` : ''}
                            </option>
                        ))}
                    </select>
                </FormField>
            </div>
        </SectionCard>
    );
}
