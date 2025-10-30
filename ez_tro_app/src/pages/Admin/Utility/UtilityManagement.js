import React from 'react';
import CustomTabs from '~/components/Layout/AdminLayout/components/Tab';
import Utility from "~/pages/Admin/Utility/index";
import RoomUtility from "~/pages/Admin/RoomUtility";

function UtilityManagement() {
    const tabItems = [
        {
            key: '1',
            label: 'Dịch vụ nhà trọ',
            children: <Utility />,
        },
        {
            key: '2',
            label: 'Đăng ký dịch vụ',
            children: <RoomUtility />,
        },
    ];

    return (
        <div>
            <CustomTabs
                items={tabItems}
                defaultActiveKey="1"
                tabPosition="top"
                onChange={(key) => console.log('Tab changed:', key)}
            />
        </div>
    );
}

export default UtilityManagement;