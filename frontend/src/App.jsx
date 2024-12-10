import { Content, Header } from "antd/es/layout/layout";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import logo from "./assets/odipark.svg";
import Simulador from "./pages/Simulador.jsx";


const App = () => {
  return (
    <Router>
      <Header
        style={{
          display: "flex",
          height: "50px",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px",
          marginBottom: "8px",
          backgroundColor: "#1f2937", // Gris oscuro
          color: "white",
        }}>

        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={logo} alt="OdiRoute Logo" style={{ width: "30px", height: "30px", marginRight: "10px" }} />
          <span style={{ fontSize: "1.5rem" }}>OdiRoute</span>
        </div>
      </Header>

      <Content style={{ height: "calc(100vh - 50px)", overflow: "hidden" }}>
        <Routes>
          <Route
            path="/"
            element={
              <Simulador />
            }
          />
        </Routes>
      </Content>
    </Router >
  )
};

export default App;
