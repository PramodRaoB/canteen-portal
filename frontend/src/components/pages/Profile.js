import React, {useEffect, useState} from "react";
import {Container} from "@mui/material";
import {Button, Form, Input, message, Select, TimePicker} from "antd";
import {useNavigate} from "react-router-dom";
import {AxiosGetUser} from "../../services/auth";
import {AxiosGetUserProfile, AxiosUpdateUserProfile} from "../../services/user";
import moment from "moment";
import {DateTime} from "luxon";
import {TIME_24_SIMPLE} from "luxon/src/impl/formats";

const {Option} = Select;

const Profile = () => {
    const [Edit, setEdit] = useState(false)
    const [userType, setUserType] = useState(null)
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const format = 'HH:mm';

    function handleChange(value) {
        setUserType(value);
    }

    function handleEdit() {
        setEdit(!Edit);
    }

    useEffect(async () => {
        let retUser = await AxiosGetUser();
        var retUserProfile;
        if (!retUser) navigate("/login")
        else {
            setUserType(retUser.type)
            retUserProfile = await AxiosGetUserProfile();
            if (!retUserProfile) {
                message.error("Error accessing page")
                navigate("/login")
            } else {
                if (userType === 'buyer') {
                    var {age, ...rest} = retUserProfile
                    form.setFieldsValue(rest)
                    form.setFieldsValue({age: age.toString()})
                }
                else {
                    var {opening, closing, ...rest} = retUserProfile
                    form.setFieldsValue(rest)
                    form.setFieldsValue({
                        opening: moment(opening, format),
                        closing: moment(closing, format)
                    })
                }
            }
        }
    }, [])

    const onFinish = async (values) => {
        handleEdit();
        var res = await AxiosUpdateUserProfile(values);
        if (res.status === 1) {
            message.error(res.error);
        } else {
            message.success(res.message);
        }
    };

    return (
        <Container align="center" maxWidth="sm">
            <Form
                form={form}
                name="register"
                onFinish={onFinish}
                scrollToFirstError
            >
                <Form.Item
                    name="name"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your full name!',
                        },
                    ]}
                >
                    <Input placeholder={"Full name"} disabled={!Edit}/>
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
                    <Input placeholder={"Email address"} disabled={true}/>
                </Form.Item>

                <Form.Item
                    name="contact"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your phone number!',
                        },
                        {
                            len: 10, pattern: "^[0-9]*$",
                            message: "Enter a valid phone number"
                        }
                    ]}
                >
                    <Input
                        placeholder={"Phone number"}
                        disabled={!Edit}
                    />
                </Form.Item>

                <Form.Item
                    name={"type"}>
                    <Select onChange={handleChange} disabled={true}>
                        <Option value="buyer">Buyer</Option>
                        <Option value="vendor">Vendor</Option>
                    </Select>
                </Form.Item>
                {
                    userType === "buyer" &&
                    <>
                        <Form.Item
                            name="age"
                            rules={[
                                {
                                    required: true,
                                    message: "Please input your age"
                                },
                                {
                                    pattern: "^[1-9][0-9]$",
                                    message: "Please enter a valid age"
                                }
                            ]}
                        >
                            <Input
                                disabled={!Edit}
                                placeholder={"Age"}/>
                        </Form.Item>
                        <Form.Item
                            name={"batch"}>
                            <Select defaultValue={"UG1"} disabled={!Edit}>
                                <Option value="UG1">UG1</Option>
                                <Option value="UG2">UG2</Option>
                                <Option value="UG3">UG3</Option>
                                <Option value="UG4">UG4</Option>
                                <Option value="UG5">UG5</Option>
                            </Select>
                        </Form.Item>
                    </>
                }
                {
                    userType === "vendor" &&
                    <>
                        <Form.Item name={"shop"} rules={[
                            {
                                required: true,
                                message: "Please input the shop name!"
                            }
                        ]}>
                            <Input placeholder={"Shop name"} disabled={true}/>
                        </Form.Item>
                        <Form.Item name={"opening"} rules={[
                            {
                                required: true,
                                message: "Please input the opening time of the shop"
                            }
                        ]}>
                            <TimePicker format={format} placeholder={"Opening time"} disabled={!Edit}/>
                        </Form.Item>
                        <Form.Item name={"closing"} rules={[
                            {
                                required: true,
                                message: "Please input the closing time of the shop"
                            }
                        ]}>
                            <TimePicker format={format} placeholder={"Closing time"} disabled={!Edit}/>
                        </Form.Item>

                    </>
                }


                <Form.Item>
                    {
                        Edit &&
                        <>
                            <Button type={"primary"} htmlType={"submit"}>
                                Save
                            </Button>
                        </>
                    }
                    {
                        !Edit &&
                        <>
                            <Button type={"primary"} onClick={handleEdit}>
                                Edit
                            </Button>
                        </>
                    }
                </Form.Item>
            </Form>
        </Container>
    )
};

export default Profile;
