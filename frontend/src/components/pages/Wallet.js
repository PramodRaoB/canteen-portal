import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Container } from "@mui/material";
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import {AxiosGetUser, AxiosLogin} from "../../services/auth";
import { message } from "antd";
import {useEffect, useState} from "react";
import {AxiosUpdateWallet} from "../../services/wallet";

const Wallet = (() => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(async () => {
        var res = await AxiosGetUser();
        if (!res || res.type !== "buyer") {
            message.error("Unauthorized")
            navigate("/")
        }
        setUser(res);
    }, [])

    const handleSubmit = async (values) => {
        var res = await AxiosUpdateWallet(values);
        console.log(res);
        if (!res) message.error("Error updating wallet")
        else if (res.status === 1) {
            message.error(res.error);
        }
        else {
            message.success(res.message);
        }
    }

    return (
        <Container maxWidth={"sm"}>
            <Form name={"walletForm"} onFinish={handleSubmit}>
                <Form.Item
                    name={"amount"}
                    rules={[
                        {required: true, message: 'Please input the amount to be added'},
                        {pattern: "^[0-9]*$", message: 'Please input a valid amount'}
                    ]}
                    >
                    <Input placeholder={"Amount"} />
                </Form.Item>
                <Form.Item>
                    <Button type={"primary"} htmlType={"submit"}>
                        Add to wallet
                    </Button>
                </Form.Item>
            </Form>
        </Container>
    )
})

export default Wallet;