import React from "react";
import styles from "./UserHeader.module.scss";

const UserHeader = ({ userInfo }) => {
    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <span className={styles.icon}>🏠</span>
                <h1 className={styles.title}>Portal Nhà Trọ</h1>
            </div>
        </header>
    );
};

export default UserHeader;