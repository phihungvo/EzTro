import React from "react";
import styles from "./OwnerLayout.module.scss";
import OwnerSidebar from "~/components/Layout/AdminLayout/components/Sidebar/OwnerSidebar";

const OwnerLayout = ({ children }) => {
    return (
        <div className={styles.layoutContainer}>
            <OwnerSidebar />
            <div className={styles.content}>{children}</div>
        </div>
    );
};

export default OwnerLayout;
