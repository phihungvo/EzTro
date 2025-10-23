import React from "react";
import { Card } from "antd";
import { FileProtectOutlined } from "@ant-design/icons";
import styles from "./ContractTerms.module.scss";

const ContractTerms = ({ terms }) => {
    return (
        <Card
            title={
                <>
                    <FileProtectOutlined style={{ marginRight: '8px' }} />
                    Điều Khoản Hợp Đồng
                </>
            }
            className={styles.contractTerms}
        >
            <div className={styles.termsList}>
                {terms.map((term, index) => (
                    <div key={index} className={styles.termItem}>
                        <div className={styles.termNumber}>{index + 1}.</div>
                        <div className={styles.termContent}>
                            <div className={styles.termTitle}>{term.title}</div>
                            <div className={styles.termDescription}>
                                {term.description}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default ContractTerms;