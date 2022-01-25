import axios from "axios"

axios.defaults.url = "http://localhost:4000/api"

const AxiosGetWallet = async () => {
    var res = await axios.get("/wallet");
    if (!res) {
        return {status: 1, error: "Axios GET error"}
    }
    if (res.data.status === 1) console.log(res.data.error);
    return res.data;
}

const AxiosUpdateWallet = async (req) => {
    var res = await axios.post("/wallet/update", req);
    if (!res) return {status: 1, error: "Axios POST error"}
    if (res.data.status === 1) console.log(res.data.error);
    return res.data;
}

export {AxiosGetWallet, AxiosUpdateWallet};