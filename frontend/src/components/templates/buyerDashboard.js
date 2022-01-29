import {
    Table,
    Tag,
    Row,
    Col,
    Input,
    Switch,
    message,
    Modal, Form, Button, Space
} from 'antd';
import {
    Favorite,
    FavoriteBorderOutlined
} from "@mui/icons-material";
import {
    Typography
} from "@mui/material";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import {useEffect, useState} from "react";
import {AxiosGetProducts, AxiosUpdateFavourite} from "../../services/products";
import {AxiosGetUser} from "../../services/auth";
import {AxiosPlaceOrder} from "../../services/orders";
import {useNavigate} from "react-router-dom";

const BuyerDashboard = () => {
    const navigate = useNavigate();

    const [buyForm] = Form.useForm()

    const [search, setSearch] = useState("");
    const [priceFilter, setPriceFilter] = useState("0#9007199254740991")
    const [vegFilter, setVegFilter] = useState(false)
    const [productList, setProductList] = useState({})
    const [buyProduct, setBuyProduct] = useState({})
    const [buyModal, setBuyModal] = useState(false)
    const [favouritesUpdated, setFavouritesUpdated] = useState(false)
    const [favouriteFilter, setFavouriteFilter] = useState(false);

    const handleSearch = (values) => {
        setSearch(values.target.value)
    }
    const handleMinPrice = (values) => {
        const fields = priceFilter.split("#")
        let minVal = values.target.value
        if (!minVal) minVal = 0;
        setPriceFilter(minVal + "#" + fields[1])
    }
    const handleMaxPrice = (values) => {
        const fields = priceFilter.split("#")
        let maxVal = values.target.value
        if (!maxVal) maxVal = 9007199254740991;
        setPriceFilter(fields[0] + "#" + maxVal)
    }
    const handleVegFilter = (values) => {
        setVegFilter(values)
    }

    const handleFavouriteFilter = (values) => {
        setFavouriteFilter(values)
    }

    const handleFavourite = async (id) => {
        var res = await AxiosUpdateFavourite(id)
        if (!res || res.status === 1) message.error(res.error.toString())
        else {
            message.success(res.message)
            setFavouritesUpdated(!favouritesUpdated)
        }
    }

    const handleBuy = async (id) => {
        var ind = productList.available.findIndex((p) => p._id === id)
        if (ind === -1) {
            message.error("Sorry, that product does not exist!")
        }
        else {
            setBuyProduct(productList.available[ind])
            setBuyModal(true)
        }
    }

    const handleSubmit = async (values) => {
        var req = values
        req.pid = buyProduct._id
        console.log("Request sent: ", req)
        var res = await AxiosPlaceOrder(req)
        if (!res || res.status === 1) message.error(res.error.toString())
        else {
            message.success(res.message)
        }
    }

    const getProductDetails = (id) => {
        const i = productList.available.findIndex((product) => product._id === id)

        if (i !== -1) {
            const k = productList.afavourites.findIndex((product) => product._id === id)
            return {available: true, favourite: (k !== -1), mainIndex: i, subIndex: k}
        }
        else {
            const j = productList.unavailable.findIndex((product) => product._id === id)
            const k = productList.ufavourites.findIndex((product) => product._id === id)
            return {available: false, favourite: (k !== -1), mainIndex: j, subIndex: k}
        }
    }

    useEffect(async () => {
        var res = await AxiosGetUser();
        if (!res || res.status === 1 || res.type !== "buyer") {
            message.error("Unauthorized")
            navigate("/profile")
        }
    }, [navigate])

    useEffect(async () => {
        var res = await AxiosGetProducts();
        if (!res) message.error("Error fetching product list")
        else if (res.status === 1) message.error(res.error.toString())
        else {
            setProductList(res.message)
            message.success("Bon appetit!")
        }
        console.log(res)
    }, [favouritesUpdated])

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            filteredValue: [search],
            onFilter: (value, record) => value ? record.name.toLowerCase().includes(value.toLowerCase()) : true,
            sorter: (a, b) => a.name < b.name,
            align: "center"
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            sorter: (a, b) => a.price - b.price,
            filteredValue: [priceFilter],
            onFilter: (value, record) => {
                const fields = priceFilter.split("#")
                return record.price >= fields[0] && record.price <= fields[1]
            },
            align: "center"
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            filteredValue: [vegFilter],
            onFilter: (value, record) => value === 'true' ? record.type === "Veg" : true,
            align: "center"
        },
        {
            title: "Rating",
            dataIndex: 'rating',
            key: 'rating',
            render: rating => (rating.count === 0 ? 0 : rating.total / rating.count),
            sorter: (a, b) => a.rating.count ? a.rating.total / a.rating.count : 0 - b.rating.count ? b.rating.total / b.rating.count : 0,
            align: "center"
        },
        {
            title: 'Tags',
            key: 'tags',
            dataIndex: 'tags',
            render: tags => (
                <>
                    {tags.map(tag => {
                        return (
                            <Tag key={tag}>
                                {tag.toUpperCase()}
                            </Tag>
                        );
                    })}
                </>
            ),
            align: "center"
        },
        {
            title: 'Vendor',
            key: 'shop',
            render: record => record.shop.shop
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => {
                if (productList.available.findIndex((p) => (p._id === record._id)) !== -1)
                    return (
                    <>
                        <Space>
                        <Button type={"primary"} onClick={() => handleBuy(record._id)}>Buy</Button>
                        <Button onClick={() => handleFavourite(record._id)} type={"primary"}>{getProductDetails(record._id).favourite ? <Favorite /> : <FavoriteBorderOutlined />}</Button>
                        </Space>
                    </>
                    )
                else {
                    return (
                        <>
                            <Space>
                                <Button type={"primary"} disabled={true}>Buy</Button>
                                <Button onClick={() => handleFavourite(record._id)} type={"primary"}>{getProductDetails(record._id).favourite ? <Favorite /> : <FavoriteBorderOutlined />}</Button>
                            </Space>
                        </>
                    )
                }
            }
        }
    ];

    return (
        <>
            <Typography variant={"h3"} component={"div"} align={"center"} gutterBottom={true}>DASHBOARD</Typography>
            <Row>
                <Col span={5}>
                    <Input.Search onChange={handleSearch} placeholder={"Search"} />
                </Col>
                <Col span={5}>
                    <Input.Group compact={true}>
                    <Input onChange={handleMinPrice} placeholder={"Min Price"} />
                    <Input onChange={handleMaxPrice} placeholder={"Max Price"} />
                    </Input.Group>
                </Col>
                <Col>
                    <Switch onChange={handleVegFilter} checkedChildren={"Veg"} unCheckedChildren={"Veg and Non-Veg"} />
                </Col>
                <Col>
                    <Switch onChange={handleFavouriteFilter} checkedChildren={"Favourites"} unCheckedChildren={"Any"} />
                </Col>
            </Row>
            <Table columns={columns} dataSource={favouriteFilter ? productList.afavourites : productList.available} bordered={true}/>
            <Typography variant={"h6"} component={"div"} align={"center"}>Unavailable</Typography>
            <Table columns={columns} dataSource={favouriteFilter ? productList.ufavourites : productList.unavailable} bordered={true}/>
            <Modal
                title={"Buy " + buyProduct.name}
                visible = {buyModal}
                onOk={() => {
                    buyForm.validateFields()
                        .then(values => {
                            handleSubmit(values)
                            buyForm.resetFields()
                            setBuyModal(false)
                            navigate("/dashboard")
                        })
                        .catch((err) => {
                            console.error(err);
                        })
                }}
                onCancel={() => {
                    setBuyModal(false)
                    buyForm.resetFields()
                }}
                >
                <Form
                    form={buyForm}
                    layout={"vertical"}
                    >
                    <Form.Item
                        name={"quantity"}
                        rules={[
                            {required: true, message: "Please enter the quantity"},
                            {pattern: "^[0-9]*$", message: "Please enter a valid quantity"}
                        ]}
                        >
                        <Input placeholder={"Quantity"} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

export default BuyerDashboard;