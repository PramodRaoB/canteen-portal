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
import {AxiosGetOrders, AxiosPlaceOrder, AxiosPickUp, AxiosRateOrder} from "../../services/orders";
import {useNavigate} from "react-router-dom";
import {DateTime} from "luxon";
import {DATETIME_FULL} from "luxon/src/impl/formats";

const BuyerOrders = () => {
    const navigate = useNavigate();
    const [orderList, setOrderList] = useState([])

    useEffect(async () => {
        var res = await AxiosGetUser()
        if (!res || res.status === 1 || res.type !== "buyer") {
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

    useEffect(() => {
        updateOrders()
        setInterval(updateOrders, 5000)
    }, [])

    const handlePickUp = async (id) => {
        var res = await AxiosPickUp(id)
        if (!res || res.status === 1) message.error(res.error.toString())
        else {
            message.success(res.message)
        }
    }

    const handleRate = async (val) => {
        var res = await AxiosRateOrder(val)
        if (!res || res.status === 1) message.error(res.error.toString())
        else {
            message.success(res.message)
        }
    }

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
            title: 'Vendor',
            key: 'vendor',
            dataIndex: 'vendor'
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
                if (record.status !== 'READY FOR PICKUP')
                    return record.status
                else {
                    return (
                        <Space>
                            READY FOR PICKUP
                            <Button type={"primary"} onClick={() => handlePickUp(record._id)}>PICKED UP</Button>
                        </Space>
                    )
                }
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
        {
            title: "Rating",
            key: 'rating',
            render: (record) => {
                if (record.status === 'COMPLETED')
                    return (
                        <>
                            <Rate defaultValue={record.rating || 0} onChange={(values) => handleRate({pid: record._id, rating: values})} />
                        </>
                    )
                else if (record.status === 'REJECTED') return "Order rejected"
                else return "Awaiting order completion"
            }
        }
    ]

    return (
        <>
            <Table columns={columns} dataSource={orderList} />
        </>
    )
}

export default BuyerOrders;
