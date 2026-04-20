import styles from './SectionCard.module.scss';

export default function SectionCard({
                                        icon, iconColor, title, desc, headerRight, children,
                                    }) {
    return (
        <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
                <div className={`${styles.sectionIcon} ${styles[iconColor] || ''}`}>
                    {icon}
                </div>
                <div className={styles.sectionTitleGroup}>
                    <div className={styles.sectionTitle}>{title}</div>
                    <div className={styles.sectionDesc}>{desc}</div>
                </div>
                {headerRight}
            </div>
            <div className={styles.sectionBody}>{children}</div>
        </div>
    );
}