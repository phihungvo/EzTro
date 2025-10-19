import React from "react";
import styles from "./UserLayout.module.scss";

const UserLayout = ({ children }) => {
    return (
        <div className={styles.userLayout}>
            {children}
        </div>
    );
};

export default UserLayout;
