import React from "react";
import classNames from "classnames";
import styles from "./Toast.module.scss";

function AdminToast({ msg, type }) {
  const typeClass =
    type === "success" ? styles.success : type === "warn" ? styles.warn : styles.info;

  return <div className={classNames(styles.toast, typeClass)}>{msg}</div>;
}

export default AdminToast;

