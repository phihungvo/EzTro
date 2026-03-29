export const extractApiErrorMessage = (error, fallback = "Có lỗi xảy ra") =>
    error?.response?.data?.message || error?.message || fallback;

export const extractApiErrorCode = (error) => error?.response?.data?.code || null;

export const getBillingUiErrorMessage = (error, fallback) => {
    const code = extractApiErrorCode(error);
    switch (code) {
        case 1128:
            return "Thiếu chỉ số công tơ trong kỳ. Hãy nhập đủ chỉ số trước khi xem trước hoặc phát hành hoá đơn.";
        case 1135:
            return "Tổng tiền hoá đơn đang lệch với các dòng chi tiết. Vui lòng tải lại preview và kiểm tra lại dữ liệu.";
        case 1136:
            return "Số tiền phân bổ phải lớn hơn 0.";
        default:
            return extractApiErrorMessage(error, fallback);
    }
};
