import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Container } from "@mui/material";
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import {AxiosGetUser, AxiosLogin} from "../../services/auth";
import { message } from "antd";
import {useEffect} from "react";

const LoginForm = () => {
    const navigate = useNavigate();
    const onFinish = async (values) => {
        console.log('Received values of form: ', values);
        const res = await AxiosLogin(values);
        if (res) {
            if (res.status === 1) {
                message.error(res.error);
            }
            else {
                window.localStorage.setItem('Authorization', 'Bearer ' + res.token);
                // navigate("/dashboard")
                navigate("/profile")
                message.success("Successfully logged in")
            }
        }

    };
    useEffect(async () => {
        var res = await AxiosGetUser();
        if (res) {
            message.warning("User already logged in")
            navigate("/profile")
        }
    }, [navigate])

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
