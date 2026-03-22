import cs from './ActionBar.module.scss';
import s from '../shared.module.scss';

/**
 * ActionBar
 * Sticky bottom bar: Quay lại / Lưu nháp / Tiếp theo + auto-save indicator.
 *
 * Props:
 *  onBack      fn()
 *  onDraft     fn()
 *  onNext      fn()
 *  submitting  bool
 *  primaryLabel string
 *  autoSaveAt  string  - "19:22"
 */
export default function ActionBar({
                                      onBack,
                                      onDraft,
                                      onNext,
                                      submitting = false,
                                      primaryLabel = 'Tiếp theo: Tài chính →',
                                      autoSaveAt,
                                  }) {
    return (
        <div className={cs.actionBar}>
            <button className={`${s.btn} ${s.btnSecondary}`} onClick={onBack}>
                ← Quay lại
            </button>

            <button className={`${s.btn} ${s.btnSecondary}`} onClick={onDraft} disabled={submitting}>
                💾 Lưu nháp
            </button>

            <button
                className={`${s.btn} ${s.btnPrimary}`}
                onClick={onNext}
                disabled={submitting}
            >
                {submitting ? '⏳ Đang lưu…' : primaryLabel}
            </button>

            {autoSaveAt && (
                <div className={cs.autoSave}>
                    <div className={cs.dotPulse} />
                    Tự động lưu lúc {autoSaveAt}
                </div>
            )}
        </div>
    );
}
