import {
    Table,
    Tag,
    Row,
    Col,
    Input,
    Switch,
    message,
    Modal, Form, Button, Space, Rate
} from 'antd';
import {useEffect, useState} from "react";
import {AxiosGetProducts, AxiosUpdateFavourite} from "../../services/products";
import {AxiosGetUser} from "../../services/auth";
import {
    AxiosGetOrders,
    AxiosPlaceOrder,
    AxiosPickUp,
    AxiosRateOrder,
    AxiosOrderAccept,
    AxiosOrderReject, AxiosOrderProgress
} from "../../services/orders";
import {useNavigate} from "react-router-dom";
import {DateTime} from "luxon";
import {DATETIME_FULL} from "luxon/src/impl/formats";

const VendorOrders = () => {
    const navigate = useNavigate();
    const [orderList, setOrderList] = useState([])

    const handleAccept = async (val) => {
        var res = await AxiosOrderAccept(val)
        if (res.status === 1) message.error(res.error.toString())
        else message.success(res.message)
    }
    const handleReject = async (val) => {
        var res = await AxiosOrderReject(val)
        if (res.status === 1) message.error(res.error.toString())
        else message.success(res.message)
    }
    const handleProgress = async (val) => {
        var res = await AxiosOrderProgress(val)
        if (res.status === 1) message.error(res.error.toString())
        else message.success(res.message)
    }

    useEffect(async () => {
        var res = await AxiosGetUser()
        if (!res || res.status === 1 || res.type !== "vendor") {
            message.error("Unauthorized")
            navigate("/profile")
        }
    }, [navigate])

    const updateOrders = async () => {
        var res = await AxiosGetOrders();
        if (!res || res.status === 1) {
            // message.error(res.error.toString())
        }
        else {
            setOrderList(res.message)
        }
    }

    useEffect( () => {
        updateOrders()
        setInterval(updateOrders, 5000)
    }, [])

    const columns = [
        {
            title: "Item",
            key: 'item',
            dataIndex: 'item',
            render: (record) => {
                return record.name
            }
        },
        {
            title: 'Buyer',
            key: 'buyer',
            dataIndex: 'buyer'
        },
        {
            title: 'Quantity',
            key: 'quantity',
            dataIndex: 'quantity'
        },
        {
            title: 'Total',
            key: 'total',
            dataIndex: 'total'
        },
        {
            title: "Order status",
            key: 'status',
            render: (record) => {
                if (record.status === 'PLACED')
                    return (
                        <Space>
                            {record.status}
                            <Button type={"primary"} onClick={() => handleAccept({pid: record._id})} color={"green"}>ACCEPT</Button>
                            <Button type={"primary"} onClick={() => handleReject({pid: record._id})} color={"red"}>REJECT</Button>
                        </Space>
                    )
                else if (record.status === 'ACCEPTED' || record.status === 'COOKING')
                    return (
                        <Space>
                            {record.status}
                            <Button type={"primary"} onClick={() => handleProgress({pid: record._id})}>MOVE TO NEXT STAGE</Button>
                        </Space>
                    )
                else return record.status
            }
        },
        {
            title: "Time of order",
            key: 'placedTime',
            render: (record) => {
                return (
                    DateTime.fromISO(record.placedTime).toLocaleString(DATETIME_FULL)
                )
            },
            sorter: (a, b) => {
                return DateTime.fromISO(a.placedTime) - DateTime.fromISO(b.placedTime)
            },
            defaultSortOrder: "descend",
            sortDirections: ['descend']
        },
    ]

    return (
        <>
            <Table columns={columns} dataSource={orderList} />
        </>
    )
}

export default VendorOrders;
