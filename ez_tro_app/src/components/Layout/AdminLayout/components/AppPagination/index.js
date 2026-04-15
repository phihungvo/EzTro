import { Pagination } from 'antd';
import styles from './AppPagination.module.scss';

/**
 * AppPagination
 *
 * Props:
 *  current          number   - trang hiện tại
 *  pageSize         number   - số item mỗi trang
 *  total            number   - tổng số item
 *  onChange         fn(page, pageSize) - callback khi đổi trang / page size
 *  showSizeChanger  bool     - hiện dropdown đổi pageSize (default: true)
 *  pageSizeOptions  string[] - các lựa chọn pageSize (default: ['10','20','30'])
 *  showTotal        fn(total, range) | bool - tùy chỉnh label tổng
 *                   - true  → dùng label mặc định "Tổng {total} bản ghi"
 *                   - false → ẩn label
 *                   - fn    → render custom
 *  className        string   - class ngoài để override nếu cần
 *  totalLabel       string   - label đơn vị khi dùng showTotal=true (default: "bản ghi")
 */
export default function AppPagination({
                                          current,
                                          pageSize,
                                          total,
                                          onChange,
                                          showSizeChanger = true,
                                          pageSizeOptions = ['10', '20', '30'],
                                          showTotal = true,
                                          totalLabel = 'bản ghi',
                                          className = '',
                                      }) {
    const resolveShowTotal =
        showTotal === false
            ? undefined
            : typeof showTotal === 'function'
                ? showTotal
                : (tot, range) => (
                    <span className={styles.totalLabel}>
              {range[0]}–{range[1]} / <b>{tot}</b> {totalLabel}
            </span>
                );

    return (
        <div className={`${styles.wrapper} ${className}`}>
            <Pagination
                current={current}
                pageSize={pageSize}
                total={total}
                onChange={onChange}
                onShowSizeChange={onChange}
                showSizeChanger={showSizeChanger}
                showTotal={resolveShowTotal}
                pageSizeOptions={pageSizeOptions}
                // Tắt hết style mặc định của Ant — ta tự style qua CSS module
                rootClassName={styles.pagination}
            />
        </div>
    );
}