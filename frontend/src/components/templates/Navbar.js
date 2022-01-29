import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import {useEffect, useState} from "react";
import {AxiosGetUser} from "../../services/auth";
import {AxiosGetWallet} from "../../services/wallet";
import {message} from "antd";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  let [user, setUser] = useState(null);
  let [wallet, setWallet] = useState(null);

  useEffect(async () => {
    console.log("called")
    if (user && user.type === "buyer") {
      var res = await AxiosGetWallet(user);
      if (res.status === 1) {
        message.error(res.error);
      } else {
        setWallet(res.message)
      }
    }
  })

  useEffect(async () => {
    var res = await AxiosGetUser();
    setUser(res);
  }, [navigate])

  const handleLogout = () => {
    try {
      window.localStorage.removeItem("Authorization")
      delete axios.defaults.headers.common['Authorization'];
    }
    catch {
      message.error("Error logging out")
      return
    }
    setUser(null)
    message.success("Successfully logged out")
    navigate("/")
  }

  if (!user) {
    return (
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography
                  variant="h6"
                  component="div"
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate("/")}
              >
                Canteen Portal
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Button color="inherit" onClick={() => navigate("/register")}>
                Register
              </Button>
              <Button color="inherit" onClick={() => navigate("/login")}>
                Login
              </Button>
            </Toolbar>
          </AppBar>
        </Box>
    );
  }
  else if (user.type === "buyer") {
    return (
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography
                  variant="h6"
                  component="div"
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate("/")}
              >
                Canteen Portal
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Button color={"inherit"} onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button color={"inherit"} onClick={() => navigate("/orders")}>
                Orders
              </Button>
              <Button color={"inherit"} onClick={() => navigate("/wallet")}>
                Wallet: {wallet}
              </Button>
              <Button color="inherit" onClick={() => navigate("/profile")}>
                My Profile
              </Button>
              <Button color={"inherit"} onClick={handleLogout}>
                Logout
              </Button>
            </Toolbar>
          </AppBar>
        </Box>
    );
  }
  else {
    return (
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography
                  variant="h6"
                  component="div"
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate("/")}
              >
                Canteen Portal
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Button color={"inherit"} onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button color={"inherit"} onClick={() => navigate("/orders")}>
                Orders
              </Button>
              <Button color="inherit" onClick={() => navigate("/statistics")}>
                My Statistics
              </Button>
              <Button color="inherit" onClick={() => navigate("/profile")}>
                My Profile
              </Button>
              <Button color={"inherit"} onClick={handleLogout}>
                Logout
              </Button>
            </Toolbar>
          </AppBar>
        </Box>
    );
  }
};

export default Navbar;
