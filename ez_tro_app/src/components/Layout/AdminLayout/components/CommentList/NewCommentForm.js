// NewCommentForm.jsx
import React from 'react';
import { Avatar, Input, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import styles from './CommentList.module.scss';

const { TextArea } = Input;

function NewCommentForm({
    userId,
    newCommentText,
    setNewCommentText,
    handleNewComment,
    isLoading,
}) {
    return (
        <div className={styles['new-comment']}>
            <Avatar src={`https://i.pravatar.cc/150?u=${userId}`} />
            <div className={styles['textarea-wrapper']}>
                <TextArea
                    placeholder="Viết bình luận của bạn..."
                    className={styles['comment-input']}
                    value={newCommentText}
                    onChange={(e) => {
                        const inputValue = e.target.value;
                        const words = inputValue.trim().split(/\s+/);
                        if (inputValue.trim() === '' || words.length <= 100) {
                            setNewCommentText(inputValue);
                        }
                    }}
                />
                <span className={styles['word-count']}>
                    {50 -
                        (newCommentText.trim() === ''
                            ? 0
                            : newCommentText.trim().split(/\s+/).length)}{' '}
                    / 50
                </span>
            </div>

            <Button
                type="primary"
                icon={<SendOutlined />}
                className={styles['submit-button']}
                onClick={handleNewComment}
            >
                Gửi
            </Button>
        </div>
    );
}

export default NewCommentForm;
