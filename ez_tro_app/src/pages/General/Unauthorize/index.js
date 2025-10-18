import React from 'react';
import {Result, Button} from 'antd';
import {useNavigate} from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();
    return (
        <Result
            status="403"
            title="403 - Không có quyền truy cập"
            subTitle="Bạn không được phép truy cập trang này."
            extra={<Button onClick={() => navigate('/login')}>Quay lại đăng nhập</Button>}
        />
    );
};

export default Unauthorized;
