import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Container } from "@mui/material";
import axios from 'axios'
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
    const navigate = useNavigate();
    const onFinish = (values) => {
        console.log('Received values of form: ', values);
        axios.post("/auth/login", values)
            .then((res) => {
                if (res.data.status === 1) {
                    console.log(res.data.error)
                }
                else {
                    window.localStorage.setItem('Authorization', 'Bearer ' + res.data.token);
                    navigate("/dashboard")
                    console.log("Successfully logged in")
                }
            })
    };

    return (
        <Container maxWidth={"sm"}>
        <Form
            name="normal_login"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
        >
            <Form.Item
                name="email"
                rules={[
                    { required: true, message: 'Please input your Email!' },
                    {type: "email", message: "Please enter a valid email address"}
                ]}
            >
                <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Email address" />
            </Form.Item>
            <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please input your Password!' }]}
            >
                <Input
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    type="password"
                    placeholder="Password"
                />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">
                    Log in
                </Button>
            </Form.Item>
            Or <a href="/register">register now!</a>
        </Form></Container>
    );
};
export default LoginForm;
