import React from "react";

import styles from "./UtilitiesStats.module.scss";
import {BoltIcon, WaterDropIcon} from "~/components/Layout/UserLayout/components/Icons";

const UtilitiesStats = ({ electricStats, waterStats }) => {
    return (
        <div className={styles.utilitiesStats}>
            <h2 className={styles.title}>📊 Thống Kê Tiêu Thụ</h2>

            <div className={styles.statsGrid}>
                {/* Electric Stats */}
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <BoltIcon className={styles.iconElectric} />
                        <span>ĐIỆN THÁNG NÀY</span>
                    </div>
                    <div className={styles.statValue}>
                        {electricStats.usage} <span className={styles.unit}>kWh</span>
                    </div>
                    <div className={styles.statFooter}>
                        <div className={styles.label}>PHÍ ĐIỆN</div>
                        <div className={styles.amount}>
                            {electricStats.cost.toLocaleString('vi-VN')} đ
                        </div>
                    </div>
                </div>

                {/* Water Stats */}
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <WaterDropIcon className={styles.iconWater} />
                        <span>NƯỚC THÁNG NÀY</span>
                    </div>
                    <div className={styles.statValue}>
                        {waterStats.usage} <span className={styles.unit}>m³</span>
                    </div>
                    <div className={styles.statFooter}>
                        <div className={styles.label}>PHÍ NƯỚC</div>
                        <div className={styles.amount}>
                            {waterStats.cost.toLocaleString('vi-VN')} đ
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UtilitiesStats;