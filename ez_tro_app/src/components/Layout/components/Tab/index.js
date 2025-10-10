import React from 'react';
import { Tabs } from 'antd';

/**
 * Reusable Tabs Component
 * @param {Object} props - Props cho component
 * @param {Array} props.items - Danh sách tab { key, label, children }
 * @param {string} [props.defaultActiveKey] - Tab mặc định
 * @param {Function} [props.onChange] - Callback khi đổi tab
 * @param {string} [props.tabPosition] - Vị trí tab (top, left, right, bottom)
 * @param {boolean} [props.destroyInactiveTabPane] - Có unmount tab khi ẩn hay không
 */
export default function CustomTabs({
  items = [],
  defaultActiveKey = "1",
  onChange,
  tabPosition = "top",
  destroyInactiveTabPane = false,
  ...rest
}) {
  return (
    <Tabs
      items={items}
      defaultActiveKey={defaultActiveKey}
      onChange={onChange}
      tabPosition={tabPosition}
      destroyInactiveTabPane={destroyInactiveTabPane}
      {...rest}
    />
  );
}
