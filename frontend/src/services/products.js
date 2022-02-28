import axios from "axios"
import {AxiosGetUser} from "./auth";

axios.defaults.url = "/api";

const AxiosGetProducts = async () => {
    const res = await AxiosGetUser();
    if (!res) return null
    const productList = await axios.get("/product/")
    if (productList && productList.data.status === 1) console.log(productList.data.error)
    return productList.data;
}

const AxiosUpdateFavourite = async (id) => {
    const res = await axios.post("/product/favourite", {pid: id})
    if (!res || res.data.status === 1) console.log(res.data.error)
    return res.data
}

const AxiosGetMyProducts = async () => {
    const res = await axios.get("/product/my")
    if (!res || res.data.status === 1) console.log(res.data.error)
    return res.data
}

const AxiosDeleteProduct = async (val) => {
    const res = await axios.post("/product/delete", val)
    if (!res || res.data.status === 1) console.log(res.data.error)
    return res.data
}

const AxiosUpdateProduct = async (val) => {
    const res = await axios.post("/product/update", val)
    if (!res || res.data.status === 1) console.log(res.data.error)
    return res.data
}

const AxiosAddProduct = async (val) => {
    const res = await axios.post("/product/add", val)
    if (!res || res.data.status === 1) console.log(res.data.error)
    return res.data
}

export {AxiosGetProducts, AxiosUpdateFavourite, AxiosGetMyProducts, AxiosDeleteProduct, AxiosUpdateProduct, AxiosAddProduct}
