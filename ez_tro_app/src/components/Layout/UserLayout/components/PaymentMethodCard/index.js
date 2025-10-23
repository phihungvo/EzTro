import React from "react";
import styles from "./PaymentMethodCard.module.scss";

const PaymentMethodCard = ({ icon, title, onClick }) => {
    return (
        <div className={styles.card} onClick={onClick}>
            <div className={styles.icon}>{icon}</div>
            <div className={styles.title}>{title}</div>
        </div>
    );
};

export default PaymentMethodCard;