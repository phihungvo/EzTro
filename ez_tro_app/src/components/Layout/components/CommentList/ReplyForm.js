// ReplyForm.jsx
import React from 'react';
import { Avatar, Input, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import styles from './CommentList.module.scss';

const { TextArea } = Input;

function ReplyForm({ userId, replyText, setReplyText, handleReply }) {
    const handleReplyTextChange = (e) => {
        setReplyText(e.target.value);
    };

    return (
        <div className={styles['reply-input-container']}>
            <Avatar
                src={`https://i.pravatar.cc/150?u=${userId}`}
                size="small"
            />
            <TextArea
                placeholder="Viết trả lời của bạn..."
                autoSize={{ minRows: 1, maxRows: 3 }}
                value={replyText}
                onChange={handleReplyTextChange}
                className={styles['reply-input']}
            />
            <Button
                type="primary"
                size="small"
                icon={<SendOutlined />}
                onClick={handleReply}
                className={styles['reply-button']}
            >
                Gửi
            </Button>
        </div>
    );
}

export default ReplyForm;