import cardStyles from "../../Section.module.scss";
import styles from "./ServicesSection.module.scss";
import {fmt, SERVICES_CONFIG} from "../data.js";

export default function ServicesSection({state, patch}) {
    const toggle = (key) =>
        patch({services: {...state.services, [key]: !state.services[key]}});

    return (
        <div className={cardStyles.card}>
            <div className={cardStyles.header}>
                <span className={cardStyles.title}>④ Dịch vụ &amp; phí cố định</span>
            </div>
            <div className={cardStyles.body}>
                <div className={styles.grid}>
                    {Object.entries(SERVICES_CONFIG).map(([key, svc]) => {
                        const on = state.services[key];
                        return (
                            <div
                                key={key}
                                className={`${styles.toggle} ${on ? styles.active : ""}`}
                                onClick={() => toggle(key)}
                            >
                                <span className={styles.icon}>{svc.icon}</span>
                                <div className={styles.info}>
                                    <div className={styles.name}>{svc.name}</div>
                                    <div className={styles.price}>
                                        {fmt(svc.price)} ₫/tháng
                                    </div>
                                </div>
                                <div
                                    className={`${styles.check} ${
                                        on ? styles.checkActive : ""
                                    }`}
                                >
                                    {on ? "✓" : ""}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}