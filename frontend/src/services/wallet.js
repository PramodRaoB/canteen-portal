import axios from "axios"

axios.defaults.url = "http://localhost:4000/api"

const AxiosGetWallet = async (user) => {
    if (!user || user.type !== "buyer") return {status: 1, error: "Unauthorized"};
    var res = await axios.get("/wallet");
    if (res.data.status === 1) console.log(res.data.error);
    return res.data;
}

export {AxiosGetWallet};