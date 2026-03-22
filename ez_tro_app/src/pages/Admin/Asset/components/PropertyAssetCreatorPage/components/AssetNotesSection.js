import React from 'react';
import classNames from 'classnames/bind';

import FormField from './FormField';
import SectionCard from './SectionCard';
import styles from '../PropertyAssetCreatorPage.module.scss';

const cx = classNames.bind(styles);

export default function AssetNotesSection({form, onChange, summaryItems}) {
    return (
        <div className={cx('notesGrid')}>
            <SectionCard
                eyebrow="04. Ghi chú vận hành"
                title="Ghi chú nội bộ"
                description="Lưu những lưu ý khi bàn giao, sửa chữa, bảo trì hoặc tiêu chuẩn sử dụng của tài sản."
            >
                <FormField label="Ghi chú">
                    <textarea className={cx('control', 'textareaLarge')} value={form.notes}
                              onChange={(event) => onChange('notes', event.target.value)}
                              placeholder="Ví dụ: Thiết bị dành cho phòng VIP, bảo trì định kỳ vào tuần đầu tháng, không tự ý di chuyển..."/>
                </FormField>
            </SectionCard>

            <SectionCard
                eyebrow="Tóm tắt"
                title="Kiểm tra nhanh trước khi tạo"
                description="Backend sẽ tiếp tục tính ngày hết bảo hành, lịch bảo trì tiếp theo và giá trị hiện tại của tài sản."
            >
                <div className={cx('summaryList')}>
                    {summaryItems.map((item) => (
                        <div key={item.label} className={cx('summaryItem')}>
                            <span className={cx('summaryLabel')}>{item.label}</span>
                            <strong className={cx('summaryValue')}>{item.value}</strong>
                        </div>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
}
