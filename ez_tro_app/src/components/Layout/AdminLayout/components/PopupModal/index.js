import React, {useState, useEffect} from 'react';
import TextField from '../TextField';
import PasswordField from '../PasswordField';
import DateField from '../DateField';
import DateRange from '../DateRange';
import TimeField from '../TimeField';
import InputNumberField from '../InputNumberField';
import SelectField from '../SelectField';
import CalendarField from '../CalendarField';
import TextAreaField from '../TextAreaField';
import UploadField from '../UploadField';
import CheckboxGroup from '../CheckboxGroup';
import Checkbox from '../Checkbox';
import RadioGroup from '../RadioGroup';
import {Button, Col, Form, message, Modal, Row} from 'antd';

function PopupModal({
                        isModalOpen,
                        setIsModalOpen,
                        title,
                        fields = [],
                        dataSources = {},
                        onSubmit,
                        initialValues,
                        isDeleteMode,
                        formInstance,
                        footer,
                        width = 700,
                        onBeforeSubmit,
                        deleteMessage,
                        deleteConfirmLabel = 'Xóa',
                        cancelLabel = 'Hủy',
                        submitLabel = 'Xác nhận',
                    }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [processedFields, setProcessedFields] = useState([]);
    const form = formInstance;

    useEffect(() => {
        if (!fields || fields.length === 0) return;

        const updatedFields = fields.map((field) => {
            const updatedField = {...field};

            // Gán fullWidth: true cho textarea để luôn chiếm toàn bộ hàng
            if (field.type === 'textarea') {
                updatedField.fullWidth = true;
            }

            if (field.dataSourceKey && dataSources[field.dataSourceKey]) {
                const dataSource = dataSources[field.dataSourceKey];

                if (Array.isArray(dataSource)) {
                    updatedField.options = dataSource.map((item) => {
                        if (typeof item === 'object') {
                            return {
                                label:
                                    item[field.labelKey || 'name'] ||
                                    item[field.labelKey || 'title'] ||
                                    `Item ${item[field.valueKey || 'id']}`,
                                value: item[field.valueKey || 'id'],
                                data: item,
                            };
                        }
                        return {
                            label: item,
                            value: item,
                        };
                    });
                } else if (
                    typeof dataSource === 'object' &&
                    !Array.isArray(dataSource)
                ) {
                    updatedField.options = Object.keys(dataSource).map(
                        (key) => ({
                            label: dataSource[key],
                            value: key,
                        }),
                    );
                }
            }

            if (field.type === 'yesno' || field.type === 'boolean') {
                updatedField.type = 'select';
                updatedField.options = field.options || ['Yes', 'No'];
            }

            // Đảm bảo readOnly hoặc disabled được truyền vào
            updatedField.readOnly = field.readOnly || false;
            updatedField.disabled = field.disabled || false;

            return updatedField;
        });

        setProcessedFields(updatedFields);
    }, [fields, dataSources]);

    if (isDeleteMode) {
        const targetName =
            initialValues?.name ||
            initialValues?.title ||
            initialValues?.boardingHouseName ||
            initialValues?.roomNumber ||
            initialValues?.username;

        return (
            <Modal
                title={title}
                centered
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={
                    footer || [
                        <Button
                            key="cancel"
                            onClick={() => setIsModalOpen(false)}
                        >
                            {cancelLabel}
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            danger
                            loading={isSubmitting}
                            onClick={async () => {
                                try {
                                    setIsSubmitting(true);
                                    await onSubmit(initialValues);
                                    setIsModalOpen(false);
                                } catch (error) {
                                    message.error(error || 'Xóa thất bại. Vui lòng thử lại.');
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                        >
                            {deleteConfirmLabel}
                        </Button>,
                    ]
                }
            >
                {deleteMessage || (
                    <>
                        {targetName && (
                            <p>
                                Bạn có chắc chắn muốn xóa{' '}
                                <b>
                                    <i>{targetName}</i>
                                </b>{' '}
                                ?
                            </p>
                        )}
                        <p>Hành động này không thể hoàn tác.</p>
                    </>
                )}
            </Modal>
        );
    }

    const handleOk = async () => {
        try {
            setIsSubmitting(true);

            const values = await form.validateFields();

            const finalValues = onBeforeSubmit
                ? await onBeforeSubmit(values)
                : values;

            await onSubmit(finalValues);

            setIsModalOpen(false);
        } catch (error) {
            if (error?.errorFields) {
                message.error('Vui lòng kiểm tra lại thông tin nhập liệu');
            } else {
                message.error(error || 'Có lỗi xảy ra. Vui lòng thử lại.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = (field) => {
        // Truyền readOnly và disabled vào các component con
        switch (field.type) {
            case 'text':
                return <TextField field={field}/>;
            case 'password':
                return <PasswordField field={field}/>;
            case 'date':
                return <DateField field={field}/>;
            case 'daterange':
                return <DateRange field={field}/>;
            case 'time':
                return <TimeField field={field}/>;
            case 'number':
                return <InputNumberField field={field}/>;
            case 'select':
                return <SelectField field={field}/>;
            case 'cascader':
                return <CalendarField field={field}/>;
            case 'textarea':
                return <TextAreaField field={field}/>;
            case 'upload':
                return <UploadField field={field}/>;
            case 'checkbox':
                return <Checkbox field={field}/>;
            case 'checkbox-group':
                return <CheckboxGroup field={field}/>;
            case 'radio':
                return <RadioGroup field={field}/>;
            default:
                return null;
        }
    };

    const groupedFields = [];
    if (processedFields && processedFields.length > 0) {
        let row = [];

        processedFields.forEach((field) => {
            if (field.fullWidth) {
                if (row.length > 0) {
                    groupedFields.push([...row]);
                    row = [];
                }
                groupedFields.push([field]);
            } else {
                row.push(field);
                if (row.length === 2) {
                    groupedFields.push([...row]);
                    row = [];
                }
            }
        });

        if (row.length > 0) {
            groupedFields.push([...row]);
        }
    }

    return (
        <Modal
            title={title}
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            width={width}
            centered={true}
            destroyOnClose={true}
            maskClosable={false}
            footer={
                footer || [
                    <Button key="cancel" onClick={() => setIsModalOpen(false)}>
                        {cancelLabel}
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={handleOk}
                        loading={isSubmitting}
                    >
                        {submitLabel}
                    </Button>,
                ]
            }
        >
            <Form
                form={form}
                layout="vertical"
                requiredMark={true}
                validateMessages={{
                    required: ['$', '{label} là trường bắt buộc!'].join(''),
                    types: {
                        email: ['$', '{label} không phải là email hợp lệ!'].join(''),
                        number: ['$', '{label} không phải là số hợp lệ!'].join(''),
                    },
                    number: {
                        range: ['$', '{label} phải nằm trong khoảng $', '{min} đến $', '{max}'].join(''),
                    },
                }}
            >
                {groupedFields.map((row, rowIndex) => (
                    <Row key={rowIndex} gutter={[16, 0]}>
                        {row.map((field, fieldIndex) => {
                            const isFullWidth =
                                row.length === 1 || field.fullWidth;
                            return (
                                <Col
                                    span={isFullWidth ? 24 : 12}
                                    key={
                                        field.name ||
                                        `field-${rowIndex}-${fieldIndex}`
                                    }
                                >
                                    {renderField(field)}
                                </Col>
                            );
                        })}
                    </Row>
                ))}
            </Form>
        </Modal>
    );
}

export default PopupModal;
