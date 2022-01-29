import {Form, Input, Button, Row, Statistic, Col, Space, Card, List} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Container } from "@mui/material";
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import {AxiosGetUser, AxiosLogin} from "../../services/auth";
import { message } from "antd";
import {useEffect, useState} from "react";
import {AxiosUpdateWallet} from "../../services/wallet";
import {AxiosGetAgeStats, AxiosGetBatchStats, AxiosGetProductStats} from "../../services/orders";
import {
    Typography
} from "@mui/material";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import {
    Chart,
    ArcElement,
    LineElement,
    BarElement,
    PointElement,
    BarController,
    BubbleController,
    DoughnutController,
    LineController,
    PieController,
    PolarAreaController,
    RadarController,
    ScatterController,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    RadialLinearScale,
    TimeScale,
    TimeSeriesScale,
    Decimation,
    Filler,
    Legend,
    Title,
    Tooltip
} from 'chart.js';
import {Bar} from 'react-chartjs-2'

const Stats = (() => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({})

    const [batchStats, setBatchStats] = useState([])
    const [ageStats, setAgeStats] = useState({})
    Chart.register(
        ArcElement,
        LineElement,
        BarElement,
        PointElement,
        BarController,
        BubbleController,
        DoughnutController,
        LineController,
        PieController,
        PolarAreaController,
        RadarController,
        ScatterController,
        CategoryScale,
        LinearScale,
        LogarithmicScale,
        RadialLinearScale,
        TimeScale,
        TimeSeriesScale,
        Decimation,
        Filler,
        Legend,
        Title,
        Tooltip
    );

    const batchData = {
        labels: ['UG1', 'UG2', 'UG3', 'UG4', 'UG5'],
        datasets: [{
            label: "Batch-wise orders",
            data: batchStats
        }]
    }

    const ageData = {
        labels: ageStats.labels,
        datasets: [{
            label: "Age-wise orders",
            data: ageStats.data
        }]
    }

    useEffect(async () => {
        var res = await AxiosGetUser();
        if (!res || res.type !== "vendor") {
            message.error("Unauthorized")
            navigate("/")
        }
        setUser(res);
    }, [])

    useEffect(async () => {
        var res = await AxiosGetBatchStats()
        if (!res || res.status === 1) message.error(res.error.toString())
        else {
            setBatchStats(res.message)
        }
    }, [])

    useEffect(async () => {
        var res = await AxiosGetAgeStats()
        console.log(res)
        if (!res || res.status === 1) message.error(res.error.toString())
        else {
            setAgeStats(res.message)
        }
    }, [])

    useEffect(async () => {
        var res = await AxiosGetProductStats()
        if (!res || res.status === 1) message.error(res.error.toString())
        else {
            setStats(res.message)
            message.loading("Successfully crunched data")
        }
    }, [])

    if (!stats || !stats.topOrders) return <></>
    return (
        <>
            <Container maxWidth={"lg"}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Total orders!"
                                value={stats.placed}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Completed"
                                value={stats.completed}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Pending"
                                value={stats.pending}
                                valueStyle={{ color: '#cf1322' }}
                            />
                        </Card>
                    </Col>
                </Row>
                <Typography variant={"h4"} align={"center"}>Top orders</Typography>
                <Row gutter={16}>
                    <Col span={4}>
                        <Card>
                            1.
                            <Statistic
                                title={stats.topOrders[0].name}
                                value= {stats.topOrders[0].count}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card>
                            2.
                            <Statistic
                                title={stats.topOrders[1].name}
                                value= {stats.topOrders[1].count}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card>
                            3.
                            <Statistic
                                title={stats.topOrders[2].name}
                                value= {stats.topOrders[2].count}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card>
                            4.
                            <Statistic
                                title={stats.topOrders[3].name}
                                value= {stats.topOrders[3].count}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card>
                            5.
                            <Statistic
                                title={stats.topOrders[4].name}
                                value= {stats.topOrders[4].count}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Typography variant={"h4"} align={"center"}>Batch-wise statistics for COMPLETED orders</Typography>
                <Bar data={batchData}  type={Bar}/>
                <Typography variant={"h4"} align={"center"}>Age-wise statistics for COMPLETED orders</Typography>
                <Bar data={ageData}  type={Bar}/>

            </Container>
        </>
    )
})

export default Stats;
