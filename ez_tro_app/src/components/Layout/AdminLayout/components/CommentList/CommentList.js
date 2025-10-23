import React, { useState, useEffect } from 'react';
import {
    Typography,
    Pagination,
    Input,
    Button,
    Space,
    Divider,
    Modal,
    message,
} from 'antd';
import { SendOutlined } from '@ant-design/icons';
import styles from './CommentList.module.scss';
import CommentItem from './CommentItem';
import NewCommentForm from './NewCommentForm';
import { createComment, deleteComment, getCommentsByMovieId } from '~/service/admin/comment';

const { TextArea } = Input;

function CommentList({ movieId, userId }) {
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [allComments, setAllComments] = useState([]);
    const [totalComments, setTotalComments] = useState(0);
    const [newCommentText, setNewCommentText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const data = await getCommentsByMovieId({
                movieId,
                page: currentPage,
                pageSize,
            });
            setAllComments(data.content || []);
            setTotalComments(data.totalElements || 0);
        } catch (error) {
            message.error('Không thể tải bình luận');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [currentPage, pageSize]);

    const handleNewComment = async () => {
        if (userId != null) {
            if (!newCommentText.trim()) return;

            const newCommentData = {
                content: newCommentText,
                movieId: movieId,
                userId: userId,
            };

            await createComment(newCommentData);
            setNewCommentText('');

            fetchComments();
        }
        message.warning('Hãy đăng nhập rồi mới bình luận!');
    };

    const handlePageChange = (page) => {
        setCurrentPage(page - 1);
    };

    const handlePageSizeChange = (current, size) => {
        setPageSize(size);
        setCurrentPage(0);
    };

    const confirmDelete = async (commentId) => {
        await deleteComment(commentId);
        fetchComments();
    };

    return (
        <div className={styles['comment-container']}>
            {/* New comment section */}
            <NewCommentForm
                userId={userId}
                newCommentText={newCommentText}
                setNewCommentText={setNewCommentText}
                handleNewComment={handleNewComment}
                isLoading={isLoading}
            />

            <Divider className={styles['divider']} />

            {/* Comments list */}
            <div className={styles['comment-list']}>
                {allComments.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        userId={userId}
                        onDeleteConfirm={() => confirmDelete(comment.id)}
                        fetchComments={fetchComments}
                    />
                ))}
            </div>

            {/* Pagination */}
            {totalComments > 0 && (
                <div className={styles['pagination-container']}>
                    <Pagination
                        current={currentPage + 1}
                        pageSize={pageSize}
                        total={totalComments}
                        onChange={handlePageChange}
                        onShowSizeChange={handlePageSizeChange}
                        showSizeChanger
                        className={styles['pagination']}
                    />
                </div>
            )}
        </div>
    );
}

export default CommentList;
