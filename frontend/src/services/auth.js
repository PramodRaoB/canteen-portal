import axios from "axios"

axios.defaults.url = "http://localhost:4000/api";

const AxiosRegister = async (user) => {
    const res = await axios.post("/auth/register", user);
    if (!res) {
        console.log("Failed to axios post")
        return res
    }
    if (res.data.status === 1) {
        console.log("Error registering")
        console.log(res.data.error)
    }
    return res.data;
}

const AxiosLogin = async (user) => {
    const res = await axios.post("/auth/login", user);
    if (!res) {
            console.log("Failed to axios post")
            return res
        }
        if (res.data.status === 1) {
            console.log("Error logging in")
            console.log(res.data.error)
        }
        return res.data
}

const AxiosGetUser = async () => {
    var token = "";
    try {
        token = window.localStorage.getItem("Authorization")
    }
    catch {
        token = "";
    }
    if (token)
        axios.defaults.headers.common["Authorization"] = token;
    var res = await axios.get("/user/ret");
    if (res.data.status === 1) {
        try {
            window.localStorage.removeItem("Authorization")
            return null;
        }
        catch {
            //
        }
    }
    return res.data;
}



export { AxiosRegister, AxiosLogin, AxiosGetUser };