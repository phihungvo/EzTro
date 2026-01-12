import React from 'react';
import { Card, Row, Col, Select, Input, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import classNames from 'classnames/bind';
import styles from './FilterBar.module.scss';

const { Option } = Select;
const cx = classNames.bind(styles);

function FilterBar({
                       boardingHouseFilter,
                       setBoardingHouseFilter,
                       buildingFilter,
                       setBuildingFilter,
                       statusFilter,
                       setStatusFilter,
                       searchText,
                       setSearchText,
                   }) {
    return (
        <Card className={cx('filter-card')}>
            <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={6}>
                    <Select
                        value={boardingHouseFilter}
                        onChange={setBoardingHouseFilter}
                        style={{ width: '100%' }}
                        placeholder="Khu trọ"
                    >
                        <Option value="ALL">Tất cả khu trọ</Option>
                        <Option value="Nhà trọ Sunshine">Nhà trọ Sunshine</Option>
                        <Option value="Nhà trọ Green Park">Nhà trọ Green Park</Option>
                        <Option value="Nhà trọ Sky View">Nhà trọ Sky View</Option>
                    </Select>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <Select
                        value={buildingFilter}
                        onChange={setBuildingFilter}
                        style={{ width: '100%' }}
                        placeholder="Toà nhà"
                    >
                        <Option value="ALL">Tất cả toà</Option>
                        <Option value="Toà A">Toà A</Option>
                        <Option value="Toà B">Toà B</Option>
                        <Option value="Toà C">Toà C</Option>
                    </Select>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        style={{ width: '100%' }}
                        placeholder="Trạng thái"
                    >
                        <Option value="ALL">Tất cả trạng thái</Option>
                        <Option value="RECORDED">Đã ghi</Option>
                        <Option value="PENDING">Chưa ghi</Option>
                    </Select>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <Space.Compact style={{ width: '100%' }}>
                        <Input
                            placeholder="Tìm phòng, người thuê..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                        <Button type="primary" icon={<SearchOutlined />} />
                    </Space.Compact>
                </Col>
            </Row>
        </Card>
    );
}

export default FilterBar;