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
        case 1144:
            return "Kỳ billing này đã có hóa đơn rồi. Hãy mở hóa đơn hiện có để gửi lại, cập nhật hoặc xử lý thanh toán thay vì tạo trùng.";
        case 1145:
            return "Có dịch vụ trong bill không còn hiệu lực trong kỳ này. Hãy tải lại dữ liệu phòng và thử lại.";
        case 9990:
            return "Kỳ tính hoá đơn không hợp lệ. Hãy kiểm tra lại ngày bắt đầu và ngày kết thúc của kỳ.";
        default:
            return extractApiErrorMessage(error, fallback);
    }
};
