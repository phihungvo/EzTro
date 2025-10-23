import React from "react";
import styles from "./ServiceCard.module.scss";

const ServiceCard = ({ icon, label, onClick }) => {
    return (
        <div className={styles.serviceCard} onClick={onClick}>
            <div className={styles.icon}>{icon}</div>
            <div className={styles.label}>{label}</div>
        </div>
    );
};

export default ServiceCard;