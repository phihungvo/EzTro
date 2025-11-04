import React, { useState } from 'react';
import { Button, Card, Form } from 'antd';
import { PlusOutlined, ToolOutlined } from '@ant-design/icons';
import styles from './IncidentsCard.module.scss';
import IncidentItem from "~/components/Layout/UserLayout/components/IncidentItem";
import PopupModal from "~/components/Layout/AdminLayout/components/PopupModal";

const IncidentsCard = ({ incidents, onReportNew, onReportEdit, onReportDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [form] = Form.useForm();

    const handleCreateNew = () => {
        setModalMode('create');
        setSelectedIncident(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (incident) => {
        setModalMode('edit');
        setSelectedIncident(incident);
        form.setFieldsValue({
            title: incident.title,
            description: incident.description
        });
        setIsModalOpen(true);
    };

    const handleDelete = (incident) => {
        setModalMode('delete');
        setSelectedIncident(incident);
        setIsModalOpen(true);
    };

    const handleModalSubmit = async (values) => {
        try {
            if (modalMode === 'create') {
                await onReportNew(values);
            } else if (modalMode === 'edit') {
                await onReportEdit(selectedIncident.id, values);
            } else if (modalMode === 'delete') {
                await onReportDelete(selectedIncident.id);
            }
            setIsModalOpen(false);
            form.resetFields();
            setSelectedIncident(null);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const incidentModalFields = [
        {
            label: 'Tiêu đề',
            name: 'title',
            type: 'text',
            rules: [
                { required: true, message: 'Vui lòng nhập tiêu đề!' },
                { max: 200, message: 'Tiêu đề không được quá 200 ký tự!' }
            ],
            placeholder: 'Nhập tiêu đề sự cố...'
        },
        {
            label: 'Mô tả chi tiết',
            name: 'description',
            type: 'textarea',
            rules: [
                { required: true, message: 'Vui lòng nhập mô tả!' }
            ],
            placeholder: 'Mô tả chi tiết về sự cố...',
            rows: 4
        }
    ];

    const getModalTitle = () => {
        switch (modalMode) {
            case 'create':
                return 'Tạo Báo Cáo Sự Cố Mới';
            case 'edit':
                return 'Chỉnh Sửa Báo Cáo';
            case 'delete':
                return 'Xác Nhận Xóa Báo Cáo';
            default:
                return 'Báo Cáo Sự Cố';
        }
    };

    const getDeleteMessage = () => {
        if (!selectedIncident) return '';
        return (
            <div className={styles.deleteMessage}>
                <p>Bạn có chắc chắn muốn xóa báo cáo sự cố này?</p>
                <div className={styles.deleteDetails}>
                    <strong>{selectedIncident.title}</strong>
                    <span>Mã báo cáo: #{String(selectedIncident.id).padStart(4, '0')}</span>
                </div>
                <p className={styles.deleteWarning}>⚠️ Hành động này không thể hoàn tác!</p>
            </div>
        );
    };

    return (
        <>
            <Card
                title={
                    <div className={styles.cardTitle}>
                        <ToolOutlined className={styles.titleIcon} />
                        <span>Báo Cáo Sự Cố</span>
                        {incidents && incidents.length > 0 && (
                            <span className={styles.incidentCount}>({incidents.length})</span>
                        )}
                    </div>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreateNew}
                        className={styles.newReportBtn}
                    >
                        Báo Cáo Mới
                    </Button>
                }
                className={styles.incidentsCard}
            >
                <div className={styles.incidentsList}>
                    {incidents && incidents.length > 0 ? (
                        incidents.map((incident) => (
                            <IncidentItem
                                key={incident.id}
                                incident={incident}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🎉</div>
                            <div className={styles.emptyText}>
                                Không có sự cố nào được báo cáo
                            </div>
                            <div className={styles.emptySubtext}>
                                Nhấn "Báo Cáo Mới" để tạo báo cáo đầu tiên
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            <PopupModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                title={getModalTitle()}
                fields={modalMode === 'delete' ? [] : incidentModalFields}
                onSubmit={handleModalSubmit}
                initialValues={modalMode === 'edit' ? selectedIncident : {}}
                isDeleteMode={modalMode === 'delete'}
                deleteMessage={modalMode === 'delete' ? getDeleteMessage() : null}
                formInstance={form}
            />
        </>
    );
};

export default IncidentsCard;