// CommentReplies.jsx
import React, { useState } from 'react';
import { Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import styles from './CommentList.module.scss';
import CommentItem from './CommentItem';

function CommentReplies({ replies, userId, fetchComments, onDeleteConfirm, level = 1 }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleRepliesVisibility = () => {
        setIsCollapsed(!isCollapsed);
    };

    if (!replies || replies.length === 0) return null;

    return (
        <div className={`${styles['replies-section']} ${styles[`level-${level}`]}`}>
            <div className={styles['replies-header']}>
                <Button
                    type="text"
                    className={styles['toggle-replies']}
                    onClick={toggleRepliesVisibility}
                    icon={isCollapsed ? <DownOutlined /> : <UpOutlined />}
                >
                    {isCollapsed
                        ? `Hiện ${replies.length} phản hồi`
                        : `Ẩn ${replies.length} phản hồi`}
                </Button>
            </div>

            {!isCollapsed && (
                <div className={styles['replies-list']}>
                    {replies.map(reply => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            userId={userId}
                            onDeleteConfirm={onDeleteConfirm}
                            fetchComments={fetchComments}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default CommentReplies;