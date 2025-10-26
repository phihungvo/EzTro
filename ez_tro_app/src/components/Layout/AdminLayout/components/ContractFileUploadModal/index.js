import React, {useState} from 'react';
import {Modal, Upload, message} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import {uploadContractFile} from '~/service/admin/contract';

const ContractFileUploadModal = ({
                                     isOpen,
                                     onClose,
                                     contractId,
                                     onSuccess,
                                     onError,
                                     tenantName = 'N/A',
                                 }) => {
    const [fileList, setFileList] = useState([]);

    const handleFileChange = ({fileList: newFileList}) => {
        setFileList(newFileList.slice(0, 1)); // Giới hạn 1 file
    };

    const handleUpload = async () => {
        if (fileList.length === 0 || !contractId) {
            message.warning('Vui lòng chọn file và hợp đồng hợp lệ');
            return;
        }
        const fileItem = fileList[0];
        const file = fileItem.originFileObj;
        if (!file || !file.name || file.size === 0) {
            message.error('File không hợp lệ, vui lòng chọn lại');
            return;
        }


        try {
            await uploadContractFile(file, contractId);
            message.success('Upload file hợp đồng thành công');
            setFileList([]);
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Upload error:', error); // Log debug
            const errorMsg = error.response?.data?.message || error.message;
            message.error(`Lỗi khi upload file: ${errorMsg}`);
            onError?.(error);
        }
    };

    const uploadProps = {
        fileList,
        onChange: handleFileChange,
        beforeUpload: () => false,
        accept: '.pdf,.doc,.docx',
        maxCount: 1,
    };

    return (
        <Modal
            title={`Upload file cho hợp đồng: ${tenantName}`}
            open={isOpen}
            onCancel={onClose}
            footer={[
                <SmartButton key="cancel" onClick={onClose}>
                    Hủy
                </SmartButton>,
                <SmartButton key="upload" type="primary" onClick={handleUpload}>
                    Upload
                </SmartButton>,
            ]}
            width={500}
        >
            <Upload {...uploadProps}>
                <SmartButton icon={<UploadOutlined/>}>
                    Chọn file hợp đồng
                </SmartButton>
            </Upload>
            {fileList.length > 0 && (
                <div style={{marginTop: 16}}>
                    <p><strong>File đã chọn:</strong> {fileList[0].name} ({(fileList[0].size / 1024).toFixed(2)} KB)</p>
                </div>
            )}
        </Modal>
    );
};

export default ContractFileUploadModal;