import {BrowserRouter, Outlet, Route, Routes} from "react-router-dom";
import "./App.css";

import UsersList from "./components/users/UsersList";
import Home from "./components/common/Home";
import RegistrationForm from "./components/common/Register";
import LoginForm from "./components/common/Login";
import Navbar from "./components/templates/Navbar";
import Profile from "./components/users/Profile";
import Wallet from "./components/common/wallet";
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import axios from 'axios'

axios.defaults.baseURL = "http://localhost:4000/api"

const Layout = () => {
    return (
        <div>
            <Navbar/>
            <div className="container">
                <Outlet/>
            </div>
        </div>
    );
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout/>}>
                    <Route path="/" element={<Home/>}/>
                    <Route path="users" element={<UsersList/>}/>
                    <Route path="register" element={<RegistrationForm/>}/>
                    <Route path="profile" element={<Profile/>}/>
                    <Route path={"login"} element={<LoginForm/>}/>
                    <Route path={"wallet"} element={<Wallet />}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
