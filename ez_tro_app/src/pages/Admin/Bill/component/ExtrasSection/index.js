import { useState } from "react";
import cardStyles from "../../Section.module.scss";
import styles from "./ExtrasSection.module.scss";

export default function ExtrasSection({ extras, lateFeeEnabled, onAddExtra, onRemoveExtra, onExtraChange, onToggleLateFee }) {
    return (
        <div className={cardStyles.card}>
            <div className={cardStyles.header}>
                <span className={cardStyles.title}>⑤ Phí phát sinh / bổ sung</span>
            </div>
            <div className={cardStyles.body}>
                {extras.length > 0 && (
                    <div className={styles.extraList}>
                        {extras.map((extra) => (
                            <div key={extra.id} className={styles.extraItem}>
                                <input
                                    type="text"
                                    className={cardStyles.input}
                                    placeholder="Tên khoản phí..."
                                    value={extra.name}
                                    onChange={(e) => onExtraChange(extra.id, "name", e.target.value)}
                                />
                                <input
                                    type="number"
                                    className={`${cardStyles.input} ${cardStyles.mono}`}
                                    placeholder="Số tiền (₫)"
                                    value={extra.amount}
                                    onChange={(e) => onExtraChange(extra.id, "amount", e.target.value)}
                                />
                                <button className={styles.removeBtn} onClick={() => onRemoveExtra(extra.id)}>✕</button>
                            </div>
                        ))}
                    </div>
                )}

                <button className={styles.addBtn} onClick={onAddExtra}>
                    <span>＋</span> Thêm khoản phí phát sinh
                </button>
                <div className={cardStyles.hint} style={{ marginTop: 6 }}>
                    Ví dụ: Sửa chữa tài sản, phí trễ hạn, đặt cọc bổ sung...
                </div>

                <div className={cardStyles.sep} />

                {/* Late fee toggle */}
                <div className={styles.lateFeeRow}>
                    <div>
                        <div className={styles.lateFeeTitle}>Tự động tính phí trễ hạn</div>
                        <div className={styles.lateFeeSub}>Nếu thanh toán sau ngày đến hạn, áp dụng phí phạt</div>
                    </div>
                    <div className={styles.toggleRow} onClick={onToggleLateFee}>
                        <div className={`${styles.switchTrack} ${lateFeeEnabled ? styles.switchOn : styles.switchOff}`}>
                            <div className={styles.switchKnob} />
                        </div>
                        <span className={`${styles.switchLabel} ${lateFeeEnabled ? styles.labelOn : styles.labelOff}`}>
              {lateFeeEnabled ? "Bật" : "Tắt"}
            </span>
                    </div>
                </div>

                {lateFeeEnabled && (
                    <div className={styles.lateFeeConfig}>
                        <div className={styles.row2}>
                            <div className={cardStyles.fieldGroup}>
                                <label className={cardStyles.label}>Phí trễ hạn (%/ngày)</label>
                                <input type="number" className={`${cardStyles.input} ${cardStyles.mono}`} defaultValue="0.1" step="0.05" />
                            </div>
                            <div className={cardStyles.fieldGroup}>
                                <label className={cardStyles.label}>Tối đa (₫)</label>
                                <input type="number" className={`${cardStyles.input} ${cardStyles.mono}`} defaultValue="500000" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}