import React, {useState, useEffect} from 'react';
import {Modal, List, Empty, Spin, message} from 'antd';
import {FileTextOutlined, EyeOutlined, DownloadOutlined, DeleteOutlined} from '@ant-design/icons';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import styles from './ContractFileListModal.module.scss';
import {getContractFiles, getPresignedUrl, deleteContractFile} from '~/service/admin/contract';

const ContractFileListModal = ({isOpen, onClose, contract}) => {
    const [fileList, setFileList] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(10);

    useEffect(() => {
        if (isOpen && contract?.id) {
            fetchFiles(currentPage);
        } else {
            setFileList([]);
        }
    }, [isOpen, contract?.id, currentPage]);

    const fetchFiles = async (page = 0) => {
        setLoadingFiles(true);
        setFileList([]);

        try {
            const params = {page, size: pageSize};
            const response = await getContractFiles(contract.id, params);

            if (response && response.content) {
                const formattedFiles = response.content.map(file => ({
                    id: file.id,
                    fileName: file.originalName,
                    fileSize: bytesToSize(file.size),
                    uploadedAt: file.uploadDate ? new Date(file.uploadDate).getTime() : null,
                }));
                setFileList(formattedFiles);

            } else {
                setFileList([]);
            }
        } catch (error) {
            message.error(`Lỗi khi tải danh sách file: ${error.message || 'Unknown error'}`);
            setFileList([]);
        } finally {
            setLoadingFiles(false);
        }
    };

    const bytesToSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleViewOrDownloadFile = async (file, action = 'view') => {
        try {
            const url = await getPresignedUrl(file.id, action);

            if (action === 'view') {
                window.open(url, '_blank', 'noopener,noreferrer');
                message.success(`Đang mở file: ${file.fileName}`);
            } else {
                const link = document.createElement('a');
                link.href = url;
                link.download = file.fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                message.success(`Đang tải xuống: ${file.fileName}`);
            }
        } catch (error) {
            message.error(`Lỗi khi ${action === 'view' ? 'mở' : 'tải xuống'} file: ${error.message}`);
        }
    };

    const handleDeleteFile = async (file) => {
        const {confirm} = Modal;
        confirm({
            title: 'Xác nhận xóa file',
            content: `Bạn có chắc chắn muốn xóa file "${file.fileName}"? Hành động này không thể hoàn tác.`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            icon: <DeleteOutlined style={{color: '#ff4d4f'}}/>,
            onOk: async () => {
                try {
                    await deleteContractFile(file.id);
                    message.success('Xóa file thành công');
                    fetchFiles(currentPage);
                } catch (error) {
                    message.error(`Lỗi khi xóa file: ${error.message}`);
                }
            },
        });
    };

    const renderFileActions = (file) => (
        <>
            <SmartButton
                type="primary"
                icon={<EyeOutlined/>}
                buttonWidth={40}
                onClick={() => handleViewOrDownloadFile(file, 'view')}
                style={{marginRight: 8}}
            />
            <SmartButton
                type="success"
                icon={<DownloadOutlined/>}
                buttonWidth={40}
                onClick={() => handleViewOrDownloadFile(file, 'download')}
                style={{marginRight: 8}}
            />
            <SmartButton
                type="danger"
                icon={<DeleteOutlined/>}
                buttonWidth={40}
                onClick={() => handleDeleteFile(file)}
            />
        </>
    );

    return (
        <Modal
            title={
                <div className={styles.modalTitle}>
                    <FileTextOutlined className={styles.titleIcon}/>
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
                    <Spin size="large"/>
                    <div className={styles.loadingText}>Đang tải danh sách file...</div>
                </div>
            ) : fileList.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <span style={{fontSize: '16px', color: '#8c8c8c'}}>
                            Chưa có file nào được tải lên cho hợp đồng này
                        </span>
                    }
                />
            ) : (
                <List
                    itemLayout="horizontal"
                    dataSource={fileList}
                    className={styles.fileList}
                    pagination={{
                        current: currentPage + 1,
                        pageSize,
                        total: fileList.length * (currentPage + 1),
                        onChange: (page) => setCurrentPage(page - 1),
                        showSizeChanger: false,
                    }}
                    renderItem={(file) => (
                        <List.Item
                            actions={[renderFileActions(file)]}
                            className={styles.fileItem}
                        >
                            <List.Item.Meta
                                avatar={
                                    <div className={styles.fileAvatar}>
                                        <FileTextOutlined className={styles.avatarIcon}/>
                                    </div>
                                }
                                title={
                                    <div className={styles.fileTitle}>
                                        {file.fileName || 'Unnamed file'}
                                    </div>
                                }
                                description={
                                    <div className={styles.fileDescription}>
                                        <span className={styles.fileSize}>
                                            {file.fileSize}
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