import React, {useState} from 'react';
import {Form, Input, Button, message} from 'antd';
import {useAuth} from '~/routes/AuthContext';
import {login as loginService} from '~/service/admin/user';
import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import { useNavigate } from 'react-router-dom';
import SmartButton from "~/components/Layout/components/SmartButton";
import { PhoneOutlined, AppleOutlined, GoogleOutlined } from '@ant-design/icons';
const cx = classNames.bind(styles);
const Login = () => {
    const {login} = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const token = await loginService(values.username, values.password);
            if (!token) {
                message.error('Đăng nhập thất bại. Kiểm tra lại thông tin.');
                return;
            }

            login(token);
            message.success('Đăng nhập thành công!');
        } catch (err) {
            console.error(err);
            message.error('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
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
};

export default Login;
