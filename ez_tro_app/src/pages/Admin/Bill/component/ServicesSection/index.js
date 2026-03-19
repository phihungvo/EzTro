import cardStyles from "../../Section.module.scss";
import styles from "./ServicesSection.module.scss";
import { fmt } from "../data.js";

const TYPE_LABELS = {
    FIXED: "Cố định",
    PER_PERSON: "Theo người",
    PER_VEHICLE: "Theo xe",
};

const quantityLabel = (type) => {
    if (type === "PER_PERSON") return "Số người";
    if (type === "PER_VEHICLE") return "Số xe";
    return "Số lượng";
};

export default function ServicesSection({
    state,
    onFixedServiceToggle,
    onFixedServiceQuantityChange,
    onFixedServicePriceChange,
}) {
    const services = Array.isArray(state.fixedServices) ? state.fixedServices : [];
    const total = services.reduce((sum, item) => sum + (item.checked ? Number(item.totalAmount || 0) : 0), 0);

    return (
        <div className={cardStyles.card}>
            <div className={cardStyles.header}>
                <span className={cardStyles.title}>④ Dịch vụ &amp; phí cố định</span>
            </div>
            <div className={cardStyles.body}>
                {services.length === 0 ? (
                    <div className={styles.empty}>Phòng này chưa gán dịch vụ/phí cố định nào trong kỳ.</div>
                ) : (
                    <div className={styles.list}>
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className={`${styles.item} ${service.checked ? styles.checked : styles.unchecked}`}
                            >
                                <button
                                    type="button"
                                    className={styles.toggleArea}
                                    onClick={() => onFixedServiceToggle(service.id)}
                                >
                                    <div className={styles.meta}>
                                        <div className={styles.nameRow}>
                                            <span className={styles.name}>{service.name}</span>
                                            <span className={styles.badge}>{TYPE_LABELS[service.type] || service.type}</span>
                                            <span className={`${styles.check} ${service.checked ? styles.checkOn : ""}`}>
                                                {service.checked ? "✓" : ""}
                                            </span>
                                        </div>
                                        <div className={styles.sub}>
                                            {fmt(service.unitPrice)} ₫/{service.unit || "kỳ"} · {quantityLabel(service.type)}
                                        </div>
                                    </div>
                                </button>
                                <div className={styles.controls}>
                                    <label className={styles.field}>
                                        <span>{quantityLabel(service.type)}</span>
                                        <input
                                            type="number"
                                            min="1"
                                            value={service.quantity}
                                            disabled={!service.checked}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => onFixedServiceQuantityChange(service.id, e.target.value)}
                                        />
                                    </label>
                                    <label className={styles.field}>
                                        <span>Đơn giá</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={service.unitPrice}
                                            disabled={!service.checked}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => onFixedServicePriceChange(service.id, e.target.value)}
                                        />
                                    </label>
                                    <div className={styles.amount}>
                                        <span>Thành tiền</span>
                                        <strong>{fmt(service.checked ? service.totalAmount : 0)} ₫</strong>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className={styles.totalRow}>
                    <span>Tổng dịch vụ &amp; phí cố định</span>
                    <strong>{fmt(total)} ₫</strong>
                </div>
            </div>
        </div>
    );
}
