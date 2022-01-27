import {
    Table,
    Tag,
    Row,
    Col,
    Input,
    Switch,
    message
} from 'antd';
import {useEffect, useState} from "react";
import {AxiosGetProducts, AxiosUpdateFavourite} from "../../services/products";
import {AxiosGetUser} from "../../services/auth";
import {useNavigate} from "react-router-dom";

const Dashboard = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [priceFilter, setPriceFilter] = useState("0#9007199254740991")
    const [vegFilter, setVegFilter] = useState(false)
    const [productList, setProductList] = useState({})
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
            render: (text, record) => (
                <>
                    <button type={"primary"}>Buy</button>
                    <button onClick={() => handleFavourite(record._id)}>{getProductDetails(record._id).favourite ? "<3" : "</3"}</button>
                </>
            )
        }
    ];

    return (
        <>
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
            Unavailable
            <Table columns={columns} dataSource={favouriteFilter ? productList.ufavourites : productList.unavailable} bordered={true}/>
        </>
    )
}

export default Dashboard;