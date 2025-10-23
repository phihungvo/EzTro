// CommentItem.jsx
import React, { useState } from 'react';
import { Avatar, Typography, Button, Space, Dropdown } from 'antd';
import {
    CommentOutlined,
    LikeOutlined,
    DislikeOutlined,
    EditOutlined,
    DeleteOutlined,
    MoreOutlined,
} from '@ant-design/icons';
import styles from './CommentList.module.scss';
import {
    updateCommentForUser,
    updateComment,
    replyToComment,
    reactionToAComment,
} from '~/service/admin/comment';
import CommentEditForm from './CommentEditForm';
import ReplyForm from './ReplyForm';
import CommentReplies from './CommentReplies';

function CommentItem({ comment, userId, onDeleteConfirm, fetchComments }) {
    const [expandedReply, setExpandedReply] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [editingComment, setEditingComment] = useState(false);
    const [editText, setEditText] = useState(comment.content || '');

    const formatDateTime = (dateTimeStr) => {
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

    const toggleReply = () => {
        setExpandedReply(!expandedReply);
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;

        const replyData = {
            content: replyText,
            movieId: comment.movieId,
            userId: userId,
        };

        await replyToComment(comment.id, replyData);
        setReplyText('');
        setExpandedReply(false);
        fetchComments();
    };

    const handleLikeComment = async () => {
        try {
            await reactionToAComment(comment.id, userId, {
                reactionType: 'LIKE',
            });
            fetchComments();
        } catch (error) {
            console.error("Can't like comment!");
        }
    };

    const handleDislikeComment = async () => {
        try {
            await reactionToAComment(comment.id, userId, {
                reactionType: 'DISLIKE',
            });
            fetchComments();
        } catch (error) {
            console.error("Can't dislike comment!");
        }
    };

    const startEditComment = () => {
        setEditingComment(true);
        setEditText(comment.content || '');
    };

    const saveEditComment = async () => {
        if (!editText.trim()) return;

        await updateComment(comment.id, { content: editText });
        setEditingComment(false);
        fetchComments();
    };

    const cancelEditComment = () => {
        setEditingComment(false);
    };

    const isCommentOwner = () => {
        if (!comment || !userId) return false;
        return String(comment.userId) === String(userId);
    };

    const getCommentMenu = () => {
        const items = [];

        if (isCommentOwner()) {
            items.push(
                {
                    key: 'edit',
                    label: 'Chỉnh sửa',
                    icon: <EditOutlined />,
                    onClick: startEditComment,
                },
                {
                    key: 'delete',
                    label: 'Xóa',
                    icon: <DeleteOutlined />,
                    onClick: () => onDeleteConfirm(comment.id),
                },
            );
        }

        return { items };
    };

    const moreActionsButton = () => {
        if (!isCommentOwner()) return null;

        return (
            <Dropdown
                menu={getCommentMenu()}
                placement="bottomRight"
                trigger={['click']}
            >
                <Button
                    type="text"
                    icon={<MoreOutlined />}
                    className={styles['more-actions']}
                />
            </Dropdown>
        );
    };

    return (
        <div className={styles['comment-item']}>
            <div className={styles['comment-header']}>
                <Avatar
                    src={`https://i.pravatar.cc/150?u=${comment.username}`}
                    className={styles['avatar']}
                />
                <div className={styles['comment-info']}>
                    <Typography.Text strong className={styles['author']}>
                        {comment.username}
                    </Typography.Text>
                    <Typography.Text className={styles['datetime']}>
                        {formatDateTime(comment.createAt)}
                    </Typography.Text>
                </div>

                {/* Comment actions dropdown */}
                {moreActionsButton()}
            </div>

            <div className={styles['comment-content']}>
                {editingComment ? (
                    <CommentEditForm
                        editText={editText}
                        setEditText={setEditText}
                        saveEditComment={saveEditComment}
                        cancelEditComment={cancelEditComment}
                    />
                ) : (
                    comment.content
                )}
            </div>

            <div className={styles['comment-actions']}>
                <Space>
                    <Button
                        type="text"
                        icon={<LikeOutlined />}
                        className={styles['action-button']}
                        onClick={handleLikeComment}
                    >
                        {comment.likeCount}
                    </Button>
                    <Button
                        type="text"
                        icon={<DislikeOutlined />}
                        className={styles['action-button']}
                        onClick={handleDislikeComment}
                    >
                        {comment.dislikeCount}
                    </Button>
                    <Button
                        type="text"
                        icon={<CommentOutlined />}
                        onClick={toggleReply}
                        className={styles['action-button']}
                    >
                        Trả lời
                    </Button>
                </Space>
            </div>

            {/* Replies section */}
            {comment.replies && comment.replies.length > 0 && (
                <CommentReplies
                    replies={comment.replies}
                    userId={userId}
                    fetchComments={fetchComments}
                    onDeleteConfirm={onDeleteConfirm}
                />
            )}

            {/* Reply input */}
            {expandedReply && (
                <ReplyForm
                    userId={userId}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    handleReply={handleReply}
                />
            )}
        </div>
    );
}

export default CommentItem;
