// src/pages/General/Login/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '~/routes/AuthContext';
import { googleLogin as googleLoginService, login as loginService } from '~/service/admin/user';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import classNames from 'classnames/bind';
import styles from '~/pages/General/Login/Login.module.scss';
import { useQueryClient } from '@tanstack/react-query';
import { GoogleLogin } from '@react-oauth/google';

const cx = classNames.bind(styles);

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient(); // gọi ở body component

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            message.error('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        setLoading(true);
        try {
            const token = await loginService(username, password);
            if (!token) {
                message.error('Đăng nhập thất bại. Kiểm tra lại thông tin.');
                return;
            }

            login(token);

            // Invalidate quota ngay khi login thành công
            queryClient.invalidateQueries({ queryKey: ['owner-quota'] });
            queryClient.refetchQueries({ queryKey: ['owner-quota'] });

            message.success('Đăng nhập thành công!');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            message.error('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('login-container')}>
            <div className={cx('login-box')}>
                <h1>Chào mừng trở lại</h1>
                <p>Đăng nhập để tiếp tục</p>

                <form onSubmit={handleSubmit}>
                    <div className={cx('input-wrapper')}>
                        <input
                            type="text"
                            placeholder="Tên đăng nhập"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className={cx('input-wrapper', 'password-field')}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className={cx('toggle-password')}
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                            {showPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>

                    <p className={cx('signup-link')}>
                        Chưa có tài khoản?{' '}
                        <button
                            type="button"
                            onClick={() => message.info('Tính năng đăng ký sẽ được bổ sung sau.')}
                            className={cx('signup-btn')}
                        >
                            Đăng ký ngay
                        </button>
                    </p>
                </form>

                <div className={cx('divider')}>
                    <span>Hoặc đăng nhập với</span>
                </div>

                <div className={cx('social-buttons')}>
                    <div className={cx('google-login')}>
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                try {
                                    const idToken = credentialResponse?.credential;
                                    if (!idToken) {
                                        message.error('Không lấy được thông tin Google. Vui lòng thử lại.');
                                        return;
                                    }

                                    setLoading(true);
                                    const token = await googleLoginService(idToken);
                                    if (!token) {
                                        message.error('Đăng nhập Google thất bại.');
                                        return;
                                    }

                                    login(token);
                                    queryClient.invalidateQueries({ queryKey: ['owner-quota'] });
                                    queryClient.refetchQueries({ queryKey: ['owner-quota'] });
                                    message.success('Đăng nhập thành công!');
                                    navigate('/dashboard');
                                } catch (err) {
                                    console.error(err);
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            onError={() => {
                                message.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
                            }}
                            theme="filled_black"
                            size="large"
                            text="continue_with"
                            shape="rectangular"
                        />
                    </div>
                    <button type="button">
                        <span className={cx('icon')}>🍎</span>
                        <span>Tiếp tục với Apple</span>
                    </button>
                    <button type="button">
                        <span className={cx('icon')}>📱</span>
                        <span>Tiếp tục với Số điện thoại</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;