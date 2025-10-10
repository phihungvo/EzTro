import React, { useState } from 'react';
import { Button, Checkbox, Form, Input, Select, message, errorMsg } from 'antd';
import { register } from '~/service/admin/user';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Register.module.scss';
import SmartButton from '~/components/Layout/components/SmartButton';
import {
    PhoneOutlined,
    AppleOutlined,
    GoogleOutlined,
} from '@ant-design/icons';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '~/routes/AuthContext';

const cx = classNames.bind(styles);

function Register() {
    const navigate = useNavigate();
    const { login: authLogin, logout } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // Đăng xuất user hiện tại (nếu có)
            logout();

            const token = await register(
                values.username,
                values.email, 
                values.password
            );

            if (!token) {
                message.error('Register failed. Please check your input again.');
                return;
            }

            localStorage.setItem('token', token);

            const decodedToken = jwtDecode(token);
            const roles = decodedToken.role || [];
            const userId = decodedToken.userId;
            const username = decodedToken.username;
            const email = decodedToken.sub;

            localStorage.setItem('role', 'user');

            authLogin({
                token,
                role: 'user',
                roles: roles,
                userId: userId,
                username: username,
                email: email,
            });

            message.success('Register successful!');
            
            navigate('/');

        } catch (error) {
            console.error('Lỗi:', error);

            let errorMsg = 'Có lỗi xảy ra khi đăng ký';

            if (error.response) {
                if (error.response.status === 403) {
                    errorMsg =
                        'Không có quyền truy cập. Vui lòng kiểm tra lại thông tin đăng ký.';
                } else if (error.response.data && error.response.data.message) {
                    errorMsg = error.response.data.message;
                }
            }

            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('register-container')}>
            <div className={cx('logo')} onClick={() => navigate('/')}>
                {/*<img src="https://i.imgur.com/ZEbJI8l.png" alt="MovieNest Logo" />*/}
            </div>
            <div className={cx('register-box')}>
                <h1>Tạo một tài khoản</h1>
                <Form
                    form={form}
                    name="register"
                    onFinish={onFinish}
                    style={{ maxWidth: 600 }}
                    scrollToFirstError
                >
                    <Form.Item
                        name="username"
                        rules={[
                            {
                                type: 'text',
                                message: 'The input is not valid Username!',
                            },
                            {
                                required: true,
                                message: 'Please input your Username!',
                            },
                        ]}
                    >
                        <Input placeholder="Username" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            {
                                type: 'email',
                                message: 'The input is not valid E-mail!',
                            },
                            {
                                required: true,
                                message: 'Please input your E-mail!',
                            },
                        ]}
                    >
                        <Input placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your password!',
                            },
                        ]}
                        hasFeedback
                    >
                        <Input.Password placeholder="Password" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            style={{
                                backgroundColor: '#0ca37f',
                                color: '#fff',
                                padding: '16px 0',
                            }}
                        >
                            Register
                        </Button>
                        <p>
                            Bạn đã có tài khoản?{' '}
                            <a onClick={() => navigate('/login')}> Đăng nhập</a>
                        </p>

                        <div class="divider">Hoặc</div>

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
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}

export default Register;
