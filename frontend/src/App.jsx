//import { Content, Header } from "antd/es/layout/layout";
import { Layout, Menu } from "antd";
import { Link, Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import logo from "./assets/odipark.svg";
import Simulador from "./pages/Simulador.jsx";
import Configuracion from "./pages/Configuracion.jsx"; // Nueva página

const { Header, Content } = Layout;

// Elementos del menú
const menuItems = [
  {
    key: "simulador",
    label: <Link to="/">Simulador</Link>,
  },
  {
    key: "configuracion",
    label: <Link to="/configuracion">Configuración</Link>,
  },
];

// Componente para resaltar la página activa
const NavigationMenu = () => {
  const location = useLocation();
  const currentKey = location.pathname === "/" ? "simulador" : location.pathname.replace("/", "");

  return (
    <Menu
      theme="dark"
      mode="horizontal"
      selectedKeys={[currentKey]}
      items={menuItems}
      style={{ height: "50px", marginRight: "20px", flex: 5, justifyContent: 'flex-end' }}
    />
  );
};


const App = () => {
  return (
    <Router>
      <Layout>
        {/* Encabezado */}
        <Header
          style={{
            display: "flex",
            height: "50px",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 16px",
            backgroundColor: "#1f2937", // Gris oscuro
          }}
        >
          {/* Logo y Título */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={logo}
              alt="OdiRoute Logo"
              style={{ width: "30px", height: "30px", marginRight: "10px" }}
            />
            <span style={{ fontSize: "1.5rem", color: "white" }}>OdiRoute</span>
          </div>

          {/* Menú de Navegación */}
          <NavigationMenu />
        </Header>

        {/* Contenido Principal */}
        <Content style={{ height: "calc(100vh - 50px)", overflow: "auto", padding: "16px" }}>
          <Routes>
            <Route path="/" element={<Simulador />} />
            <Route path="/configuracion/*" element={<Configuracion />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
};

export default App;
