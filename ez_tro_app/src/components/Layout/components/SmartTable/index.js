import React from 'react';
import {Table as AntTable} from 'antd';
import classNames from 'classnames/bind';
import styles from './SmartTable.module.scss';

const cx = classNames.bind(styles);

/**
 * Component SmartTable
 * Đây là một wrapper cho AntTable của Ant Design, cung cấp giao diện bảng tùy chỉnh
 * với các tính năng như phân trang, chọn dòng, và cuộn ngang.
 *
 * @param {Object} props - Các thuộc tính truyền vào component
 * @param {Array} columns - Danh sách cột của bảng (mỗi cột chứa title, dataIndex, v.v.)
 * @param {Array} dataSources - Dữ liệu nguồn của bảng (mảng các object)
 * @param {boolean} loading - Trạng thái loading của bảng
 * @param {Object} pagination - Cấu hình phân trang (current, pageSize, total)
 * @param {Function} onTableChange - Hàm xử lý khi bảng thay đổi (phân trang, lọc, sắp xếp)
 * @param {Array} selectedRowKeys - Danh sách key của các dòng được chọn
 * @param {Function} onSelectChange - Hàm xử lý khi trạng thái chọn dòng thay đổi
 */
function SmartTable({
                        columns,
                        dataSources,
                        loading,
                        pagination,
                        onTableChange,
                        selectedRowKeys = [],
                        onSelectChange,
                    }) {

    const rowSelection = onSelectChange
        ? {
            selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                onSelectChange(selectedRowKeys, selectedRows);
            },
            getCheckboxProps: (record) => ({
                disabled: record.disabled,
                name: record.name || record.username,
            }),
        }
        : undefined; // Nếu không có onSelectChange, vô hiệu hóa tính năng chọn dòng

    return (
        <div className={cx('table-container')}>
            <AntTable
                bordered
                rowClassName={() => cx('fixed-row-height')}
                className={styles.customTable}
                columns={columns}
                dataSource={dataSources}
                loading={loading}
                rowKey="id"
                size="small"
                rowSelection={rowSelection}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50'],
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} bản ghi`,
                }}
                onChange={onTableChange}
                scroll={{x: 'max-content'}}
            />
        </div>
    );
}

export default SmartTable;