import React, {useEffect, useState} from "react";
import {Container} from "@mui/material";
import {Button, Form, Input, message, Select, TimePicker} from "antd";
import {useNavigate} from "react-router-dom";
import {AxiosGetUser, AxiosRegister} from "../../services/auth";
import {AxiosGetUserProfile, AxiosUpdateUserProfile} from "../../services/user";
import axios from "axios";
import BuyerDashboard from "../templates/buyerDashboard";
import VendorDashboard from "../templates/vendorDashboard";

const { Option } = Select;

const Dashboard = () => {
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
        return <BuyerDashboard />
    }
    else return <VendorDashboard />
};

export default Dashboard;
