import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { register as registerService } from '~/service/admin/user';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await registerService(values);
            message.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (err) {
            console.error(err);
            message.error('Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <h2>Tạo tài khoản</h2>
            <Form onFinish={onFinish} style={{ maxWidth: 400 }}>
                <Form.Item
                    name="username"
                    rules={[{ required: true, message: 'Nhập username!' }]}
                >
                    <Input placeholder="Username" />
                </Form.Item>
                <Form.Item
                    name="email"
                    rules={[{ type: 'email', required: true, message: 'Nhập email hợp lệ!' }]}
                >
                    <Input placeholder="Email" />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Nhập mật khẩu!' }]}
                >
                    <Input.Password placeholder="Password" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                        Đăng ký
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Register;
