// CommentUtils.js
export const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
        return 'Vài giây trước';
    } else if (diffInSeconds < 3600) {
        return `${Math.floor(diffInSeconds / 60)} phút trước`;
    } else if (diffInSeconds < 86400) {
        return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    } else {
        return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    }
};

export const isCommentOwner = (comment, userId) => {
    if (!comment || !userId) return false;
    return String(comment.userId) === String(userId);
};