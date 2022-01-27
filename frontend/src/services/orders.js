import axios from "axios"

axios.defaults.url = "http://localhost:4000/api";

const AxiosPlaceOrder = async (val) => {
    var res = await axios.post("/order/new", val)
    if (!res || res.data.status === 1) console.log(res.data.error)
    return res.data
}

export {AxiosPlaceOrder}
