import cardStyles from "../../Section.module.scss";
import styles from "./DiscountSection.module.scss";
import {fmt} from "../data.js";

export function DiscountSection({
                                    discountType,
                                    discountVal,
                                    discountReason,
                                    subtotal,
                                    onTypeChange,
                                    onValChange,
                                    onReasonChange
                                }) {
    const discount = discountType === "percent"
        ? Math.round(subtotal * discountVal / 100)
        : discountType === "fixed" ? discountVal : 0;

    return (
        <div className={cardStyles.card}>
            <div className={cardStyles.header}>
                <span className={cardStyles.title}>⑥ Giảm giá / ưu đãi</span>
                {discount > 0 && (
                    <span className={styles.discountBadge}>−{fmt(discount)} ₫</span>
                )}
            </div>
            <div className={cardStyles.body}>
                <div className={styles.row2}>
                    <div className={cardStyles.fieldGroup}>
                        <label className={cardStyles.label}>Loại giảm giá</label>
                        <select
                            className={cardStyles.select}
                            value={discountType}
                            onChange={(e) => onTypeChange(e.target.value)}
                        >
                            <option value="none">Không giảm</option>
                            <option value="percent">Theo % (phần trăm)</option>
                            <option value="fixed">Số tiền cố định (₫)</option>
                        </select>
                    </div>
                    {discountType !== "none" && (
                        <div className={cardStyles.fieldGroup}>
                            <label className={cardStyles.label}>
                                Giá trị giảm {discountType === "percent" ? "(%)" : "(₫)"}
                            </label>
                            <input
                                type="number"
                                className={`${cardStyles.input} ${cardStyles.mono}`}
                                value={discountVal}
                                onChange={(e) => onValChange(parseFloat(e.target.value) || 0)}
                            />
                        </div>
                    )}
                </div>

                {discountType !== "none" && (
                    <div className={cardStyles.fieldGroup}>
                        <label className={cardStyles.label}>Lý do giảm giá</label>
                        <input
                            type="text"
                            className={cardStyles.input}
                            placeholder="VD: Khách ở lâu, tặng 1 tháng..."
                            value={discountReason}
                            onChange={(e) => onReasonChange(e.target.value)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────

export function PaymentSection({dueDate, paymentMethod, onDueDateChange, onMethodChange}) {
    const daysLeft = dueDate
        ? Math.round((new Date(dueDate) - new Date()) / 86400000)
        : 0;

    const METHODS = [
        {key: "cash", icon: "💵", label: "Tiền mặt"},
        {key: "bank", icon: "🏦", label: "Chuyển khoản"},
        {key: "momo", icon: "🩷", label: "Momo / Zalo"},
    ];

    return (
        <div className={cardStyles.card}>
            <div className={cardStyles.header}>
                <span className={cardStyles.title}>⑦ Hạn thanh toán &amp; phương thức</span>
            </div>
            <div className={cardStyles.body}>
                <div className={styles.row2}>
                    <div className={cardStyles.fieldGroup}>
                        <label className={cardStyles.label}>Hạn thanh toán <span
                            className={cardStyles.req}>*</span></label>
                        <input
                            type="date"
                            className={cardStyles.input}
                            value={dueDate}
                            onChange={(e) => onDueDateChange(e.target.value)}
                        />
                        <span
                            className={cardStyles.hint}
                            style={{color: daysLeft < 0 ? "var(--red)" : daysLeft <= 3 ? "var(--amber)" : "var(--text-faint)"}}
                        >
              {daysLeft < 0 ? `Đã quá hạn ${Math.abs(daysLeft)} ngày!` : `Còn ${daysLeft} ngày để thanh toán`}
            </span>
                    </div>
                    <div className={cardStyles.fieldGroup}>
                        <label className={cardStyles.label}>Nhắc nhở trước (ngày)</label>
                        <select className={cardStyles.select} defaultValue="3">
                            <option>1 ngày</option>
                            <option>3 ngày</option>
                            <option>5 ngày</option>
                            <option>7 ngày</option>
                        </select>
                    </div>
                </div>

                <div className={cardStyles.fieldGroup}>
                    <label className={cardStyles.label}>Phương thức thanh toán</label>
                    <div className={styles.pmGrid}>
                        {METHODS.map((m) => (
                            <div
                                key={m.key}
                                className={`${styles.pmCard} ${paymentMethod === m.key ? styles.pmSelected : ""}`}
                                onClick={() => onMethodChange(m.key)}
                            >
                                <span className={styles.pmIcon}>{m.icon}</span>
                                <span className={styles.pmLabel}>{m.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {paymentMethod === "bank" && (
                    <div className={styles.bankInfo}>
                        <div style={{fontSize: 36}}>🔲</div>
                        <div>
                            <div className={styles.bankName}>Ngân hàng: Vietcombank</div>
                            <div className={styles.bankAcct}>1234 5678 9012 · Nguyễn Minh Chủ</div>
                            <div className={styles.bankNote}>Nội dung: <strong>P101 T032026</strong></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────

export function NotesSection({
                                 notePublic,
                                 noteInternal,
                                 paymentInstructions,
                                 sendZalo,
                                 sendSms,
                                 sendEmail,
                                 sendNow,
                                 onNotePublicChange,
                                 onNoteInternalChange,
                                 onPaymentInstructionsChange,
                                 onToggleZalo,
                                 onToggleSms,
                                 onToggleEmail,
                                 onToggleSendNow
                             }) {
    return (
        <div className={cardStyles.card}>
            <div className={cardStyles.header}>
                <span className={cardStyles.title}>⑧ Ghi chú &amp; hướng dẫn thanh toán</span>
            </div>
            <div className={cardStyles.body}>
                <div className={cardStyles.fieldGroup} style={{marginBottom: 14}}>
                    <label className={cardStyles.label}>Ghi chú nội bộ (không hiển thị với khách)</label>
                    <textarea
                        className={cardStyles.textarea}
                        placeholder="VD: Khách hẹn thanh toán vào thứ 2 tuần sau..."
                        value={noteInternal}
                        onChange={(e) => onNoteInternalChange(e.target.value)}
                    />
                </div>
                <div className={cardStyles.fieldGroup}>
                    <label className={cardStyles.label}>Ghi chú trên hoá đơn (khách nhìn thấy)</label>
                    <textarea
                        className={cardStyles.textarea}
                        value={notePublic}
                        onChange={(e) => onNotePublicChange(e.target.value)}
                    />
                </div>
                <div className={cardStyles.fieldGroup} style={{marginTop: 14}}>
                    <label className={cardStyles.label}>Hướng dẫn thanh toán</label>
                    <textarea
                        className={cardStyles.textarea}
                        placeholder="VD: Chuyển khoản đúng nội dung phòng + kỳ thanh toán..."
                        value={paymentInstructions}
                        onChange={(e) => onPaymentInstructionsChange(e.target.value)}
                    />
                </div>

                <div className={styles.sendRow}>
                    <div className={cardStyles.fieldGroup}>
                        <label className={cardStyles.label}>Gửi thông báo qua</label>
                        <div className={styles.checkboxRow}>
                            {[
                                {label: "Zalo", value: sendZalo, fn: onToggleZalo},
                                {label: "SMS", value: sendSms, fn: onToggleSms},
                                {label: "Email", value: sendEmail, fn: onToggleEmail},
                            ].map((ch) => (
                                <label key={ch.label} className={styles.checkLabel}>
                                    <input type="checkbox" checked={ch.value} onChange={ch.fn}
                                           className={styles.checkbox}/>
                                    <span className={ch.value ? styles.checkOn : styles.checkOff}>{ch.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className={cardStyles.fieldGroup}>
                        <label className={cardStyles.label}>Gửi ngay khi lưu?</label>
                        <div className={styles.radioRow}>
                            {[
                                {label: "Gửi ngay", val: true},
                                {label: "Lưu nháp", val: false},
                            ].map((r) => (
                                <label key={r.label} className={styles.radioLabel}>
                                    <input type="radio" checked={sendNow === r.val}
                                           onChange={() => onToggleSendNow(r.val)} className={styles.radio}/>
                                    <span
                                        className={sendNow === r.val ? styles.checkOn : styles.checkOff}>{r.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
