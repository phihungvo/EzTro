import React from 'react';
import { Input, Button } from 'antd';
import styles from './CommentList.module.scss';

const { TextArea } = Input;

function CommentEditForm({ editText, setEditText, saveEditComment, cancelEditComment }) {
    const handleEditTextChange = (e) => {
        setEditText(e.target.value);
    };

    return (
        <div className={styles['edit-container']}>
            <TextArea
                value={editText}
                onChange={handleEditTextChange}
                autoSize={{ minRows: 2, maxRows: 4 }}
                className={styles['edit-input']}
            />
            <div className={styles['edit-actions']}>
                <Button size="small" onClick={cancelEditComment}>
                    Hủy
                </Button>
                <Button type="primary" size="small" onClick={saveEditComment}>
                    Lưu
                </Button>
            </div>
        </div>
    );
}

export default CommentEditForm;