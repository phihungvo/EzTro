import React from 'react';
import { Modal } from 'antd';

export function DeleteConfirmModal({ isVisible, onConfirm, onCancel }) {
    return (
        <Modal
            title="Xác nhận xóa"
            open={isVisible}
            onOk={onConfirm}
            onCancel={onCancel}
            okText="Xóa"
            cancelText="Hủy"
        >
            <p>Bạn có chắc chắn muốn xóa bình luận này không?</p>
        </Modal>
    );
}
