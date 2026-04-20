import React from "react";
import {Button} from "antd";
import {DownloadOutlined, FileTextOutlined} from "@ant-design/icons";
import styles from "./ContractDocument.module.scss";

const ContractDocument = ({fileName, onDownload}) => {
    return (
        <section className={styles.contractDocument}>
            <div className={styles.header}>
                <div>
                    <div className={styles.title}>
                        <FileTextOutlined className={styles.titleIcon} />
                        Tài liệu hợp đồng
                    </div>
                    <div className={styles.subTitle}>Tải xuống bản PDF để lưu trữ hoặc in ấn</div>
                </div>
                <div className={styles.badge}>PDF</div>
            </div>

            <div className={styles.documentPreview}>
                <div className={styles.fileCard}>
                    <div className={styles.fileIcon}>📄</div>
                    <div className={styles.fileMeta}>
                        <div className={styles.fileName}>{fileName}</div>
                        <div className={styles.fileHint}>Bản sao hợp đồng, sẵn sàng tải về khi cần.</div>
                    </div>
                </div>

                <div className={styles.actionRow}>
                    <Button type="primary" icon={<DownloadOutlined />} onClick={onDownload}>
                        Tải xuống
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default ContractDocument;
