import axios from "axios"
import {AxiosGetUser} from "./auth";

axios.defaults.url = "http://localhost:4000/api";

const AxiosGetProducts = async () => {
    const res = await AxiosGetUser();
    if (!res) return null
    const productList = await axios.get("/product/")
    if (productList && productList.data.status === 1) console.log(productList.data.error)
    return productList.data;
}

const AxiosGetFavourites = async () => {
    const res = await axios.get("/product/favourite")
    if (!res || res.data.status === 1) {
        console.log(res.data.error);
    }
    return res;
}

const AxiosUpdateFavourite = async (id) => {
    const res = await axios.post("/product/favourite", {_id: id})
    if (!res || res.data.status === 1) console.log(res.data.error)
    return res.data
}

export {AxiosGetProducts, AxiosUpdateFavourite}
