import {
    Table,
    Tag,
    Row,
    Col,
    Input,
    Switch,
    message,
    Modal, Form, Button, Space, Checkbox, Select
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
import fuzzy from 'fuzzy'

import {useEffect, useState} from "react";
import {
    AxiosAddProduct,
    AxiosDeleteProduct,
    AxiosGetMyProducts,
    AxiosGetProducts,
    AxiosUpdateFavourite,
    AxiosUpdateProduct
} from "../../services/products";
import {AxiosGetUser} from "../../services/auth";
import {AxiosPlaceOrder} from "../../services/orders";
import {useNavigate} from "react-router-dom";

const VendorDashboard = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm()
    const [editForm] = Form.useForm()

    const [search, setSearch] = useState("");
    const [priceFilter, setPriceFilter] = useState("0#9007199254740991")
    const [vegFilter, setVegFilter] = useState(false)
    const [productList, setProductList] = useState([])
    const [addVisible, setAddVisible] = useState(false)
    const [editVisible, setEditVisible] = useState(false)
    const [editProduct, setEditProduct] = useState({})
    const [toggleUpdate, setToggleUpdate] = useState(false)

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

    const handleEdit = async (val) => {
        var data = val;
        data.pid = editProduct.pid;
        const res = await AxiosUpdateProduct(data)
        if (!res || res.status === 1) message.error(res.error.toString())
        else message.success(res.message)
    }

    const handleAdd = async (val) => {
        if (!val.type) val.type = false;
        if (!val.tags) val.tags = []
        const res = await AxiosAddProduct(val)
        if (!res || res.status === 1) message.error(res.error.toString())
        else message.success(res.message)
    }

    const handleDelete = async (val) => {
        const res = await AxiosDeleteProduct(val)
        if (!res || res.status === 1) message.error(res.error.toString())
        else message.success(res.message)
        setToggleUpdate(!toggleUpdate)
    }

    useEffect(async () => {
        var res = await AxiosGetUser();
        if (!res || res.status === 1 || res.type !== "vendor") {
            message.error("Unauthorized")
            navigate("/profile")
        }
    }, [navigate])

    useEffect(async () => {
        var res = await AxiosGetMyProducts();
        if (!res) message.error("Error fetching product list")
        else if (res.status === 1) message.error(res.error.toString())
        else {
            res.message.forEach((p) => {
                if (p.type === "true") p.type = true;
                else p.type = false
            })
            setProductList(res.message)
            message.success("Bon appetit!")
        }
    }, [editVisible, addVisible, toggleUpdate])

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            filteredValue: [search],
            onFilter: (value, record) => {
                var results = fuzzy.filter(value, [record.name])
                var matches = results.map(function(el) { return el.string; });
                return matches.length === 1
            },
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
            key: 'type',
            render: (record) => {
                if (record.type) return "Non-Veg"
                else return "Veg"
            },
            filteredValue: [vegFilter],
            onFilter: (value, record) => value === 'true' ? record.type === false : true,
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
            title: 'Action',
            key: 'action',
            render: (text, record) => {
                    return (
                        <>
                            <Space>
                                <Button type={"primary"} onClick={() => {
                                    var data = record;
                                    data.pid = record._id
                                    editForm.setFieldsValue(data)
                                    editForm.setFieldsValue({price: data.price.toString()})
                                    setEditProduct(data); setEditVisible(true)
                                }}>Edit</Button>
                                <Button onClick={() => handleDelete({pid: record._id})} type={"primary"} danger={true}>Delete</Button>
                            </Space>
                        </>
                    )
            }
        }
    ];

    return (
        <>
            <Typography variant={"h3"} component={"div"} align={"center"} gutterBottom={true}>MENU</Typography>
            <Row>
                <Col>
                    <Button type={"primary"} onClick={() => setAddVisible(true)}>Add product</Button>
                </Col>
                <Col span={5}>
                    <Input.Search onChange={handleSearch} placeholder={"Fuzzy search"} />
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
            </Row>
            <Table columns={columns} dataSource={productList} bordered={true}/>
            <Modal title={"Add product"}
                   onOk={() => {
                       form.validateFields()
                           .then((values) => {
                               handleAdd(values)
                               setAddVisible(false)
                               form.resetFields()
                           })
                           .catch(err => {
                               message.error(err.toString())
                           })
                   }}
                   onCancel={() => {
                       setAddVisible(false)
                       form.resetFields()
                   }}
                   visible={addVisible}
                   >
                <Form form={form} layout={"vertical"}>
                    <Form.Item name={"name"} rules = {[
                        {
                            required: true,
                            message: "Enter the name of the product"
                        }
                    ]}>
                        <Input placeholder="Name" />
                    </Form.Item>
                    <Form.Item name="price" rules={[
                        {
                            required: true,
                            message: "Enter price of the product"
                        },
                        {
                            pattern: "^[1-9][0-9]*$",
                            message: "Enter a valid price"
                        }]}>
                        <Input placeholder="Price" />
                    </Form.Item>
                    <Form.Item name="type">
                        <Switch checkedChildren={"Non-veg"} unCheckedChildren={"Veg"} defaultChecked={false}>Type</Switch>
                    </Form.Item>
                    <Form.Item name='tags'>
                        <Select mode='multiple' placeholder="Tags">
                            <Select.Option key="COLD">COLD</Select.Option>
                            <Select.Option key="HOT">HOT</Select.Option>
                            <Select.Option key="DRINK">DRINK</Select.Option>
                            <Select.Option key="SWEET">SWEET</Select.Option>
                            <Select.Option key="SNACK">SNACK</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal title={"Edit product"}
                   onOk={() => {
                       editForm.validateFields()
                           .then((values) => {
                               handleEdit(values)
                               setEditVisible(false)
                               editForm.resetFields()
                           })
                           .catch(err => {
                               message.error(err.toString())
                           })
                   }}
                   onCancel={() => {
                       setEditVisible(false)
                       editForm.resetFields()
                   }}
                   visible={editVisible}
            >
                <Form form={editForm} layout={"vertical"}>
                    <Form.Item name={"name"} rules = {[
                        {
                            required: true,
                            message: "Enter the name of the product"
                        }
                    ]}>
                        <Input placeholder="Name" />
                    </Form.Item>
                    <Form.Item name="price" rules={[
                        {
                            required: true,
                            message: "Enter price of the product"
                        },
                        {
                            pattern: "^[1-9][0-9]*$",
                            message: "Enter a valid price"
                        }]}>
                        <Input placeholder="Price" />
                    </Form.Item>
                    <Form.Item name="type">
                        <Switch checkedChildren={"Non-veg"} unCheckedChildren={"Veg"} checked={editProduct.type}>Type</Switch>
                    </Form.Item>
                    <Form.Item name='tags'>
                        <Select mode='multiple' placeholder="Tags">
                            <Select.Option key="COLD">COLD</Select.Option>
                            <Select.Option key="HOT">HOT</Select.Option>
                            <Select.Option key="DRINK">DRINK</Select.Option>
                            <Select.Option key="SWEET">SWEET</Select.Option>
                            <Select.Option key="SNACK">SNACK</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

export default VendorDashboard;
