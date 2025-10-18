import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from '~/pages/Admin/User/User.module.scss';
import moment from 'moment';
import SmartTable from '~/components/Layout/components/SmartTable';
import {
    SearchOutlined,
    PlusOutlined,
    FilterOutlined,
    CloudUploadOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import SmartInput from '~/components/Layout/components/SmartInput';
import SmartButton from '~/components/Layout/components/SmartButton';
import PopupModal from '~/components/Layout/components/PopupModal';
import { Form, message, Tag } from 'antd';
import { getAllUser, createUser, updateUser, deleteUser } from '~/service/admin/user';
import { getAllRolesNoPaging } from '~/service/admin/role';
import { exportExcelFile } from '~/service/admin/export_service';

const cx = classNames.bind(styles);

function UserList() {
    const [userSource, setUserSource] = useState([]);
    const [roleOptions, setRoleOptions] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [modalMode, setModalMode] = useState('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [form] = Form.useForm();
    const [dynamicColumns, setDynamicColumns] = useState([]);

    const baseColumns = [
        {
            title: 'User Name',
            dataIndex: 'userName',
            key: 'userName',
            width: 150,
            fixed: 'left',
            align: 'center',
            onFilter: (value, record) => record.userName.toLowerCase().startsWith(value.toLowerCase()),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 200,
            align: 'center',
            onFilter: (value, record) => record.email.toLowerCase().startsWith(value.toLowerCase()),
        },
        {
            title: 'Role',
            dataIndex: 'roleNames',
            key: 'roleNames',
            width: 250,
            align: 'center',
            render: (roleNames) =>
                Array.isArray(roleNames) && roleNames.length > 0
                    ? roleNames.map((role, idx) => (
                        <Tag
                            key={idx}
                            color="blue"
                            style={{
                                marginRight: 4,
                                marginBottom: 2,
                                minWidth: 80,
                                display: 'inline-block',
                                textAlign: 'center',
                            }}
                        >
                            {role}
                        </Tag>
                    ))
                    : 'N/A',
            onFilter: (value, record) => record.roleNames.toLowerCase().includes(value.toLowerCase()),
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            width: 250,
            align: 'center',
            render: (add) => (add ? add : 'Viet Nam'),
        },
        {
            title: 'Phone Number',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            width: 150,
            align: 'center',
            render: (phone) => (phone ? phone : 'N/A'),
        },
        {
            title: 'Enable',
            dataIndex: 'enabled',
            key: 'enabled',
            width: 50,
            render: (enabled) => {
                const icon = enabled ? '✔️' : '❌';
                const color = enabled ? 'green' : 'red';
                return <Tag color={color}>{icon}</Tag>;
            },
            onFilter: (value, record) => record.enabled === value,
        },
        {
            title: 'Create At',
            dataIndex: 'createAt',
            key: 'createAt',
            width: 150,
            render: (date) => (date ? new Date(date).toLocaleString('vi-VN') : 'N/A'),
        },
        {
            title: 'Update At',
            dataIndex: 'updateAt',
            key: 'updateAt',
            width: 150,
            render: (date) => (date ? new Date(date).toLocaleString('vi-VN') : 'N/A'),
        },
        {
            title: 'Actions',
            fixed: 'right',
            width: 130,
            render: (_, record) => (
                <>
                    <SmartButton
                        type="primary"
                        icon={<EditOutlined />}
                        buttonWidth={50}
                        onClick={() => handleEditUser(record)}
                    />
                    <SmartButton
                        type="danger"
                        icon={<DeleteOutlined />}
                        buttonWidth={50}
                        onClick={() => handleDeleteUser(record)}
                        style={{ marginLeft: '8px' }}
                    />
                </>
            ),
        },
    ];

    useEffect(() => {
        const userNameFilters = [...new Set(userSource.map((user) => user.username))].map((value) => ({
            text: value,
            value,
        }));
        const emailFilters = [...new Set(userSource.map((user) => user.email))].map((value) => ({
            text: value,
            value,
        }));
        const roleFilters = [...new Set(userSource.map((user) => user.roleNames))].map((value) => ({
            text: value,
            value,
        }));

        setDynamicColumns([
            { ...baseColumns[0], filters: userNameFilters },
            { ...baseColumns[1], filters: emailFilters },
            { ...baseColumns[2], filters: roleFilters },
            ...baseColumns.slice(3),
        ]);
    }, [userSource]);

    const createUserModalFields = [
        {
            label: 'User Name',
            name: 'userName',
            type: 'text',
            rules: [{ required: true, message: 'User Name is required!' }],
        },
        {
            label: 'First Name',
            name: 'firstName',
            type: 'text',
        },
        {
            label: 'Last Name',
            name: 'lastName',
            type: 'text',
        },
        {
            label: 'Email',
            name: 'email',
            type: 'text',
            disabled: modalMode === 'edit',
            rules: modalMode === 'create' ? [{ required: true, message: 'Email is required!' }] : [],
        },
        {
            label: 'Address',
            name: 'address',
            type: 'text',
        },
        {
            label: 'Password',
            name: 'password',
            type: 'text',
            rules: [{ required: true, message: 'Password is required!' }],
        },
        {
            label: 'Phone Number',
            name: 'phoneNumber',
            type: 'text',
        },
        {
            label: 'Profile Picture',
            name: 'profilePicture',
            type: 'text',
        },
        {
            label: 'Role',
            name: 'roleIds',
            type: 'select',
            multiple: true,
            options: roleOptions,
        },
        {
            label: 'Enable',
            name: 'enabled',
            type: 'yesno',
        },
    ];

    const editUserModalFields = createUserModalFields.filter(field => field.name !== 'password');

    const handleGetAllUsers = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await getAllUser({ page: page - 1, pageSize });
            const userList = response.content;

            if (response && Array.isArray(userList)) {
                const transformedUsers = userList.map((user) => ({
                    ...user,
                    keyDisplay: user.key,
                }));

                setUserSource(transformedUsers);
                setPagination((prev) => ({
                    ...prev,
                    current: page,
                    pageSize: pageSize,
                    total: response.totalElements,
                }));
            } else {
                console.error('Invalid data users: ', response);
                setUserSource([]);
            }
        } catch (error) {
            console.error('Error fetching user', error);
            setUserSource([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchRolesOptions = async () => {
        try {
            const rolesResponse = await getAllRolesNoPaging();
            if (rolesResponse && Array.isArray(rolesResponse)) {
                const roles = rolesResponse.map((role) => ({
                    label: role.name,
                    value: role.id,
                }));
                setRoleOptions(roles);
            }
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    };

    const handleAddUser = () => {
        setModalMode('create');
        setSelectedUser(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallCreateUser = async (formData) => {
        try {
            await createUser(formData);
            message.success('Tạo người dùng thành công!');
            handleGetAllUsers();
        } catch (error) {
            message.error(`Lỗi khi tạo người dùng: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleEditUser = (record) => {
        setSelectedUser(record);
        setModalMode('edit');
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleCallUpdateUser = async (formData) => {
        try {
            await updateUser(selectedUser.id, formData);
            // message.success('Cập nhật người dùng thành công!');
            handleGetAllUsers();
            setIsModalOpen(false);
        } catch (error) {
            message.error(`Lỗi khi cập nhật người dùng: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteUser = (record) => {
        setModalMode('delete');
        setSelectedRowKeys([record.id]);
        setSelectedRows([record]); // Lưu dòng được chọn để xử lý xóa
        setIsModalOpen(true);
    };

    const handleExportFile = async () => {
        try {
            const response = await exportExcelFile('user');
            if (
                !response.headers['content-type'].includes(
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                )
            ) {
                throw new Error('Định dạng file không hợp lệ');
            }
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `user_${new Date().toISOString().replace(/[-:]/g, '')}.xlsx`);
            link.click();
            window.URL.revokeObjectURL(url);
            message.success('Tải file Excel thành công!');
        } catch (error) {
            console.error('Lỗi khi xuất file Excel:', error);
            message.error('Không thể tải file Excel');
        }
    };

    const handleCallDeleteUser = async () => {
        try {
            await deleteUser(selectedRowKeys);
            message.success('Xóa người dùng thành công!');
            handleGetAllUsers();
            setIsModalOpen(false);
            setSelectedRowKeys([]); // Xóa các dòng đã chọn
            setSelectedRows([]); // Xóa các dòng đã chọn
        } catch (error) {
            message.error(`Lỗi khi xóa người dùng: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleSelectChange = (newSelectedRowKeys, newSelectedRows) => {
        setSelectedRowKeys(newSelectedRowKeys);
        setSelectedRows(newSelectedRows); // Lưu các dòng được chọn
    };

    useEffect(() => {
        fetchRolesOptions();
        handleGetAllUsers();
    }, []);

    const handleFormSubmit = (formData) => {
        if (modalMode === 'create') {
            handleCallCreateUser(formData);
        } else if (modalMode === 'edit') {
            handleCallUpdateUser(formData);
        } else if (modalMode === 'delete') {
            handleCallDeleteUser();
        }
    };

    const handleTableChange = (pagination, filters, sorter) => {
        handleGetAllUsers(pagination.current, pagination.pageSize);
    };

    const getModalTitle = () => {
        switch (modalMode) {
            case 'create':
                return 'Thêm Người Dùng Mới';
            case 'edit':
                return 'Chỉnh Sửa Người Dùng';
            case 'delete':
                return 'Xóa Người Dùng';
            default:
                return 'Chi Tiết Người Dùng';
        }
    };

    return (
        <div className={cx('trailer-wrapper')}>
            <div className={cx('sub_header')}>
                <SmartInput size="large" placeholder="Tìm kiếm" icon={<SearchOutlined />} />
                <div className={cx('features')}>
                    <SmartButton title="Thêm mới" icon={<PlusOutlined />} type="primary" onClick={handleAddUser} />
                    <SmartButton title="Bộ lọc" icon={<FilterOutlined />} />
                    <SmartButton title="Excel" icon={<CloudUploadOutlined />} onClick={handleExportFile} />
                </div>
            </div>
            <div className={cx('trailer-container')}>
                <SmartTable
                    columns={dynamicColumns}
                    dataSources={userSource}
                    loading={loading}
                    pagination={pagination}
                    onTableChange={handleTableChange}
                    selectedRowKeys={selectedRowKeys}
                    onSelectChange={handleSelectChange}
                />
            </div>

            <PopupModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                title={getModalTitle()}
                fields={modalMode === 'create' ? createUserModalFields : editUserModalFields}
                onSubmit={handleFormSubmit}
                initialValues={selectedUser}
                isDeleteMode={modalMode === 'delete'}
                formInstance={form}
            />
        </div>
    );
}

export default UserList;