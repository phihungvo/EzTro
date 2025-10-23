import React from "react";
import styles from "./StatsGrid.module.scss";
import StatCard from "~/components/Layout/UserLayout/components/StatCard";

const StatsGrid = ({ stats }) => {
    return (
        <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
};

export default StatsGrid;