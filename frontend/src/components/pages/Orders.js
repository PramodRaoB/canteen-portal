import React, {useEffect, useState} from "react";
import {Container} from "@mui/material";
import {Button, Form, Input, message, Select, TimePicker} from "antd";
import {useNavigate} from "react-router-dom";
import {AxiosGetUser, AxiosRegister} from "../../services/auth";
import {AxiosGetUserProfile, AxiosUpdateUserProfile} from "../../services/user";
import axios from "axios";
import BuyerOrders from "../templates/buyerOrders";
import VendorOrders from "../templates/vendorOrders";

const { Option } = Select;

const Orders = () => {
    const [userType, setUserType] = useState(null)
    const navigate = useNavigate();

    useEffect(async () => {
        let retUser = await AxiosGetUser();
        if (!retUser) navigate("/login")
        else {
            setUserType(retUser.type)
        }
    }, [])

    if (!userType) {
        return (
            <></>
        )
    }
    else if (userType === 'buyer') {
        return <BuyerOrders />
    }
    else return <VendorOrders />
};

export default Orders;
