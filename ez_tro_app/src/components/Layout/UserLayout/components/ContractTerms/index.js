import React from "react";
import {FileProtectOutlined} from "@ant-design/icons";
import styles from "./ContractTerms.module.scss";

const ContractTerms = ({terms = []}) => {
    return (
        <section className={styles.contractTerms}>
            <div className={styles.header}>
                <div>
                    <div className={styles.title}>
                        <FileProtectOutlined className={styles.titleIcon} />
                        Điều khoản hợp đồng
                    </div>
                    <div className={styles.subTitle}>Các mục cần lưu ý trong quá trình thuê</div>
                </div>
                <div className={styles.badge}>{terms.length} mục</div>
            </div>

            {terms.length ? (
                <div className={styles.termsList}>
                    {terms.map((term, index) => (
                        <div key={index} className={styles.termItem}>
                            <div className={styles.termNumber}>{index + 1}</div>
                            <div className={styles.termContent}>
                                <div className={styles.termTitle}>{term.title}</div>
                                <div className={styles.termDescription}>{term.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>Chưa có điều khoản nào được cấu hình.</div>
            )}
        </section>
    );
};

export default ContractTerms;
