import React from 'react';
import { Space, Select, DatePicker, Input } from 'antd';
import { SearchOutlined, CloseCircleOutlined } from '@ant-design/icons';
import classNames from 'classnames/bind';
import styles from './FilterComponent.module.scss';

const cx = classNames.bind(styles);
const { RangePicker } = DatePicker;

const FilterComponent = ({
                             fields,
                             onReset,
                             className,
                             gridTemplate = '2.5fr 2.5fr 1fr 1fr 1fr auto',
                         }) => {
    const renderField = (field, index) => {
        switch (field.type) {
            case 'search':
                return (
                    <Input
                        key={field.name}
                        size="large"
                        placeholder={field.placeholder || 'Tìm kiếm...'}
                        prefix={<SearchOutlined />}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className={cx('search-input')}
                        style={{ width: '100%' }}
                    />
                );
            case 'dateRange':
                return (
                    <RangePicker
                        key={field.name}
                        size="large"
                        placeholder={field.placeholder || ['Từ ngày', 'Đến ngày']}
                        format={field.format || 'DD/MM/YYYY'}
                        onChange={field.onChange}
                        value={field.value}
                        className={cx('date-picker')}
                        style={{ width: '100%' }}
                        disabledDate={field.disabledDate}
                    />
                );
            case 'select':
                return (
                    <Select
                        key={field.name}
                        size="large"
                        placeholder={field.placeholder || 'Chọn...'}
                        value={field.value}
                        onChange={field.onChange}
                        className={cx(`${field.name}-select`)}
                        allowClear={field.allowClear}
                        options={field.options}
                        loading={field.loading}
                        disabled={field.disabled}
                        style={{ width: '100%' }}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className={cx('filter-section', className)}>
            <Space direction="vertical" size="middle" className={cx('filter-space')}>
                <div
                    className={cx('filter-inputs')}
                    style={{ gridTemplateColumns: gridTemplate }}
                >
                    {fields.map((field, index) => (
                        <div key={field.name || index} className={cx('filter-field')}>
                            {renderField(field, index)}
                        </div>
                    ))}
                    <button
                        onClick={onReset}
                        className={cx('reset-button')}
                        style={{ gridColumn: 'auto' }}
                    >
                        <CloseCircleOutlined /> Reset
                    </button>
                </div>
            </Space>
        </div>
    );
};

export default FilterComponent;