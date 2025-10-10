import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { login } from '~/service/admin/user';
import {jwtDecode} from 'jwt-decode'; // Sửa import nếu cần
import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import SmartButton from '~/components/Layout/components/SmartButton';
import { PhoneOutlined, AppleOutlined, GoogleOutlined } from '@ant-design/icons';
import { useAuth } from '~/routes/AuthContext';

const cx = classNames.bind(styles);

function Login() {
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const token = await login(values.username, values.password);

            if (!token) {
                message.error('Đăng nhập thất bại. Vui lòng kiểm tra thông tin.');
                return;
            }

            localStorage.setItem('token', token);
            const decodedToken = jwtDecode(token);

            const permissions = decodedToken.authorities || []; // Dựa trên response API của bạn
            const roles = decodedToken.roles || [];
            const isAdmin = roles.includes('ADMIN') || roles.includes('MANAGER') || permissions.includes('ADMIN:MANAGE');

            localStorage.setItem('roles', JSON.stringify(roles));
            localStorage.setItem('permissions', JSON.stringify(permissions));

            authLogin({
                token,
                role: isAdmin ? 'ADMIN' : 'USER',
                permissions,
                roles,
                userId: decodedToken.userId,
                username: decodedToken.username || decodedToken.sub,
                email: decodedToken.email || decodedToken.sub,
                tokenExpiration: decodedToken.exp
            });

            message.success('Đăng nhập thành công!');

            if (isAdmin) {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <div className={cx('login-container')}>
            <div className={cx('logo')} onClick={() => navigate('/')}>
                {/*<img src="https://i.imgur.com/ZEbJI8l.png" alt="MovieNest Logo" />*/}
            </div>
            <div className={cx('login-box')}>
                <h1>Chào mừng trở lại</h1>
                <Form
                    name="basic"
                    className={cx('login-form')}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập username!',
                            },
                        ]}
                    >
                        <Input placeholder="Username" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập password!',
                            },
                        ]}
                    >
                        <Input.Password placeholder="Password" />
                    </Form.Item>

                    <Form.Item label={null}>
                        <Button
                            htmlType="submit"
                            block
                            loading={loading}
                            style={{
                                backgroundColor: '#0ca37f',
                                color: '#fff',
                                padding: '16px 0',
                            }}
                        >
                            Đăng nhập
                        </Button>
                    </Form.Item>

                    <p>
                        Chưa có tài khoản?{' '}
                        <a onClick={() => navigate('/register')}> Đăng ký</a>
                    </p>
                    <div className="divider">Hoặc</div>

                    <div className={cx('or-buttons')}>
                        <SmartButton
                            title="Tiếp tục với Google"
                            buttonWidth={340}
                            icon={<GoogleOutlined />}
                        />
                        <SmartButton
                            title="Tiếp tục với Tài khoản Apple"
                            buttonWidth={340}
                            icon={<AppleOutlined />}
                        />
                        <SmartButton
                            title="Tiếp tục với Điện thoại"
                            buttonWidth={340}
                            icon={<PhoneOutlined />}
                        />
                    </div>
                </Form>
            </div>
        </div>
    );
}

export default Login;