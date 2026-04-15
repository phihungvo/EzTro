import styles from './HeroPanel.module.scss';

export default function HeroPanel({
    isEditMode,
    selectedBoardingHouse,
    selectedBuilding,
    currentRooms,
    maxRooms,
    selectedUtilitiesCount,
    hasActiveContract,
    roomNumber,
}) {
    const quotaLabel = maxRooms > 0 ? `${currentRooms}/${maxRooms} phong` : 'Khong gioi han';
    const roomLabel = roomNumber?.trim() || 'Tu sinh so phong';

    return (
        <section className={styles.hero}>
            <div className={styles.heroMain}>
                <div className={styles.heroBadge}>
                    {isEditMode ? 'Cap nhat phong' : 'Khoi tao phong moi'}
                </div>
                <h1>{isEditMode ? `Dieu chinh phong ${roomLabel}` : 'Thiet lap phong de van hanh gon va dung luong'}</h1>
                <p>
                    Khai bao phong theo dung khu nha, toa nha, gia thue va tien ich ngay tu dau de hop dong,
                    hoa don va van hanh phia sau khong bi lech du lieu.
                </p>

                <div className={styles.heroMeta}>
                    <div className={`${styles.metaChip} ${styles.teal}`}>
                        <span>Khu nha</span>
                        <strong>{selectedBoardingHouse?.name || 'Chua chon'}</strong>
                    </div>
                    <div className={`${styles.metaChip} ${styles.violet}`}>
                        <span>Toa nha</span>
                        <strong>{selectedBuilding?.name || 'Chua chon'}</strong>
                    </div>
                    <div className={`${styles.metaChip} ${styles.coral}`}>
                        <span>So phong</span>
                        <strong>{roomLabel}</strong>
                    </div>
                </div>
            </div>

            <div className={styles.heroRail}>
                <div className={styles.infoCard}>
                    <span className={styles.label}>Trang thai van hanh</span>
                    <strong>{hasActiveContract ? 'Co hop dong hieu luc' : 'Chua co hop dong active'}</strong>
                    <small>{hasActiveContract ? 'Trang thai phong se khoa theo hop dong.' : 'Co the dua vao khai thac ngay sau khi luu.'}</small>
                </div>

                <div className={styles.infoCard}>
                    <span className={styles.label}>Quota phong</span>
                    <strong>{quotaLabel}</strong>
                    <small>{selectedUtilitiesCount} utility dang duoc ap dung cho phong</small>
                </div>
            </div>
        </section>
    );
}
