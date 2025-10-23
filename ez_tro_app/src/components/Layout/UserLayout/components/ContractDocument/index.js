import React from "react";
import { Card, Button } from "antd";
import { FileTextOutlined, DownloadOutlined } from "@ant-design/icons";
import styles from "./ContractDocument.module.scss";

const ContractDocument = ({ fileName, onDownload }) => {
    return (
        <Card
            title={
                <>
                    <FileTextOutlined style={{ marginRight: '8px' }} />
                    Tài Liệu Hợp Đồng
                </>
            }
            className={styles.contractDocument}
        >
            <div className={styles.documentPreview}>
                <div className={styles.fileIcon}>📄</div>
                <div className={styles.fileName}>{fileName}</div>
                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={onDownload}
                >
                    Tải Xuống
                </Button>
            </div>
        </Card>
    );
};

export default ContractDocument;