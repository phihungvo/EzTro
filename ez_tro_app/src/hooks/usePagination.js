import { useState, useCallback } from 'react';

/**
 * usePagination
 *
 * Hook quản lý state phân trang.
 * Trả về object { pagination, handleChange, reset, setTotal }
 *
 * Params:
 *  initialPage      number   - trang khởi đầu (default: 1)
 *  initialPageSize  number   - pageSize khởi đầu (default: 10)
 *  initialTotal     number   - tổng số bản ghi ban đầu (default: 0)
 *
 * Usage:
 *   const { pagination, handleChange, setTotal } = usePagination({ initialPageSize: 20 });
 *
 *   // Sau khi fetch data:
 *   useEffect(() => { setTotal(apiResponse.total); }, [apiResponse]);
 *
 *   <AppPagination
 *     current={pagination.current}
 *     pageSize={pagination.pageSize}
 *     total={pagination.total}
 *     onChange={handleChange}
 *   />
 */
export default function usePagination({
                                          initialPage     = 1,
                                          initialPageSize = 10,
                                          initialTotal    = 0,
                                      } = {}) {
    const [current,  setCurrent]  = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [total,    setTotal]    = useState(initialTotal);

    /**
     * Gọi khi Ant Pagination bắn onChange / onShowSizeChange.
     * Ant gọi cả 2 event với signature (page, size).
     */
    const handleChange = useCallback((page, size) => {
        // Nếu pageSize thay đổi → reset về trang 1
        if (size !== pageSize) {
            setPageSize(size);
            setCurrent(1);
        } else {
            setCurrent(page);
        }
    }, [pageSize]);

    /** Reset về trang 1, giữ nguyên pageSize */
    const reset = useCallback(() => setCurrent(1), []);

    /** Dùng sau khi có response từ API */
    const updateTotal = useCallback((newTotal) => setTotal(newTotal), []);

    return {
        pagination: { current, pageSize, total },
        handleChange,
        reset,
        setTotal: updateTotal,
    };
}