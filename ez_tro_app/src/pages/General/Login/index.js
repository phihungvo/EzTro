import React, { useState } from 'react';
import { useAuth } from '~/routes/AuthContext';
import { login as loginService } from '~/service/admin/user';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import classNames from 'classnames/bind';
import styles from '~/pages/General/Login/Login.module.scss';

const cx = classNames.bind(styles);

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

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
                        <a href="#" onClick={(e) => e.preventDefault()}>Đăng ký ngay</a>
                    </p>
                </form>

                <div className={cx('divider')}>
                    <span>Hoặc đăng nhập với</span>
                </div>

                <div className={cx('social-buttons')}>
                    <button type="button">
                        <span className={cx('icon')}>G</span>
                        <span>Tiếp tục với Google</span>
                    </button>
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