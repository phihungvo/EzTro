import React, { useState, useEffect } from 'react';
import { Modal, List, Empty, Spin, message } from 'antd';
import { FileTextOutlined, EyeOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import styles from './ContractFileListModal.module.scss';
// import { getContractFiles, deleteContractFile } from '~/service/admin/contract';

const ContractFileListModal = ({ isOpen, onClose, contract }) => {
    const [fileList, setFileList] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState(false);

    const mockFiles = [
        {
            id: 1,
            fileName: 'hop-dong-thue-nha.pdf',
            fileSize: '2.4 MB',
            fileUrl: 'https://example.com/file1.pdf',
            uploadedAt: 1735664400000,
        },
        {
            id: 2,
            fileName: 'phu-luc-01.pdf',
            fileSize: '1.2 MB',
            fileUrl: 'https://example.com/file2.pdf',
            uploadedAt: 1735750800000,
        },
        {
            id: 3,
            fileName: 'chung-minh-nhan-dan.jpg',
            fileSize: '850 KB',
            fileUrl: 'https://example.com/file3.jpg',
            uploadedAt: 1735837200000,
        },
    ];

    useEffect(() => {
        if (isOpen) {
            fetchFiles();
        }
    }, [isOpen]);

    const fetchFiles = async () => {
        setLoadingFiles(true);
        setFileList([]);

        try {
            // const response = await getContractFiles(contract.id);
            await new Promise(resolve => setTimeout(resolve, 1000));
            const response = mockFiles;

            if (response && Array.isArray(response)) {
                setFileList(response);
            } else if (response && Array.isArray(response.data)) {
                setFileList(response.data);
            } else if (response && Array.isArray(response.content)) {
                setFileList(response.content);
            } else {
                setFileList([]);
            }
        } catch (error) {
            message.error(`Lỗi khi tải danh sách file: ${error.response?.data?.message || error.message}`);
            setFileList([]);
        } finally {
            setLoadingFiles(false);
        }
    };

    const handleViewOrDownloadFile = async (file, action = 'view') => {
        try {
            if (action === 'view') {
                message.success(`Đang mở file: ${file.fileName}`);
                // ✅ TODO: Implement xem file
                // window.open(file.fileUrl, '_blank');
            } else {
                message.success(`Đang tải xuống: ${file.fileName}`);
                // ✅ TODO: Implement download
                // const link = document.createElement('a');
                // link.href = file.fileUrl;
                // link.download = file.fileName;
                // link.click();
            }
            console.log(`${action === 'view' ? 'View' : 'Download'} file:`, file);
        } catch (error) {
            message.error(`Lỗi khi ${action === 'view' ? 'mở' : 'tải xuống'} file: ${error.message}`);
        }
    };

    const handleDeleteFile = async (file) => {
        const { confirm } = Modal;
        confirm({
            title: 'Xác nhận xóa file',
            content: `Bạn có chắc chắn muốn xóa file "${file.fileName}"? Hành động này không thể hoàn tác.`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
            onOk: async () => {
                try {
                    // ✅ TODO: Implement xóa file
                    // await deleteContractFile(file.id);
                    message.success('Xóa file thành công');
                    fetchFiles(); // Refresh danh sách
                } catch (error) {
                    message.error(`Lỗi khi xóa file: ${error.response?.data?.message || error.message}`);
                }
            },
        });
    };

    const renderFileActions = (file) => (
        <>
            <SmartButton
                type="primary"
                icon={<EyeOutlined />}
                buttonWidth={40}
                onClick={() => handleViewOrDownloadFile(file, 'view')}
                style={{ marginRight: 8 }}
            />
            <SmartButton
                type="success"
                icon={<DownloadOutlined />}
                buttonWidth={40}
                onClick={() => handleViewOrDownloadFile(file, 'download')}
                style={{ marginRight: 8 }}
            />
            <SmartButton
                type="danger"
                icon={<DeleteOutlined />}
                buttonWidth={40}
                onClick={() => handleDeleteFile(file)}
            />
        </>
    );

    return (
        <Modal
            title={
                <div className={styles.modalTitle}>
                    <FileTextOutlined className={styles.titleIcon} />
                    <div className={styles.titleContent}>
                        <div className={styles.titleMain}>Danh sách file hợp đồng</div>
                        <div className={styles.titleSub}>
                            {contract?.tenantFullName || 'N/A'} - Phòng {contract?.roomNumber || 'N/A'}
                        </div>
                    </div>
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={800}
            centered
            className={styles.fileListModal}
            destroyOnClose
        >
            {loadingFiles ? (
                <div className={styles.loadingContainer}>
                    <Spin size="large" />
                    <div className={styles.loadingText}>Đang tải danh sách file...</div>
                </div>
            ) : fileList.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <span style={{ fontSize: '16px', color: '#8c8c8c' }}>
                            Chưa có file nào được tải lên cho hợp đồng này
                        </span>
                    }
                />
            ) : (
                <List
                    itemLayout="horizontal"
                    dataSource={fileList}
                    className={styles.fileList}
                    renderItem={(file) => (
                        <List.Item
                            actions={[renderFileActions(file)]}
                            className={styles.fileItem}
                        >
                            <List.Item.Meta
                                avatar={
                                    <div className={styles.fileAvatar}>
                                        <FileTextOutlined className={styles.avatarIcon} />
                                    </div>
                                }
                                title={
                                    <div className={styles.fileTitle}>
                                        {file.fileName || file.name || 'Unnamed file'}
                                    </div>
                                }
                                description={
                                    <div className={styles.fileDescription}>
                                        <span className={styles.fileSize}>
                                            {file.fileSize || file.size || 'N/A'}
                                        </span>
                                        <span className={styles.separator}>•</span>
                                        <span className={styles.uploadDate}>
                                            Tải lên: {file.uploadedAt ? new Date(file.uploadedAt).toLocaleString('vi-VN') : 'N/A'}
                                        </span>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            )}
        </Modal>
    );
};

export default ContractFileListModal;